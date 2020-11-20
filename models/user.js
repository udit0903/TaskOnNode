const mongoose=require('mongoose');
//user Schema
const UserSchema=mongoose.Schema({
        Name:{
                type:String,
        },
        Email:{
                type:String,
        },
        Contact_No:{
                type:String,
        },
        Gender:{
                type:String,
        },
        Hobbies:{
                type:String,
        },
        Image:{
                type:String,
        },
        State:{
                type:String,
        },
        City:{
                type:String,
        }
    },
    {versionKey: false // You should be aware of the outcome after set to false
});
const User= module.exports=mongoose.model('User', UserSchema );
