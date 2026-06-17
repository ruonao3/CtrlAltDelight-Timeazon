import express from "express";
import cors from "cors";

import {postUsersHandler} from "../users.js";
import {getImageUploadUrlHandler} from "../utility-functions.js";

// Creating express app
const app = express();
// Port number
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Enabling CORS
app.use(cors());

// Sample api route for testing
app.get("/", (request, response) => {
  response.json("Welcome to our server");
});

app.post("/api/users", (req, res) => {
  postUsersHandler(req, res);
});

app.post("/api/image-upload-url", (req, res) => {
  getImageUploadUrlHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
