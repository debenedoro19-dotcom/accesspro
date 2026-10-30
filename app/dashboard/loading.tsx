import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="mx-auto max-w-8xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[236px_1fr]">
        <div className="hidden space-y-3 lg:block">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
        <div>
          <Skeleton className="h-20 w-full" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </div>
    </div>
  );
}