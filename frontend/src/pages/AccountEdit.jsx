import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/config";
import { ArrowLeft, Loader, Upload, User } from "lucide-react";

// Preset avatar options with emojis
const AVATAR_OPTIONS = [
  { id: 1, emoji: '👨', label: 'Man' },
  { id: 2, emoji: '👩', label: 'Woman' },
  { id: 3, emoji: '👦', label: 'Boy' },
  { id: 4, emoji: '👧', label: 'Girl' },
  { id: 5, emoji: '🧔', label: 'Bearded Man' },
  { id: 6, emoji: '👨‍🦰', label: 'Man Red Hair' },
  { id: 7, emoji: '👩‍🦱', label: 'Woman Blonde' },
  { id: 8, emoji: '🧑', label: 'Person' },
];

export default function AccountEdit() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      // Store file for upload
      setFormData(prev => ({
        ...prev,
        avatarFile: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // If a file was selected, upload it first and use returned path
      let finalAvatar = formData.avatar;
      if (formData.avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("avatar", formData.avatarFile);

        const uploadRes = await fetch(`${API_BASE_URL}/users/me/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (uploadRes.ok) {
          const up = await uploadRes.json();
          finalAvatar = up.avatar || finalAvatar;
        } else {
          console.error("Avatar upload failed");
        }
      }

      // Update profile with name, phone and avatar (emoji or uploaded path)
      const updateRes = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          avatar: finalAvatar,
        }),
      });

      if (!updateRes.ok) {
        throw new Error("Failed to update profile");
      }

      // Refresh global user so navbar shows updated avatar immediately
      if (refreshUser) await refreshUser();

      setSuccess("Profile updated successfully!");
      // Short delay to show success message, then navigate
      await new Promise(resolve => setTimeout(resolve, 800));
      navigate("/myaccount");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="container-app py-12">
      <button
        onClick={() => navigate("/myaccount")}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Account
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

          {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Profile Avatar</label>
              <div className="flex items-end gap-6 mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl font-semibold text-gray-400">{user?.name?.charAt(0).toUpperCase() || "U"}</div>
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex-shrink-0">
                  <Upload className="h-5 w-5" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preset Avatar Options */}
              <div>
                <p className="text-sm text-gray-600 mb-3">Or choose a preset:</p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {AVATAR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setAvatarPreview(null);
                        setFormData(prev => ({
                          ...prev,
                          avatar: option.emoji,
                          avatarFile: null
                        }));
                      }}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gray-50 border-2 transition-all hover:scale-110 ${
                        formData.avatar === option.emoji && !formData.avatarFile
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={option.label}
                    >
                      {option.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="h-5 w-5 animate-spin" /> : null}
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/myaccount")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
