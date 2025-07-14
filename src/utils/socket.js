const socket= require("socket.io");
const crypto=require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId,targetUserId)=>{
    return crypto
    .createHash("sha256")
    .update([userId,targetUserId].sort().join("_"))
    .digest("hex");
}

const initializeSocket=(server)=>{
    const io =socket(server,{
        cors:{
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });
        io.on("connection", (socket)=>{
            //handle events

                socket.on("joinChat",({firstName,userId,targetUserId})=>{

                    const roomId=getSecretRoomId(userId,targetUserId);
                    console.log(firstName+" joined room: "+roomId)
                    socket.join(roomId);




                })
                    socket.on("sendMessage", async({ firstName, userId, targetUserId, text }) => {
                    
                        //Save messages to the database
                        try {
                            const roomId = getSecretRoomId(userId,targetUserId);
                            let chat= await Chat.findOne({
                                participants:{$all:[userId,targetUserId]},
                            })

                            if(!chat){
                                chat =new Chat({
                                    participants:[userId,targetUserId],
                                    messages:[]
                                })
                            }
                            chat.messages.push({
                                senderId:userId,
                                text,
                            })
                            await chat.save();
                            io.to(roomId).emit("messageReceived", {
                            firstName,
                            senderId: userId,
                            text,
                            });
                        } catch (err) {
                            console.log(err);
                        }
                    
                    });

                socket.on("disconnect",()=>{});
   
        });
}
module.exports =initializeSocket;