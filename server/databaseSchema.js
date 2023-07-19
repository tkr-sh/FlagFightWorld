import { ObjectID } from "bson"

/**
 * Flag
 */
const flag = new Schema(
    {
        name: { type: String },
        extension: { type: String, default: "xx"},
        difficulty: { type: Number },
        traduction: { type: Number },
        population: { type: Number },
        difficulty: { type: Number },
        similarFlags: {type: [String], default: []}
    }
)


/**
 * Game
 */
const game = new Schema(
    {
        type: {type: String, value: "quickgame" | "ranked" | "friend"}, // Type of the game
        players: {
            type: [{
                token: {type: String},
                name: {type: String},
                elo: {type: Boolean},
                answered: {type: Boolean, default: false},
                correct: {type: Boolean, default: false},
                ready: {type: Boolean, default: false},
                continue: {type: Boolean, default: false},
                // ...
            }],
            default: []
        },
        started: {type: Boolean, default: false}, // If the game has started
        over: {type: Boolean, default: false}, // If the game is over
        status: {type: Boolean, default: 0}, 
        // 0: The game hasnt started
        // 1: The game is alive
        // 2: Tie and people have to chose to start or to continue
        // 3: Game is over
        created: {type: Date, default: new Date()}, // When the game was created
        turn: {type: Number, default: -1}, // Current turn of the game
        maxTurn: {type: Number, default: 40}, // The maximum amount of turn
        historyQuestions: {
            type: [{
                type: {type: String, value: "name" | "flag"},
                question: {type: String},
                answers: {type: [String]}, // All possible answers
                correct: {type: Number}, // Index of correct answer
            }]
        },
        waitingPlayers: {type: [String]/*Array of name*/, default: []},
    }
)



/**
 * Users
 */
const users = new Schema(
    {
        name: {type: String},
        email: {type: String},
        bio: {type: String, default: "-"},
        country: {type: String},
        pfp: {type: String},
        banner: {type: String | Boolean, default: false},
        elo: {type: Number, default: 1200},
        maxElo: {type: Number, default: 1200},
        coins: {type: Number, default: 1000},
        friends: {type: [ObjectID], default: []},
        token: {type: String},
        wins: {type: Number, default: 0},
        nbGames: {type: Number, default: 0},
        blockedUsers: {type: [ObjectID], default: []},
        flags: {type: [String], default: []},
        chat: {type: [String], default: []},
        pfpGif: {type: Boolean, default: false},
        bannerGif: {type: Boolean, default: false},
        lastChangeName: {type: Date, default: new Date("1970")},
        lastChangeCountry: {type: Date, default: new Date("1970")},
        lastChangePfp: {type: Date, default: new Date("1970")},
        lastChangeBanner: {type: Date, default: new Date("1970")},
        lastChangeBio: {type: Date, default: new Date("1970")},
        created: {type: Date, default: new Date()},
    }
)


/**
 * Article
 */
const article = new Schema(
    {
        type: {type: String, value: "flag" | "chat" | "advantage"},
        name: {type: String},
        price: {type: Number, default: 1_000},
    }
)


/**
 * Daily
 */
const daily = new Schema(
    {
        expireDate: {type: Date},
        chat: {type: String},
        flag: {type: String},
        leaderboard: {},
        updating: {type: Boolean, default: false},
    }
)


/**
 * Notification
 */
const notification = new Schema(
    {
        creation: { type: Date, default: new Date()},
        image: { type: String, default: "https://www.flagfight.world/img.png" },
        flag: {type: String, default: "xx" },
        title: { type: String },
        description: { type: String },
        from: { type: ObjectID },
        to: { type: [ObjectID] }
    }
)


/**
 * Report
 */
const report = new Schema(
    {
        reportDate: { type: Date, default: new Date()},
        type: { type: String },
        description: { type: String },
        from: { type: ObjectID },
        reported: { type: ObjectID }
    }
)


/**
 * tempUser
 */
const tempUser = new Schema(
    {
        email: { type: String },
        pwd: { type: String }, // Password is already encrypted
        name: { type: String },
        verifCode: { type: String },
        created: { type: Date, default: new Date() }
    }
)