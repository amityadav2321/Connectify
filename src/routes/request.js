const express=require("express");
const { userAuth } = require("../middlewares/auth");
const requestRouter=express.Router();
const ConnectionRequest=require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{

    try{
        const fromUserId=req.user._id;
        const toUserId=req.params.toUserId;
        const status=req.params.status;
        const allowedStatus=["interested","ignored"];

        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                message:"Invalid Status type: "+status
            });
        }

        

       // touser is in out db or not 
        const toUser=await User.findById(toUserId);
        if(!toUser){
            return res.status(400).json({
                message:"User not found"
            });
        }

 //If there is existing connectionRequest
        const existingConnectionRequest=await ConnectionRequest.findOne({
            $or:[
                {fromUserId,toUserId},
                {fromUserId:toUserId,toUserId:fromUserId}
            ]
           
        });
        if(existingConnectionRequest){
            return res.status(400).json({
                message:"Connection Request Already Exists!"
            });
        }



        const connectionRequest=new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });
        const data = await connectionRequest.save();
        let message;

switch (status) {
  case "interested":
    message = `${req.user.firstName} is interested in ${toUser.firstName}`;
    break;
  case "ignored":
    message = `${req.user.firstName} ignored ${toUser.firstName}`;
    break;
  default:
    message = `${req.user.firstName} performed '${status}' on ${toUser.firstName}`;
}

res.json({
  message,
  data,
});


    }catch(err){
        res.status(404).send("ERROR: "+ err.message);
    }

})

requestRouter.post("/request/review/:status/:requestId",userAuth, async (req,res)=>{
    try {
            const {  status, requestId}=req.params;
            const loggedUser=req.user;
            const allowedStatus=["accepted","rejected"];
            if(!allowedStatus.includes(status)){
                return res.status(400).json({
                    message:"Status is not allowed!"
                })
            }

            const connectionRequest=await ConnectionRequest.findOne({
                _id:requestId,
                toUserId:loggedUser._id,
                status:"interested",
            })
            if(!connectionRequest){
                return res.status(404).json({
                    message:"Connection request not found"
            })
            }
            connectionRequest.status=status;

            const data = await connectionRequest.save();
            res.json({
                message:"Connection request: "+status,
                data
            })

    } catch (err) {
        res.status(400).send("ERROR: "+err.message); 
    }
})

module.exports=requestRouter;