const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstname:{
        type:String,
        required:true,
        minlength:3,
        maxlength:20
    },
    lastname:{
        type:String,
        minlength:3,
        maxlength:20
    },
    age:{
        type:Number,
        min:15,
        max:80
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }]
    },
    password:{
        type:String,
        required: true
    }

},{timestamps:true});

const User = mongoose.model("user", userSchema);

module.exports = User;