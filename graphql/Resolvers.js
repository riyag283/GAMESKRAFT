const User = require("../models/User");

const resolvers = {
  getUser: async ({ id }) => {
    try {
      const user = await User.findById(id);
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

  createUser: async ({ name, email, password, lat, lng }) => {
    try {
      const user = new User({
        name,
        email,
        password,
        blockedIds: [],
        location: {
          type: "Point",
          coordinates: [lat, lng],
        },
      });
      await user.save();
      return user;
    } catch (err) {
      throw new Error("Error creating user" + err);
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
};

module.exports = resolvers;