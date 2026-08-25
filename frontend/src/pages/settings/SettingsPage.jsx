import { useState } from "react";
import { Bell, Moon, ShieldCheck, Sun } from "lucide-react";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
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

/** Simple accessible on/off switch used by the notification preferences. */
function ToggleSwitch({ id, checked, onChange, label }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 flex-none rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
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
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleSaveAccount = (event) => {
    event.preventDefault();
    toast("Account settings captured. Saving will be enabled once the API is connected.");
  };

  return (
    <div>
      <PageHeader title="Settings" description="Configure how Workout Tracker works for you." />

      <div className="space-y-6">
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4 text-text-muted" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4 text-text-muted" aria-hidden="true" />
              )}
              <h2 className="font-display text-base font-semibold text-text-primary">
                Appearance
              </h2>
            </div>
          </Card.Header>
          <Card.Body>
            <p className="mb-3 text-sm text-text-secondary">
              Choose how Workout Tracker looks on this device.
            </p>
            <div className="inline-flex rounded-lg border border-border p-1">
              <button
                type="button"
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  theme === "light"
                    ? "bg-primary-subtle text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-primary-subtle text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Dark
              </button>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <h2 className="font-display text-base font-semibold text-text-primary">
                Notifications
              </h2>
            </div>
          </Card.Header>
          <Card.Body className="divide-y divide-border">
            {NOTIFICATION_PREFERENCES.map((pref) => (
              <div
                key={pref.key}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <label
                    htmlFor={pref.key}
                    className="text-sm font-medium text-text-primary"
                  >
                    {pref.label}
                  </label>
                  <p className="text-xs text-text-muted">{pref.description}</p>
                </div>
                <ToggleSwitch
                  id={pref.key}
                  label={pref.label}
                  checked={notifications[pref.key]}
                  onChange={() => toggleNotification(pref.key)}
                />
              </div>
            ))}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <h2 className="font-display text-base font-semibold text-text-primary">
                Account
              </h2>
            </div>
          </Card.Header>
          <form onSubmit={handleSaveAccount}>
            <Card.Body>
              <p className="text-sm text-text-secondary">
                Password changes, connected sessions, and data export will
                live here once account management is connected to the
                backend.
              </p>
            </Card.Body>
            <Card.Footer>
              <Button type="submit" variant="outline">
                Save account settings
              </Button>
            </Card.Footer>
          </form>
        </Card>
      </div>
    </div>
  );
}
