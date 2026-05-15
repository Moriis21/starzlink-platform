import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, paymentType, itemType, itemId, planType,
      amount, currency, paymentMethod, transactionReference,
      proofFileUrl, cardLast4, paypalEmail, userNote
    } = body;

    if (!userId || !paymentType || !itemType || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine initial status
    const paymentStatus = paymentMethod === "credit_card" || paymentMethod === "paypal"
      ? "pending_admin_approval"
      : "pending_verification";

    // Create payment record
    const { data: payment, error } = await insforge.database
      .from("payments")
      .insert([{
        user_id: userId,
        payment_type: paymentType,
        item_type: itemType,
        item_id: itemId || null,
        plan_type: planType || null,
        amount,
        currency: currency || "USD",
        payment_method: paymentMethod,
        transaction_reference: transactionReference || null,
        proof_file_url: proofFileUrl || null,
        card_last4: cardLast4 || null,
        paypal_email: paypalEmail || null,
        payment_status: paymentStatus,
        admin_approval_status: "pending",
        user_note: userNote || null,
      }])
      .select("id")
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 });
    }

    const paymentId = (payment as any).id;

    // If resource purchase, create resource_purchases record
    if (paymentType === "resource_purchase" && itemId) {
      await insforge.database.from("resource_purchases").insert([{
        user_id: userId,
        resource_id: itemId,
        payment_id: paymentId,
        access_status: "pending",
      }]);
    }

    // Notify all admins and super admins
    const { data: admins } = await insforge.database
      .from("profiles")
      .select("id")
      .in("role", ["admin", "super_admin"]);

    if (admins && admins.length > 0) {
      const methodLabels: Record<string, string> = {
        orange_money: "Orange Money",
        mobile_money: "Mobile Money",
        credit_card: "Credit Card",
        paypal: "PayPal",
        bank_transfer: "Bank Transfer",
      };
      const itemLabels: Record<string, string> = {
        pro_monthly: "Pro Monthly ($5)",
        pro_yearly: "Pro Yearly ($50)",
        template: "Template",
        ebook: "E-Book",
        digital_resource: "Digital Resource",
      };

      const notifications = admins.map((admin: any) => ({
        admin_id: admin.id,
        notification_type: "new_payment",
        title: "New Payment Pending Verification",
        message: `A user has submitted a ${methodLabels[paymentMethod] || paymentMethod} payment for ${itemLabels[itemType] || itemType} — $${amount}. Please verify and approve.`,
        related_payment_id: paymentId,
        is_read: false,
      }));
      await insforge.database.from("admin_notifications").insert(notifications);
    }

    return NextResponse.json({ success: true, paymentId, paymentStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
