import express, { Express } from "express";
import mongoose from "mongoose";
import postRoute from "./routes/post";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());

app.use("/post", postRoute);

const initApp = () => {
  const pr = new Promise<Express>((resolve, reject) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      reject("DATABASE_URL is not defined");
      return;
    }
    mongoose
      .connect(dbUrl, {})
      .then(() => {
        resolve(app);
      });
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("open", () => console.log("Connected to Database"));
  });
  return pr;
};

export default initApp;