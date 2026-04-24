import React from 'react';
import { 
  Settings2, 
  ShieldAlert, 
  FileCode, 
  Clock, 
  Save, 
  Plus, 
  Trash2, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Users,
  Lock,
  Shield,
  Mail,
  UserPlus,
  Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';

type TabId = 'policies' | 'rules' | 'case-statuses' | 'file-structure' | 'users';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = React.useState<TabId>('policies');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-primary">Configuración de Parámetros</h3>
          <p className="text-gray-500">Administración de políticas, niveles de riesgo y especificaciones técnicas.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all disabled:opacity-50 shadow-lg"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="flex gap-1 bg-white p-1 rounded-2xl border border-black/5 w-fit">
        {[
          { id: 'policies', label: 'Políticas & Score', icon: ShieldAlert },
          { id: 'rules', label: 'Reglas de Negocio', icon: Clock },
          { id: 'case-statuses', label: 'Estados de Casos', icon: Briefcase },
          { id: 'file-structure', label: 'Estructura de Archivo', icon: FileCode },
          { id: 'users', label: 'Gestión de Usuarios', icon: Users },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-brand-primary text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
        {activeTab === 'policies' && <PoliciesConfig />}
        {activeTab === 'rules' && (
          <div className="divide-y divide-gray-100">
            <RulesConfig />
            <AssignmentRulesConfig />
          </div>
        )}
        {activeTab === 'case-statuses' && <CaseStatusesConfig />}
        {activeTab === 'file-structure' && <FileStructureConfig />}
        {activeTab === 'users' && <UsersConfig />}
      </div>
    </div>
  );
}

function PoliciesConfig() {
  const [riskLevels, setRiskLevels] = React.useState([
    { level: 'Bajo', score: '700 - 1000', mora: '0 - 5 días', color: 'bg-emerald-500', action: 'Recordatorio suave' },
    { level: 'Medio', score: '400 - 699', mora: '6 - 30 días', color: 'bg-blue-500', action: 'Llamada informativa' },
    { level: 'Alto', score: '200 - 399', mora: '31 - 90 días', color: 'bg-amber-500', action: 'Negociación directa' },
    { level: 'Crítico', score: '0 - 199', mora: '> 90 días', color: 'bg-red-500', action: 'Cobro prejurídico' },
  ]);
  const [showAddRisk, setShowAddRisk] = React.useState(false);
  const [newRisk, setNewRisk] = React.useState({ level: '', score: '', mora: '', color: 'bg-gray-500', action: '' });

  const addRiskLevel = () => {
    if (newRisk.level && newRisk.score) {
      setRiskLevels([...riskLevels, newRisk]);
      setNewRisk({ level: '', score: '', mora: '', color: 'bg-gray-500', action: '' });
      setShowAddRisk(false);
    }
  };

  const removeRiskLevel = (index: number) => {
    setRiskLevels(riskLevels.filter((_, i) => i !== index));
  };

  const [policies, setPolicies] = React.useState([
    { name: 'Preventiva', segment: 'Mora < 0', intensity: 'Baja' },
    { name: 'Administrativa', segment: 'Mora 1 - 30', intensity: 'Media' },
    { name: 'Temprana', segment: 'Mora 31 - 60', intensity: 'Alta' },
  ]);
  const [showAddPolicy, setShowAddPolicy] = React.useState(false);
  const [newPolicy, setNewPolicy] = React.useState({ name: '', segment: '', intensity: 'Baja' });

  const addPolicy = () => {
    if (newPolicy.name && newPolicy.segment) {
      setPolicies([...policies, newPolicy]);
      setNewPolicy({ name: '', segment: '', intensity: 'Baja' });
      setShowAddPolicy(false);
    }
  };

  const removePolicy = (index: number) => {
    setPolicies(policies.filter((_, i) => i !== index));
  };

  const [aiVariables, setAiVariables] = React.useState([
    { label: 'Historial de Pago', weight: 40 },
    { label: 'Días de Mora Actual', weight: 30 },
    { label: 'Frecuencia de Incumplimiento', weight: 20 },
    { label: 'Antigüedad del Asociado', weight: 10 },
  ]);
  const [aiModel, setAiModel] = React.useState('Predictivo Estándar');

  const updateAiWeight = (index: number, newWeight: number) => {
    const updated = [...aiVariables];
    updated[index].weight = newWeight;
    setAiVariables(updated);
  };

  const totalWeight = aiVariables.reduce((sum, v) => sum + v.weight, 0);

  const resetAiDefaults = () => {
    setAiVariables([
      { label: 'Historial de Pago', weight: 40 },
      { label: 'Días de Mora Actual', weight: 30 },
      { label: 'Frecuencia de Incumplimiento', weight: 20 },
      { label: 'Antigüedad del Asociado', weight: 10 },
    ]);
    setAiModel('Predictivo Estándar');
  };

  const [showAddAiVar, setShowAddAiVar] = React.useState(false);
  const [newAiVar, setNewAiVar] = React.useState({ label: '', weight: 0 });

  const addAiVariable = () => {
    if (newAiVar.label) {
      setAiVariables([...aiVariables, newAiVar]);
      setNewAiVar({ label: '', weight: 0 });
      setShowAddAiVar(false);
    }
  };

  const removeAiVariable = (index: number) => {
    setAiVariables(aiVariables.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-brand-primary">Políticas de Cobranza</h4>
            <p className="text-sm text-gray-500">Defina las políticas por segmento de cartera.</p>
          </div>
          <button 
            onClick={() => setShowAddPolicy(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-xl hover:bg-brand-secondary transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-bold">Nueva Política</span>
          </button>
        </div>

        {showAddPolicy && (
          <div className="mb-8 p-6 bg-brand-bg rounded-3xl border-2 border-dashed border-brand-accent/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({...newPolicy, name: e.target.value})}
                  placeholder="Ej: Prejurídica" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Segmento</label>
                <input 
                  type="text" 
                  value={newPolicy.segment}
                  onChange={(e) => setNewPolicy({...newPolicy, segment: e.target.value})}
                  placeholder="Ej: Mora > 90" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Intensidad</label>
                <select 
                  value={newPolicy.intensity}
                  onChange={(e) => setNewPolicy({...newPolicy, intensity: e.target.value})}
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddPolicy(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold">Cancelar</button>
              <button onClick={addPolicy} className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all text-sm font-bold">Agregar Política</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {policies.map((p, i) => (
            <div key={i} className="p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors group relative">
              <h5 className="font-bold text-brand-primary">{p.name}</h5>
              <p className="text-xs text-gray-500">{p.segment}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-accent uppercase">{p.intensity}</span>
                <button onClick={() => removePolicy(i)} className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gray-100"></div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-brand-primary">Definición de Niveles de Riesgo</h4>
            <p className="text-sm text-gray-500">Configure los rangos de score y días de mora para cada nivel.</p>
          </div>
          <button 
            onClick={() => setShowAddRisk(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-xl hover:bg-brand-secondary transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-bold">Nuevo Nivel</span>
          </button>
        </div>
        {showAddRisk && (
          <div className="mb-8 p-6 bg-brand-bg rounded-3xl border-2 border-dashed border-brand-accent/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nivel</label>
                <input 
                  type="text" 
                  value={newRisk.level}
                  onChange={(e) => setNewRisk({...newRisk, level: e.target.value})}
                  placeholder="Ej: Muy Alto" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rango Score</label>
                <input 
                  type="text" 
                  value={newRisk.score}
                  onChange={(e) => setNewRisk({...newRisk, score: e.target.value})}
                  placeholder="Ej: 0 - 100" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Días Mora</label>
                <input 
                  type="text" 
                  value={newRisk.mora}
                  onChange={(e) => setNewRisk({...newRisk, mora: e.target.value})}
                  placeholder="Ej: > 120 días" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Acción</label>
                <input 
                  type="text" 
                  value={newRisk.action}
                  onChange={(e) => setNewRisk({...newRisk, action: e.target.value})}
                  placeholder="Ej: Cobro Jurídico" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAddRisk(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold"
              >
                Cancelar
              </button>
              <button 
                onClick={addRiskLevel}
                className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all text-sm font-bold"
              >
                Agregar Nivel
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4">
          {riskLevels.map((item, i) => (
            <div key={i} className="flex items-center gap-6 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className={cn("w-3 h-12 rounded-full shrink-0", item.color)}></div>
              <div className="grid grid-cols-2 md:grid-cols-4 flex-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Nivel</label>
                  <p className="font-bold text-brand-primary">{item.level}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Rango Score</label>
                  <p className="font-mono text-sm text-gray-600">{item.score}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Días Mora</label>
                  <p className="font-mono text-sm text-gray-600">{item.mora}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Acción Sugerida</label>
                  <p className="text-sm text-gray-600">{item.action}</p>
                </div>
              </div>
              <button 
                onClick={() => removeRiskLevel(i)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gray-100"></div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-brand-primary">Parámetros de Scoring IA</h4>
            <p className="text-sm text-gray-500">Ajuste los pesos de las variables que alimentan el motor de decisión.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={resetAiDefaults}
              className="text-[10px] font-bold text-gray-400 hover:text-brand-accent uppercase tracking-wider transition-colors"
            >
              Restablecer
            </button>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              totalWeight === 100 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              Total: {totalWeight}% {totalWeight !== 100 && "(Debe ser 100%)"}
            </div>
            <select 
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-bold text-brand-primary px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="Predictivo Estándar">Predictivo Estándar</option>
              <option value="Agresivo (Recuperación)">Agresivo (Recuperación)</option>
              <option value="Conservador (Fidelización)">Conservador (Fidelización)</option>
              <option value="Custom">Personalizado</option>
            </select>
            <button 
              onClick={() => setShowAddAiVar(true)}
              className="p-1.5 bg-brand-accent text-white rounded-lg hover:bg-brand-secondary transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showAddAiVar && (
          <div className="mb-8 p-6 bg-brand-bg rounded-3xl border-2 border-dashed border-brand-accent/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre de la Variable</label>
                <input 
                  type="text" 
                  value={newAiVar.label}
                  onChange={(e) => setNewAiVar({...newAiVar, label: e.target.value})}
                  placeholder="Ej: Score Externo" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Peso Inicial (%)</label>
                <input 
                  type="number" 
                  value={newAiVar.weight}
                  onChange={(e) => setNewAiVar({...newAiVar, weight: parseInt(e.target.value) || 0})}
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddAiVar(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold">Cancelar</button>
              <button onClick={addAiVariable} className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all text-sm font-bold">Agregar Variable</button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <label className="block text-sm font-bold text-brand-primary">Pesos de Variables</label>
            {aiVariables.map((v, i) => (
              <div key={i} className="space-y-2 group relative">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-medium">{v.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-accent">{v.weight}%</span>
                    <button 
                      onClick={() => removeAiVariable(i)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0"
                  max="100"
                  value={v.weight}
                  onChange={(e) => updateAiWeight(i, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-brand-accent" 
                />
              </div>
            ))}
          </div>
          <div className="bg-brand-bg p-6 rounded-2xl border border-brand-accent/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-brand-accent mb-4">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Nota Técnica</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                El motor de IA recalibra estos pesos mensualmente basándose en la efectividad de las promesas de pago cumplidas. 
                Actualmente operando bajo el modelo <span className="font-bold text-brand-primary">{aiModel}</span>.
              </p>
            </div>
            <div className="mt-6 p-4 bg-white/50 rounded-xl border border-brand-accent/5">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Estado del Motor</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-600">Aprendizaje Activo</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RulesConfig() {
  const [rules, setRules] = React.useState([
    { rule: 'Ventana de Contacto L-V', value: '07:00 - 19:00', type: 'Horario' },
    { rule: 'Ventana de Contacto Sábados', value: '08:00 - 15:00', type: 'Horario' },
    { rule: 'Frecuencia Máxima Semanal', value: '2 contactos / canal', type: 'Frecuencia' },
  ]);
  const [showAddRule, setShowAddRule] = React.useState(false);
  const [newRule, setNewRule] = React.useState({ rule: '', value: '', type: 'General' });

  const addRule = () => {
    if (newRule.rule && newRule.value) {
      setRules([...rules, newRule]);
      setNewRule({ rule: '', value: '', type: 'General' });
      setShowAddRule(false);
    }
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-brand-primary">Reglas de Contacto (Ley 2300)</h4>
            <p className="text-sm text-gray-500">Parámetros obligatorios para el cumplimiento normativo en Colombia.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              VALIDADO
            </div>
            <button 
              onClick={() => setShowAddRule(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-xl hover:bg-brand-secondary transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-bold">Nueva Regla</span>
            </button>
          </div>
        </div>

        {showAddRule && (
          <div className="mb-8 p-6 bg-brand-bg rounded-3xl border-2 border-dashed border-brand-accent/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre de la Regla</label>
                <input 
                  type="text" 
                  value={newRule.rule}
                  onChange={(e) => setNewRule({...newRule, rule: e.target.value})}
                  placeholder="Ej: Exclusión Festivos" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Valor / Parámetro</label>
                <input 
                  type="text" 
                  value={newRule.value}
                  onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                  placeholder="Ej: Habilitado" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Categoría</label>
                <select 
                  value={newRule.type}
                  onChange={(e) => setNewRule({...newRule, type: e.target.value})}
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Horario">Horario</option>
                  <option value="Frecuencia">Frecuencia</option>
                  <option value="Exclusión">Exclusión</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAddRule(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold"
              >
                Cancelar
              </button>
              <button 
                onClick={addRule}
                className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all text-sm font-bold"
              >
                Agregar Regla
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-gray-100 space-y-6">
            <h5 className="font-bold text-brand-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-accent" />
              Ventanas Horarias
            </h5>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lunes a Viernes</span>
                <div className="flex gap-2">
                  <input type="time" defaultValue="07:00" className="bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs" />
                  <span className="text-gray-400">-</span>
                  <input type="time" defaultValue="19:00" className="bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sábados</span>
                <div className="flex gap-2">
                  <input type="time" defaultValue="08:00" className="bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs" />
                  <span className="text-gray-400">-</span>
                  <input type="time" defaultValue="15:00" className="bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Domingos y Festivos</span>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">PROHIBIDO</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-gray-100 space-y-6">
            <h5 className="font-bold text-brand-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brand-accent" />
              Reglas Activas
            </h5>
            <div className="space-y-3">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 group">
                  <div>
                    <p className="text-xs font-bold text-brand-primary">{rule.rule}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{rule.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-brand-accent">{rule.value}</span>
                    <button 
                      onClick={() => removeRule(i)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AssignmentRulesConfig() {
  const { assignmentRules, addAssignmentRule, deleteAssignmentRule, rebalanceCases } = useStore();
  const [showAdd, setShowAdd] = React.useState(false);
  const [newRule, setNewRule] = React.useState({ 
    name: '', 
    minAmount: 0, 
    riskLevels: [] as string[], 
    maxFailedAttempts: 0,
    priority: 1,
    isActive: true 
  });

  const handleAdd = () => {
    if (newRule.name) {
      addAssignmentRule({
        id: `R-${Math.random().toString(36).substr(2, 9)}`,
        ...newRule
      });
      setNewRule({ name: '', minAmount: 0, riskLevels: [], maxFailedAttempts: 0, priority: 1, isActive: true });
      setShowAdd(false);
    }
  };

  const riskOptions = ['Bajo', 'Medio', 'Alto', 'Crítico'];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-brand-primary">Reglas de Asignación Automática</h4>
          <p className="text-sm text-gray-500">Configure el desborde automático a agentes humanos con nivelador de cargas.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={rebalanceCases}
            className="flex items-center gap-2 px-4 py-2 bg-brand-bg text-brand-primary border border-brand-primary/20 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"
          >
            <Clock className="w-4 h-4" />
            Nivelar Cargas Ahora
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-xl hover:bg-brand-secondary transition-all shadow-md font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Regla
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="p-6 bg-brand-bg rounded-3xl border-2 border-dashed border-brand-accent/30 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre de la Regla</label>
              <input 
                type="text" 
                value={newRule.name}
                onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                placeholder="Ej: Casos de Alto Monto" 
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Monto Mínimo ($)</label>
              <input 
                type="number" 
                value={newRule.minAmount}
                onChange={(e) => setNewRule({...newRule, minAmount: parseInt(e.target.value) || 0})}
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Intentos Fallidos Máx.</label>
              <input 
                type="number" 
                value={newRule.maxFailedAttempts}
                onChange={(e) => setNewRule({...newRule, maxFailedAttempts: parseInt(e.target.value) || 0})}
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Niveles de Riesgo Aplicables</label>
            <div className="flex flex-wrap gap-3">
              {riskOptions.map(risk => (
                <label key={risk} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newRule.riskLevels.includes(risk)}
                    onChange={(e) => {
                      const levels = e.target.checked 
                        ? [...newRule.riskLevels, risk]
                        : newRule.riskLevels.filter(r => r !== risk);
                      setNewRule({...newRule, riskLevels: levels});
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="text-sm text-gray-600">{risk}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold">Cancelar</button>
            <button onClick={handleAdd} className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all text-sm font-bold">Guardar Regla</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignmentRules.map((rule) => (
          <div key={rule.id} className="p-6 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", rule.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                  <Users className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-brand-primary">{rule.name}</h5>
              </div>
              <button 
                onClick={() => deleteAssignmentRule(rule.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {rule.minAmount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Monto Mínimo:</span>
                  <span className="font-bold text-brand-secondary">${rule.minAmount.toLocaleString()}</span>
                </div>
              )}
              {rule.riskLevels && rule.riskLevels.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Riesgos:</span>
                  <div className="flex gap-1">
                    {rule.riskLevels.map(r => (
                      <span key={r} className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {rule.maxFailedAttempts > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Intentos Fallidos:</span>
                  <span className="font-bold text-brand-secondary">{rule.maxFailedAttempts}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                rule.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
              )}>
                {rule.isActive ? 'Activa' : 'Inactiva'}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Prioridad: {rule.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CaseStatusesConfig() {
  const { caseStatuses, cases, addCaseStatus, updateCaseStatus, deleteCaseStatus } = useStore();
  const [showAdd, setShowAdd] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newStatus, setNewStatus] = React.useState({ name: '', color: '#3b82f6', description: '', isInitial: false, isFinal: false });

  const handleAdd = () => {
    if (newStatus.name) {
      addCaseStatus({
        id: `ST-${Math.random().toString(36).substr(2, 9)}`,
        ...newStatus
      });
      setNewStatus({ name: '', color: '#3b82f6', description: '', isInitial: false, isFinal: false });
      setShowAdd(false);
      setError(null);
    }
  };

  const handleDelete = (id: string) => {
    const hasCases = cases.some(c => c.status === id);
    if (hasCases) {
      setError("No se puede eliminar un estado que tiene casos asignados (históricos o en proceso).");
      setTimeout(() => setError(null), 5000);
      return;
    }
    deleteCaseStatus(id);
    setError(null);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-brand-primary">Catálogo de Estados de Casos</h4>
          <p className="text-sm text-gray-500">Gestione los estados personalizados para el ciclo de vida de la cobranza.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-xl hover:bg-brand-secondary transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-bold">Nuevo Estado</span>
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </motion.div>
      )}

      {showAdd && (
        <div className="p-6 bg-brand-bg rounded-3xl border-2 border-dashed border-brand-accent/30 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre</label>
              <input 
                type="text" 
                value={newStatus.name}
                onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                placeholder="Ej: Ilocalizado" 
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                  className="h-10 w-10 rounded-lg border-none cursor-pointer" 
                />
                <input 
                  type="text" 
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                  className="flex-1 bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descripción</label>
              <input 
                type="text" 
                value={newStatus.description}
                onChange={(e) => setNewStatus({...newStatus, description: e.target.value})}
                placeholder="Breve descripción del estado" 
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={newStatus.isInitial}
                onChange={(e) => setNewStatus({...newStatus, isInitial: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-sm font-medium text-gray-600">Estado Inicial</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={newStatus.isFinal}
                onChange={(e) => setNewStatus({...newStatus, isFinal: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-sm font-medium text-gray-600">Estado Final</span>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold">Cancelar</button>
            <button onClick={handleAdd} className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all text-sm font-bold">Guardar Estado</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {caseStatuses.map((status) => {
          const hasCases = cases.some(c => c.status === status.id);
          return (
            <div key={status.id} className="p-6 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }}></div>
                  <h5 className="font-bold text-brand-primary">{status.name}</h5>
                </div>
                <button 
                  onClick={() => handleDelete(status.id)}
                  className={cn(
                    "p-1.5 transition-colors opacity-0 group-hover:opacity-100",
                    hasCases ? "text-gray-200 cursor-not-allowed" : "text-gray-300 hover:text-red-500"
                  )}
                  title={hasCases ? "No se puede eliminar: tiene casos asociados" : "Eliminar estado"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4 h-8 line-clamp-2">{status.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {status.isInitial && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full uppercase tracking-wider">Inicial</span>
                  )}
                  {status.isFinal && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">Final</span>
                  )}
                </div>
                {hasCases && (
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    En uso
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FileStructureConfig() {
  const [fields, setFields] = React.useState([
    { pos: '001-020', name: 'DOC_CLIENTE', type: 'Alfanumérico', req: 'Sí', desc: 'Identificador primario (Tipo + Número)' },
    { pos: '021-080', name: 'NOMBRE_COMPLETO', type: 'Alfanumérico', req: 'Sí', desc: 'Nombre para personalización' },
    { pos: '081-090', name: 'CELULAR', type: 'Numérico', req: 'Cond', desc: 'Obligatorio para SMS/WhatsApp' },
    { pos: '091-140', name: 'EMAIL', type: 'Alfanumérico', req: 'Cond', desc: 'Obligatorio para estrategias de correo' },
    { pos: '141-160', name: 'NUM_OBLIGACION', type: 'Alfanumérico', req: 'Sí', desc: 'Clave de la deuda' },
    { pos: '161-180', name: 'SALDO_TOTAL', type: 'Decimal', req: 'Sí', desc: 'Monto total adeudado' },
    { pos: '181-183', name: 'DIAS_MORA', type: 'Numérico', req: 'Sí', desc: 'Eje principal de segmentación' },
    { pos: '184-191', name: 'FECHA_VENC', type: 'Fecha (AAAAMMDD)', req: 'Sí', desc: 'Fecha de la próxima cuota' },
    { pos: '192-211', name: 'PAGO_MINIMO', type: 'Decimal', req: 'Sí', desc: 'Monto mínimo para evitar mora' },
    { pos: '212-231', name: 'COMISIONES', type: 'Decimal', req: 'No', desc: 'Cargos adicionales por producto' },
    { pos: '232-251', name: 'CARGOS_COBRANZA', type: 'Decimal', req: 'No', desc: 'Gastos de gestión administrativa' },
    { pos: '252-271', name: 'VALOR_A_PAGAR', type: 'Decimal', req: 'Sí', desc: 'Total exigible (Min + Com + Cargos)' },
  ]);
  const [showAddField, setShowAddField] = React.useState(false);
  const [newField, setNewField] = React.useState({ pos: '', name: '', type: 'Alfanumérico', req: 'Sí', desc: '' });

  const addField = () => {
    if (newField.name && newField.pos) {
      setFields([...fields, newField]);
      setNewField({ pos: '', name: '', type: 'Alfanumérico', req: 'Sí', desc: '' });
      setShowAddField(false);
    }
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-brand-primary">Especificación de Archivo Batch (Layout v1.0)</h4>
          <p className="text-sm text-gray-500">Definición técnica para la ingesta de datos por archivo plano de ancho fijo.</p>
        </div>
        <button 
          onClick={() => setShowAddField(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-xl hover:bg-brand-secondary transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-bold">Nuevo Campo</span>
        </button>
      </div>

      {showAddField && (
        <div className="p-6 bg-brand-bg rounded-3xl border-2 border-dashed border-brand-accent/30 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Posición</label>
              <input 
                type="text" 
                value={newField.pos}
                onChange={(e) => setNewField({...newField, pos: e.target.value})}
                placeholder="Ej: 272-290" 
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre Campo</label>
              <input 
                type="text" 
                value={newField.name}
                onChange={(e) => setNewField({...newField, name: e.target.value})}
                placeholder="Ej: CIUDAD" 
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tipo</label>
              <select 
                value={newField.type}
                onChange={(e) => setNewField({...newField, type: e.target.value})}
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm"
              >
                <option value="Alfanumérico">Alfanumérico</option>
                <option value="Numérico">Numérico</option>
                <option value="Decimal">Decimal</option>
                <option value="Fecha">Fecha</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Requerido</label>
              <select 
                value={newField.req}
                onChange={(e) => setNewField({...newField, req: e.target.value})}
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm"
              >
                <option value="Sí">Sí</option>
                <option value="No">No</option>
                <option value="Cond">Cond</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descripción</label>
              <input 
                type="text" 
                value={newField.desc}
                onChange={(e) => setNewField({...newField, desc: e.target.value})}
                placeholder="Ej: Ciudad de residencia" 
                className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAddField(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold">Cancelar</button>
            <button onClick={addField} className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all text-sm font-bold">Agregar Campo</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Encabezado</p>
          <p className="text-xs font-mono text-brand-primary">H|FECHA|LOTE|TOTAL_REG</p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Detalle</p>
          <p className="text-xs font-mono text-brand-primary">D|CAMPOS_DEFINIDOS_ABAJO...</p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tráiler</p>
          <p className="text-xs font-mono text-brand-primary">T|TOTAL_SALDO|HASH_CONTROL</p>
        </div>
      </div>

      <div className="overflow-hidden border border-gray-100 rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold text-brand-primary">Posición</th>
              <th className="px-6 py-4 font-bold text-brand-primary">Campo</th>
              <th className="px-6 py-4 font-bold text-brand-primary">Tipo</th>
              <th className="px-6 py-4 font-bold text-brand-primary text-center">Requerido</th>
              <th className="px-6 py-4 font-bold text-brand-primary">Descripción</th>
              <th className="px-6 py-4 font-bold text-brand-primary text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {fields.map((f, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{f.pos}</td>
                <td className="px-6 py-4 font-bold text-brand-secondary">{f.name}</td>
                <td className="px-6 py-4 text-xs text-gray-600">{f.type}</td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                    f.req === 'Sí' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {f.req}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">{f.desc}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => removeField(i)}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersConfig() {
  const [users, setUsers] = React.useState([
    { id: '1', name: 'Admin Principal', email: 'admin@fintra.co', role: 'Administrador', status: 'Activo', lastLogin: '2024-03-15 10:30' },
    { id: '2', name: 'Coordinador Cobranza', email: 'coord@fintra.co', role: 'Supervisor', status: 'Activo', lastLogin: '2024-03-15 09:15' },
    { id: '3', name: 'Agente Externo 01', email: 'agente01@externo.com', role: 'Agente', status: 'Bloqueado', lastLogin: '2024-03-10 16:45' },
  ]);

  const [showAddUser, setShowAddUser] = React.useState(false);
  const [newUser, setNewUser] = React.useState({ name: '', email: '', role: 'Agente', tempPass: '' });
  
  const [securityPolicy, setSecurityPolicy] = React.useState({
    minPasswordLength: 12,
    requireSpecialChars: true,
    passwordExpirationDays: 90,
    maxFailedAttempts: 3
  });

  const addUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, {
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'Activo',
        lastLogin: 'Nunca'
      }]);
      setNewUser({ name: '', email: '', role: 'Agente', tempPass: '' });
      setShowAddUser(false);
    }
  };

  const removeUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Activo' ? 'Bloqueado' : 'Activo' };
      }
      return u;
    }));
  };

  return (
    <div className="p-8 space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-brand-primary">Gestión de Usuarios</h4>
            <p className="text-sm text-gray-500">Administre los accesos y roles del personal de cobranza.</p>
          </div>
          <button 
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-xl hover:bg-brand-secondary transition-all shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-bold">Nuevo Usuario</span>
          </button>
        </div>

        {showAddUser && (
          <div className="mb-8 p-6 bg-brand-bg rounded-3xl border-2 border-dashed border-brand-accent/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Ej: Juan Pérez" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Corporativo</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="usuario@fintra.co" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rol</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Agente">Agente</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contraseña Temporal</label>
                <input 
                  type="password" 
                  value={newUser.tempPass}
                  onChange={(e) => setNewUser({...newUser, tempPass: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full bg-white px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:outline-none text-sm" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddUser(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold">Cancelar</button>
              <button onClick={addUser} className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all text-sm font-bold">Crear Usuario</button>
            </div>
          </div>
        )}

        <div className="overflow-hidden border border-gray-100 rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-brand-primary">Usuario</th>
                <th className="px-6 py-4 font-bold text-brand-primary">Rol</th>
                <th className="px-6 py-4 font-bold text-brand-primary">Estado</th>
                <th className="px-6 py-4 font-bold text-brand-primary">Último Acceso</th>
                <th className="px-6 py-4 font-bold text-brand-primary text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-primary font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-brand-secondary">{user.name}</p>
                        <p className="text-[10px] text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-600">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                      user.status === 'Activo' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className={cn(
                          "p-1.5 rounded-lg transition-all",
                          user.status === 'Activo' ? "text-gray-400 hover:text-amber-500 hover:bg-amber-50" : "text-amber-500 bg-amber-50 hover:bg-amber-100"
                        )}
                        title={user.status === 'Activo' ? "Bloquear" : "Desbloquear"}
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeUser(user.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="h-px bg-gray-100"></div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-bold text-brand-primary flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-accent" />
              Política de Seguridad
            </h4>
            <p className="text-sm text-gray-500">Configure los requisitos de complejidad y seguridad de contraseñas.</p>
          </div>
          
          <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Longitud mínima de contraseña</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={securityPolicy.minPasswordLength}
                  onChange={(e) => setSecurityPolicy({...securityPolicy, minPasswordLength: parseInt(e.target.value)})}
                  className="w-16 bg-white px-2 py-1 rounded border border-gray-200 text-xs font-bold text-center"
                />
                <span className="text-xs text-gray-400">caracteres</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Exigir caracteres especiales</span>
              <button 
                onClick={() => setSecurityPolicy({...securityPolicy, requireSpecialChars: !securityPolicy.requireSpecialChars})}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  securityPolicy.requireSpecialChars ? "bg-brand-accent" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  securityPolicy.requireSpecialChars ? "left-6" : "left-1"
                )}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expiración de contraseña</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={securityPolicy.passwordExpirationDays}
                  onChange={(e) => setSecurityPolicy({...securityPolicy, passwordExpirationDays: parseInt(e.target.value)})}
                  className="w-16 bg-white px-2 py-1 rounded border border-gray-200 text-xs font-bold text-center"
                />
                <span className="text-xs text-gray-400">días</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Intentos fallidos permitidos</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={securityPolicy.maxFailedAttempts}
                  onChange={(e) => setSecurityPolicy({...securityPolicy, maxFailedAttempts: parseInt(e.target.value)})}
                  className="w-16 bg-white px-2 py-1 rounded border border-gray-200 text-xs font-bold text-center"
                />
                <span className="text-xs text-gray-400">intentos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-bg p-8 rounded-3xl border border-brand-accent/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-accent mb-4">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Cumplimiento de Seguridad</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Todas las acciones de gestión de usuarios son registradas en el log de auditoría. 
              El bloqueo automático se activa tras superar los intentos fallidos configurados.
            </p>
            <button className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
              Ver Log de Auditoría Completo
              <Plus className="w-3 h-3 rotate-45" />
            </button>
          </div>
          <div className="mt-8 p-4 bg-white/50 rounded-xl border border-brand-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-primary">Estado de Seguridad</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase">Sistema Protegido</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
