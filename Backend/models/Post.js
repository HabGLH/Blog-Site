import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Users who liked this post
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Comments as subdocuments
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: { type: String, required: true },
      },
    ],
    // Simple tags as strings
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
