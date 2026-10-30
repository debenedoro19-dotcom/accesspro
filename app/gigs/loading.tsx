import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div>
      <div className="bg-primary-950 py-14">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <Skeleton className="h-4 w-40 opacity-20" />
          <Skeleton className="mt-4 h-11 w-96 max-w-full opacity-20" />
          <Skeleton className="mt-4 h-5 w-72 opacity-20" />
        </div>
      </div>
      <div className="mx-auto max-w-8xl px-4 py-10 sm:px-6 lg:px-10">
        <Skeleton className="h-11 w-full" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    </div>
  );
}