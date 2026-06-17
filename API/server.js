import express from "express";
import cors from "cors";

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
