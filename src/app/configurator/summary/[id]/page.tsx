import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import type { Order } from "@/types/wig";
import { formatUSD, formatKES } from "@/utils/priceCalculator";

// ─── This is a server component — fetch order from DB ─────────────────────────
async function getOrder(id: string): Promise<Order | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res     = await fetch(`${baseUrl}/api/save-config?id=${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.order as Order;
  } catch {
    return null;
  }
}

// ─── Recipe Row ───────────────────────────────────────────────────────────────
function RecipeRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gold-800/15 last:border-b-0">
      <span className="text-ivory/40 text-xs tracking-wider uppercase">{label}</span>
      <span className="text-ivory/80 text-xs font-medium text-right max-w-[55%]">{value}</span>
    </div>
  );
}

// ─── Summary Page ─────────────────────────────────────────────────────────────
export default async function SummaryPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    // Graceful fallback — direct user to configurator
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gold-500 text-[11px] tracking-[0.35em] uppercase mb-4">
            Configuration Not Found
          </p>
          <h1 className="text-2xl font-semibold text-ivory mb-4">
            This look hasn&apos;t been saved yet.
          </h1>
          <p className="text-ivory/40 text-sm mb-8">
            Build your custom wig and save it to get a shareable link.
          </p>
          <Link href="/configurator" className="btn-gold">
            Start Building <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    );
  }

  const cfg = order.configurationJSON;
  const pb  = order.priceBreakdown;

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <CheckCircle size={36} className="text-gold-500 mx-auto mb-4" />
          <p className="text-gold-500 text-[11px] tracking-[0.35em] uppercase mb-2">
            Wig Recipe #{order.id.slice(-6).toUpperCase()}
          </p>
          <h1 className="text-3xl font-semibold text-ivory">
            {order.wigName ?? "Custom Foine Hair Wig"}
          </h1>
          <p className="text-ivory/40 text-sm mt-2">
            {new Date(order.createdAt).toLocaleDateString("en-KE", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>

        {/* Recipe card */}
        <div className="border border-gold-800/30 bg-white/[0.02] p-6 mb-6">
          <p className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-4">Foundation</p>
          <RecipeRow label="Cap Size"     value={cfg.capSize} />
          <RecipeRow label="Lace Type"    value={cfg.laceType} />
          <RecipeRow label="Lace Tint"    value={cfg.laceTint} />
          <RecipeRow label="Security"     value={cfg.security} />
        </div>

        <div className="border border-gold-800/30 bg-white/[0.02] p-6 mb-6">
          <p className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-4">DNA</p>
          <RecipeRow label="Length"     value={`${cfg.length}"`} />
          <RecipeRow label="Texture"    value={cfg.texture} />
          <RecipeRow label="Density"    value={`${cfg.density}%`} />
          <RecipeRow label="Origin"     value={cfg.origin} />
          <RecipeRow label="Color"      value={cfg.color} />
        </div>

        <div className="border border-gold-800/30 bg-white/[0.02] p-6 mb-6">
          <p className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-4">Artistry</p>
          <RecipeRow label="Knot Bleaching"  value={cfg.knotBleaching} />
          <RecipeRow label="Hairline"         value={cfg.hairlineStyle} />
          <RecipeRow label="Baby Hairs"       value={cfg.babyHairs} />
          <RecipeRow label="Scent"            value={cfg.scent} />
        </div>

        <div className="border border-gold-800/30 bg-white/[0.02] p-6 mb-6">
          <p className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-4">Finish</p>
          <RecipeRow label="Scalp Technology" value={cfg.scalpMapping} />
          <RecipeRow label="Packaging"        value={cfg.packaging} />
        </div>

        {/* Pricing summary */}
        <div className="border border-gold-700/40 bg-gold-950/30 p-6 mb-8">
          <p className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-4">Pricing</p>
          <RecipeRow label="Base"         value={formatUSD(pb.base)} />
          {pb.length    > 0 && <RecipeRow label="Length Upgrade"   value={`+${formatUSD(pb.length)}`} />}
          {pb.density   > 0 && <RecipeRow label="Density Upgrade"  value={`+${formatUSD(pb.density)}`} />}
          {pb.lace      > 0 && <RecipeRow label="Lace Upgrade"     value={`+${formatUSD(pb.lace)}`} />}
          {pb.artistry  > 0 && <RecipeRow label="Artistry"         value={`+${formatUSD(pb.artistry)}`} />}
          {pb.tech      > 0 && <RecipeRow label="Technology"       value={`+${formatUSD(pb.tech)}`} />}
          {pb.packaging > 0 && <RecipeRow label="Packaging"        value={`+${formatUSD(pb.packaging)}`} />}
          {pb.shipping  > 0 && <RecipeRow label="Shipping"         value={`+${formatUSD(pb.shipping)}`} />}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gold-700/30">
            <span className="text-ivory/60 text-sm">Total</span>
            <div className="text-right">
              <p className="text-gold-400 font-bold text-xl">{formatUSD(pb.total)}</p>
              <p className="text-ivory/30 text-xs">{formatKES(pb.totalKES)}</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/configurator" className="btn-ghost flex-1 justify-center text-xs tracking-[0.15em]">
            Edit Configuration
          </Link>
          <Link
            href={`/checkout?config=${order.id}`}
            className="btn-gold flex-1 justify-center text-xs tracking-[0.15em]"
          >
            Order This Wig
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
