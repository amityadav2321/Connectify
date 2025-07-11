const express=require("express");
const bcrypt=require("bcrypt");
const User = require("../models/user");
const validator=require("validator");
const { validateSignUpData } = require("../utils/validation");
const sendMail = require('../utils/resend');
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
            

         res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + 8 * 3600000), // 8 hours
        });
        
        await sendMail({
        to: emailId,
        subject: "Welcome to Connectify 🎉",
        html: `<h2>Hi ${firstName},</h2><p>Thanks for signing up with Connectify!</p>`,
    });

res.json({ message: "Signup successful and email sent!", data: savedUser });
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
            

                res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                expires: new Date(Date.now() + 8 * 3600000), // 8 hours
                });

                await sendMail({
                to: emailId,
                subject: "Login Alert - Connectify",
                html: `<p>Hello ${user.firstName},</p>
               <p>You just logged into your Connectify account.</p>
               <p>If this wasn't you, please reset your password immediately.</p>`,
      });

            res.status(200).json({ message: "Login successful", user });
        }else{
            throw new Error("Invaild Credentials");
        }


    }
    catch(err){
        res.status(404).send("ERROR : "+err.message);
     }
})

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!");
});


module.exports=authRouter;