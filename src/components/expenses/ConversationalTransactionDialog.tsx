// src/components/expenses/ConversationalTransactionDialog.tsx
// UPDATED: 2025-01-16 - Changed from Master-Detail layout to Pop-up/Overlay approach to prevent layout shift
// Confirmation dialog for AI-parsed transactions with editable fields
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Brain,
  Edit3,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Hash,
  Wallet,
  DollarSign,
  Tag,
  Calendar,
  FileText,
  ArrowRight,
  Pencil,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Transaction validation schema
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
  extracted_merchant?: string;
  extracted_date?: string;
  notes?: string;
  is_unusual?: boolean;
  unusual_reasons?: string[];
  parsing_context?: {
    original_text: string;
    processing_timestamp: string;
    user_id: string;
  };
}

interface ParsedData {
  transactions: ParsedTransaction[];
  analysis_summary?: string;
  metadata?: {
    total_transactions: number;
    processing_time: string;
    ai_model: string;
  };
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

export function ConversationalTransactionDialog({
  isOpen,
  onClose,
  parsedData,
  wallets,
  expenseCategories,
  incomeCategories,
  onConfirm,
  onCorrection,
  originalText,
}: ConversationalTransactionDialogProps) {
  const t = useTranslations("UnifiedTransactionForm");
  const [editingTransactions, setEditingTransactions] = useState<
    TransactionFormData[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editPopupTransaction, setEditPopupTransaction] = useState<{
    index: number;
    transaction: TransactionFormData;
    original: ParsedTransaction;
  } | null>(null);

  // Initialize editing transactions when parsedData changes
  useEffect(() => {
    if (parsedData?.transactions) {
      const initialTransactions = parsedData.transactions.map(
        (transaction) => ({
          transaction_type: transaction.transaction_type,
          amount: transaction.amount,
          description: transaction.description,
          expense_category_id:
            transaction.transaction_type === "expense"
              ? transaction.suggested_category_id
              : undefined,
          income_category_id:
            transaction.transaction_type === "income"
              ? transaction.suggested_category_id
              : undefined,
          wallet_id: transaction.suggested_wallet_id || wallets[0]?.id || "",
          tags: transaction.suggested_tags || [],
          transaction_date:
            transaction.extracted_date ||
            new Date().toISOString().split("T")[0],
          notes: transaction.notes || "",
        })
      );
      setEditingTransactions(initialTransactions);
    }
  }, [parsedData, wallets]);

  const updateTransaction = (
    index: number,
    field: keyof TransactionFormData,
    value: any
  ) => {
    setEditingTransactions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Track corrections for learning
      if (parsedData?.transactions[index] && onCorrection) {
        const original = parsedData.transactions[index];
        const correctionType = determineCorrectionType(
          field,
          original,
          updated[index]
        );

        onCorrection({
          input_text: originalText,
          original_suggestion: original,
          corrected_data: updated[index],
          correction_type: correctionType,
        });
      }

      return updated;
    });
  };

  const determineCorrectionType = (
    field: keyof TransactionFormData,
    original: ParsedTransaction,
    corrected: TransactionFormData
  ): string => {
    switch (field) {
      case "expense_category_id":
      case "income_category_id":
        return "category_change";
      case "amount":
        return "amount_change";
      case "description":
        return "description_change";
      case "transaction_type":
        return "transaction_type_change";
      case "tags":
        return "tags_change";
      case "wallet_id":
        return "wallet_change";
      default:
        return "multiple_changes";
    }
  };

  const getCurrentCategories = (transactionType: string) => {
    return transactionType === "expense" ? expenseCategories : incomeCategories;
  };

  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const openEditPopup = (index: number) => {
    const transaction = editingTransactions[index];
    const original = parsedData?.transactions[index];
    if (transaction && original) {
      setEditPopupTransaction({ index, transaction, original });
    }
  };

  const closeEditPopup = () => {
    setEditPopupTransaction(null);
  };

  const updatePopupTransaction = (field: keyof TransactionFormData, value: any) => {
    if (!editPopupTransaction) return;
    
    const updatedTransaction = { ...editPopupTransaction.transaction, [field]: value };
    setEditPopupTransaction(prev => prev ? { ...prev, transaction: updatedTransaction } : null);
    updateTransaction(editPopupTransaction.index, field, value);
  };

  const addTag = (transactionIndex: number, tag: string) => {
    if (
      tag.trim() &&
      !editingTransactions[transactionIndex]?.tags.includes(tag)
    ) {
      const newTags = [
        ...(editingTransactions[transactionIndex]?.tags || []),
        tag.trim(),
      ];
      updateTransaction(transactionIndex, "tags", newTags);
    }
  };

  const removeTag = (transactionIndex: number, tagToRemove: string) => {
    const newTags =
      editingTransactions[transactionIndex]?.tags.filter(
        (tag) => tag !== tagToRemove
      ) || [];
    updateTransaction(transactionIndex, "tags", newTags);
  };

  const handleConfirm = async () => {
    if (!editingTransactions.length) return;

    try {
      setIsSubmitting(true);

      // Validate all transactions
      const validatedTransactions = editingTransactions.map(
        (transaction, index) => {
          try {
            return transactionSchema.parse(transaction);
          } catch (error) {
            throw new Error(
              `Transaction ${index + 1}: ${error instanceof z.ZodError ? error.issues[0].message : "Invalid data"}`
            );
          }
        }
      );

      await onConfirm(validatedTransactions);
      onClose();
    } catch (error) {
      console.error("Error confirming transactions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to confirm transactions"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalAmount = () => {
    return editingTransactions.reduce((total, transaction) => {
      return transaction.transaction_type === "expense"
        ? total - transaction.amount
        : total + transaction.amount;
    }, 0);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50";
    if (confidence >= 0.5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  // Group transactions by category
  const getGroupedTransactions = () => {
    if (!parsedData?.transactions || !editingTransactions.length) return {};

    const groups: Record<string, {
      category: Category | null | undefined;
      transactions: Array<{
        original: ParsedTransaction;
        editing: TransactionFormData;
        index: number;
      }>;
      totalAmount: number;
      transactionType: string;
    }> = {};

    parsedData.transactions.forEach((original, index) => {
      const editing = editingTransactions[index];
      if (!editing) return;

      // Get category info
      const categories = getCurrentCategories(editing.transaction_type);
      const categoryId = editing.transaction_type === "expense" 
        ? editing.expense_category_id 
        : editing.income_category_id;
      const category = categories.find(cat => cat.id === categoryId);

      // Create group key
      const groupKey = category?.id || `unknown_${editing.transaction_type}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          category,
          transactions: [],
          totalAmount: 0,
          transactionType: editing.transaction_type,
        };
      }

      groups[groupKey].transactions.push({ original, editing, index });
      groups[groupKey].totalAmount += editing.transaction_type === "expense" 
        ? -editing.amount 
        : editing.amount;
    });

    return groups;
  };

  // Auto-expand first group when data loads
  useEffect(() => {
    const groups = getGroupedTransactions();
    const groupKeys = Object.keys(groups);
    if (groupKeys.length > 0 && expandedGroups.size === 0) {
      setExpandedGroups(new Set([groupKeys[0]]));
    }
  }, [editingTransactions, expandedGroups.size]);

  if (!parsedData) return null;

  const groupedTransactions = getGroupedTransactions();
  const totalAmount = getTotalAmount();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-xl font-bold">Review & Confirm Transactions</div>
                <div className="text-sm text-muted-foreground font-normal">
                  {parsedData.transactions.length} transaction{parsedData.transactions.length !== 1 ? "s" : ""} • 
                  Total: <span className={cn("font-bold", totalAmount >= 0 ? "text-green-600" : "text-red-600")}>
                    {totalAmount >= 0 ? "+" : ""}{totalAmount.toLocaleString("vi-VN")} VND
                  </span>
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Original Input Display */}
        <div className="bg-muted/20 p-3 rounded-lg border-l-4 border-blue-200 flex-shrink-0">
          <p className="text-sm text-foreground italic" title={originalText}>
            "{originalText}"
          </p>
        </div>

        {/* Expandable Groups Layout */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 p-4">
            {Object.entries(groupedTransactions).map(([groupKey, group]) => {
              const isExpanded = expandedGroups.has(groupKey);
              const hasUnusualTransactions = group.transactions.some(t => t.original.is_unusual);

              return (
                <Card key={groupKey} className="overflow-hidden">
                  {/* Group Header - Always Visible */}
                  <div
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 border-b",
                      "hover:bg-muted/50",
                      hasUnusualTransactions && "bg-red-50/50 border-red-200"
                    )}
                    onClick={() => toggleGroupExpansion(groupKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Expand/Collapse Icon */}
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                        )}

                        {/* Category Info */}
                        {group.category ? (
                          <>
                            <div
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: group.category.color }}
                            />
                            <span className="text-xl flex-shrink-0">{group.category.icon}</span>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-lg truncate">{group.category.name_vi}</h3>
                              <p className="text-sm text-muted-foreground">
                                {group.transactions.length} transaction{group.transactions.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-5 h-5 rounded-full bg-gray-300 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-lg text-muted-foreground">Uncategorized</h3>
                              <p className="text-sm text-muted-foreground">
                                {group.transactions.length} transaction{group.transactions.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Amount */}
                        <div className={cn(
                          "text-xl font-bold",
                          group.totalAmount >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {group.totalAmount >= 0 ? "+" : ""}{group.totalAmount.toLocaleString("vi-VN")} VND
                        </div>

                        {/* Trend Icon */}
                        {group.totalAmount < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        )}

                        {/* Warning Icon */}
                        {hasUnusualTransactions && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content - Transactions List */}
                  {isExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <div className="p-4 space-y-3 bg-muted/20">
                        {group.transactions.map(({ original, editing, index }) => {
                          const wallet = wallets.find(w => w.id === editing.wallet_id);

                          return (
                            <Card
                              key={index}
                              className={cn(
                                "border-l-4 transition-all duration-200 cursor-pointer",
                                original.is_unusual 
                                  ? "border-l-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100/50" 
                                  : editing.transaction_type === "expense"
                                    ? "border-l-red-200 bg-white hover:bg-red-50/30"
                                    : "border-l-green-200 bg-white hover:bg-green-50/30"
                              )}
                              onClick={() => openEditPopup(index)}
                            >
                              <div className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    {/* Amount */}
                                    <div className={cn(
                                      "text-lg font-bold min-w-[120px]",
                                      editing.transaction_type === "expense" ? "text-red-600" : "text-green-600"
                                    )}>
                                      {editing.transaction_type === "expense" ? "-" : "+"}
                                      {editing.amount.toLocaleString("vi-VN")}
                                    </div>

                                    {/* Description & Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-base truncate">{editing.description}</div>
                                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                        {wallet && (
                                          <>
                                            <div
                                              className="w-3 h-3 rounded-full"
                                              style={{ backgroundColor: wallet.color }}
                                            />
                                            <span className="truncate">{wallet.name}</span>
                                          </>
                                        )}
                                        {editing.transaction_date && (
                                          <>
                                            <span>•</span>
                                            {new Date(editing.transaction_date).toLocaleDateString("vi-VN")}
                                          </>
                                        )}
                                        {original.is_unusual && (
                                          <>
                                            <span>•</span>
                                            <span className="text-red-600 font-medium">
                                              ⚠️ {Math.round(original.confidence_score * 100)}%
                                            </span>
                                          </>
                                        )}
                                      </div>

                                      {/* Tags */}
                                      {editing.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {editing.tags.slice(0, 2).map((tag, tagIndex) => (
                                            <Badge key={tagIndex} variant="secondary" className="text-xs">
                                              #{tag}
                                            </Badge>
                                          ))}
                                          {editing.tags.length > 2 && (
                                            <Badge variant="outline" className="text-xs">
                                              +{editing.tags.length - 2}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <Pencil className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        {/* Edit Transaction Pop-up */}
        {editPopupTransaction && (
          <Dialog open={!!editPopupTransaction} onOpenChange={closeEditPopup}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Edit Transaction
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Amount and Description Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <Input
                      type="number"
                      value={editPopupTransaction.transaction.amount}
                      onChange={(e) => updatePopupTransaction("amount", parseFloat(e.target.value) || 0)}
                      className="text-lg font-bold text-right"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Input
                      value={editPopupTransaction.transaction.description}
                      onChange={(e) => updatePopupTransaction("description", e.target.value)}
                    />
                  </div>
                </div>

                {/* Category, Wallet, Date Row */}
                <div className="grid grid-cols-3 gap-4">
                  {editPopupTransaction.transaction.transaction_type !== "transfer" && (
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <Select
                        value={editPopupTransaction.transaction.transaction_type === "expense" 
                          ? editPopupTransaction.transaction.expense_category_id 
                          : editPopupTransaction.transaction.income_category_id}
                        onValueChange={(value) => {
                          const field = editPopupTransaction.transaction.transaction_type === "expense" 
                            ? "expense_category_id" 
                            : "income_category_id";
                          updatePopupTransaction(field, value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getCurrentCategories(editPopupTransaction.transaction.transaction_type).map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name_vi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium">Wallet</Label>
                    <Select
                      value={editPopupTransaction.transaction.wallet_id}
                      onValueChange={(value) => updatePopupTransaction("wallet_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label className="text-sm font-medium">Date</Label>
                    <Input
                      type="date"
                      value={editPopupTransaction.transaction.transaction_date}
                      onChange={(e) => updatePopupTransaction("transaction_date", e.target.value)}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {editPopupTransaction.transaction.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0.5 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeTag(editPopupTransaction.index, tag)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </Badge>
                    ))}
                    {editPopupTransaction.original.suggested_tags
                      .filter((tag) => !editPopupTransaction.transaction.tags.includes(tag))
                      .map((tag, tagIndex) => (
                        <Button
                          key={tagIndex}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTag(editPopupTransaction.index, tag)}
                          className="h-6 px-2 text-xs border-dashed"
                        >
                          +{tag}
                        </Button>
                      ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <Textarea
                    value={editPopupTransaction.transaction.notes || ""}
                    onChange={(e) => updatePopupTransaction("notes", e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>

                {/* Unusual Transaction Warning */}
                {editPopupTransaction.original.is_unusual && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Unusual Transaction Detected</strong>
                      <br />
                      Confidence: {Math.round(editPopupTransaction.original.confidence_score * 100)}%
                      {editPopupTransaction.original.unusual_reasons && (
                        <div className="mt-1">
                          Reasons: {editPopupTransaction.original.unusual_reasons.join(", ")}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeEditPopup}>
                  Cancel
                </Button>
                <Button onClick={closeEditPopup}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <DialogFooter className="gap-3 flex-shrink-0 mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !editingTransactions.length}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 font-semibold"
            size="lg"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Transactions...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Confirm & Save {editingTransactions.length} Transaction
                {editingTransactions.length !== 1 ? "s" : ""}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
