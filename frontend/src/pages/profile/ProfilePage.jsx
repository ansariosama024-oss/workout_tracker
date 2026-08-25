import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";

import { Avatar } from "../../components/common/Avatar";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { formatDate, getInitials } from "../../utils/formatters";

/**
 * Profile page. There is no authenticated user yet, so every field shows
 * its real (empty) state rather than fabricated account details.
 */
export default function ProfilePage() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
    },
  });

  const onSubmit = async () => {
    // No backend integration yet -- this does not persist anything.
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast("Profile changes captured. Saving will be enabled once the API is connected.");
  };

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account information." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <Card.Body className="flex flex-col items-center py-8 text-center">
            <Avatar
              size="lg"
              initials={getInitials(user?.first_name, user?.last_name)}
            />
            <p className="mt-4 font-display text-base font-semibold text-text-primary">
              {user ? `${user.first_name} ${user.last_name}` : "Not signed in"}
            </p>
            <p className="text-sm text-text-muted">
              {user?.email ?? "Connect an account to see your details"}
            </p>
            <p className="mt-3 text-xs text-text-muted">
              Member since {user?.date_joined ? formatDate(user.date_joined) : "\u2014"}
            </p>
          </Card.Body>
        </Card>

        <Card className="lg:col-span-2">
          <Card.Header>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Edit profile
            </h2>
          </Card.Header>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Card.Body className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First name" {...register("firstName")} />
              <Input label="Last name" {...register("lastName")} />
              <Input label="Username" {...register("username")} />
              <Input label="Email" type="email" {...register("email")} />
            </Card.Body>
            <Card.Footer>
              <Button
                type="submit"
                icon={Pencil}
                isLoading={isSubmitting}
                disabled={!isDirty}
              >
                Save changes
              </Button>
            </Card.Footer>
          </form>
        </Card>
      </div>
    </div>
  );
}
