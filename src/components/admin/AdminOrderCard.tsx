"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Package, Truck, CheckCircle, Clock,
  Loader2, History, Edit3, type LucideIcon,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types/wig";
import { formatUSD, formatKES } from "@/utils/priceCalculator";
import { clsx } from "clsx";

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; Icon: LucideIcon }
> = {
  pending:       { label: "Pending Payment",  color: "text-yellow-500  border-yellow-700/40  bg-yellow-950/20",  Icon: Clock       },
  paid:          { label: "Paid — In Queue",  color: "text-blue-400    border-blue-700/40    bg-blue-950/20",    Icon: CheckCircle },
  in_production: { label: "In Production",   color: "text-gold-400    border-gold-700/40    bg-gold-950/20",    Icon: Package     },
  shipped:       { label: "Shipped",          color: "text-green-400   border-green-700/40   bg-green-950/20",   Icon: Truck       },
  delivered:     { label: "Delivered",        color: "text-emerald-400 border-emerald-700/40 bg-emerald-950/20", Icon: CheckCircle },
};

const STATUS_PROGRESSION: OrderStatus[] = ["pending", "paid", "in_production", "shipped", "delivered"];

// ─── Status History Entry ─────────────────────────────────────────────────────
interface StatusHistoryEntry {
  status:    OrderStatus;
  changedAt: string;
  changedBy: string;
  note?:     string;
}

// ─── Spec Row ─────────────────────────────────────────────────────────────────
function SpecRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1 border-b border-gold-800/10 last:border-0">
      <span className="text-ivory/30 text-[11px] uppercase tracking-wider">{label}</span>
      <span className="text-ivory/70 text-[11px] font-medium text-right">{String(value)}</span>
    </div>
  );
}

// ─── Status Timeline ──────────────────────────────────────────────────────────
function StatusTimeline({ history }: { history: StatusHistoryEntry[] }) {
  if (!history.length) {
    return (
      <p className="text-ivory/25 text-xs italic py-2">No status history recorded yet.</p>
    );
  }

  return (
    <ol className="relative border-l border-gold-800/30 ml-3 space-y-3 py-1">
      {history.map((entry, i) => {
        const cfg  = STATUS_CONFIG[entry.status];
        const Icon = cfg.Icon;
        return (
          <li key={i} className="relative pl-5">
            {/* Dot */}
            <span
              className={clsx(
                "absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center",
                cfg.color
              )}
              aria-hidden
            >
              <Icon size={8} />
            </span>
            <p className={clsx("text-[11px] font-medium", cfg.color.split(" ")[0])}>
              {cfg.label}
            </p>
            <p className="text-ivory/25 text-[10px] mt-0.5">
              {new Date(entry.changedAt).toLocaleString("en-KE", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })}
              {entry.changedBy && ` · ${entry.changedBy}`}
            </p>
            {entry.note && (
              <p className="text-ivory/40 text-[10px] mt-0.5 italic">{entry.note}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ─── Admin Order Card ─────────────────────────────────────────────────────────
interface AdminOrderCardProps {
  order:           Order;
  onStatusChange:  (id: string, status: OrderStatus) => Promise<void>;
  adminEmail?:     string;
}

export default function AdminOrderCard({
  order,
  onStatusChange,
  adminEmail = "admin",
}: AdminOrderCardProps) {
  const [expanded,      setExpanded]      = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [adminNote,     setAdminNote]     = useState(order.adminNotes ?? "");
  const [savingNote,    setSavingNote]    = useState(false);
  const [isUpdating,    setIsUpdating]    = useState(false);

  const statusCfg  = STATUS_CONFIG[order.orderStatus];
  const StatusIcon = statusCfg.Icon;
  const cfg        = order.configurationJSON;
  const customer   = order.customerDetails;

  // Parse status history from JSON (field added in Prisma schema upgrade)
  const history: StatusHistoryEntry[] = Array.isArray(order.statusHistory)
    ? (order.statusHistory as StatusHistoryEntry[])
    : [];

  const nextStatus = STATUS_PROGRESSION[
    STATUS_PROGRESSION.indexOf(order.orderStatus) + 1
  ] as OrderStatus | undefined;

  async function handleAdvance() {
    if (!nextStatus) return;
    setIsUpdating(true);
    await onStatusChange(order.id, nextStatus);
    setIsUpdating(false);
  }

  async function handleSaveNote() {
    setSavingNote(true);
    await fetch("/api/save-config", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: order.id, adminNotes: adminNote }),
    });
    // Audit log
    await fetch("/api/admin/audit", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        orderId: order.id,
        action:  "NOTE_ADDED",
        after:   { adminNotes: adminNote },
        meta:    { actor: adminEmail },
      }),
    });
    setSavingNote(false);
    setShowNoteInput(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gold-800/20 bg-white/[0.02] overflow-hidden"
      aria-label={`Order ${order.id.slice(-8).toUpperCase()}`}
    >
      {/* ── Card Header ─────────────────────────────────────────────────── */}
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* ID + Status badge */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-gold-500 font-mono text-xs font-bold">
              #{order.id.slice(-8).toUpperCase()}
            </span>
            <span
              className={clsx(
                "inline-flex items-center gap-1 text-[10px] border px-2 py-0.5",
                statusCfg.color
              )}
              role="status"
              aria-label={`Order status: ${statusCfg.label}`}
            >
              <StatusIcon size={10} aria-hidden />
              {statusCfg.label}
            </span>
          </div>

          <p className="text-ivory font-medium text-sm truncate">{customer.name || "—"}</p>
          <p className="text-ivory/40 text-xs mt-0.5 truncate">
            {customer.phone} · {customer.email}
          </p>
          <p className="text-ivory/30 text-[10px] mt-0.5">
            {customer.deliveryZone} ·{" "}
            {new Date(order.createdAt).toLocaleDateString("en-KE", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-gold-400 font-bold text-base tabular-nums">
            {formatUSD(order.priceBreakdown.total)}
          </p>
          <p className="text-ivory/30 text-[10px] tabular-nums">
            {formatKES(order.priceBreakdown.totalKES)}
          </p>
          <p
            className={clsx(
              "text-[10px] mt-1 font-bold tracking-widest",
              order.paymentStatus === "paid"   ? "text-green-400" :
              order.paymentStatus === "failed" ? "text-red-400"   : "text-yellow-500"
            )}
            aria-label={`Payment: ${order.paymentStatus}`}
          >
            {order.paymentStatus.toUpperCase()}
          </p>
        </div>
      </div>

      {/* ── Quick Spec Chips ──────────────────────────────────────────────── */}
      <div
        className="px-5 py-3 bg-gold-950/10 border-t border-gold-800/10 flex flex-wrap gap-1.5"
        aria-label="Quick spec summary"
      >
        <Chip>{cfg.length}&quot;</Chip>
        <Chip>{cfg.texture}</Chip>
        <Chip>{cfg.density}%</Chip>
        <Chip>{cfg.laceType}</Chip>
        <Chip>{cfg.origin}</Chip>
        <Chip>{cfg.color}</Chip>
      </div>

      {/* ── Toggle buttons row ────────────────────────────────────────────── */}
      <div className="flex border-t border-gold-800/10 divide-x divide-gold-800/10">
        {/* Full spec */}
        <button
          onClick={() => { setExpanded(v => !v); setShowHistory(false); }}
          aria-expanded={expanded}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5
                     text-ivory/40 hover:text-ivory/70 text-[10px] uppercase tracking-widest
                     transition-colors"
        >
          <ChevronDown
            size={12}
            className={clsx("transition-transform duration-200", expanded && "rotate-180")}
            aria-hidden
          />
          Full Spec
        </button>

        {/* Status history */}
        <button
          onClick={() => { setShowHistory(v => !v); setExpanded(false); }}
          aria-expanded={showHistory}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5
                     text-ivory/40 hover:text-ivory/70 text-[10px] uppercase tracking-widest
                     transition-colors"
        >
          <History size={12} aria-hidden />
          History {history.length > 0 && `(${history.length})`}
        </button>

        {/* Admin note */}
        <button
          onClick={() => setShowNoteInput(v => !v)}
          aria-expanded={showNoteInput}
          aria-label="Add or edit admin note"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5
                     text-ivory/40 hover:text-ivory/70 text-[10px] uppercase tracking-widest
                     transition-colors"
        >
          <Edit3 size={12} aria-hidden />
          Note
        </button>
      </div>

      {/* ── Admin Note Input ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNoteInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gold-800/10"
          >
            <div className="px-5 py-4">
              <label
                htmlFor={`note-${order.id}`}
                className="block text-gold-600 text-[10px] uppercase tracking-widest mb-2"
              >
                Internal Note
              </label>
              <textarea
                id={`note-${order.id}`}
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Production instructions, customer preferences..."
                className="w-full bg-white/5 border border-gold-800/30 text-ivory text-xs
                           placeholder-ivory/20 px-3 py-2 resize-none
                           focus:outline-none focus:border-gold-500 transition-colors"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="btn-gold text-xs px-4 py-1.5 tracking-wider"
                >
                  {savingNote ? <Loader2 size={11} className="animate-spin" /> : "Save Note"}
                </button>
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="btn-ghost text-xs px-4 py-1.5 tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full Manufacturing Spec ───────────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-gold-800/10"
          >
            <div className="px-5 pb-5 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Foundation */}
              <div>
                <p className="text-gold-600 text-[9px] tracking-[0.25em] uppercase mb-2">Foundation</p>
                <SpecRow label="Cap"      value={cfg.capSize}    />
                <SpecRow label="Lace"     value={cfg.laceType}   />
                <SpecRow label="Tint"     value={cfg.laceTint}   />
                <SpecRow label="Security" value={cfg.security}   />
              </div>

              {/* DNA */}
              <div>
                <p className="text-gold-600 text-[9px] tracking-[0.25em] uppercase mb-2">DNA</p>
                <SpecRow label="Length"  value={`${cfg.length}"`}   />
                <SpecRow label="Texture" value={cfg.texture}         />
                <SpecRow label="Density" value={`${cfg.density}%`}  />
                <SpecRow label="Origin"  value={cfg.origin}          />
                <SpecRow label="Color"   value={cfg.color}           />
              </div>

              {/* Artistry */}
              <div>
                <p className="text-gold-600 text-[9px] tracking-[0.25em] uppercase mb-2">Artistry</p>
                <SpecRow label="Knots"    value={cfg.knotBleaching}  />
                <SpecRow label="Hairline" value={cfg.hairlineStyle}  />
                <SpecRow label="Edges"    value={cfg.babyHairs}      />
                <SpecRow label="Scent"    value={cfg.scent}          />
                <SpecRow label="Tech"     value={cfg.scalpMapping}   />
                <SpecRow label="Box"      value={cfg.packaging}      />
              </div>
            </div>

            {/* Customer notes */}
            {customer.notes && (
              <div className="mx-5 mb-5 p-3 border border-gold-800/20 bg-white/[0.02]">
                <p className="text-gold-600 text-[9px] tracking-widest uppercase mb-1">Customer Note</p>
                <p className="text-ivory/50 text-xs">{customer.notes}</p>
              </div>
            )}

            {/* M-Pesa receipt */}
            {order.mpesaReceiptNo && (
              <div className="mx-5 mb-5 flex items-center gap-2">
                <span className="text-ivory/30 text-[10px]">M-Pesa Receipt:</span>
                <span className="text-green-400 font-mono text-xs">{order.mpesaReceiptNo}</span>
              </div>
            )}

            {/* Admin note (display only) */}
            {adminNote && !showNoteInput && (
              <div className="mx-5 mb-5 p-3 border border-gold-800/20 bg-white/[0.02]">
                <p className="text-gold-600 text-[9px] tracking-widest uppercase mb-1">
                  Internal Note
                </p>
                <p className="text-ivory/50 text-xs">{adminNote}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Status History Timeline ───────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-gold-800/10"
          >
            <div className="px-5 py-4">
              <p className="text-gold-600 text-[9px] tracking-[0.25em] uppercase mb-3">
                Status History
              </p>
              <StatusTimeline history={history} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Advance Status Action ─────────────────────────────────────────── */}
      {nextStatus && order.paymentStatus === "paid" && (
        <div className="px-5 pb-4 border-t border-gold-800/10 pt-4 flex items-center justify-between">
          <div>
            <p className="text-ivory/30 text-[10px]">
              Next: <span className="text-ivory/50">{STATUS_CONFIG[nextStatus].label}</span>
            </p>
          </div>
          <button
            onClick={handleAdvance}
            disabled={isUpdating}
            className="btn-gold text-xs tracking-wider px-5 py-2"
            aria-label={`Mark order as ${STATUS_CONFIG[nextStatus].label}`}
          >
            {isUpdating ? (
              <Loader2 size={12} className="animate-spin" aria-hidden />
            ) : (
              <>
                Mark as {STATUS_CONFIG[nextStatus].label}
                <Truck size={12} aria-hidden />
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] tracking-wider text-ivory/50 border border-gold-800/30 px-2 py-0.5">
      {children}
    </span>
  );
}
