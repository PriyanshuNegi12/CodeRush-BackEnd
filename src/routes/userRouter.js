const express = require('express');
const { userRegister, userLogin, userLogout, adminRegister, deleteProfile } = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const userRouter = express.Router();

userRouter.post("/register",userRegister);
userRouter.post("/login", userLogin);
userRouter.post("/logout", userMiddleware, userLogout);
userRouter.post("/admin/register", adminMiddleware, adminRegister);
userRouter.delete('/deleteProfile',userMiddleware, deleteProfile);
userRouter.get('/check',userMiddleware,(req,res)=>{

    const reply = {
        firstname: req.result.firstname,
        emailId: req.result.emailId,
        _id:req.result._id,
        role:req.result.role,
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})

module.exports = userRouter;