import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Mail, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthLayout } from "../../layouts/AuthLayout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Forgot Password screen. This is UI-only: there is no password-reset
 * endpoint on the backend yet, so submitting never claims an email was
 * sent. Instead it transitions to an honest "not connected yet" panel.
 */
export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "" } });

  const onSubmit = async (data) => {
    // No password-reset endpoint exists yet, so this deliberately does
    // not call any service. It only reflects the form's own input back.
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSubmittedEmail(data.email);
  };

  if (submittedEmail) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-subtle text-warning">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-xl font-semibold text-text-primary">
            Password recovery isn&apos;t connected yet
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Nothing was sent to <strong className="text-text-primary">{submittedEmail}</strong>{" "}
            because the backend doesn&apos;t have a password-reset endpoint
            yet. Once it does, this is where you&apos;ll be told to check
            your inbox.
          </p>
          <Button as={Link} to="/login" variant="outline" icon={ArrowLeft} className="mt-6">
            Back to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Enter your email and we&apos;ll explain what happens next.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Remembered your password?{" "}
        <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
