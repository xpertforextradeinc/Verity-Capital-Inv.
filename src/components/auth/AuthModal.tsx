import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  AlertCircle,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { User } from '../../types.ts';



interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  onSwitchDemo: (role: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onLogin,
  onRegister,
  onSwitchDemo,
  
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegisterStep(1);
    }
  }, [isOpen, initialMode]);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State (Multi-step Institutional Onboarding)
  const [registerStep, setRegisterStep] = useState(1);
  
  // Step 1: Personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [ssn, setSsn] = useState('');
  const [phone, setPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');

  // Step 2: Residential
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateProv, setStateProv] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');

  // Step 3: Employment
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [netWorth, setNetWorth] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');

  // Step 4: Regulatory
  const [usResident, setUsResident] = useState('');
  const [brokerAffiliate, setBrokerAffiliate] = useState('');
  const [isPep, setIsPep] = useState('');
  const [foreignTax, setForeignTax] = useState('');

  // Step 5: Security
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 6: Disclosures
  const [certify, setCertify] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [ackRisk, setAckRisk] = useState(false);
  const [authVerify, setAuthVerify] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerStep === 5 && regPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    setErrorMsg(null);
    setRegisterStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setRegisterStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!certify || !agreeTerms || !ackRisk || !authVerify) {
          throw new Error('Please accept all mandatory disclosures to proceed.');
        }
        // In a real app we'd pass all data, but here we fulfill the interface requirement
        await onRegister(firstName, lastName, regEmail, regPassword);
        onClose();
      } else {
        setInfoMsg('Institutional access requires full verification.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'CUSTOMER' | 'ADMIN') => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onSwitchDemo(role);
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to switch demo account');
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const renderRegisterStep = () => {
    switch (registerStep) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <UserIcon className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Step 1: Personal Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">First Name</label>
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Last Name</label>
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Date of Birth</label>
                <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">SSN / National ID</label>
                <input type="password" required value={ssn} onChange={e => setSsn(e.target.value)} placeholder="XXX-XX-XXXX" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Phone Number</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Email Address</label>
              <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="name@institutional.com" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center space-x-1.5 transition-all">
              <span>Next: Residential Address</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <MapPin className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Step 2: Residential Address</h4>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Street Address</label>
              <input type="text" required value={street} onChange={e => setStreet(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">City</label>
                <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">State / Province</label>
                <input type="text" required value={stateProv} onChange={e => setStateProv(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Postal Code</label>
                <input type="text" required value={zip} onChange={e => setZip(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Country</label>
                <select required value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 appearance-none">
                  <option value="">Select...</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="EU">European Union</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <button type="button" onClick={handlePrevStep} className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center space-x-1.5 transition-all">
                <span>Next: Employment & Income</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <Briefcase className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Step 3: Employment & Income</h4>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Employment Status</label>
              <select required value={employmentStatus} onChange={e => setEmploymentStatus(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option value="">Select...</option>
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Retired">Retired</option>
                <option value="Not Employed">Not Employed</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Annual Income Range (USD)</label>
              <select required value={incomeRange} onChange={e => setIncomeRange(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option value="">Select...</option>
                <option value="<100k">Under $100,000</option>
                <option value="100k-500k">$100,000 - $500,000</option>
                <option value="500k-1m">$500,000 - $1,000,000</option>
                <option value="1m+">Over $1,000,000</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Net Worth Range (USD)</label>
              <select required value={netWorth} onChange={e => setNetWorth(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option value="">Select...</option>
                <option value="<1m">Under $1,000,000</option>
                <option value="1m-5m">$1,000,000 - $5,000,000</option>
                <option value="5m-25m">$5,000,000 - $25,000,000</option>
                <option value="25m+">Over $25,000,000</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Source of Funds</label>
              <input type="text" required value={sourceOfFunds} onChange={e => setSourceOfFunds(e.target.value)} placeholder="e.g. Salary, Investments, Business Income" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="flex space-x-2">
              <button type="button" onClick={handlePrevStep} className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center space-x-1.5 transition-all">
                <span>Next: Regulatory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <Building2 className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Step 4: Regulatory Questions</h4>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Are you a U.S. citizen or resident?</label>
              <select required value={usResident} onChange={e => setUsResident(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Are you affiliated with a broker-dealer?</label>
              <select required value={brokerAffiliate} onChange={e => setBrokerAffiliate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Are you a politically exposed person (PEP)?</label>
              <select required value={isPep} onChange={e => setIsPep(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Are you subject to tax reporting outside your country of residence?</label>
              <select required value={foreignTax} onChange={e => setForeignTax(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button type="button" onClick={handlePrevStep} className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center space-x-1.5 transition-all">
                <span>Next: Account Security</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <Lock className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Step 5: Account Security</h4>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>Multi-Factor Authentication (2FA) will be configured during your first login via standard TOTP compliant authenticator apps.</p>
            </div>
            <div className="flex space-x-2">
              <button type="button" onClick={handlePrevStep} className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center space-x-1.5 transition-all">
                <span>Next: Disclosures</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <FileText className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Step 6: Mandatory Disclosures</h4>
            </div>
            <div className="space-y-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
              <label className="flex items-start space-x-2 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" required checked={certify} onChange={e => setCertify(e.target.checked)} className="peer sr-only" />
                  <div className="w-4 h-4 border border-zinc-600 rounded bg-zinc-900 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                  <CheckCircle2 className="w-3 h-3 text-zinc-900 absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[11px] text-zinc-300 group-hover:text-white transition-colors leading-snug">I certify under penalty of perjury that all provided information is accurate and up to date.</span>
              </label>
              
              <label className="flex items-start space-x-2 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" required checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="peer sr-only" />
                  <div className="w-4 h-4 border border-zinc-600 rounded bg-zinc-900 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                  <CheckCircle2 className="w-3 h-3 text-zinc-900 absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[11px] text-zinc-300 group-hover:text-white transition-colors leading-snug">I have read, understood, and agree to the Verity-Capital Inv Terms of Brokerage Service.</span>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" required checked={ackRisk} onChange={e => setAckRisk(e.target.checked)} className="peer sr-only" />
                  <div className="w-4 h-4 border border-zinc-600 rounded bg-zinc-900 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                  <CheckCircle2 className="w-3 h-3 text-zinc-900 absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[11px] text-zinc-300 group-hover:text-white transition-colors leading-snug">I acknowledge the Risk Disclosure Statement and understand Verity-Capital Inv does not provide financial advice.</span>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" required checked={authVerify} onChange={e => setAuthVerify(e.target.checked)} className="peer sr-only" />
                  <div className="w-4 h-4 border border-zinc-600 rounded bg-zinc-900 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                  <CheckCircle2 className="w-3 h-3 text-zinc-900 absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[11px] text-zinc-300 group-hover:text-white transition-colors leading-snug">I authorize Verity-Capital Inv to verify my identity through third-party KYC/AML providers.</span>
              </label>
            </div>
            
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <button type="button" onClick={handlePrevStep} className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50">
                <span>{isSubmitting ? 'Processing...' : 'Submit Institutional Application'}</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-[#0D121F] border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-zinc-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                {mode === 'login' ? 'Sign In to Verity-Capital Inv' : mode === 'register' ? 'Institutional Onboarding' : 'Account Recovery'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {mode === 'register' ? 'Regulatory Compliance & KYC Application' : 'Secure Institutional Sandbox'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="overflow-y-auto p-5 shrink-1">
          {mode === 'register' ? (
             <form onSubmit={handleNextStep} className="space-y-0">
               {/* Progress Bar */}
               <div className="mb-6">
                 <div className="flex justify-between mb-2">
                   {[1, 2, 3, 4, 5, 6].map((stepNum) => (
                     <div key={stepNum} className={`h-1.5 flex-1 mx-0.5 rounded-full ${registerStep >= stepNum ? 'bg-amber-500' : 'bg-zinc-800'}`} />
                   ))}
                 </div>
                 <div className="text-[10px] text-zinc-500 text-right uppercase tracking-wider font-mono">
                   Step {registerStep} of 6
                 </div>
               </div>
               {renderRegisterStep()}
             </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-zinc-400">Password</label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-[10px] text-amber-400 hover:underline cursor-pointer">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50" />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoMsg && (
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs">
                  {infoMsg}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50">
                <span>{mode === 'login' ? 'Sign In Securely' : 'Reset Password'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink mx-2 text-[10px] text-zinc-500 uppercase tracking-wider font-mono">or connect with</span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>

              <div className="flex justify-center">

              </div>
            </form>
          )}
          
          {/* Footer switch mode */}
          <div className="pt-4 text-center text-[11px] text-zinc-400 border-t border-zinc-800/50 mt-4">
            {mode === 'login' ? (
              <span>Institutional Onboarding? <button type="button" onClick={() => {setMode('register'); setRegisterStep(1);}} className="text-amber-400 font-semibold hover:underline cursor-pointer">Start Application</button></span>
            ) : (
              <span>Already an approved client? <button type="button" onClick={() => setMode('login')} className="text-amber-400 font-semibold hover:underline cursor-pointer">Sign In</button></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
