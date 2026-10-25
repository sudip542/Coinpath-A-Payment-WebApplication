import React from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { WithdrawForm } from "../components/WithdrawForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft, ArrowDownToLine } from "lucide-react";

export const WithdrawPage: React.FC = () => {
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
        title="Withdraw Funds"
        description="Transfer your digital wallet balance directly to your linked bank account or UPI ID."
      />

      <Card className="border-border/80 shadow-md">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Withdraw to Bank / UPI</CardTitle>
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <ArrowDownToLine className="size-3.5" />
              <span>Direct Bank Settlement</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <WithdrawForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawPage;
