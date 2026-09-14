import { useMemo } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Mail,
  Pencil,
  UserRound,
} from "lucide-react";

import { Avatar } from "../../components/common/Avatar";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { formatDate, getInitials } from "../../utils/formatters";

export default function ProfilePage() {
  const { user } = useAuth();

  const fullName = useMemo(() => {
    if (!user) return "Not signed in";

    const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

    return name || user.username || "Workout Athlete";
  }, [user]);

  const initials = getInitials(
    user?.first_name || user?.username,
    user?.last_name
  );

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#151515] via-[#101010] to-[#090909] px-6 py-8 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#BAFF24]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar
            size="lg"
            initials={initials}
          />

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#BAFF24]/20 bg-[#BAFF24]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#BAFF24]">
              <UserRound className="h-3.5 w-3.5" />
              Your Profile
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {fullName}
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Manage your account and keep your fitness journey organized.
            </p>
          </div>
        </div>
      </section>

      {/* Main */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <Card.Body className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BAFF24]/10">
                <UserRound className="h-5 w-5 text-[#BAFF24]" />
              </div>

              <div>
                <h2 className="font-display text-base font-semibold text-white">
                  Account
                </h2>
                <p className="text-xs text-white/40">
                  Your account overview
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col items-center text-center">
              <Avatar
                size="lg"
                initials={initials}
              />

              <h3 className="mt-4 text-lg font-bold text-white">
                {fullName}
              </h3>

              <p className="mt-1 text-sm text-white/45">
                @{user?.username ?? "username"}
              </p>
            </div>

            <div className="mt-7 space-y-3">
              <InfoRow
                icon={Mail}
                label="Email"
                value={user?.email || "—"}
              />

              <InfoRow
                icon={CalendarDays}
                label="Member since"
                value={
                  user?.date_joined
                    ? formatDate(user.date_joined)
                    : "—"
                }
              />

              <InfoRow
                icon={CheckCircle2}
                label="Account status"
                value="Active"
                accent
              />
            </div>
          </Card.Body>
        </Card>

        {/* Personal information */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <Pencil className="h-4 w-4 text-white/60" />
              </div>

              <div>
                <h2 className="font-display text-base font-semibold text-white">
                  Personal Information
                </h2>

                <p className="mt-0.5 text-xs text-white/40">
                  Your account details
                </p>
              </div>
            </div>
          </Card.Header>

          <Card.Body className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={user?.first_name ?? ""}
                readOnly
              />

              <Input
                label="Last name"
                value={user?.last_name ?? ""}
                readOnly
              />

              <Input
                label="Username"
                value={user?.username ?? ""}
                readOnly
              />

              <Input
                label="Email"
                type="email"
                value={user?.email ?? ""}
                readOnly
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#BAFF24]/10">
                  <Dumbbell className="h-4 w-4 text-[#BAFF24]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Profile editing
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/40">
                    Your profile information is currently managed through
                    your authenticated account. A dedicated profile update
                    API can be added later when needed.
                  </p>
                </div>
              </div>
            </div>
          </Card.Body>

          <Card.Footer>
            <Button
              type="button"
              icon={Pencil}
              disabled
            >
              Edit profile
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  accent = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
          <Icon
            className={`h-4 w-4 ${
              accent ? "text-[#BAFF24]" : "text-white/50"
            }`}
          />
        </div>

        <span className="text-xs text-white/40">
          {label}
        </span>
      </div>

      <span
        className={`max-w-[55%] truncate text-right text-sm font-medium ${
          accent ? "text-[#BAFF24]" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}