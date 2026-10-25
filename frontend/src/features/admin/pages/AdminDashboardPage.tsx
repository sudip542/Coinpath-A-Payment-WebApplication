import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  FileText,
  Activity,
  CheckCircle2,
  Users,
  CreditCard,
  Server,
  ArrowRight,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Admin Control Center"
        description="High-level financial throughput, ledger reconciliation status, and system telemetry."
        badge={
          <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            ADMINISTRATOR
          </span>
        }
        actions={
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to="/admin/audit-logs">
              <FileText className="size-3.5" />
              Inspect Audit Trail
            </Link>
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Ledger Volume</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">₹4,82,500.00</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                +14.2% this week
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Activity className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Settled Payments</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">1,248</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                99.8% Gateway Success
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <CreditCard className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Wallets</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">384</p>
              <p className="text-[10px] text-muted-foreground mt-1">0 Suspended</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Ledger Discrepancies</p>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                0
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Double-Entry Balanced</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backend Infrastructure Telemetry */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Server className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold">Services Health Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs space-y-3">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="font-semibold text-foreground">Spring Boot Core Engine</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="size-2 rounded-full bg-emerald-500" /> UP (port 8080)
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="font-semibold text-foreground">PostgreSQL 16 & Flyway</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="size-2 rounded-full bg-emerald-500" /> MIGRATED
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="font-semibold text-foreground">Redis Cache & Rate Limiter</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="size-2 rounded-full bg-emerald-500" /> HEALTHY
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="font-semibold text-foreground">Kafka Event Bus</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="size-2 rounded-full bg-emerald-500" /> CONNECTED
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Audit Shortcuts */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-rose-500" />
              <CardTitle className="text-sm font-bold">Audit & Compliance Trail</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs space-y-3">
            <p className="text-muted-foreground">
              Every financial mutation in Coinpath writes an immutable append-only record in the audit repository capturing the actor identifier, timestamp, action type, IP address, and payload parameters.
            </p>
            <div className="rounded-lg bg-muted/40 p-3 border border-border/50 text-[11px] font-mono text-muted-foreground">
              Endpoint: /api/admin/audit-logs
            </div>
          </CardContent>
          <div className="p-4 border-t border-border/60">
            <Button asChild size="sm" className="w-full gap-2">
              <Link to="/admin/audit-logs">
                Open Full Audit Logs <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
