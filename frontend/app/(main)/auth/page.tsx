'use client';

import { ShieldCheck, Lock, Eye, Key, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const handleUpdatePassword = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Encrypting new credentials...',
        success: 'Security protocols updated successfully.',
        error: 'Failed to update credentials.',
      }
    );
  };

  const handleDownloadLog = () => {
    const data = {
      timestamp: new Date().toISOString(),
      event: "Enterprise Audit Log Export",
      user: "Mahak Lab",
      tier: "Enterprise",
      logs: [
        { time: "2024-05-06 10:24:01", action: "GNN Inference", resource: "C1=CC=CC=C1" },
        { time: "2024-05-06 11:15:42", action: "Lab Submission", resource: "CCO" },
        { time: "2024-05-06 14:02:11", action: "Weight Optimization", resource: "Model Core v2" }
      ]
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DiffuCat_AuditLog_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Audit Log exported to local storage.');
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="absolute inset-0 -z-10 blueprint-bg opacity-20 pointer-events-none" />
      
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-text-primary mb-2">Auth & Privacy</h1>
        <p className="text-lg text-text-secondary max-w-2xl">Manage your laboratory credentials and platform security protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-3xl border border-border/80 p-8 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald">
                <Lock className="h-6 w-6" />
             </div>
             <h3 className="text-xl font-bold">Access Control</h3>
          </div>
          <p className="text-text-secondary leading-relaxed">Your account is secured with Enterprise-grade encryption. Two-factor authentication is active.</p>
          <button 
            onClick={handleUpdatePassword}
            className="w-full h-12 rounded-xl bg-surface-2 border border-border/60 font-bold hover:bg-surface-3 transition-all"
          >
            Update Password
          </button>
        </div>

        <div className="glass rounded-3xl border border-border/80 p-8 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
                <Eye className="h-6 w-6" />
             </div>
             <h3 className="text-xl font-bold">Data Privacy</h3>
          </div>
          <p className="text-text-secondary leading-relaxed">Scientific assets and SMILES strings are stored in isolated encrypted clusters.</p>
          <button 
            onClick={handleDownloadLog}
            className="w-full h-12 rounded-xl bg-cyan text-void font-bold hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all"
          >
            Download Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
