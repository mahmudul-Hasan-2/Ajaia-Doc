"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function verifyExistingSession() {
      const storedUser = localStorage.getItem("ajaia_user");
      if (!storedUser) return;

      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.id) {
          localStorage.removeItem("ajaia_user");
          return;
        }

        // Supabase ডাটাবেসে ইউজার রিয়েল-টাইম ভ্যালিডেশন
        const { data: dbUser, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", parsedUser.id)
          .single();

        if (error || !dbUser) {
          // যদি ডাটাবেসে ইউজার না থাকে, তবে লোকালস্টোরেজ থেকে রিমুভ করে দেবে
          localStorage.removeItem("ajaia_user");
        } else {
          // ইউজার সত্যিকೆಯೇ থাকলে সরাসরি ড্যাশবোর্ডে পাঠাবে
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Session verification error:", err);
        localStorage.removeItem("ajaia_user");
      }
    }

    verifyExistingSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Please enter a valid email.");
      setLoading(false);
      return;
    }

    if (isRegister) {
      // ১. নতুন অ্যাকাউন্ট তৈরি (Register)
      if (!name.trim()) {
        setErrorMsg("Name is required for registration.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .insert([{ name: name.trim(), email: cleanEmail }])
        .select()
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else if (data) {
        localStorage.setItem("ajaia_user", JSON.stringify(data));
        router.push("/dashboard");
      }
    } else {
      // ২. ইমেইল দিয়ে লগইন (Login)
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", cleanEmail)
        .single();

      if (error || !data) {
        setErrorMsg("Account not found. Please register first.");
      } else {
        localStorage.setItem("ajaia_user", JSON.stringify(data));
        router.push("/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Ajaia Docs</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          {isRegister
            ? "Create a new workspace account"
            : "Sign in to your private workspace"}
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg("");
            }}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            {isRegister
              ? "Already have an account? Sign In"
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
