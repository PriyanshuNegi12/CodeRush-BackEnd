const client = require("../config/Redis");
const Submission = require("../models/submission");
const User = require("../models/user");
const validate = require("../utils/validate");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOTP, validateOTP } = require("../utils/gmailOTP");


const userRegister = async (req,res)=>{
    try {
        validate(req.body);

        if (!Object.keys(req.body).includes("otp")) {

            const otp = await generateOTP(req.body);
            await client.set(`OTP:${req.body.emailId}`, otp);
            await client.expireAt(`OTP:${req.body.emailId}`, Math.floor(Date.now()/1000)+300);

            return res.status(200).json({
                message: "OTP sent to your email"
            });
            return;
        }
        if (!await validateOTP(req.body)) {
            throw new Error("Invalid OTP");
        }


        req.body.password = await bcrypt.hash(req.body.password, 10);
        req.body.role = 'user';
        const user = await User.create(req.body);
        const token = jwt.sign({_id:user._id, emailId:user.emailId, role:user.role}, process.env.JWT_KEY, {expiresIn:60*60});
        const reply = {
            firstname:user.firstname,
            emailId:user.emailId,
            _id:user._id,
            role:user.role
        }
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Login Successfully"
        })

    } catch (err) {
        res.status(400).send("Error:  "+err);
    }

}

const userLogin = async (req,res)=>{
    try {
        const {emailId, password} = req.body;
        if(!emailId) throw new Error("Invalid Credentials");
        if(!password) throw new Error("Invalid Credentials");
        const user = await User.findOne({emailId});
        if(!user) throw new Error("Invalid Credentials");
        const match = await bcrypt.compare(password,user.password);
        if(!match) throw new Error("Invalid Credentials");
        const reply = {
            firstname:user.firstname,
            emailId:user.emailId,
            _id:user._id,
            role:user.role
        }
        const token = jwt.sign({_id:user._id ,role:user.role, emailId:emailId}, process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(200).json({
            user:reply,
            message:"Login Successfully"
        })

    } catch (err) {
        res.status(401).send("Error: "+err);
    }
}

const userLogout = async (req, res)=>{
    try {
        const {token} = req.cookies;
        const payload = jwt.decode(token);
        await client.set(`token:${token}`, 'blocked');
        await client.expireAt(`token:${token}`, payload.exp);
        res.cookie("token", "" , {expires: new Date(Date.now())});
        res.send("Logged Out Successfull");
        
    } catch (err) {
        res.status(401).send("Error:  "+err);
    }
}

const adminRegister = async (req,res) => {
    try {
        validate(req.body);
        if (!Object.keys(req.body).includes("otp")) {

            const otp = await generateOTP(req.body);
            await client.set(`OTP:${req.body.emailId}`, otp);
            await client.expireAt(`OTP:${req.body.emailId}`, Math.floor(Date.now()/1000)+300);

            return res.status(200).json({
                message: "OTP sent to your email"
            });
            return;
        }
        if (!await validateOTP(req.body)) {
            throw new Error("Invalid OTP");
        }
        const {firstName, emailId, role, password} = req.body;
        req.body.password = await bcrypt.hash(password,10);
        const user = await User.create(req.body);
        res.status(201).send("User Registered Successfully")
    } catch (err) {
        res.status(400).send("Error: "+err);
    }
}

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        await User.findByIdAndDelete(userId);
        await Submission.deleteMany({userId});
        res.status(200).send("Account Deleted");
    } catch (err) {
        res.status(404).send("Error: "+err)
    }
}

module.exports = {userRegister, userLogin, userLogout, adminRegister, deleteProfile};