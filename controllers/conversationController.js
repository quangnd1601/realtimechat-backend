const Conversation = require("../models/Conversation");
const Message = require("../models/Message");


const createConversation = async (req,res) => {
    try {
        const { type,name,memberIds} = req.body;
        const userId = req.user._id;

        if(!type || 
            (type === "group" && !name) || 
            !memberIds || 
            !Array.isArray(memberIds) ||
            memberIds.length === 0   
        ){
            return res.status(400).json({message : "Tên nhóm và danh sách thành viên là bắt buộc!"})
        }

        let conversation;
        const participantId = memberIds[0];
        if(type === "direct"){
            conversation = await Conversation.findOne({
                type: "direct",
                "participants.userId":  {$all : [userId, participantId]},
                lastMessage: new Date(),
            });
        }
        if(!conversation){
            conversation = new Conversation({
                type: "direct",
                participants: [
                    {userId},
                    {userId : participantId}
                ],
                lastMessage: new Date()
            });

            await conversation.save();
        }


        if(type === "group"){
            conversation = new Conversation({
                type: "group",
                participants: [
                    {userId}, ...memberIds.map((id)=> ({userId: id}))
                ],
                group: {
                    name,
                    createdBy: userId,
                },
                lastMessage: new Date()
            });
            await conversation.save();
        }

        if(!conversation){
            return res.status(400).json({message : "Conversation type không hợp lệ!"})
        }

        await conversation.populate([
            {path: 'participants.userId', select: "displayName avatarUrl"},
            {path: "seenBy", select : "displayName avatarUrl"},
            {path: "lastMessage.senderId", select: "displayName avatarUrl"}
        ]);

        return res.status(201).json({conversation})

    } catch (error) {
        console.error("Lỗi khi tạo Conversation",error);
        return res.status(500).json({message : "Lỗi hệ thống!"})
    }
}

const getConversation = async (req,res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({
            "participants.userId":  userId
        })
        .sort({lastMessageAt: -1, updateAt: -1})
        .populate({
            path: 'participants.userId',
            select: "displayName avatarUrl"
        })
        .populate({
            path: "lastMessage.senderId",
            select: "displayName avatarUrl"
        })
        .populate({
            path: "seenBy",
            select: "displayName avatarUrl"
        });
        
        const formatted = conversations.map((convo) => {
            const participants = (convo.participants || []).map((p) => ({
                _id: p.userId?._id,
                displayName: p.userId?.displayName,
                avatarUrl: p.userId?.avatarUrl ?? null,
                joinAt: p.joinedAt,
            }));
            return {
            ...convo.toObject(),
            unreadCounts: convo.unreadCounts || {},
            participants
        }
        });

        return res.status(200).json({conversation : formatted})

    } catch (error) {
        console.error("Lỗi khi tạo Conversation",error);
        return res.status(500).json({message : "Lỗi hệ thống!"})
    }
}

// tin nhắn
const getMessage = async (req,res) => {
    try {
        const {conversationId} = req.params;
        const {limit = 50, cursor} = req.query;

        const query = {conversationId};
        if(cursor){
            query.createdAt = { $lt: new Date(cursor)};   
        }
        let messages = await Message.find(query)
        .sort({createdAt: -1}) // tin mới trước
        .limit(Number(limit) + 1);

        let nextCursor = null;

        if(messages.length > Number(limit)){
            const nextMessage = messages[messages.length - 1];
            nextCursor = nextMessage.createdAt.toISOString();
            messages.pop();
        }
        messages = messages.reverse();

        return res.status(200).json({
            messages, nextCursor 
        })

    } catch (error) {
        console.error("Lỗi khi lấy danh sách messages", error);
        return res.status(500).json({message : "Lỗi hệ thống!"})
    }
}


module.exports = {
    createConversation,
    getConversation,
    getMessage,
}