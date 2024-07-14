import mongoose from 'mongoose'

const userScheme = new mongoose.Schema({
    first_name: {
        type: String,
        default:null
    },
    last_name: {
        type: String,
        default:null
    },
    description: {
        type: String,
        default:null
    },
    email: {
        type: String,
        required: [true, "Required Email"]
    },
    email_verify: {
        type: Boolean,
        default:false
    },
    verify_code: {
        type: Number,
        default:null
    },
    phone: {
        type: String,
        default:null
    },
    password: {
        type: String,
        required: [true, "Required Password"]
    },
    profile_pic: {
        type: String,
        default: ""
    },
    birthDate: {
        type: Date,
        default: ""
    },
    friends: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ]
},{
    timestamps:true
})

const userModel = mongoose.model("Users", userScheme)
export default userModel