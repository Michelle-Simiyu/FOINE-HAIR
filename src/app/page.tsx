import Link from "next/link";
import ProductGallery from "@/components/gallery/ProductGallery";
import { ArrowRight, Gem, Zap, MapPin } from "lucide-react";

// ─── Stat ─────────────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-gold-400 font-bold text-xl tracking-wide">{value}</p>
      <p className="text-ivory/30 text-[10px] tracking-widest uppercase mt-0.5">{label}</p>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,146,14,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,146,14,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Gold accent line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gold-600" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        <p className="text-gold-500 text-[11px] tracking-[0.45em] uppercase mb-6 animate-fade-in">
          Nairobi&apos;s Premier Custom Wig Atelier
        </p>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-ivory leading-none tracking-tight mb-6 animate-slide-up">
          Your Wig.
          <br />
          <span className="text-gold-gradient">Your Rules.</span>
        </h1>

        <p className="text-ivory/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10 animate-fade-in">
          Design a bespoke, hand-crafted wig from scratch — choosing every strand,
          every knot, every inch. Real-time rendering. Nairobi delivery.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
          <Link href="/configurator" className="btn-gold px-10 py-4 text-sm tracking-[0.2em]">
            Start Building
            <ArrowRight size={16} />
          </Link>
          <a href="#gallery" className="btn-ghost px-10 py-4 text-sm tracking-[0.2em]">
            Browse Looks
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-12 px-4">
        <Stat value="500+"    label="Wigs Crafted"       />
        <Stat value="4.9★"   label="Customer Rating"     />
        <Stat value="3–5 Days" label="Nairobi Delivery"  />
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      Icon:  Gem,
      title: "Luxury Craftsmanship",
      body:  "Each wig is hand-knotted by master artisans using Grade 9A+ raw hair.",
    },
    {
      Icon:  Zap,
      title: "Live Visual Builder",
      body:  "See your wig rendered in real time as you configure each detail.",
    },
    {
      Icon:  MapPin,
      title: "Nairobi Delivery",
      body:  "Same-day CBD delivery. G4S upcountry. M-Pesa accepted.",
    },
  ];

  return (
    <section className="py-20 border-t border-gold-800/20 bg-white/[0.01]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {features.map(({ Icon, title, body }) => (
          <div key={title} className="text-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 border border-gold-700/40 text-gold-500 mb-5 group-hover:border-gold-500 transition-colors">
              <Icon size={20} />
            </div>
            <h3 className="text-ivory font-semibold text-sm tracking-widest uppercase mb-2">
              {title}
            </h3>
            <p className="text-ivory/40 text-xs leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <div id="gallery">
        <ProductGallery />
      </div>
    </main>
  );
}
