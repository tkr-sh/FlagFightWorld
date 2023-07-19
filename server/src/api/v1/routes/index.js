import ObjectId, { jsonFind, db, connectToCluster } from '../../../config/initDB.js'; // Different object for DB
import {shuffleArray} from '../utils/index.js'; // Shuffle the array
import ranks, {mainFormula, rankByElo} from '../utils/eloSystem.js'; // Function for the ELO system
import { readFile } from 'fs/promises'; // Read file  for JSON
import { tokenValidity } from '../middleware/verifyToken.js'; // Function to know if a token is valid
import CryptoJS from "crypto-js"; // Encrypt data
import jwt from 'jsonwebtoken'; // Tokens
import * as dotenv from 'dotenv'; // Import .ENV variables
import ElasticEmail from '@elasticemail/elasticemail-client'; // Import e-mail client
import hcaptcha from 'hcaptcha'; // Import the hcaptcha

// Configure the .env
dotenv.config();

let convertCountry = JSON.parse(await readFile("src/api/v1/utils/convertCountry.json", "utf8"));

 
// E-mail API
const defaultClient = ElasticEmail.ApiClient.instance;
const apikeyEmail = defaultClient.authentications['apikey'];
apikeyEmail.apiKey = process.env.EMAIL_API_KEY;
const apiEmail = new ElasticEmail.EmailsApi();






// Generate a random string of char
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    return [...Array(length).keys()].map(c => characters.charAt(Math.floor(Math.random() * characters.length))).join``;
}



/**
 * 
 * @brief Get the bio of an user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getBio = async (req, res) => {
    const token = req.token;
    res.json(jsonFind(await db.collection('users').findOne({token: token}, {projection: {_id: 0, bio: 1}})))
}




/**
 * 
 * @brief Handle the log in of an user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const login = async (req, res) => {

    // Get the name and the password
    const {name, pwd} = req.body;

    // Get the information of the user by it's name
    const getInfoByName = await db.collection('users').findOne({$or: [{name: name}, {email: name}]}, {projection: {_id: 0, pwd: 1, token: 1}});

    if (getInfoByName !== null) {
        return res.json({err: "No user with that name"});
    }

    // Get the bytes of the password
    const bytesPwd = CryptoJS.AES.decrypt(getInfoByName.pwd, process.env.SALT);
    // Decrypt it
    const decryptedPwd = bytesPwd.toString(CryptoJS.enc.Utf8);

    // Compare the real password to the password sent by the user
    if (decryptedPwd !== pwd) {
        res.json({err: "Invalid password"});
    } else {
        res.json({token: getInfoByName.token})
    }
}




/**
 * @brief Create the account. Shouldn't be accessed by clients
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const createAccount = async ({name, pwd=null, email=null, google=null, discord=null, github=null, pfp="https://www.flagfight.world/user.png", bio="-"}) => {

    // Generate the token
    const token = jwt.sign({}, process.env.SALT);

    // The JSON that corresponds to the data of the user.
    const dic = {
        name: name,
        pwd: pwd === null ? generateRandomString(64) : pwd,
        bio: bio ?? "-",
        country: "xx",
        pfp: pfp,
        banner: false,
        elo: 1200,
        maxElo: 1200,
        coins: 1000,
        friends: [],
        token: token,
        wins: 0,
        nbGames: 0,
        nbGames: 0,
        blockedUsers: [],
        flag: [],
        chat: [],
        pfpGif: false,
        banner: false,
        bannerGif: false,
        lastChangeName: new Date("1970-01-01T00:00:00Z"),
        lastChangeCountry: new Date("1970-01-01T00:00:00Z"),
        lastChangePfp: new Date("1970-01-01T00:00:00Z"),
        lastChangeBanner: new Date("1970-01-01T00:00:00Z"),
        lastChangeBio: new Date("1970-01-01T00:00:00Z"),
        created: new Date(),
    }


    // Depnd on how the user logged in
    //// If there is an e-mail
    if (email !== null) {
        dic["email"] = email;
    }
    //// If it's a google account
    if (google !== null) {
        dic["googleId"] = google.id 
    }
    //// If it's GitHub
    if (github !== null) {
        dic["githubId"] = github.id 
    }
    //// If it's Discord
    if (discord !== null) {
        dic["discordId"] = discord.id 
    }


    // Add the user to the database of the users
    await db.collection("users").insertOne(dic);
    

    // Return it in case we need it (for giving the token to the user for example)
    return dic;
}




/**
 * @brief Verify e-mail by code
 * 
 * @param {object} req The request
 * - email: The email of the user
 * - code: The verification code
 * @param {object} res The result
 * 
 * @returns void
 */
export const verifyEmailByCode = async (req, res) => {

    const {email, code} = req.body;

    const data = jsonFind(await db.collection("tempUser").findOne({email: email}));

    // If there isn't any temp-user with that mail
    if (data === null) {
        res.status(400).json({err: "No user with that e-mail"})
    } else if (data.verifCode !== code) {
        res.status(400).json({err: "Invalid code"});
    } else if (data.verifCode === code) {

        console.log(data);
        console.log(data);
        const { token } = await createAccount(data);

        res.json({msg: "Code is valid", token: token});
        await db.collection('tempUser').deleteOne({email: email});
    }
}



/**
 * @brief Send e-mail to a user to verify it's account
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const createEmailAccount = async (req, res) => {

    // Get data
    const {email, pwd, name, token} = req.body;
    const verifCode = generateRandomString(6); // Create a random code
    const emailRegex = /^(?=.{5,256}$)(^[\w\d.-]+@[\w\d.-]+\.[\w]+$)/; // The regex to verify the validity of an e-mail

    // Verify that the hcaptcha is valid
    hcaptcha.verify(process.env.HCAPTCHA_SECRET, token, (err, response) => {
        if (err) {
            // Handle error
            console.error(err);
            res.status(500).json({error: 'hCaptcha verification failed.'});
            return;
        } else if (!response.success) {
            // Verification failed, do something here
            res.status(400).json({err: "Invalid hCaptcha"});
            return;
        }
    });

    // Verify that a user with that email doesn't exists
    if (await db.collection('users').countDocuments({name: name}, { limit: 1 }) > 0) {
        res.status(400).json({err: "This username is already taken"});
        return;
    }

    // Verify that the mail isn't taken
    if (await db.collection('users').countDocuments({email: email}, {limit: 1}) > 0) {
        res.status(400).json({err: "This e-mail is already taken"});
        return;
    }

    if (!emailRegex.test(email)) {
        res.status(400).json({err: "Invalid e-mail."});
        return;
    }

    // Verify the size of the e-mail
    if (email.length > 256 || email.length < 5) {
        res.status(400).json({err: `Invalid size. The size of the e-mail should be in [5: 256], got: ${email.length}`})
        return;
    }

    // Verify the size of the name
    if (name.length > 36 || name.length < 3) {
        res.status(400).json({err: `Invalid size. The size of the name should be in [3: 36], got: ${name.length}`})
        return;
    }

    // Verify the size of the password
    if (pwd.length > 36 || pwd.length < 6) {
        res.status(400).json({err: `Invalid size. The size of your password should be in [6: 36], got: ${pwd.length}`})
        return;
    }

    // If the name and the mail are correct => insert the user in the temp users
    await db.collection("tempUser").insertOne({
        email: email,
        pwd:  CryptoJS.AES.encrypt(pwd, process.env.SALT).toString(),
        name: name,
        verifCode: verifCode,
        created: new Date(),
    });


    // Create the e-mail object
    const emailObject = ElasticEmail.EmailMessageData.constructFromObject({
        Recipients: [
            new ElasticEmail.EmailRecipient(email)
        ],
        Content: {
            Body: [
                ElasticEmail.BodyPart.constructFromObject({
                    ContentType: "HTML",
                    Content: `
                    <span style="width: 100%; display: block; text-align: center">
                        Your verification code is <b>${verifCode}</b>
                    </span>`
                })
            ],
            Subject: "Verify your account - " + verifCode,
            From: "no-reply@flagfight.world"
        }
    });
    
    // Send the mail
    apiEmail.emailsPost(emailObject, (error, data, response) => {
        if (error) {
            console.error(error);
            res.json({err: "Error in the creation of the account"});
        } else {    
            res.json({msg: "Account created"});
            console.log('API called successfully:' + response);
        }
    });
}



/**
 * @brief Report an user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const reportUser = async (req, res) => {
    const token = req.token;
    const {name, description, type} = req.body;
    const {_id: fromId} = await db.collection('users').findOne({token: token}, {projection: {}});
    const {_id: reportedId} = await db.collection('users').findOne({name: name}, {projection: {}});

    if (reportedId === undefined || reportedId === null) {
        res.json({err: "User doesn't exists"});
    }

    await db.collection('report').insertOne({
        from: fromId,
        description: description,
        reported: reportedId,
        type: type,
        reportDate: new Date(),
    });

    res.json({msg: "User reported successfuly. We will give you more information as soon as possible."})
}




/**
 * @brief Block an user. If it's already blocked, unblock it
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const blockUser = async (req, res) => {
    const token = req.token;
    let {name, id} = req.body;


    // Check if the id of the user is undefined
    if (id === undefined && name !== undefined) {
        id = "" + jsonFind(await db.collection("users").findOne({name: name}, {projection: {_id: 1}}))?._id;

        // If there is no user
        if (!id) {
            res.json({err: "User doesn't exist"});
            return;
        }

        console.log("No id.");
    } else if (id === null && name === null) {
        res.json({err: "Invalid request"});
        return;
    }

    id = new ObjectId(id)

    const userIsBlocked = await db.collection("users").count({token: token, blockedUsers: id}) > 0;
    

    // If the user is already blocked => unblock him
    if (userIsBlocked) {
        await db.collection('users').updateOne({token: token}, {$pull: {blockedUsers: id}});
    } else {
        await db
        .collection('users')
        .updateOne(
            {token: token},
            {
                $push: {blockedUsers: id},
                $pull: {friends: ""+id}
            }
        );

        const requestId = jsonFind(await db.collection('users').findOne({token: token}, {projection: {_id: 1}}))._id;


        await db
        .collection('users')
        .updateOne(
            {_id: id},
            {
                $pull: {friends: ""+requestId}
            }
        )
    }

    res.json({msg: userIsBlocked ? "User unblocked": "User blocked"});
}




/**
 * @brief Get the users blocked by the user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getBlocked = async (req, res) => {
    const token = req.token;
    const blockedUsersId = jsonFind(
        await db
        .collection('users')
        .findOne({token: token}, {projection: {_id: 0, blockedUsers: 1}}))
        ?.blockedUsers
        ?.map(e => new ObjectId(e))
        ?? [];

    const blockedUsers =
        await db
        .collection('users')
        .find({_id: {$in: blockedUsersId}}, {projection: {_id: 0, name: 1, pfp: 1, country: 1}})
        .toArray();

    res.json(blockedUsers);
}





/**
 * @brief The function that handles the tie
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const handleTie = async (data, io) => {


    console.log(data)


    let game = await db.collection('game').findOneAndUpdate({
        _id: new ObjectId(data.gameId),
        // status: 2,
        players: {$elemMatch: {token: data.token}}
    },
    {
        $set: {
            "players.$.continue": data.continue
        }
    },
    {
        projection: {
            _id: 0,
            players: 1,
        },
    });

    // Verify that the game is valid
    if (game === null) {
        return {err: "Game doesn't exists or is over"};
    }


    game = await db.collection('game').findOne({_id: new ObjectId(data.gameId)}, {projection: {
        _id: 0,
        players: 1,
    },});
    
    const players = jsonFind(game).players;
    
    console.log("<=== PLAYERS ===>")
    console.log(players)


    // If one user doesn't want the game to continue
    // => End the game
    if (!data.continue) {
        console.log(data.gameId)
        const newData = await endGame(""+data.gameId, null);
        io.to(""+data.gameId).emit("gameStatus", {status: "tie-end"});
        io.to(""+data.gameId).emit("endResult", newData);
        console.log("Quit");
    } else if (players.every(player => player.continue)) {

        console.log("Continue")

        await db
            .collection("game")
            .updateOne(
                {
                    _id: new ObjectId(data.gameId)
                },
                {
                    $set: {
                        status: 1,
                        "players.$[].continue": false,
                    }
                }
            );


        io.to(""+data.gameId).emit("gameStatus", {status: "continue"});

        loopGame(""+data.gameId, io)
    }
    console.log("<=== ======= ===>");
}







/**
 * @brief Get the statistics of somebody for its profile
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getStats = async (req, res) => {

    let name = req.query.name;

    // If the user didn't provide any name, get it's personnal information
    if (!name) {
        const token = req.token;
        name = jsonFind(await db.collection('users').findOne({token: token}, {projection: {_id: 0, name: 1}})).name;
    }


    // Get the personal informations about the user
    const personalInfo =
        await db
        .collection('users')
        .findOne(
            {name: name}, 
            {
                projection: {
                    _id: 0,
                    maxElo: 1,
                    elo: 1,
                    nbGames: 1,
                    created: 1,
                    wins: 1,
                }
            }
        );

    console.log(name)
    console.log(personalInfo)

    // Get the global rank of the user
    const rank = await db.collection("users").countDocuments({elo: {$gte: personalInfo?.elo}});
    const totalNumberPlayers = await db.collection('users').countDocuments({});




    res.json({
        ...personalInfo,
        rank: `${rank}/${totalNumberPlayers}`,
        winRate: personalInfo?.nbGames === 0 ? "0%" : Math.round(personalInfo?.wins / personalInfo?.nbGames * 100, 2) + "%"
    })
}


/**
 * @brief Quit waiting a game
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const quitWaiting = async (req, res) => {
    const token = req.token;
    const id = req.body.id;


    const status = await db.collection('game').deleteOne({_id: new ObjectId(id), started: false, status: 0, "players.token": token})

    console.log(await db.collection('game').findOne({_id: new ObjectId(id)}));
    console.log(status)
    console.log(jsonFind(status));
    

    res.json({msg: status.deletedCount > 0 ? "Deleted the game" : "No game with that ID"});
}








/**
 * @brief Send a game request to a user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const sendGameRequest = async(req, res) => {
    const token = req.token;
    const name = req.body.name;
    
    await sendNotification(token, name, "gameRequest", req.app.get("socketio"));

    res.json({msg: "Sent the game request"});
}





/**
 * @brief Get the notification of a user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getNotification = async(req, res) => {
    const token = req.token;
    const _id = jsonFind(await db.collection('users').findOne({token: token}))._id;
    const notification = await db.collection('notification').find({to: _id}).sort({_id: -1}).limit(15).toArray();

    res.json(notification);
}





/**
 * @brief Send a notification to a user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const sendNotification = async (fromToken, toName, type, io) => {

    
    const sender = jsonFind(await db.collection('users').findOne({token: fromToken},
        { projection: {_id: 1, name: 1, country: 1, pfp: 1}}));
    const receiver = jsonFind(await db.collection('users').findOne({name: toName},
        { projection: {_id: 1, token: 1}}));
    let description;


    if (receiver === null) {
        return {err: "This user doesn't exist"};
    }


    // Depend on the kind of notification that you want to send
    if (type === 'friendRequest') {
        description = "Send you a friend request!";
    } else if (type === 'gameRequest') {
        description = "Wants to play with you!"
    } else {
        description = "You received a notification!";
    }


    // Insertt the notification in the database
    await db.collection('notification').insertOne({
        created: new Date(),
        image: sender.pfp,
        title: sender.name,
        flag: sender.country,
        description: description,
        from: sender._id,
        to: [receiver._id],
    });



    // Send the notification to the user
    io.to(""+receiver.token).emit("notification", {
        receiver: true,
        pfp: sender.pfp,
        name: sender.name,
        flag: sender.country,
        txt: description,
        type: type
    });



    return {msg: "No problem."};
}





/**
 * @brief Get the games played by the user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getGames = async (req, res) => {
    const token = req.token;
    const page = req.query.page;
    const {_id: userId, nbGames} = jsonFind(await db.collection('users').findOne({token: token}, {projection: {_id: 1, nbGames: 1}}));


    const games =
        await db
        .collection('game')
        .find(
            {
                "players._id": new ObjectId(userId),
                status: 3
            },
            {
                projection: {
                    type: 1,
                    players: {
                        name: 1,
                        correct: 1,
                        pfp: 1,
                        elo: 1,
                    },
                    status: 1,
                    created: 1,
                    turn: 1,
                    // historyQuestions: 0,
                }
            }
        )
        .sort({created: -1})
        .skip(10 * (page-1))
        .limit(10)
        .toArray()


    res.json({games: games, page: Math.ceil(nbGames / 10)});
}









/**
 * @brief Update daily things such as promotion items and ranking of flag communities
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
const updateDaily = async () => {
    // Updating
    console.log`Updating the flag of the day!`
    await db.collection('daily').updateOne({}, {$set: {updating: true}})


    // Flag of the day/promotion update
    let flag, chat;

    while (flag === undefined || flag.length !== 5) {
        flag = await db.collection("article").aggregate([
            { $match: { type: "flag" } },
            { $sample: { size: 5 } }
        ]).toArray();
    }

    while (chat === undefined || chat.length !== 5) {
        chat = await db.collection("article").aggregate([
            { $match: { type: "chat" } },
            { $sample: { size: 5 } }
        ]   ).toArray();
    }

    await db.collection("daily").updateOne({}, {$set: {flag: flag, chat: chat}});



    // Update the leaderboard of countries
    const total = await (await db
        .collection('flag')
        .find({})
        .toArray())
        .map(async flag => {
            console.log(flag.extension  )
            return await db.collection("users").aggregate(
            [
                {
                    $match: {
                        country: flag.extension
                    }
                },
                {
                    $group: {
                        _id : null,
                        elo: { $sum: '$elo' },
                        tot: {$sum: 1},
                    }
                },
            ])
            .toArray()
            .then(rep => {return {flag: flag.name, elo: rep[0]?.elo ?? 0, tot: rep[0]?.tot ?? 0}});
        })

    // Promise after that
    Promise
    .all(total)
    .then(async (rep) =>
        await db.collection('daily').updateOne({}, {$set: {leaderboard: rep, updating: false}}),
        (err) =>  console.error("Error while updating the leaderboard "+err))
    .catch((err) => console.error("Error while updating the leaderboard "+err))

}




/**
 * @brief Get the top users
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getLeaderboard = async (req, res) => {
    let search, size;
    let {country, page} = req.query;

    page = Math.max(page, 1) ?? 1;


    if (country !== undefined) {
        // Search
        search = db
        .collection('users')
        .find({country: country}, {projection: {elo: 1, country: 1, name: 1}});

        // Count
        size = await db.collection('users').count({country: country});
    } else {
        // Search
        search = db
        .collection('users')
        .find({}, {projection: {elo: 1, country: 1, name: 1}});

        // Count
        size = await db.collection('users').count({});
    }


    res.json({
        lb: await search
            .sort({elo: -1})
            .skip((page - 1) * 50)
            .limit(50)
            .toArray(),
        pages: Math.ceil(size / 50)
    });
}







/**
 * @brief Get the top flag communities
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getFlagElo = async (req, res) => {

    const state = await db.collection("daily").updateOne({expireDate: {$lt: new Date()}}, {$set: {expireDate: new Date(new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).setHours(0,0,0,0)) }});

    if (state.modifiedCount > 0) {
        updateDaily();
    }


    res.json(jsonFind(await db.collection("daily").findOne({}, {projection: {_id: 0, leaderboard: 1}})).leaderboard);
}







/**
 * @brief Get the relation between two users
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getRelation = async (req, res) => {
    // Get elements from requests
    const token = req.token;
    const name = req.query.name;

    if (!name) {
        res.json({err: "Invalid request"});
    }

    // Get the information about the user who made the request and the information about the requested user
    const originInfo = await db.collection("users").findOne({token: token}, {projection: {_id: 1, friends: 1}});
    const requestInfo = await db.collection("users").findOne({name: name}, {projection: {_id: 1, friends: 1}});

    // If nobody has this name
    if (!requestInfo) {
        res.json({err: "No user with that name."})
    }

    // Find if the original user is following the requested user and vice versa
    const originToRequest = originInfo.friends.includes(""+requestInfo._id);
    const requestToOrigin = requestInfo.friends.includes(""+originInfo._id);

    console.log([originInfo, requestInfo, originToRequest, requestToOrigin]);

    // Send the type of relation depending on thoses informations;
    if (originInfo._id === requestInfo._id) {
        res.json({relation: "self"})
    } else if (originToRequest && requestToOrigin) {
        res.json({relation: "friends"})
    } else if (!originToRequest && !requestToOrigin) {
        res.json({relation: "none"})
    } else if (originToRequest && !requestToOrigin) {
        res.json({relation: "following"});
    } else if (!originToRequest && requestToOrigin) {
        res.json({relation: "followed"})
    } else {
        res.json({err: "Relation impossible"})
    }
}





/**
 * @brief When a user wants to remove a friend
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const removeFriend = async (req, res) => {
    // Get elements from requests
    const token = req.token;
    const name = req.body.name;

    // Get the _id of the user that wants to remove a friend
    const {_id} = jsonFind(await db.collection("users").findOne({name: name}, {projection: {_id: 1}}));

    // Remove this friend from his friends
    await db.collection("users").updateOne({token: token}, {$pull: {friends: ""+_id}});
 
    // Remove it has a friend for the other user
    denyFriendRequest(req, res);
}





/**
 * @brief When a user denies a friend request
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const denyFriendRequest = async (req, res) => {
    // Get elements from requests
    const token = req.token;
    const name = req.body.name;
    const {_id} = jsonFind(await db.collection("users").findOne({token: token}, {projection: {_id: 1}}));

    await db.collection("users").updateOne({name: name}, {$pull: {friends: ""+_id}});
    
    res.json({debug: "Friend request denied successfuly"})
}



/**
 * @brief Get all the incoming friend requests
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getFriendRequests = async (req, res) => {
    // Get elements from requests
    const token = req.token;

    // Get the _id and the list of friends of the user by his token
    const {_id, friends} = jsonFind(await db.collection("users").findOne({token: token}, {projection: {_id: 1, friends: 1}}));


    // Filter all the people that are also friend with us, so that the only thing that remains is friend requests
    res.json((await db
        .collection('users')
        .find({friends: _id}, {projection: {_id: 1, name: 1, pfp: 1, country: 1}})
        .toArray())
        .filter(friend => !friends.includes(""+friend._id))
    );
}


/**
 * @brief Get all the friends of a user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getMyFriends = async (req, res) => {
    const token = req.token;
    const data = jsonFind(await db.collection("users").findOne({token: token}, {projection: {friends: 1, _id: 1}}));
    const originId = data._id;

    if (data.friends === undefined) {
        await db.collection("users").updateOne({token: token}, {$set: {friends: []}});
        res.json({})
        return;
    }


    const friendsData = await data.friends.map(
        async (friend) => {
            console.log(friend)
            return await friendInformation(originId, friend)
        }
    )


    Promise
    .all(friendsData)
    .then((rep) => res.json(rep), () => res.json({err: "An error occured"}))
    .catch({err: "An error occured"})
}



/**
 * @brief Get informations about a friend
 * 
 * @param {string} originId The ID of the user that made the request
 * @param {string} id The id of the user that we are looking for
 * 
 * @returns 
 */
const friendInformation = async (originId, id) => {
    const info = jsonFind(await db.collection("users").findOne({_id: new ObjectId(id)}, {projection: {lastActivity: 1, name: 1, friends: 1, country: 1, pfp: 1, _id: 0}}));

    // If they are both friends
    if (info.friends.includes(""+originId)) {
        return {
            online: new Date() / 1000 - 60 < new Date(info.lastActivity) / 1000, // If the last request from the user is less than 1 minute old
            pfp: info.pfp,
            country: info.country,
            friend: true,
            name: info.name
        }
    }
    // If they are not friends
    else {
        return {
            pfp: info.pfp,
            country: info.country,
            friend: false,
            name: info.name
        }
    }
}





/**
 * @brief Search a user by it's name
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const searchUser = async (req, res) => {
    const name = req.query.name;

    if (name) {
        const users = await db.collection("users").find({name: {$regex: name, $options: '$i'}}, {projection: {name: 1, _id: 0, pfp: 1}}).limit(5).toArray();
        console.log(users)
        res.json(users);
    } else {
        res.json({err: "Invalid name"})
    }
}




/**
 * @brief Get the number of article that a user has over the total number of articles
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getArticleCount = async (req, res) => {
    const token = req.token;
    const {flag, chat} = jsonFind(await db.collection("users").findOne({token: token}, {projection: {_id: 0, flag: 1, chat: 1}}))
    const totalFlag = await db.collection("article").countDocuments({type: "flag"});
    const totalChat = await db.collection("article").countDocuments({type: "chat"});

    res.json({userFlag: flag?.length, userChat: chat?.length, totalFlag: totalFlag, totalChat: totalChat});
}




/**
 * @brief Send a friend request to someone
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const sendFriendRequest = async (req, res) => {
    const token = req.token;
    const {name, id} = req.body;
    const userInfo = jsonFind(await db.collection("users").findOne({$or: [{_id: new ObjectId(id)}, {name: name}]}, {projection: {_id: 1, token: 1, name: 1, blockedUsers: 1}}));

    // If the user doesn't exists
    if (!userInfo) {
        res.json({err: "This user doesn't exists"});
        return;
    }

    // If the user wants to be friend with itself
    if (token === userInfo.token) {
        res.json({err: "Sadly, you can't be friend with yourself."});
        return;
    }

    // If user is blocked
    if (await db.collection("users").findOne({token: token, blockedUsers: new ObjectId(userInfo._id)}) !== null) {
        res.json({err: "You can't be friend with a user that you blocked. Unblock this user first"});
        return;
    }


    // If you have been blocked
    if (userInfo.blockedUsers?.includes(jsonFind(await db.collection('users').findOne({token: token}))._id)) {
        res.json({err: "This user has blocked you. You can't add it as a friend."})
    }

    // Check if the person with that id is already in the friends of the user
    /// If yes, delete it from friends
    if ( await db.collection("users").findOne({token: token, friends: ""+userInfo._id}) !== null) {
        removeFriend(req, res)
    }
    /// Else add it to friend request
    else {
        await db.collection("users").updateOne({token: token}, {$push: {friends: ""+userInfo._id}});
        console.log("Notification...");


        const requestUser = jsonFind(await db.collection('users').findOne({token: token}));

        if (await db.collection('users').findOne({_id: new ObjectId(""+userInfo._id), friends: ""+requestUser._id}, {projection: {_id: 0}}) === null) {
            await sendNotification(token, userInfo.name, 'friendRequest', req.app.get("socketio"));
        }

        res.json({msg: "Sent friend request"})
    }
}



/**
 * @brief Get the ranking of somebody
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getRanking = async (req, res) => {
    const token = req.token;
    const ELO = jsonFind(await db.collection("users").findOne({token: token}, {projection: {elo: 1, _id: 0}})).elo;
    const rank = await db.collection("users").countDocuments({elo: {$gte: ELO}});

    res.json({rank: rank, elo: ELO});
}






/**
 * @brief Buy an article
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const buyArticle = async (req, res) => {

    // Get the token and the name of the article that the user wants to buy
    const token = req.token;
    const name = req.body.name;

    // Get the information about the user and the article that he wants to buy
    const userInfo = jsonFind(await db
        .collection("users")
        .findOne(
            {token: token},
            {
                projection: {
                    coins: 1,
                    banner: 1,
                    bannerGif: 1,
                    pfpGif: 1,
                    flag: 1,
                    chat: 1
                }
            }
        )
    );



    const articleInfo = jsonFind(await db.collection("article").findOne({name: name}));


    // If the article doesn't exists
    if (articleInfo === null) {
        res.json({err: "This article doesn't exists"});
        return;
    }


    // Get the articles that are in promotion
    const promotion = jsonFind(await db.collection('daily').findOne({}));

    // If it's in promotion reduce the price to the price of article in promotion
    if (promotion.flag?.some(a => a.name === name) || promotion.chat?.some(a => a.name === name)) {
        articleInfo.price = 500;
    }


    // If the user doesn't have enought coins
    if (articleInfo.price > userInfo?.coins) {
        res.json({err: `You don't have enought coins. ${articleInfo.price - userInfo.coins} coins missing`});
    }

    // If the user already bought the article
    else if (
        userInfo.flag?.includes(name) ||
        userInfo.chat?.includes(name) ||
        (name === "Banner" && userInfo.banner) || 
        (name === "Banner GIF" && userInfo.bannerGif) || 
        (name === "Profile picture GIF" && userInfo.pfpGif)
    )
    {
        res.json({err: "You already have this article"});
    } 
    
    // else if it seems to be valid
    else {
        switch (articleInfo.type) {
            case "advantage":
                switch (name) {
                    case "Banner":
                        await db.collection("users").updateOne({token: token}, {$set: {banner: "https://www.flagfight.world/banner.jpg"}});
                        break;
                    case "Profile picture GIF":
                        await db.collection("users").updateOne({token: token}, {$set: {pfpGif: true}});
                        break;
                    case "Banner GIF":
                        await db.collection("users").updateOne({token: token}, {$set: {bannerGif: true}});
                        break;
                    default:
                        break;
                }
                break;
            case "flag":
                await db.collection("users").updateOne({token: token}, {$push: {flag: name}});
                break;
            case "chat":
                await db.collection("users").updateOne({token: token}, {$push: {chat: name}});
                break;
            default:
                res.json({err: `Invalid type of data. Expected "advantage" or "flag" or "chat", got: "${articleInfo.type}"`})
                return;
        }

        console.log(-articleInfo.price);
        await db.collection("users").updateOne({token: token}, {$inc: {coins: -articleInfo.price}})

        res.json({msg: "Article bought"})
    }
}


/**
 * @brief Get the item that are in promotion
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getItemPromotion = async (req, res) => {

    // console.log(jsonFind(await db.collection('daily').findOne({})))
    // console.log(jsonFind(await db.collection('daily').findOne({expireDate: {$lt: new Date()}})))
    const state = await db.collection("daily").updateOne({expireDate: {$lt: new Date()}}, {$set: {expireDate: new Date(new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).setHours(0,0,0,0)) }});

    // console.log(state);

    // If it's the first time that somebody request the promotion today
    if (state.modifiedCount > 0) {
        
        updateDaily();
    }

    let information = jsonFind(await db.collection('daily').findOne({}, {projection: {flag: 1, chat: 1, _id: 0}}));

    information.flag = information.flag.map(flag => flag.name);
    information.chat = information.chat.map(chat => chat.name);

    res.json(information);
}



/**
 * @brief Verify that a game exists
 * 
 * @param {object} id The id of the game that needs to be verified
 * 
 * @returns void
 */
const verifyGame = async (id) => {
    return await db.collection("game").findOne({_id: id}) !== null;
}


/**
 * @brief Get the coins of the user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getCoins = async (req, res) => {
    const token = req.token;

    res.json(jsonFind(await db.collection("users").findOne({token: token}, {projection: {_id: 0, coins: 1}})));
}


/**
 * @brief Get the articles of a user
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getPersonnalArticles = async (req, res) => {
    const token = req.token;

    res.json(jsonFind(await db.collection("users").findOne({token: token}, {projection: {_id: 0, chat: 1, flag: 1, bannerGif: 1, banner: 1, pfpGif: 1}})));
}



/**
 * @brief Update the information of a user about his profile
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const updateInformation = async (req, res) => {

    console.log(req)
    console.log(req.query)
    console.log(req.params)
    console.log(req.body)

    const token = req.token; 
    const {data, type} = req.body;
    let status;
    const dataTypes = ['name', 'pfp', 'banner', 'country', 'bio'];

    switch (type) {
        // Name
        case "name":
            // Search if there is already a user with that name
            if (await db.collection('users').countDocuments({name: data}, {limit: 1}) > 0) {
                res.json({err: "There is already a user with that name"});
                return;
            }

            status = await db.collection('users').updateOne({token: token, lastChangeName: {$lt: new Date(new Date() - (1000 * 60) * 5)}}, {$set: {name: data, lastChangeName: new Date()}});

            if (status.modifiedCount === 1) {
                res.json({debug: "Name changed successfuly", updated: true});
            } else {
                res.json({err: "You need to wait 5 minutes between each name change", updated: false});
            }

            break;

        // Profile picture
        case "pfp":
            // Verify the type of the image
            if (["png", "jpg", "jpeg", "tiff"].includes(data.extension) || (await db.collection('users').findOne({token: token, pfpGif: true}) && data.extension === 'gif')) {
                status = await db.collection('users').updateOne({token: token, lastChangePfp: {$lt: new Date(new Date() - (1000 * 60) * 5)} }, {$set: {pfp: `https://i.imgur.com/${data.id}.${data.extension}`, lastChangePfp: new Date()}});
               
                console.log(jsonFind(await db.collection('users').findOne({token: token})));
                console.log(jsonFind(await db.collection('users').findOne({token: token, lastChangePfp: {$lt: new Date(new Date() - (1000 * 60) * 5)}})));
                console.log(jsonFind(await db.collection('users').findOne({token: token, lastChangePfp: {$gt: new Date(new Date() - (1000 * 60) * 5)}})));
                console.log(Date(new Date() - (1000 * 60) * 5));


                if (status.modifiedCount === 1) {
                    res.json({debug: "Profile picture changed successfuly", updated: true});
                } else {
                    res.json({err: "You need to wait 5 minutes between each profile picture change", updated: false});
                }
            } else if (data.extension === 'gif') {
                res.json({err: "You need to buy the option to have a GIF profile picture in the shop", updated: false});
            } else {
                res.json({err: "Invalid type of image", updated: false});
            }
            break;
            
        // Country
        case "country":
            if (await db.collection('users').findOne({token: token, flag: {$elemMatch: {$eq: data}}})) {
                status = db.collection('users').updateOne({token: token}, {$set: {country: data}});
                res.json({debug: "Successfully updated"})
            } else {
                res.json({err: "You don't have this country in your collection"});
            }
            break

        // Banner
        case "banner":
            // Verify that the user has the banner option
            if (await db.collection('users').findOne({token: token, banner: {$ne: false}, banner: {$exists: true}}) === null) {
                res.json({err: "You need to buy the option to have a custom banner in the shop"})
            }
            // Verify the type of the image
            else if (["png", "jpg", "jpeg", "tiff"].includes(data.extension) || (await db.collection('users').findOne({token: token, bannerGif: true}) && data.extension === 'gif')) {
                status = await db.collection('users').updateOne({token: token, lastChangeBanner: {$lt: new Date(new Date() - (1000 * 60) * 5)} }, {$set: {banner: `https://i.imgur.com/${data.id}.${data.extension}`, lastChangeBanner: new Date()}});

                if (status.modifiedCount === 1) {
                    res.json({debug: "Banner changed successfuly", updated: true});
                } else {
                    res.json({err: "You need to wait 5 minutes between each banner change", updated: false});
                }
            } else if (data.extension === 'gif') {
                res.json({err: "You need to buy the option to have a GIF banner in the shop", updated: false});
            } else {
                res.json({err: "Invalid type of image", updated: false});
            }
            break

        // Biodescription
        case "bio":
            status = await db.collection('users').updateOne({token: token, lastChangeBio: {$lt: new Date(new Date() - (1000 * 60) * 5)}}, {$set: {bio: data, lastChangeBio: new Date()}});

            if (status.modifiedCount === 1) {
                res.json({debug: "Bio changed successfuly", updated: true});
            } else {
                res.json({err: "You need to wait 5 minutes between each bio change", updated: false});
            }

            break;


        default:
            res.json({err: `Unknown type of data.\nExpected ${dataTypes.join` or `}, got: ${type}`});
            return;
    }
}



/**
 * @brief Get basic information about the player
 * 
 * @param {object} req The request
 * @param {object} res The result
 * 
 * @returns void
 */
export const getPlayerInformation = async (req, res) => {
    
    const data = jsonFind(
        await db
            .collection('users')
            .findOne({ name: req.query.name },
            {projection: {
                name: 1,
                country: 1,
                bio: 1,
                elo: 1,
                pfp: 1,
                banner: 1,
            }}
        )
    )
    
    console.log(data)

    res.json(data)
}



/**
 * @brief Get the basic informations about the game
 * 
 * @param {Integer} difficulty
 * - difficulty: The difficulty of the question that you want to create
 * @returns 
 * - The question
 * - The possible answers
 * - The correct answer
 */
export const getGameInformation = async (req, res) => {
    const game = jsonFind(await db.collection('game').findOne({_id: new ObjectId(req.query.gameId)}));

    if (game == null) {
        res.json({err: "Game doesn't exists"});
        return;
    }

    let playersInformation = [];

    for (const player of game.players) {
        const playerInfo = jsonFind(await db.collection('users').findOne({name: player.name}));

        if (playerInfo === null) {
            res.json({err: "Error with a player"});
            return;
        }

        if (playerInfo.token === req.query.token) {
            playersInformation.splice(0, 0, playerInfo);
        } else {
            playersInformation.push(playerInfo);
        }
    };

    
    const gameEmpty = game.historyQuestions.length === 0;

    if (gameEmpty) {
        var [question, answers, type] = ["...", ["","","",""],"name"]
    } else {
        var {question, answers, type} = game.historyQuestions.at(-1);
        console.log([question, answers, type])
        if (type === "name") {
            question = convertCountry[question];
            answers = answers.map(flag => `https://www.flagfight.world/flags/main/${flag}.svg`);
        } else {
            question = `https://www.flagfight.world/flags/main/${question}.svg`;
            answers = answers.map(flag => convertCountry[flag]);
        }
    }

    console.log([question, answers, type]);

    res.json({
        name: [playersInformation[0].name, playersInformation[1].name],
        pfp: [playersInformation[0].pfp, playersInformation[1].pfp],
        elo: [playersInformation[0].elo, playersInformation[1].elo],
        country: [playersInformation[0].country, playersInformation[1].country],
        status: game.status,
        round: game.round,
        type: game.type,
        question: question,
        answers: answers,
        typeQuestion: type,
    });
}





/**
 * @brief Get the name of someone by it's token
 * 
 * @param {JSON} req
 * - token: The token of the user
 * @param {JSON} res
 * @returns 
 * - The name of the user if the token is valid, else an error
 */
export const getNameByToken = async (req, res) => {
    const data = jsonFind(await db.collection('users').findOne({token: req.query.token}, {name: 1}));

    if (data) {
        res.json({name: data.name});
    } else {
        res.json({err: "No user with that token"});
    }
}


/**
 * @brief Create a question
 * 
 * @param {Integer} difficulty
 * - difficulty: The difficulty of the question that you want to create
 * @returns 
 * - The question
 * - The possible answers
 * - The correct answer
 */
const createFlagQuestion = async (difficulty, filter) => {
    let options = shuffleArray(jsonFind(await db.collection('flag').find({difficulty: difficulty, extension: {$nin: filter}}).toArray()));
    const randomChoice = options.pop();
    let randomSelectedFlags = [randomChoice];
    
    // Probability of 50% to pick a similar flag 
    if (Math.random() < 0.5 && "similarFlags" in randomChoice && randomChoice.length >= 3) {
        const similarFlags = shuffleArray(randomChoice.similarFlags);
        randomSelectedFlags.push(...similarFlags.slice(-3));
    } else { // Else, pick a flag with the same difficulty
        randomSelectedFlags.push(...options.slice(-3));
    }

    // Shuffle the array and get the position of the correct answer
    randomSelectedFlags = shuffleArray(randomSelectedFlags);
    const correctAnswer = randomSelectedFlags.findIndex(flag => flag.extension === randomChoice.extension);
    // randomSelectedFlags.map(flag => {console.log(flag.extension, randomChoice.extension); console.log(flag.extension === randomChoice.extension)});

    // // Probability of 50% to pick a question with text
    // if (Math.random() < 0.5) {
    //     randomChoice = randomChoice.name;
    //     randomSelectedFlags = randomSelectedFlags.map(flag => flag.extension)
    // } else { // Else its the question about with the flag that you need to guess
    //     randomChoice = randomChoice.extension;
    //     randomSelectedFlags = randomSelectedFlags.map(flag => flag.name)
    // }

    return {
        question: randomChoice,
        options: randomSelectedFlags,
        answer: correctAnswer
    }
}


/**
 * @brief Function to handle the end of a game
 * 
 * @param {String} gameId
 * @param {String} winner
 * 
 * @returns {JSON}
 */
const endGame = async (gameId, winner) => {
    // Update the status of the game as over
    const status = await db
    .collection('game')
    .updateOne(
        {
            _id: new ObjectId(gameId),
            over: false,
            status: {$ne: 3},
        },
        {
            $set: {
                over: true,
                status: 3
            }
        }
    );


    if (status.modifiedCount < 1) {
        return {
            debug: "Game is already over"
        };
    }

    // Get the number of turn in the game
    const {turn, players, type} = await db.collection('game').findOne({_id: new ObjectId(gameId)}, {turn: 1, players: 1, type: 1});
    console.log(await db.collection('game').findOne({_id: new ObjectId(gameId)}, {turn: 1, players: 1, type: 1}));
    console.log(players, turn, type);


    // Case it's a tie
    if (winner === null && type !== "friend") {
        // Add coins to both users
        await db.collection("users").updateMany(
            {
                name: {
                    $in : players
                }
            }, {
                $inc: {
                    coins: 50 + turn,
                    nbGames: 1,
                    wins: 0.5
                }
            }
        )

        return [
            {
                name: players[0]?.name,
                coins: 50 + turn
            },
            {
                name: players[1]?.name,
                coins: 50 + turn
            }
        ]
    } 
    // Case the win is for the first player
    else if (players.map(player => player.name).includes(winner)) {
        const coins1 = winner === players[0].name ? 100 : 10    
        const coins2 = winner === players[1].name ? 100 : 10    
        
        // If the game was ranked
        if (type === 'ranked') {
            let player1Elo = mainFormula(winner === players[0].name, turn, players[0].elo, players[1].elo);
            let player2Elo = mainFormula(winner === players[1].name, turn, players[1].elo, players[0].elo);
            

            if (player1Elo + players[0].elo < 0) {
                player1Elo = -players[0].elo;
            }
            if (player2Elo + players[1].elo < 0) {
                player2Elo = -players[1].elo;
            }

            await db.collection("users").updateOne(
                {
                    token: players[0].token
                }, {
                    $inc: {
                        elo: player1Elo,
                        coins: coins1 + turn,
                        nbGames: 1,
                        wins: +(winner === players[0].name),
                    },
                    $max: {
                        maxElo: players[0].elo + player1Elo
                    }
                }
            )
            await db.collection("users").updateOne(
                {
                    token: players[1].token
                }, {
                    $inc: {
                        elo: player2Elo,
                        coins: coins2 + turn,
                        nbGames: 1,
                        wins: +(winner === players[1].name)
                    },
                    $max: {
                        maxElo: players[1].elo + player2Elo
                    }
                }
            )

            return [
                {
                    name: players[0].name,
                    coins: coins1 + turn,
                    elo: player1Elo
                },
                {
                    name: players[1].name,
                    coins: coins2 + turn,
                    elo: player2Elo
                }
            ]
        }
        // Else if the game isn't ranked, simply add coins to both users
        else if (type === 'quickgame') {
            await db.collection("users").updateOne(
                {
                    token: players[0].token
                }, {
                    $inc: {
                        coins: coins1 + turn,
                        nbGames: 1,
                        wins: +(winner === players[0].name)
                    }
                }
            )
            await db.collection("users").updateOne(
                {
                    token: players[1].token
                }, {
                    $inc: {
                        coins: coins2 + turn,
                        nbGames: 1,
                        wins: +(winner === players[1].name)
                    }
                }
            )

            return [
                {
                    name: players[0].name,
                    coins: coins1 + turn,
                },
                {
                    name: players[1].name,
                    coins: coins2 + turn,
                }
            ]
        }
        // If it's just a friendly game
        else if (type === 'friend') {
            return players.map(player => {return {name: player.name}});
        }
    }
    // If it's just a friendly game
    else if (type === 'friend') {
        return players.map(player => {return {name: player.name}});
    }
    // Error with the winner
    else {
        console.log("Error with the winner that isn't a valid user")

        return {
            err: "Error with the winner that isn't a valid user"
        }
    }
}




/**
 * @brief Verify that the answer is correct
 * 
 * @param {JSON} data
 * - gameId: The id of the game
 * - token: The token of a player
 * - answer: The answer of the player
 * @returns 
 * - correct: If the answer was correct
 * - someoneAlreadyAnswered: If one player already answered
 * - otherPlayerCorrect: If the other player is correct (false if he didnt answer for now)
 */
export const verifyAnswer = async (data, io) => {
    // Variables
    /// Extract the data
    const {gameId, token, answer} = data;
    // Game
    const game = jsonFind(await db.collection('game').findOne({_id: new ObjectId(gameId)}));
    /// Get the current question
    const question = game.historyQuestions.at(-1);

    // If there isn't any question for now
    if (question === undefined) {
        return;
    }

    /// Check if the answer of the question is the same as the answer of the user
    const correct = question.correct === answer;



    // Update the game if both players have answered
    const rep = await db
        .collection('game')
        .findOne(
            {
                _id: new ObjectId(gameId),
                players: {
                    $not: {
                        $elemMatch: {
                            answered: false
                        }
                    }
                }
            },
            {
                $set: {
                    "players.$[].answered": false,
                },
                $inc: {
                    turn: 1
                }
            }
        )


    // Add the answer of the user
    await db
    .collection('game')
    .updateOne(
        {
            _id: new ObjectId(gameId),
            "players.token": token,
        },
        {
            $set: {
                // "players.$.answered": rep.modifiedCount !== 1,
                "players.$.answered": rep === null,
                "players.$.correct": correct
            }
        }
    )
    
    // Get the new data
    const updatedData = jsonFind(await db.collection('game').findOne({_id: new ObjectId(gameId)}));


    let secondRep = null;

    // if (rep.modifiedCount !== 1 && updatedData.players.every(player => player.answered)) {
    if (rep === null && updatedData.players.every(player => player.answered)) {
        // Update the game if both players have answered
        secondRep = await db
        .collection('game')
        .findOneAndUpdate(
            {
                _id: new ObjectId(gameId),
                "players.answered": {
                    $nin: [false]
                }
            },
            {
                $set: {
                    "players.$[].answered": false,
                },
                $inc: {
                    turn: 1
                }
            }
        )
    }

    // If the document has been updated
    // It means that someone had already answered.
    // if (rep.modifiedCount === 1 || (secondRep !== null && secondRep.modifiedCount === 1)) {
    if (rep !== null || secondRep !== null) {
        // Get the status of both players
        const otherPlayerCorrect = updatedData.players.every(player => player.correct) || (updatedData.players.some(player => player.correct) && !correct);



        // If both players are correct
        if (correct && otherPlayerCorrect) {
            await db
            .collection('game')
            .updateOne(
                {_id: new ObjectId(gameId)},
                {$set: {"players.$[].correct": false, "players.$[].answered": false}}
            );
        }

        // Else if, one player won
        else if ((correct && !otherPlayerCorrect) || (!correct && otherPlayerCorrect)) {
            console.trace(updatedData)
            console.trace(updatedData.players)
            const data = (await endGame(""+gameId, updatedData.players.filter(player => eval(`player.token ${correct?'=':'!'}== token`))[0].name));
            io.to(""+gameId).emit("endResult", data);
        }

        // Else both players are wrong
        else {
            // The status is tie.
            await db
            .collection('game')
            .updateOne(
                {_id: new ObjectId(gameId)},
                {
                    $set: {
                        "players.$[].answered": false,
                        "players.$[].correct": false,
                        status: 2
                    }
                }
            );


            // Check if they both want to continue playing
            setTimeout(async () => {
                // Get new data
                const {status} = jsonFind(await db.collection('game').findOne({_id: new ObjectId(gameId)}));

                // If the status is still waiting for an answer after 15s => End the game
                if (status === 2) {
                    io.to(""+gameId).emit("gameStatus", {status: "end", winner: null});
                    const data = await endGame(""+gameId, null);
                    io.to(""+gameId).emit("endResult", data);
                }
            }, 15_000);
        }


        return {
            indexCorrect: question.correct,
            correct: correct,
            someoneAlreadyAnswered: true,
            otherPlayerCorrect: otherPlayerCorrect
        };
    } else {
        return {
            indexCorrect: question.correct,
            correct: correct,
            someoneAlreadyAnswered: false,
            otherPlayerCorrect: false
        };
    }
}



// Normal distribution
const normal_distribution = (x, σ, μ) => (1 / σ * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(((x - μ) / σ), 2));


/**
 * @brief Get the difficulty of a flag by the turn of the game
 * 
 * @param {number} turn
 * @returns the difficulty
 */
const getDifficulty = async (turn, deviation=0) => {
    const sigma = 0.5; // Standard deviation
    let probabiltyDifficulties = []; // The probability of each difficulty
    const maxTurn = 40; // The maximum turn before prolongation
    const maxDifficulty = jsonFind(await db.collection("flag").find().sort({difficulty: -1}).limit(1).toArray())[0].difficulty; // The flag with the maximum difficulty


    // If we're before the prolongation
    // We shift the average towards harder difficulties.
    if (turn <= maxTurn) {
        // Foreach difficulty in [1; maxDifficulty]
        for (let i = 1; i <= maxDifficulty; i++) {
            // Add the normal distribution to the array
            probabiltyDifficulties.push(normal_distribution(i, sigma + turn / maxTurn, 1 + (turn / (maxTurn / 10)) - deviation) * (maxDifficulty / 10));
        }
    }
    // If we're in the prolongation
    // We increase the standard deviation little by little until each difficulty has the same probability.
    else {
        // Foreach difficulty in [1; maxDifficulty]
        for (let i = 1; i <= maxDifficulty; i++) {
            // Add the normal distribution to the array
            probabiltyDifficulties.push(normal_distribution(i, sigma + turn - maxTurn, maxDifficulty - deviation));
        }
    }

    // The sum of the array
    const totalSum = probabiltyDifficulties.reduce((a,b) => a+b);
    // Get a random number in [0; totalSum]
    const randomChoice = Math.random() * totalSum;
    // The temporary sum
    let sumProbabilty = 0;
    // The temporary difficulty
    let difficulty = 0;
    
    // While the tempSum is lower than the randomChoice 
    while (sumProbabilty < randomChoice) {
        sumProbabilty += probabiltyDifficulties[difficulty]; // We add the next probability to the sum of probabilties
        difficulty++; // And we go to the next difficulty
    }

    console.log(`QUESTION DIFFICULTY: [${probabiltyDifficulties.join`,`}] ; ${turn} ; ${difficulty}`);

    return Math.max(1, difficulty); // Math.max in the case that randomChoice was 0.0000...
}



const getMeanElo = (players) => {
    return Math.ceil(players.map(player => player.elo).reduce((a,b) => a + b) / 2);
}




/**
 * @brief The main loop of the game
 * 
 * @param {String} gameId
 * @returns the difficultyt
 */
export const loopGame = async (gameId, io, start=false) => {
    // Get informations of the game
    const _id = new ObjectId(gameId);
    const {turn, historyQuestions, players} = jsonFind(await db.collection('game').findOne({_id: _id}, {turn: 1, historyQuestions: 1, players: 1}));

    // Defining the difficulty and the filter
    console.log(players)
    console.log(getMeanElo(players))
    console.log(rankByElo(getMeanElo(players)))
    console.log(ranks.indexOf(rankByElo(getMeanElo(players))))
    console.log((7 - ranks.indexOf(rankByElo(getMeanElo(players)))) / 2);
    const difficulty = await getDifficulty(turn, (7 - ranks.indexOf(rankByElo(getMeanElo(players)))) / 2);
    const filter = historyQuestions.map(e => e.question); // The filter is the question that already have been asked

    // console.log(`Diff & Filter: ${difficulty} ${filter.join`;`}`);
    
    // Create a question
    const {question, options, answer} = await createFlagQuestion(difficulty, filter); // Create the question with this information
    // console.log(`Question options answers: ${JSON.stringify(question)} ${options.map(o => JSON.stringify(o)).join`;`} ${JSON.stringify(answer)}`);
    const type = Math.random() > 0.5 ? "name" : "flag";


    // If two games started in a row
    if (start && jsonFind(await db.collection('game').findOne({_id: _id})).historyQuestions.length > 0) {
        return;
    }


    // Store information in the DataBase
    await db.collection('game').updateOne(
        {
            _id: _id
        }, {
            $push: {
                historyQuestions: {
                    type: type,
                    question: question.extension,
                    answers: options.map(flag => flag.extension),
                    correct: answer
                }
            }
        }
    );
    
    // Sending the question to the clients
    io.to("" + gameId).emit("getQuestion", {
        question: type === "name" ? question.name : question.extension,
        answers: options.map(flag => (type === "name") ? flag.extension : flag.name),
        type: type
    });


    setTimeout(async () => {
        // Get the new data
        const gameInformation = jsonFind(await db.collection('game').findOne({_id: _id}));
        const newTurn = gameInformation.turn;
        const {players, over} = gameInformation;

        // Verify that we are still at the same question, else do nothing
        if (newTurn === turn && !over) {
            // If no players as answered

            checkGameState(players[0].correct, players[1].correct, players[0].name, players[1].name, ""+gameId, io);
        }
    }, 15_000); // In 15 seconds
}



/**
 * @brief Check that both players are ready
 * 
 * @param {JSON} data
 * - id: The id of the game
 * - token: The token of a player
 * @returns void
 */
export const ready = async (data, io, socket) => {

    const {id, token} = data;
    const _id = new ObjectId(id);

    // If the game doesn't exists
    if (!(await verifyGame(_id))) {
        return;
    }


    // If all players are already ready <=> Game has already started
    if (jsonFind(await db.collection('game').findOne({_id: _id})).players.every(player => player.ready)) {
        return;
    }

    const gameStatus= jsonFind(await db.collection('game').findOneAndUpdate(
        {
            _id: _id,
            "players.token": token
        },
        {
            $set:
            {
                "players.$.ready": true,
            }
        },
        {
            returnOriginal: false,
            projection: {
                _id: 0,
                "players.ready": 1
            }
        }
    ));




    try {
        const gameReady = gameStatus?.value?.players?.some(obj => obj.ready);
        
        // If both players are ready
        if (gameReady) {
            console.log("Saying that the game is starting")
            // io.to(""+id).emit("gameStarting");
            io.to(""+id).emit("gameStarting");
            // io.to(""+id).emit("ping", {data: "test"});
            // io.in(""+id).emit("gameStarting");
            setTimeout(() => {loopGame(""+id, io, true)}, 3000);
        }
    } catch (err) {
        console.log(err);
    }
}


/**
 * @brief Get the information of a user
 * 
 * @param {JSON} req
 * - reqToken: The token of the person who made the request. -1 if without token
 * - name: Get the information of the user by its name (reqToken needed)
 * - id: Get the information of the user by its ID (reqToken needed)
 * - token: Get the information of the user by its token. (reqToken not needed)
 * @param {JSON} res 
 * @returns void
 */
export const getInformationsOfUser = async (req, res) => {
    const {reqToken, name, id, token} = req.body;
    let rep = {};
    
    if (reqToken != -1 && !tokenValidity(reqToken)) {
        rep = res.json({err: "Invalid token."});
        
        return rep;
    }

    if (reqToken == -1 && token !== undefined) {
        rep = await db.collection("users").findOne({token: token});
    } else if (reqToken != -1 && name !== undefined) {
        rep = await db.collection("users").findOne({name: name});
    } else if (reqToken != -1 && id !== undefined) {
        rep = await db.collection("users").findOne({_id: id});
    } else {
        rep = {err: "Invalid request."};
    }


    if (res === null) {
        return rep;
    } else {
        res.json(rep);
    }
}


/**
 * @brief Create a game
 * 
 * @param {String} userToken
 * The token of the user
 * @param {String} type
 * The type of the game
 * @returns void
 */
const createGame = async (userToken, type) => {

    let information = null;
    await getInformationsOfUser({body: {reqToken: -1, token: userToken}}, information);
    const {name, elo, country} = information;

    if (type == "quickgamme") {
        db.collection('game').insertOne(
            {
                type: "quickgame",
                players: [{token: userToken, name: name, elo: elo, country: country, answered: false}],
                started: false,
                over: false,
                created: new Date(),
                turn: -1,
                historyQuestions: [],
            }
        )
    } else if (type == "ranked") {

    }
}


/**
 * @brief Check the state of the game
 * Used in:
 *  - answerGame
 *  - loopGame
 * @param {Boolean} player1Correct Is the player 1 correct
 * @param {Boolean} player2Correct Is the player 2 correct
 * @param {String} player1Name The name of the first player
 * @param {String} player2Name The name of the second player
 * @returns void
 */
const checkGameState = async (player1Correct, player2Correct, player1Name, player2Name, gameId, io) => {
    let gameStatus;

    if (player1Correct && player2Correct) {
        gameStatus = {status: "continue"};
    } else if (player1Correct && !player2Correct) {
        gameStatus = {status: "end", winner: player1Name};
    } else if (!player1Correct && player2Correct) {
        gameStatus = {status: "end", winner: player2Name};
    } else {
        gameStatus = {status: "tie"};
    }

    // If the turn is 40.
    if (
        jsonFind(await db
            .collection('game')
            .findOne(
                {_id: new ObjectId(gameId)},
                {projection: {_id: 0, turn: 1}}
        )).turn === 40
    ) {
        gameStatus = {status: "tie"}
    }


    // If the game is over
    if (gameStatus.status === "end") {
        const data = await endGame(""+gameId, player1Correct ? player1Name : player2Name);
        io.to(""+gameId).emit("endResult", data);
    }

    // Emit the status
    io.to(gameId).emit("gameStatus", gameStatus);

    if (gameStatus.status === "continue") {
        loopGame(""+gameId, io);
    }
} 



/**
 * @brief Join a game
 * 
 * @param {JSON} data
 * - token: The token of the user that wants to join the game
 * - id: The id of the game (if the user wants to join a specific game)
 * - type: The type of the game
 * @param {io} io
 * The socket io
 * @param {socket} socket
 * The socket
 * 
 * @returns void
 */
export const joinGame = async (data, io, socket) => {

    if (data.token === undefined || !(await tokenValidity(data.token))) {
        socket.emit("returnGameId", {err: "Invalid token."});
        return;
    }


    // Join a game by its ID
    if (data.id != null) {
        socket.emit("returnGameId", data.id);
    } else { // Join a game that is available
        let game;
        // let information = await getInformationsOfUser({body: {reqToken: -1, token: data.token}}, null);
        let information =
            jsonFind(
                await db
                .collection('users')
                .findOne(
                    {token: data.token},
                    {projection: {
                        name: 1,
                        country: 1,
                        elo: 1,
                        pfp: 1,
                        token: 1,
                        blockedUsers: 1 ,
                    }}
                )
            )

        console.log(information)

        console.log(information.blockedUsers);

        if (data.name === information.name) {
            return;
        }

        // Information that are relatives to the game
        information.ready = false;
        information.answered = false;
        information.correct = false;

        // If a game created by the same user exists, delete it
        await db.collection('game').deleteMany({started: false, players: {$elemMatch: {token: data.token}}});


        // Depending on the type of game that the user wants to play
        switch (data.type) {
            
            ///////////////
            // QUICK GAME//
            ///////////////
            case "quickgame":
                game = await db.collection('game').findOne(
                    {
                        type: "quickgame",
                        status: 0,
                        started: false,
                        'players.token': {$ne: data.token},
                        'players._id': {$nin: information.blockedUsers},
                        'players.blockedUsers': {$ne: ""+information._id}
                    }
                );


                // If there is one game
                if (game !== null) {
                    console.log("Sending data to " + game._id + " that the game is starting");

                    // Stop Waiting for the game
                    io.to(game._id.toString()).emit("stopWaiting", async (answer) => {
                        
                        // Update the game and say that the game started
                        await db.collection('game').updateOne(
                            {_id: new ObjectId(game._id)},
                            {   
                                $set: {
                                    started: true,
                                    turn: 1,
                                    players: [game.players[0], information]
                                }
                            }
                        );

                        socket.emit("returnGameId", {
                            waiting: false,
                            id: game._id.toString()
                        });

                        // If after one minute, the game didn't start, cancel the game
                        setTimeout(async () => {
                            await db.collection('game').deleteOne({_id: game._id, started: false});
                        }, 60_000);
                    });
                } else { // If there is no game


                    await db.collection('game').insertOne({
                        type: "quickgame", // Type of the game  
                        players: [information], // List of player info
                        started: false, // If the game has started
                        over: false, // If the game is over
                        created: new Date(), // When the game was created
                        turn: -1, // Current turn of the game
                        maxTurn: 40, // The maximum amount of turn
                        historyQuestions: [], // The history of the question
                        status: 0, // Status of the game
                    });

                    game = await db.collection('game').findOne({started: false, players: {$elemMatch: {token: data.token}}}); 

                    console.log("To room: " + game._id);

                    socket.emit("returnGameId", {waiting: true, id: game._id});
                }

                break;



            ////////////////
            // RANKED GAME//
            ////////////////
            case "ranked":
                game = await db
                        .collection('game')
                        .findOne(
                            {
                                status: 0,
                                started: false,
                                'players.token': {$ne: data.token},
                                "players._id": {$nin: information.blockedUsers},
                                type: "ranked",
                                elo: {$gt: information.elo - 500, $lt: information.elo + 500}
                            },
                            {
                                projection: {
                                    _id: 1,
                                    players: 1
                                }
                            }
                        );


                // If there is one game
                if (game !== null) {
                    console.log("Sending data to " + game._id + " that the game is starting");

                    // Stop Waiting for the game
                    io.to(game._id.toString()).emit("stopWaiting", async (answer) => {
                        
                        // Update the game and say that the game started
                        await db.collection('game').updateOne(
                            {_id: new ObjectId(game._id)},
                            {   
                                $set: {
                                    started: true,
                                    turn: 1,
                                    players: [game.players[0], information]
                                }
                            }
                        );

                        socket.emit("returnGameId", {
                            waiting: false,
                            id: game._id.toString()
                        });


                        // If after one minute, the game didn't start, cancel the game
                        setTimeout(async () => {
                            await db.collection('game').deleteOne({_id: game._id, started: false});
                        }, 60_000);
                    });
                }
                // If there is no game
                else {

                    await db.collection('game').insertOne({
                        type: "ranked", // Type of the game  
                        players: [information], // List of player info
                        started: false, // If the game has started
                        over: false, // If the game is over
                        created: new Date(), // When the game was created
                        turn: -1, // Current turn of the game
                        maxTurn: 40, // The maximum amount of turn
                        historyQuestions: [], // The history of the question
                        elo: information.elo, // The elo of the player that just created the game
                        status: 0, // Status of the game
                    });

                    game = await db.collection('game').findOne({started: false, players: {$elemMatch: {token: data.token}}}); 

                    socket.emit("returnGameId", {waiting: true, id: game._id});
                }
                break;



            //////////////////
            // FRIENDLY GAME//
            //////////////////
            case "friend":
                game = await db.collection('game').findOne({
                    status: 0,
                    'players.token': {$ne: data.token},
                    "players._id": {$nin: information.blockedUsers},
                    type: "friend",
                    started: false,
                    token: {$ne: data.token},
                    waitingPlayers: information.name,
                    waitingPlayers: data.name
                });


                // If there is one game
                if (game !== null) {
                    console.log("Sending data to " + game._id + " that the game is starting");

                    // Stop Waiting for the game
                    io.to(game._id.toString()).emit("stopWaiting", async (answer) => {
                        
                        // Update the game and say that the game started
                        await db.collection('game').updateOne(
                            {_id: new ObjectId(game._id)},
                            {   
                                $set: {
                                    started: true,
                                    turn: 1,
                                    players: [game.players[0], information]
                                }
                            }
                        );

                        socket.emit("returnGameId", {
                            waiting: false,
                            id: game._id.toString()
                        });

                        // If after one minute, the game didn't start, cancel the game
                        setTimeout(async () => {
                            await db.collection('game').deleteOne({_id: game._id, started: false});
                        }, 60_000);
                    });
                 }
                // else if there is no game
                else {
                    await db.collection('game').insertOne({
                        type: "friend", // Type of the game  
                        players: [information], // List of player info
                        started: false, // If the game has started
                        over: false, // If the game is over
                        created: new Date(), // When the game was created
                        turn: -1, // Current turn of the game
                        maxTurn: 40, // The maximum amount of turn
                        historyQuestions: [], // The history of the question
                        waitingPlayers: [information.name, data.name], // Waiting players
                        status: 0, // Status of the game
                    });

                    game = await db.collection('game').findOne({started: false, players: {$elemMatch: {token: data.token}}}); 

                    socket.emit("returnGameId", {waiting: true, id: game._id});
                }
                break;
                    
            /////////////////
            // INVALID GAME//
            /////////////////
            default:
                socket.emit("returnGameId", {err: "Invalid type of game"});
                break;
        }

        setTimeout(async () => {
            await db.collection('game').deleteOne({_id: game._id, started: false});
        }, 60_000 * 60); // After one hour, cancel the game
    }
};





/**
 * @brief Handle the answer in a game
 * 
 * @param {*} userToken
 * The token of the user
 * @param {*} type
 * The type of the game
 * @returns void
 */
export const answerGame = async (data, io) => {

    const game = await db.collection('game').findOne({_id: new ObjectId(data.gameId), over: false, started: true}, {projection: {_id: 0, players: 1}});

    // Verify that the game is valid
    if (game === null) {
        return {err: "Game doesn't exists or is over"};
    }

    const players = jsonFind(game).players;


    const status = await db.collection('game').findOne({
        _id: new ObjectId(data.gameId),
        players: {
            token: data.token,
            answered: true,
        }
    });

    // If the player has already answered
    // if (players.filter(player => player.token === data.token)[0].answered) {
    if (status !== null) {
        return {err: "You already answered that game"};
    }

    const info = await getInformationsOfUser({body: {reqToken: -1, token: data.token}}, null);
    const {indexCorrect, correct, someoneAlreadyAnswered, otherPlayerCorrect} = await verifyAnswer(data, io);



    io.to(""+data.gameId).emit("answerReturn", {correct: correct, name: info.name});

    const currentPlayerName = players.filter(player => player.token === data.token)[0].name;
    const otherPlayerName = players.filter(player => player.token !== data.token)[0].name

    if (someoneAlreadyAnswered) {
        checkGameState(correct, otherPlayerCorrect, currentPlayerName, otherPlayerName, ""+data.gameId, io)
    }

    return {indexCorrect: indexCorrect, correct: correct};
}
