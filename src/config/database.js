const mongoose=require("mongoose");

const connectDB= async()=>{
    await mongoose.connect("mongodb+srv://UserName:Passwordcluster0.pkv06.mongodb.net/devTinder")
}

module.exports= connectDB;
