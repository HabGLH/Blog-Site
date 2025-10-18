import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader } from "../components/Loader";
import postApi from "../api/postApi";
import useAuth from "../context/useAuthHook";
import useToast from "../context/useToastHook";

export const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentInputRef = useRef(null);
  const togglingLikeRef = useRef(false);
  const likeTimer = useRef(null);
  const pendingToggle = useRef(false);
  const { add } = useToast();
  // ref for the comment input

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await postApi.getById(id);
      setPost(response.data);
    } catch (err) {
      console.error("Failed to fetch post:", err);
      if (err.response?.status === 404) {
        setError("Post not found");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to fetch post. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loader text="Loading post..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Home
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Post Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The post you're looking for doesn't exist.
        </p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
        >
          ← Back to Home
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-md p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {post.author?.username?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {post.author?.username || "Unknown Author"}
                </p>
                <p className="text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
            </div>

            {post.updatedAt !== post.createdAt && (
              <p className="text-gray-500">
                Updated: {formatDate(post.updatedAt)}
              </p>
            )}
          </div>
        </header>

        {post.tags && post.tags.length > 0 && (
          <footer className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 mr-2">
                Tags:
              </span>
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </footer>
        )}

        {/* Likes and Comments section */}
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!isAuthenticated)
                    return (window.location.href = "/login");

                  // Optimistic UI update
                  const likedBefore = post.likes?.some(
                    (id) => String(id) === String(user?._id)
                  );
                  const prevLikes = post.likes || [];
                  const nextLikes = likedBefore
                    ? prevLikes.filter((id) => String(id) !== String(user?._id))
                    : [...prevLikes, user?._id];
                  setPost({ ...post, likes: nextLikes });

                  pendingToggle.current = !likedBefore;
                  if (likeTimer.current) clearTimeout(likeTimer.current);
                  likeTimer.current = setTimeout(async () => {
                    togglingLikeRef.current = true;
                    try {
                      await postApi.toggleLike(post._id);
                      await fetchPost();
                      add("Like updated", { type: "success" });
                    } catch (err) {
                      console.error("Failed to toggle like", err);
                      add("Failed to update like", { type: "error" });
                      // rollback by refetching
                      await fetchPost();
                    } finally {
                      togglingLikeRef.current = false;
                      pendingToggle.current = false;
                    }
                  }, 450);
                }}
                className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full transition-colors transform-gpu ${
                  post.likes &&
                  post.likes.some((id) => String(id) === String(user?._id))
                    ? "bg-red-100 text-red-600 scale-105"
                    : "bg-gray-100 text-gray-600"
                }`}
                style={{
                  transition:
                    "transform 120ms ease, background-color 180ms ease",
                }}
              >
                <span
                  aria-hidden
                  className={`text-lg ${
                    post.likes &&
                    post.likes.some((id) => String(id) === String(user?._id))
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {post.likes &&
                  post.likes.some((id) => String(id) === String(user?._id)) ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.54 0 3.04.99 3.57 2.36h.87C13.46 4.99 14.96 4 16.5 4 19 4 21 6 21 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.8 4.6a5.5 5.5 0 00-7.78 0L12 5.6l-1.02-1a5.5 5.5 0 00-7.78 7.78L12 21.5l8.8-9.1a5.5 5.5 0 000-7.8z" />
                    </svg>
                  )}
                </span>
                <span className="ml-1">
                  {post.likes ? post.likes.length : 0}
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3">Comments</h3>
            {post.comments && post.comments.length > 0 ? (
              <ul className="space-y-3">
                {post.comments.map((c) => (
                  <li
                    key={c._id}
                    className={`flex justify-between items-start transform transition-all duration-200 ease-in-out hover:translate-y-0.5 ${
                      String(c._id).startsWith("temp_") ? "fade-in" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {c.user?.username || "User"}
                      </p>
                      <p className="text-gray-700">{c.content}</p>
                    </div>
                    <div>
                      {user &&
                        (String(user._id) === String(c.user?._id) ||
                          String(user._id) === String(post.author?._id)) && (
                          <button
                            onClick={async () => {
                              const ok = window.confirm("Delete this comment?");
                              if (!ok) return;
                              // optimistic UI: remove locally first
                              const prevComments = post.comments || [];
                              setPost({
                                ...post,
                                comments: prevComments.filter(
                                  (x) => x._id !== c._id
                                ),
                              });
                              try {
                                await postApi.deleteComment(post._id, c._id);
                                add("Comment deleted", { type: "success" });
                              } catch (err) {
                                console.error("Failed to delete comment", err);
                                add("Failed to delete comment", {
                                  type: "error",
                                });
                                // rollback
                                await fetchPost();
                              }
                            }}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">
                No comments yet. Be the first to comment!
              </p>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!isAuthenticated) return (window.location.href = "/login");
                if (!commentText.trim()) return;

                // optimistic add: create a temporary comment locally
                const tempId = `temp_${Date.now()}`;
                const tempComment = {
                  _id: tempId,
                  content: commentText,
                  user: { _id: user._id, username: user.username },
                };
                const prevComments = post.comments || [];
                setPost({ ...post, comments: [tempComment, ...prevComments] });
                setCommentText("");
                setSubmittingComment(true);
                try {
                  await postApi.addComment(post._id, {
                    content: tempComment.content,
                  });
                  // replace temp comment with server comment by re-fetching
                  await fetchPost();
                  add("Comment posted", { type: "success" });
                  // focus the textarea after posting
                  if (commentInputRef.current) commentInputRef.current.focus();
                } catch (err) {
                  console.error("Failed to add comment", err);
                  add("Failed to post comment", { type: "error" });
                  // rollback optimistic comment
                  setPost({ ...post, comments: prevComments });
                } finally {
                  setSubmittingComment(false);
                }
              }}
              className="mt-4"
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                ref={commentInputRef}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    // Allow Ctrl/Cmd+Enter to submit
                    e.preventDefault();
                    e.target.form.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true })
                    );
                  }
                }}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder={
                  isAuthenticated
                    ? "Write a comment... (Ctrl/Cmd+Enter to submit)"
                    : "Login to leave a comment"
                }
                disabled={!isAuthenticated}
              />
              <div className="mt-2 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {commentText.length}/500
                </div>
                <div className="text-right">
                  <button
                    type="submit"
                    disabled={!isAuthenticated || submittingComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingComment ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Posting...
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                          <polyline points="17 3 21 3 21 7"></polyline>
                          <line x1="7" y1="11" x2="17" y2="11"></line>
                        </svg>
                        Post Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </article>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          View All Posts
        </Link>
      </div>
    </div>
  );
};
