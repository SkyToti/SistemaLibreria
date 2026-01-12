'use client'

import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface RevenueChartProps {
  data?: { date: string; amount: number }[]
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#71717a', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fill: '#71717a', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-xl border border-white/10 bg-zinc-900/90 p-3 shadow-xl backdrop-blur-md">
                    <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
                    <p className="text-lg font-bold text-white">
                      ${payload[0].value}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, fill: '#6366f1', stroke: '#18181b', strokeWidth: 4 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
