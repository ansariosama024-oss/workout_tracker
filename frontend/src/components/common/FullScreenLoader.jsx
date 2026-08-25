import { Spinner } from "../ui/Spinner";

/**
 * Full-viewport loading state shown only during auth initialization
 * (see AuthContext's isLoading). Resolves almost immediately today since
 * there's no stored session to validate, but the gate stays in place so
 * the future "check token -> refresh -> fetch /auth/me/" sequence has
 * somewhere honest to render while it runs.
 */
export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Spinner size="lg" label="Loading Workout Tracker" />
    </div>
  );
}
