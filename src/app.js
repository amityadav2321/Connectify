const express = require("express");
const path = require("path");

const env = process.env.NODE_ENV || 'local';
require("dotenv").config({ path: path.resolve(__dirname, `../.env.${env}`) });
const connectDB = require("./config/database");
const app = express();
const PORT = process.env.PORT || 3000; // ✅ Declare it here after dotenv
const cookieparser = require("cookie-parser");
const cors = require("cors");
const http=require("http")

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());
app.use(cookieparser());

// Routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/",chatRouter)


const server=http.createServer(app)

initializeSocket(server);

// Connect DB and start server
connectDB()
  .then(() => {
    console.log("Database connection established...");
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" Database connection failed:", err);
  });
