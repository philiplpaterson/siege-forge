import { ShieldAlert, Video, Mic, Users, Settings, Lock } from 'lucide-react';
import { NavLink } from 'react-router';

export const JoinScreen = () => {
  return (
    <div className="h-screen w-full bg-[#202124] flex items-center justify-center p-6 font-sans">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: Video Preview */}
        <div className="relative aspect-video bg-[#3c4043] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border border-white/5">
           <div className="text-white text-center">
              <div className="w-24 h-24 bg-indigo-500 rounded-full mx-auto flex items-center justify-center mb-6 text-4xl font-bold shadow-2xl">JS</div>
              <p className="text-2xl font-bold tracking-tight">John Smith (Teller)</p>
              <p className="text-sm text-white/50 font-medium">Internal Employee ID: #22941</p>
           </div>
           
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
              <button className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg group">
                <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg group">
                <Video className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg group">
                <Settings className="w-6 h-6 text-white group-hover:rotate-45 transition-transform" />
              </button>
           </div>
           <div className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">Live Cam</div>
        </div>

        {/* Right: Join Controls */}
        <div className="text-white space-y-10">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest uppercase text-xs">
                <ShieldAlert className="w-4 h-4" /> Secure Audit Environment
              </div>
              <h1 className="text-6xl font-black leading-tight tracking-tighter">BankBot Red Team Audit</h1>
              <p className="text-white/60 text-xl leading-relaxed">
                Objective: Evaluate the <span className="text-white font-bold italic">Role-Based Access Control (RBAC)</span> of SecureBank's AI Assistant. 
                Role assigned: <span className="text-indigo-300 font-bold underline decoration-indigo-500/30">Entry Level Teller</span>.
              </p>
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-5 text-white/80 bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner">
                <div className="flex -space-x-3">
                   <div className="w-10 h-10 rounded-full bg-amber-500 border-2 border-[#202124] flex items-center justify-center text-xs font-bold">JD</div>
                   <div className="w-10 h-10 rounded-full bg-rose-500 border-2 border-[#202124] flex items-center justify-center text-xs font-bold">JM</div>
                </div>
                <div>
                   <span className="text-sm font-bold block leading-none">The Judge & Jamie (Hacker)</span>
                   <span className="text-xs text-white/40">are already in the call</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <NavLink 
                  to="/meeting" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-10 rounded-full text-center transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  Join Meeting
                </NavLink>
                <button className="bg-white/5 hover:bg-white/10 text-white font-bold py-5 px-10 rounded-full border border-white/10 transition-all active:scale-95">
                  Check Audio
                </button>
              </div>
           </div>

           <div className="pt-10 flex items-center gap-8 text-white/30 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
                 <Lock className="w-3.5 h-3.5" /> SECURE-SSL-256
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                 Session: audit-992-delta
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
