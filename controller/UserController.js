import FriendsModel from "../models/FriendsModel.js"
import DefaultImagesSchem from "../models/DefaultImagesModel.js"
import userModel from "../models/UserModel.js"
import jwt from 'jsonwebtoken'
export const Signup = async (req, res) => {
    const { email, password } = req.body
    const isExist = await userModel.findOne({ email })
    if (isExist) {
        return res.json({
            success: false,
            msg: "User Exist!"
        })
    } else {
        const newUser = await userModel.create({ email, password })
        res.json({
            success: true,
            msg: "User saved!",
            newUser
        })
    }
}

export const updateProfile = async (req, res) => {
    const { first_name, last_name, profile_pic, birthDate, description } = req.body
    const email = req.rootuser.email
    const isExist = await userModel.findOne({ email })
    if (!isExist) {
        return res.status(404).json({
            success: false,
            msg: "User not found!"
        })
    }

    const newUser = await userModel.findOneAndUpdate({ email }, { first_name, last_name, profile_pic, birthDate, description }, { new: true })
    res.json({
        success: true,
        msg: "User saved!",
        newUser
    })

}

export const Login = async (req, res) => {
    const { email, password } = req.body

    const isExist = await userModel.findOne({ email })
    if (!isExist) {
        return res.json({
            success: false,
            msg: "User not exist!"
        })
    }
    if (password != isExist?.password) {
        return res.json({
            success: false,
            msg: "Invalid Credentials!"
        })
    }
    if (!isExist?.email_verify) {
        return res.json({
            success: true,
            emailVerify: false,
            msg: "Email is not Verified!"
        })
    }

    const jwtData = jwt.sign({ _id: isExist._id }, process.env.JWT_KEY)
    res.cookie("jwtoken", jwtData, { http: true, secure: true, sameSite: 'none', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
    return res.json({
        success: true,
        emailVerify: true,
        msg: "Login success!",
        user: isExist
    })
}

export const verifyCode = async (req, res) => {
    const { code, email } = req.body
    const dummyCode = 32132
    const user = await userModel.findOne({ email })
    if (!user) {
        res.status(404).json({
            success: false,
            msg: "User not exist1"
        })
    }
    if (dummyCode !== code) {
        res.status(401).json({
            success: false,
            msg: "Invalid Code"
        })
    }
    if (dummyCode === code) {

        user.email_verify = true
        user.save()
        const jwtData = jwt.sign({ _id: user._id }, process.env.JWT_KEY)
        res.cookie("jwtoken", jwtData, { http: true, secure: true, sameSite: 'none', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })

        res.status(200).json({
            success: true,
            user,
            msg: "Email Verified!"
        })
    }

}

export const userInfo = async (req, res) => {
    try {
        const token = req.cookies.jwtoken
        if (!token) {
            return res.json({
                success: false,
                msg: "No token provided"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const user = await userModel.findById(decoded._id).select('-password')
        if (!user) {
            return res.json({
                success: false,
                msg: "User not found"
            })
        }

        res.json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error fetching user info",
            error: error.message
        })
    }
}
export const logout = async (req, res) => {
    try {
        res.cookie("jwtoken", "", { httpOnly: true, secure: true })

        res.json({
            success: true,
            msg: "Logout"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error ",
            error: error.message
        })
    }
}



export const getUsers = async (req, res) => {
    const userID = req.userID
    const rootFriends = req.rootuser.friends
    const reqSnd = await FriendsModel.find({
        requester :userID
    }, 'recipient')
    const reqSendList = reqSnd.map((elm) => elm.recipient)
    console.log(rootFriends)
    const allusers = await userModel.find({ _id: { $nin: [userID, ...rootFriends] } })
    res.status(200).json({
        success: true,
        allusers,
        reqSendList
    })
}

export const defaultProfileImages = async (req, res) => {
    const result = await DefaultImagesSchem.find()
    if (!result) {
        res.status(404).json({
            success: false,
            msg: "No images found"
        })
    }
    res.status(200).json({
        success: true,
        result
    })
}

