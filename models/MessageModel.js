import mongoose from 'mongoose'

const payloadScheme = new mongoose.Schema({
    text: {
        type: String,
        default: ""
    },
    msgType: {
        type: String,
        default: "TEXT"
    },
    mediaURL: {
        type: String,
        default: ""
    },
    sent: {
        type: String
    },
    read: {
        type: String,
        default: ""
    },
    failed: {
        type: String,
        default: ""
    },

},
    {
        timestamps: true
    })


const messageScheme = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Users"
    },
    receiver_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Users"
    },
    content: {
        type: mongoose.Schema.ObjectId,
        ref: "MessagePayload"
    },

}, {
    timestamps: true
})

const messageModel = mongoose.model("Message", messageScheme)
const payloadModel = mongoose.model("MessagePayload", payloadScheme)
export {messageModel, payloadModel}