require("dotenv").config();
//DB dependencies
const connectDB = require("./config/db");
//Libraries
const express = require("express");
const path = require("path");

const app = express();

connectDB();

//Init middleware
app.use(
  express.json({
    extended: false,
  })
);

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/lists", require("./routes/api/lists"));

//serve static assest
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
