import React from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { TransferForm } from "../components/TransferForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export const SendMoneyPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in-50 duration-200">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-3.5" />
        Back to Dashboard
      </Link>

      <PageHeader
        title="Send Money"
        description="Transfer funds to any Coinpath wallet instantly via email address or wallet identifier."
      />

      <Card className="border-border/80 shadow-md">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Transfer Details</CardTitle>
            <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              <ShieldCheck className="size-3.5" />
              <span>Atomic Double-Entry</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <TransferForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SendMoneyPage;
