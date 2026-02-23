"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdminOrderCard from "@/components/admin/AdminOrderCard";
import type { Order, OrderStatus } from "@/types/wig";
import { Loader2, LayoutGrid, AlertCircle, LogOut, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all",           label: "All"        },
  { value: "paid",          label: "Paid"       },
  { value: "in_production", label: "Production" },
  { value: "shipped",       label: "Shipped"    },
  { value: "delivered",     label: "Delivered"  },
  { value: "pending",       label: "Pending"    },
];

// ─── Admin Orders Page ─────────────────────────────────────────────────────────
// Route is protected by src/middleware.ts — unauthenticated requests are
// redirected to /admin/login before this component even mounts.
export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders,       setOrders]       = useState<Order[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [filter,       setFilter]       = useState<OrderStatus | "all">("all");
  const [adminEmail,   setAdminEmail]   = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Verify session & grab email ─────────────────────────────────────────────
  useEffect(() => {
    async function checkSession() {
      try {
        const res  = await fetch("/api/admin/auth");
        const data = await res.json() as { authenticated?: boolean; email?: string };
        if (!res.ok || !data.authenticated) {
          router.replace("/admin/login");
          return;
        }
        setAdminEmail(data.email ?? "admin");
      } catch {
        router.replace("/admin/login");
      }
    }
    checkSession();
  }, [router]);

  // ── Fetch orders ─────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      else        setIsRefreshing(true);

      const res  = await fetch("/api/save-config");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch orders.");
      setOrders(data.orders as Order[]);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Status change + audit ────────────────────────────────────────────────────
  async function handleStatusChange(id: string, status: OrderStatus) {
    const before = orders.find(o => o.id === id)?.orderStatus;

    await fetch("/api/save-config", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, orderStatus: status }),
    });

    // Record audit entry — failure must never block the UI
    fetch("/api/admin/audit", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        orderId: id,
        action:  "STATUS_CHANGE",
        before:  { orderStatus: before },
        after:   { orderStatus: status },
        meta:    { changedAt: new Date().toISOString(), changedBy: adminEmail },
      }),
    }).catch(() => {});

    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, orderStatus: status } : o)
    );
  }

  // ── Sign out ─────────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filtered = filter === "all"
    ? orders
    : orders.filter(o => o.orderStatus === filter);

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-gold-500 text-[11px] tracking-[0.35em] uppercase mb-1">
              Production Console
            </p>
            <h1 className="text-2xl font-semibold text-ivory">Order Dashboard</h1>
            {adminEmail && (
              <p className="text-ivory/30 text-xs mt-1">
                Signed in as <span className="text-ivory/50">{adminEmail}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Refresh */}
            <button
              onClick={() => fetchOrders(true)}
              aria-label="Refresh orders"
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-ivory/40 hover:text-gold-400 text-xs transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <p className="text-ivory/20 text-xs hidden sm:block">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              aria-label="Sign out of admin"
              className="flex items-center gap-1.5 text-ivory/30 hover:text-red-400 text-xs transition-colors"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
        <div
          role="tablist"
          aria-label="Filter orders by status"
          className="flex gap-1 mb-6 overflow-x-auto pb-2"
        >
          {FILTERS.map(f => {
            const count = f.value === "all"
              ? orders.length
              : orders.filter(o => o.orderStatus === f.value).length;

            return (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={clsx(
                  "flex-shrink-0 flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase border transition-all duration-200",
                  filter === f.value
                    ? "border-gold-500 text-gold-400 bg-gold-950/30"
                    : "border-gold-800/30 text-ivory/40 hover:border-gold-700/50 hover:text-ivory/60"
                )}
              >
                {f.label}
                <span
                  className={clsx(
                    "text-[10px] tabular-nums rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none",
                    filter === f.value
                      ? "bg-gold-700/30 text-gold-300"
                      : "bg-white/5 text-ivory/20"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40 gap-3 text-ivory/40">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading orders…</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-6 border border-red-700/40 bg-red-950/10 text-red-400">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Failed to load orders</p>
              <p className="text-xs text-red-400/60 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => fetchOrders()}
              className="text-xs text-red-400 hover:text-red-300 underline flex-shrink-0"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-ivory/30">
            <LayoutGrid size={28} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">No orders match this filter.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {filtered.map(order => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  adminEmail={adminEmail}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
