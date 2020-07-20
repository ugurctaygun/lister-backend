const jwt = require('jsonwebtoken');
const config = require('config');

//next is the argument for middleware function
module.exports = function(req,res,next) {
    //Get token from header
    const token = req.header('x-auth-token');
    //Check if there is token
    if(!token) {
        return res.status(400).json({msg: 'No Token, authorization denied'}); 
    }
    //Verify Token
    try {
        const decoded = jwt.verify(token,config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({msg: 'Token is not valid'});
    }
}