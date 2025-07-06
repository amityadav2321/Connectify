const mongoose=require("mongoose");

const connectDB= async()=>{
    await mongoose.connect("mongodb+srv://amit_yadav2005:amityadav2005@cluster0.pkv06.mongodb.net/devTinder")
}

module.exports= connectDB;
