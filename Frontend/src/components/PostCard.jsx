import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import postApi from "../api/postApi";
import useAuth from "../context/useAuthHook";
import useToast from "../context/useToastHook";

export const PostCard = ({ post: initialPost }) => {
  const { user, isAuthenticated } = useAuth();
  const { add } = useToast();
  const [post, setPost] = useState(initialPost);
  const [liking, setLiking] = useState(false);
  const likeTimer = useRef(null);
  const pendingToggle = useRef(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const authorName = (() => {
    if (!post.author) return "Unknown Author";
    if (typeof post.author === "object") {
      return post.author.username || post.author.email || "Unknown Author";
    }
    return `User ${String(post.author).slice(0, 6)}`;
  })();

  const avatarInitial = authorName ? authorName.charAt(0).toUpperCase() : "U";

  const userLiked = () => {
    if (!user) return false;
    return (
      post.likes && post.likes.some((id) => String(id) === String(user._id))
    );
  };

  // Debounced like toggle: coalesce rapid clicks and avoid flooding backend
  const handleToggleLike = () => {
    if (!isAuthenticated) return (window.location.href = "/login");

    // flip UI immediately for snappy feel
    const prevLikes = post.likes || [];
    const likedBefore = userLiked();
    const nextLikes = likedBefore
      ? prevLikes.filter((id) => String(id) !== String(user._id))
      : [...prevLikes, user._id];
    setPost({ ...post, likes: nextLikes });

    // mark a pending toggle and debounce the network call
    pendingToggle.current = !likedBefore; // store desired action roughly
    if (likeTimer.current) {
      clearTimeout(likeTimer.current);
    }

    likeTimer.current = setTimeout(async () => {
      setLiking(true);
      try {
        await postApi.toggleLike(post._id);
        add(pendingToggle.current ? "Liked post" : "Removed like", {
          type: "success",
        });
      } catch (err) {
        console.error("Failed to toggle like", err);
        // rollback UI: fetch latest from server via postApi
        try {
          const res = await postApi.getById(post._id);
          setPost(res.data);
        } catch (fetchErr) {
          console.error("Failed to rollback like UI", fetchErr);
        }
        add("Failed to toggle like", { type: "error" });
      } finally {
        setLiking(false);
        pendingToggle.current = false;
      }
    }, 450); // 450ms debounce
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600">
          <Link to={`/post/${post._id}`}>{post.title}</Link>
        </h3>
        <span className="text-sm text-gray-500">
          {formatDate(post.createdAt)}
        </span>
      </div>

      <p className="text-gray-600 mb-4 leading-relaxed">
        {truncateContent(post.content)}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {avatarInitial}
          </div>
          <span className="text-sm text-gray-600">{authorName}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleLike}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && handleToggleLike()
            }
            disabled={liking}
            aria-pressed={userLiked()}
            aria-label={userLiked() ? "Unlike post" : "Like post"}
            className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 transform-gpu ${
              userLiked()
                ? "bg-red-100 text-red-600 scale-105"
                : "bg-gray-100 text-gray-600"
            }`}
            style={{
              transition: "transform 120ms ease, background-color 180ms ease",
            }}
          >
            <span
              aria-hidden
              className={`text-lg ${
                userLiked() ? "text-red-600" : "text-gray-600"
              }`}
              style={{ transition: "color 180ms ease" }}
            >
              {userLiked() ? (
                // heart filled (SVG)
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
                // heart outline (SVG)
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
            <span>{post.likes ? post.likes.length : 0}</span>
          </button>

          <Link
            to={`/post/${post._id}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Read More →
          </Link>
          <Link
            to={`/post/${post._id}#comments`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded transition-transform transform-gpu hover:-translate-y-0.5"
            aria-label="View comments"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{post.comments ? post.comments.length : 0}</span>
          </Link>
        </div>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <Link
              key={index}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
