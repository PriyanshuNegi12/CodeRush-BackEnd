const client = require("../config/Redis");
const jwt = require('jsonwebtoken');
const User = require("../models/user");

const adminMiddleware = async (req,res,next) =>{
    try {
        const {token} = req.cookies;
        if(!token) throw new error("Invalid Cookie!!!!!!!!!");
        const payload = jwt.verify(token,process.env.JWT_KEY);
        const {_id} = payload;
        if(!_id) throw new Error("Invalid token");
        const user = await User.findById(_id);
        if(!user) throw new error("user Node Found!!!!!!!!!");
        if(user.role!='admin') throw new Error("User Doesn't Exists");
        const IsBlocked = await client.exists(`token:${token}`);
        if(IsBlocked) throw new Error("Invalid Token");
        req.result = user;
        next();
        
    } catch (err) {
        res.status(401).send("Error:  "+err);
    }
}
module.exports = adminMiddleware;