import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle text-primary">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
        404
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-text-primary">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button as={Link} to="/dashboard" className="mt-6">
        Back to dashboard
      </Button>
    </div>
  );
}
