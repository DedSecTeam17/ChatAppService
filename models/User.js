
const  mongoose=require('mongoose');
const  timestamp=require('mongoose-timestamp');
const  bcrypt=require('bcryptjs');
// const jwt=require('jsonwebtoken');
// const  restify_jwt=require('restify-jwt-community');


var  userSchema=new mongoose.Schema({
    email:{type: String,required: true,email: true},
    password:{type:String,required:true}
});

userSchema.plugin(timestamp);



var  userModule=mongoose.model("User",userSchema);
// expert the model

module.exports=userModule;