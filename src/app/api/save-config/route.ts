import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import type { WigConfiguration, CustomerDetails, PriceBreakdown, Order, OrderStatus } from "@/types/wig";

// ─── In-Memory Store (replace with Prisma/Supabase in production) ──────────────
// This is a simple in-memory store for demonstration.
// In production, replace all operations below with PrismaClient calls.
const orders = new Map<string, Order>();

// ─── POST /api/save-config — Create a new order ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      config:          WigConfiguration;
      customer:        CustomerDetails;
      priceBreakdown:  PriceBreakdown;
      wigName?:        string;
    };

    const { config, customer, priceBreakdown, wigName } = body;

    if (!config || !customer || !priceBreakdown) {
      return NextResponse.json(
        { error: "config, customer, and priceBreakdown are required." },
        { status: 400 }
      );
    }

    const id: string = nanoid(12);
    const order: Order = {
      id,
      createdAt:         new Date().toISOString(),
      configurationJSON: config,
      customerDetails:   customer,
      priceBreakdown,
      paymentStatus:     "pending",
      orderStatus:       "pending",
      shippingZone:      customer.deliveryZone,
      wigName:           wigName ?? `Foine Hair Custom Wig`,
    };

    orders.set(id, order);

    // ── In production: Prisma ─────────────────────────────────────────────
    //
    // const order = await prisma.order.create({
    //   data: {
    //     configurationJSON: config,
    //     customerDetails:   customer,
    //     priceBreakdown,
    //     paymentStatus:     "pending",
    //     orderStatus:       "pending",
    //     shippingZone:      customer.deliveryZone,
    //     wigName,
    //   },
    // });

    return NextResponse.json({ id, success: true }, { status: 201 });

  } catch (err: unknown) {
    console.error("[save-config POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 }
    );
  }
}

// ─── GET /api/save-config — Fetch all orders or single order by id ────────────
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  // Single order lookup
  if (id) {
    const order = orders.get(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  }

  // All orders (admin dashboard)
  const all = Array.from(orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ orders: all });
}

// ─── PATCH /api/save-config — Update order status / payment ──────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as {
      id:             string;
      orderStatus?:   OrderStatus;
      paymentStatus?: "pending" | "paid" | "failed";
      mpesaReceiptNo?: string;
    };

    const { id, orderStatus, paymentStatus, mpesaReceiptNo } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    const order = orders.get(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const updated: Order = {
      ...order,
      ...(orderStatus    ? { orderStatus }    : {}),
      ...(paymentStatus  ? { paymentStatus }  : {}),
      ...(mpesaReceiptNo ? { mpesaReceiptNo } : {}),
    };

    orders.set(id, updated);

    // ── In production: Prisma ─────────────────────────────────────────────
    //
    // await prisma.order.update({
    //   where: { id },
    //   data:  { orderStatus, paymentStatus, mpesaReceiptNo },
    // });

    return NextResponse.json({ success: true, order: updated });

  } catch (err: unknown) {
    console.error("[save-config PATCH]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 }
    );
  }
}
