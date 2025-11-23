"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default function CollegeDashboard() {
  const params = useParams();
  const router = useRouter();
  const college = params.college as string;

  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const [date, setDate] = useState("");

  const [expenses, setExpenses] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Security
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== college) router.push("/login");
  }, [college, router]);

  // Load expenses (sorted newest)
  useEffect(() => {
    const ref = query(
      collection(db, "expenses", college.toUpperCase(), "items"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(ref, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setExpenses(items);
      setFiltered(items);
    });

    return () => unsub();
  }, [college]);

  // Add expense
  const addExpense = async () => {
    if (!desc || !amt || !date) {
      alert("Complete all fields including date");
      return;
    }

    const readableDate = new Date(date).toLocaleDateString("en-US");

    await addDoc(collection(db, "expenses", college.toUpperCase(), "items"), {
      desc,
      amount: Number(amt),
      displayDate: readableDate,
      createdAt: new Date(date),
    });

    setDesc("");
    setAmt("");
    setDate("");
  };

  // Filter logic
  const runFilters = () => {
    let list = expenses;

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

  const total = filtered.reduce((acc, item) => acc + item.amount, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-wide drop-shadow">
          Budget Tracker
        </h1>
        <p className="text-xl mt-2 opacity-80 font-medium">
          {college.toUpperCase()} Dashboard
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* TOTAL CARD */}
        <div className="rounded-2xl bg-slate-800/60 backdrop-blur-xl p-6 shadow-xl border border-white/10">
          <h2 className="text-xl font-semibold opacity-90">
            Total Expenses (Filtered)
          </h2>
          <p className="text-4xl font-bold mt-1 text-green-300 drop-shadow-sm">
            ₱{total}
          </p>
        </div>

        {/* ADD EXPENSE */}
        <div className="rounded-2xl bg-slate-800/60 backdrop-blur-xl p-6 shadow-xl border border-white/10">
          <h3 className="text-lg font-semibold mb-4 opacity-90">
            Add New Expense
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              className="p-3 rounded-xl bg-slate-700/60 border border-white/10 focus:outline-none focus:ring focus:ring-blue-500/40"
              placeholder="Item name"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <input
              className="p-3 rounded-xl bg-slate-700/60 border border-white/10 focus:outline-none focus:ring focus:ring-blue-500/40"
              type="number"
              placeholder="Amount"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
            />

            <input
              className="p-3 rounded-xl bg-slate-700/60 border border-white/10 focus:outline-none focus:ring focus:ring-blue-500/40"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button
              onClick={addExpense}
              className="rounded-xl bg-green-600 hover:bg-green-700 p-3 font-semibold transition duration-200 shadow"
            >
              Add
            </button>
          </div>
        </div>

        {/* FILTERS */}
<div className="rounded-2xl bg-slate-800/60 backdrop-blur-xl p-6 shadow-xl border border-white/10">
  <h3 className="text-lg font-semibold mb-6 opacity-90">
    Filter Expenses
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

    {/* DATE FILTER */}
    <input
      className="p-3 rounded-xl bg-slate-700/60 border border-white/10 
                 focus:outline-none focus:ring-2 focus:ring-blue-500/40
                 placeholder:text-slate-400"
      type="date"
      placeholder="dd/mm/yyyy"
      value={filterDate}
      onChange={(e) => setFilterDate(e.target.value)}
    />

    

    {/* APPLY BUTTON */}
    <button
      onClick={runFilters}
      className="rounded-xl bg-blue-600 hover:bg-blue-700 p-3 font-semibold 
                 transition duration-200 shadow text-center"
    >
      Apply Filters
    </button>
  </div>
</div>


        {/* LIST */}
        <div>
          <h3 className="text-lg font-semibold mb-3 opacity-90">Expenses</h3>

          <div className="space-y-4">
            {filtered.map((e) => (
              <div
                key={e.id}
                className="bg-slate-800/50 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/10 hover:border-blue-500/30 transition"
              >
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">{e.desc}</p>
                  <p className="text-green-300 font-semibold text-xl">
                    ₱{e.amount}
                  </p>
                </div>
                <p className="text-sm text-slate-400 mt-1">{e.displayDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
