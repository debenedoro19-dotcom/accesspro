import { KeyRound } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <Card className="p-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-900">
          <KeyRound className="h-8 w-8 text-accent-400" aria-hidden />
        </span>
        <p className="mt-5 font-mono text-sm font-bold tracking-[0.3em] text-stone-400">ERROR 404</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-primary-900">This door doesn't open.</h1>
        <p className="mt-3 text-stone-500">
          The page you're looking for has expired, moved, or never had a valid code.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Button href="/" variant="accent">Back to home</Button>
          <Button href="/gigs" variant="secondary">Browse gigs</Button>
        </div>
      </Card>
    </div>
  );
}