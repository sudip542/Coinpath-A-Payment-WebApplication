import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerSchema, type RegisterFormData } from "../authSchemas";
import { authApi } from "../authApi";
import { useAppDispatch } from "@/store/hooks";
import { setAuthLoading, setAuthSuccess, setAuthFailure } from "../authSlice";
import { handleApiError } from "@/services/errorHandler";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail, User, Check, ArrowRight } from "lucide-react";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const passwordVal = watch("password") || "";
  const hasMinLength = passwordVal.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordVal);
  const hasNumber = /[0-9]/.test(passwordVal);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    dispatch(setAuthLoading());

    try {
      const res = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      if (res.data) {
        dispatch(setAuthSuccess(res.data));
        toast.success(res.message || "Account created successfully!");
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <FormField
        id="fullName"
        label="Full Name"
        error={errors.fullName?.message}
        required
      >
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="fullName"
            placeholder="Alex Mercer"
            autoComplete="name"
            className="pl-9"
            disabled={isSubmitting}
            {...register("fullName")}
          />
        </div>
      </FormField>

      {/* Email */}
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
            placeholder="alex@company.com"
            autoComplete="email"
            className="pl-9"
            disabled={isSubmitting}
            {...register("email")}
          />
        </div>
      </FormField>

      {/* Password */}
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
            placeholder="Create a strong password"
            autoComplete="new-password"
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

      {/* Real-time Password checklist */}
      <div className="rounded-lg bg-muted/40 p-2.5 text-xs space-y-1.5 border border-border/60">
        <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
          Password Criteria
        </p>
        <div className="grid grid-cols-1 gap-1 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Check className={`size-3.5 ${hasMinLength ? "text-emerald-500 font-bold" : "text-muted-foreground/40"}`} />
            <span className={hasMinLength ? "text-foreground font-medium" : ""}>At least 8 characters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className={`size-3.5 ${hasUppercase ? "text-emerald-500 font-bold" : "text-muted-foreground/40"}`} />
            <span className={hasUppercase ? "text-foreground font-medium" : ""}>At least 1 uppercase letter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className={`size-3.5 ${hasNumber ? "text-emerald-500 font-bold" : "text-muted-foreground/40"}`} />
            <span className={hasNumber ? "text-foreground font-medium" : ""}>At least 1 numeric digit</span>
          </div>
        </div>
      </div>

      {/* Confirm Password */}
      <FormField
        id="confirmPassword"
        label="Confirm Password"
        error={errors.confirmPassword?.message}
        required
      >
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat password"
            autoComplete="new-password"
            className="pl-9"
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
        </div>
      </FormField>

      {/* Terms & Conditions */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted-foreground select-none">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-input accent-primary"
            {...register("terms")}
          />
          <span>
            I agree to the Coinpath{" "}
            <a href="#terms" className="text-primary hover:underline font-medium">Terms of Service</a>{" "}
            and{" "}
            <a href="#privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>.
          </span>
        </label>
        {errors.terms && (
          <p className="mt-1 text-xs font-medium text-destructive">{errors.terms.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <SubmitButton
        isLoading={isSubmitting}
        loadingText="Creating Digital Wallet..."
        icon={<ArrowRight className="size-4" />}
        className="mt-3"
      >
        Create Free Account
      </SubmitButton>

      {/* Link to Login */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        Already have a Coinpath account?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          Sign in here
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
