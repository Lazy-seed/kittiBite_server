import { Router } from "express";
import { Login, Signup, logout, updateProfile, userInfo, verifyCode, getUsers, defaultProfileImages } from "../controller/UserController.js";
import { Auth } from "../middleware/Auth.js";
import { acceptFriend, deleteRequest, getFriends, getFriendsWithChat, pendingFriends, rejectFriend, requestFriend } from "../controller/FriendsController.js";
import { getFrndChats } from "../controller/MessagesController.js";

export const route = Router()

route.post('/signup', Signup)
route.post('/login', Login)
route.post('/verifyCode', verifyCode)
route.post('/updateProfile',Auth, updateProfile)
route.get('/userInfo',Auth, userInfo)
route.get('/logout', logout)
route.get('/getUsers',Auth, getUsers)
route.get('/defaultProfileImages', defaultProfileImages)


// frnds
route.get('/getFriends',Auth, getFriends)
route.get('/pendingFriends',Auth, pendingFriends)
route.get('/acceptFriend/:ID',Auth, acceptFriend)
route.get('/requestFriend/:ID',Auth, requestFriend)
route.delete('/rejectFriend/:ID',Auth, rejectFriend)
route.get('/deleteRequest/:ID',Auth, deleteRequest)

// chats
route.get('/getFriendsWithChat',Auth, getFriendsWithChat)
route.get('/getFrndChats/:ID',Auth, getFrndChats)
