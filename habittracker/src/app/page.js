import Navbar from "../components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex flex-col flex-1 items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 text-gray-800">
          Track Your Habits, Achieve Your Goals
        </h1>
        <p className="text-2xl text-gray-600 max-w-2xl">
          HabitTracker helps you stay consistent, build positive habits, and track your progress over time. Start your journey to a better you today!
        </p>
      </main>
      <footer className="bg-gray-800 text-white py-4 text-center">
        &copy; {new Date().getFullYear()} HabitTracker. All rights reserved. |{" "}
        <a
          href="/privacy"
          className="text-blue-400 hover:underline"
        >
          Privacy Policy
        </a>
      </footer>
    </div>
  );
}