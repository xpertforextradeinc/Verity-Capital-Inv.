const fs = require('fs');
const file = 'src/components/public/InstitutionalAccess.tsx';

const code = `import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, LockKeyhole, Mail, UserRound, Shield, Globe, Calendar, CreditCard, ChevronRight } from 'lucide-react';

interface InstitutionalAccessProps {
  mode: 'login' | 'onboarding';
  onBack: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
}

export const InstitutionalAccess: React.FC<InstitutionalAccessProps> = ({ mode, onBack, onLogin, onRegister, onGoogleSignIn }) => {
  const isLogin = mode === 'login';

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Registration specific state
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('');
  const [dob, setDob] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  const handleGoogle = async () => {
    setError(null);
    setGoogleBusy(true);
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please check your configuration.');
      setGoogleBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    
    // Multi-step progression logic for registration
    if (!isLogin && step < 3) {
      if (step === 1) {
        if (!firstName || !lastName || !email) {
          setError('Please complete all identity fields.');
          return;
        }
      }
      if (step === 2) {
        if (!country || !dob || !sourceOfFunds) {
          setError('Please complete all regulatory fields to proceed.');
          return;
        }
      }
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        if (!firstName || !lastName) throw new Error('Please provide your full name.');
        if (!acceptedTerms) throw new Error('You must accept the institutional terms of service.');
        await onRegister(firstName, lastName, email, password);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('405')) {
        setError('Server unavailable (405). If deployed on Vercel, please ensure Supabase environment variables are configured.');
      } else {
        setError(err.message || 'Unable to complete this request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderSteps = () => {
    if (isLogin) return null;
    return (
      <div className="flex items-center space-x-2 mb-10">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={\`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold \${step === s ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : step > s ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500'}\`}>
              {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
            </div>
            {s < 3 && (
              <div className={\`h-px w-8 \${step > s ? 'bg-emerald-500/50' : 'bg-zinc-800'}\`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full min-h-[85vh] flex flex-col lg:flex-row bg-[#050912] rounded-[2rem] overflow-hidden border border-zinc-800/80 shadow-2xl animate-in fade-in zoom-in-95 duration-500 my-8">
      
      {/* Left Panel: Branding & Trust */}
      <div className="lg:w-[45%] bg-zinc-900/30 p-10 lg:p-16 flex flex-col justify-between border-r border-zinc-800/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[20%] w-[100%] h-[100%] rounded-full bg-cyan-500/5 blur-[120px]" />
          <div className="absolute -bottom-[30%] -right-[20%] w-[100%] h-[100%] rounded-full bg-indigo-500/5 blur-[120px]" />
        </div>

        <div className="relative z-10">
          <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-16">
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Terminal
          </button>

          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full mb-8">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              {isLogin ? 'Institutional Access' : 'Client Application'}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
            {isLogin ? 'Welcome back to your portal.' : 'Establish your institutional presence.'}
          </h1>
          
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            {isLogin 
              ? 'Access your unified dashboard, execute live market orders, and review custody workflows in a secure environment.' 
              : 'Verity-Capital Inv provides qualified investors with premium digital asset execution, deep liquidity, and secure cold storage. Please complete the initial regulatory profile to begin.'}
          </p>
        </div>

        <div className="relative z-10 mt-16 space-y-8 hidden sm:block">
          <div className="flex items-start gap-5 group">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-colors">
              <LockKeyhole className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Bank-Grade Security</h3>
              <p className="text-[13px] text-zinc-500 mt-1.5 leading-relaxed">Cryptographically secured sessions and multi-factor authentication protocols.</p>
            </div>
          </div>
          <div className="flex items-start gap-5 group">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Regulatory Compliance</h3>
              <p className="text-[13px] text-zinc-500 mt-1.5 leading-relaxed">Full KYC/AML screening and strict jurisdictional adherence.</p>
            </div>
          </div>
          <div className="flex items-start gap-5 group">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors">
              <Building2 className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Global Liquidity</h3>
              <p className="text-[13px] text-zinc-500 mt-1.5 leading-relaxed">Direct market access to deep liquidity pools and structured vaults.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="lg:w-[55%] p-10 lg:p-20 flex flex-col justify-center bg-[#070A10]">
        <div className="max-w-[420px] w-full mx-auto">
          {renderSteps()}

          {/* Form Header */}
          {!isLogin && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {step === 1 && "Identity Profile"}
                {step === 2 && "Regulatory Details"}
                {step === 3 && "Security & Credentials"}
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                {step === 1 && "Enter your full legal name as it appears on government-issued ID."}
                {step === 2 && "Required for anti-money laundering (AML) and compliance screening."}
                {step === 3 && "Establish secure credentials for your institutional account."}
              </p>
            </div>
          )}
          {isLogin && (
             <div className="mb-10">
               <h2 className="text-3xl font-bold text-white tracking-tight">Secure Sign In</h2>
               <p className="text-sm text-zinc-400 mt-2">Enter your credentials to access your terminal.</p>
             </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            
            {/* Step 1: Identity / Login Fields */}
            {(isLogin || step === 1) && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                {!isLogin && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Legal First Name</label>
                      <div className="relative">
                        <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-11 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-800/60 transition-all placeholder:text-zinc-600" placeholder="First name" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Legal Last Name</label>
                      <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-800/60 transition-all placeholder:text-zinc-600" placeholder="Last name" />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="mb-2 block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Institutional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-11 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-800/60 transition-all placeholder:text-zinc-600" placeholder="contact@fund.com" />
                  </div>
                </div>

                {isLogin && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                      <button type="button" className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors">Forgot?</button>
                    </div>
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-800/60 transition-all placeholder:text-zinc-600" placeholder="••••••••" />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Regulatory Profile */}
            {!isLogin && step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="mb-2 block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Country of Residence</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <select required value={country} onChange={(e) => setCountry(e.target.value)} className="w-full appearance-none rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-11 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-800/60 transition-all">
                      <option value="" disabled>Select Country</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CH">Switzerland</option>
                      <option value="SG">Singapore</option>
                      <option value="AE">United Arab Emirates</option>
                      <option value="OTHER">Other Region</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input required type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-11 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-800/60 transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:invert" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Primary Source of Funds</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <select required value={sourceOfFunds} onChange={(e) => setSourceOfFunds(e.target.value)} className="w-full appearance-none rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-11 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-800/60 transition-all">
                      <option value="" disabled>Select Source</option>
                      <option value="employment">Employment Income</option>
                      <option value="investments">Investment Returns</option>
                      <option value="business">Business Revenue</option>
                      <option value="inheritance">Inheritance / Trust</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Security */}
            {!isLogin && step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="mb-2 block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Create Master Password</label>
                  <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-zinc-800/60 transition-all placeholder:text-zinc-600" placeholder="Minimum 8 characters" />
                </div>
                <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-start space-x-4">
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-900" 
                    />
                  </div>
                  <div>
                    <label htmlFor="terms" className="text-sm font-medium text-zinc-300 cursor-pointer">
                      I accept the Institutional Client Agreement
                    </label>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      By checking this box, you confirm that you have read and agree to our Master Services Agreement, Risk Disclosures, and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-300 flex items-start space-x-3">
                <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-4 flex gap-4">
              {!isLogin && step > 1 && (
                <button 
                  type="button" 
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
                >
                  Back
                </button>
              )}
              <button 
                type="submit"
                disabled={submitting || googleBusy} 
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-zinc-950 px-4 py-4 text-sm font-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Processing...' : (
                  isLogin ? 'Sign In Securely' : (step < 3 ? 'Continue to Next Step' : 'Establish Account')
                )} 
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-700">
              <span className="h-px flex-1 bg-zinc-800/80" />
              or authenticate via provider
              <span className="h-px flex-1 bg-zinc-800/80" />
            </div>
            
            <button type="button" disabled={submitting || googleBusy} onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 px-4 py-4 text-sm font-bold text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all disabled:opacity-50 group">
              <svg className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all duration-300" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {googleBusy ? 'Negotiating TLS Handshake...' : 'Continue with Workspace OAuth'}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync(file, code);
