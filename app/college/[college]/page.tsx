"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default function CollegeDashboard() {
  const params = useParams();
  const router = useRouter();

  const college = params.college as string;

  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);

  // ❗Security: check logged role
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== college) router.push("/login");
  }, [college, router]);

  // Load data
  useEffect(() => {
    const ref = collection(db, "expenses", college.toUpperCase(), "items");

    const unsub = onSnapshot(ref, (snap) => {
      setExpenses(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [college]);

  const addExpense = async () => {
    if (!desc || !amt) return;

    await addDoc(collection(db, "expenses", college.toUpperCase(), "items"), {
      desc,
      amount: Number(amt),
      createdAt: new Date(),
    });

    setDesc("");
    setAmt("");
  };

  const total = expenses.reduce((acc, item) => acc + item.amount, 0);

  return (
    <main className="p-6 text-white bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold">College: {college.toUpperCase()}</h1>

      <h2 className="text-xl mt-4">Total Expenses: ₱{total}</h2>

      <div className="mt-6">
        <input
          className="p-2 bg-slate-700 rounded mr-2"
          placeholder="Item"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <input
          className="p-2 bg-slate-700 rounded mr-2"
          placeholder="Amount"
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
        />
        <button
          onClick={addExpense}
          className="bg-green-600 p-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>

      <div className="mt-6">
        {expenses.map((e) => (
          <div key={e.id} className="p-2 border-b border-slate-600">
            {e.desc} — ₱{e.amount}
          </div>
        ))}
      </div>
    </main>
  );
}
