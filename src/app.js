const express=require("express")
require("dotenv").config();


const connectDB =require("./config/database")
const PORT = process.env.PORT || 3000;

const app=express();

const cookieparser=require("cookie-parser");
const cors=require("cors")
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());
app.use(cookieparser());

// ❌ Wrong
// app.use("/", profileRouter);

// ✅ Correct
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);





connectDB().then(()=>{
    console.log("Database connection established...");
app.listen(PORT, () => {
  console.log("server is running on " + PORT);
});
}).catch(err=>{
    console.error("Database cannot be connected")
})
 
