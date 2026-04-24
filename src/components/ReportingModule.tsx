import React from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Download, 
  Filter, 
  Calendar, 
  FileText, 
  History,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../lib/utils';

const channelEffectiveness = [
  { name: 'WhatsApp', value: 75, color: '#10989B' },
  { name: 'Llamada', value: 62, color: '#055177' },
  { name: 'Email', value: 45, color: '#0A3B4E' },
  { name: 'SMS', value: 38, color: '#001822' },
];

const dailyRecovery = [
  { day: 'Lun', amount: 4500000 },
  { day: 'Mar', amount: 5200000 },
  { day: 'Mie', amount: 3800000 },
  { day: 'Jue', amount: 6100000 },
  { day: 'Vie', amount: 7500000 },
  { day: 'Sab', amount: 2100000 },
];

export default function ReportingModule() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-primary">M7. Reporting, Auditoría y Gobierno</h3>
          <p className="text-gray-500">Indicadores de gestión, monitoreo del modelo y trazabilidad inalterable.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-brand-primary text-sm font-bold rounded-xl hover:bg-gray-50 transition-all">
            <Calendar className="w-4 h-4" />
            Últimos 30 días
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all shadow-lg">
            <Download className="w-5 h-5" />
            Exportar Reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-8 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-accent" />
            Recuperación Diaria (COP)
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRecovery}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10989B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10989B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10989B" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-8 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-brand-accent" />
            Efectividad por Canal
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelEffectiveness} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} width={80} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {channelEffectiveness.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-gray-400 mt-4 italic">
            * Porcentaje de promesas de pago generadas por canal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-brand-accent" />
            Auditoría de Cambios (Gobierno)
          </h4>
          <div className="space-y-4">
            {[
              { user: 'Admin_Camilo', action: 'Modificó Política de Riesgo Alto', date: 'Hace 2 horas', type: 'Config' },
              { user: 'System_IA', action: 'Actualizó pesos de scoring v3.2', date: 'Hace 5 horas', type: 'Model' },
              { user: 'Supervisor_Elena', action: 'Aprobó excepción de cobro #992', date: 'Ayer', type: 'Auth' },
            ].map((audit, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-accent font-bold text-xs">
                    {audit.type[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-primary">{audit.action}</p>
                    <p className="text-xs text-gray-400">Por: {audit.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{audit.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-accent" />
            Monitoreo de Salud del Modelo
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Precisión Scoring</p>
              <p className="text-2xl font-bold text-emerald-700">94.2%</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Deriva de Datos</p>
              <p className="text-2xl font-bold text-blue-700">0.02%</p>
            </div>
            <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100">
              <p className="text-[10px] font-bold text-violet-600 uppercase mb-1">Explicabilidad</p>
              <p className="text-2xl font-bold text-violet-700">SHAP/LIME</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Último Retrain</p>
              <p className="text-2xl font-bold text-amber-700">18 Mar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
