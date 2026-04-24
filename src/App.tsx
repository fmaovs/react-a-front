import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  Settings2, 
  MessageSquare, 
  Briefcase, 
  ChevronRight,
  Bell,
  User,
  Search,
  Menu,
  X,
  DollarSign,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { useStore } from './context/StoreContext';

// Modules
import Login from './components/Login';
import IntegrationModule from './components/IntegrationModule';
import AnalyticsModule from './components/AnalyticsModule';
import PoliciesModule from './components/PoliciesModule';
import OrchestrationModule from './components/OrchestrationModule';
import CaseManagementModule from './components/CaseManagementModule';
import RecaudoModule from './components/RecaudoModule';
import ReportingModule from './components/ReportingModule';
import SettingsModule from './components/SettingsModule';

type ModuleId = 'dashboard' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7' | 'settings';

export default function App() {
  const [user, setUser] = React.useState<any>(null);
  const [activeModule, setActiveModule] = React.useState<ModuleId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const modules = [
    { id: 'dashboard', name: 'Dashboard General', icon: LayoutDashboard },
    { id: 'm1', name: 'M1. Integración', icon: Database },
    { id: 'm2', name: 'M2. Analítica', icon: BarChart3 },
    { id: 'm3', name: 'M3. Políticas', icon: Settings2 },
    { id: 'm4', name: 'M4. Orquestación', icon: MessageSquare },
    { id: 'm5', name: 'M5. Gestión de Casos', icon: Briefcase },
    { id: 'm6', name: 'M6. Recaudo', icon: DollarSign },
    { id: 'm7', name: 'M7. Reporting', icon: BarChart3 },
    { id: 'settings', name: 'Configuración', icon: Settings2 },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'm1': return <IntegrationModule />;
      case 'm2': return <AnalyticsModule />;
      case 'm3': return <PoliciesModule />;
      case 'm4': return <OrchestrationModule />;
      case 'm5': return <CaseManagementModule />;
      case 'm6': return <RecaudoModule />;
      case 'm7': return <ReportingModule />;
      case 'settings': return <SettingsModule />;
      default: return <DashboardOverview setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-brand-primary text-white flex flex-col shadow-xl z-20"
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-brand-accent flex items-center justify-center shrink-0">
            <span className="font-bold text-xl">BV</span>
          </div>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg tracking-tight truncate"
            >
              BankVision
            </motion.div>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id as ModuleId)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                activeModule === m.id 
                  ? "bg-brand-accent text-white shadow-lg" 
                  : "hover:bg-white/5 text-white/70 hover:text-white"
              )}
            >
              <m.icon className={cn("w-5 h-5 shrink-0", activeModule === m.id ? "text-white" : "group-hover:scale-110 transition-transform")} />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm"
                >
                  {m.name}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-brand-primary">
              {modules.find(m => m.id === activeModule)?.name}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar asociado..." 
                className="pl-10 pr-4 py-2 bg-brand-bg border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-brand-accent transition-all"
              />
            </div>
            <button className="relative p-2 text-gray-500 hover:text-brand-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-brand-primary leading-none">{user.name}</p>
                <p className="text-xs text-gray-500 mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-white font-bold">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <button 
                onClick={() => setUser(null)}
                className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Cerrar Sesión"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardOverview({ setActiveModule }: { setActiveModule: (id: ModuleId) => void }) {
  const { cases } = useStore();
  
  // Mock agents to match rebalanceCases logic
  const agents = ['Agente 01', 'Agente 02', 'Agente 03', 'Agente 04'];
  
  const agentLoad = agents.map(agent => ({
    name: agent,
    count: cases.filter(c => c.assignedTo === agent).length,
    percentage: (cases.filter(c => c.assignedTo === agent).length / Math.max(cases.length, 1)) * 100
  }));

  const stats = [
    { label: 'Cartera Total', value: '$1.2B', change: '+2.4%', icon: Database, color: 'text-blue-600' },
    { label: 'Tasa de Recuperación', value: '78.5%', change: '+5.2%', icon: BarChart3, color: 'text-emerald-600' },
    { label: 'Casos Activos', value: '1,240', change: '-12', icon: Briefcase, color: 'text-amber-600' },
    { label: 'Efectividad Contacto', value: '64.2%', change: '+1.8%', icon: MessageSquare, color: 'text-violet-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-xl bg-gray-50", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-full",
                stat.change.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-brand-primary mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-brand-primary">Carga de Trabajo por Agente</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Monitoreo en Vivo</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {agentLoad.map((agent, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-primary font-bold text-xs">
                      {agent.name.split(' ')[1]}
                    </div>
                    <span className="text-sm font-bold text-brand-secondary">{agent.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-brand-primary">{agent.count} casos</span>
                    <span className="text-[10px] text-gray-400 block">{agent.percentage.toFixed(1)}% de la carga total</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.percentage}%` }}
                    className="h-full bg-brand-accent"
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              El nivelador de cargas distribuye automáticamente los casos críticos y de alto monto.
            </p>
            <button 
              onClick={() => setActiveModule('settings')}
              className="text-xs font-bold text-brand-accent hover:underline"
            >
              Configurar Reglas
            </button>
          </div>
        </div>

        <div className="bg-brand-primary text-white p-8 rounded-3xl shadow-xl gradient-brand flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Cumplimiento Ley 2300</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Todas las estrategias de contacto están parametrizadas bajo la normativa de "Dejen de fregar", respetando horarios y canales autorizados.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Horarios Habilitados</span>
              <span className="font-bold">L-V 7am - 7pm</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-accent w-full"></div>
            </div>
            <p className="text-xs text-white/50 italic">
              * Auditoría inalterable activa para cada interacción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
