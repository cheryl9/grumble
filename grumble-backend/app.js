const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const foodPlaceRoutes = require("./routes/foodPlaceRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const pollRoutes = require("./routes/pollRoutes");
const spinWheelRoutes = require("./routes/spinWheelRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const errorHandler = require("./middleware/errorHandler");

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Grumble API is running");
});

app.use("/api/posts", postRoutes);
app.use("/api/food-places", foodPlaceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/spin-wheels", spinWheelRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);

app.use(errorHandler);

module.exports = app;
