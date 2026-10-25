import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "../authSchemas";
import { authApi } from "../authApi";
import { useAppDispatch } from "@/store/hooks";
import { setAuthLoading, setAuthSuccess, setAuthFailure } from "../authSlice";
import { handleApiError } from "@/services/errorHandler";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail, ArrowRight, UserCheck, Shield } from "lucide-react";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    dispatch(setAuthLoading());

    try {
      const res = await authApi.login({
        email: data.email,
        password: data.password,
      });

      if (res.data) {
        dispatch(setAuthSuccess(res.data));
        toast.success(res.message || "Welcome back to Coinpath!");
        navigate("/dashboard");
      }
    } catch (err) {
      const apiErr = handleApiError(err);
      dispatch(setAuthFailure(apiErr.message));
      toast.error(apiErr.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (role: "user" | "admin") => {
    if (role === "admin") {
      setValue("email", "admin.system@coinpath.io");
      setValue("password", "Admin@12345");
    } else {
      setValue("email", "alex.mercer@coinpath.io");
      setValue("password", "SecureP@ss123");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Input */}
      <FormField
        id="email"
        label="Email Address"
        error={errors.email?.message}
        required
      >
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            className="pl-9"
            disabled={isSubmitting}
            {...register("email")}
          />
        </div>
      </FormField>

      {/* Password Input */}
      <FormField
        id="password"
        label="Password"
        error={errors.password?.message}
        required
      >
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="pl-9 pr-10"
            disabled={isSubmitting}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormField>

      {/* Remember me & Demo shortcuts */}
      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
          <input
            type="checkbox"
            className="size-3.5 rounded border-input accent-primary"
            {...register("rememberMe")}
          />
          <span>Remember me for 30 days</span>
        </label>
        <span className="text-muted-foreground">Demo Credentials:</span>
      </div>

      {/* Demo Pill Buttons */}
      <div className="flex items-center justify-end gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => fillDemoCredentials("user")}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:border-primary/50 hover:bg-muted"
        >
          <UserCheck className="size-3 text-emerald-500" />
          User Demo
        </button>
        <button
          type="button"
          onClick={() => fillDemoCredentials("admin")}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:border-rose-500/50 hover:bg-muted"
        >
          <Shield className="size-3 text-rose-500" />
          Admin Demo
        </button>
      </div>

      {/* Submit Button */}
      <SubmitButton
        isLoading={isSubmitting}
        loadingText="Authenticating..."
        icon={<ArrowRight className="size-4" />}
        className="mt-2"
      >
        Sign in to Account
      </SubmitButton>

      {/* Link to Register */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link
          to="/register"
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
