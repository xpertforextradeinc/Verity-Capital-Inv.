import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { supabase } from '../../services/supabase.ts';
import { InvestmentPlan } from '../../types.ts';
import { Shield, ChevronRight, Check } from 'lucide-react';

interface InvestmentPlansProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    amount: 1000,
    features: ['Access to standard markets', 'Basic portfolio reporting', 'Email support', 'Standard execution'],
  },
  {
    id: 'silver',
    name: 'Silver Plan',
    amount: 5000,
    features: ['Advanced market access', 'Daily market insights', 'Priority email support', 'Fast execution'],
  },
  {
    id: 'gold',
    name: 'Gold Plan',
    amount: 10000,
    features: ['Global OTC access', 'Dedicated account manager', '24/7 priority support', 'Institutional execution'],
    recommended: true,
  },
  {
    id: 'vip',
    name: 'VIP Plan',
    amount: 25000,
    features: ['Exclusive block trades', 'Private custody solutions', 'Direct broker line', 'Zero-latency execution'],
  },
];

export const InvestmentPlans: React.FC<InvestmentPlansProps> = ({ onOpenAuth }) => {
  const [plans, setPlans] = useState<InvestmentPlan[]>(DEFAULT_PLANS);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    // Load WhatsApp number: Supabase first, fallback to API
    const loadWhatsApp = async () => {
      try {
        if (supabase) {
          const { data } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'whatsapp_number')
            .single();
          if (mounted && data?.value) {
            setWhatsappNumber(data.value);
            return;
          }
        }
      } catch (err) {
        // Fallback to API
      }

      try {
        const num = await api.getWhatsAppNumber();
        if (mounted && num) setWhatsappNumber(num);
      } catch (err) {
        console.error('Failed to load WhatsApp number', err);
      }
    };

    // Load Investment Plans: Supabase first, fallback to API
    const loadPlans = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('investment_plans')
            .select('*')
            .order('display_order', { ascending: true });
          if (!error && data && data.length > 0) {
            if (mounted) {
              setPlans(data.map((p: any) => ({
                id: p.id,
                name: p.name,
                amount: Number(p.amount),
                features: Array.isArray(p.features) ? p.features : [],
                recommended: Boolean(p.recommended),
                display_order: p.display_order,
              })));
              return;
            }
          }
        }
      } catch (err) {
        // Fallback to API
      }

      try {
        const remotePlans = await api.getInvestmentPlans();
        if (mounted && remotePlans && remotePlans.length > 0) {
          setPlans(remotePlans);
        }
      } catch (err) {
        console.error('Failed to load investment plans', err);
      }
    };

    void loadWhatsApp();
    void loadPlans();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChoosePlan = (planName: string, amount: number) => {
    if (!whatsappNumber) {
      alert("WhatsApp contact is currently unavailable.");
      return;
    }
    const message = `Hello Verity Capital, I want to start investing with $${amount.toLocaleString()} on the ${planName}. Please guide me through the next steps.`;
    const formattedNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-16 pb-16 animate-in fade-in duration-500">
      <section className="relative isolate overflow-hidden bg-[#070b1b] px-6 py-16 sm:px-10 lg:px-20 lg:py-24 border border-white/10">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(56,189,248,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.07)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">
            <Shield className="h-3 w-3 text-emerald-400" /> Secure Investment Tiers
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Institutional Investment Plans</h1>
          <p className="mt-6 text-lg leading-8 text-zinc-400 max-w-2xl mx-auto">
            Select the tier that aligns with your capital allocation strategy. Each plan grants access to our secure execution engine and custody services.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative flex flex-col rounded-2xl p-8 shadow-2xl transition duration-300 hover:-translate-y-1 ${
                plan.recommended 
                  ? 'bg-gradient-to-b from-cyan-400/10 to-[#080d1d] border border-cyan-400/50' 
                  : 'bg-[#080d1d] border border-white/10'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-max rounded-full bg-cyan-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-950">
                  Recommended
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline text-4xl font-bold text-white">
                  ${plan.amount.toLocaleString()}
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-4 text-sm text-zinc-400">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-cyan-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleChoosePlan(plan.name, plan.amount)}
                className={`group flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-colors ${
                  plan.recommended
                    ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                Choose Plan <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
