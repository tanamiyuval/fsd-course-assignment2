import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userID: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
});

export default mongoose.model("comment", commentSchema);