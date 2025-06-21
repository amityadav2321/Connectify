const express=require("express")

const connectDB =require("./config/database")

const app=express();

const cookieparser=require("cookie-parser");
const cors=require("cors")
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));
app.use(express.json());
app.use(cookieparser());

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);





connectDB().then(()=>{
    console.log("Database connection established...");
    app.listen(3000,()=>{
    console.log("server is running on 3000")
}); 
}).catch(err=>{
    console.error("Database cannot be connected")
})
 
