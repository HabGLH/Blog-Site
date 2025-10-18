import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/useAuthHook';
import { PostForm } from '../components/PostForm';
import { PostCard } from '../components/PostCard';
import { Loader } from '../components/Loader';
import postApi from '../api/postApi';

export const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await postApi.getAll();
      // Filter posts to show only user's posts if API returns all posts
      const userPosts = response.data.filter((post) => {
        if (!post.author) return false;

        // if author is an object (populated), try to compare by _id or username
        if (typeof post.author === 'object') {
          const authorId = post.author._id || post.author.id || '';
          if (authorId && String(authorId) === String(user?._id)) return true;
          if (post.author.username && post.author.username === user?.username) return true;
          return false;
        }

        // if author is a string (ObjectId), compare directly to user._id
        return String(post.author) === String(user?._id);
      });
      setPosts(userPosts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch posts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated, fetchPosts]);

  const handleCreatePost = async (postData) => {
    try {
      setFormLoading(true);
      setError('');
      setSuccessMessage('');
      await postApi.create(postData);
      await fetchPosts();
      setShowForm(false);
      setSuccessMessage('Post created successfully!');
    } catch (err) {
      console.error('Failed to create post:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to create post. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePost = async (postData) => {
    try {
      setFormLoading(true);
      setError('');
      setSuccessMessage('');
      await postApi.update(editingPost._id, postData);
      await fetchPosts();
      setEditingPost(null);
      setShowForm(false);
      setSuccessMessage('Post updated successfully!');
    } catch (err) {
      console.error('Failed to update post:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to update post. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      setError('');
      setSuccessMessage('');
      await postApi.remove(postId);
      await fetchPosts();
      setSuccessMessage('Post deleted successfully!');
    } catch (err) {
      console.error('Failed to delete post:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to delete post. Please try again.');
      }
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowForm(true);
    setError('');
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setShowForm(false);
    setError('');
    setSuccessMessage('');
  };

  const handleCreateNewPost = () => {
    setEditingPost(null);
    setShowForm(true);
    setError('');
    setSuccessMessage('');
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">Please log in to access the dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <Loader text="Loading dashboard..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </div>
        <button
          onClick={handleCreateNewPost}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Create New Post
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <button
              onClick={handleCancelEdit}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              title="Close form"
            >
              ×
            </button>
          </div>
          <PostForm
            post={editingPost}
            onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
            isLoading={formLoading}
          />
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Your Posts</h2>
          {posts.length > 0 && (
            <span className="text-sm text-gray-500">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          )}
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Posts Yet</h3>
            <p className="text-gray-600 mb-6">Start sharing your thoughts with the community!</p>
            <button
              onClick={handleCreateNewPost}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div key={post._id} className="relative group">
                <PostCard post={post} />
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                    title="Edit post"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    title="Delete post"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
