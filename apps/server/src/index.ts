import { env } from "@perpustakaan-be/env/server";
import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

import authRouter from "./routes/auth";
import penerbitRouter from "./routes/penerbit";
import pengarangRouter from "./routes/pengarang";
import klasifikasiRouter from "./routes/klasifikasi";
import bukuRouter from "./routes/buku";
import inventarisRouter from "./routes/inventaris";
import usersRouter from "./routes/users";
import pinjamRouter from "./routes/pinjam";
import dashboardRouter from "./routes/dashboard";
import konfigurasiRouter from "./routes/konfigurasi";

app.use(express.json());

app.use("/auth", authRouter);
app.use("/penerbit", penerbitRouter);
app.use("/pengarang", pengarangRouter);
app.use("/klasifikasi", klasifikasiRouter);
app.use("/buku", bukuRouter);
app.use("/inventaris", inventarisRouter);
app.use("/users", usersRouter);
app.use("/pinjam", pinjamRouter);
app.use("/dashboard", dashboardRouter);
app.use("/konfigurasi", konfigurasiRouter);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
