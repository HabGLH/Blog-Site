import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuthHook";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link
        to="/"
        className="font-bold text-xl hover:text-blue-200 transition-colors"
      >
        BlogApp
      </Link>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm">
              Welcome, <span className="font-medium">{user?.username}</span>
            </span>
            <Link
              to="/dashboard"
              className="hover:text-blue-200 transition-colors px-3 py-1 rounded hover:bg-blue-700"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="hover:text-blue-200 transition-colors px-3 py-1 rounded hover:bg-blue-700"
            >
              Profile
            </Link>
            <Link
              to="/test"
              className="hover:text-blue-200 transition-colors px-3 py-1 rounded hover:bg-blue-700"
            >
              Test API
            </Link>
            <button
              onClick={handleLogout}
              className="hover:text-blue-200 transition-colors px-3 py-1 rounded hover:bg-blue-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hover:text-blue-200 transition-colors px-3 py-1 rounded hover:bg-blue-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
            >
              Register
            </Link>
            <Link
              to="/test"
              className="hover:text-blue-200 transition-colors px-3 py-1 rounded hover:bg-blue-700"
            >
              Test API
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
