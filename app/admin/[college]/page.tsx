"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default function AdminCollegeView() {
  const params = useParams();
  const router = useRouter();

  const college = params.college as string;

  const [items, setItems] = useState<any[]>([]);

  // Security → only admin can view
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") router.push("/login");
  }, [router]);

  // Load expenses for this college
  useEffect(() => {
    const ref = collection(db, "expenses", college.toUpperCase(), "items");

    const unsub = onSnapshot(ref, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [college]);

  const total = items.reduce((a, b) => a + b.amount, 0);

  return (
    <main className="p-6 min-h-screen bg-slate-900 text-white">
      <button
        onClick={() => router.push("/admin")}
        className="mb-4 bg-slate-700 p-2 rounded"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">
        {college.toUpperCase()} — Expenses
      </h1>

      <h2 className="mt-2 text-xl font-semibold">
        Total: ₱{total}
      </h2>

      <div className="mt-6 space-y-3">
        {items.length === 0 && (
          <p className="text-slate-400">No expenses recorded.</p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-800 p-3 rounded-lg border border-slate-700"
          >
            <p className="font-semibold">{item.desc}</p>
            <p className="text-green-300">₱{item.amount}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
