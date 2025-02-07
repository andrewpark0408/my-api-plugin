"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  // State for manual login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials. Please try again.");
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6">
          <h1 className="text-xl font-bold mb-4 text-center">Welcome to the App</h1>

          {/* Google Sign-In */}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full mb-4"
            onClick={() => signIn("google")}
          >
            Sign In with Google
          </button>

          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="w-full">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full mb-2"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full mb-2"
              required
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg w-full"
            >
              Sign In with Email
            </button>
          </form>

          {/* Display error if login fails */}
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold">Welcome, {session.user.name}!</h1>
      <p>Your role is: {session.user.role}</p>

      {/* ✅ Only show admin link if the user is an admin */}
      {session.user.role === "admin" && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Admin Section</h2>
          <p>You have access to admin-specific content.</p>
          <button
            onClick={() => router.push("/admin")}
            className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2"
          >
            Go to Admin Page
          </button>
        </div>
      )}

      <button
        className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    </div>
  );
}
