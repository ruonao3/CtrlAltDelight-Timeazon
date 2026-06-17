import express from "express";
import cors from "cors";
import "dotenv/config";

import { healthcheckHandler } from "../CDK/functions/health-check.js";
import {
  productCatalogHandler,
  postProductHandler,
  deleteProductHandler,
  bootstrapHandler,
  getImageUploadUrlHandler,
} from "../CDK/functions/utility-functions.js";
import { postUsersHandler, loginHandler } from "../CDK/functions/users.js";
import {
  postToCartHandler,
  getToCartHandler,
  deleteFromCartHandler,
} from "../CDK/functions/addToCart.js";

// Creating express app
const app = express();
// Port number
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Enabling CORS
app.use(cors());

function toLambdaEvent(request) {
  return {
    body:
      request.body && Object.keys(request.body).length
        ? JSON.stringify(request.body)
        : null,
    queryStringParameters: request.query || {},
    pathParameters: request.params || {},
    headers: request.headers || {},
    httpMethod: request.method,
    path: request.path,
  };
}

async function runHandler(handler, req, res) {
  try {
    const event = toLambdaEvent(req);
    const result = await handler(event, {});

    const statusCode = result?.statusCode || 200;
    const headers = result?.headers || {};
    const body = result?.body ? JSON.parse(result.body) : {};

    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(statusCode).json(body);
  } catch (error) {
    console.error("Adapter error:", error);
    return res.status(500).json({
      status: "error",
      message: "Unhandled server error",
    });
  }
}

app.get("/api/healthcheck", (request, response) => {
  runHandler(healthcheckHandler, request, response);
});

app.get("/api/products", (request, response) => {
  runHandler(productCatalogHandler, request, response);
});

app.post("/api/products", (request, response) => {
  runHandler(postProductHandler, request, response);
});

app.delete("/api/products", (request, response) => {
  runHandler(deleteProductHandler, request, response);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
