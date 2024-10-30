import express, { urlencoded } from "express";
const port = 3000;
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import { pool } from "../database/connection.js"; // Importamos la conexión como promesa

// Middleware
app.use(express.static("views"));
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.set("views", "views");
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("prueba");
});

app.listen(port, () => {
  console.log(`Servidor funcionando en puerto ${port}`);
});
