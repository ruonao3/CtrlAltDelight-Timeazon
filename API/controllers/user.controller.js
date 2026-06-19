import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

// CDK passes these in as Lambda environment variables
const TABLE_NAME = process.env.DYNAMO_TABLE_NAME;
const REGION = process.env.DYNAMO_REGION;

// DocumentClient lets us read and write normal JavaScript objects.
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/**
 * Turn a password into a salted hash we can safely store
 */
const hashPassword = (
  password,
  salt = crypto.randomBytes(16).toString("hex"),
) => {
  const iterations = 100_000;
  const keylen = 64;
  const digest = "sha512";

  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, keylen, digest)
    .toString("hex");

  return { salt, hash, iterations, digest };
};

/**
 * Check if a supplied password matches the stored hash
 */
const verifyPassword = (password, stored) => {
  const { salt, hash, iterations, digest } = stored;

  const candidate = crypto
    .pbkdf2Sync(password, salt, iterations, 64, digest)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(candidate, "hex"),
    Buffer.from(hash, "hex"),
  );
};

const normaliseEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

export async function loginUser(req, res) {
  try {
    if (!TABLE_NAME) {
      return res
        .status(500)
        .json({ status: "error", message: "Missing DYNAMO_TABLE_NAME" });
    }
    if (!REGION) {
      return res.status(500).json({
        status: "error",
        message: '"Missing DYNAMO_REGION',
      });
    }

    const email = normaliseEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and Password are required",
      });
    }

    const result = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { email },
      }),
    );

    const user = result.Item;

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const verify = verifyPassword(password, user.password);
    if (!verify) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      status: "logged_in",
      user: { email },
    });
  } catch (error) {
    console.error("loginUser Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Could not log in",
    });
  }
}

export async function createUser(req, res) {
  try {
    if (!TABLE_NAME) {
      return res.status(500).json({
        status: "error",
        message: "Missing DYNAMO_TABLE_NAME",
      });
    }

    if (!REGION) {
      return res.status(500).json({
        status: "error",
        message: "Missing DYNAMO_REGION",
      });
    }

    const email = normaliseEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const existing = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { email },
      }),
    );

    if (existing.Item) {
      return res.status(409).json({
        status: "error",
        message: "User already exists",
      });
    }

    const passwordData = hashPassword(password);

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          email,
          password: passwordData,
          createdAt: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(email)",
      }),
    );

    // Optional success response (truncated in the image)
    return res.status(201).json({
      status: "success",
      message: "User created successfully",
    });
  } catch (error) {
    if (error?.name === "ConditionalCheckFailedExcepetion") {
      return res.status(409).json({
        status: "error",
        message: "User already exists",
      });
    }

    console.error("createUser error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}
