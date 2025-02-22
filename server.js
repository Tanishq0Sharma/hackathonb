require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const PORT = 5000;
const mongoUri = process.env.MONGODB_URI || "YOUR_MONGODB_ATLAS_URI";

app.use(cors());
app.use(express.json());

let db;
MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        db = client.db("tasknotesdb");
        console.log("Connected to MongoDB Atlas");
    })
    .catch(error => console.error("MongoDB Connection Error:", error));

// Start MongoDB server when the HTML file loads
app.get("/start-server", (req, res) => {
    exec("node server.js", (err, stdout, stderr) => {
        if (err) {
            console.error(`Error starting server: ${stderr}`);
            return res.status(500).send("Failed to start server");
        }
        res.send("Server started successfully");
    });
});

// Task and Notes Endpoints
app.post("/tasks", async (req, res) => {
    const { task } = req.body;
    await db.collection("tasks").insertOne({ task });
    res.json({ message: "Task added" });
});

app.get("/tasks", async (req, res) => {
    const tasks = await db.collection("tasks").find().toArray();
    res.json(tasks);
});

app.post("/notes", async (req, res) => {
    const { note } = req.body;
    await db.collection("notes").insertOne({ note });
    res.json({ message: "Note saved" });
});

app.get("/notes", async (req, res) => {
    const notes = await db.collection("notes").find().toArray();
    res.json(notes);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
