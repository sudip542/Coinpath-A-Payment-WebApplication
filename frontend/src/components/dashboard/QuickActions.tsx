import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Send, ArrowDownToLine, CreditCard } from "lucide-react";

interface QuickActionsProps {
  walletBlocked?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ walletBlocked = false }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Add Money */}
      <Button
        asChild
        disabled={walletBlocked}
        variant="outline"
        className="h-auto flex-col items-center justify-center gap-2 p-4 text-xs font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all shadow-2xs"
      >
        <Link to="/wallet/add-money">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <PlusCircle className="size-5" />
          </div>
          <span>Add Money</span>
        </Link>
      </Button>

      {/* Send Money */}
      <Button
        asChild
        disabled={walletBlocked}
        variant="outline"
        className="h-auto flex-col items-center justify-center gap-2 p-4 text-xs font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all shadow-2xs"
      >
        <Link to="/transfers/new">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Send className="size-5" />
          </div>
          <span>Send Money</span>
        </Link>
      </Button>

      {/* Withdraw */}
      <Button
        asChild
        disabled={walletBlocked}
        variant="outline"
        className="h-auto flex-col items-center justify-center gap-2 p-4 text-xs font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all shadow-2xs"
      >
        <Link to="/wallet/withdraw">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <ArrowDownToLine className="size-5" />
          </div>
          <span>Withdraw</span>
        </Link>
      </Button>

      {/* Payments */}
      <Button
        asChild
        variant="outline"
        className="h-auto flex-col items-center justify-center gap-2 p-4 text-xs font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all shadow-2xs"
      >
        <Link to="/payments">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
            <CreditCard className="size-5" />
          </div>
          <span>Payments</span>
        </Link>
      </Button>
    </div>
  );
};

export default QuickActions;
