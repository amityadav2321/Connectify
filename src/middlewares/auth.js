const jwt=require("jsonwebtoken");
const User = require("../models/user");
const { Error } = require("mongoose");

const userAuth=async(req,res,next)=>{

    //read the token from the request cookies
 try{
    const cookies=req.cookies;

    const {token}=cookies;

    if(!token){
        return res.status(401).send("Please Login!")
    }

     // validate the cookies
    const decodedObj= await jwt.verify(token,"DEV@Tinder$790");

    const {_id} =decodedObj;
    
    //find the user

    const user= await User.findById(_id);

    if(!user){
        throw new Error("User not found ");
    }
   
    req.user=user;
    next();
 }  
 catch(err){
        res.status(400).send("ERROR : "+err.message);
     } 
    

};

module.exports={
    userAuth,
}