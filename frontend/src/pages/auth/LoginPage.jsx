import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { InlineAlert } from "../../components/common/InlineAlert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthLayout } from "../../layouts/AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { getAuthErrorMessage } from "../../services/authService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "", rememberMe: false } });

  const onSubmit = async (data) => {
    setFormError(null);
    try {
      await login({ email: data.email, password: data.password });
      // Only reached once the backend is connected and credentials are
      // valid -- there is no fake success path.
      toast.success("Signed in successfully.");
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Sign in to keep track of your training.
        </p>
      </div>

      {formError && (
        <InlineAlert variant="error" className="mb-4">
          {formError}
        </InlineAlert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          icon={Mail}
          required
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required.",
            pattern: { value: EMAIL_PATTERN, message: "Enter a valid email." },
          })}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          icon={Lock}
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
          {...register("password", { required: "Password is required." })}
        />

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              {...register("rememberMe")}
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-primary hover:text-primary-hover">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
