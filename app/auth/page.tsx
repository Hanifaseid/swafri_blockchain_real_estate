'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  User,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  Building2,
  Coins,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

// Types derived from specifications
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PROPERTY_OWNER' | 'TENANT';
type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'REJECTED';
type KycStatus = 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
type WalletStatus = 'NOT_LINKED' | 'LINKED' | 'VERIFIED' | 'REVOKED';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Storing plain text for simpler prototype auth matching
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  kycStatus: KycStatus;
  walletStatus: WalletStatus;
  createdAt: string;
}

const SEED_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Serena Vance (Master)',
    email: 'superadmin@vex.estate',
    passwordHash: 'admin',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    walletStatus: 'VERIFIED',
    createdAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Darius Thorne (Operations)',
    email: 'admin@vex.estate',
    passwordHash: 'admin',
    role: 'ADMIN',
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    walletStatus: 'VERIFIED',
    createdAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'usr-3',
    name: 'Lord Sterling (Owner)',
    email: 'owner@vex.estate',
    passwordHash: 'owner',
    role: 'PROPERTY_OWNER',
    status: 'ACTIVE',
    kycStatus: 'PENDING',
    walletStatus: 'LINKED',
    createdAt: '2026-03-20T14:45:00Z',
    phone: '+41 79 123 4567',
  },
  {
    id: 'usr-4',
    name: 'Julian Carter (Tenant & Buyer)',
    email: 'tenant@vex.estate',
    passwordHash: 'tenant',
    role: 'TENANT',
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    walletStatus: 'VERIFIED',
    createdAt: '2026-04-01T11:15:00Z',
    phone: '+1 (555) 765-4321',
  },
];

export default function AuthPage() {
  const router = useRouter();

  // Active form states
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  const [registerRole, setRegisterRole] = useState<'TENANT' | 'PROPERTY_OWNER'>('TENANT');

  // Input fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status message states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize simulated Database in LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vex_users');
      if (!stored) {
        localStorage.setItem('vex_users', JSON.stringify(SEED_USERS));
      }
    }
  }, []);

  // Safe wrapper to retrieve user accounts database
  const getStoredUsers = (): UserAccount[] => {
    if (typeof window === 'undefined') return SEED_USERS;
    const data = localStorage.getItem('vex_users');
    return data ? JSON.parse(data) : SEED_USERS;
  };

  // Safe wrapper to set user accounts database
  const saveUsers = (users: UserAccount[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vex_users', JSON.stringify(users));
    }
  };

  // Handle Login process
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    setTimeout(() => {
      const users = getStoredUsers();
      const matched = users.find(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (!matched || matched.passwordHash !== password) {
        setErrorMessage('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Check account statuses
      if (matched.status === 'SUSPENDED') {
        setErrorMessage('Your account has been temporarily suspended. Please contact operations@vex.estate.');
        setLoading(false);
        return;
      }
      if (matched.status === 'BLOCKED') {
        setErrorMessage('Your account is blocked permanently due to policy violations.');
        setLoading(false);
        return;
      }
      if (matched.status === 'REJECTED') {
        setErrorMessage('Your account registration request has been rejected.');
        setLoading(false);
        return;
      }

      // Save user session client-side to be picked up by the Blue-White Portal page
      localStorage.setItem('vex_active_user', JSON.stringify(matched));

      // Append basic audit logs
      const logs = localStorage.getItem('vex_audit_logs');
      const currentLogs = logs ? JSON.parse(logs) : [];
      const newLog = {
        id: `log-${Date.now()}`,
        user: matched.name,
        email: matched.email,
        action: 'User Logged In',
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('vex_audit_logs', JSON.stringify([newLog, ...currentLogs]));

      setSuccessMessage(`Welcome back, ${matched.name}. Initializing secure ledger access...`);
      setLoading(false);

      setTimeout(() => {
        router.push('/portal');
      }, 1200);
    }, 1000);
  };

  // Handle Register process
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters for military-grade zk-proof configurations.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const users = getStoredUsers();
      const exists = users.some(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (exists) {
        setErrorMessage('An account with this email address already is registered.');
        setLoading(false);
        return;
      }

      // Deduce default status. New tenants are direct ACTIVE. New property owners are PENDING until verified.
      const defaultStatus: AccountStatus = registerRole === 'TENANT' ? 'ACTIVE' : 'PENDING';
      const defaultKyc: KycStatus = 'NOT_STARTED';
      const defaultWallet: WalletStatus = 'NOT_LINKED';

      const newUser: UserAccount = {
        id: `usr-${Math.floor(100000 + Math.random() * 900000)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: password,
        phone: phone.trim() || undefined,
        role: registerRole,
        status: defaultStatus,
        kycStatus: defaultKyc,
        walletStatus: defaultWallet,
        createdAt: new Date().toISOString(),
      };

      const updatedDatabase = [...users, newUser];
      saveUsers(updatedDatabase);

      // Append basic audit log entries
      const logs = localStorage.getItem('vex_audit_logs');
      const currentLogs = logs ? JSON.parse(logs) : [];
      const newLog = {
        id: `log-${Date.now()}`,
        user: newUser.name,
        email: newUser.email,
        action: `User registered as ${newUser.role}`,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('vex_audit_logs', JSON.stringify([newLog, ...currentLogs]));

      // Automatically sign in
      localStorage.setItem('vex_active_user', JSON.stringify(newUser));

      setSuccessMessage('Registration successful! Launching secure dashboard environment...');
      setLoading(false);

      setTimeout(() => {
        router.push('/portal');
      }, 1200);
    }, 1000);
  };

  // Pre-fill demo accounts helper
  const handleQuickFill = (roleKey: 'superadmin' | 'admin' | 'owner' | 'tenant') => {
    setActiveMode('login');
    const mapping = {
      superadmin: { email: 'superadmin@vex.estate', password: 'admin' },
      admin: { email: 'admin@vex.estate', password: 'admin' },
      owner: { email: 'owner@vex.estate', password: 'owner' },
      tenant: { email: 'tenant@vex.estate', password: 'tenant' },
    };
    setEmail(mapping[roleKey].email);
    setPassword(mapping[roleKey].password);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-black text-white relative font-sans flex flex-col justify-between selection:bg-white selection:text-black overflow-y-auto overflow-x-hidden">
      {/* Background Hero Section Architectural Dark Image */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none" 
        style={{ zIndex: 0 }}
      />
      
      {/* Absolute ambient backgrounds */}
      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none" style={{ zIndex: 0 }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full bg-emerald-900/10 blur-[130px] pointer-events-none" style={{ zIndex: 0 }} />


      {/* HEADER SECTION WITH BACK BUTTON */}
      <header className="px-6 md:px-16 pt-8 pb-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-lg border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Landing Page</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-extrabold text-sm shadow">
            V
          </div>
          <span className="text-lg font-semibold tracking-tight text-white select-none">
            VEX Real Estate Ledger
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl">
          {/* Section title */}
          <div className="text-center mb-10">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase bg-emerald-950/40 p-2 rounded border border-emerald-900/30">
              ZK-PROOF SECURE PORTAL GATEWAY
            </span>
            <h1 className="text-2xl md:text-3.5xl font-light text-white uppercase mt-4 tracking-tight">
              {activeMode === 'login' ? 'Access Sovereign Registry' : 'Forge Ledger Account'}
            </h1>
            <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto">
              Bypassing paper-trails. Instating trustless fractional security protocols with Solidity multi-sig standards.
            </p>
          </div>

          {/* Interactive glass card containing credentials */}
          <div className="bg-zinc-950/40 border border-white/15 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Corner decorator */}
            <div className="absolute top-0 right-0 bg-white/5 border-b border-l border-white/10 p-2 text-[9px] font-mono text-white/50">
              VEX-AUTH v2.1
            </div>

            {/* Toggle tabs for login / register */}
            <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10 mb-8 font-mono text-xs">
              <button
                onClick={() => {
                  setActiveMode('login');
                  setSuccessMessage('');
                  setErrorMessage('');
                }}
                className={`py-3 rounded-lg text-center transition-all cursor-pointer ${
                  activeMode === 'login'
                    ? 'bg-white text-black font-semibold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                LOGIN
              </button>
              <button
                onClick={() => {
                  setActiveMode('register');
                  setSuccessMessage('');
                  setErrorMessage('');
                }}
                className={`py-3 rounded-lg text-center transition-all cursor-pointer ${
                  activeMode === 'register'
                    ? 'bg-white text-black font-semibold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                 REGISTRATION
              </button>
            </div>

            {/* Dynamic visual alerts */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-rose-300 text-xs mb-6">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-300 text-xs mb-6">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {activeMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1.5 tracking-wider">
                    Ledger Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. tenant@vex.estate"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all placeholder:text-gray-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1.5 tracking-wider">
                    Sovereign Account Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all placeholder:text-gray-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Compiling Military TLS</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(`Sovereign password resets available post-MVP stage. Default test accounts: \n- superadmin@vex.estate (admin)\n- admin@vex.estate (admin)\n- owner@vex.estate (owner)\n- tenant@vex.estate (tenant)`)}
                    className="hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-neutral-100 text-black py-4 rounded-xl text-xs font-bold tracking-widest font-mono uppercase transition-all shadow-xl hover:shadow-white/5 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Coins className="w-4 h-4 animate-spin" />
                      <span>SIGNING MERKLE TRANSACTION...</span>
                    </>
                  ) : (
                    <span>LAUNCH PORTAL ENVIRONMENT</span>
                  )}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {activeMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Visual selector for role tabs */}
                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-2 tracking-wider">
                    Deconstruction Role Target
                  </label>
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={() => setRegisterRole('TENANT')}
                      className={`flex flex-col items-center p-3.5 rounded-xl border transition-all text-center cursor-pointer ${
                        registerRole === 'TENANT'
                          ? 'bg-white/10 border-white text-white'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <User className="w-5 h-5 mb-1 text-emerald-400" />
                      <span className="text-xs font-semibold font-mono">TENANT (BUYER)</span>
                      <span className="text-[9px] text-gray-500 font-normal mt-0.5">Explore / Fractional Buy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegisterRole('PROPERTY_OWNER')}
                      className={`flex flex-col items-center p-3.5 rounded-xl border transition-all text-center cursor-pointer ${
                        registerRole === 'PROPERTY_OWNER'
                          ? 'bg-white/10 border-white text-white'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-5 h-5 mb-1 text-emerald-400" />
                      <span className="text-xs font-semibold font-mono">PROPERTY OWNER</span>
                      <span className="text-[9px] text-gray-500 font-normal mt-0.5">List Deeds / Manage</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1.5 tracking-wider">
                    Individual Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Richard Feynman"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all placeholder:text-gray-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1.5 tracking-wider">
                    E-mail Account Link
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. Feynman@institute.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all placeholder:text-gray-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1.5 tracking-wider">
                    Contact Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all placeholder:text-gray-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1.5 tracking-wider">
                    Deploy Unique Password (Min 6 Characters)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all placeholder:text-gray-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {registerRole === 'PROPERTY_OWNER' && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-[11px] text-emerald-400 leading-normal font-mono flex items-start gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      Notice: Your verification state starts as <strong>PENDING</strong>. You may compile drafts, but admin oversight is required to finalize property verification records and NFT certificate logs.
                    </span>
                  </div>
                )}

                {/* Register Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-neutral-100 text-black py-4 rounded-xl text-xs font-bold tracking-widest font-mono uppercase transition-all shadow-xl hover:shadow-white/5 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Coins className="w-4 h-4 animate-spin" />
                      <span>MINING BLOCK RECORD...</span>
                    </>
                  ) : (
                    <span>COMPILE AND REGULATE ACCOUNT</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick seeded login selectors helper */}
          <div className="mt-8 bg-zinc-950/20 border border-white/10 p-5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-mono uppercase tracking-widest mb-3 justify-center">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Developer Evaluation Fast-Credentials</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <button
                onClick={() => handleQuickFill('tenant')}
                className="bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all rounded-lg p-2.5 font-mono cursor-pointer hover:bg-white/10"
              >
                <div className="text-[10px] text-emerald-400 font-semibold mb-0.5 font-mono">TENANT</div>
                <div className="text-[9px] text-white/40 truncate">tenant@vex.estate</div>
              </button>

              <button
                onClick={() => handleQuickFill('owner')}
                className="bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all rounded-lg p-2.5 font-mono cursor-pointer hover:bg-white/10"
              >
                <div className="text-[10px] text-purple-400 font-semibold mb-0.5 font-mono">OWNER</div>
                <div className="text-[9px] text-white/40 truncate">owner@vex.estate</div>
              </button>

              <button
                onClick={() => handleQuickFill('admin')}
                className="bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all rounded-lg p-2.5 font-mono cursor-pointer hover:bg-white/10"
              >
                <div className="text-[10px] text-blue-400 font-semibold mb-0.5 font-mono">ADMIN</div>
                <div className="text-[9px] text-white/40 truncate font-mono">admin@vex.estate</div>
              </button>

              <button
                onClick={() => handleQuickFill('superadmin')}
                className="bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all rounded-lg p-2.5 font-mono cursor-pointer hover:bg-white/10"
              >
                <div className="text-[10px] text-amber-500 font-semibold mb-0.5 font-mono">SUPERADMIN</div>
                <div className="text-[9px] text-white/40 truncate font-mono">superadmin@vex.estate</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER SECTION */}
      <footer className="py-6 border-t border-white/5 bg-black/20 text-center text-[10px] font-mono text-gray-500">
        <div>MILITARY ENCRYPTION TLS // SOLDIER MULTI-SIG COVENANTS // SOLIDITY ENGINE</div>
        <div className="mt-1">© 2026 VEX Real Estate Platforms Inc. Securely recorded on ERC-1155 block layers.</div>
      </footer>
    </div>
  );
}
