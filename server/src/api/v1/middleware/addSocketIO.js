export default (req, res, next) => {
    req.io = req.app.get('socketio');
    next();
}