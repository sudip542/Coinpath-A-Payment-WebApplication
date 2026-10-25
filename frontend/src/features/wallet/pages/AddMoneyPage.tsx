import React from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { AddMoneyForm } from "../components/AddMoneyForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft, Zap } from "lucide-react";

export const AddMoneyPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in-50 duration-200">
      <Link
        to="/wallet"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-3.5" />
        Back to Wallet
      </Link>

      <PageHeader
        title="Add Money to Wallet"
        description="Top up your digital wallet using instant mock gateway, card, or UPI."
      />

      <Card className="border-border/80 shadow-md">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Deposit Funds</CardTitle>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <Zap className="size-3.5" />
              <span>Instant Settlement</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <AddMoneyForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMoneyPage;
