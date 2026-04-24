import React from 'react';
import { Briefcase, UserCheck, Calendar, DollarSign, FileText, MoreVertical, ExternalLink, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';

export default function CaseManagementModule() {
  const { caseStatuses, cases, associates } = useStore();

  const getStatusInfo = (statusId: string) => {
    return caseStatuses.find(s => s.id === statusId) || { name: statusId, color: '#64748b' };
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-primary">M5. Gestión de Casos y Asesores</h3>
          <p className="text-gray-500">Bitácora de gestión, asignación de casos y seguimiento de acuerdos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-secondary flex items-center justify-center text-[10px] font-bold text-white">
                A{i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
              +8
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-brand-primary text-sm font-bold rounded-xl hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Casos Pendientes', value: '450', color: 'bg-blue-500' },
          { label: 'Promesas de Pago', value: '125', color: 'bg-emerald-500' },
          { label: 'Acuerdos Incumplidos', value: '12', color: 'bg-red-500' },
          { label: 'Casos en Gestión', value: '84', color: 'bg-brand-accent' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end gap-2">
              <h4 className="text-2xl font-bold text-brand-primary">{stat.value}</h4>
              <div className={cn("w-2 h-2 rounded-full mb-2", stat.color)}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h4 className="font-bold text-brand-primary">Cola de Gestión Prioritaria</h4>
          <button className="text-xs font-bold text-brand-accent hover:underline">Ver todos los casos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50">
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Asociado / Obligación</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Score IA</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Valor a Pagar</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Días Mora</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cases.slice(0, 5).map((caseItem, i) => {
                const associate = associates.find(a => a.id === caseItem.associateId);
                const statusInfo = getStatusInfo(caseItem.status);
                if (!associate) return null;

                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-brand-primary">{associate.name}</p>
                        <p className="text-xs text-gray-400">{associate.document}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-accent" style={{ width: `${(associate.score / 1000) * 100}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-brand-primary">{associate.score}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Score IA</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-bold text-brand-secondary">${associate.balance.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 italic">Monto Total</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "text-xs font-bold",
                        associate.daysOverdue > 60 ? "text-red-500" : associate.daysOverdue > 30 ? "text-amber-500" : "text-emerald-500"
                      )}>
                        {associate.daysOverdue} días
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span 
                          className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase w-fit text-white"
                          style={{ backgroundColor: statusInfo.color }}
                        >
                          {statusInfo.name}
                        </span>
                        <span className="text-[10px] text-gray-400 italic">{associate.lastAction || 'Sin gestión'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-brand-bg rounded-lg text-brand-accent transition-colors" title="Ver Detalle">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-brand-bg rounded-lg text-gray-400 hover:text-brand-primary transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-accent" />
            Gestión de Acuerdos
          </h4>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-brand-bg border border-brand-accent/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-brand-primary">Acuerdo de Pago #AC-102</span>
                <span className="text-xs text-gray-400">Vence: Mañana</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <UserCheck className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <p className="font-bold text-brand-primary">Ricardo Gómez</p>
                  <p className="text-xs text-gray-500">Monto: $1,500,000 (3 cuotas)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-brand-accent text-white text-xs font-bold rounded-lg shadow-sm">Confirmar Recaudo</button>
                <button className="flex-1 py-2 bg-white border border-gray-200 text-gray-500 text-xs font-bold rounded-lg">Reprogramar</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-accent" />
            Bitácora de Actividad Reciente
          </h4>
          <div className="space-y-6">
            {[
              { user: 'Asesor 01', action: 'Registró promesa de pago', target: 'Lucía Méndez', time: 'Hace 5m' },
              { user: 'Sistema IA', action: 'Desbordó caso por alto riesgo', target: 'Fernando Soto', time: 'Hace 12m' },
              { user: 'Asesor 03', action: 'Adjuntó evidencia de contacto', target: 'Roberto Jaramillo', time: 'Hace 25m' },
              { user: 'Sistema IA', action: 'Cerró caso por recaudo exitoso', target: 'Elena Rivas', time: 'Hace 1h' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                {i < 3 && <div className="absolute left-1.5 top-6 bottom-0 w-0.5 bg-gray-50"></div>}
                <div className="w-3 h-3 rounded-full bg-brand-accent mt-1 shrink-0"></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-brand-primary">
                    {log.user} <span className="font-normal text-gray-500">{log.action}</span>
                  </p>
                  <p className="text-[10px] text-brand-secondary font-medium mt-0.5">Asociado: {log.target}</p>
                </div>
                <span className="text-[10px] text-gray-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
