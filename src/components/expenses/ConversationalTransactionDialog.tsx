// src/components/expenses/ConversationalTransactionDialogImproved.tsx
// A complete "wow" factor redesign with a data-driven, dashboard-like layout.
"use client";

import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ConfidenceScore,
  ReviewFlag,
} from "@/components/ui/skeleton-transaction-loader";

const ScrollbarStyles = () => (
  <style>{`
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #d1d5db transparent;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background-color: transparent;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #d1d5db;
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #9ca3af;
    }
    .custom-scrollbar::-webkit-scrollbar-corner {
      background-color: transparent;
    }
    /* Ensure ScrollArea viewport is scrollable */
    [data-radix-scroll-area-viewport] {
      scrollbar-width: thin;
      scrollbar-color: #d1d5db transparent;
    }
    [data-radix-scroll-area-viewport]::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    [data-radix-scroll-area-viewport]::-webkit-scrollbar-track {
      background-color: transparent;
    }
    [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb {
      background-color: #d1d5db;
      border-radius: 10px;
    }
    [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb:hover {
      background-color: #9ca3af;
    }
  `}</style>
);

// --- Schemas and Interfaces (giữ nguyên từ file gốc) ---
const transactionSchema = z.object({
  transaction_type: z.enum(["expense", "income", "transfer"]),
  amount: z.number().positive(),
  description: z.string().min(1),
  expense_category_id: z.string().optional(),
  income_category_id: z.string().optional(),
  wallet_id: z.string().min(1),
  tags: z.array(z.string()).default([]),
  transaction_date: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface ParsedTransaction {
  transaction_type: "expense" | "income" | "transfer";
  amount: number;
  description: string;
  suggested_category_id?: string;
  suggested_category_name?: string;
  suggested_tags: string[];
  suggested_wallet_id?: string;
  confidence_score: number;
  is_unusual?: boolean;
  unusual_reasons?: string[];
}

interface ParsedData {
  transactions: ParsedTransaction[];
}

interface Category {
  id: string;
  name_en: string;
  name_vi: string;
  icon: string;
  color: string;
  category_key: string;
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  wallet_type: string;
}

interface ConversationalTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedData | null;
  wallets: Wallet[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  onConfirm: (transactions: TransactionFormData[]) => void;
  onCorrection?: (correction: any) => void;
  originalText: string;
}

// --- Helper Components ---
const DynamicIcon = ({
  name,
  ...props
}: { name: string } & React.ComponentProps<typeof LucideIcons.HelpCircle>) => {
  const IconComponent =
    LucideIcons[name as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
  return <IconComponent {...props} />;
};

function TransactionEditForm({
  transaction,
  onUpdate,
  onCancel,
  onSave,
  wallets,
  categories,
}: {
  transaction: TransactionFormData;
  onUpdate: (field: keyof TransactionFormData, value: any) => void;
  onCancel: () => void;
  onSave: () => void;
  wallets: Wallet[];
  categories: Category[];
}) {
  return (
    <div className="bg-slate-100 p-4 rounded-lg border animate-in fade-in-0 duration-300">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              id="amount"
              type="number"
              value={transaction.amount}
              onChange={(e) =>
                onUpdate("amount", parseFloat(e.target.value) || 0)
              }
              className="text-lg font-bold"
              placeholder="Nhập số tiền..."
            />
          </div>
          <div>
            <Input
              id="description"
              value={transaction.description}
              onChange={(e) => onUpdate("description", e.target.value)}
              placeholder="Mô tả giao dịch..."
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select
              value={
                transaction.transaction_type === "expense"
                  ? transaction.expense_category_id
                  : transaction.income_category_id
              }
              onValueChange={(value) => {
                const field =
                  transaction.transaction_type === "expense"
                    ? "expense_category_id"
                    : "income_category_id";
                onUpdate(field, value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <DynamicIcon name={cat.icon} className="h-4 w-4" />
                      <span>{cat.name_vi}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={transaction.wallet_id}
              onValueChange={(value) => onUpdate("wallet_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn ví..." />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="relative">
              <Input
                type="date"
                value={transaction.transaction_date}
                onChange={(e) => onUpdate("transaction_date", e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <LucideIcons.Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={onSave}>
          <LucideIcons.Save className="mr-2 h-4 w-4" /> Lưu
        </Button>
      </div>
    </div>
  );
}

// --- Main Dialog Component ---
export function ConversationalTransactionDialog({
  isOpen,
  onClose,
  parsedData,
  wallets,
  expenseCategories,
  incomeCategories,
  onConfirm,
  originalText,
}: ConversationalTransactionDialogProps) {
  const [transactions, setTransactions] = useState<TransactionFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    console.log("🔍 DIALOG DEBUG - parsedData received:", {
      hasData: !!parsedData,
      dataKeys: parsedData ? Object.keys(parsedData) : [],
      transactionCount: parsedData?.transactions?.length || 0,
      hasTransactions: !!parsedData?.transactions,
      firstTransaction: parsedData?.transactions?.[0],
      fullParsedData: parsedData,
    });

    if (parsedData?.transactions) {
      const initialTransactions = parsedData.transactions.map((t) => ({
        transaction_type: t.transaction_type,
        amount: t.amount,
        description: t.description,
        expense_category_id:
          t.transaction_type === "expense"
            ? t.suggested_category_id
            : undefined,
        income_category_id:
          t.transaction_type === "income" ? t.suggested_category_id : undefined,
        wallet_id: t.suggested_wallet_id || wallets[0]?.id || "",
        tags: t.suggested_tags || [],
        transaction_date: new Date().toISOString().split("T")[0],
        notes: "",
      }));
      setTransactions(initialTransactions);
    }
  }, [parsedData, wallets, expenseCategories, incomeCategories]);

  const updateTransaction = (
    index: number,
    field: keyof TransactionFormData,
    value: any
  ) => {
    setTransactions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const deleteTransaction = (indexToDelete: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== indexToDelete));
    toast.success("Đã xóa giao dịch.");
  };

  const { groupedTransactions, totalExpense, totalIncome, donutGradient } =
    useMemo(() => {
      const groups: Record<
        string,
        {
          category: Category | null | undefined;
          transactions: Array<{
            original: ParsedTransaction;
            editing: TransactionFormData;
            index: number;
          }>;
          totalAmount: number;
        }
      > = {};
      let totalExpense = 0;
      let totalIncome = 0;

      transactions.forEach((editing, index) => {
        const original = parsedData?.transactions[index];
        if (!original) return;
        if (editing.transaction_type === "expense")
          totalExpense += editing.amount;
        if (editing.transaction_type === "income")
          totalIncome += editing.amount;

        const categories =
          editing.transaction_type === "expense"
            ? expenseCategories
            : incomeCategories;
        const categoryId =
          editing.transaction_type === "expense"
            ? editing.expense_category_id
            : editing.income_category_id;
        const category = categories.find((cat) => cat.id === categoryId);
        const groupKey = category?.id || `unknown_${editing.transaction_type}`;

        if (!groups[groupKey]) {
          groups[groupKey] = { category, transactions: [], totalAmount: 0 };
        }
        groups[groupKey].transactions.push({ original, editing, index });
        groups[groupKey].totalAmount +=
          editing.transaction_type === "expense"
            ? -editing.amount
            : editing.amount;
      });

      let cumulativePercentage = 0;
      const gradientParts = Object.values(groups)
        .filter((g) => g.totalAmount < 0)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .map((group) => {
          const percentage =
            totalExpense > 0
              ? (Math.abs(group.totalAmount) / totalExpense) * 100
              : 0;
          const color = group.category?.color || "#cccccc";
          const part = `${color} ${cumulativePercentage}% ${cumulativePercentage + percentage}%`;
          cumulativePercentage += percentage;
          return part;
        });
      const donutGradient = `conic-gradient(from 180deg, ${gradientParts.join(", ")})`;

      return {
        groupedTransactions: groups,
        totalExpense,
        totalIncome,
        donutGradient,
      };
    }, [transactions, expenseCategories, incomeCategories, parsedData]);

  const totalAmount = totalIncome - totalExpense;
  const handleConfirm = async () => {
    if (transactions.length === 0) return;

    setIsSubmitting(true);
    try {
      await onConfirm(transactions);
      toast.success(`Đã lưu ${transactions.length} giao dịch thành công!`);
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu giao dịch. Vui lòng thử lại.");
      console.error("Error confirming transactions:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!parsedData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[85vh] flex flex-col p-0 bg-gray-50 overflow-hidden">
        <ScrollbarStyles />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] min-h-0">
          {/* Left Column: Dashboard */}
          <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-r flex flex-col">
            <div className="p-6 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">
                Bảng phân tích
              </h2>
              <p className="text-sm text-gray-500 truncate">
                Từ: "{originalText}"
              </p>
            </div>

            {/* SỬA LỖI: Thêm my-auto để giữ layout ổn định */}
            <div className="flex-1 flex flex-col items-center p-6 space-y-6 my-auto justify-center align-middle">
              <div className="relative w-48 h-48">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: donutGradient }}
                ></div>
                <div className="absolute inset-2 bg-gray-100 rounded-full flex flex-col items-center justify-center shadow-inner">
                  <p className="text-xs text-gray-500">Thay đổi</p>
                  <p
                    className={cn(
                      "text-3xl font-bold tracking-tighter",
                      totalAmount >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {totalAmount >= 0 ? "+" : ""}
                    {totalAmount.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-xs text-gray-400">VND</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-green-700">Tổng thu</p>
                  <p className="font-bold text-green-600">
                    +{totalIncome.toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-red-700">Tổng chi</p>
                  <p className="font-bold text-red-600">
                    -{totalExpense.toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transaction Details */}
          <div className="flex flex-col bg-white min-h-0">
            <ScrollArea
              className="flex-1 overflow-auto custom-scrollbar"
              style={{ height: "calc(85vh - 200px)" }}
            >
              <div className="p-6 space-y-4">
                {Object.entries(groupedTransactions).map(([key, group]) => (
                  <div
                    key={key}
                    className="bg-white rounded-xl border border-gray-200/80 overflow-hidden"
                  >
                    <div
                      className="p-3 border-b"
                      style={{
                        backgroundColor: `${group.category?.color || "#cccccc"}1A`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${group.category?.color || "#cccccc"}30`,
                          }}
                        >
                          <DynamicIcon
                            name={group.category?.icon || "HelpCircle"}
                            className="w-5 h-5"
                            style={{
                              color: group.category?.color || "#cccccc",
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {group.category?.name_vi || "Chưa phân loại"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {group.transactions.length} giao dịch •{" "}
                            {group.totalAmount.toLocaleString("vi-VN")} VND
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {group.transactions.map(
                        ({ original, editing, index }) => {
                          if (editingIndex === index) {
                            return (
                              <div className="p-2" key={index}>
                                <TransactionEditForm
                                  key={index}
                                  transaction={editing}
                                  onUpdate={(field, value) =>
                                    updateTransaction(index, field, value)
                                  }
                                  onCancel={() => setEditingIndex(null)}
                                  onSave={() => setEditingIndex(null)}
                                  wallets={wallets}
                                  categories={
                                    editing.transaction_type === "expense"
                                      ? expenseCategories
                                      : incomeCategories
                                  }
                                />
                              </div>
                            );
                          }
                          const wallet = wallets.find(
                            (w) => w.id === editing.wallet_id
                          );
                          return (
                            <div
                              key={index}
                              className="p-3 flex items-center justify-between group hover:bg-gray-50/50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-gray-800">
                                  {editing.description}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  {wallet && (
                                    <span className="flex items-center gap-1">
                                      <LucideIcons.Wallet className="h-3 w-3" />{" "}
                                      {wallet.name}
                                    </span>
                                  )}
                                  <span>•</span>
                                  <span>
                                    {new Date(
                                      editing.transaction_date
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                  <span>•</span>
                                  <ConfidenceScore
                                    score={original.confidence_score}
                                    isUnusual={original.is_unusual}
                                    unusualReasons={original.unusual_reasons}
                                    size="sm"
                                  />
                                </div>
                                {original.is_unusual && (
                                  <div className="mt-2">
                                    <ReviewFlag
                                      isRequired={true}
                                      reasons={original.unusual_reasons || []}
                                      className="text-xs"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <span
                                  className={cn(
                                    "font-bold text-base",
                                    editing.transaction_type === "expense"
                                      ? "text-red-600"
                                      : "text-green-600"
                                  )}
                                >
                                  {editing.transaction_type === "expense"
                                    ? "-"
                                    : "+"}{" "}
                                  {editing.amount.toLocaleString("vi-VN")}
                                </span>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setEditingIndex(index)}
                                  >
                                    <LucideIcons.Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-100"
                                    onClick={() => deleteTransaction(index)}
                                  >
                                    <LucideIcons.Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-white/80 backdrop-blur-sm flex-shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !transactions.length}
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold"
          >
            {isSubmitting
              ? "Đang lưu..."
              : `Xác nhận & Lưu (${transactions.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
