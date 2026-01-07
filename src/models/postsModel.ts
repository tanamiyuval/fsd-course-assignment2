import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      default: [],
    },
  ],
});

export default mongoose.model("post", postSchema);