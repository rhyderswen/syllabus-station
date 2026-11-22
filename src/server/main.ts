import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import https from "node:https";
import ViteExpress from "vite-express";

import authRouter from "./routes/auth.js";
import syllabusRouter from "./routes/syllabus.js";
import courseRouter from "./routes/course.js";
import userRouter from "./routes/ban.js";

import * as fs from "node:fs";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = user;
    } catch (err) {
      // Access token might be expired, clear it so frontend knows it needs refresh
      res.clearCookie("token");
      console.log("JWT token expired or invalid");
    }
  }
  next();
});

app.use("/", authRouter);
app.use("/syllabus", syllabusRouter);
app.use("/course", courseRouter);
app.use("/user", userRouter);

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

let sslOptions = {};

try {
  sslOptions = {
    key: fs.readFileSync(path.resolve("./certs/localhost-key.pem")),
    cert: fs.readFileSync(path.resolve("./certs/localhost.pem")),
  };
} catch (err) {
  console.warn(
    "⚠️ Certificates not found yet. If this is your first run, restart the server once Vite generates them.",
  );
}

const server = https.createServer(sslOptions, app);

server.listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});

ViteExpress.bind(app, server);
