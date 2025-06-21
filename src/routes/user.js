const express=require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter=express.Router();
const ConnectionRequest=require("../models/connectionRequest");
const { set } = require("mongoose");
const User = require("../models/user");
const USER_SAFE="firstName lastName age about photoUrl gender skills";

//get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received",userAuth,async(req,res)=>{
     
    try{

       
        
    const loggedInUser=req.user;
    const connectionRequests=await ConnectionRequest.find({
        toUserId:loggedInUser._id,
        status:"interested",
    }).populate("fromUserId", USER_SAFE);



    res.json({
        message:"Data fetch successfully!",
        data:connectionRequests,
    })

    }
    catch(err){
        res.status(400).send("ERROR: "+err.message);
    }
    
    
    
  
});

userRouter.get("/user/connections",userAuth,async(req,res)=>{
    try {
        
        const loggedUserId=req.user;

        const connection=await ConnectionRequest.find({
            $or:[
                {toUserId:loggedUserId._id,status:"accepted"},
                {fromUserId:loggedUserId._id,status:"accepted"}
            ]
        })
        .populate("fromUserId",USER_SAFE)
        .populate("toUserId",USER_SAFE);

        const data=connection.map((row)=>{
            if(row.fromUserId._id.toString()===loggedUserId._id.toString()){
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({data})


    } catch (err) {
        res.status(404).send("ERROR: "+err.message);
    }
})

userRouter.get("/feed",userAuth,async(req,res)=>{

    try {

        //user should see all the user cards except
        //0. his own card 
        //1. his connections accepted or rejected 
        //2. the card he alread mark interested or ignore

        const loggedInUser=req.user;
        const page=parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit) || 10;
        limit= limit > 50 ? 50 : limit ;
        const skip=(page-1)*limit;
        //find all connection request (sent+received)
        const connectionRequest=await ConnectionRequest.find({
            $or:[
                {fromUserId:loggedInUser._id},
                {toUserId:loggedInUser._id}
            ]
        }).select("fromUserId  toUserId");

        const hideUserFromFeed= new Set();
        connectionRequest.forEach(req=>{
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        })

        const users= await User.find({
            $and:[
                {_id: {$nin:Array.from(hideUserFromFeed)}},
                {_id: {$ne:loggedInUser._id}}
            ]
            
        }).select(USER_SAFE).skip(skip).limit(limit);




        res.json({users})






    } catch (err) {
        res.status(400).send("ERROR: "+err.message);
    }

})

module.exports=userRouter;