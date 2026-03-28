// import connectDB from "../db/connection.js";
// import { ObjectId } from "mongodb";

// const getUsersCollection = async () => {
//   const db = await connectDB();
//   return db.collection("users");
// };

// export const findUserById = async (userId) => {
//   const usersCollection = await getUsersCollection();
//   return usersCollection.findOne({ _id: new ObjectId(userId) });
// };

// export const findUserByUsername = async (username) => {
//   const usersCollection = await getUsersCollection();
//   return usersCollection.findOne({ username });
// };

// export const insertUser = async (userData) => {
//   const usersCollection = await getUsersCollection();
//   return usersCollection.insertOne(userData);
// };


import connectDB from "../db/connection.js";
import { ObjectId } from "mongodb";

const getUsersCollection = async () => {
  const db = await connectDB();
  return db.collection("users");
};

// Find a user by ID
export const findUserById = async (userId) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.findOne({ _id: new ObjectId(userId) });
};

// Find a user by username
export const findUserByUsername = async (username) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.findOne({ username });
};

// Insert a new user
export const insertUser = async (userData) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.insertOne(userData);
};

// Delete a user by ID
export const deleteUser = async (userId) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.deleteOne({ _id: new ObjectId(userId) });
};

// Edit user details by ID
export const editUser = async (userId, updateData) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: updateData }
  );
};

// Delete all users (use with caution)
export const deleteAllUsers = async () => {
  const usersCollection = await getUsersCollection();
  return usersCollection.deleteMany({});
};

// List all users with optional pagination
export const listUsers = async (page = 1, limit = 10) => {
  const usersCollection = await getUsersCollection();
  return usersCollection
    .find({})
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
};

// Get total user count
export const countUsers = async () => {
  const usersCollection = await getUsersCollection();
  return usersCollection.countDocuments();
};

// Find users by role
export const findUsersByRole = async (role) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.find({ role }).toArray();
};

// Ban a user instead of deleting (soft delete)
export const banUser = async (userId) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { banned: true } }
  );
};
