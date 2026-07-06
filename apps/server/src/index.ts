import { env } from "@perpustakaan-be/env/server";
import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

import authRouter from "./routes/auth";
import penerbitRouter from "./routes/penerbit";
import pengarangRouter from "./routes/pengarang";
import klasifikasiRouter from "./routes/klasifikasi";
import bukuRouter from "./routes/buku";

app.use(express.json());

app.use("/auth", authRouter);
app.use("/penerbit", penerbitRouter);
app.use("/pengarang", pengarangRouter);
app.use("/klasifikasi", klasifikasiRouter);
app.use("/buku", bukuRouter);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
