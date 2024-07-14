import FriendsModel from '../models/FriendsModel.js';
import FriendRequest from '../models/FriendsModel.js'
import { messageModel } from '../models/MessageModel.js';
import userModel from '../models/UserModel.js';

export const getFriends = async (req, res) => {
  try {
    // Find the user by ID
    const resultData = await userModel.findById(req.userID);

    if (!resultData) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Check if the user has any friends
    if (resultData.friends.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No friends found",
      });
    }

    // Fetch all friends details
    const allFriends = await Promise.all(
      resultData.friends.map(async (friendId) => {
        const friend = await userModel.findById(friendId);
        return friend;
      })
    );

    res.status(200).json({
      success: true,
      allFriends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
export const getFriendsWithChat = async (req, res) => {
  try {
    // Find the user by ID
    const resultData = await userModel.findById(req.userID);

    if (!resultData) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Check if the user has any friends
    if (!resultData.friends || resultData.friends.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No friends found",
      });
    }

    // Fetch all friends details along with the last message of each conversation
    const friendsWithLastMessage = await Promise.all(
      resultData.friends.map(async (friendId) => {
        const friend = await userModel.findById(friendId);

        if (!friend) {
          return null; // Skip if the friend does not exist
        }

        // Find the last message in the conversation between the logged-in user and the friend
        const lastMessage = await messageModel.findOne({
          $or: [
            { sender_id: req.userID, receiver_id: friendId },
            { sender_id: friendId, receiver_id: req.userID }
          ]
        }).sort({ createdAt: -1 }) // Sort by creation date in descending order
          .populate('content')
          .exec();



        const unReadMsg = await messageModel.find({ sender_id: friendId, receiver_id: req.userID }).sort({ createdAt: -1 }) // Sort by creation date in descending order
          .populate('content')
          .exec();

        const unreadCount = unReadMsg.reduce((acc, elm) => {
          if (elm.content?.read === '') {
            // console.log(elm.content);
            acc += 1
          }
          return acc
        }, 0)
        return {
          friend,
          lastMessage,
          unreadCount
        };
      })
    );

    // Filter out null values (if any friend is not found)
    const filteredFriendsWithLastMessage = friendsWithLastMessage.filter(friend => friend !== null);

    res.status(200).json({
      success: true,
      friends: filteredFriendsWithLastMessage,
    });
  } catch (error) {
    console.error("Error fetching friends with last message:", error);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }

};


export const requestFriend = async (req, res) => {
  const { ID } = req.params

  // console.log(req.userID);
  const newFrndREq = new FriendRequest({
    requester: req.userID,
    recipient: ID
  })

  await newFrndREq.save()

  res.status(200).json({
    status: true,
    msg: "Request Sent!"
  })
}

export const rejectFriend = async (req, res) => {
  try {
    const { ID } = req.params
    const userID = req.userID
    const delData = await FriendsModel.findOneAndDelete({ requester: ID, recipient: userID })

    // console.log(delData);
    if (!delData) {
      return res.status(404).json({
        status: false,
        msg: "Friend request not found",
      });
    }
    res.status(200).json({
      status: true,
      msg: "Request Deleted!"
    })
  } catch (error) {
    res.status(200).json({
      status: false,
      msg: error
    })
  }
}

export const deleteRequest = async (req, res) => {
  try {
    const userID = req.userID
    const { ID } = req.params
    const delData = await FriendsModel.findOneAndDelete({ requester: userID, recipient: ID })
    res.status(200).json({
      status: true,
      delData,
      msg: "Request deleted!"
    })

  } catch (error) {
    res.status(200).json({
      status: false,
      msg: error
    })
  }
}

export const acceptFriend = async (req, res) => {
  try {
    const { ID } = req.params;  // Extract the requester ID from the request parameters
    const userID = req.userID;  // Extract the current user ID from the request (assumed to be set by middleware)
    // console.log(ID);
    // console.log(req.userID);

    // Find and delete the friend request
    const delData = await FriendRequest.findOneAndDelete({ requester: ID, recipient: userID });
    // console.log(delData);
    if (!delData) {
      return res.status(404).json({
        status: false,
        msg: "Friend request not found",
      });
    }

    // Find the main user and update their friends list
    const mainUser = await userModel.findById(userID);

    if (!mainUser) {
      return res.status(404).json({
        status: false,
        msg: "User not found",
      });
    }

    // Add the requester ID to the main user's friends list
    if (!mainUser.friends.includes(ID)) {
      mainUser.friends.push(ID);
    }

    await mainUser.save();  // Save the updated user document

    // Optionally, you might also want to add the current user to the requester's friends list
    const requesterUser = await userModel.findById(ID);
    if (requesterUser && !requesterUser.friends.includes(userID)) {
      requesterUser.friends.push(userID);
      await requesterUser.save();  // Save the updated requester user document
    }

    res.status(200).json({
      status: true,
      msg: "Friend request accepted and deleted!",
      delData,
      mainUser,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

export const pendingFriends = async (req, res) => {
  const userID = req.userID
  const result = await FriendsModel.find({ recipient: userID })
  if (result.length === 0) {
    return res.status(404).json({
      success: false,
      msg: "No pending request found",
    });
  }
  const pendingList = await Promise.all(result.map(async (elm) => {
    return await userModel.findById(elm.requester)
  }))
  return res.status(200).json({
    success: true,
    pendingList
  });
}
