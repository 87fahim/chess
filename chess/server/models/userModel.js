import connectDB from "../db/connection.js";
import { ObjectId } from "mongodb";

const getUsersCollection = async () => {
  const db = await connectDB();
  return db.collection("users");
};

const toObjectId = (value) => new ObjectId(value);

// Find a user by ID
export const findUserById = async (userId) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.findOne({ _id: toObjectId(userId) });
};

// Find a user by username
export const findUserByUsername = async (username) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.findOne({ username });
};

export const findUserByEmail = async (email) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.findOne({ email });
};

// Insert a new user
export const insertUser = async (userData) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.insertOne(userData);
};

// Delete a user by ID
export const deleteUser = async (userId) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.deleteOne({ _id: toObjectId(userId) });
};

// Edit user details by ID
export const editUser = async (userId, updateData) => {
  const usersCollection = await getUsersCollection();
  return usersCollection.updateOne(
    { _id: toObjectId(userId) },
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
    { _id: toObjectId(userId) },
    { $set: { banned: true } }
  );
};
