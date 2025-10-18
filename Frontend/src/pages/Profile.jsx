import { useState, useContext } from "react";
import authApi from "../api/authApi";
import { AuthContext } from "../context/AuthContextValue";
import useToast from "../context/useToastHook";

export const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", email: "" });
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // client-side validation
    const errs = { username: "", email: "" };
    if (!username || username.trim().length < 2)
      errs.username = "Username must be at least 2 characters";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email))
      errs.email = "Please provide a valid email address";
    setErrors(errs);
    if (errs.username || errs.email) return;
    setLoading(true);
    try {
      const res = await authApi.updateProfile({ username, email });
      const data = res.data;
      // update local storage and context
      const newUser = {
        _id: data._id,
        username: data.username,
        email: data.email,
      };
      localStorage.setItem("user", JSON.stringify(newUser));
      if (data.token) localStorage.setItem("token", data.token);
      if (setUser) setUser(newUser);
      toast.add("Profile updated", { type: "success" });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile";
      toast.add(message, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            className="mt-1 block w-full rounded border px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={!!errors.username}
            aria-describedby="username-error"
          />
          {errors.username && (
            <div id="username-error" className="text-red-600 text-sm mt-1">
              {errors.username}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 block w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          {errors.email && (
            <div id="email-error" className="text-red-600 text-sm mt-1">
              {errors.email}
            </div>
          )}
        </div>
        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
