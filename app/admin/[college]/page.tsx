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

  // Security → only admin
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") router.push("/login");
  }, [router]);

  // Load expenses (sorted)
  useEffect(() => {
    const ref = query(
      collection(db, "expenses", college.toUpperCase(), "items"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(ref, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
      setFiltered(list); // default show all
    });

    return () => unsub();
  }, [college]);

  // Total
  const total = filtered.reduce((a, b) => a + b.amount, 0);

  // Filters
  const applyFilters = () => {
    let list = items;

    if (filterDate) {
      const d = new Date(filterDate).toLocaleDateString("en-US");
      list = list.filter((i) => i.displayDate === d);
    }

    if (filterMonth) {
      list = list.filter((i) => {
        const dt = new Date(i.createdAt.toDate ? i.createdAt.toDate() : i.createdAt);
        return dt.getMonth() + 1 === Number(filterMonth);
      });
    }

    if (filterYear) {
      list = list.filter((i) => {
        const dt = new Date(i.createdAt.toDate ? i.createdAt.toDate() : i.createdAt);
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
        className="mb-4 bg-slate-700 p-2 rounded hover:bg-slate-600"
      >
        ← Back
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">
        {college.toUpperCase()} — Expenses
      </h1>

      {/* Total Card */}
      <div className="bg-slate-800 p-5 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold">TOTAL EXPENSES</h2>
        <p className="text-3xl font-bold text-green-400 mt-1">₱{total}</p>
      </div>

      {/* Filter Section */}
      <div className="bg-slate-800 p-5 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Filter Expenses</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          {/* Filter by exact date */}
          <input
            type="date"
            className="p-2 bg-slate-700 rounded"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />

          {/* Filter by month */}
          <select
            className="p-2 bg-slate-700 rounded"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">Month</option>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("en-US", { month: "long" })}
              </option>
            ))}
          </select>

          {/* Filter by year */}
          <input
            className="p-2 bg-slate-700 rounded"
            placeholder="Year (2024)"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          />

          {/* Button */}
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Expense List */}
      <h3 className="text-lg font-semibold mb-3">Expenses</h3>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-slate-400">No expenses found.</p>
        )}

        {filtered.map((e) => (
          <div
            key={e.id}
            className="bg-slate-800 p-4 rounded-xl shadow border border-slate-700"
          >
            <div className="flex justify-between">
              <p className="font-bold">{e.desc}</p>
              <p className="text-green-300 text-lg">₱{e.amount}</p>
            </div>

            <p className="text-sm text-slate-400 mt-1">{e.displayDate}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
