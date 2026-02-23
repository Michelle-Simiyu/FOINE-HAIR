"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type {
  WigConfiguration,
  PriceBreakdown,
  CustomerDetails,
  ConfigStep,
  ShippingZone,
} from "@/types/wig";
import { calculatePrice } from "@/utils/priceCalculator";
import { validateConfiguration, applyAutoFixes } from "@/utils/validationRules";

// ─── Default Configuration ────────────────────────────────────────────────────
const DEFAULT_CONFIG: WigConfiguration = {
  // Foundation
  capSize:        "Average",
  laceType:       "Transparent Lace",
  laceTint:       "Caramel",
  security:       "Combs + Straps",

  // DNA
  length:         12,
  texture:        "Body Wave",
  density:        150,
  origin:         "Virgin",
  color:          "Natural Black",

  // Artistry
  knotBleaching:  "None",
  hairlineStyle:  "Natural Sparse",
  babyHairs:      "None",
  scent:          "None",

  // Finish
  scalpMapping:   "None",
  packaging:      "Standard",
  paymentMethod:  "pending",
};

const DEFAULT_CUSTOMER: CustomerDetails = {
  name:          "",
  phone:         "",
  email:         "",
  deliveryZone:  "Nairobi Central",
  address:       "",
  notes:         "",
};

// ─── Notification ─────────────────────────────────────────────────────────────
export interface WigNotification {
  id:      string;
  type:    "info" | "warning" | "success" | "error";
  message: string;
}

// ─── Store Interface ──────────────────────────────────────────────────────────
interface WigStore {
  // State
  config:           WigConfiguration;
  customer:         CustomerDetails;
  priceBreakdown:   PriceBreakdown;
  currentStep:      ConfigStep;
  notifications:    WigNotification[];
  isSubmitting:     boolean;
  savedConfigId:    string | null;

  // Config Actions
  updateConfig:      (patch: Partial<WigConfiguration>) => void;
  setPreset:         (preset: Partial<WigConfiguration>) => void;
  resetConfig:       () => void;

  // Customer Actions
  updateCustomer:    (patch: Partial<CustomerDetails>) => void;
  setShippingZone:   (zone: ShippingZone) => void;

  // Navigation
  setStep:           (step: ConfigStep) => void;
  nextStep:          () => void;
  prevStep:          () => void;

  // Notifications
  addNotification:   (n: Omit<WigNotification, "id">) => void;
  dismissNotification: (id: string) => void;

  // Submission
  setSubmitting:     (v: boolean) => void;
  setSavedConfigId:  (id: string) => void;
}

// ─── Step Order ───────────────────────────────────────────────────────────────
const STEPS: ConfigStep[] = ["foundation", "dna", "artistry", "finish"];

// ─── Create Store ─────────────────────────────────────────────────────────────
export const useWigStore = create<WigStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        config:          DEFAULT_CONFIG,
        customer:        DEFAULT_CUSTOMER,
        priceBreakdown:  calculatePrice(DEFAULT_CONFIG),
        currentStep:     "foundation",
        notifications:   [],
        isSubmitting:    false,
        savedConfigId:   null,

        // ── Config Actions ────────────────────────────────────────────────────
        updateConfig: (patch) => {
          set((state) => {
            const next = { ...state.config, ...patch };

            // Run validation and apply auto-fixes
            const validation = validateConfiguration(next);
            const fixed      = applyAutoFixes(next, validation.autoFixes);

            state.config        = fixed;
            state.priceBreakdown = calculatePrice(
              fixed,
              state.customer.deliveryZone
            );

            // Queue notifications for auto-fixes
            for (const fix of validation.autoFixes) {
              const id = `fix-${Date.now()}-${fix.field}`;
              state.notifications.push({ id, type: "warning", message: fix.message });
            }
          });
        },

        setPreset: (preset) => {
          set((state) => {
            const next       = { ...DEFAULT_CONFIG, ...preset };
            const validation = validateConfiguration(next);
            const fixed      = applyAutoFixes(next, validation.autoFixes);

            state.config        = fixed;
            state.priceBreakdown = calculatePrice(fixed, state.customer.deliveryZone);
            state.currentStep   = "foundation";
          });
        },

        resetConfig: () => {
          set((state) => {
            state.config         = DEFAULT_CONFIG;
            state.customer       = DEFAULT_CUSTOMER;
            state.priceBreakdown = calculatePrice(DEFAULT_CONFIG);
            state.currentStep    = "foundation";
            state.notifications  = [];
            state.savedConfigId  = null;
          });
        },

        // ── Customer Actions ──────────────────────────────────────────────────
        updateCustomer: (patch) => {
          set((state) => {
            state.customer = { ...state.customer, ...patch };
          });
        },

        setShippingZone: (zone) => {
          set((state) => {
            state.customer.deliveryZone = zone;
            state.priceBreakdown        = calculatePrice(state.config, zone);
          });
        },

        // ── Navigation ────────────────────────────────────────────────────────
        setStep: (step) => {
          set((state) => { state.currentStep = step; });
        },

        nextStep: () => {
          const { currentStep } = get();
          const idx = STEPS.indexOf(currentStep);
          if (idx < STEPS.length - 1) {
            set((state) => { state.currentStep = STEPS[idx + 1]; });
          }
        },

        prevStep: () => {
          const { currentStep } = get();
          const idx = STEPS.indexOf(currentStep);
          if (idx > 0) {
            set((state) => { state.currentStep = STEPS[idx - 1]; });
          }
        },

        // ── Notifications ─────────────────────────────────────────────────────
        addNotification: (n) => {
          const id = `notif-${Date.now()}`;
          set((state) => {
            state.notifications.push({ ...n, id });
          });
          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            get().dismissNotification(id);
          }, 5000);
        },

        dismissNotification: (id) => {
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          });
        },

        // ── Submission ────────────────────────────────────────────────────────
        setSubmitting:    (v)  => set((state) => { state.isSubmitting = v; }),
        setSavedConfigId: (id) => set((state) => { state.savedConfigId = id; }),
      })),
      {
        name:    "foine-hair-config",
        // Only persist config + customer; skip UI state
        partialize: (state) => ({
          config:   state.config,
          customer: state.customer,
        }),
      }
    ),
    { name: "FoineHairStore" }
  )
);
