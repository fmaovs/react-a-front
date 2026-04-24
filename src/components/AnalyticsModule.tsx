import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Brain, TrendingUp, ShieldAlert, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';

export default function AnalyticsModule() {
  const { associates } = useStore();

  const riskCounts = associates.reduce((acc, a) => {
    acc[a.risk] = (acc[a.risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskData = [
    { name: 'Bajo', value: riskCounts['Bajo'] || 0, color: '#10989B' },
    { name: 'Medio', value: riskCounts['Medio'] || 0, color: '#055177' },
    { name: 'Alto', value: riskCounts['Alto'] || 0, color: '#0A3B4E' },
    { name: 'Crítico', value: riskCounts['Crítico'] || 0, color: '#001822' },
  ];

  const recoveryTrend = [
    { month: 'Ene', recovery: 65, goal: 70 },
    { month: 'Feb', recovery: 72, goal: 70 },
    { month: 'Mar', recovery: 78, goal: 75 },
    { month: 'Abr', recovery: 85, goal: 80 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-primary">M2. Analítica y Perfilamiento IA</h3>
          <p className="text-gray-500">Modelos predictivos de comportamiento de pago y scoring de riesgo.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-black/5">
          <Brain className="w-5 h-5 text-brand-accent" />
          <span className="text-sm font-bold text-brand-primary">Motor IA: v3.2.0 Activo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold text-brand-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-accent" />
              Tendencia de Recuperación vs Meta
            </h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recoveryTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="recovery" stroke="#10989B" strokeWidth={3} dot={{ r: 4, fill: '#10989B' }} />
                <Line type="monotone" dataKey="goal" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-8 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-accent" />
            Distribución de Riesgo
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {riskData.map((risk, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: risk.color }}></span>
                  <span className="text-gray-600">{risk.name}</span>
                </div>
                <span className="font-bold text-brand-primary">
                  {associates.length > 0 ? ((risk.value / associates.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
        <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-accent" />
          Perfilamiento de Asociados (Top Propensión)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Asociado</th>
                <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Score IA</th>
                <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Propensión</th>
                <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Mejor Acción</th>
                <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {associates.slice(0, 10).map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-bold text-brand-primary">{row.name}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-accent" style={{ width: `${(row.score / 1000) * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-bold">{row.score}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-lg",
                      row.propensity === 'Alta' ? "bg-emerald-50 text-emerald-600" : row.propensity === 'Media' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                    )}>
                      {row.propensity}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-600">{row.lastAction || 'Pendiente'}</td>
                  <td className="py-4">
                    <span className={cn(
                      "text-xs font-bold",
                      row.risk === 'Bajo' ? "text-emerald-500" : row.risk === 'Medio' ? "text-blue-500" : row.risk === 'Alto' ? "text-amber-500" : "text-red-500"
                    )}>
                      {row.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
