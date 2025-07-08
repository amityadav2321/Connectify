const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    // }).populate("fromUserId", ["firstName", "lastName"]);

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    req.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

const { Types } = require("mongoose");

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id.toString();

    // Fetch connection requests involving this user
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: Types.ObjectId(loggedInUserId) },
        { toUserId: Types.ObjectId(loggedInUserId) }
      ],
    }).select("fromUserId toUserId");

    // Build a set of users to exclude
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((request) => {
      hideUsersFromFeed.add(request.fromUserId.toString());
      hideUsersFromFeed.add(request.toUserId.toString());
    });

    hideUsersFromFeed.add(loggedInUserId); // also exclude self

    // Fetch users not in connection list and not self
    const users = await User.find({
      _id: { $nin: Array.from(hideUsersFromFeed).map(id => Types.ObjectId(id)) }
    }).select(USER_SAFE_DATA);

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});


module.exports = userRouter;