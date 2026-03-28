// server/db.js
require('dotenv').config({ path: './config.env' })
const { MongoClient } = require('mongodb')

let db;

async function connectDB() {
  if (db) return db;

  const client = new MongoClient(process.env.ATLAS_URI);
  await client.connect();
  db = client.db("ToDoApp"); // Choose the database you want to work with
  console.log("Connected to MongoDB and database: ToDoApp");
  return db;
}

module.exports = connectDB;
