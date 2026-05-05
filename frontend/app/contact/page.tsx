'use client';

import React, { useState, cloneElement } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Calendar, Mail, Building, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Demo Request Logged', {
        description: 'Our team will reach out via the secure channel provided.',
        style: { background: '#010409', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }
      });
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-void text-white selection:bg-emerald selection:text-void relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-electric-blue/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      {/* Header */}
      <nav className="relative z-10 px-8 py-10 max-w-7xl mx-auto w-full">
        <Link href="/" className="group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-emerald transition-colors">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Return to Hub
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald/20 bg-emerald/5 mb-8">
              <Calendar className="w-3.5 h-3.5 text-emerald" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald">Discovery Session</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black font-display tracking-tighter leading-[0.9] mb-8">
              Book a Live <br /><span className="text-emerald">Oracle Demo</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Schedule a personalized walkthrough of the DiffuCat engine with our research team.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-[40px] p-1 border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <InputField icon={<User />} label="Full Name" placeholder="Dr. Julian Sterling" required />
                <InputField icon={<Mail />} label="Professional Email" type="email" placeholder="j.sterling@biolabs.ai" required />
                <InputField icon={<Building />} label="Organization" placeholder="BioLabs Research Group" required />
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Preferred Research Focus
                  </label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-16 text-sm text-white focus:outline-none focus:border-emerald/50 transition-all appearance-none cursor-pointer">
                    <option className="bg-void">Small Molecule Catalysis</option>
                    <option className="bg-void">Polymer Design</option>
                    <option className="bg-void">Drug Discovery Pipeline</option>
                    <option className="bg-void">Crystalline Lattice Analysis</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Additional Context</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-[104px] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald/50 transition-all resize-none"
                    placeholder="Tell us about your current discovery bottlenecks..."
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-24 rounded-[32px] bg-emerald text-void font-black uppercase tracking-[0.5em] text-sm md:text-base flex items-center justify-center gap-6 shadow-[0_0_50px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-6">
                      <div className="w-6 h-6 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                      Initializing Terminal...
                    </div>
                  ) : (
                    <>
                      Schedule Discovery Session <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="relative z-10 py-12 text-center">
        <div className="text-xl font-black font-display tracking-tighter text-white/20">
          DIFFU<span className="text-emerald/20">CAT</span> AI
        </div>
      </footer>
    </main>
  );
}

function InputField({ icon, label, ...props }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
        <span className="text-emerald/60">
          {cloneElement(icon, { size: 12 })}
        </span>
        {label}
      </label>
      <input 
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-16 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald/50 transition-all"
      />
    </div>
  );
}
