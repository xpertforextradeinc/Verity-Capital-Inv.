import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle2,
  DollarSign,
  Scale,
  KeyRound,
  Eye,
  EyeOff,
  Flag,
  HelpCircle,
  FileCheck2,
  Landmark,
  BadgeCheck
} from 'lucide-react';
import { User } from '../../types.ts';
import { signInWithGoogleSupabase } from '../../services/supabase.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  onGoogleSignIn?: (email: string, displayName?: string) => Promise<void>;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onLogin,
  onRegister,
  onGoogleSignIn,
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
  
  // Register State (7-Step Comprehensive USA Brokerage Onboarding)
  const [registerStep, setRegisterStep] = useState(1);
  
  // Step 1: Account Classification & Tier
  const [accountType, setAccountType] = useState('INDIVIDUAL');
  const [investorTier, setInvestorTier] = useState('ACCREDITED');
  const [entityName, setEntityName] = useState('');
  
  // Step 2: Personal Identification & PATRIOT Act CIP
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [ssn, setSsn] = useState('');
  const [showSsn, setShowSsn] = useState(false);
  const [citizenship, setCitizenship] = useState('US_CITIZEN');
  const [phone, setPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');

  // Step 3: US Physical Residential Address (No P.O. Box per PATRIOT Act)
  const [street, setStreet] = useState('');
  const [aptSuite, setAptSuite] = useState('');
  const [city, setCity] = useState('');
  const [stateProv, setStateProv] = useState('NY');
  const [zip, setZip] = useState('');
  const [taxResidency, setTaxResidency] = useState('US');

  // Step 4: Employment & SEC/FINRA Suitability Profile
  const [employmentStatus, setEmploymentStatus] = useState('Employed');
  const [employerName, setEmployerName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [industry, setIndustry] = useState('Finance / Technology');
  const [incomeRange, setIncomeRange] = useState('250k-500k');
  const [netWorth, setNetWorth] = useState('1m-5m');
  const [sourceOfFunds, setSourceOfFunds] = useState('Salary / Professional Earnings');
  const [investmentObjective, setInvestmentObjective] = useState('GROWTH');
  const [riskTolerance, setRiskTolerance] = useState('SPECULATIVE');

  // Step 5: Regulatory & Statutory Affiliations (FINRA Rule 3210 & SEC Sec 16)
  const [brokerAffiliate, setBrokerAffiliate] = useState('No');
  const [brokerFirmName, setBrokerFirmName] = useState('');
  const [publicCompanyInsider, setPublicCompanyInsider] = useState('No');
  const [insiderTicker, setInsiderTicker] = useState('');
  const [isPep, setIsPep] = useState('No');
  const [backupWithholdingExempt, setBackupWithholdingExempt] = useState(true);

  // Step 6: Security & Authentication
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaMethod, setMfaMethod] = useState<'TOTP' | 'SMS' | 'HARDWARE'>('TOTP');

  // Step 7: Disclosures & Legal E-Signature
  const [certifyW9, setCertifyW9] = useState(false);
  const [agreeCustodyTerms, setAgreeCustodyTerms] = useState(false);
  const [ackRiskDisclosure, setAckRiskDisclosure] = useState(false);
  const [consentEsign, setConsentEsign] = useState(false);
  const [legalSignature, setLegalSignature] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Step 2 validations
    if (registerStep === 2) {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMsg("Please provide your complete legal name.");
        return;
      }
      if (!ssn.trim() || ssn.replace(/\D/g, '').length < 4) {
        setErrorMsg("Please enter a valid Social Security Number (SSN) or Tax ID.");
        return;
      }
    }

    // Step 3 validations
    if (registerStep === 3) {
      if (!street.trim() || !city.trim() || !zip.trim()) {
        setErrorMsg("Physical residential address is required by US PATRIOT Act Section 326.");
        return;
      }
    }

    // Step 6 validations
    if (registerStep === 6) {
      if (regPassword.length < 8) {
        setErrorMsg("Password must be at least 8 characters long.");
        return;
      }
      if (regPassword !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setRegisterStep(prev => Math.min(prev + 1, 7));
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setRegisterStep(prev => Math.max(prev - 1, 1));
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
        if (!certifyW9 || !agreeCustodyTerms || !ackRiskDisclosure || !consentEsign) {
          throw new Error('Please review and check all statutory US regulatory certifications.');
        }
        if (!legalSignature.trim()) {
          throw new Error('Please type your full legal name to electronically sign your Form W-9 and Brokerage Agreement.');
        }
        
        // Complete the onboarding registration
        await onRegister(firstName, lastName, regEmail, regPassword);
        onClose();
      } else {
        setInfoMsg('Password reset instructions have been dispatched to your institutional email address.');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication error';
      if (msg.toLowerCase().includes('weak_password') || msg.toLowerCase().includes('exposed') || msg.toLowerCase().includes('breach') || msg.toLowerCase().includes('weak') || err.code === 'weak_password') {
        setErrorMsg('This password has been flagged by security filters. Please choose a stronger combination.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (onGoogleSignIn) {
        await onGoogleSignIn(email);
      } else {
        const { error } = await signInWithGoogleSupabase('/dashboard');
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed');
      setIsSubmitting(false);
    }
  };

  // Password strength checker helper
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const renderRegisterStep = () => {
    switch (registerStep) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-amber-400">
                <Landmark className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Step 1: Account Classification</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                SEC / FINRA Class
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                Brokerage Account Entity Structure
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'INDIVIDUAL', label: 'Individual Brokerage', desc: 'Standard single owner taxable account' },
                  { id: 'JOINT', label: 'Joint Tenancy (JTWROS)', desc: 'Co-owned with rights of survivorship' },
                  { id: 'CORPORATE', label: 'Corporate / LLC / Entity', desc: 'Operating business or fund entity' },
                  { id: 'TRUST', label: 'Trust / Estate Account', desc: 'Fiduciary managed assets' },
                  { id: 'RETIREMENT', label: 'Traditional / Roth IRA', desc: 'Tax-advantaged retirement structure' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAccountType(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      accountType === item.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {accountType === 'CORPORATE' && (
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Legal Corporate Entity Name & State of Incorporation</label>
                <input
                  type="text"
                  required
                  value={entityName}
                  onChange={e => setEntityName(e.target.value)}
                  placeholder="e.g. Acme Capital Partners LLC (Delaware)"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                US Investor Regulatory Qualification Tier
              </label>
              <select
                value={investorTier}
                onChange={e => setInvestorTier(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              >
                <option value="STANDARD">Standard US Retail Account (Standard spot execution limit)</option>
                <option value="ACCREDITED">Accredited Investor — SEC Rule 501 Reg D ($1M+ net worth or $200k+ annual income)</option>
                <option value="QIB">Qualified Institutional Buyer (QIB) — SEC Rule 144A ($100M+ investable securities)</option>
                <option value="PRIME">Prime Brokerage High-Frequency Client</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer mt-4"
            >
              <span>Next: Legal Identity & PATRIOT Act CIP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-amber-400">
                <UserIcon className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Step 2: Legal Identity & USA CIP</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> PATRIOT Act CIP
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Legal First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Middle Initial</label>
                <input
                  type="text"
                  maxLength={1}
                  value={middleName}
                  onChange={e => setMiddleName(e.target.value)}
                  placeholder="M"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Legal Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Date of Birth (18+) *</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-zinc-400">SSN / ITIN / EIN *</label>
                  <button
                    type="button"
                    onClick={() => setShowSsn(!showSsn)}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    {showSsn ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showSsn ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showSsn ? 'text' : 'password'}
                  required
                  value={ssn}
                  onChange={e => setSsn(e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">US Legal Citizenship Status</label>
                <select
                  value={citizenship}
                  onChange={e => setCitizenship(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="US_CITIZEN">United States Citizen</option>
                  <option value="PERMANENT_RESIDENT">US Permanent Resident (Green Card)</option>
                  <option value="NON_RESIDENT_ALIEN">Non-Resident Alien (W-8BEN Required)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Primary Phone (SMS 2FA) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Primary Institutional Email Address *</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="name@institutional.com"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[10px] text-zinc-400 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>USA PATRIOT Act Notice:</strong> Federal law requires all US financial institutions to obtain, verify, and record information that identifies each person opening an account.
              </span>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>Next: Residential Address</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-amber-400">
                <MapPin className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Step 3: Physical US Address</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                FINRA Rule 4512
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Street Address (Physical Residence — No P.O. Boxes allowed) *
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder="e.g. 100 Wall Street, Floor 24"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Apartment / Suite / Unit</label>
                <input
                  type="text"
                  value={aptSuite}
                  onChange={e => setAptSuite(e.target.value)}
                  placeholder="Suite / Apt #"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="New York"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">US State / Territory *</label>
                <select
                  required
                  value={stateProv}
                  onChange={e => setStateProv(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                >
                  {US_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">ZIP / Postal Code (5-digit) *</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  placeholder="10005"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Primary Country of Tax Residency</label>
              <select
                value={taxResidency}
                onChange={e => setTaxResidency(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              >
                <option value="US">United States (Form W-9 Tax Certification)</option>
                <option value="CA">Canada (Form W-8BEN)</option>
                <option value="GB">United Kingdom (Form W-8BEN)</option>
                <option value="EU">European Union (Form W-8BEN)</option>
                <option value="CH">Switzerland (Form W-8BEN)</option>
                <option value="SG">Singapore (Form W-8BEN)</option>
              </select>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>Next: Financial Profile & Suitability</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-amber-400">
                <Briefcase className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Step 4: FINRA Suitability & Finances</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Rule 2111
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Employment Status</label>
                <select
                  value={employmentStatus}
                  onChange={e => setEmploymentStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed / Business Owner</option>
                  <option value="Retired">Retired</option>
                  <option value="Investor">Private Investor / Trader</option>
                  <option value="Student">Student / Academic</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Occupation / Job Title</label>
                <input
                  type="text"
                  required
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  placeholder="e.g. Portfolio Manager, Engineer"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Employer / Organization</label>
                <input
                  type="text"
                  required
                  value={employerName}
                  onChange={e => setEmployerName(e.target.value)}
                  placeholder="e.g. Bridgewater / Self"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Industry Sector</label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Finance / Banking">Finance / Banking / Asset Management</option>
                  <option value="Technology / Software">Technology / Software</option>
                  <option value="Healthcare / Biotech">Healthcare / Biotech</option>
                  <option value="Energy / Commodities">Energy / Commodities</option>
                  <option value="Real Estate">Real Estate & Construction</option>
                  <option value="Legal / Accounting">Legal / Accounting / Professional</option>
                  <option value="Other">Other Institutional Sector</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Annual Gross Income (USD)</label>
                <select
                  value={incomeRange}
                  onChange={e => setIncomeRange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="<100k">Under $100,000</option>
                  <option value="100k-250k">$100,000 – $250,000</option>
                  <option value="250k-500k">$250,000 – $500,000</option>
                  <option value="500k-1m">$500,000 – $1,000,000</option>
                  <option value="1m+">Over $1,000,000</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Liquid Net Worth (USD)</label>
                <select
                  value={netWorth}
                  onChange={e => setNetWorth(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="<250k">Under $250,000</option>
                  <option value="250k-1m">$250,000 – $1,000,000</option>
                  <option value="1m-5m">$1,000,000 – $5,000,000</option>
                  <option value="5m-25m">$5,000,000 – $25,000,000</option>
                  <option value="25m+">Over $25,000,000</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Primary Investment Objective</label>
                <select
                  value={investmentObjective}
                  onChange={e => setInvestmentObjective(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="PRESERVATION">Capital Preservation</option>
                  <option value="INCOME">Income Generation</option>
                  <option value="GROWTH">Long-Term Capital Growth</option>
                  <option value="SPECULATION">Active Speculation / Trading</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Risk Tolerance</label>
                <select
                  value={riskTolerance}
                  onChange={e => setRiskTolerance(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="CONSERVATIVE">Low / Conservative</option>
                  <option value="MODERATE">Moderate Risk</option>
                  <option value="AGGRESSIVE">Aggressive Growth</option>
                  <option value="SPECULATIVE">Speculative High Risk</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>Next: Regulatory Affiliations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-amber-400">
                <Scale className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Step 5: US Statutory Disclosures</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                FINRA / SEC Rules
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">
                    FINRA Rule 3210: Broker-Dealer Affiliation
                  </span>
                  <select
                    value={brokerAffiliate}
                    onChange={e => setBrokerAffiliate(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Are you or an immediate family member employed by or registered with FINRA, an exchange, or a broker-dealer?
                </p>
                {brokerAffiliate === 'Yes' && (
                  <input
                    type="text"
                    required
                    value={brokerFirmName}
                    onChange={e => setBrokerFirmName(e.target.value)}
                    placeholder="Enter Broker-Dealer Name & CRD #"
                    className="w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                )}
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">
                    SEC Section 16(a): Public Company Control
                  </span>
                  <select
                    value={publicCompanyInsider}
                    onChange={e => setPublicCompanyInsider(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Are you a 10% shareholder, director, or policy-making officer of any publicly traded company?
                </p>
                {publicCompanyInsider === 'Yes' && (
                  <input
                    type="text"
                    required
                    value={insiderTicker}
                    onChange={e => setInsiderTicker(e.target.value)}
                    placeholder="Enter Public Company Stock Ticker (e.g. AAPL, NVDA)"
                    className="w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                )}
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">
                    Senior Foreign Political Figure / PEP
                  </span>
                  <select
                    value={isPep}
                    onChange={e => setIsPep(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Are you or an immediate family member a Politically Exposed Person (PEP) or senior government official?
                </p>
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>Next: Account Security & MFA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 6:
        const strength = getPasswordStrength(regPassword);
        return (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-amber-400">
                <Lock className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Step 6: Account Security & MFA</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                256-Bit Vault
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Create Institutional Master Password *</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>

              {/* Live Password Strength Meter */}
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`flex-1 rounded-full transition-all ${
                        strength >= bar
                          ? strength === 4
                            ? 'bg-emerald-400'
                            : strength >= 3
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                          : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>8+ chars, upper/lower, numbers, symbols</span>
                  <span className="font-mono font-bold text-zinc-400">
                    {strength === 4 ? 'Bank Grade' : strength === 3 ? 'Strong' : strength === 2 ? 'Fair' : 'Weak'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Confirm Master Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Preferred Multi-Factor Authentication Protocol</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'TOTP', label: 'Authenticator App', desc: 'Google/Microsoft Auth' },
                  { id: 'SMS', label: 'SMS Phone OTP', desc: 'Encrypted Carrier Text' },
                  { id: 'HARDWARE', label: 'Security Key', desc: 'FIDO2 / YubiKey' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMfaMethod(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      mfaMethod === item.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{item.label}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>Next: E-Sign & W-9 Tax Certification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-amber-400">
                <FileCheck2 className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Step 7: IRS W-9 & E-Sign</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-emerald-500/30">
                Legal E-Sign Act
              </span>
            </div>

            {/* Regulatory Disclosures Checkboxes */}
            <div className="space-y-2.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <label className="flex items-start space-x-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={certifyW9}
                    onChange={e => setCertifyW9(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border border-zinc-600 rounded bg-zinc-900 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                  <CheckCircle2 className="w-3 h-3 text-zinc-950 absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10.5px] text-zinc-300 group-hover:text-white transition-colors leading-relaxed">
                  <strong>Form W-9 Tax Certification:</strong> Under penalties of perjury, I certify that the Social Security Number or Taxpayer ID provided is correct, and I am not subject to backup withholding per IRS statutes.
                </span>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={agreeCustodyTerms}
                    onChange={e => setAgreeCustodyTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border border-zinc-600 rounded bg-zinc-900 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                  <CheckCircle2 className="w-3 h-3 text-zinc-950 absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10.5px] text-zinc-300 group-hover:text-white transition-colors leading-relaxed">
                  I agree to the <strong>Verity-Capital Inv Institutional Brokerage Customer Account Agreement</strong> and segregated air-gapped cold storage custodial policies.
                </span>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={ackRiskDisclosure}
                    onChange={e => setAckRiskDisclosure(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border border-zinc-600 rounded bg-zinc-900 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                  <CheckCircle2 className="w-3 h-3 text-zinc-950 absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10.5px] text-zinc-300 group-hover:text-white transition-colors leading-relaxed">
                  I acknowledge the <strong>CFTC / SEC Digital Asset Volatility Risk Disclosure</strong>. I understand that digital asset spot positions fluctuate and that Verity-Capital Inv operates on an execution-only, non-advisory basis.
                </span>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    required
                    checked={consentEsign}
                    onChange={e => setConsentEsign(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border border-zinc-600 rounded bg-zinc-900 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors"></div>
                  <CheckCircle2 className="w-3 h-3 text-zinc-950 absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10.5px] text-zinc-300 group-hover:text-white transition-colors leading-relaxed">
                  I consent to electronic delivery of trade confirmations, periodic account statements, and annual IRS Form 1099 tax filings under the US E-SIGN Act.
                </span>
              </label>
            </div>

            {/* Electronic Signature Box */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <label className="block text-[11px] font-semibold text-zinc-300">
                Type Your Full Legal Name to Electronically Sign *
              </label>
              <input
                type="text"
                required
                value={legalSignature}
                onChange={e => setLegalSignature(e.target.value)}
                placeholder={`${firstName || 'First'} ${lastName || 'Last'}`}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-amber-300 font-serif italic text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                <span>Timestamp: {new Date().toLocaleDateString('en-US')} (EST)</span>
                <span className="text-emerald-400">OFAC Pre-Screened</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying & Initializing Account...' : 'Submit US Brokerage Application'}</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-50">
      <div className="bg-[#0B0F19] border border-zinc-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {mode === 'login' ? 'Institutional Client Login' : mode === 'register' ? 'US Brokerage Registration' : 'Account Security Reset'}
                </h3>
                {mode === 'register' && (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    USA 🇺🇸 SEC / FINRA
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                {mode === 'register' ? 'FINRA Rule 2090/2111 & PATRIOT Act Compliant Onboarding' : 'Verity-Capital Inv Prime Brokerage'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="overflow-y-auto p-6 shrink-1">
          {mode === 'register' ? (
            <form onSubmit={handleNextStep} className="space-y-0">
              {/* Step Progress Header */}
              <div className="mb-5 pb-4 border-b border-zinc-800/80">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 font-mono text-[10px] font-black flex items-center justify-center">
                      {registerStep}
                    </span>
                    <span>
                      {registerStep === 1 && 'Account Entity & Tier'}
                      {registerStep === 2 && 'Legal Identity (CIP)'}
                      {registerStep === 3 && 'Physical US Address'}
                      {registerStep === 4 && 'FINRA Suitability Profile'}
                      {registerStep === 5 && 'Statutory Disclosures'}
                      {registerStep === 6 && 'Vault Security & MFA'}
                      {registerStep === 7 && 'Form W-9 & E-Signature'}
                    </span>
                  </span>
                  <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    Step {registerStep} of 7
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        registerStep >= stepNum ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {renderRegisterStep()}
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Institutional Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@institutional.com"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-zinc-400">Master Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoMsg && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs">
                  {infoMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{mode === 'login' ? 'Sign In to Brokerage Terminal' : 'Send Reset Link'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  or authenticate with
                </span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>

              <button
                type="button"
                id="google-oauth-signin-btn"
                disabled={isSubmitting}
                onClick={handleGoogleAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white font-medium text-xs flex items-center justify-center space-x-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isSubmitting ? 'Connecting to Google...' : 'Continue with Google Single Sign-On'}</span>
              </button>
            </form>
          )}
          
          {/* Footer switch mode */}
          <div className="pt-4 text-center text-[11px] text-zinc-400 border-t border-zinc-800/60 mt-4">
            {mode === 'login' ? (
              <span>
                New institutional client?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setRegisterStep(1); }}
                  className="text-amber-400 font-semibold hover:underline cursor-pointer"
                >
                  Start USA Brokerage Onboarding
                </button>
              </span>
            ) : (
              <span>
                Already have an approved account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-amber-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

