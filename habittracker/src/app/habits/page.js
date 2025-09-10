"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", status: "" });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get current user and fetch habits
  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase
        .from("habit")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: true });
      if (!error) setHabits(data || []);
      setLoading(false);
    };
    fetchHabits();
  }, [router]);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.status) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("habit")
      .insert([
        {
          user_id: user.id,
          name: form.name,
          status: form.status,
        }
      ])
      .select();
    if (!error && data) setHabits([...habits, data[0]]);
    setForm({ name: "", status: "" });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("habit").delete().eq("id", id);
    if (!error) setHabits(habits.filter((h) => h.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Habits Area */}
      <div className="max-w-5xl mx-auto mt-10 bg-white rounded-2xl shadow p-8">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Your Habits</h2>
        <table className="w-full mb-6">
          <thead>
            <tr>
              <th className="bg-blue-500 text-white py-3 px-2 rounded-tl-lg">ID</th>
              <th className="bg-blue-500 text-white py-3 px-2">Habit Name</th>
              <th className="bg-blue-500 text-white py-3 px-2">Status</th>
              <th className="bg-blue-500 text-white py-3 px-2">Created On</th>
              <th className="bg-blue-500 text-white py-3 px-2 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : habits.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No habits yet.
                </td>
              </tr>
            ) : (
              habits.map((habit) => (
                <tr key={habit.id} className="text-center border-b">
                  <td className="py-3">{habit.id}</td>
                  <td className="py-3 font-semibold">{habit.name}</td>
                  <td className="py-3">{habit.status}</td>
                  <td className="py-3">{habit.created_on}</td>
                  <td className="py-3">
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      onClick={() => handleDelete(habit.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Add Habit Button */}
        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded mb-6 ${showForm ? "ring-2 ring-black" : ""}`}
          onClick={() => setShowForm((v) => !v)}
        >
          + Add Habit
        </button>

        {/* Add Habit Form */}
        {showForm && (
          <form
            onSubmit={handleAddHabit}
            className="bg-white border rounded-xl p-6 mt-4 flex flex-col gap-4 max-w-xl mx-auto"
          >
            <input
              type="text"
              placeholder="Enter habit name"
              className="border rounded px-4 py-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <select
              className="border rounded px-4 py-3"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              required
            >
              <option value="">Select status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}