import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { corsMiddleware } from '../middleware/corsMiddleware.js';
import { readFile } from 'fs/promises';
import ObjectId, { jsonFind, connectToCluster, db } from '../../../config/initDB.js';
import * as routes from "./index.js"; // Route
import { updateActivity } from '../middleware/activity.js';
import passport from './auth.js';

let convertCountry = JSON.parse(await readFile("src/api/v1/utils/convertCountry.json", "utf8"));
const router = express.Router();



// Basic middleware
router.use(express.json())
router.use(corsMiddleware);
// MiddleWare for API
router.use(express.json({ limit: '10mb' })); // Adjust the limit as needed
router.use(express.urlencoded({ limit: '10mb', extended: true })); // Adjust the limit as needed
router.use("/api*", verifyToken);
router.use("/api*", updateActivity);
// Initialize Passport
router.use("/auth*", passport.initialize())


router.get('/', (req, res) => {
    const io = req.io;
    // utiliser io ici
    console.log("test");
});


// Auth
//// oAuth2
////// Google
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "http://localhost:3000/",
    }),
    async (req, res) => {
        const userData = req?.user?._json;

        // Search if an user with the Google ID of this user has been found.
        const userDb = await db.collection("users").findOne({googleId: userData.sub}, {projection: {_id: 0, token: 1}});
        
        // If user already exists => Log In
        if (userDb !== null ) {
            const { token } = jsonFind(userDb);

            res.redirect(`/stockToken?token=${token}`);
        }
        // Else => Create an account
        else {


            // Count the users with the same name at the start of their name
            const userWithSameName = await db
                .collection("users")
                .countDocuments({
                    name: {
                        // Name is at the start   All the remaining chars must be digits
                        //      v                             v
                        $regex: "^" + userData.name + "[0-9]*$"
                    }
                });

            
            // If somebody already has that name
            while (await db.collection("users").findOne({name: userData.name + (userWithSameName ? userWithSameName : "")}, {projection: {_id: 0}}) !== null) {
                userWithSameName++;
            }
            

            // Create the account of the user and get the token
            const { token } = await routes.createAccount(
                {
                    name: userData.name + (userWithSameName ? userWithSameName : ""), // The name of the user
                    email: userData.email, // The e-mail of the user
                    google: {id: userData.sub}, // It's google data
                    pfp: userData.picture ?? "http://localhost:3000/user.png", // If the user as a pfp
                }
            );

            // Send the token to the user
            res.redirect(`/stockToken?token=${token}`);
        }
    }
);

////// GitHub
router.get("/auth/github", passport.authenticate("github", { scope: ["profile", "email"] }));
router.get("/auth/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: "http://localhost:3000/",
    }),
    async (req, res) => {
        const userData = req?.user?._json;


        console.log(userData)



        // Search if an user with the Google ID of this user has been found.
        const userDb = await db.collection("users").findOne({githubId: userData.id}, {projection: {_id: 0, token: 1}});
        
        // If user already exists => Log In
        if (userDb !== null ) {
            const { token } = jsonFind(userDb);

            res.redirect(`/stockToken?token=${token}`);
        }
        // Else => Create an account
        else {
            // Count the users with the same name at the start of their name
            const userWithSameName = await db
                .collection("users")
                .countDocuments({
                    name: {
                        // Name is at the start   All the remaining chars must be digits
                        //      v                             v
                        $regex: "^" + userData.name + "[0-9]*$"
                    }
                });

            
            // If somebody already has that name
            while (await db.collection("users").findOne({name: userData.name + (userWithSameName ? userWithSameName : "")}, {projection: {_id: 0}}) !== null) {
                userWithSameName++;
            }
            
            // Create the account of the user and get the token
            const { token } = await routes.createAccount(
                {
                    name: userData.name + (userWithSameName ? userWithSameName : ""), // The name of the user
                    email: userData.email, // The e-mail of the user
                    github: {id: userData.id}, // It's google data
                    pfp: userData.avatar_url ?? "http://localhost:3000/user.png", // If the user as a pfp
                    bio: userData.bio ?? "-"
                }
            );

            // Send the token to the user
            res.redirect(`/stockToken?token=${token}`);
        }
    }
);

////// Discord
router.get("/auth/discord", passport.authenticate("discord", { scope: ["profile", "email"] }));
router.get("/auth/discord/callback",
    passport.authenticate("discord", {
        session: false,
        failureRedirect: "http://localhost:3000/",
    }),
    async (req, res) => {
        // const userData = req?.user?._json;
        // const userData = req;
        const userData = req.user;

        console.log(userData)


        // Search if an user with the Google ID of this user has been found.
        const userDb = await db.collection("users").findOne({discordId: userData.id}, {projection: {_id: 0, token: 1}});
        
        // If user already exists => Log In
        if (userDb !== null ) {
            const { token } = jsonFind(userDb);

            res.redirect(`/stockToken?token=${token}`);
        }
        // Else => Create an account
        else {
            // Count the users with the same name at the start of their name
            const userWithSameName = await db
                .collection("users")
                .countDocuments({
                    name: {
                        // Name is at the start   All the remaining chars must be digits
                        //      v                             v
                        $regex: "^" + userData.username + "[0-9]*$"
                    }
                });

            
            // If somebody already has that name
            while (await db.collection("users").findOne({name: userData.username + (userWithSameName ? userWithSameName : "")}, {projection: {_id: 0}}) !== null) {
                userWithSameName++;
            }
            

            // Create the account of the user and get the token
            const { token } = await routes.createAccount(
                {
                    name: userData.username + (userWithSameName ? userWithSameName : ""), // The name of the user
                    email: userData.email, // The e-mail of the user
                    discord: {id: userData.id}, // It's google data
                    pfp: userData.avatar !== null ?
                        `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` :
                        "http://localhost:3000/user.png", // If the user as a pfp
                }
            );

            // Send the token to the user
            res.redirect(`/stockToken?token=${token}`);
        }
    }
);




//// E-mail
router.post("/auth/createEmailAccount", routes.createEmailAccount)
router.post("/auth/login", routes.login)
router.post("/auth/verify", routes.verifyEmailByCode)




// Requests
/// Leaderboard related
router.get("/api/v1/flag-elo", routes.getFlagElo);
router.get("/api/v1/leaderboard", routes.getLeaderboard);

/// Friend related
router.post("/api/v1/report-user", routes.reportUser);
router.get("/api/v1/relations", routes.getRelation);
router.delete("/api/v1/friend", routes.removeFriend);
router.post("/api/v1/send-friend-request", routes.sendFriendRequest);
router.post("/api/v1/deny-friend-request", routes.denyFriendRequest);
router.get("/api/v1/friend-requests", routes.getFriendRequests);
router.get("/api/v1/friends", routes.getMyFriends);
router.get("/api/v1/user", routes.searchUser);
router.get("/api/v1/notification", routes.getNotification);
router.get("/api/v1/blocked-users", routes.getBlocked);
router.post("/api/v1/block-user", routes.blockUser);

/// Shop related
router.get("/api/v1/personnal-articles", routes.getPersonnalArticles);
router.post("/api/v1/buy-article", routes.buyArticle);
router.get("/api/v1/item-promotion", routes.getItemPromotion);
router.get("/api/v1/coins", routes.getCoins);

/// Home related
router.get("/api/v1/article-count", routes.getArticleCount);
router.get("/api/v1/ranking", routes.getRanking);

/// Game related
router.delete("/api/v1/waiting", routes.quitWaiting);
router.post("/api/v1/send-game-request", routes.sendGameRequest);
router.get("/api/v1/games", routes.getGames);
router.post("/api/v1/joinGame", routes.joinGame);
router.put("/api/v1/informations", routes.updateInformation);
router.get("/api/v1/game-informations", routes.getGameInformation);
router.post("/api/v1/answer-game", async (req, res) => {
    const answer = await routes.answerGame(req.body, req.app.get("socketio"));
    res.json(answer);
});

/// Player related
router.get("/api/v1/name/:token", routes.getNameByToken);
router.get("/api/v1/stats", routes.getStats);
router.get("/api/v1/bio", routes.getBio);
router.get("/api/v1/player-informations", routes.getPlayerInformation);



// Export
export default router;
