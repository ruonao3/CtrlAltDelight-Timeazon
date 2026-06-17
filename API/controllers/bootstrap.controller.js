import { bootstrapDatabase } from "../../CDK/functions/db.js";

export async function bootstrap(req, res) {
  try {
    await bootstrapDatabase();
    return res.status(201).json({
      status: "ok",
      message: "Database reset and seeded",
    });
  } catch (error) {
    console.error("bootstrap error:", err);
    return jsonResponse(500, {
      status: "error",
      message: "Failed to bootstrap database",
    });
  }
}
