"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    // 1. Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    // 2. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 3. Insert into resetpass table
      await supabase
        .from("resetpass")
        .insert([{ user_id: user.id, new_password: password }]);
    }
    setMsg("Password updated! You can now log in.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Set New Password</h2>
        <input
          type="password"
          placeholder="New password"
          className="border rounded px-4 py-2 w-full mb-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded w-full font-semibold" type="submit">
          Set Password
        </button>
        {msg && <div className="mt-4 text-center text-green-600">{msg}</div>}
        {error && <div className="mt-4 text-center text-red-600">{error}</div>}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => router.push("/login")}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}