import { useState } from 'react';
import { useAuth } from '../context/useAuthHook';
import authApi from '../api/authApi';
import postApi from '../api/postApi';

export const ApiTest = () => {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      await authApi.login('test@example.com', 'password123');
      addResult('Login API', 'success', 'Login endpoint accessible');
    } catch (err) {
      addResult('Login API', 'error', err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const testRegister = async () => {
    setLoading(true);
    try {
      await authApi.register('testuser', 'test@example.com', 'password123');
      addResult('Register API', 'success', 'Register endpoint accessible');
    } catch (err) {
      addResult('Register API', 'error', err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const testGetPosts = async () => {
    setLoading(true);
    try {
      const resp = await postApi.getAll();
      addResult('Get Posts API', 'success', `Found ${resp.data.length} posts`);
    } catch (err) {
      addResult('Get Posts API', 'error', err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const testCreatePost = async () => {
    if (!isAuthenticated) {
      addResult('Create Post API', 'error', 'User not authenticated');
      return;
    }
    
    setLoading(true);
    try {
      const testPost = {
        title: 'Test Post',
        content: 'This is a test post to verify the API connection.',
        tags: ['test', 'api']
      };
      await postApi.create(testPost);
      addResult('Create Post API', 'success', 'Post created successfully');
    } catch (err) {
      addResult('Create Post API', 'error', err.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">API Connection Test</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Current Status</h2>
        <p className="text-blue-700">
          <strong>Authentication:</strong> {isAuthenticated ? 'Logged In' : 'Not Logged In'}
        </p>
        {user && (
          <p className="text-blue-700">
            <strong>User:</strong> {user.username} ({user.email})
          </p>
        )}
        <p className="text-blue-700">
          <strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Login
        </button>
        <button
          onClick={testRegister}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Register
        </button>
        <button
          onClick={testGetPosts}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Get Posts
        </button>
        <button
          onClick={testCreatePost}
          disabled={loading}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Test Create Post
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Test Results</h2>
        <button
          onClick={clearResults}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {testResults.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No tests run yet. Click a test button above to start.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <strong>{result.test}</strong>: {result.message}
                </div>
                <span className="text-xs opacity-75">{result.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Testing API connection...</p>
        </div>
      )}
    </div>
  );
};
