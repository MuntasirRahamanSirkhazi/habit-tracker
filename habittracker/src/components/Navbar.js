import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <div className="text-2xl font-bold text-blue-600">Habit Tracker</div>
      <div className="space-x-4">
        <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
          Login
        </Link>
        <Link href="/signup" className="text-gray-700 hover:text-blue-600 font-medium">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}