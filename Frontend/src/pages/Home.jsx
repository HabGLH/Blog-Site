import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { Loader } from "../components/Loader";
import postApi from "../api/postApi";

export const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Read tag from URL query param and fetch posts accordingly
    const tagFromUrl = searchParams.get("tag") || "";
    setSelectedTag(tagFromUrl);
    fetchPosts(tagFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      // If a tag is provided in the URL use it to ask the backend to filter
      const tag = searchParams.get("tag");
      const response = await postApi.getAll(tag ? { tag } : undefined);
      setPosts(response.data);

      // Extract all unique tags
      const tags = [
        ...new Set(response.data.flatMap((post) => post.tags || [])),
      ];
      setAllTags(tags);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch posts. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      !selectedTag || (post.tags && post.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  if (loading) {
    return <Loader text="Loading posts..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to BlogApp
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover amazing stories, insights, and ideas from our community of
          writers. Read, learn, and get inspired by the latest posts.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Posts
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, content, or author..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:w-64">
            <label
              htmlFor="tag-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filter by Tag
            </label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTag(val);
                // update URL query param for tag
                if (val) setSearchParams({ tag: val });
                else setSearchParams({});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {filteredPosts.length === posts.length
              ? "All Posts"
              : `Filtered Posts (${filteredPosts.length})`}
          </h2>
          {(searchTerm || selectedTag) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedTag("");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {posts.length === 0 ? "No Posts Yet" : "No Posts Found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {posts.length === 0
                ? "Be the first to create a post and share your thoughts with the community!"
                : "Try adjusting your search terms or filters to find what you're looking for."}
            </p>
            {posts.length === 0 && (
              <a
                href="/register"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Get Started
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">{posts.length}</div>
            <div className="text-blue-100">Total Posts</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">{allTags.length}</div>
            <div className="text-blue-100">Unique Tags</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">
              {
                [
                  ...new Set(
                    posts
                      .map((post) => {
                        // handle author as object or string
                        if (!post.author) return null;
                        if (typeof post.author === "object")
                          return post.author._id || post.author.id || null;
                        return post.author; // assume string id
                      })
                      .filter(Boolean)
                  ),
                ].length
              }
            </div>
            <div className="text-blue-100">Active Authors</div>
          </div>
        </div>
      </div>
    </div>
  );
};
