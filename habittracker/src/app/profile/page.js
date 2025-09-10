"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "", id: "" });
  const [stats, setStats] = useState({ habits: 0, completed: 0, pending: 0 });
  const [showEdit, setShowEdit] = useState(false);
  const [newName, setNewName] = useState("");
  const [editMsg, setEditMsg] = useState("");

  // Fetch user profile and stats
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      // Fetch user profile from users table
      const { data } = await supabase
        .from("users")
        .select("name, email")
        .eq("email", authUser.email)
        .single();
      setUser({ name: data?.name || "", email: data?.email || "", id: authUser.id });

      // Fetch habit stats
      const { count: habitsCount } = await supabase
        .from("habit")
        .select("*", { count: "exact", head: true })
        .eq("user_id", authUser.id);
      const { count: completedCount } = await supabase
        .from("habit")
        .select("*", { count: "exact", head: true })
        .eq("user_id", authUser.id)
        .eq("status", "Completed");
      const { count: pendingCount } = await supabase
        .from("habit")
        .select("*", { count: "exact", head: true })
        .eq("user_id", authUser.id)
        .eq("status", "Pending");
      setStats({
        habits: habitsCount || 0,
        completed: completedCount || 0,
        pending: pendingCount || 0,
      });
    };
    fetchProfile();
  }, [router, editMsg]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditMsg("");
    if (!newName.trim()) {
      setEditMsg("Name cannot be empty.");
      return;
    }
    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    // 1. Update the name in users table
    const { error: updateError } = await supabase
      .from("users")
      .update({ name: newName })
      .eq("email", authUser.email);

    // 2. Insert into editname table for history
    await supabase
      .from("editname")
      .insert([{ user_id: authUser.id, new_name: newName }]);

    if (updateError) {
      setEditMsg("Failed to update name.");
    } else {
      setEditMsg("Name updated!");
      setShowEdit(false);
      setNewName("");
      // The useEffect will refetch and show the new name
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 px-8 py-4 flex items-center justify-between">
        <span className="text-3xl font-bold text-white">HabitTracker</span>
        <div className="space-x-8">
          <button
            className="text-white font-semibold text-lg hover:underline"
            onClick={() => router.push("/habits")}
          >
            Dashboard
          </button>
          <button
            className="text-white font-semibold text-lg hover:underline"
            onClick={() => router.push("/profile")}
          >
            Profile
          </button>
          <button
            className="text-white font-semibold text-lg hover:underline"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Profile Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-10 w-full max-w-2xl flex flex-col items-center mt-10 mb-10">
          <div className="flex flex-col items-center mb-6">
            <div className="w-36 h-36 rounded-full border-4 border-blue-600 flex items-center justify-center mb-2">
              <span className="text-gray-700 text-lg">User Profile</span>
            </div>
            <h2 className="text-3xl font-bold mt-2 mb-1">{user.name}</h2>
            <p className="text-gray-500 text-lg">{user.email}</p>
          </div>
          <div className="flex justify-center gap-16 mt-6 mb-2">
            <div className="flex flex-col items-center">
              <span className="text-blue-600 text-2xl font-bold">{stats.habits}</span>
              <span className="text-gray-500 text-lg">Habits</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-blue-600 text-2xl font-bold">{stats.completed}</span>
              <span className="text-gray-500 text-lg">Completed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-blue-600 text-2xl font-bold">{stats.pending}</span>
              <span className="text-gray-500 text-lg">Pending</span>
            </div>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded mt-6"
            onClick={() => setShowEdit(true)}
          >
            Edit Profile
          </button>
          {editMsg && (
            <div className="mt-4 text-center text-blue-600 font-semibold">{editMsg}</div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form
            onSubmit={handleEditProfile}
            className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center"
          >
            <h3 className="text-2xl font-bold mb-4">Edit Name</h3>
            <input
              type="text"
              className="border rounded px-4 py-2 mb-4 w-64"
              placeholder="Enter new name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-4 text-center">
        &copy; 2025 HabitTracker. All rights reserved.
      </footer>
    </div>
  );
}