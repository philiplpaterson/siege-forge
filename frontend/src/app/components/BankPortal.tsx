import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Users, CreditCard, Shield,
  Search, Bell, Landmark, CheckCircle2, XCircle,
  AlertCircle, TrendingUp, ArrowUpRight, ArrowDownLeft,
  DollarSign, Wallet, ChevronRight, Filter,
  ShieldCheck, ShieldAlert, Calendar, Activity,
  UserCheck, Terminal, MoreHorizontal, Eye, Clock,
  FileText, Lock, Building2, Sparkles, ChevronDown,
  Bot, Send, X, MessageSquare,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { useBankSystem, ChatMessage } from '../hooks/useBankSystem';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const StatusBadge = ({ status }: { status: string }) => {
  const s: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    flagged: "bg-rose-50 text-rose-700 border-rose-200",
    declined: "bg-slate-100 text-slate-500 border-slate-200",
    verified: "bg-blue-50 text-blue-700 border-blue-200",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-rose-50 text-rose-700 border-rose-200",
    expired: "bg-rose-50 text-rose-600 border-rose-200",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border", s[status] || "bg-gray-50 text-gray-600 border-gray-200")}>
      {status}
    </span>
  );
};

const RiskDot = ({ level }: { level: string }) => {
  const c = level === 'low' ? 'bg-emerald-500' : level === 'medium' ? 'bg-amber-500' : 'bg-rose-500';
  return <span className={cn("inline-block w-2 h-2 rounded-full", c)} />;
};

type BankProps = { bank: ReturnType<typeof useBankSystem> };

/* ─── Integrated Chat Panel ─── */
const ChatPanel = ({ messages, isTyping, onSend, onClose, isGameRunning }: {
  messages: ChatMessage[];
  isTyping: boolean;
  onSend: (msg: string) => void;
  onClose: () => void;
  isGameRunning?: boolean;
}) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const send = () => {
    if (isGameRunning) return;
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  const suggestions = ["Go to dashboard", "Show pending", "Find Alice Johnson", "Approve all safe", "Help"];

  const senderColors: Record<string, string> = {
    BankBot: "bg-gradient-to-br from-[#002D72] to-indigo-700 text-white",
    "John Smith": "bg-slate-200 text-slate-900",
    Judge: "bg-amber-100 text-amber-900 border border-amber-200",
    "Tester (Jamie)": "bg-emerald-100 text-emerald-900 border border-emerald-200",
    System: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-4 right-4 w-[370px] h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#002D72] to-indigo-700 text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-[13px]">BankBot AI</div>
            <div className="text-[9px] text-blue-200">Powered by Claude Sonnet</div>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2.5">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-[13px] font-semibold text-slate-800 mb-1">Welcome to BankBot</p>
            <p className="text-[11px] text-slate-500 mb-3">AI-powered assistant for banking operations</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => onSend(s)}
                  className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-full text-slate-600 transition-colors border border-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.sender === "John Smith";
          return (
            <div key={msg.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed", senderColors[msg.sender] || "bg-slate-100 text-slate-800")}>
                {!isUser && <div className="text-[9px] font-bold opacity-70 mb-0.5">{msg.sender}</div>}
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={cn("text-[8px] mt-1 opacity-50", isUser ? "text-right" : "")}>{msg.timestamp}</div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[10px] text-slate-400">BankBot is thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50/50">
        {isGameRunning ? (
          <div className="flex items-center justify-center gap-2 py-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-medium text-slate-400">Observing red team exercise...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask BankBot anything..."
              className="flex-1 text-[12px] bg-white rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
            />
            <button
              onClick={send}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 bg-[#002D72] hover:bg-[#003d9e] disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const BankPortal = ({ bank }: BankProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const selectedCustomer = bank.customers.find(c => c.id === bank.selectedCustomerId) || bank.customers[0];
  const unreadCount = bank.notifications.filter(n => !n.read).length;

  const allTransactions = useMemo(() =>
    bank.customers.flatMap(c => c.transactions.map(t => ({ ...t, customerName: c.name, customerId: c.id }))),
    [bank.customers]
  );

  const filteredTransactions = useMemo(() => {
    let txs = allTransactions;
    if (bank.txFilter !== "all") txs = txs.filter(t => t.status === bank.txFilter);
    if (searchQuery) txs = txs.filter(t =>
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return txs.sort((a, b) => b.date.localeCompare(a.date));
  }, [allTransactions, bank.txFilter, searchQuery]);

  const stats = useMemo(() => ({
    totalAum: bank.customers.reduce((s, c) => s + c.balance, 0),
    activeClients: bank.customers.length,
    pendingReviews: allTransactions.filter(t => t.status === "pending").length,
    flaggedItems: allTransactions.filter(t => t.status === "flagged").length,
  }), [bank.customers, allTransactions]);

  const tabs: { id: typeof bank.activeTab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "customers", label: "Clients", icon: Users },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "compliance", label: "Compliance", icon: Shield },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#f5f6f8] font-sans relative">
      {/* ─── HEADER ─── */}
      <header className="h-11 bg-[#002D72] text-white flex items-center justify-between px-5 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Landmark className="w-4.5 h-4.5 text-blue-300" />
            <span className="font-black text-sm tracking-tight">SecureBank</span>
          </div>
          <nav className="flex items-center">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => bank.setActiveTab(tab.id)}
                className={cn(
                  "h-11 px-4 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all",
                  bank.activeTab === tab.id
                    ? "border-white text-white bg-white/10"
                    : "border-transparent text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === "transactions" && stats.pendingReviews > 0 && (
                  <span className="ml-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none">{stats.pendingReviews}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="w-3 h-3 text-white/30 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white/10 rounded-md py-1 pl-7 pr-3 text-[10px] w-40 outline-none focus:bg-white/20 focus:w-52 transition-all text-white placeholder-white/30 border border-white/10"
            />
          </div>
          <button className="relative p-1.5 hover:bg-white/10 rounded-md transition-all">
            <Bell className="w-4 h-4 text-white/60" />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-[7px] font-black text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">{unreadCount}</span>}
          </button>
          <div className="h-5 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold leading-none">John Smith</p>
              <p className="text-[8px] text-white/40 font-bold uppercase mt-0.5">Teller • #22941</p>
            </div>
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-[9px] font-black">JS</div>
          </div>
        </div>
      </header>

      {/* ─── CONTENT ─── */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5 max-w-[1400px] mx-auto">

          {/* ═══ DASHBOARD ═══ */}
          {bank.activeTab === "dashboard" && (
            <>
              {/* Welcome */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-slate-800">Good afternoon, John</h1>
                  <p className="text-[11px] text-slate-400 font-medium">February 21, 2026 • Teller Workstation</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-700">BankBot Active</span>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total AUM", value: `$${(stats.totalAum / 1e6).toFixed(2)}M`, trend: "+2.4%", icon: Wallet, trendUp: true },
                  { label: "Active Clients", value: stats.activeClients.toString(), trend: "Stable", icon: Users, trendUp: true },
                  { label: "Pending Reviews", value: stats.pendingReviews.toString(), trend: stats.pendingReviews > 3 ? "High" : "Normal", icon: Clock, trendUp: false },
                  { label: "Flagged Items", value: stats.flaggedItems.toString(), trend: stats.flaggedItems > 0 ? "Attention" : "Clear", icon: ShieldAlert, trendUp: false },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("p-2 rounded-lg", i < 2 ? "bg-blue-50" : i === 2 ? "bg-amber-50" : "bg-rose-50")}>
                        <s.icon className={cn("w-4 h-4", i < 2 ? "text-blue-600" : i === 2 ? "text-amber-600" : "text-rose-600")} />
                      </div>
                      <span className={cn("text-[10px] font-bold", s.trendUp ? "text-emerald-600" : stats.pendingReviews > 3 || stats.flaggedItems > 0 ? "text-amber-600" : "text-slate-400")}>{s.trend}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Dashboard Body */}
              <div className="grid grid-cols-3 gap-5">
                {/* Recent Activity Table */}
                <div className="col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-[13px] font-bold text-slate-800">Recent Activity</h2>
                    <button onClick={() => bank.setActiveTab("transactions")} className="text-[10px] font-bold text-blue-600 hover:underline">View All →</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                          <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                          <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                          <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                          <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                          <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {allTransactions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((t) => (
                          <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-5 py-2.5 text-[11px] text-slate-400 font-medium">{t.date.slice(5)}</td>
                            <td className="px-5 py-2.5 text-[11px] font-mono text-slate-500">{t.id}</td>
                            <td className="px-5 py-2.5 text-[11px] font-semibold text-slate-700 max-w-[200px] truncate">{t.description}</td>
                            <td className="px-5 py-2.5 text-[11px] text-slate-500">{t.customerName}</td>
                            <td className="px-5 py-2.5 text-right">
                              <span className={cn("text-[11px] font-bold", t.type === "credit" ? "text-emerald-600" : "text-slate-800")}>
                                {t.type === "credit" ? "+" : "-"}${t.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-5 py-2.5 text-center"><StatusBadge status={t.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Alerts */}
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-[12px] font-bold text-slate-800">Active Alerts</h3>
                      <span className="bg-rose-100 text-rose-700 text-[9px] font-black px-2 py-0.5 rounded-full">{bank.notifications.filter(n => !n.read).length}</span>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[200px] overflow-y-auto">
                      {bank.notifications.filter(n => !n.read).map(n => (
                        <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => bank.markNotificationRead(n.id)}>
                          <div className="flex items-start gap-2">
                            <AlertCircle className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", n.type === "alert" ? "text-rose-500" : "text-amber-500")} />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-700 leading-tight">{n.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session Metrics */}
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                    <h3 className="text-[12px] font-bold text-slate-800 mb-3">Security Posture</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Prompt Security", val: 92, color: "bg-emerald-500" },
                        { label: "Role Adherence", val: 84, color: "bg-blue-500" },
                        { label: "Data Scrubbing", val: 100, color: "bg-emerald-500" },
                      ].map((m, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{m.label}</span>
                            <span className="text-[10px] font-bold text-slate-700">{m.val}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-1000", m.color)} style={{ width: `${m.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guardrail Banner */}
                  <div className="bg-[#002D72] p-4 rounded-xl text-white">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-300" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">Guardrail Active</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-80">Teller persona enforced. High-value operations ($1,000+) require manager approval.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ CUSTOMERS ═══ */}
          {bank.activeTab === "customers" && (
            <div className="grid grid-cols-4 gap-5">
              {/* Customer Table */}
              <div className="col-span-3 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-[13px] font-bold text-slate-800">Client Directory</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text" placeholder="Search clients..."
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-7 pr-3 text-[10px] w-48 outline-none focus:border-blue-300 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Account</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Credit Limit</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">KYC</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bank.customers
                      .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(c => (
                      <tr
                        key={c.id}
                        onClick={() => bank.setSelectedCustomerId(c.id)}
                        className={cn(
                          "cursor-pointer transition-all",
                          bank.selectedCustomerId === c.id ? "bg-blue-50/60" : "hover:bg-slate-50"
                        )}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] shadow-sm shrink-0",
                              bank.selectedCustomerId === c.id ? "bg-[#002D72] text-white" : "bg-slate-100 text-slate-500"
                            )}>
                              {c.name.charAt(0)}{c.name.split(" ").pop()?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12px] font-bold text-slate-800 leading-tight truncate">{c.name}</p>
                              <p className="text-[9px] text-slate-400 font-medium">{c.id} • {c.accountNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold",
                            c.accountType === "Private Client" ? "bg-indigo-50 text-indigo-600" :
                            c.accountType === "Business" ? "bg-cyan-50 text-cyan-600" :
                            c.accountType === "Premium" ? "bg-purple-50 text-purple-600" :
                            "bg-slate-50 text-slate-500"
                          )}>{c.accountType}</span>
                        </td>
                        <td className="px-5 py-3 text-right text-[12px] font-bold text-slate-800">${c.balance.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-[12px] font-medium text-slate-500">${c.creditLimit.toLocaleString()}</td>
                        <td className="px-5 py-3 text-center"><StatusBadge status={c.kycStatus} /></td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <RiskDot level={c.riskLevel} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{c.riskLevel}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detail Panel */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden h-fit sticky top-5">
                <div className="p-5 border-b border-slate-100 text-center">
                  <div className={cn(
                    "w-14 h-14 rounded-xl mx-auto flex items-center justify-center text-xl font-black shadow-sm mb-3",
                    selectedCustomer.frozen ? "bg-rose-100 text-rose-600" : "bg-[#002D72] text-white"
                  )}>
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-[14px]">{selectedCustomer.name}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedCustomer.id}</p>
                  {selectedCustomer.frozen && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-bold border border-rose-200">
                      <Lock className="w-2.5 h-2.5" /> FROZEN
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  {[
                    { label: "Email", value: selectedCustomer.email },
                    { label: "Phone", value: selectedCustomer.phone },
                    { label: "Address", value: selectedCustomer.address },
                    { label: "Member Since", value: selectedCustomer.joinDate },
                    { label: "Routing", value: selectedCustomer.routingNumber },
                  ].map((f, i) => (
                    <div key={i}>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.label}</p>
                      <p className="text-[11px] font-medium text-slate-700 mt-0.5 leading-snug">{f.value}</p>
                    </div>
                  ))}
                </div>

                <div className="px-4 pb-4">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Recent Transactions</p>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {selectedCustomer.transactions.slice(0, 5).map(t => (
                      <div key={t.id} className="flex items-center justify-between py-1.5 px-2.5 bg-slate-50 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold text-slate-600 truncate">{t.description}</p>
                          <p className="text-[8px] text-slate-400">{t.date}</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className={cn("text-[10px] font-bold", t.type === "credit" ? "text-emerald-600" : "text-slate-800")}>
                            {t.type === "credit" ? "+" : "-"}${t.amount.toLocaleString()}
                          </p>
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TRANSACTIONS ═══ */}
          {bank.activeTab === "transactions" && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-[13px] font-bold text-slate-800">Transaction Ledger</h2>
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    {["all", "pending", "approved", "flagged", "declined"].map(f => (
                      <button
                        key={f}
                        onClick={() => bank.setTxFilter(f)}
                        className={cn(
                          "px-3 py-1 text-[10px] font-bold rounded-md capitalize transition-all",
                          bank.txFilter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {f}
                        {f === "pending" && stats.pendingReviews > 0 && (
                          <span className="ml-1 text-[8px] bg-amber-100 text-amber-700 px-1 rounded-full">{stats.pendingReviews}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text" placeholder="Filter transactions..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-7 pr-3 text-[10px] w-48 outline-none focus:border-blue-300 transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">TX ID</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-5 py-3 text-[11px] text-slate-400 font-medium">{t.date}</td>
                        <td className="px-5 py-3 text-[11px] font-mono text-slate-500 font-semibold">{t.id}</td>
                        <td className="px-5 py-3 text-[11px] font-semibold text-slate-700">{t.customerName}</td>
                        <td className="px-5 py-3 text-[11px] text-slate-600 max-w-[220px] truncate">{t.description}</td>
                        <td className="px-5 py-3">
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{t.category}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {t.type === "credit"
                              ? <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
                              : <ArrowUpRight className="w-3 h-3 text-slate-400" />
                            }
                            <span className={cn("text-[11px] font-bold", t.type === "credit" ? "text-emerald-600" : "text-slate-800")}>
                              ${t.amount.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center"><StatusBadge status={t.status} /></td>
                        <td className="px-5 py-3 text-center">
                          {t.status === "pending" && (
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => bank.handleUserMessage(`Approve ${t.id}`)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => bank.handleUserMessage(`Flag ${t.id}`)}
                                className="px-2 py-1 bg-rose-50 text-rose-700 rounded text-[9px] font-bold border border-rose-200 hover:bg-rose-100 transition-all"
                              >
                                Flag
                              </button>
                            </div>
                          )}
                          {t.status === "flagged" && (
                            <span className="text-[9px] text-rose-400 font-bold">Under Review</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-[12px] text-slate-400">
                          No transactions match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-medium">
                  Showing {filteredTransactions.length} of {allTransactions.length} transactions
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Total Value: ${filteredTransactions.reduce((s, t) => s + t.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* ═══ COMPLIANCE ═══ */}
          {bank.activeTab === "compliance" && (
            <div className="grid grid-cols-2 gap-5">
              {/* Role Permissions */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#002D72]" />
                  <h2 className="text-[13px] font-bold text-slate-800">Role-Based Access Control</h2>
                </div>
                <div className="p-5 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-200">CURRENT: TELLER</span>
                    </div>
                    <div className="space-y-2">
                      {(POLICY_RULES_LOCAL.teller || []).map((rule: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 py-2 px-3 bg-slate-50 rounded-lg">
                          {rule.startsWith("Cannot") ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          )}
                          <span className="text-[11px] text-slate-600 leading-snug">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-bold border border-slate-200">MANAGER (Restricted)</span>
                    </div>
                    <div className="space-y-2 opacity-50">
                      {(POLICY_RULES_LOCAL.manager || []).slice(0, 4).map((rule: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 py-2 px-3 bg-slate-50 rounded-lg">
                          <Lock className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
                          <span className="text-[11px] text-slate-400 leading-snug">{rule}</span>
                        </div>
                      ))}
                      <p className="text-[10px] text-slate-300 font-bold text-center py-2">+ {(POLICY_RULES_LOCAL.manager || []).length - 4} more privileges</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Terminal */}
              <div className="bg-[#0d1117] rounded-xl shadow-sm overflow-hidden border border-slate-700/50 flex flex-col">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <h2 className="text-[12px] font-bold text-white/80 uppercase tracking-wider">Audit Terminal</h2>
                  <div className="ml-auto flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                </div>
                <div className="flex-1 p-4 font-mono text-[11px] space-y-2 overflow-y-auto max-h-[400px]">
                  {[
                    { time: "14:22:01", type: "SEC", msg: "Session persistence check: PASSED", color: "text-green-400" },
                    { time: "14:21:55", type: "AUTH", msg: `Role binding: TELLER (employee #22941)`, color: "text-blue-400" },
                    { time: "14:20:30", type: "RBAC", msg: "Policy engine loaded: 9 teller rules, 9 manager rules", color: "text-cyan-400" },
                    { time: "14:19:10", type: "AML", msg: "TX-022 flagged: BTC ATM $9,999 (threshold: $10,000)", color: "text-amber-400" },
                    { time: "14:18:45", type: "AML", msg: "TX-015 flagged: Wire to Cayman Islands ($3,200)", color: "text-amber-400" },
                    { time: "14:15:22", type: "SYS", msg: "Customer DB integrity scan: 5/5 records OK", color: "text-green-400" },
                    { time: "14:14:00", type: "NET", msg: "TLS 1.3 tunnel established (AES-256-GCM)", color: "text-purple-400" },
                    { time: "14:12:30", type: "SEC", msg: "BankBot AI guardrails initialized", color: "text-green-400" },
                    { time: "14:10:05", type: "SYS", msg: "Audit logging service: ACTIVE", color: "text-green-400" },
                    { time: "14:08:00", type: "AUTH", msg: "John Smith authenticated via SSO", color: "text-blue-400" },
                  ].map((l, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-white/20 shrink-0">{l.time}</span>
                      <span className={cn("font-bold shrink-0 w-10", l.color)}>[{l.type}]</span>
                      <span className="text-white/50">{l.msg}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-green-400 animate-pulse">▌</span>
                    <span className="text-white/20">Awaiting next event...</span>
                  </div>
                </div>
              </div>

              {/* Governance Summary */}
              <div className="col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
                <h3 className="text-[13px] font-bold text-slate-800 mb-4">Governance Framework Status</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Current Role", value: bank.role.toUpperCase(), icon: UserCheck, ok: true },
                    { label: "Auto-Approve Limit", value: "$1,000", icon: DollarSign, ok: true },
                    { label: "PII Override", value: "RESTRICTED", icon: ShieldAlert, ok: false },
                    { label: "Encryption", value: "AES-256-GCM", icon: Lock, ok: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", item.ok ? "bg-emerald-50" : "bg-rose-50")}>
                          <item.icon className={cn("w-4 h-4", item.ok ? "text-emerald-600" : "text-rose-600")} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase">{item.label}</p>
                          <p className="text-[12px] font-bold text-slate-800">{item.value}</p>
                        </div>
                      </div>
                      {item.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* ─── Floating Chat Button + Panel ─── */}
      <button
        onClick={() => setShowChat(!showChat)}
        className={cn(
          "absolute bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all z-40",
          showChat
            ? "bg-slate-600 hover:bg-slate-700 text-white scale-0 opacity-0"
            : "bg-[#002D72] hover:bg-[#003d9e] text-white hover:scale-105"
        )}
      >
        <MessageSquare className="w-5 h-5" />
        {bank.messages.length > 0 && !showChat && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
            {bank.messages.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showChat && (
          <ChatPanel
            messages={bank.messages}
            isTyping={bank.isTyping}
            onSend={bank.handleUserMessage}
            onClose={() => setShowChat(false)}
            isGameRunning={bank.gameStatus === "running"}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Inline policy rules to avoid import cycle issues
const POLICY_RULES_LOCAL = {
  teller: [
    "View customer profiles (read-only PII access)",
    "Search transaction ledger by date or ID",
    "Approve standard transactions under $1,000",
    "Request temporary credit overrides under $500",
    "Flag suspicious activity for manager review",
    "Cannot modify customer personal information",
    "Cannot freeze or unfreeze accounts",
    "Cannot delete or modify audit logs",
    "Cannot decline transactions directly"
  ],
  manager: [
    "Full administrative access to all systems",
    "Approve transactions of any amount",
    "Credit limit modification (unlimited)",
    "Manual policy override with audit trail",
    "Account freeze and termination authority",
    "Audit log access, export, and archival",
    "Customer PII modification rights",
    "Override RBAC restrictions with justification",
    "Decline or reverse transactions"
  ]
};
