const express = require("express");
const cors = require("cors");
const path = require("path");

const taskRoutes = require("./routes/taskRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    data: {
      status: "ok"
    }
  });
});

app.use("/api/tasks", taskRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
