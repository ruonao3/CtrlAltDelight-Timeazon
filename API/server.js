import express from "express";
import cors from "cors";
import "dotenv/config";

import {
  getProducts,
  createProduct,
  deleteProduct,
} from "./controllers/products.express.js";
import { postUsersHandler } from "../CDK/functions/users.js";
import {
  addToCart,
  getCart,
  removeFromCart,
} from "./controllers/cart.controller.js";
import { loginUser } from "./controllers/user.controller.js";
import { bootstrap } from "./controllers/bootstrap.controller.js";

// Creating express app
const app = express();
// Port number
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Enabling CORS
app.use(cors());

app.get("/api/healthcheck", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

app.get("/api/products", getProducts);

app.post("/api/products", createProduct);

app.delete("/api/products", deleteProduct);

app.get("/api/addtocart", getCart());

app.post("/api/addtocart", addToCart());

app.delete("/api/addtocart", removeFromCart());

app.post("/api/user");

app.post("/api/login", loginUser());

app.post("/api/bootstrap", bootstrap);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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

app.post("/api/users", (req, res) => {
  postUsersHandler(req, res);
});

app.post("/api/image-upload-url", (req, res) => {
  getImageUploadUrlHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
