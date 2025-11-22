"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const users: Record<string, string> = {
    admin: "admin123",
    cas: "cas123",
    ios: "ios123",
    iict: "iict123",
    coed: "coed123",
    cias: "cias123",
    cof: "cof123",
  };

  const handleLogin = () => {
    if (!users[username]) {
      alert("Invalid username");
      return;
    }

    if (users[username] !== password) {
      alert("Wrong password");
      return;
    }

    localStorage.setItem("role", username);

    if (username === "admin") {
      router.push("/admin");
    } else {
      router.push(`/college/${username}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-xl w-80 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Budget Tracker Login</h2>

        <input
          className="w-full p-2 mb-3 bg-slate-700 rounded"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
        />

        <input
          className="w-full p-2 mb-3 bg-slate-700 rounded"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 py-2 rounded mt-4 hover:bg-blue-700"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </main>
  );
}
