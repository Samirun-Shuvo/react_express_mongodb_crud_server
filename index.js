const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// DB_USER=samirunshuvo
// DB_PASS=HxLt1nMBSwvIYWPF

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2.ubetca2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const userCollection = await client.db("foodExpress").collection("users");

    //get all users from database
    app.get("/user", async (req, res) => {
      // const newUser = req.body;
      const query = {};
      const cursor = userCollection.find(query);
      const users = await cursor.toArray();
      res.send({ status: "success", users });
    });

    //get single user from database
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const user = await userCollection.findOne(query);
      res.send({ status: "success", user });
    });

    // Update single user from database
    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const updates = req.body; // Get the update data from the request body

      if (!ObjectId.isValid(id)) {
        return res
          .status(400)
          .send({ status: "error", message: "Invalid ID format" });
      }

      const query = { _id: new ObjectId(id) };
      const updateDocument = {
        $set: updates, // Use the $set operator to specify the fields to update
      };

      try {
        const result = await userCollection.updateOne(query, updateDocument);

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .send({ status: "error", message: "User not found" });
        }

        res.send({ status: "success", updatedUser: result });
      } catch (error) {
        console.error("Error updating user:", error);
        res
          .status(500)
          .send({ status: "error", message: "Failed to update user" });
      }
    });

    //add new user to database
    app.post("/user", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send({ status: "success", result, data: newUser });
    });

    //delete a user from database
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send({ status: "success", result });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("My crud app runnig");
});
app.listen(port, (req, res) => {
  console.log("listening on port 5000");
});
