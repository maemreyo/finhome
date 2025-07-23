// src/components/wallets/WalletManager.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Wallet,
  CreditCard,
  PiggyBank,
  Plus,
  Eye,
  EyeOff,
  MoreHorizontal,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { WalletForm } from "./WalletForm";
import { DynamicIcon } from "@/lib/utils/icon-utils";

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  wallet_type: "cash" | "bank_account" | "e_wallet" | "credit_card" | "savings";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WalletManagerProps {
  initialWallets: Wallet[];
}

export function WalletManager({ initialWallets }: WalletManagerProps) {
  const [wallets, setWallets] = useState(initialWallets);
  const [showBalances, setShowBalances] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const t = useTranslations("Wallets");

  // Calculate totals
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalWallets = wallets.length;
  const cashWallets = wallets.filter((w) => w.wallet_type === "cash");
  const bankWallets = wallets.filter((w) => w.wallet_type === "bank_account");
  const eWallets = wallets.filter((w) => w.wallet_type === "e_wallet");
  const savingsWallets = wallets.filter((w) => w.wallet_type === "savings");

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "cash":
        return Wallet;
      case "bank_account":
        return CreditCard;
      case "e_wallet":
        return Wallet;
      case "credit_card":
        return CreditCard;
      case "savings":
        return PiggyBank;
      default:
        return Wallet;
    }
  };

  const getWalletTypeLabel = (type: string) => {
    return t(`types.${type}`);
  };

  const refreshWallets = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/expenses/wallets");
      if (response.ok) {
        const data = await response.json();
        setWallets(data.wallets);
        toast.success(t("messages.refreshSuccess"));
      }
    } catch (error) {
      toast.error(t("messages.refreshError"));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleWalletSuccess = (wallet: Wallet) => {
    if (editingWallet) {
      // Update existing wallet
      setWallets(prev => prev.map(w => w.id === wallet.id ? wallet : w));
    } else {
      // Add new wallet
      setWallets(prev => [...prev, wallet]);
    }
    setIsCreateDialogOpen(false);
    setEditingWallet(null);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm(t("messages.confirmDelete"))) return;

    try {
      const response = await fetch(`/api/expenses/wallets/${walletId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWallets(prev => prev.filter(w => w.id !== walletId));
        toast.success(t("messages.deleteSuccess"));
      } else {
        toast.error(t("messages.deleteError"));
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toast.error(t("messages.deleteError"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("overview.totalBalance")}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="h-6 w-6 p-0"
              >
                {showBalances ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalances ? formatCurrency(totalBalance) : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("overview.fromWallets", { count: totalWallets })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("overview.cash")}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalances
                ? formatCurrency(
                    cashWallets.reduce((sum, w) => sum + w.balance, 0)
                  )
                : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("overview.cashWallets", { count: cashWallets.length })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("overview.bank")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalances
                ? formatCurrency(
                    bankWallets.reduce((sum, w) => sum + w.balance, 0)
                  )
                : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("overview.bankAccounts", { count: bankWallets.length })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("overview.savings")}
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalances
                ? formatCurrency(
                    savingsWallets.reduce((sum, w) => sum + w.balance, 0)
                  )
                : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("overview.savingsAccounts", { count: savingsWallets.length })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("list.title")}
          </h2>
          <p className="text-muted-foreground">{t("list.description")}</p>
        </div>
        <Button onClick={() => {
          setEditingWallet(null);
          setIsCreateDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          {t("list.addNew")}
        </Button>
      </div>

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <Card className="p-12 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            {t("list.empty.title")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("list.empty.description")}
          </p>
          <Button onClick={() => {
            setEditingWallet(null);
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            {t("list.empty.createFirst")}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => {
            const IconComponent = getWalletIcon(wallet.wallet_type);

            return (
              <Card
                key={wallet.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: wallet.color + "20" }}
                    >
                      <DynamicIcon
                        name={wallet.icon || 'wallet'}
                        className="h-5 w-5"
                        style={{ color: wallet.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{wallet.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {getWalletTypeLabel(wallet.wallet_type)}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditWallet(wallet)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteWallet(wallet.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {showBalances
                          ? formatCurrency(wallet.balance)
                          : "••••••"}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {wallet.currency}
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      {t("list.updated", {
                        date: new Date(wallet.updated_at).toLocaleDateString(
                          "vi-VN"
                        ),
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Wallet Form Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWallet ? t("form.editWallet") : t("form.createWallet")}
            </DialogTitle>
          </DialogHeader>
          <WalletForm
            wallet={editingWallet}
            onSuccess={handleWalletSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
