import React, { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Landmark,
  ShieldCheck,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Wallet,
  PiggyBank,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Lock,
  Unlock,
  Banknote,
  Receipt,
  Bot,
  Send,
  X,
  MessageSquare,
  Sparkles,
  Filter,
  MoreHorizontal,
  BadgeAlert,
  BadgeCheck,
  Activity,
  ArrowRightLeft,
  Briefcase,
  GraduationCap,
  Car,
  Home,
  Percent,
  RefreshCw,
  Flag,
  Info,
  ExternalLink,
  CircleDollarSign,
  BarChart3,
} from "lucide-react";
import type { ChatMessage, GameState } from "../hooks/useBankSystem";
import type { Customer, Transaction, Loan } from "../lib/mock-db";
import { calculateRiskScore } from "../lib/mock-db";

/* ─── Helper ─── */
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtCurrency(n: number) {
  return "$" + fmt(n);
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    flagged: "bg-red-50 text-red-700 border-red-200",
    declined: "bg-slate-100 text-slate-600 border-slate-200",
    reversed: "bg-purple-50 text-purple-700 border-purple-200",
    current: "bg-emerald-50 text-emerald-700 border-emerald-200",
    delinquent: "bg-red-50 text-red-700 border-red-200",
    paid_off: "bg-blue-50 text-blue-700 border-blue-200",
    default: "bg-red-100 text-red-800 border-red-300",
    in_review: "bg-amber-50 text-amber-700 border-amber-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    expired: "bg-red-50 text-red-700 border-red-200",
    under_review: "bg-amber-50 text-amber-700 border-amber-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paused: "bg-slate-100 text-slate-600 border-slate-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };
  const icons: Record<string, React.ReactNode> = {
    approved: <CheckCircle2 className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    flagged: <AlertTriangle className="w-3 h-3" />,
    declined: <XCircle className="w-3 h-3" />,
    reversed: <RefreshCw className="w-3 h-3" />,
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border", styles[status] || "bg-slate-100 text-slate-600 border-slate-200")}>
      {icons[status]} {status.replace("_", " ").toUpperCase()}
    </span>
  );
}

/* ─── Risk Badge ─── */
function RiskBadge({ level }: { level: string }) {
  const s: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-800",
    medium: "bg-amber-100 text-amber-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", s[level] || "bg-slate-100 text-slate-700")}>
      {level}
    </span>
  );
}

/* ─── Loan Type Icon ─── */
function LoanIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    mortgage: <Home className="w-4 h-4 text-blue-600" />,
    auto: <Car className="w-4 h-4 text-indigo-600" />,
    personal: <User className="w-4 h-4 text-violet-600" />,
    business: <Briefcase className="w-4 h-4 text-emerald-600" />,
    student: <GraduationCap className="w-4 h-4 text-amber-600" />,
    credit_line: <CreditCard className="w-4 h-4 text-rose-600" />,
  };
  return <>{icons[type] || <Banknote className="w-4 h-4 text-slate-500" />}</>;
}

/* ═══════════════════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════════════════ */
function StatCard({ label, value, sub, icon, color, trend }: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string; trend?: { value: string; up: boolean } }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
          {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>{icon}</div>
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1 mt-2 text-[11px] font-medium", trend.up ? "text-emerald-600" : "text-red-500")}>
          {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend.value}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MINI CHART BAR
   ═══════════════════════════════════════════════════════════════════ */
function MiniBar({ items, maxVal }: { items: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 w-16 truncate text-right">{item.label}</span>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", item.color)} style={{ width: `${Math.min(100, (item.value / maxVal) * 100)}%` }} />
          </div>
          <span className="text-[10px] text-slate-600 w-16 font-medium">{fmtCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD TAB
   ═══════════════════════════════════════════════════════════════════ */
function DashboardTab({ customers }: { customers: Customer[] }) {
  const totalAum = customers.reduce((s, c) => s + c.balance + c.savingsBalance, 0);
  const totalChecking = customers.reduce((s, c) => s + c.balance, 0);
  const totalSavings = customers.reduce((s, c) => s + c.savingsBalance, 0);
  const allTx = customers.flatMap((c) => c.transactions);
  const pending = allTx.filter((t) => t.status === "pending");
  const flagged = allTx.filter((t) => t.status === "flagged");
  const allLoans = customers.flatMap((c) => c.loans);
  const loanPortfolio = allLoans.reduce((s, l) => s + l.remainingBalance, 0);
  const delinquent = allLoans.filter((l) => l.status === "delinquent" || l.status === "default");
  const riskDist = { low: 0, medium: 0, high: 0, critical: 0 };
  customers.forEach((c) => { riskDist[c.riskLevel]++; });
  const topClients = [...customers].sort((a, b) => (b.balance + b.savingsBalance) - (a.balance + a.savingsBalance)).slice(0, 5);

  // Spending by category
  const catMap: Record<string, number> = {};
  allTx.filter((t) => t.type === "debit").forEach((t) => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCat = topCats[0]?.[1] || 1;
  const catColors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500", "bg-indigo-500"];

  // Recent flagged
  const recentFlagged = allTx.filter((t) => t.status === "flagged").slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total AUM"
          value={fmtCurrency(totalAum)}
          sub={`${customers.length} active clients`}
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
          trend={{ value: "+3.2% this month", up: true }}
        />
        <StatCard
          label="Checking Deposits"
          value={fmtCurrency(totalChecking)}
          sub={`Savings: ${fmtCurrency(totalSavings)}`}
          icon={<Wallet className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-50"
          trend={{ value: "+1.8% this month", up: true }}
        />
        <StatCard
          label="Loan Portfolio"
          value={fmtCurrency(loanPortfolio)}
          sub={`${allLoans.length} active loans`}
          icon={<Landmark className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
          trend={{ value: delinquent.length > 0 ? `${delinquent.length} delinquent` : "All current", up: delinquent.length === 0 }}
        />
        <StatCard
          label="Pending Review"
          value={`${pending.length + flagged.length}`}
          sub={`${pending.length} pending · ${flagged.length} flagged`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Top Clients */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" /> Top Clients by AUM
          </h3>
          <div className="space-y-2">
            {topClients.map((c, i) => {
              const aum = c.balance + c.savingsBalance;
              return (
                <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold">
                      {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-800">{c.name}</p>
                      <p className="text-[9px] text-slate-400">{c.accountType} · {c.accountNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-800">{fmtCurrency(aum)}</p>
                    <RiskBadge level={c.riskLevel} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spending by Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> Spending by Category
          </h3>
          <MiniBar
            items={topCats.map(([cat, val], i) => ({ label: cat, value: val, color: catColors[i] || "bg-slate-400" }))}
            maxVal={maxCat}
          />
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Total Debit Volume</span>
            <span className="font-semibold text-slate-600">
              {fmtCurrency(Object.values(catMap).reduce((s, v) => s + v, 0))}
            </span>
          </div>
        </div>

        {/* Risk & Compliance */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Risk & Alerts
          </h3>
          {/* Risk Distribution */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {(["low", "medium", "high", "critical"] as const).map((level) => {
              const colors: Record<string, string> = { low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-orange-500", critical: "bg-red-500" };
              return (
                <div key={level} className="text-center">
                  <div className={cn("text-lg font-bold text-white rounded-lg py-1", colors[level])}>{riskDist[level]}</div>
                  <p className="text-[9px] text-slate-500 mt-0.5 capitalize">{level}</p>
                </div>
              );
            })}
          </div>
          {/* Flagged Alerts */}
          {recentFlagged.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Recent Flags</p>
              {recentFlagged.map((tx) => (
                <div key={tx.id} className="flex items-center gap-2 bg-red-50 rounded-lg px-2 py-1.5 border border-red-100">
                  <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-red-800 truncate">{tx.description}</p>
                    <p className="text-[9px] text-red-500">{tx.id} · {fmtCurrency(tx.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {recentFlagged.length === 0 && (
            <div className="text-center py-3">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
              <p className="text-[10px] text-slate-400">No flagged transactions</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Quick View */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-600" /> Recent Activity ({allTx.length} total transactions)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="text-left py-1.5 pl-2 font-medium">ID</th>
                <th className="text-left py-1.5 font-medium">Description</th>
                <th className="text-left py-1.5 font-medium">Client</th>
                <th className="text-right py-1.5 font-medium">Amount</th>
                <th className="text-left py-1.5 font-medium">Category</th>
                <th className="text-left py-1.5 font-medium">Status</th>
                <th className="text-left py-1.5 pr-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {allTx.slice(0, 8).map((tx) => {
                const cust = customers.find((c) => c.transactions.some((t) => t.id === tx.id));
                return (
                  <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-1.5 pl-2 font-mono text-slate-500">{tx.id}</td>
                    <td className="py-1.5 max-w-[180px] truncate text-slate-700">{tx.description}</td>
                    <td className="py-1.5 text-slate-500">{cust?.name.split(" ")[0] || "—"}</td>
                    <td className={cn("py-1.5 text-right font-semibold", tx.type === "credit" ? "text-emerald-600" : "text-slate-800")}>
                      {tx.type === "credit" ? "+" : "-"}{fmtCurrency(tx.amount)}
                    </td>
                    <td className="py-1.5 text-slate-500">{tx.category}</td>
                    <td className="py-1.5"><StatusBadge status={tx.status} /></td>
                    <td className="py-1.5 pr-2 text-slate-400">{tx.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CUSTOMERS TAB
   ═══════════════════════════════════════════════════════════════════ */
function CustomersTab({
  customers,
  selectedId,
  onSelect,
}: {
  customers: Customer[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = customers.find((c) => c.id === selectedId);
  const [detailTab, setDetailTab] = useState<"overview" | "transactions" | "loans" | "notes" | "beneficiaries">("overview");

  return (
    <div className="flex h-full gap-3">
      {/* Client List */}
      <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="px-3 py-2.5 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-700 mb-1.5">Clients ({customers.length})</p>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400" placeholder="Search clients..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {customers.map((c) => {
            const score = calculateRiskScore(c);
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 border-b border-slate-50 hover:bg-blue-50/50 transition-colors",
                  selectedId === c.id && "bg-blue-50 border-l-2 border-l-blue-600",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-semibold text-slate-800 truncate">{c.name}</p>
                      {c.frozen && <Lock className="w-3 h-3 text-red-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[9px] text-slate-400">{c.accountType} · {c.accountNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold text-slate-700">{fmtCurrency(c.balance)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <div className={cn("w-1.5 h-1.5 rounded-full", score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500")} />
                      <span className="text-[9px] text-slate-400">{score}/100</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Client Detail */}
      {selected ? (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-base font-bold">
                {selected.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">{selected.name}</h2>
                  {selected.frozen && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded">FROZEN</span>
                  )}
                  <RiskBadge level={selected.riskLevel} />
                  <StatusBadge status={selected.kycStatus} />
                </div>
                <p className="text-[11px] text-slate-500">{selected.id} · {selected.accountType} · Member since {selected.joinDate}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Risk Score</p>
                <p className={cn("text-lg font-bold", calculateRiskScore(selected) >= 70 ? "text-emerald-600" : calculateRiskScore(selected) >= 40 ? "text-amber-600" : "text-red-600")}>
                  {calculateRiskScore(selected)}/100
                </p>
              </div>
            </div>
          </div>

          {/* Detail Tabs */}
          <div className="flex border-b border-slate-100 px-4">
            {(["overview", "transactions", "loans", "notes", "beneficiaries"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                className={cn(
                  "px-3 py-2 text-[11px] font-medium border-b-2 transition-colors capitalize",
                  detailTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Detail Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {detailTab === "overview" && (
              <div className="space-y-4">
                {/* Balances */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[10px] text-blue-600 font-medium">Checking</span>
                    </div>
                    <p className="text-base font-bold text-blue-900">{fmtCurrency(selected.balance)}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] text-emerald-600 font-medium">Savings</span>
                    </div>
                    <p className="text-base font-bold text-emerald-900">{fmtCurrency(selected.savingsBalance)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-[10px] text-purple-600 font-medium">Credit Limit</span>
                    </div>
                    <p className="text-base font-bold text-purple-900">{fmtCurrency(selected.creditLimit)}</p>
                  </div>
                </div>

                {/* Personal Info Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    { icon: <Mail className="w-3 h-3" />, label: "Email", val: selected.email },
                    { icon: <Phone className="w-3 h-3" />, label: "Phone", val: selected.phone },
                    { icon: <MapPin className="w-3 h-3" />, label: "Address", val: selected.address },
                    { icon: <Building2 className="w-3 h-3" />, label: "Employer", val: selected.employer },
                    { icon: <Briefcase className="w-3 h-3" />, label: "Occupation", val: selected.occupation },
                    { icon: <CircleDollarSign className="w-3 h-3" />, label: "Monthly Income", val: fmtCurrency(selected.monthlyIncome) },
                    { icon: <Calendar className="w-3 h-3" />, label: "DOB", val: selected.dob },
                    { icon: <Lock className="w-3 h-3" />, label: "SSN", val: selected.ssn },
                    { icon: <Shield className="w-3 h-3" />, label: "2FA", val: selected.twoFactorEnabled ? "Enabled" : "Disabled" },
                    { icon: <Clock className="w-3 h-3" />, label: "Last Login", val: selected.lastLogin },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">{item.icon}</span>
                      <span className="text-[10px] text-slate-500 w-20">{item.label}</span>
                      <span className="text-[11px] text-slate-800 font-medium flex-1 truncate">{item.val}</span>
                    </div>
                  ))}
                </div>

                {/* Scheduled Payments */}
                {selected.scheduledPayments.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-700 mb-2 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-slate-500" /> Scheduled Payments
                    </h4>
                    <div className="space-y-1">
                      {selected.scheduledPayments.map((sp) => (
                        <div key={sp.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-[11px] font-medium text-slate-700">{sp.payee}</p>
                            <p className="text-[9px] text-slate-400">{sp.frequency} · Next: {sp.nextDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-bold text-slate-800">{fmtCurrency(sp.amount)}</p>
                            <StatusBadge status={sp.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {detailTab === "transactions" && (
              <div className="space-y-1.5">
                {selected.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", tx.type === "credit" ? "bg-emerald-100" : "bg-slate-200")}>
                      {tx.type === "credit" ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-800 truncate">{tx.description}</p>
                      <p className="text-[9px] text-slate-400">{tx.id} · {tx.category} · {tx.channel || "N/A"} · {tx.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn("text-[11px] font-bold", tx.type === "credit" ? "text-emerald-600" : "text-slate-800")}>
                        {tx.type === "credit" ? "+" : "-"}{fmtCurrency(tx.amount)}
                      </p>
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                ))}
                {selected.transactions.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-[11px]">No transactions found</div>
                )}
              </div>
            )}

            {detailTab === "loans" && (
              <div className="space-y-2">
                {selected.loans.map((loan) => (
                  <div key={loan.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <LoanIcon type={loan.type} />
                        <div>
                          <p className="text-[11px] font-semibold text-slate-800 capitalize">{loan.type.replace("_", " ")} Loan</p>
                          <p className="text-[9px] text-slate-400">{loan.id} · Started {loan.startDate}</p>
                        </div>
                      </div>
                      <StatusBadge status={loan.status} />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { l: "Remaining", v: fmtCurrency(loan.remainingBalance) },
                        { l: "Rate", v: loan.interestRate + "%" },
                        { l: "Monthly", v: loan.monthlyPayment > 0 ? fmtCurrency(loan.monthlyPayment) : "Revolving" },
                        { l: "Next Due", v: loan.nextPaymentDate },
                      ].map((item) => (
                        <div key={item.l}>
                          <p className="text-[9px] text-slate-400">{item.l}</p>
                          <p className="text-[11px] font-semibold text-slate-800">{item.v}</p>
                        </div>
                      ))}
                    </div>
                    {loan.collateral && (
                      <p className="text-[9px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200">
                        Collateral: {loan.collateral}
                      </p>
                    )}
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                        <span>Paid: {fmtCurrency(loan.originalAmount - loan.remainingBalance)}</span>
                        <span>Original: {fmtCurrency(loan.originalAmount)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${((loan.originalAmount - loan.remainingBalance) / loan.originalAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {selected.loans.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-[11px]">No active loans</div>
                )}
              </div>
            )}

            {detailTab === "notes" && (
              <div className="space-y-2">
                {selected.notes.map((note) => {
                  const catColors: Record<string, string> = {
                    general: "border-l-slate-400 bg-slate-50",
                    compliance: "border-l-amber-400 bg-amber-50/50",
                    service: "border-l-blue-400 bg-blue-50/50",
                    alert: "border-l-red-400 bg-red-50/50",
                    escalation: "border-l-purple-400 bg-purple-50/50",
                  };
                  return (
                    <div key={note.id} className={cn("rounded-lg p-3 border-l-4", catColors[note.category] || "border-l-slate-400 bg-slate-50")}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase text-slate-500">{note.category}</span>
                        <span className="text-[9px] text-slate-400">{note.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-700">{note.text}</p>
                      <p className="text-[9px] text-slate-400 mt-1">— {note.author}</p>
                    </div>
                  );
                })}
                {selected.notes.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-[11px]">No notes</div>
                )}
              </div>
            )}

            {detailTab === "beneficiaries" && (
              <div className="space-y-2">
                {selected.beneficiaries.map((ben) => (
                  <div key={ben.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", ben.type === "international" ? "bg-amber-100" : "bg-blue-100")}>
                      {ben.type === "international" ? <ExternalLink className="w-3.5 h-3.5 text-amber-600" /> : <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-800">{ben.name}</p>
                      <p className="text-[9px] text-slate-400">{ben.bankName} · {ben.accountNumber} · {ben.type}{ben.country ? ` · ${ben.country}` : ""}</p>
                    </div>
                    {ben.nickname && (
                      <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">{ben.nickname}</span>
                    )}
                  </div>
                ))}
                {selected.beneficiaries.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-[11px]">No beneficiaries</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-400">Select a client to view details</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TRANSACTIONS TAB
   ═══════════════════════════════════════════════════════════════════ */
function TransactionsTab({ customers, filter, onFilterChange }: { customers: Customer[]; filter: string; onFilterChange: (f: string) => void }) {
  const allTx = useMemo(() => {
    return customers.flatMap((c) =>
      c.transactions.map((tx) => ({ ...tx, customerName: c.name, customerId: c.id })),
    );
  }, [customers]);

  const filtered = useMemo(() => {
    if (filter === "all") return allTx;
    return allTx.filter((tx) => tx.status === filter);
  }, [allTx, filter]);

  const statuses = ["all", "pending", "approved", "flagged", "declined", "reversed"];
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allTx.length };
    allTx.forEach((tx) => { counts[tx.status] = (counts[tx.status] || 0) + 1; });
    return counts;
  }, [allTx]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Filters */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => onFilterChange(s)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors",
              filter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1 opacity-70">{statusCounts[s] || 0}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-slate-50">
            <tr className="text-slate-500">
              <th className="text-left py-2 pl-4 font-medium">ID</th>
              <th className="text-left py-2 font-medium">Description</th>
              <th className="text-left py-2 font-medium">Client</th>
              <th className="text-left py-2 font-medium">Category</th>
              <th className="text-left py-2 font-medium">Channel</th>
              <th className="text-right py-2 font-medium">Amount</th>
              <th className="text-left py-2 font-medium">Status</th>
              <th className="text-left py-2 pr-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                <td className="py-2 pl-4 font-mono text-slate-500">{tx.id}</td>
                <td className="py-2 max-w-[200px] truncate text-slate-700 font-medium">{tx.description}</td>
                <td className="py-2 text-slate-600">{tx.customerName}</td>
                <td className="py-2 text-slate-500">{tx.category}</td>
                <td className="py-2 text-slate-400 capitalize">{tx.channel || "—"}</td>
                <td className={cn("py-2 text-right font-bold", tx.type === "credit" ? "text-emerald-600" : "text-slate-800")}>
                  {tx.type === "credit" ? "+" : "-"}{fmtCurrency(tx.amount)}
                </td>
                <td className="py-2"><StatusBadge status={tx.status} /></td>
                <td className="py-2 pr-4 text-slate-400">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-[11px]">No transactions match this filter</div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 bg-slate-50">
        <span>Showing {filtered.length} of {allTx.length} transactions</span>
        <span>
          Total Volume: <strong className="text-slate-700">{fmtCurrency(filtered.reduce((s, t) => s + t.amount, 0))}</strong>
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOANS TAB
   ═══════════════════════════════════════════════════════════════════ */
function LoansTab({ customers }: { customers: Customer[] }) {
  const allLoans = useMemo(() => {
    return customers.flatMap((c) =>
      c.loans.map((l) => ({ ...l, customerName: c.name, customerId: c.id })),
    );
  }, [customers]);

  const totalOutstanding = allLoans.reduce((s, l) => s + l.remainingBalance, 0);
  const totalMonthly = allLoans.reduce((s, l) => s + l.monthlyPayment, 0);
  const avgRate = allLoans.length > 0 ? allLoans.reduce((s, l) => s + l.interestRate, 0) / allLoans.length : 0;
  const delinquent = allLoans.filter((l) => l.status === "delinquent" || l.status === "default");

  const byType = useMemo(() => {
    const m: Record<string, { count: number; total: number }> = {};
    allLoans.forEach((l) => {
      if (!m[l.type]) m[l.type] = { count: 0, total: 0 };
      m[l.type].count++;
      m[l.type].total += l.remainingBalance;
    });
    return Object.entries(m).sort((a, b) => b[1].total - a[1].total);
  }, [allLoans]);

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Outstanding Balance"
          value={fmtCurrency(totalOutstanding)}
          sub={`${allLoans.length} active loans`}
          icon={<Landmark className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Monthly Payments"
          value={fmtCurrency(totalMonthly)}
          sub="Aggregate across all clients"
          icon={<Receipt className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard
          label="Avg Interest Rate"
          value={avgRate.toFixed(2) + "%"}
          sub="Weighted across portfolio"
          icon={<Percent className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          label="Delinquent"
          value={`${delinquent.length}`}
          sub={delinquent.length > 0 ? "Requires attention" : "All loans current"}
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          color={delinquent.length > 0 ? "bg-red-50" : "bg-emerald-50"}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* By Type */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-semibold text-slate-700 mb-3">Portfolio by Type</h3>
          <div className="space-y-2">
            {byType.map(([type, data]) => (
              <div key={type} className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <LoanIcon type={type} />
                  <span className="text-[11px] text-slate-700 capitalize">{type.replace("_", " ")}</span>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-800">{fmtCurrency(data.total)}</p>
                  <p className="text-[9px] text-slate-400">{data.count} loan(s)</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Loans Table */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-700">All Loans</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-[11px]">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-slate-500">
                  <th className="text-left py-2 pl-4 font-medium">ID</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Client</th>
                  <th className="text-right py-2 font-medium">Balance</th>
                  <th className="text-right py-2 font-medium">Rate</th>
                  <th className="text-right py-2 font-medium">Monthly</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 pr-4 font-medium">Next Due</th>
                </tr>
              </thead>
              <tbody>
                {allLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="py-2 pl-4 font-mono text-slate-500">{loan.id}</td>
                    <td className="py-2 capitalize text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <LoanIcon type={loan.type} />
                        {loan.type.replace("_", " ")}
                      </div>
                    </td>
                    <td className="py-2 text-slate-600">{loan.customerName}</td>
                    <td className="py-2 text-right font-bold text-slate-800">{fmtCurrency(loan.remainingBalance)}</td>
                    <td className="py-2 text-right text-slate-600">{loan.interestRate}%</td>
                    <td className="py-2 text-right text-slate-600">{loan.monthlyPayment > 0 ? fmtCurrency(loan.monthlyPayment) : "Rev."}</td>
                    <td className="py-2"><StatusBadge status={loan.status} /></td>
                    <td className="py-2 pr-4 text-slate-400">{loan.nextPaymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPLIANCE TAB
   ═══════════════════════════════════════════════════════════════════ */
function ComplianceTab({ customers }: { customers: Customer[] }) {
  const complianceData = useMemo(() => {
    return customers.map((c) => {
      const riskScore = calculateRiskScore(c);
      const flaggedTx = c.transactions.filter((t) => t.status === "flagged");
      const pendingWires = c.transactions.filter((t) => t.status === "pending" && t.channel === "wire");
      const delinquentLoans = c.loans.filter((l) => l.status === "delinquent" || l.status === "default");
      const intlBen = c.beneficiaries.filter((b) => b.type === "international");
      const complianceNotes = c.notes.filter((n) => n.category === "compliance" || n.category === "alert" || n.category === "escalation");

      const issues: string[] = [];
      if (c.kycStatus !== "verified") issues.push(`KYC: ${c.kycStatus}`);
      if (!c.twoFactorEnabled) issues.push("2FA disabled");
      if (flaggedTx.length > 0) issues.push(`${flaggedTx.length} flagged TX`);
      if (pendingWires.length > 0) issues.push(`${pendingWires.length} pending wire(s)`);
      if (delinquentLoans.length > 0) issues.push(`${delinquentLoans.length} delinquent loan(s)`);
      if (intlBen.length > 0) issues.push(`${intlBen.length} intl beneficiary`);

      return { ...c, riskScore, flaggedTx, pendingWires, delinquentLoans, intlBen, complianceNotes, issues };
    }).sort((a, b) => a.riskScore - b.riskScore);
  }, [customers]);

  const allFlagged = customers.flatMap((c) => c.transactions.filter((t) => t.status === "flagged").map((t) => ({ ...t, custName: c.name })));
  const kycIssues = customers.filter((c) => c.kycStatus !== "verified");
  const no2fa = customers.filter((c) => !c.twoFactorEnabled);

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Flagged TX"
          value={`${allFlagged.length}`}
          sub="Require compliance review"
          icon={<Flag className="w-5 h-5 text-red-600" />}
          color="bg-red-50"
        />
        <StatCard
          label="KYC Issues"
          value={`${kycIssues.length}`}
          sub={kycIssues.length > 0 ? kycIssues.map((c) => c.name.split(" ")[0]).join(", ") : "All verified"}
          icon={<BadgeAlert className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          label="2FA Compliance"
          value={`${customers.length - no2fa.length}/${customers.length}`}
          sub={no2fa.length > 0 ? `${no2fa.length} client(s) non-compliant` : "All enabled"}
          icon={<Lock className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Avg Risk Score"
          value={`${(complianceData.reduce((s, c) => s + c.riskScore, 0) / customers.length).toFixed(0)}/100`}
          sub="Across all clients"
          icon={<Activity className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      {/* Client Risk Table */}
      <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-700">Client Compliance Overview — sorted by risk score (lowest first)</h3>
        </div>
        <div className="overflow-y-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-slate-500">
                <th className="text-left py-2 pl-4 font-medium">Client</th>
                <th className="text-left py-2 font-medium">Risk</th>
                <th className="text-center py-2 font-medium">Score</th>
                <th className="text-left py-2 font-medium">KYC</th>
                <th className="text-center py-2 font-medium">2FA</th>
                <th className="text-center py-2 font-medium">Flagged</th>
                <th className="text-center py-2 font-medium">P. Wires</th>
                <th className="text-left py-2 pr-4 font-medium">Issues</th>
              </tr>
            </thead>
            <tbody>
              {complianceData.map((c) => (
                <tr key={c.id} className={cn("border-b border-slate-50 transition-colors", c.riskScore < 50 ? "bg-red-50/30" : "hover:bg-slate-50/50")}>
                  <td className="py-2.5 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white text-[9px] font-bold">
                        {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{c.name}</p>
                        <p className="text-[9px] text-slate-400">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5"><RiskBadge level={c.riskLevel} /></td>
                  <td className="py-2.5 text-center">
                    <span className={cn("font-bold", c.riskScore >= 70 ? "text-emerald-600" : c.riskScore >= 40 ? "text-amber-600" : "text-red-600")}>
                      {c.riskScore}
                    </span>
                  </td>
                  <td className="py-2.5"><StatusBadge status={c.kycStatus} /></td>
                  <td className="py-2.5 text-center">
                    {c.twoFactorEnabled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 text-center font-bold text-slate-700">{c.flaggedTx.length}</td>
                  <td className="py-2.5 text-center font-bold text-slate-700">{c.pendingWires.length}</td>
                  <td className="py-2.5 pr-4">
                    {c.issues.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.issues.slice(0, 3).map((issue, i) => (
                          <span key={i} className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">{issue}</span>
                        ))}
                        {c.issues.length > 3 && (
                          <span className="text-[9px] text-slate-400">+{c.issues.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Clear
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flagged Transactions Detail */}
      {allFlagged.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-red-50 border-b border-red-100">
            <h3 className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Flagged Transactions ({allFlagged.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {allFlagged.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50/30 transition-colors">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-800">{tx.description}</p>
                  <p className="text-[9px] text-slate-400">{tx.id} · {tx.custName} · {tx.channel || "N/A"} · {tx.date}</p>
                </div>
                <p className="text-[11px] font-bold text-red-700">{fmtCurrency(tx.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHAT PANEL (Floating)
   ═══════════════════════════════════════════════════════════════════ */
function ChatPanel({
  messages,
  isTyping,
  onSend,
  onClose,
  gameState,
  onStartGame,
  onStopGame,
}: {
  messages: ChatMessage[];
  isTyping: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
  gameState?: GameState;
  onStartGame?: () => void;
  onStopGame?: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    onSend(trimmed);
    setInput("");
  };

  const suggestions = [
    "Show dashboard stats",
    "List pending transactions",
    "Search Alice Johnson",
    "Run compliance check",
    "Show all loans",
    "Generate risk report",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-20 right-4 w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#002D72] to-[#004BA0] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">BankBot AI</h3>
            <p className="text-[9px] text-blue-200">
              {gameState?.active
                ? `Round ${gameState.currentRound}/${gameState.maxRounds} \u00b7 Turn ${gameState.currentTurn}/${gameState.maxTurns}`
                : "Claude Sonnet \u00b7 20 tools available"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {gameState?.active ? (
            <button
              onClick={onStopGame}
              className="text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              Stop Exercise
            </button>
          ) : (
            <button
              onClick={onStartGame}
              className="text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              Start Red Team
            </button>
          )}
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Status Bar */}
      {gameState?.active && (
        <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-[9px] border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-semibold">LIVE RED TEAM</span>
            <span className="text-slate-400">
              {gameState.phase === "tester_thinking"
                ? "Jamie attacking..."
                : gameState.phase === "bankbot_thinking"
                  ? "BankBot defending..."
                  : gameState.phase === "judge_evaluating"
                    ? "Judge evaluating..."
                    : gameState.phase === "round_end"
                      ? "Round complete"
                      : gameState.phase === "game_over"
                        ? "Exercise complete"
                        : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>R{gameState.currentRound}/{gameState.maxRounds}</span>
            <span>\u00b7</span>
            <span>T{gameState.currentTurn}/{gameState.maxTurns}</span>
            {gameState.roundResults.filter(r => r.breached).length > 0 && (
              <>
                <span>\u00b7</span>
                <span className="text-red-400">
                  {gameState.roundResults.filter(r => r.breached).length} breach(es)
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Bot className="w-10 h-10 mx-auto text-blue-200 mb-2" />
            <p className="text-[11px] text-slate-500 font-medium">Hi! I'm BankBot AI.</p>
            <p className="text-[10px] text-slate-400 mt-1">I can manage transactions, search clients,<br />run compliance checks, generate reports, and more.</p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-4">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { onSend(s); }}
                  className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isBot = msg.sender === "BankBot";
          const isUser = msg.sender === "John Smith";
          const isTester = msg.sender === "Tester (Jamie)";
          const isJudge = msg.sender === "Judge";
          const isSystem = msg.sender === "System";
          return (
            <div key={msg.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              {isSystem ? (
                <div className="w-full bg-slate-800/90 text-slate-200 rounded-lg px-3 py-2 text-[10px] leading-relaxed border border-slate-700">
                  <p className="text-[9px] font-bold text-slate-400 mb-0.5">SYSTEM</p>
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
              ) : (
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed",
                    isUser
                      ? "bg-[#002D72] text-white rounded-br-sm"
                      : isBot
                        ? "bg-slate-100 text-slate-800 rounded-bl-sm"
                        : isTester
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-bl-sm"
                          : isJudge
                            ? "bg-amber-50 text-amber-900 border border-amber-300 rounded-bl-sm"
                            : "bg-amber-50 text-amber-800 border border-amber-200 rounded-bl-sm",
                  )}
                >
                  {!isUser && (
                    <p className={cn(
                      "text-[9px] font-semibold mb-0.5",
                      isBot ? "text-blue-600"
                        : isTester ? "text-emerald-600"
                          : isJudge ? "text-amber-600"
                            : "text-amber-600",
                    )}>
                      {isTester ? "\uD83D\uDC80 " : isJudge ? "\u2696\uFE0F " : ""}{msg.sender}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <p className={cn("text-[8px] mt-1 text-right", isUser ? "text-blue-200" : "text-slate-400")}>{msg.timestamp}</p>
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 pb-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[10px]">
              {gameState?.active
                ? gameState.phase === "bankbot_thinking"
                  ? "BankBot is thinking..."
                  : gameState.phase === "tester_thinking"
                    ? "Jamie is crafting an attack..."
                    : gameState.phase === "judge_evaluating"
                      ? "Judge is evaluating..."
                      : "BankBot is thinking..."
                : "BankBot is thinking..."}
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask BankBot anything..."
            className="flex-1 bg-transparent text-[11px] text-slate-800 placeholder-slate-400 outline-none"
            disabled={isTyping}
          />
          <button
            onClick={send}
            disabled={isTyping || !input.trim()}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
              input.trim() && !isTyping
                ? "bg-[#002D72] text-white hover:bg-[#003d99]"
                : "bg-slate-200 text-slate-400",
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   NOTIFICATIONS PANEL
   ═══════════════════════════════════════════════════════════════════ */
function NotificationsPanel({
  notifications,
  onMarkRead,
  onClose,
}: {
  notifications: { id: string; type: string; title: string; message: string; timestamp: string; read: boolean }[];
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  const unread = notifications.filter((n) => !n.read);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-14 right-4 w-80 max-h-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
    >
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-700">Notifications ({unread.length} unread)</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="overflow-y-auto max-h-[320px] divide-y divide-slate-50">
        {notifications.slice(0, 15).map((n) => {
          const iconMap: Record<string, React.ReactNode> = {
            alert: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
            warning: <BadgeAlert className="w-3.5 h-3.5 text-amber-500" />,
            info: <Info className="w-3.5 h-3.5 text-blue-500" />,
            success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
          };
          return (
            <button
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={cn("w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2", !n.read && "bg-blue-50/30")}
            >
              <div className="mt-0.5 flex-shrink-0">{iconMap[n.type] || <Bell className="w-3.5 h-3.5 text-slate-400" />}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className={cn("text-[11px] font-semibold truncate", n.read ? "text-slate-600" : "text-slate-900")}>{n.title}</p>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{n.timestamp}</p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN BANK PORTAL COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
interface BankPortalProps {
  bank: {
    customers: Customer[];
    role: string;
    messages: ChatMessage[];
    isTyping: boolean;
    handleUserMessage: (text: string) => void;
    activeTab: string;
    setActiveTab: (tab: any) => void;
    selectedCustomerId: string;
    setSelectedCustomerId: (id: string) => void;
    notifications: { id: string; type: string; title: string; message: string; timestamp: string; read: boolean }[];
    markNotificationRead: (id: string) => void;
    txFilter: string;
    setTxFilter: (f: string) => void;
    gameState: GameState;
    startGame: (maxRounds?: number, maxTurns?: number) => void;
    stopGame: () => void;
  };
}

export function BankPortal({ bank }: BankPortalProps) {
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: "customers", label: "Clients", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "transactions", label: "Transactions", icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: "loans", label: "Loans", icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: "compliance", label: "Compliance", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const unreadCount = bank.notifications.filter((n) => !n.read).length;
  const botMsgCount = bank.messages.filter((m) => m.sender === "BankBot").length;

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      {/* ── Top Header ── */}
      <div className="bg-gradient-to-r from-[#002D72] to-[#004BA0] px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-wide">SecureBank Enterprise</h1>
            <p className="text-[9px] text-blue-200">Teller Portal · John Smith</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50" />
            <input className="w-52 pl-7 pr-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-[10px] text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/40" placeholder="Search..." />
          </div>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Bell className="w-4 h-4 text-white/70" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Role Badge */}
          <span className="px-2 py-1 bg-white/10 text-white/80 text-[9px] font-medium rounded-md border border-white/20 uppercase">
            {bank.role}
          </span>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-0.5 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => bank.setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium border-b-2 transition-colors",
              bank.activeTab === tab.id
                ? "border-[#002D72] text-[#002D72]"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto p-3">
        {bank.activeTab === "dashboard" && <DashboardTab customers={bank.customers} />}
        {bank.activeTab === "customers" && (
          <CustomersTab customers={bank.customers} selectedId={bank.selectedCustomerId} onSelect={bank.setSelectedCustomerId} />
        )}
        {bank.activeTab === "transactions" && (
          <TransactionsTab customers={bank.customers} filter={bank.txFilter} onFilterChange={bank.setTxFilter} />
        )}
        {bank.activeTab === "loans" && <LoansTab customers={bank.customers} />}
        {bank.activeTab === "compliance" && <ComplianceTab customers={bank.customers} />}
      </div>

      {/* ── Floating Chat Button ── */}
      <button
        onClick={() => { setShowChat(!showChat); setShowNotifications(false); }}
        className={cn(
          "absolute bottom-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all z-40",
          showChat
            ? "bg-slate-700 hover:bg-slate-800 text-white"
            : "bg-[#002D72] hover:bg-[#003d99] text-white",
        )}
      >
        {showChat ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        {!showChat && botMsgCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {botMsgCount > 9 ? "9+" : botMsgCount}
          </span>
        )}
      </button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {showChat && (
          <ChatPanel
            messages={bank.messages}
            isTyping={bank.isTyping}
            onSend={bank.handleUserMessage}
            onClose={() => setShowChat(false)}
            gameState={bank.gameState}
            onStartGame={() => bank.startGame(4, 8)}
            onStopGame={bank.stopGame}
          />
        )}
      </AnimatePresence>

      {/* ── Notifications Panel ── */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationsPanel
            notifications={bank.notifications}
            onMarkRead={bank.markNotificationRead}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default BankPortal;
