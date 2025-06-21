const express=require("express");
const bcrypt=require("bcrypt");
const User = require("../models/user");
const validator=require("validator");
const { validateSignUpData } = require("../utils/validation");

const authRouter=express.Router();



authRouter.post("/signup",async(req,res)=>{
 
  try{

    validateSignUpData(req);

    const {firstName,lastName,emailId, password,age,gender,about,skills,photoUrl}=req.body;

    //Encrypt the password
    const passwordHash= await bcrypt.hash(password,10);

    
    //creating a new instance of a User model
    const user = new User({
        firstName,
        lastName,
        emailId,
        password:passwordHash,
        age,
        gender,
        photoUrl,
        about,
        skills,
    });
    
        
       const savedUser  =await user.save();
       const token= await savedUser.getJWT();
            

            res.cookie("token",token,{
                expires:new Date(Date.now()+8*3600000),
            });
         res.json({message:"Data has been saved...",data:savedUser})
    }catch(err){
        res.status(400).send("ERROR : "+err.message)
    }

})

authRouter.post("/login",async(req,res)=>{

    try{

        const {emailId,password}=req.body;

         if(!validator.isEmail(emailId)){
            throw new Error("Enter correct email")
        }

        const user =await User.findOne({emailId:emailId});
        if(!user){
            throw new Error("Invaild Credentials");
        }


        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid){

            //create a JWT token

            //Add the token to cookie and send the response back to the user
            const token= await user.getJWT();
            

            res.cookie("token",token,{
                expires:new Date(Date.now()+8*3600000),
            });
            res.send(user);
        }else{
            throw new Error("Invaild Credentials");
        }


    }
    catch(err){
        res.status(404).send("ERROR : "+err.message);
     }
})

authRouter.post("/logout",async(req,res)=>{
    //for big projects we can aslo write cleanup things here

    
    res.cookie("token",null,{
        expires:new Date(Date.now())
    });
    res.send("Logout Successfull !!!!")
})


module.exports=authRouter;