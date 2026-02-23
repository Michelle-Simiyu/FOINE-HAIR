"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gem, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [status,   setStatus]   = useState<"idle" | "loading" | "error">("idle");
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res  = await fetch("/api/admin/auth", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid credentials.");
        setStatus("error");
        return;
      }

      router.replace("/admin/orders");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-obsidian">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,146,14,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,146,14,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Gem size={24} className="text-gold-500 mx-auto mb-4" />
          <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase mb-1">
            Production Console
          </p>
          <h1 className="text-xl font-semibold text-ivory">Admin Login</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-[11px] tracking-[0.2em] uppercase text-gold-600 mb-1.5"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@foinehair.co.ke"
              required
              autoComplete="username"
              className="w-full bg-white/5 border border-gold-800/30 text-ivory
                         placeholder-ivory/20 px-4 py-3 text-sm
                         focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[11px] tracking-[0.2em] uppercase text-gold-600 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-gold-800/30 text-ivory
                           placeholder-ivory/20 px-4 py-3 pr-10 text-sm
                           focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60 transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="text-red-400 text-xs border border-red-700/30 bg-red-950/20 px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={status === "loading" || !email || !password}
            whileTap={{ scale: 0.97 }}
            className="btn-gold w-full mt-2 text-sm tracking-[0.15em]"
          >
            {status === "loading" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <p className="text-ivory/20 text-[10px] text-center mt-6">
          Access restricted to authorised personnel only.
        </p>
      </motion.div>
    </main>
  );
}
