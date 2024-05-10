const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://o4450:Secrete4450@cluster0.cv7wcsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const port = process.env.PORT || 3000;

const roomsCollection = "room";
const dbName = "final_pt2";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
async function connectToDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if connection fails
  }
}

// Middleware to ensure MongoDB connection before handling requests
app.use((req, res, next) => {
  if (!client.topology || !client.topology.isConnected()) {
    connectToDB()
      .then(() => next())
      .catch((error) => next(error));
  } else {
    next();
  }
});

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// GET all rooms
app.get("/rooms", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(roomsCollection);
    const rooms = await collection.find({}).toArray();
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET room by ID
app.get("/rooms/:id", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(roomsCollection);
    const room = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (room) {
      res.status(200).json(room);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error11111111" });
  }
});

// POST a new room
app.post("/rooms", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(roomsCollection);
    const result = await collection.insertOne({
      roomName: req.body.roomName,
      roomID: req.body.roomID,
      type: req.body.type,
    });
    res.status(201).json({
      message: "Room successfully created",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT (update) a room by ID
app.put("/rooms/:id", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(roomsCollection);
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          roomName: req.body.roomName,
          type: req.body.type,
          state: req.body.state,
        },
      }
    );
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Room successfully updated" });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error 500" });
  }
});

// DELETE a room by ID
app.delete("/rooms/:id", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(roomsCollection);
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Room successfully deleted" });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH (partial update) a room by ID
app.patch("/rooms/:id", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(roomsCollection);
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body } // Set the fields provided in the request body
    );
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Room successfully updated" });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});
