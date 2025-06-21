const mongoose=require("mongoose");

const connectionRequestSchema=new mongoose.Schema({

    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",  //referance to the user collection
        require:true,
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    status:{
        type:String,
        enum:{
            values:["ignored","interested","accepted","rejected"],
            message:`{VALUE} is incorrect status type`
        },
        require:true,
    },
    
},
    {
        timestamps:true  }
);

connectionRequestSchema.index({fromUserId:1,toUserId:1  });

connectionRequestSchema.pre("save",function(next){
    const connectionRequest=this;
    //check if fromuserid and touserid are same 
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send connection request to yourself!");
    }
    next();
})
const connectionRequestModel=new mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports=connectionRequestModel;