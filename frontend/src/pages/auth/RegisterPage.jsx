import { useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { InlineAlert } from "../../components/common/InlineAlert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthLayout } from "../../layouts/AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { getAuthErrorMessage } from "../../services/authService";
import { cn } from "../../utils/cn";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "number", label: "One number", test: (v) => /\d/.test(v) },
  { key: "special", label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password") || "";

  const onSubmit = async (data) => {
    setFormError(null);
    try {
      await registerUser({
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      // Only reached once the backend is connected and registration
      // succeeds -- there is no fake success path.
      toast.success("Account created successfully.");
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Start tracking your training in a few seconds.
        </p>
      </div>

      {formError && (
        <InlineAlert variant="error" className="mb-4">
          {formError}
        </InlineAlert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            autoComplete="given-name"
            required
            error={errors.firstName?.message}
            {...register("firstName", { required: "Required" })}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            required
            error={errors.lastName?.message}
            {...register("lastName", { required: "Required" })}
          />
        </div>

        <Input
          label="Username"
          icon={User}
          autoComplete="username"
          required
          error={errors.username?.message}
          {...register("username", {
            required: "Username is required.",
            minLength: { value: 3, message: "Use at least 3 characters." },
          })}
        />

        <Input
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required.",
            pattern: { value: EMAIL_PATTERN, message: "Enter a valid email." },
          })}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={Lock}
            autoComplete="new-password"
            required
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            }
            {...register("password", {
              required: "Password is required.",
              minLength: { value: 8, message: "Use at least 8 characters." },
            })}
          />

          <ul className="mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(password);
              return (
                <li
                  key={rule.key}
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    passed ? "text-success" : "text-text-muted"
                  )}
                >
                  {passed ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <Input
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          icon={Lock}
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          trailing={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((show) => !show)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          }
          {...register("confirmPassword", {
            required: "Please confirm your password.",
            validate: (value) => value === password || "Passwords do not match.",
          })}
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
