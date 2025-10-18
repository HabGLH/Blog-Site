import Post from "../models/Post.js";
import asyncHandler from "../middleware/asyncHandler.js";

// GET all posts
export const getPosts = asyncHandler(async (req, res) => {
  // Allow optional filtering by tag: /api/posts?tag=javascript
  const { tag } = req.query;
  const filter = {};
  if (tag) filter.tags = tag;

  // populate author and comment user so frontend can display usernames
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .populate("author", "username email")
    .populate("comments.user", "username");
  res.json(posts);
});

// GET single post by id
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username email")
    .populate("comments.user", "username");
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  res.json(post);
});

// CREATE new post (protected)
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  const post = new Post({
    title,
    content,
    author: req.user._id, // use the authenticated user
    tags: Array.isArray(tags)
      ? tags
      : tags
      ? tags.split(",").map((t) => t.trim())
      : [],
  });

  const savedPost = await post.save();
  const populated =
    (await savedPost.populate("author", "username email").execPopulate?.()) ||
    savedPost;
  res.status(201).json(populated);
});

// UPDATE post (protected)
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  // Only the author can update
  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not allowed to update this post");
  }

  post.title = req.body.title || post.title;
  post.content = req.body.content || post.content;
  if (req.body.tags) {
    post.tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : req.body.tags.split(",").map((t) => t.trim());
  }
  const updatedPost = await post.save();
  const populated =
    (await updatedPost.populate("author", "username email").execPopulate?.()) ||
    updatedPost;
  res.json(populated);
});

// DELETE post (protected)
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  // Only the author can delete
  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not allowed to delete this post");
  }

  await Post.deleteOne({ _id: post._id });
  res.json({ message: "Post removed" });
});

// LIKE / UNLIKE a post (toggle)
export const toggleLike = asyncHandler(async (req, res) => {
  // Use atomic update to avoid re-running full document validation which
  // previously could fail if some fields were stored incorrectly (eg: author
  // as a string). $addToSet and $pull operate at the DB level and won't
  // re-cast/validate unrelated fields.
  const postId = req.params.id;
  const userId = req.user._id;

  // Try adding the user to likes; if it was already present, remove instead.
  const alreadyLiked = await Post.exists({ _id: postId, likes: userId });
  let updated;
  let action;
  if (!alreadyLiked) {
    updated = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );
    action = "liked";
  } else {
    updated = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );
    action = "unliked";
  }

  if (!updated) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.json({ likesCount: updated.likes.length, action });
});

// Add comment
export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    res.status(400);
    throw new Error("Comment content is required");
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = { user: req.user._id, content };
  post.comments.push(comment);
  await post.save();

  // populate the last comment's user
  const populated = await Post.findById(post._id).populate(
    "comments.user",
    "username"
  );
  const lastComment = populated.comments[populated.comments.length - 1];
  res.status(201).json(lastComment);
});

// Delete comment (only comment owner or post author)
export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  // Allow deletion by comment owner or post author
  if (
    comment.user.toString() !== req.user._id.toString() &&
    post.author.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  comment.remove();
  await post.save();
  res.json({ message: "Comment removed" });
});
