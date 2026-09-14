import { useState } from "react";
import {
  Bell,
  Check,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
} from "lucide-react";

import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../hooks/useTheme";

const NOTIFICATION_PREFERENCES = [
  {
    key: "workoutReminders",
    label: "Workout reminders",
    description: "Get notified before a scheduled workout starts.",
  },
  {
    key: "weeklySummary",
    label: "Weekly summary",
    description: "A recap of your training activity every Monday.",
  },
  {
    key: "productUpdates",
    label: "Product updates",
    description: "Occasional news about new features.",
  },
];

function ToggleSwitch({ id, checked, onChange, label }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 flex-none rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BAFF24]/40 ${
        checked ? "bg-[#BAFF24]" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full shadow transition-transform duration-200 ${
          checked
            ? "translate-x-5 bg-black"
            : "translate-x-0.5 bg-white/70"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    weeklySummary: true,
    productUpdates: false,
  });

  const toggleNotification = (key) => {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#151515] via-[#101010] to-[#090909] px-6 py-8 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#BAFF24]/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#BAFF24]/20 bg-[#BAFF24]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#BAFF24]">
            <Palette className="h-3.5 w-3.5" />
            Preferences
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Make Workout Tracker
            <span className="block text-[#BAFF24]">
              work your way.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
            Customize the appearance and notifications of your fitness
            workspace.
          </p>
        </div>
      </section>

      {/* Appearance */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BAFF24]/10">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-[#BAFF24]" />
              ) : (
                <Sun className="h-5 w-5 text-[#BAFF24]" />
              )}
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Appearance
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                Choose your preferred visual theme
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ThemeOption
              icon={Sun}
              title="Light"
              description="Bright and clean"
              active={theme === "light"}
              onClick={() => setTheme("light")}
            />

            <ThemeOption
              icon={Moon}
              title="Dark"
              description="Easy on the eyes"
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Notifications */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BAFF24]/10">
              <Bell className="h-5 w-5 text-[#BAFF24]" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Notifications
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                Control which updates you receive
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="divide-y divide-white/10">
          {NOTIFICATION_PREFERENCES.map((preference) => (
            <div
              key={preference.key}
              className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  {preference.label}
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  {preference.description}
                </p>
              </div>

              <ToggleSwitch
                id={preference.key}
                label={preference.label}
                checked={notifications[preference.key]}
                onChange={() => toggleNotification(preference.key)}
              />
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Account & Security */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BAFF24]/10">
              <ShieldCheck className="h-5 w-5 text-[#BAFF24]" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-white">
                Account & Security
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                Account management
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#BAFF24]/10">
                <Check className="h-4 w-4 text-[#BAFF24]" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Authentication secured
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Your account is protected using the application's
                  authenticated session and JWT-based authentication.
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

function ThemeOption({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
        active
          ? "border-[#BAFF24]/50 bg-[#BAFF24]/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
          active
            ? "bg-[#BAFF24] text-black"
            : "bg-white/5 text-white/50"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-white/40">
          {description}
        </p>
      </div>

      {active && (
        <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#BAFF24]">
          <Check className="h-3.5 w-3.5 text-black" />
        </div>
      )}
    </button>
  );
}