import jwt from 'jsonwebtoken'
import userModel from '../models/UserModel.js'
export const Auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwtoken
        if (!token) {
            return res.json({
                status: false,
                msg: "No token provided"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const rootuser = await userModel.findById(decoded._id).select('-password')
        if (!rootuser) { throw new Error('user not foind') };
        // console.log(rootuser);
        req.token = token
        req.rootuser = rootuser
        req.userID = rootuser._id
        next()
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: "user not loggin",
            error: error.message
        })
    }

}