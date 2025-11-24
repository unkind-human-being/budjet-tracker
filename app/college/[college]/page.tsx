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
  const [image, setImage] = useState<File | null>(null);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [filterDate, setFilterDate] = useState("");

  // SECURITY CHECK
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== college) router.push("/login");
  }, [college, router]);

  // LOAD DATA
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

  // ⭐ CLOUDINARY UPLOAD FUNCTION
  const uploadToCloudinary = async () => {
    if (!image) return "";

    const formData = new FormData();
    formData.append("file", image);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url || "";
  };

  // ⭐ ADD EXPENSE WITH PHOTO
  const addExpense = async () => {
    if (!desc || !amt || !date) {
      alert("Complete all fields");
      return;
    }

    const readableDate = new Date(date).toLocaleDateString("en-US");

    const imageUrl = await uploadToCloudinary(); // 🚀 upload first

    await addDoc(collection(db, "expenses", college.toUpperCase(), "items"), {
      desc,
      amount: Number(amt),
      displayDate: readableDate,
      createdAt: new Date(date),
      imageUrl: imageUrl, // save receipt photo
    });

    setDesc("");
    setAmt("");
    setDate("");
    setImage(null);
  };

  const runFilters = () => {
    let list = expenses;

    if (filterDate) {
      const d = new Date(filterDate).toLocaleDateString("en-US");
      list = list.filter((i) => i.displayDate === d);
    }

    setFiltered(list);
  };

  const total = filtered.reduce((acc, item) => acc + item.amount, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-wide drop-shadow">
          Budget Tracker
        </h1>
        <p className="text-xl mt-2 opacity-80 font-medium">
          {college.toUpperCase()} Dashboard
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* TOTAL */}
        <div className="rounded-2xl bg-slate-800/60 backdrop-blur-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold opacity-90">Total Expenses</h2>
          <p className="text-4xl font-bold mt-1 text-green-300">₱{total}</p>
        </div>

        {/* ADD EXPENSE */}
        <div className="rounded-2xl bg-slate-800/60 backdrop-blur-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              placeholder="Item name"
              className="p-3 rounded-xl bg-slate-700/60 border border-white/10"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <input
              type="number"
              placeholder="Amount"
              className="p-3 rounded-xl bg-slate-700/60 border border-white/10"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
            />

            <input
              type="date"
              className="p-3 rounded-xl bg-slate-700/60 border border-white/10"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {/* IMAGE INPUT */}
            <input
              type="file"
              accept="image/*"
              className="p-3 rounded-xl bg-slate-700/60 border border-white/10"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />

            <button
              onClick={addExpense}
              className="rounded-xl bg-green-600 hover:bg-green-700 p-3 font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="rounded-2xl bg-slate-800/60 backdrop-blur-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-6">Filter</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="date"
              className="p-3 rounded-xl bg-slate-700/60 border border-white/10"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />

            <button
              onClick={runFilters}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 p-3 font-semibold"
            >
              Apply
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
                className="bg-slate-800/50 p-4 rounded-2xl border border-white/10"
              >
                {/* SHOW IMAGE IF AVAILABLE */}
                {e.imageUrl && (
                  <img
                    src={e.imageUrl}
                    className="mb-3 rounded-xl w-32 h-32 object-cover border border-white/20"
                    alt="receipt"
                  />
                )}

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
