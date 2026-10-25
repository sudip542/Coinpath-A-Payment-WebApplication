import React from "react";
import { AppLogo } from "@/components/common/AppLogo";
import { LoginForm } from "../components/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Lock, Zap } from "lucide-react";

export const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Background ambient gradient */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="size-[500px] rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-500/10" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {/* Logo and Brand Title */}
        <div className="flex flex-col items-center text-center pb-6">
          <AppLogo to="/login" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access your digital wallet and transfer ledger
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-border/80 bg-card/90 shadow-xl backdrop-blur-xs">
          <CardContent className="p-6 sm:p-8">
            <LoginForm />
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>256-Bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="size-4 text-indigo-500" />
            <span>JWT Secure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="size-4 text-amber-500" />
            <span>Atomic Transfers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
