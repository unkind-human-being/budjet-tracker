"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default function AdminCollegeView() {
  const params = useParams();
  const router = useRouter();

  const college = params.college as string;

  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // SECURITY → Only Admin
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") router.push("/login");
  }, [router]);

  // LOAD EXPENSES
  useEffect(() => {
    const ref = query(
      collection(db, "expenses", college.toUpperCase(), "items"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(ref, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
      setFiltered(list);
    });

    return () => unsub();
  }, [college]);

  // CALCULATE TOTAL
  const total = filtered.reduce((a, b) => a + b.amount, 0);

  // FILTER SYSTEM
  const applyFilters = () => {
    let list = items;

    if (filterDate) {
      const d = new Date(filterDate).toLocaleDateString("en-US");
      list = list.filter((i) => i.displayDate === d);
    }

    if (filterMonth) {
      list = list.filter((i) => {
        const dt = new Date(
          i.createdAt.toDate ? i.createdAt.toDate() : i.createdAt
        );
        return dt.getMonth() + 1 === Number(filterMonth);
      });
    }

    if (filterYear) {
      list = list.filter((i) => {
        const dt = new Date(
          i.createdAt.toDate ? i.createdAt.toDate() : i.createdAt
        );
        return dt.getFullYear() === Number(filterYear);
      });
    }

    setFiltered(list);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">

      {/* Back Button */}
      <button
        onClick={() => router.push("/admin")}
        className="mb-4 bg-slate-700 p-2 rounded-lg shadow hover:bg-slate-600 transition"
      >
        ← Back
      </button>

      {/* Title */}
      <h1 className="text-3xl font-extrabold mb-2 tracking-wide">
        {college.toUpperCase()} — Expenses
      </h1>

      {/* Total */}
      <div className="bg-slate-800 p-5 rounded-xl shadow-xl border border-white/10 mb-6">
        <h2 className="text-xl font-semibold opacity-90">Total Expenses</h2>
        <p className="text-4xl font-bold mt-1 text-green-400 drop-shadow">
          ₱{total}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-5 rounded-xl shadow-xl border border-white/10 mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter Expenses</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date */}
          <input
            type="date"
            className="p-3 bg-slate-700 rounded-xl border border-white/10 focus:ring focus:ring-blue-500/40"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />

          {/* Month */}
          <select
            className="p-3 bg-slate-700 rounded-xl border border-white/10 focus:ring focus:ring-blue-500/40"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">Month</option>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("en-US", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          {/* Year */}
          <input
            className="p-3 bg-slate-700 rounded-xl border border-white/10 focus:ring focus:ring-blue-500/40"
            placeholder="Year (e.g. 2024)"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          />

          {/* Button */}
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold shadow transition"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* EXPENSE LIST */}
      <h3 className="text-xl font-semibold mb-3">Expenses</h3>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-slate-400">No expenses found.</p>
        )}

        {filtered.map((e) => (
          <div
            key={e.id}
            className="bg-slate-800 p-4 rounded-xl shadow-lg border border-white/10 hover:border-blue-500/30 transition"
          >
            {/* IMAGE PREVIEW */}
            {e.imageUrl && (
              <img
                src={e.imageUrl}
                alt="Expense Photo"
                className="w-32 h-32 object-cover rounded-xl mb-3 border border-white/20 shadow"
              />
            )}

            <div className="flex justify-between items-center">
              <p className="font-bold text-lg">{e.desc}</p>
              <p className="text-green-300 text-2xl font-semibold">
                ₱{e.amount}
              </p>
            </div>

            <p className="text-sm text-slate-400 mt-1">{e.displayDate}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
