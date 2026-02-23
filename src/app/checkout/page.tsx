"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useWigStore } from "@/store/useWigStore";
import { SHIPPING_RATES } from "@/utils/shippingRules";
import { formatUSD, formatKES } from "@/utils/priceCalculator";
import type { ShippingZone } from "@/types/wig";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/checkoutSchema";
import {
  MapPin, Smartphone, CreditCard, Loader2, CheckCircle,
  AlertCircle, ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

// ─── Field wrapper with error display ────────────────────────────────────────
interface FieldProps {
  id:           string;
  label:        string;
  error?:       string;
  required?:    boolean;
  children:     React.ReactNode;
}
function FieldWrap({ id, label, error, required, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] tracking-[0.2em] uppercase text-gold-600 mb-1.5"
      >
        {label}
        {required && <span className="text-gold-500 ml-0.5" aria-hidden>*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{    opacity: 0, height: 0 }}
            className="text-red-400 text-[11px] mt-1.5 flex items-center gap-1.5"
          >
            <AlertCircle size={11} className="flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Input style ──────────────────────────────────────────────────────────────
const inputCls = (hasError?: boolean) =>
  clsx(
    "w-full bg-white/5 border text-ivory placeholder-ivory/20",
    "px-4 py-3 text-sm focus:outline-none transition-colors",
    hasError
      ? "border-red-600/60 focus:border-red-500"
      : "border-gold-800/30 focus:border-gold-500"
  );

// ─── Recipe Row ───────────────────────────────────────────────────────────────
function RecipeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gold-800/10 last:border-0">
      <span className="text-ivory/40 text-xs">{label}</span>
      <span className="text-ivory/70 text-xs font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ orderId, phone, paymentMethod }: {
  orderId:       string;
  phone:         string;
  paymentMethod: string;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" role="main">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <CheckCircle size={48} className="text-gold-500 mx-auto mb-6" aria-hidden />
        <p className="text-gold-500 text-[11px] tracking-[0.35em] uppercase mb-3">
          Order #{orderId.slice(-6).toUpperCase()} Received
        </p>
        <h1 className="text-2xl font-semibold text-ivory mb-4">
          Your masterpiece is in our hands.
        </h1>
        {paymentMethod === "mpesa" && (
          <p className="text-ivory/50 text-sm mb-4">
            Check your phone — an M-Pesa STK push has been sent to{" "}
            <strong className="text-ivory">{phone}</strong>.
            Complete the prompt to confirm your order.
          </p>
        )}
        <p className="text-ivory/40 text-xs leading-relaxed mb-8">
          You&apos;ll receive an SMS confirmation once payment is verified.
          Expected delivery: 3–5 business days.
        </p>
        <a
          href={`/configurator/summary/${orderId}`}
          className="btn-ghost text-sm"
        >
          View Wig Recipe
        </a>
      </motion.div>
    </main>
  );
}

// ─── Checkout Page ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const config          = useWigStore(s => s.config);
  const customer        = useWigStore(s => s.customer);
  const priceBreakdown  = useWigStore(s => s.priceBreakdown);
  const updateCustomer  = useWigStore(s => s.updateCustomer);
  const setShippingZone = useWigStore(s => s.setShippingZone);
  const updateConfig    = useWigStore(s => s.updateConfig);

  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError,  setSubmitError]  = useState("");
  const [orderId,      setOrderId]      = useState("");
  const [retryCount,   setRetryCount]   = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
  } = useForm<CheckoutFormValues>({
    resolver:      zodResolver(checkoutSchema),
    defaultValues: {
      name:         customer.name,
      phone:        customer.phone,
      email:        customer.email,
      deliveryZone: customer.deliveryZone,
      address:      customer.address,
      notes:        customer.notes,
    },
    mode: "onTouched",
  });

  const phoneValue = watch("phone");

  async function onSubmit(data: CheckoutFormValues) {
    setSubmitStatus("loading");
    setSubmitError("");

    // Sync validated data back to store
    updateCustomer({
      name:         data.name,
      phone:        data.phone,
      email:        data.email,
      deliveryZone: data.deliveryZone as ShippingZone,
      address:      data.address,
      notes:        data.notes ?? "",
    });

    try {
      // 1. Save order
      const saveRes  = await fetch("/api/save-config", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          config,
          customer: { ...data },
          priceBreakdown,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error ?? "Failed to save order.");

      const id: string = saveData.id;
      setOrderId(id);

      // 2. Payment
      if (config.paymentMethod === "mpesa") {
        const mpesaRes  = await fetch("/api/mpesa/stk-push", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            phone:   data.phone,
            amount:  priceBreakdown.totalKES,
            orderId: id,
          }),
        });
        const mpesaData = await mpesaRes.json();
        if (!mpesaRes.ok) throw new Error(mpesaData.error ?? "M-Pesa request failed.");
      }

      setSubmitStatus("success");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitStatus("error");
      setRetryCount(c => c + 1);
    }
  }

  if (submitStatus === "success") {
    return (
      <SuccessScreen
        orderId={orderId}
        phone={phoneValue}
        paymentMethod={config.paymentMethod}
      />
    );
  }

  return (
    <main className="min-h-screen py-10 sm:py-14 px-4 sm:px-6" role="main">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <header className="mb-8 sm:mb-10">
          <p className="text-gold-500 text-[11px] tracking-[0.35em] uppercase mb-2">
            Secure Checkout
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-ivory">
            Finalise Your Order
          </h1>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Checkout form"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
            {/* ── Left: Form sections ──────────────────────────────────────── */}
            <div className="space-y-6">
              {/* ── Customer details ─────────────────────────────────────── */}
              <section
                aria-labelledby="section-details"
                className="border border-gold-800/20 bg-white/[0.02] p-5 sm:p-6"
              >
                <h2
                  id="section-details"
                  className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-5"
                >
                  Your Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrap id="name" label="Full Name" error={errors.name?.message} required>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Amina Ochieng"
                      aria-describedby={errors.name ? "name-error" : undefined}
                      aria-invalid={!!errors.name}
                      className={inputCls(!!errors.name)}
                      {...register("name")}
                    />
                  </FieldWrap>

                  <FieldWrap id="phone" label="Phone (M-Pesa)" error={errors.phone?.message} required>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="0712 345 678"
                      inputMode="tel"
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      aria-invalid={!!errors.phone}
                      className={inputCls(!!errors.phone)}
                      {...register("phone")}
                    />
                  </FieldWrap>

                  <div className="sm:col-span-2">
                    <FieldWrap id="email" label="Email Address" error={errors.email?.message} required>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="amina@example.com"
                        aria-describedby={errors.email ? "email-error" : undefined}
                        aria-invalid={!!errors.email}
                        className={inputCls(!!errors.email)}
                        {...register("email")}
                      />
                    </FieldWrap>
                  </div>
                </div>
              </section>

              {/* ── Delivery Zone ─────────────────────────────────────────── */}
              <section
                aria-labelledby="section-delivery"
                className="border border-gold-800/20 bg-white/[0.02] p-5 sm:p-6"
              >
                <h2
                  id="section-delivery"
                  className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-5"
                >
                  Delivery Location
                </h2>

                {/* Zone picker */}
                <Controller
                  name="deliveryZone"
                  control={control}
                  render={({ field }) => (
                    <div
                      role="radiogroup"
                      aria-labelledby="section-delivery"
                      aria-invalid={!!errors.deliveryZone}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4"
                    >
                      {SHIPPING_RATES.map(rate => {
                        const selected = field.value === rate.zone;
                        return (
                          <button
                            key={rate.zone}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => {
                              field.onChange(rate.zone);
                              setShippingZone(rate.zone as ShippingZone);
                            }}
                            className={clsx(
                              "flex items-start gap-3 p-3 sm:p-3.5 border text-left",
                              "transition-all duration-200 focus:outline-none",
                              "focus-visible:ring-1 focus-visible:ring-gold-500",
                              selected
                                ? "border-gold-500 bg-gold-950/40"
                                : "border-gold-800/30 hover:border-gold-700/50",
                              errors.deliveryZone && !selected
                                ? "border-red-800/30"
                                : ""
                            )}
                          >
                            <MapPin
                              size={13}
                              className={clsx(
                                "mt-0.5 flex-shrink-0",
                                selected ? "text-gold-400" : "text-ivory/20"
                              )}
                              aria-hidden
                            />
                            <div className="flex-1 min-w-0">
                              <p className={clsx(
                                "text-xs font-medium leading-snug",
                                selected ? "text-gold-300" : "text-ivory/70"
                              )}>
                                {rate.label}
                              </p>
                              <p className="text-[10px] text-ivory/30 mt-0.5">{rate.days}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={clsx(
                                "text-xs font-semibold",
                                selected ? "text-gold-400" : "text-ivory/40"
                              )}>
                                {formatUSD(rate.usd)}
                              </p>
                              <p className="text-[10px] text-ivory/20">KES {rate.kes}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />

                {errors.deliveryZone && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-[11px] flex items-center gap-1.5 mb-4"
                  >
                    <AlertCircle size={11} aria-hidden />
                    {errors.deliveryZone.message}
                  </motion.p>
                )}

                {/* Street address */}
                <FieldWrap
                  id="address"
                  label="Street Address / Estate"
                  error={errors.address?.message}
                  required
                >
                  <input
                    id="address"
                    type="text"
                    autoComplete="street-address"
                    placeholder="14 Riverside Drive, Apt 3B"
                    aria-describedby={errors.address ? "address-error" : undefined}
                    aria-invalid={!!errors.address}
                    className={inputCls(!!errors.address)}
                    {...register("address")}
                  />
                </FieldWrap>

                {/* Notes */}
                <div className="mt-4">
                  <label
                    htmlFor="notes"
                    className="block text-[11px] tracking-[0.2em] uppercase text-gold-600 mb-1.5"
                  >
                    Order Notes
                    <span className="text-ivory/30 ml-1 text-[9px] normal-case tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Any special instructions..."
                    className={clsx(inputCls(!!errors.notes), "resize-none")}
                    {...register("notes")}
                  />
                  {errors.notes && (
                    <p className="text-red-400 text-[11px] mt-1">{errors.notes.message}</p>
                  )}
                </div>
              </section>

              {/* ── Payment method ────────────────────────────────────────── */}
              <section
                aria-labelledby="section-payment"
                className="border border-gold-800/20 bg-white/[0.02] p-5 sm:p-6"
              >
                <h2
                  id="section-payment"
                  className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-5"
                >
                  Payment Method
                </h2>

                <div
                  role="radiogroup"
                  aria-labelledby="section-payment"
                  className="grid grid-cols-2 gap-3"
                >
                  {([
                    { value: "mpesa",  label: "Lipa Na M-Pesa", Icon: Smartphone },
                    { value: "stripe", label: "Card Payment",   Icon: CreditCard },
                  ] as const).map(({ value, label, Icon }) => {
                    const selected = config.paymentMethod === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => updateConfig({ paymentMethod: value })}
                        className={clsx(
                          "flex items-center gap-3 p-4 border transition-all duration-200",
                          "focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500",
                          selected
                            ? "border-gold-500 bg-gold-950/40"
                            : "border-gold-800/30 hover:border-gold-700/50"
                        )}
                      >
                        <Icon
                          size={18}
                          className={selected ? "text-gold-400" : "text-ivory/20"}
                          aria-hidden
                        />
                        <span className={clsx(
                          "text-sm font-medium",
                          selected ? "text-gold-300" : "text-ivory/60"
                        )}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {config.paymentMethod === "mpesa" && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{    opacity: 0 }}
                      className="text-ivory/40 text-xs mt-3 leading-relaxed"
                    >
                      An STK push will be sent to{" "}
                      <strong className="text-ivory">{phoneValue || "your phone"}</strong>.
                      Ensure your phone is unlocked and M-Pesa is active.
                    </motion.p>
                  )}
                </AnimatePresence>
              </section>

              {/* ── Submission error ──────────────────────────────────────── */}
              <AnimatePresence>
                {submitStatus === "error" && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{    opacity: 0 }}
                    className="border border-red-700/50 bg-red-950/20 p-4 flex items-start gap-3"
                  >
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 text-sm">{submitError}</p>
                      {retryCount > 0 && (
                        <p className="text-ivory/40 text-xs mt-1">
                          If this persists, call us at +254 700 000 000.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Right: Order summary (sticky) ────────────────────────────── */}
            <aside aria-label="Order summary" className="space-y-4">
              <div className="border border-gold-800/20 bg-white/[0.02] p-5 lg:sticky lg:top-20">
                <p className="text-gold-500 text-[10px] tracking-[0.25em] uppercase mb-4">
                  Wig Recipe
                </p>

                {/* Foundation */}
                <div className="mb-3">
                  <p className="text-ivory/20 text-[9px] uppercase tracking-widest mb-1.5">Foundation</p>
                  <RecipeRow label="Cap"      value={config.capSize} />
                  <RecipeRow label="Lace"     value={config.laceType} />
                  <RecipeRow label="Tint"     value={config.laceTint} />
                </div>

                {/* DNA */}
                <div className="mb-3">
                  <p className="text-ivory/20 text-[9px] uppercase tracking-widest mb-1.5">DNA</p>
                  <RecipeRow label="Length"  value={`${config.length}"`} />
                  <RecipeRow label="Texture" value={config.texture} />
                  <RecipeRow label="Density" value={`${config.density}%`} />
                  <RecipeRow label="Origin"  value={config.origin} />
                  <RecipeRow label="Color"   value={config.color} />
                </div>

                {/* Artistry */}
                <div className="mb-3">
                  <p className="text-ivory/20 text-[9px] uppercase tracking-widest mb-1.5">Artistry</p>
                  <RecipeRow label="Knots"    value={config.knotBleaching} />
                  <RecipeRow label="Hairline" value={config.hairlineStyle} />
                  <RecipeRow label="Edges"    value={config.babyHairs} />
                  <RecipeRow label="Scent"    value={config.scent} />
                </div>

                {/* Finish */}
                <div className="mb-4">
                  <p className="text-ivory/20 text-[9px] uppercase tracking-widest mb-1.5">Finish</p>
                  <RecipeRow label="Tech" value={config.scalpMapping} />
                  <RecipeRow label="Box"  value={config.packaging} />
                </div>

                <div className="h-px bg-gold-800/20 my-4" />

                {/* Pricing */}
                <div className="space-y-1.5 mb-3">
                  <RecipeRow label="Subtotal" value={formatUSD(priceBreakdown.subtotal)} />
                  <RecipeRow
                    label="Shipping"
                    value={priceBreakdown.shipping > 0
                      ? formatUSD(priceBreakdown.shipping)
                      : "Select zone"
                    }
                  />
                </div>

                {/* Total */}
                <div className="flex justify-between items-end pt-3 border-t border-gold-700/30">
                  <span className="text-ivory/50 text-xs uppercase tracking-wider">Total</span>
                  <div className="text-right">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={priceBreakdown.total}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{    opacity: 0, y:  5 }}
                        className="text-gold-400 font-bold text-xl tabular-nums"
                      >
                        {formatUSD(priceBreakdown.total)}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-ivory/30 text-xs tabular-nums">
                      {formatKES(priceBreakdown.totalKES)}
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={submitStatus === "loading"}
                  whileTap={{ scale: 0.97 }}
                  className="btn-gold w-full mt-5 text-sm tracking-[0.15em]"
                  aria-busy={submitStatus === "loading"}
                >
                  {submitStatus === "loading" ? (
                    <>
                      <Loader2 size={15} className="animate-spin" aria-hidden />
                      Processing...
                    </>
                  ) : config.paymentMethod === "mpesa" ? (
                    <>
                      <Smartphone size={15} aria-hidden />
                      Pay via M-Pesa
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} aria-hidden />
                      Pay with Card
                    </>
                  )}
                </motion.button>

                {/* Trust badge */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <ShieldCheck size={11} className="text-ivory/20" aria-hidden />
                  <p className="text-ivory/20 text-[10px]">
                    7-day quality guarantee. Secure checkout.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}
