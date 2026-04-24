import React from 'react';
import { Lock, Mail, Shield, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock authentication for now
    setTimeout(() => {
      if (email === 'admin@fintra.co' && password === 'admin123') {
        onLogin({ name: 'Camilo Cantor', email: 'admin@fintra.co', role: 'Administrador' });
      } else {
        setError('Credenciales incorrectas. Intente con admin@fintra.co / admin123');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-black/5 p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-primary tracking-tight">BankVision</h1>
          <p className="text-gray-500 mt-2 font-medium">Sistema de Gestión de Cobranza</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Corporativo</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@fintra.co"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contraseña</label>
              <button type="button" className="text-[10px] font-bold text-brand-accent hover:underline uppercase tracking-wider">¿Olvidó su clave?</button>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary text-white rounded-2xl py-4 font-bold shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Ingresar al Sistema
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Acceso restringido a personal autorizado. <br />
            Protegido por políticas de seguridad BankVision.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
