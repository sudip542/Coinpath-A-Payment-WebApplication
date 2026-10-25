import type { WalletResponseDto } from "@/types/wallet";
import type { TransactionResponseDto } from "@/types/transaction";

export interface DashboardMetrics {
  wallet: WalletResponseDto | null;
  recentTransactions: TransactionResponseDto[];
  monthlyInflow: number;
  monthlyOutflow: number;
  chartData: Array<{ date: string; income: number; expenses: number }>;
}
