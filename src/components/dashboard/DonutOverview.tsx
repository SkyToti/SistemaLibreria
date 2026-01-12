'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a78bfa']

const data = [
  { name: 'Ficción', value: 45, color: COLORS[0] },
  { name: 'No Ficción', value: 30, color: COLORS[1] },
  { name: 'Infantil', value: 15, color: COLORS[2] },
  { name: 'Educativo', value: 10, color: COLORS[3] },
  { name: 'Historia', value: 20, color: COLORS[4] },
]

export function DonutOverview() {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex-1 min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={75}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 shadow-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: payload[0].payload.color }}
                        />
                        <span className="text-sm font-medium text-zinc-200">
                          {payload[0].name}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {payload[0].value} <span className="text-xs text-zinc-500 font-normal">ventas</span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centro del Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-white tracking-tight">{total}</span>
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total</span>
        </div>
      </div>

      {/* Leyenda Personalizada Moderna */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full ring-2 ring-zinc-900" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-xs font-medium text-zinc-300">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-zinc-500">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
