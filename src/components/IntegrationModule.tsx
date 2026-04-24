import React from 'react';
import { Database, Upload, CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function IntegrationModule() {
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const simulateUpload = () => {
    setIsUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsUploading(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-primary">M1. Integración y Adquisición de Datos</h3>
          <p className="text-gray-500">Gestión de ingesta vía API y Archivos Batch (TXT/CSV). <button className="text-brand-accent hover:underline font-bold text-sm ml-2">Ver Estructura de Archivo</button></p>
        </div>
        <button 
          onClick={simulateUpload}
          disabled={isUploading}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all disabled:opacity-50"
        >
          <Upload className="w-5 h-5" />
          {isUploading ? 'Procesando...' : 'Cargar Archivo Batch'}
        </button>
      </div>

      {isUploading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-2xl border border-brand-accent/20 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-brand-primary">Procesando Lote: CARTERA_20240319.csv</span>
            <span className="text-sm font-bold text-brand-accent">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 flex gap-4 text-xs text-gray-400">
            <span>Validando esquema...</span>
            <span>Verificando saldos...</span>
            <span>Conciliando con CORE...</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-accent" />
            Estado de Conexión CORE
          </h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-bold text-emerald-700">API Gateway Activo</p>
                  <p className="text-xs text-emerald-600">Latencia: 45ms | Uptime: 99.9%</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-1 rounded-lg">ONLINE</span>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Endpoints Recientes</p>
              {[
                { path: '/api/v1/cartera/sync', method: 'POST', status: 200, time: 'Hace 2 min' },
                { path: '/api/v1/pagos/notificar', method: 'POST', status: 200, time: 'Hace 5 min' },
                { path: '/api/v1/asociados/perfil', method: 'GET', status: 200, time: 'Hace 12 min' },
              ].map((api, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">{api.method}</span>
                    <span className="text-sm font-mono text-gray-600">{api.path}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-emerald-500">{api.status}</span>
                    <span className="text-xs text-gray-400">{api.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-accent" />
            Historial de Cargas Batch
          </h4>
          <div className="space-y-4">
            {[
              { name: 'Lote_Marzo_Q1.txt', records: 12500, errors: 0, date: '15 Mar 2024', status: 'Exitoso' },
              { name: 'Novedades_Nomina.csv', records: 4200, errors: 12, date: '14 Mar 2024', status: 'Parcial' },
              { name: 'Ajustes_Saldos_V2.txt', records: 850, errors: 0, date: '12 Mar 2024', status: 'Exitoso' },
            ].map((batch, i) => (
              <div key={i} className="p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-brand-primary">{batch.name}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                    batch.status === 'Exitoso' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {batch.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex gap-4">
                    <span>Registros: {batch.records.toLocaleString()}</span>
                    {batch.errors > 0 && <span className="text-red-500 font-bold">Errores: {batch.errors}</span>}
                  </div>
                  <span>{batch.date}</span>
                </div>
                {batch.errors > 0 && (
                  <button className="mt-3 text-xs font-bold text-brand-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver Errores <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
