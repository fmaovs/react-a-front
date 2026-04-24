import React from 'react';
import { 
  DollarSign, 
  Link as LinkIcon, 
  Send, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Smartphone,
  ArrowRight,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function RecaudoModule() {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-primary">M6. Recaudo y Links de Pago</h3>
          <p className="text-gray-500">Generación de links personalizados, integración con pasarelas y conciliación de pagos.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all disabled:opacity-50 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          {isGenerating ? 'Generando...' : 'Nuevo Link de Pago'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-brand-accent" />
            Links de Pago Generados Recientemente
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Asociado</th>
                  <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Valor a Pagar</th>
                  <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Vigencia</th>
                  <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="pb-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Canal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'Juan Pérez', amount: '$150,000', expiry: '24 Mar 2024', status: 'Pagado', channel: 'WhatsApp' },
                  { name: 'Maria Garcia', amount: '$420,000', expiry: '22 Mar 2024', status: 'Pendiente', channel: 'SMS' },
                  { name: 'Carlos Ruiz', amount: '$280,000', expiry: '20 Mar 2024', status: 'Vencido', channel: 'Email' },
                  { name: 'Ana Lopez', amount: '$85,000', expiry: '25 Mar 2024', status: 'Pendiente', channel: 'WhatsApp' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-bold text-brand-primary">{row.name}</td>
                    <td className="py-4 font-mono text-sm">{row.amount}</td>
                    <td className="py-4 text-xs text-gray-500">{row.expiry}</td>
                    <td className="py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-lg uppercase",
                        row.status === 'Pagado' ? "bg-emerald-50 text-emerald-600" : 
                        row.status === 'Vencido' ? "bg-red-50 text-red-600" : 
                        "bg-blue-50 text-blue-600"
                      )}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {row.channel === 'WhatsApp' && <Smartphone className="w-3 h-3" />}
                        {row.channel === 'SMS' && <Smartphone className="w-3 h-3" />}
                        {row.channel === 'Email' && <Send className="w-3 h-3" />}
                        {row.channel}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
            <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-accent" />
              Pasarelas Integradas
            </h4>
            <div className="space-y-4">
              {[
                { name: 'PSE / ACH', status: 'Activo', icon: CheckCircle2 },
                { name: 'Bancolombia', status: 'Activo', icon: CheckCircle2 },
                { name: 'Wompi', status: 'Mantenimiento', icon: Clock },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50">
                  <span className="font-bold text-brand-primary">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <p.icon className={cn("w-4 h-4", p.status === 'Activo' ? "text-emerald-500" : "text-amber-500")} />
                    <span className={cn("text-xs font-bold", p.status === 'Activo' ? "text-emerald-600" : "text-amber-600")}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-primary text-white p-8 rounded-3xl shadow-xl gradient-brand">
            <h4 className="text-lg font-bold mb-4">Conciliación Automática</h4>
            <p className="text-white/70 text-sm mb-6">
              El sistema realiza una conciliación cada 15 minutos con las pasarelas de pago para actualizar el estado de las obligaciones en tiempo real.
            </p>
            <div className="flex items-center justify-between text-xs border-t border-white/10 pt-4">
              <span>Última Conciliación</span>
              <span className="font-bold">Hace 4 minutos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
