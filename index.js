import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import { usersRouter } from "./routes/user.js";
import { galleryRouter } from "./routes/gallery.js";
import { isAuthenticated } from "./auth.js";

const app = express();
const PORT = 9000;

//Inbuilt middleware
app.use(express.json());
app.use(cors());

//mongoDB connection
export async function dataBaseConnection() {
  let MONGO_URL = "mongodb://127.0.0.1:27017";
  let DB_NAME = "photoGallery";
  try {
    await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
    console.log("Mongodb is connected");
  } catch (error) {
    console.log("Mongodb connection error", error);
  }
}
dataBaseConnection();

app.get("/", (req, res) => {
  res.send(" Welcome To Photo Gallery App");
});

app.use('/user', usersRouter);
app.use('/gallery', isAuthenticated, galleryRouter);

app.listen(PORT, () => console.log("The server started on the port", PORT));
