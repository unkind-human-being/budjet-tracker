"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
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

  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // ❗Security
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== college) router.push("/login");
  }, [college, router]);

  // Load expenses
  useEffect(() => {
    const ref = query(
      collection(db, "expenses", college.toUpperCase(), "items"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(ref, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setExpenses(items);
      setFiltered(items); // default show all
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

  // Total
  const total = filtered.reduce((acc, item) => acc + item.amount, 0);

  // Filter logic
  const runFilters = () => {
    let list = expenses;

    if (filterDate) {
      const dateTxt = new Date(filterDate).toLocaleDateString("en-US");
      list = list.filter((i) => i.displayDate === dateTxt);
    }

    if (filterMonth) {
      list = list.filter(
        (i) => new Date(i.createdAt.toDate ? i.createdAt.toDate() : i.createdAt).getMonth() + 1 === Number(filterMonth)
      );
    }

    if (filterYear) {
      list = list.filter(
        (i) => new Date(i.createdAt.toDate ? i.createdAt.toDate() : i.createdAt).getFullYear() === Number(filterYear)
      );
    }

    setFiltered(list);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
        {/* MAIN TITLE */}
      <h1 className="text-4xl font-extrabold text-center mb-6 tracking-wide">
        Budget Tracker
      </h1>
      <h1 className="text-3xl font-bold mb-4">{college.toUpperCase()} Dashboard</h1>

      {/* TOTAL */}
      <div className="bg-slate-800 p-5 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold">Total Expenses</h2>
        <p className="text-3xl font-bold mt-1 text-green-400">₱{total}</p>
      </div>

      {/* ADD EXPENSE FORM */}
      <div className="bg-slate-800 p-5 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Add Expense</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="p-2 rounded bg-slate-700"
            placeholder="Item name"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <input
            className="p-2 rounded bg-slate-700"
            type="number"
            placeholder="Amount"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
          />

          <input
            className="p-2 rounded bg-slate-700"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button
            onClick={addExpense}
            className="bg-green-600 hover:bg-green-700 p-2 rounded font-semibold"
          >
            Add
          </button>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-slate-800 p-5 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Filter Expenses</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            className="p-2 rounded bg-slate-700"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />

          <select
            className="p-2 rounded bg-slate-700"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            <option value="1">January</option><option value="2">February</option>
            <option value="3">March</option><option value="4">April</option>
            <option value="5">May</option><option value="6">June</option>
            <option value="7">July</option><option value="8">August</option>
            <option value="9">September</option><option value="10">October</option>
            <option value="11">November</option><option value="12">December</option>
          </select>

          <input
            className="p-2 rounded bg-slate-700"
            placeholder="Year (2024)"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          />

          <button
            onClick={runFilters}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* EXPENSE LIST */}
      <h3 className="text-lg font-semibold mb-3">Expenses</h3>

      <div className="space-y-3">
        {filtered.map((e) => (
          <div key={e.id} className="bg-slate-800 p-4 rounded-xl shadow border border-slate-700">
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
