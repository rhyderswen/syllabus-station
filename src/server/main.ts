import express from "express";
import ViteExpress from "vite-express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import https from "node:https";
import { resolveConfig } from "vite";

import authRouter from "./routes/auth.js";
import * as fs from "node:fs";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = user as any;
    } catch (err) {
      console.error("JWT verification failed:", err);
    }
  }
  next();
});

app.use("/", authRouter);


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
  console.warn("⚠️ Certificates not found yet. If this is your first run, restart the server once Vite generates them.");
}

const server = https.createServer(sslOptions, app);

server.listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});

ViteExpress.bind(app, server);

