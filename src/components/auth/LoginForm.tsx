"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("El correo electrónico no es válido");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Introduce tu contraseña");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener mínimo 6 caracteres");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('El correo electrónico no es válido');
      return;
    }
    // Validar contraseña
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    setStatus("loading");
    setErrorMessage("");
    setEmailError("");
    setPasswordError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage('Credenciales incorrectas. Inténtalo de nuevo.');
      setStatus("error");
      setLoading(false);
      return;
    }

    setStatus("success");
    router.replace('/dashboard');
  };

  return (
    <div className={`w-full bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[28px] p-7 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-500 ${status === 'loading' ? 'pointer-events-none opacity-80' : ''}`}>
      <div className="flex flex-col items-center mb-10">
        <div className="relative group mb-5">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <img
            src="/icon.svg"
            alt="SF Gestor Empresarial"
            width="56"
            height="56"
            className="relative bg-white p-2 rounded-2xl shadow-sm border border-slate-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic leading-none">SF</h1>
          <span className="text-[14px] font-medium text-slate-400 mt-1">Gestor Empresarial</span>
        </div>
        <div className="w-12 h-[4px] bg-blue-600 mt-3 rounded-full shadow-sm"></div>
        <p className="text-slate-500 text-[10px] mt-4 uppercase tracking-[0.2em] font-bold">Acceso Administrativo</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1 opacity-70">Correo electrónico</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="email"
              placeholder="hola@soportefacil.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={`w-full bg-white/60 border ${emailError || status === 'error' ? 'border-red-500/50' : 'border-slate-200/60'} focus:border-blue-500 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm`}
            />
          </div>
          {(emailError || (status === 'error' && !passwordError)) && (
            <div className="flex items-center gap-1.5 text-red-600 text-[10px] mt-2 animate-fadeIn px-1 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{emailError || errorMessage}</span>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1 opacity-70">Contraseña</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={`w-full bg-white/60 border ${passwordError || status === 'error' ? 'border-red-500/50' : 'border-slate-200/60'} focus:border-blue-500 focus:bg-white rounded-2xl py-3.5 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordError && (
            <div className="flex items-center gap-1.5 text-red-600 text-[10px] mt-2 animate-fadeIn px-1 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{passwordError}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-bold group-hover:text-slate-700 transition-colors">Recordar</span>
          </label>
          <Link href="/recover" className="text-[11px] text-slate-500 hover:text-blue-600 font-bold transition-all hover:translate-x-0.5">
            ¿Olvidaste tu clave?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || status === 'success'}
            className={`w-full h-[52px] rounded-2xl font-bold text-[11px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.97] ${status === 'success'
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 hover:shadow-blue-500/40'
              } disabled:opacity-50`}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validando...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Acceso Concedido
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center mt-10">
        <p className="text-[9px] text-slate-400 uppercase tracking-[0.25em] font-black opacity-60">
          SSL ENCRYPTED · SF © 2026
        </p>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
