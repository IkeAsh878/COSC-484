const HttpError = require("../models/errorModel");
const ConversationModel = require("../models/conversationModel");
const MessageModel = require("../models/messageModel");
const {getReceiverSocketId, io} = require("../socket/socket");



// --------- Message Creation ----------
// POST: api/messages/:receiverId
// Protected
const createMessage = async(req, res, next) => {
    try {
        const {receiverId} = req.params;
        const {messageText} = req.body;
        // check to see if conversation already exists
        let conversation = await ConversationModel.findOne({participants: {$all: [req.user.id, receiverId]}});
        // make new conversation if there are no conversation
        if(!conversation) {
            conversation = await ConversationModel.create({participants: [req.user.id, receiverId],
                lastMessage: {text: messageText, senderId: req.user.id}
            });
        }
        const newMessage = await MessageModel.create({conversationId: conversation._id, 
            senderId: req.user.id, text: messageText
        });
        await conversation.updateOne({lastMessage: {text: messageText, senderId: req.user.id}});

        // connect to socket.io so receiver can receive message in real time
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.json(newMessage);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Message Get ----------
// GET: api/messages/:receiverId
// Protected
const getMessages = async(req, res, next) => {
    try {
        const {receiverId} = req.params;
        const conversation = await ConversationModel.findOne({participants: {$all: [req.user.id, receiverId]}});
        if(!conversation) {
            return next(new HttpError("No Conversation", 404));
        }
        const messages = await MessageModel.find({conversationId: conversation._id}).sort({createdAt: -1});
        res.json(messages).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}


// --------- Conversation Get ----------
// GET: api/conversations
// Protected
const getConversations = async(req, res, next) => {
    try {
        let conversations = await ConversationModel.find({participants: req.user.id}).populate({
            path: "participants", select: "fullName profilePic"}).sort({createdAt: -1});
            // look through conversations to find if the participants id is
            // the same as the user id
        conversations.forEach((conversation) => {
            conversation.participants = conversation.participants.filter(
                (participant) => participant._id.toString() !== req.user.id.toString()
            );
        });
        res.json(conversations).status(200);
    } catch (error) {
        return next(new HttpError(error));
    }
}

module.exports = {createMessage, getMessages, getConversations};