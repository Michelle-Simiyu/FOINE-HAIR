import Link from "next/link";
import { Gem, MapPin, Phone, Mail } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-gold-800/20 bg-obsidian mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gem size={14} className="text-gold-500" />
            <span className="text-ivory font-bold tracking-[0.25em] uppercase text-sm">
              Foine Hair
            </span>
          </div>
          <p className="text-ivory/30 text-xs leading-relaxed max-w-xs">
            Nairobi&apos;s premier bespoke wig atelier. Every strand selected.
            Every knot hand-tied. Every detail intentional.
          </p>
        </div>

        {/* Links */}
        <div>
          <p className="text-gold-600 text-[10px] tracking-[0.25em] uppercase mb-4">Navigate</p>
          <ul className="space-y-2">
            {[
              { href: "/",            label: "Home"          },
              { href: "/#gallery",    label: "Collection"    },
              { href: "/configurator", label: "Build a Wig"  },
              { href: "/checkout",    label: "Checkout"      },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-ivory/40 text-xs hover:text-gold-400 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-gold-600 text-[10px] tracking-[0.25em] uppercase mb-4">Find Us</p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-ivory/40 text-xs">
              <MapPin size={12} className="text-gold-700 flex-shrink-0" />
              Westlands, Nairobi, Kenya
            </li>
            <li className="flex items-center gap-2 text-ivory/40 text-xs">
              <Phone size={12} className="text-gold-700 flex-shrink-0" />
              +254 700 000 000
            </li>
            <li className="flex items-center gap-2 text-ivory/40 text-xs">
              <Mail size={12} className="text-gold-700 flex-shrink-0" />
              hello@foinehair.co.ke
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gold-800/10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <p className="text-ivory/20 text-[10px] tracking-wider">
          © 2026 Foine Hair. All rights reserved.
        </p>
        <p className="text-ivory/20 text-[10px] tracking-wider">
          Built in Nairobi, Kenya
        </p>
      </div>
    </footer>
  );
}
