// src/app/api/expenses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";



const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  expense_category_id: z.string().uuid().optional(),
  income_category_id: z.string().uuid().optional(),
  transaction_date: z.string().optional(),
  transaction_time: z.string().optional(),
  receipt_images: z.array(z.string()).optional(),
  merchant_name: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_confirmed: z.boolean().optional(),
});

// GET /api/expenses/[transactionId] - Get specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await params;

    const { data: transaction, error } = await supabase
      .from("expense_transactions")
      .select(
        `
        *,
        expense_category:expense_categories(*),
        income_category:income_categories(*),
        wallet:expense_wallets(*),
        transfer_wallet:expense_wallets!expense_transactions_transfer_to_wallet_id_fkey(*)
      `
      )
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .single();

    if (error || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Get transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTransactionSchema.parse(body);
    const { transactionId } = await params;

    // First verify the transaction exists and belongs to the user
    const { data: existingTransaction, error: fetchError } = await supabase
      .from("expense_transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Update the transaction
    const { data: transaction, error: updateError } = await supabase
      .from("expense_transactions")
      .update(validatedData)
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .select(
        `
        *,
        expense_category:expense_categories(*),
        income_category:income_categories(*),
        wallet:expense_wallets(*),
        transfer_wallet:expense_wallets!expense_transactions_transfer_to_wallet_id_fkey(*)
      `
      )
      .single();

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Update transaction error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid update data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await params;

    // Delete the transaction (this will automatically revert wallet balance changes through DB triggers)
    const { error: deleteError } = await supabase
      .from("expense_transactions")
      .delete()
      .eq("id", transactionId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting transaction:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
