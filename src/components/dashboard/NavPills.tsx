'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const base = 'inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm transition-all'
const active = 'bg-orange-500/80 text-white border border-white/20 shadow-[0_6px_20px_rgba(255,122,26,0.35)]'
const inactive = 'bg-white/10 text-white/80 border border-white/15 hover:bg-white/15'

type Item = { label: string; withChevron?: boolean }

export function NavPills({ items, onChange }: { items: Item[]; onChange?: (label: string) => void }) {
  const [current, setCurrent] = useState(items[0]?.label)
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = current === item.label
        return (
          <button
            key={item.label}
            className={`${base} ${isActive ? active : inactive}`}
            onClick={() => {
              setCurrent(item.label)
              onChange?.(item.label)
            }}
          >
            <span>{item.label}</span>
            {item.withChevron && <ChevronDown className="w-4 h-4 opacity-90" />}
          </button>
        )
      })}
    </div>
  )
}

