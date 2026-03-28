// import { MongoClient, ServerApiVersion } from "mongodb";
// import dotenv from "dotenv";
// dotenv.config({ path: './config.env' });

// // console.log('Current Directory ', process.cwd());
// const uri = process.env.ATLAS_URI || "NO ATLAS URI!!!";
// // console.log("====>", uri);

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// try {
//   // Connect the client to the server
//   await client.connect();
//   // Send a ping to confirm a successful connection
//   await client.db("Manager").command({ ping: 1 });
//   console.log(
//     "Pinged your deployment. You successfully connected to MongoDB!"
//   );
// } catch (err) {
//   console.error(err);
// }

// let db = client.db("SecurePass");

// export default db;
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const uri = process.env.ATLAS_URI || "NO ATLAS URI!!!";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

const connectDB = async () => {
  if (!db) {
    try {
      await client.connect();
      db = client.db("SecurePass");
      console.log("✅ Connected to MongoDB successfully.");
    } catch (err) {
      console.error("❌ MongoDB Connection Error:", err);
      process.exit(1); // Exit the process if connection fails
    }
  }
  return db;
};

export default connectDB;
