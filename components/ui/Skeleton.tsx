import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-gray-200", className)} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="w-10 h-10 bg-gray-200 rounded-xl mb-3 animate-pulse" />
      <div className="h-3 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-8 w-20 bg-gray-200 rounded mb-1 animate-pulse" />
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
