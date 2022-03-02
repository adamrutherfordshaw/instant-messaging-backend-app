const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const io = require("socket.io")(5000);

const Message = require("./models/messages");
const User = require("./models/users");

const { dbUsername, dbPassword } = require("../secrets.js");

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(
    `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.qmrzv.mongodb.net/instant-messaging-app`,
    {}
  )
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error("Not connected"));

app.listen(3001, () => console.log("Server started on port 3001"));

// http requests

// TODO: remove
app.get("/api/users", async (req, res) => {
  const users = await User.find();

  res.json(users);
});

app.post("/api/users/register", async (req, res) => {
  try {
    if (
      await User.find().then((data) =>
        data.find((user) => user.username === req.body.username)
      )
    )
      return res.status(409).send();
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    newUser.save();
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const user = await User.find().then((data) =>
      data.find((user) => user.username === req.body.username)
    );
    if (!user) return res.status(401).send();
    if (await bcrypt.compare(req.body.password, user.password))
      res.send(user._id);
    else res.status(401).send();
  } catch {
    res.status(500).send();
  }
});

io.on("connection", (socket) => {
  const id = socket.handshake.query.id;
  socket.join(id);

  socket.on("send-message", ({ recipients, senderUsername, body }) => {
    const newMessage = new Message({
      recipients,
      senderUsername,
      body,
    });
    newMessage.save();

    socket.broa
  });
});
