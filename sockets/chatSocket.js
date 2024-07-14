import { messageModel, payloadModel } from '../models/MessageModel.js';
import userModel from '../models/UserModel.js';

const chatSocket = (io) => {
    const users = new Map();

    io.on('connection', async (socket) => {
        const username = socket.handshake.query.username;
        console.log('A user connected:', socket.id);
        console.log(username);
        
        try {
            const user = await userModel.findOne({ _id: username });
            if (user) {
                // Initialize user data with socket ID, user ID, and chat open status
                users.set(username, { socketId: socket.id, userId: user._id, isChatOpen: false });
                console.log('User registered:', user.email, socket.id);
            } else {
                console.log('User not found:', username);
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }

        socket.on('newMessage', async ({ recipient, message }) => {
            const sender = username;
            const recipientData = users.get(recipient);
            const senderData = users.get(sender);

            if (recipientData && senderData) {
                try {
                    if (io.sockets.sockets.get(recipientData.socketId)) {
                        io.to(recipientData.socketId).emit('newMessage', {
                            sender: senderData.userId,
                            message,
                        });
                        console.log(`Message from ${sender} to ${recipient}: ${message}`);
                        
                        // Update read timestamp if recipient has the chat open
                        if (recipientData.isChatOpen) {
                            const payloadData = {
                                text: message,
                                sent: new Date().toISOString(),
                                read: new Date().toISOString() // Set read timestamp
                            };
                            const payload = new payloadModel(payloadData);
                            await payload.save();
                            
                            const msg = new messageModel({
                                sender_id: senderData.userId,
                                receiver_id: recipient,
                                content: payload._id,
                            });
                            await msg.save();
                        } else {
                            // Save without read timestamp
                            const payloadData = {
                                text: message,
                                sent: new Date().toISOString(),
                            };
                            const payload = new payloadModel(payloadData);
                            await payload.save();
                            
                            const msg = new messageModel({
                                sender_id: senderData.userId,
                                receiver_id: recipient,
                                content: payload._id,
                            });
                            await msg.save();
                        }
                    } else {
                        console.log(`Recipient socket ID not found: ${recipientData.socketId}`);
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            } else {
                if (!recipientData) console.log('Recipient not found or not connected:', recipient);
                if (!senderData) console.log('Sender not found:', sender);
            }
        });

        socket.on('userTyping', ({ recipient, typing }) => {
            const recipientData = users.get(recipient);
            if (recipientData) {
                io.to(recipientData.socketId).emit('userTyping', {
                    sender: username,
                    typing
                });
                console.log(`User ${username} is typing to ${recipient}: ${typing}`);
                
                // Update user's chat open status
                recipientData.isChatOpen = typing; // Update chat open status
            } else {
                console.log(`Recipient not found or not connected: ${recipient}`);
            }
        });

        socket.on('disconnect', () => {
            for (const [username, userData] of users.entries()) {
                if (userData.socketId === socket.id) {
                    users.delete(username);
                    console.log('User disconnected:', username);
                    break;
                }
            }
        });
    });
};

export default chatSocket;
