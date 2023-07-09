import { db } from '../../../config/initDB.js';

/**
 * @brief Update the last activity of the user
 * 
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * 
 * @returns 
 */
export const updateActivity = async (req, res, next) => {

    await db.collection("users").updateOne({token: req.token}, {$set: {lastActivity: new Date()}});
    next();
}