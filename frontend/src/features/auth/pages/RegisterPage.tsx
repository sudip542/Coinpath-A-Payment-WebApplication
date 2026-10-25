import React from "react";
import { AppLogo } from "@/components/common/AppLogo";
import { RegisterForm } from "../components/RegisterForm";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export const RegisterPage: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Background ambient gradient */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="size-[500px] rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {/* Logo and Brand Title */}
        <div className="flex flex-col items-center text-center pb-6">
          <AppLogo to="/register" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Open a digital wallet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get instant access to secure money transfers and payment management
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-border/80 bg-card/90 shadow-xl backdrop-blur-xs">
          <CardContent className="p-6 sm:p-8">
            <RegisterForm />
          </CardContent>
        </Card>

        {/* Features footnote */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Instant wallet setup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-indigo-500" />
            <span>Idempotent transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
