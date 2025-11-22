"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

const colleges = ["cas", "ios", "iict", "coed", "cias", "cof"];

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>({});

  // Security
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") router.push("/login");
  }, [router]);

  // Load all colleges
  useEffect(() => {
    colleges.forEach((college) => {
      const ref = collection(db, "expenses", college.toUpperCase(), "items");
      onSnapshot(ref, (snap) => {
        setData((prev: any) => ({
          ...prev,
          [college]: snap.docs.map((d) => d.data()),
        }));
      });
    });
  }, []);

  return (
    <main className="p-6 min-h-screen bg-slate-900 text-white">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {colleges.map((c) => {
          const total = data[c]?.reduce((a: number, b: any) => a + b.amount, 0) ?? 0;

          return (
            <div key={c} className="bg-slate-800 p-4 rounded-xl">
              <h2 className="text-xl font-bold">{c.toUpperCase()}</h2>
              <p>Total: ₱{total}</p>

              <button
                className="mt-2 bg-blue-600 p-2 rounded w-full"
                onClick={() => router.push(`/admin/${c}`)}
              >
                View Details
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
