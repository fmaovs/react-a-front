import React from 'react';
import { Settings2, Filter, Plus, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function PoliciesModule() {
  const [activeTab, setActiveTab] = React.useState<'segments' | 'rules'>('segments');
  const [segments, setSegments] = React.useState([
    { name: 'Preventiva', criteria: 'Mora < 0 días', intensity: 'Baja', color: 'bg-emerald-500' },
    { name: 'Administrativa', criteria: 'Mora 1 - 30 días', intensity: 'Media', color: 'bg-blue-500' },
    { name: 'Temprana', criteria: 'Mora 31 - 60 días', intensity: 'Alta', color: 'bg-amber-500' },
    { name: 'Prejurídica', criteria: 'Mora > 90 días', intensity: 'Crítica', color: 'bg-red-500' },
  ]);
  const [rules, setRules] = React.useState([
    { rule: 'Ventana de Contacto L-V', value: '07:00 - 19:00', status: 'Activo', icon: Clock },
    { rule: 'Ventana de Contacto Sábados', value: '08:00 - 15:00', status: 'Activo', icon: Clock },
    { rule: 'Frecuencia Máxima Semanal', value: '2 contactos / canal', status: 'Activo', icon: AlertTriangle },
    { rule: 'Exclusión Festivos', value: 'Habilitado', status: 'Activo', icon: ShieldCheck },
  ]);
  const [showAddSegment, setShowAddSegment] = React.useState(false);
  const [showAddRule, setShowAddRule] = React.useState(false);
  const [newSegment, setNewSegment] = React.useState({ name: '', criteria: '', intensity: 'Baja', color: 'bg-brand-accent' });
  const [newRule, setNewRule] = React.useState({ rule: '', value: '', status: 'Activo' });

  const addSegment = () => {
    if (newSegment.name && newSegment.criteria) {
      setSegments([...segments, newSegment]);
      setNewSegment({ name: '', criteria: '', intensity: 'Baja', color: 'bg-brand-accent' });
      setShowAddSegment(false);
    }
  };

  const addRule = () => {
    if (newRule.rule && newRule.value) {
      setRules([...rules, { ...newRule, icon: ShieldCheck }]);
      setNewRule({ rule: '', value: '', status: 'Activo' });
      setShowAddRule(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-primary">M3. Políticas y Segmentación</h3>
          <p className="text-gray-500">Definición de reglas de negocio, ventanas de contacto y segmentación de cartera.</p>
        </div>
        <button 
          onClick={() => activeTab === 'segments' ? setShowAddSegment(true) : setShowAddRule(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-xl hover:bg-brand-secondary transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'segments' ? 'Nueva Política' : 'Nueva Regla'}
        </button>
      </div>

      {showAddSegment && activeTab === 'segments' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-brand-accent/20 shadow-xl space-y-6"
        >
          <div className="flex items-center gap-3 text-brand-primary mb-2">
            <div className="p-2 bg-brand-bg rounded-lg">
              <Plus className="w-5 h-5 text-brand-accent" />
            </div>
            <h4 className="text-lg font-bold">Configurar Nueva Política de Segmentación</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Nombre de la Política</label>
              <input 
                type="text" 
                value={newSegment.name}
                onChange={(e) => setNewSegment({...newSegment, name: e.target.value})}
                placeholder="Ej: Castigada" 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Criterio de Mora</label>
              <input 
                type="text" 
                value={newSegment.criteria}
                onChange={(e) => setNewSegment({...newSegment, criteria: e.target.value})}
                placeholder="Ej: Mora > 360 días" 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Intensidad de Contacto</label>
              <select 
                value={newSegment.intensity}
                onChange={(e) => setNewSegment({...newSegment, intensity: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all bg-white"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setShowAddSegment(false)}
              className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={addSegment}
              className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-all shadow-md"
            >
              Crear Política
            </button>
          </div>
        </motion.div>
      )}

      {showAddRule && activeTab === 'rules' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-brand-accent/20 shadow-xl space-y-6"
        >
          <div className="flex items-center gap-3 text-brand-primary mb-2">
            <div className="p-2 bg-brand-bg rounded-lg">
              <Plus className="w-5 h-5 text-brand-accent" />
            </div>
            <h4 className="text-lg font-bold">Configurar Nueva Regla de Negocio</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Nombre de la Regla</label>
              <input 
                type="text" 
                value={newRule.rule}
                onChange={(e) => setNewRule({...newRule, rule: e.target.value})}
                placeholder="Ej: Reintento por Ocupado" 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Valor / Parámetro</label>
              <input 
                type="text" 
                value={newRule.value}
                onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                placeholder="Ej: 30 minutos" 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setShowAddRule(false)}
              className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={addRule}
              className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-all shadow-md"
            >
              Crear Regla
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex gap-1 bg-white p-1 rounded-2xl border border-black/5 w-fit">
        <button 
          onClick={() => setActiveTab('segments')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'segments' ? "bg-brand-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          Segmentos
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'rules' ? "bg-brand-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          Reglas de Negocio
        </button>
      </div>

      {activeTab === 'segments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((seg, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 group hover:border-brand-accent transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", seg.color)}>
                  <Filter className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-400">ID: SEG-00{i+1}</span>
              </div>
              <h4 className="text-lg font-bold text-brand-primary mb-1">{seg.name}</h4>
              <p className="text-sm text-gray-500 mb-6">{seg.criteria}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Intensidad</span>
                  <span className="font-bold text-brand-primary">{seg.intensity}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full", seg.color)} style={{ width: seg.intensity === 'Crítica' ? '100%' : seg.intensity === 'Alta' ? '75%' : '40%' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h4 className="font-bold text-brand-primary">Reglas de Contacto (Ley 2300)</h4>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              CUMPLIMIENTO ACTIVO
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {rules.map((rule, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-brand-bg rounded-lg text-brand-accent">
                    <rule.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-primary">{rule.rule}</p>
                    <p className="text-xs text-gray-500">Última modificación: Hace 2 días</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-sm font-mono text-brand-secondary font-bold">{rule.value}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-emerald-600 uppercase">{rule.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
