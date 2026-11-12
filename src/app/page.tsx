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
  const [demoUsers, setDemoUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // যদি আগে থেকেই লগইন করা থাকে, সরাসরি ড্যাশবোর্ডে পাঠাবে
    if (localStorage.getItem("ajaia_user")) {
      router.push("/dashboard");
      return;
    }
    fetchDemoUsers();
  }, [router]);

  async function fetchDemoUsers() {
    const { data } = await supabase.from("users").select("*").limit(3);
    if (data) setDemoUsers(data);
  }

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
      // ২. ইমেইল দিয়ে লগইন (Login)
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

  const handleQuickLogin = (user: any) => {
    localStorage.setItem("ajaia_user", JSON.stringify(user));
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Ajaia Docs</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          {isRegister
            ? "Create a new workspace account"
            : "Sign in to your workspace"}
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center">
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

        {/* One-Click Demo Accounts for Reviewers */}
        {demoUsers.length > 0 && (
          <div className="mt-6 border-t pt-5">
            <p className="mb-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Quick Reviewer Login
            </p>
            <div className="space-y-2">
              {demoUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-xs hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-800">{user.name}</span>
                  <span className="text-gray-500">{user.email} &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
