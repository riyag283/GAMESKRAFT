const User = require("../models/User");
const Game = require("../models/Game");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const calculateMatchMeasure = require("../utility/matchScore");

function validateToken(token) {
  try {
    const decoded = jwt.verify(token, "your-secret-key");
    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
}

const resolvers = {
  createGame: async ({ id, name }) => {
    try {
      const game = new Game({
        _id: id,
        name,
      });
      await game.save();
      return game;
    } catch (err) {
      throw new Error("Error creating game: " + err);
    }
  },

  getUser: async ({ id }) => {
    try {
      const user = await User.findById(id);
      console.log(user);
      return user;
    } catch (err) {
      throw new Error("Error retrieving user");
    }
  },

  getAllUsers: async () => {
    try {
      const users = await User.find();
      return users;
    } catch (err) {
      throw new Error("Error retrieving users" + err);
    }
  },

  getUsers: async ({ id }) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      const blockedIds = user.blockedIds || [];
      blockedIds.push(id); // Add the user's own id to the blockedIds

      const users = await User.find({
        _id: { $nin: blockedIds }, // $nin selects the documents where the value of the field is not in the specified array
        blockedIds: { $ne: id }, // Exclude users who have the user in their blockedIds
      });

      return users;
    } catch (err) {
      throw new Error(`Error retrieving users: ${err.message}`);
    }
  },

  createUser: async ({
    id,
    username,
    password,
    lat,
    lng,
    maxDist,
    gameInterest,
  }) => {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({
        _id: id,
        username,
        password: hashedPassword,
        blockedIds: [],
        connectionIds: [],
        location: {
          type: "Point",
          coordinates: [lat, lng],
        },
        maxDist,
        gameInterest,
      });
      await user.save();
      return user;
    } catch (err) {
      throw new Error("Error creating user: " + err);
    }
  },

  updateUser: async ({ id, name, email, password, lat, lng }) => {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        {
          name,
          email,
          password,
          location:
            lat && lng
              ? {
                  type: "Point",
                  coordinates: [lat, lng],
                }
              : undefined,
        },
        { new: true }
      );
      return user;
    } catch (err) {
      throw new Error("Error updating user");
    }
  },

  deleteUser: async ({ id }) => {
    try {
      const user = await User.findByIdAndDelete(id);
      return user;
    } catch (err) {
      throw new Error("Error deleting user: " + err);
    }
  },

  blockUser: async (args) => {
    try {
      if (args.id === args.blockId) {
        throw new Error("User cannot block themselves");
      }
      const userToBlock = await User.findById(args.blockId);
      if (!userToBlock) {
        throw new Error("User to block not found");
      }
      const user = await User.findById(args.id);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.blockedIds?.includes(args.blockId)) {
        throw new Error("User is already blocked");
      }
      const updatedUser = await User.findByIdAndUpdate(
        args.id,
        { $push: { blockedIds: args.blockId } },
        { new: true }
      );
      return updatedUser;
    } catch (err) {
      throw new Error("Error blocking user: " + err);
    }
  },

  connectUser: async (args) => {
    try {
      if (args.id === args.connectId) {
        throw new Error("User cannot connect themselves");
      }
      const userToConnect = await User.findById(args.connectId);
      if (!userToConnect) {
        throw new Error("User to connect not found");
      }
      const user = await User.findById(args.id);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.connectionIds?.includes(args.connectId)) {
        throw new Error("User is already connected");
      }
      const updatedUser = await User.findByIdAndUpdate(
        args.id,
        { $push: { connectionIds: args.connectId } },
        { new: true }
      );
      return updatedUser;
    } catch (err) {
      throw new Error("Error connecting user: " + err);
    }
  },

  getBlockedUsers: async ({ id }) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      const blockedUsers = await User.find({
        _id: { $in: user.blockedIds }, // $in selects the documents where the value of the field is in the specified array
      });

      return blockedUsers;
    } catch (err) {
      throw new Error(`Error retrieving blocked users: ${err.message}`);
    }
  },

  unblockUser: async ({ id, blockId }) => {
    try {
      if (id === blockId) {
        throw new Error("User cannot unblock themselves");
      }

      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.blockedIds.includes(blockId)) {
        throw new Error("User is not blocked");
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $pull: { blockedIds: blockId } }, // $pull removes from an existing array all instances of a value or values that match a specified condition
        { new: true }
      );

      return updatedUser;
    } catch (err) {
      throw new Error(`Error unblocking user: ${err.message}`);
    }
  },

  getNearbyUsers: async (args) => {
    const user = await User.findById(args.id);
    if (!user) {
      throw new Error("User not found");
    }
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: user.location.coordinates,
          },
          $maxDistance: 10000, // 10 kilometers
        },
      },
    });
    return nearbyUsers;
  },

  getUsersList: async ({ id }) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      const blockedIds = user.blockedIds || [];
      blockedIds.push(id); // Add the user's own id to the blockedIds

      let users = await User.find({
        _id: { $nin: blockedIds }, // $nin selects the documents where the value of the field is not in the specified array
        blockedIds: { $ne: id }, // Exclude users who have the user in their blockedIds
        connectionIds: { $ne: id },
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: user.location.coordinates,
            },
            $maxDistance: user.maxDist * 1000 ? user.maxDist : 10000000000,
          },
        },
      });

      // Calculate match measure for each user and store it along with the user data
      users = users.map((otherUser) => {
        const matchMeasure = calculateMatchMeasure(user, otherUser);
        return { matchMeasure, userData: otherUser };
      });

      // Sort users in descending order of match measure
      users.sort((a, b) => b.matchMeasure - a.matchMeasure);
      console.log(users);

      // Return sorted user data
      return users.map((user) => user.userData);
    } catch (err) {
      throw new Error(`Error retrieving users: ${err.message}`);
    }
  },

  login: async ({ username, password }) => {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Check the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error("Invalid username or password");
    }

    // Generate a token
    const token = jwt.sign({ id: user.id }, "your-secret-key");

    // Return the token and user data
    return {
      token,
      user,
    };
  },
};

module.exports = resolvers;
