import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";

import userRoutes from "./routes/user";

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/user",userRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});