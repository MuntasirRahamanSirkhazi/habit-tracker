"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Sign up user with Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Get the user id from Supabase Auth
    const userId = signUpData?.user?.id;

    // Check if email already exists in your custom users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", form.email)
      .single();

    if (!existingUser && userId) {
      // Insert into your custom users table (with name and auth user id)
      const { error: dbError } = await supabase
        .from("users")
        .insert([
          {
            auth_user_id: userId, // Make sure your table has this column (type: uuid)
            name: form.name,
            email: form.email,
          }
        ]);
      if (dbError) {
        setError(dbError.message);
        return;
      }
    }

    setSuccess("Account created! Please check your email to verify.");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">
          Create an Account
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full border rounded-md px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border rounded-md px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border rounded-md px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-md transition"
          >
            Sign Up
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}
        </form>
        <p className="text-center mt-6 text-lg">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}