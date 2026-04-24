import React from 'react';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  MessageCircle, 
  Send, 
  Users, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Plus, 
  Save,
  Copy,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function OrchestrationModule() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'templates'>('dashboard');

  const channels = [
    { name: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', active: true, sent: 4500, delivered: 4200 },
    { name: 'SMS', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50', active: true, sent: 8200, delivered: 7900 },
    { name: 'Voz / VoIP', icon: Phone, color: 'text-brand-accent', bg: 'bg-brand-bg', active: true, sent: 1200, delivered: 1150 },
    { name: 'Email', icon: Mail, color: 'text-violet-500', bg: 'bg-violet-50', active: true, sent: 15000, delivered: 14800 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-brand-primary">M4. Orquestación Omnicanal</h3>
          <p className="text-gray-500">Ejecución automatizada de campañas y gestión de canales digitales.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all shadow-lg">
            <Send className="w-5 h-5" />
            Lanzar Campaña
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "px-6 py-3 font-bold text-sm transition-all border-b-2",
            activeTab === 'dashboard' 
              ? "border-brand-accent text-brand-accent" 
              : "border-transparent text-gray-400 hover:text-brand-primary"
          )}
        >
          Dashboard de Ejecución
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={cn(
            "px-6 py-3 font-bold text-sm transition-all border-b-2",
            activeTab === 'templates' 
              ? "border-brand-accent text-brand-accent" 
              : "border-transparent text-gray-400 hover:text-brand-primary"
          )}
        >
          Gestión de Plantillas
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {channels.map((ch, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn("p-3 rounded-2xl", ch.bg, ch.color)}>
                      <ch.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Activo</span>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-brand-primary mb-4">{ch.name}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Entregados</span>
                      <span className="font-bold text-brand-primary">{Math.round((ch.delivered / ch.sent) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full", ch.color.replace('text', 'bg'))} style={{ width: `${(ch.delivered / ch.sent) * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center pt-2">
                      {ch.sent.toLocaleString()} enviados hoy
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-black/5">
                <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-accent" />
                  Campañas en Ejecución
                </h4>
                <div className="space-y-4">
                  {[
                    { name: 'Recordatorio Preventivo Q1', segment: 'Preventiva', progress: 85, status: 'En curso' },
                    { name: 'Recuperación Administrativa', segment: 'Administrativa', progress: 42, status: 'En curso' },
                    { name: 'Campaña Especial Semana Santa', segment: 'Todos', progress: 100, status: 'Completada' },
                  ].map((camp, i) => (
                    <div key={i} className="p-6 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="font-bold text-brand-primary">{camp.name}</h5>
                          <p className="text-xs text-gray-400">Segmento: {camp.segment}</p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-lg uppercase",
                          camp.status === 'Completada' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {camp.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-accent" style={{ width: `${camp.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-brand-primary">{camp.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
                <h4 className="text-lg font-bold text-brand-primary mb-6">Eventos en Tiempo Real</h4>
                <div className="space-y-6">
                  {[
                    { type: 'delivered', user: 'Juan Pérez', channel: 'WhatsApp', time: 'Hace 10s' },
                    { type: 'read', user: 'Maria Garcia', channel: 'Email', time: 'Hace 45s' },
                    { type: 'failed', user: 'Carlos Ruiz', channel: 'SMS', time: 'Hace 2m' },
                    { type: 'delivered', user: 'Ana Lopez', channel: 'WhatsApp', time: 'Hace 5m' },
                  ].map((ev, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 p-1 rounded-full",
                        ev.type === 'delivered' ? "bg-emerald-100 text-emerald-600" : ev.type === 'read' ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
                      )}>
                        {ev.type === 'failed' ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-brand-primary leading-none">{ev.user}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {ev.type === 'delivered' ? 'Entregado' : ev.type === 'read' ? 'Leído' : 'Fallido'} vía {ev.channel}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{ev.time}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-3 text-xs font-bold text-brand-accent border border-brand-accent/20 rounded-xl hover:bg-brand-accent/5 transition-all">
                  Ver Bitácora Completa
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="templates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TemplatesView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TemplatesView() {
  const [activeChannel, setActiveChannel] = React.useState('WhatsApp');
  const [isSaving, setIsSaving] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  const templates = {
    'WhatsApp': 'Hola {{NOMBRE_COMPLETO}}, te saludamos de BankVision. Te recordamos que tu obligación {{NUM_OBLIGACION}} presenta un valor a pagar de {{VALOR_A_PAGAR}} con fecha de vencimiento {{FECHA_VENC}}. Evita recargos adicionales pagando aquí: {{LINK_PAGO}}',
    'SMS': 'BankVision: {{NOMBRE_COMPLETO}}, tu pago de {{VALOR_A_PAGAR}} vence el {{FECHA_VENC}}. Paga facil aqui: {{LINK_PAGO}}',
    'Email': 'Estimado(a) {{NOMBRE_COMPLETO}},\n\nEsperamos que te encuentres bien. Te informamos que tu estado de cuenta presenta un saldo pendiente por valor de {{VALOR_A_PAGAR}}.\n\nDetalles:\nObligación: {{NUM_OBLIGACION}}\nFecha Vencimiento: {{FECHA_VENC}}\n\nPuedes realizar tu pago de forma segura en el siguiente enlace: {{LINK_PAGO}}\n\nSi ya realizaste el pago, por favor haz caso omiso a este mensaje.',
    'Voz / VoIP': 'Hola {{NOMBRE_COMPLETO}}, tienes un recordatorio de pago pendiente por valor de {{VALOR_A_PAGAR}}. Presiona 1 para recibir el link de pago en tu celular o 2 para hablar con un asesor.',
  };

  const [currentText, setCurrentText] = React.useState(templates['WhatsApp']);

  React.useEffect(() => {
    setCurrentText(templates[activeChannel as keyof typeof templates]);
  }, [activeChannel]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">Plantilla guardada correctamente</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div>
        <h3 className="text-2xl font-bold text-brand-primary">Parametrización de Plantillas</h3>
        <p className="text-gray-500">Configure los mensajes personalizados para cada canal de contacto.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {['WhatsApp', 'SMS', 'Email', 'Voz / VoIP'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                    activeChannel === ch 
                      ? "bg-brand-primary text-white shadow-md" 
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {ch}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-brand-primary uppercase tracking-wider">Cuerpo del Mensaje</label>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-brand-accent transition-colors" title="Copiar">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea 
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                className="w-full h-48 p-6 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 font-sans text-sm leading-relaxed"
                placeholder="Escribe el mensaje aquí..."
              />
              <div className="flex flex-wrap gap-2 pt-2">
                {['{{NOMBRE_COMPLETO}}', '{{VALOR_A_PAGAR}}', '{{NUM_OBLIGACION}}', '{{FECHA_VENC}}', '{{LINK_PAGO}}'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setCurrentText(prev => prev + ' ' + tag)}
                    className="px-3 py-1 bg-brand-bg text-brand-accent text-[10px] font-bold rounded-lg hover:bg-brand-accent hover:text-white transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all shadow-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
            <h4 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-accent" />
              Vista Previa
            </h4>
            <div className={cn(
              "p-6 rounded-2xl border border-gray-100 min-h-[200px] flex flex-col",
              activeChannel === 'WhatsApp' ? "bg-[#E5DDD5]" : "bg-gray-50"
            )}>
              {activeChannel === 'WhatsApp' && (
                <div className="bg-white p-4 rounded-xl shadow-sm self-start max-w-[90%] text-sm relative">
                  <div className="absolute -left-2 top-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-white"></div>
                  {currentText.replace('{{NOMBRE_COMPLETO}}', 'Juan Pérez').replace('{{VALOR_A_PAGAR}}', '$150,000').replace('{{FECHA_VENC}}', '25/03/2024').replace('{{LINK_PAGO}}', 'https://bv.co/p/123').replace('{{NUM_OBLIGACION}}', 'OB-1234')}
                  <p className="text-[10px] text-gray-400 text-right mt-2">10:45 AM</p>
                </div>
              )}
              {activeChannel === 'SMS' && (
                <div className="bg-gray-200 p-4 rounded-2xl self-start max-w-[90%] text-sm">
                  {currentText.replace('{{NOMBRE_COMPLETO}}', 'Juan Pérez').replace('{{VALOR_A_PAGAR}}', '$150,000').replace('{{FECHA_VENC}}', '25/03/2024').replace('{{LINK_PAGO}}', 'bv.co/p/123').replace('{{NUM_OBLIGACION}}', 'OB-1234')}
                </div>
              )}
              {activeChannel === 'Email' && (
                <div className="bg-white p-6 border border-gray-200 rounded-xl text-xs space-y-4">
                  <div className="border-b pb-2 text-gray-400">Asunto: Recordatorio de Pago - BankVision</div>
                  <div className="whitespace-pre-wrap">
                    {currentText.replace('{{NOMBRE_COMPLETO}}', 'Juan Pérez').replace('{{VALOR_A_PAGAR}}', '$150,000').replace('{{FECHA_VENC}}', '25/03/2024').replace('{{LINK_PAGO}}', 'https://bankvision.co/pagos/123').replace('{{NUM_OBLIGACION}}', 'OB-1234')}
                  </div>
                </div>
              )}
              {activeChannel === 'Voz / VoIP' && (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center animate-pulse">
                    <Phone className="w-8 h-8 text-brand-accent" />
                  </div>
                  <p className="text-xs text-gray-500 italic">"Transcripción de audio generada por IA"</p>
                  <p className="text-sm font-medium text-brand-primary">
                    {currentText.replace('{{NOMBRE_COMPLETO}}', 'Juan Pérez').replace('{{VALOR_A_PAGAR}}', 'ciento cincuenta mil pesos').replace('{{FECHA_VENC}}', 'veinticinco de marzo').replace('{{LINK_PAGO}}', '').replace('{{NUM_OBLIGACION}}', '')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-brand-bg p-6 rounded-3xl border border-brand-accent/10">
            <h5 className="text-xs font-bold text-brand-accent uppercase mb-3">Variables Disponibles</h5>
            <div className="space-y-2">
              {[
                { tag: '{{NOMBRE_COMPLETO}}', desc: 'Nombre del asociado' },
                { tag: '{{VALOR_A_PAGAR}}', desc: 'Monto total exigible' },
                { tag: '{{NUM_OBLIGACION}}', desc: 'ID de la deuda' },
                { tag: '{{FECHA_VENC}}', desc: 'Fecha límite de pago' },
                { tag: '{{LINK_PAGO}}', desc: 'URL personalizada' },
              ].map((v) => (
                <div key={v.tag} className="flex justify-between items-center text-[10px]">
                  <code className="text-brand-accent font-bold">{v.tag}</code>
                  <span className="text-gray-500">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
