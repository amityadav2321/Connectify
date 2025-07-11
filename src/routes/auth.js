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
       html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="background-color: #4f46e5; padding: 30px; text-align: center; color: #fff;">
        <h1 style="margin: 0;">🎉 Welcome to Connectify!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="margin-top: 0;">Hi ${firstName},</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          We're thrilled to have you join <strong>Connectify</strong> — your community of creators, developers, and collaborators.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Whether you're here to showcase your skills, find teammates, or simply explore inspiring profiles, you're in the right place.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://getconnectify.vercel.app" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>
        <p style="font-size: 14px; color: #888;">
          Need help or have questions? Just hit reply — we're here for you.
        </p>
        <p style="font-size: 14px; color: #888;">
          – The Connectify Team 💙
        </p>
      </div>
    </div>
  </div>
`
,
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
                html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f8fa; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <div style="background-color: #4f46e5; padding: 20px; color: white; text-align: center;">
        <h2 style="margin: 0;">🔐 Login Alert</h2>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 18px;">Hi <strong>${user.firstName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">
          We noticed a login to your <strong>Connectify</strong> account just now.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          If this was <strong>you</strong>, no action is needed. Just letting you know!
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #e11d48;">
          If this <strong>wasn't you</strong>, we strongly recommend you reset your password immediately to secure your account.
        </p>
        <p style="font-size: 14px; color: #888;">Stay safe,<br/>The Connectify Team 💙</p>
      </div>
    </div>
  </div>
`
,
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