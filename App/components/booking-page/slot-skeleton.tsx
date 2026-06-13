export function SlotSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-neutral-800" />
      ))}
    </div>
  );
}
