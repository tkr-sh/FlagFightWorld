/**
 * @brief A personnalised CORS middleware
 * 
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * 
 * @returns 
 */
export const corsMiddleware = async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Custom-Header');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Expose-Headers', 'Authorization, Content-Type');
    next();
}
