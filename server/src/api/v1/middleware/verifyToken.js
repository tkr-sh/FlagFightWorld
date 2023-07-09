import { db } from '../../../config/initDB.js';

/**
 * @brief Verify the validity of the token
 * 
 * @param {String} token
 * The token of the user
 * @returns {Boolean} isTokenValid
 */
export const tokenValidity = async (token) => {
    return await db.collection("users").findOne({token: token}) !== null;
}

/**
 * @brief The middleware that verify the validity of a token.
 * 
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * 
 * @returns 
 */
export const verifyToken = async (req, res, next) => {

    // If it's an options request
    if (req.method === "OPTIONS") {
        console.log("OPTIONS");
        next()
        // return;

        return;
    }

    console.log(req.body)

    const auth = req.headers.authorization;

    // If there isnt the authorization header
    if (auth === undefined) {
        return res.status(400).json({ err: 'No token found' });
    }

    // Get the token from the headers of the request
    const [typeAuth, token] = req.headers.authorization.split` `;

    const validity = await tokenValidity(token);

    console.log(token, typeAuth)

    // Check the token's validity using the tokenValidity function 
    if (!validity) {
        // If the token is not valid, return a 401 error with a message
        return res.status(401).json({ err: 'Invalid token' });
    } else {
        req.token = token;
    }

    next();
}










