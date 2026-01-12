import React from "react"

export function SkeletonChart() {
  return (
    <div className="h-[300px] rounded-lg border border-zinc-800 bg-zinc-900/40 animate-pulse" />
  )
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-md border border-zinc-800 bg-zinc-900/40 animate-pulse"
        />
      ))}
    </div>
  )
}

