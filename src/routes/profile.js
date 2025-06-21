const express=require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const profileRouter=express.Router();


profileRouter.get("/profile/view",userAuth,async(req,res)=>{

    try{ 
        const user=req.user;
        res.send(user);
    }catch(err){
        res.status(404).send("ERROR : "+err.message);
    }

});

profileRouter.patch("/profile/edit",userAuth, async(req,res)=> {
    try{
        if(!validateEditProfileData(req)){
            throw new Error("Invaild Edit Request");
        }

        const loggedInUser=req.user;
        console.log(loggedInUser);

        Object.keys(req.body).forEach((key)=>(loggedInUser[key]=req.body[key]));
        await loggedInUser.save();
        res.send(`${loggedInUser.firstName}, your profile updated successfuly `);
    }
    catch(err){
        res.status(400).send("ERROR : "+err.message);
    }
});



profileRouter.post("/profile/password", userAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = req.user;

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send("Old password is incorrect.");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
        
        res.send("Password changed successfully.");
    } catch (err) {
        res.status(500).send("ERROR: " + err.message);
    }
});


module.exports=profileRouter;