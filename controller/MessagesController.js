import mongoose from "mongoose";
import { messageModel, payloadModel } from "../models/MessageModel.js";

export const getFrndChats = async (req, res) => {
    try {
        const FrndID = req.params.ID;
        const userID = req.userID;

        // Validate input
        if (!mongoose.Types.ObjectId.isValid(FrndID) || !mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({
                success: false,
                msg: "Invalid user ID or friend ID"
            });
        }

        // Find messages where the logged-in user is either the sender or receiver
        const chats = await messageModel.find({
            $or: [
                { sender_id: userID, receiver_id: FrndID },
                { sender_id: FrndID, receiver_id: userID }
            ]
        })
            .populate('content') // Populate the content field with message payloads
            .exec();


               // Update the 'read' status of unread messages sent by the friend
               for (const elm of chats) {
                if (elm?.sender_id?.toString() === FrndID && elm?.content?.read === '') {
                    await payloadModel.findOneAndUpdate(
                        { _id: elm.content._id },
                        { $set: { read: new Date().toISOString() } }
                    );
                }
            }
      

        if (!chats || chats.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "No chats found between the specified users"
            });
        }

        return res.json({
            success: true,
            chats
        });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
};
