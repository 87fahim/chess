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
import config from "../config/appConfig.js";

const client = new MongoClient(config.mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let databasePromise;

const connectDB = async () => {
  if (!databasePromise) {
    databasePromise = client
      .connect()
      .then(() => {
        console.log(`Connected to MongoDB '${config.mongoDbName}'.`);
        return client.db(config.mongoDbName);
      })
      .catch((error) => {
        databasePromise = undefined;
        throw error;
      });
  }

  return databasePromise;
};

export default connectDB;
