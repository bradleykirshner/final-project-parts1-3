const express = require("express");
const readline = require("readline");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri =
"mongodb+srv://o4450:Secrete4450@cluster0.cv7wcsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const port = process.env.PORT || 3000;

const roomsCollection = "room";
const dbName = "final_pt2";

const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/// Connect to MongoDB
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
      state: req.body.state
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
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
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

async function getAllRooms() {
  const response = await fetch("http://localhost:3000/rooms");
  if (response.ok) {
    const rooms = await response.json();
    console.log(rooms);
  } else {
    console.error("Failed to retrieve rooms:", response.statusText);
  }
}

async function getRoomById(id) {
  const response = await fetch(`http://localhost:3000/rooms/${id}`);
  if (response.ok) {
    const room = await response.json();
    console.log(room);
  } else if (response.status === 404) {
    console.log("Room not found");
  } else {
    console.error("Failed to retrieve room:", response.statusText);
  }
}

async function createRoom(roomData) {
  const response = await fetch("http://localhost:3000/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomData),
  });
  if (response.ok) {
    console.log("Room created successfully");
  } else {
    console.error("Failed to create room:", response.statusText);
  }
}

async function updateRoomById(id, updatedData) {
  const response = await fetch(`http://localhost:3000/rooms/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });
  if (response.ok) {
    console.log("Room updated successfully");
  } else if (response.status === 404) {
    console.log("Room not found");
  } else {
    console.error("Failed to update room:", response.statusText);
  }
}

async function deleteRoomById(id) {
  const response = await fetch(`http://localhost:3000/rooms/${id}`, {
    method: "DELETE",
  });
  if (response.ok) {
    console.log("Room deleted successfully");
  } else if (response.status === 404) {
    console.log("Room not found");
  } else {
    console.error("Failed to delete room:", response.statusText);
  }
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      resolve(ans);
    });
  });
}

// Function to handle user input and execute corresponding function
async function handleUserInput() {
  let flag = true;

  while (flag) {
    console.log("Menu:");
    console.log("1. Get all rooms");
    console.log("2. Get room by ID");
    console.log("3. Create a room");
    console.log("4. Update room by ID");
    console.log("5. Delete room by ID");
    console.log("6. Exit");

    const input = await askQuestion("Enter your choice: ");
    const choice = parseInt(input.trim());

    switch (choice) {
      case 1:
        await getAllRooms();
        break;
      case 2:
        let id = await askQuestion("Enter the room ID: ");
        await getRoomById(id);
        break;
      case 3:
        let data1 = await askQuestion("Enter room data (JSON format): ");
        await createRoom(JSON.parse(data1));
        break;
      case 4:
        let id1 = await askQuestion("Enter the room ID:");
        let data = await askQuestion("Enter data in JSON format:");
        await updateRoomById(id1, JSON.parse(data));
        break;
      case 5:
        let id2 = await askQuestion("Enter the room ID: ");
        await deleteRoomById(id2);
        break;
      case 6:
        console.log("Exiting...");
        flag = false;
        process.exit();
      default:
        console.log("Invalid choice");
        break;
    }
  }
  if (rl) {
    rl.close();
  }
}

// Execute the function to handle user input
handleUserInput();
