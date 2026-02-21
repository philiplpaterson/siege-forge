/* ═══════════════════════════════════════════════════════════════════
   MOCK DATABASE — SecureBank Enterprise Banking System
   Rich data layer with customers, transactions, loans, notes,
   beneficiaries, scheduled payments, and compliance data.
   ═══════════════════════════════════════════════════════════════════ */

// ─── Core Types ───

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  status: "pending" | "approved" | "flagged" | "declined" | "reversed";
  date: string;
  type: "debit" | "credit";
  category: string;
  channel?: "online" | "branch" | "atm" | "mobile" | "wire" | "ach";
  merchant?: string;
  location?: string;
  reference?: string;
}

export interface Loan {
  id: string;
  type: "mortgage" | "auto" | "personal" | "business" | "student" | "credit_line";
  originalAmount: number;
  remainingBalance: number;
  interestRate: number;
  monthlyPayment: number;
  nextPaymentDate: string;
  status: "current" | "delinquent" | "paid_off" | "default" | "in_review";
  startDate: string;
  term: number; // months
  collateral?: string;
}

export interface CustomerNote {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  category: "general" | "compliance" | "service" | "alert" | "escalation";
}

export interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  type: "domestic" | "international";
  nickname?: string;
  country?: string;
}

export interface ScheduledPayment {
  id: string;
  payee: string;
  amount: number;
  frequency: "one-time" | "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  nextDate: string;
  status: "active" | "paused" | "completed" | "failed";
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  accountType: "Private Client" | "Business" | "Standard" | "Premium" | "Wealth Management";
  creditLimit: number;
  balance: number;
  savingsBalance: number;
  accountNumber: string;
  routingNumber: string;
  joinDate: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  kycStatus: "verified" | "pending" | "expired" | "under_review";
  frozen: boolean;
  transactions: Transaction[];
  loans: Loan[];
  notes: CustomerNote[];
  beneficiaries: Beneficiary[];
  scheduledPayments: ScheduledPayment[];
  occupation: string;
  employer: string;
  monthlyIncome: number;
  dob: string;
  ssn: string; // masked
  lastLogin: string;
  twoFactorEnabled: boolean;
  avatarUrl?: string;
}

// ─── Mock Customer Data ───

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "CUST-0842-X",
    name: "Alice Johnson",
    email: "alice.johnson@jpm.net",
    phone: "+1 (555) 010-8822",
    address: "742 Evergreen Terrace, Springfield, IL 62704",
    accountType: "Private Client",
    creditLimit: 25000,
    balance: 142500.82,
    savingsBalance: 85200.0,
    accountNumber: "****4821",
    routingNumber: "021000021",
    joinDate: "2019-03-15",
    riskLevel: "low",
    kycStatus: "verified",
    frozen: false,
    occupation: "VP of Operations",
    employer: "TechCorp International",
    monthlyIncome: 18500,
    dob: "1985-**-**",
    ssn: "***-**-4821",
    lastLogin: "2026-02-21 09:14 AM",
    twoFactorEnabled: true,
    transactions: [
      { id: "TX-001", amount: 120.45, description: "Whole Foods Market #10182", status: "approved", date: "2026-02-18", type: "debit", category: "Groceries", channel: "mobile", merchant: "Whole Foods", location: "Springfield, IL" },
      { id: "TX-002", amount: 2500.0, description: "Binance Exchange - Crypto Purchase", status: "pending", date: "2026-02-20", type: "debit", category: "Crypto", channel: "online", merchant: "Binance" },
      { id: "TX-005", amount: 45.2, description: "Starbucks #14522 - NYC", status: "approved", date: "2026-02-21", type: "debit", category: "Dining", channel: "mobile", merchant: "Starbucks", location: "New York, NY" },
      { id: "TX-006", amount: 890.0, description: "Apple Store Fifth Ave", status: "approved", date: "2026-02-22", type: "debit", category: "Retail", channel: "branch", merchant: "Apple", location: "New York, NY" },
      { id: "TX-015", amount: 3200.0, description: "Wire Transfer - Cayman Islands", status: "flagged", date: "2026-02-21", type: "debit", category: "Transfer", channel: "wire", location: "Cayman Islands", reference: "WR-9928371" },
      { id: "TX-016", amount: 15000.0, description: "Payroll Deposit - TechCorp International", status: "approved", date: "2026-02-15", type: "credit", category: "Income", channel: "ach" },
      { id: "TX-025", amount: 234.5, description: "Target Store #2281", status: "approved", date: "2026-02-17", type: "debit", category: "Retail", channel: "mobile", merchant: "Target", location: "Springfield, IL" },
      { id: "TX-033", amount: 1800.0, description: "Mortgage Payment - Wells Fargo", status: "approved", date: "2026-02-01", type: "debit", category: "Housing", channel: "ach" },
      { id: "TX-034", amount: 425.0, description: "Nordstrom Online", status: "approved", date: "2026-02-12", type: "debit", category: "Retail", channel: "online", merchant: "Nordstrom" },
      { id: "TX-035", amount: 62.3, description: "Shell Gas Station #221", status: "approved", date: "2026-02-19", type: "debit", category: "Gas", channel: "mobile", merchant: "Shell", location: "Springfield, IL" },
    ],
    loans: [
      { id: "LN-001", type: "mortgage", originalAmount: 450000, remainingBalance: 312000, interestRate: 3.25, monthlyPayment: 1800, nextPaymentDate: "2026-03-01", status: "current", startDate: "2020-06-15", term: 360, collateral: "742 Evergreen Terrace" },
      { id: "LN-006", type: "auto", originalAmount: 35000, remainingBalance: 18200, interestRate: 4.5, monthlyPayment: 650, nextPaymentDate: "2026-03-01", status: "current", startDate: "2023-01-10", term: 60, collateral: "2024 Tesla Model 3" },
    ],
    notes: [
      { id: "N-A1", text: "Preferred client. Annual review completed Jan 2026 — all metrics positive.", author: "Sarah Chen (RM)", timestamp: "2026-01-15 10:30", category: "general" },
      { id: "N-A2", text: "Wire to Cayman Islands flagged by AML. Client states it is a real estate deposit. Awaiting documentation.", author: "John Smith", timestamp: "2026-02-21 14:22", category: "compliance" },
    ],
    beneficiaries: [
      { id: "BEN-01", name: "TechCorp 401k", bankName: "Fidelity", accountNumber: "****7721", routingNumber: "011000015", type: "domestic", nickname: "Retirement" },
      { id: "BEN-02", name: "Grand Cayman Realty Ltd", bankName: "Cayman National Bank", accountNumber: "****3391", routingNumber: "N/A", type: "international", country: "Cayman Islands" },
    ],
    scheduledPayments: [
      { id: "SP-01", payee: "Wells Fargo Mortgage", amount: 1800, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Housing" },
      { id: "SP-02", payee: "Tesla Finance", amount: 650, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Auto" },
      { id: "SP-03", payee: "ComEd Electric", amount: 185, frequency: "monthly", nextDate: "2026-03-05", status: "active", category: "Utilities" },
    ],
  },
  {
    id: "CUST-9921-A",
    name: "Robert M. Smith",
    email: "robert.smith@consulting.org",
    phone: "+1 (555) 123-4567",
    address: "123 Wall Street, New York, NY 10005",
    accountType: "Business",
    creditLimit: 150000,
    balance: 892000.45,
    savingsBalance: 250000.0,
    accountNumber: "****7732",
    routingNumber: "021000021",
    joinDate: "2017-08-22",
    riskLevel: "low",
    kycStatus: "verified",
    frozen: false,
    occupation: "Managing Partner",
    employer: "Smith & Associates Consulting",
    monthlyIncome: 45000,
    dob: "1972-**-**",
    ssn: "***-**-7732",
    lastLogin: "2026-02-21 08:30 AM",
    twoFactorEnabled: true,
    transactions: [
      { id: "TX-003", amount: 45.5, description: "Blue Bottle Coffee - Tribeca", status: "approved", date: "2026-02-19", type: "debit", category: "Dining", channel: "mobile", merchant: "Blue Bottle Coffee", location: "New York, NY" },
      { id: "TX-004", amount: 8000.0, description: "Rolex Boutique - Fifth Ave", status: "pending", date: "2026-02-21", type: "debit", category: "Luxury", channel: "branch", merchant: "Rolex", location: "New York, NY" },
      { id: "TX-007", amount: 12500.0, description: "Internal Transfer - Savings", status: "approved", date: "2026-02-22", type: "credit", category: "Transfer", channel: "online" },
      { id: "TX-017", amount: 340.0, description: "Amazon Business Prime", status: "approved", date: "2026-02-20", type: "debit", category: "Business", channel: "online", merchant: "Amazon" },
      { id: "TX-018", amount: 55000.0, description: "Commercial Lease Payment Q1", status: "approved", date: "2026-02-01", type: "debit", category: "Business", channel: "ach" },
      { id: "TX-026", amount: 1250.0, description: "Client Dinner - Nobu NYC", status: "approved", date: "2026-02-19", type: "debit", category: "Entertainment", channel: "mobile", merchant: "Nobu", location: "New York, NY" },
      { id: "TX-036", amount: 4200.0, description: "Quarterly Tax Payment - IRS", status: "approved", date: "2026-01-15", type: "debit", category: "Tax", channel: "ach" },
      { id: "TX-037", amount: 175000.0, description: "Client Invoice Payment - Acme Corp", status: "approved", date: "2026-02-10", type: "credit", category: "Income", channel: "wire", reference: "INV-2026-0214" },
      { id: "TX-038", amount: 2100.0, description: "American Express Business Platinum", status: "pending", date: "2026-02-22", type: "debit", category: "Business", channel: "ach" },
    ],
    loans: [
      { id: "LN-002", type: "business", originalAmount: 500000, remainingBalance: 347500, interestRate: 5.75, monthlyPayment: 8900, nextPaymentDate: "2026-03-01", status: "current", startDate: "2022-03-01", term: 84 },
      { id: "LN-007", type: "credit_line", originalAmount: 200000, remainingBalance: 42000, interestRate: 7.25, monthlyPayment: 0, nextPaymentDate: "2026-03-15", status: "current", startDate: "2021-09-01", term: 0 },
    ],
    notes: [
      { id: "N-B1", text: "High-value business client. Relationship since 2017. Annual revenue $3M+. Excellent payment history.", author: "Mark Davis (RM)", timestamp: "2026-01-05 09:00", category: "general" },
      { id: "N-B2", text: "Requested increase in business credit line to $300k. Under review by credit committee.", author: "John Smith", timestamp: "2026-02-18 11:15", category: "service" },
    ],
    beneficiaries: [
      { id: "BEN-03", name: "Smith & Associates Payroll", bankName: "Chase", accountNumber: "****2288", routingNumber: "021000021", type: "domestic", nickname: "Payroll" },
      { id: "BEN-04", name: "IRS Payment", bankName: "US Treasury", accountNumber: "****0001", routingNumber: "051000033", type: "domestic" },
    ],
    scheduledPayments: [
      { id: "SP-04", payee: "SBA Loan Repayment", amount: 8900, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Loan" },
      { id: "SP-05", payee: "Office Lease - 123 Wall St", amount: 18500, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Business" },
    ],
  },
  {
    id: "CUST-3310-L",
    name: "Catherine Lee",
    email: "c.lee@global-tech.com",
    phone: "+1 (555) 987-6543",
    address: "456 Silicon Valley Blvd, Palo Alto, CA 94301",
    accountType: "Premium",
    creditLimit: 50000,
    balance: 62450.0,
    savingsBalance: 128000.0,
    accountNumber: "****1198",
    routingNumber: "121000248",
    joinDate: "2020-11-05",
    riskLevel: "medium",
    kycStatus: "verified",
    frozen: false,
    occupation: "CTO",
    employer: "Global Tech Solutions",
    monthlyIncome: 22000,
    dob: "1990-**-**",
    ssn: "***-**-1198",
    lastLogin: "2026-02-20 06:45 PM",
    twoFactorEnabled: true,
    transactions: [
      { id: "TX-008", amount: 15000.0, description: "SBA Loan Payment", status: "approved", date: "2026-02-20", type: "debit", category: "Loan", channel: "ach" },
      { id: "TX-009", amount: 450.75, description: "Staples Office Supply", status: "approved", date: "2026-02-21", type: "debit", category: "Business", channel: "mobile", merchant: "Staples", location: "Palo Alto, CA" },
      { id: "TX-012", amount: 3200.0, description: "Delta Airlines - SFO to JFK", status: "approved", date: "2026-02-22", type: "debit", category: "Travel", channel: "online", merchant: "Delta Airlines" },
      { id: "TX-019", amount: 7800.0, description: "AWS Cloud Services - February", status: "pending", date: "2026-02-21", type: "debit", category: "Technology", channel: "ach", merchant: "Amazon Web Services" },
      { id: "TX-020", amount: 125.0, description: "Uber Rides - February", status: "approved", date: "2026-02-19", type: "debit", category: "Transport", channel: "mobile", merchant: "Uber" },
      { id: "TX-039", amount: 22000.0, description: "Consulting Fee - Microsoft", status: "approved", date: "2026-02-05", type: "credit", category: "Income", channel: "wire", reference: "MS-CON-2026-02" },
      { id: "TX-040", amount: 950.0, description: "WeWork Membership - Monthly", status: "approved", date: "2026-02-01", type: "debit", category: "Business", channel: "ach", merchant: "WeWork" },
      { id: "TX-041", amount: 380.0, description: "Costco Wholesale #442", status: "approved", date: "2026-02-16", type: "debit", category: "Groceries", channel: "mobile", merchant: "Costco", location: "Mountain View, CA" },
    ],
    loans: [
      { id: "LN-003", type: "personal", originalAmount: 75000, remainingBalance: 52100, interestRate: 6.5, monthlyPayment: 1450, nextPaymentDate: "2026-03-01", status: "current", startDate: "2023-06-01", term: 60 },
    ],
    notes: [
      { id: "N-C1", text: "Tech industry client with variable income. Monitor AWS spending patterns.", author: "John Smith", timestamp: "2026-02-21 10:00", category: "general" },
    ],
    beneficiaries: [
      { id: "BEN-05", name: "Global Tech Payroll", bankName: "Silicon Valley Bank", accountNumber: "****5567", routingNumber: "121140399", type: "domestic" },
    ],
    scheduledPayments: [
      { id: "SP-06", payee: "Personal Loan Repayment", amount: 1450, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Loan" },
      { id: "SP-07", payee: "AWS Cloud Services", amount: 7800, frequency: "monthly", nextDate: "2026-03-21", status: "active", category: "Technology" },
    ],
  },
  {
    id: "CUST-1102-M",
    name: "David Miller",
    email: "david.miller@freelance.io",
    phone: "+1 (555) 444-5555",
    address: "888 Broadway, Austin, TX 78701",
    accountType: "Standard",
    creditLimit: 5000,
    balance: 1250.2,
    savingsBalance: 320.0,
    accountNumber: "****3344",
    routingNumber: "111000025",
    joinDate: "2023-06-10",
    riskLevel: "high",
    kycStatus: "pending",
    frozen: false,
    occupation: "Freelance Developer",
    employer: "Self-Employed",
    monthlyIncome: 4200,
    dob: "1995-**-**",
    ssn: "***-**-3344",
    lastLogin: "2026-02-21 02:10 PM",
    twoFactorEnabled: false,
    transactions: [
      { id: "TX-010", amount: 65.4, description: "Shell Gas Station #4412", status: "approved", date: "2026-02-21", type: "debit", category: "Gas", channel: "mobile", merchant: "Shell", location: "Austin, TX" },
      { id: "TX-011", amount: 4500.0, description: "Suspicious Wire - Lagos, NG", status: "pending", date: "2026-02-23", type: "debit", category: "Transfer", channel: "wire", location: "Lagos, Nigeria", reference: "WR-SUSP-8827" },
      { id: "TX-021", amount: 150.0, description: "Venmo Transfer - John D.", status: "approved", date: "2026-02-20", type: "debit", category: "Transfer", channel: "mobile" },
      { id: "TX-022", amount: 9999.0, description: "Bitcoin ATM Withdrawal", status: "flagged", date: "2026-02-22", type: "debit", category: "Crypto", channel: "atm", location: "Austin, TX" },
      { id: "TX-027", amount: 82.3, description: "Walmart Supercenter", status: "approved", date: "2026-02-18", type: "debit", category: "Retail", channel: "mobile", merchant: "Walmart", location: "Austin, TX" },
      { id: "TX-042", amount: 3200.0, description: "Freelance Payment - Upwork", status: "approved", date: "2026-02-14", type: "credit", category: "Income", channel: "ach" },
      { id: "TX-043", amount: 1200.0, description: "Rent Payment - Zillow", status: "approved", date: "2026-02-01", type: "debit", category: "Housing", channel: "ach" },
      { id: "TX-044", amount: 299.0, description: "Best Buy - Gaming Monitor", status: "approved", date: "2026-02-10", type: "debit", category: "Electronics", channel: "online", merchant: "Best Buy" },
      { id: "TX-055", amount: 15000.0, description: "Cash Deposit - Multiple Bills", status: "flagged", date: "2026-02-19", type: "credit", category: "Deposit", channel: "branch", location: "Austin, TX" },
    ],
    loans: [
      { id: "LN-004", type: "personal", originalAmount: 10000, remainingBalance: 8750, interestRate: 12.99, monthlyPayment: 320, nextPaymentDate: "2026-03-01", status: "delinquent", startDate: "2024-01-15", term: 36 },
    ],
    notes: [
      { id: "N-D1", text: "HIGH RISK: Multiple suspicious transactions. BTC ATM near structuring threshold. Wire to Lagos under review.", author: "Compliance Dept", timestamp: "2026-02-22 09:00", category: "alert" },
      { id: "N-D2", text: "KYC documentation expired. Requested updated ID and proof of address. Deadline: Mar 1, 2026.", author: "John Smith", timestamp: "2026-02-20 15:30", category: "compliance" },
      { id: "N-D3", text: "Loan payment 15 days overdue. Attempted auto-debit failed — insufficient funds.", author: "Auto-System", timestamp: "2026-02-16 00:01", category: "alert" },
      { id: "N-D4", text: "Cash deposit of $15,000 in multiple bills. CTR filed. Branch manager flagged as potential structuring.", author: "Branch Mgr - Austin", timestamp: "2026-02-19 16:45", category: "compliance" },
    ],
    beneficiaries: [
      { id: "BEN-06", name: "Olumide Adeyemi", bankName: "First Bank Nigeria", accountNumber: "****8821", routingNumber: "N/A", type: "international", country: "Nigeria" },
    ],
    scheduledPayments: [
      { id: "SP-08", payee: "Rent - Zillow", amount: 1200, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Housing" },
    ],
  },
  {
    id: "CUST-4451-B",
    name: "Elena Rodriguez",
    email: "elena.rod@marketing-pro.com",
    phone: "+1 (555) 222-3333",
    address: "555 Ocean Drive, Miami, FL 33139",
    accountType: "Private Client",
    creditLimit: 75000,
    balance: 310200.0,
    savingsBalance: 175000.0,
    accountNumber: "****9087",
    routingNumber: "067014822",
    joinDate: "2018-01-20",
    riskLevel: "low",
    kycStatus: "verified",
    frozen: false,
    occupation: "CEO",
    employer: "Marketing Pro Agency",
    monthlyIncome: 32000,
    dob: "1982-**-**",
    ssn: "***-**-9087",
    lastLogin: "2026-02-21 11:22 AM",
    twoFactorEnabled: true,
    transactions: [
      { id: "TX-013", amount: 1200.0, description: "Rent Payment - Ocean View Apt", status: "approved", date: "2026-02-15", type: "debit", category: "Housing", channel: "ach" },
      { id: "TX-014", amount: 5000.0, description: "Wire Transfer Inbound - Miami", status: "approved", date: "2026-02-20", type: "credit", category: "Transfer", channel: "wire" },
      { id: "TX-023", amount: 680.0, description: "Nordstrom - Aventura Mall", status: "approved", date: "2026-02-21", type: "debit", category: "Retail", channel: "branch", merchant: "Nordstrom", location: "Miami, FL" },
      { id: "TX-024", amount: 22000.0, description: "Vanguard S&P 500 Investment", status: "pending", date: "2026-02-22", type: "debit", category: "Investment", channel: "online", merchant: "Vanguard" },
      { id: "TX-028", amount: 95.0, description: "Netflix + Spotify Annual", status: "approved", date: "2026-02-10", type: "debit", category: "Entertainment", channel: "online" },
      { id: "TX-045", amount: 32000.0, description: "Business Revenue - Marketing Pro", status: "approved", date: "2026-02-05", type: "credit", category: "Income", channel: "wire" },
      { id: "TX-046", amount: 4500.0, description: "Art Basel Miami - Gallery Purchase", status: "approved", date: "2026-02-08", type: "debit", category: "Art", channel: "branch", location: "Miami, FL" },
      { id: "TX-047", amount: 1850.0, description: "Ritz-Carlton Spa & Resort", status: "approved", date: "2026-02-14", type: "debit", category: "Travel", channel: "mobile", merchant: "Ritz-Carlton", location: "Key Biscayne, FL" },
    ],
    loans: [
      { id: "LN-005", type: "mortgage", originalAmount: 650000, remainingBalance: 520000, interestRate: 3.75, monthlyPayment: 3200, nextPaymentDate: "2026-03-01", status: "current", startDate: "2019-05-01", term: 360, collateral: "555 Ocean Drive Penthouse" },
    ],
    notes: [
      { id: "N-E1", text: "VIP client. Hosts quarterly events for referrals. Handle with priority.", author: "Mark Davis (RM)", timestamp: "2025-12-01 09:00", category: "general" },
    ],
    beneficiaries: [
      { id: "BEN-07", name: "Marketing Pro Payroll", bankName: "Bank of America", accountNumber: "****6643", routingNumber: "026009593", type: "domestic" },
      { id: "BEN-08", name: "Vanguard Investment", bankName: "Vanguard", accountNumber: "****1100", routingNumber: "021912915", type: "domestic", nickname: "Investments" },
    ],
    scheduledPayments: [
      { id: "SP-09", payee: "Ocean View Mortgage", amount: 3200, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Housing" },
      { id: "SP-10", payee: "Vanguard Auto-Invest", amount: 5000, frequency: "monthly", nextDate: "2026-03-15", status: "active", category: "Investment" },
    ],
  },
  {
    id: "CUST-5578-K",
    name: "Marcus Chen",
    email: "marcus.chen@quantfund.com",
    phone: "+1 (555) 678-9012",
    address: "1 Market Street, Apt 4201, San Francisco, CA 94105",
    accountType: "Wealth Management",
    creditLimit: 250000,
    balance: 1847300.0,
    savingsBalance: 500000.0,
    accountNumber: "****6691",
    routingNumber: "121000248",
    joinDate: "2016-04-10",
    riskLevel: "low",
    kycStatus: "verified",
    frozen: false,
    occupation: "Hedge Fund Manager",
    employer: "Quantum Capital Partners",
    monthlyIncome: 125000,
    dob: "1978-**-**",
    ssn: "***-**-6691",
    lastLogin: "2026-02-21 07:55 AM",
    twoFactorEnabled: true,
    transactions: [
      { id: "TX-048", amount: 250000.0, description: "Wire - Goldman Sachs Prime Brokerage", status: "approved", date: "2026-02-18", type: "debit", category: "Investment", channel: "wire", reference: "GS-PB-20260218" },
      { id: "TX-049", amount: 450000.0, description: "Fund Distribution - Q4 Returns", status: "approved", date: "2026-02-01", type: "credit", category: "Income", channel: "wire" },
      { id: "TX-050", amount: 8500.0, description: "Four Seasons Private Dining", status: "approved", date: "2026-02-16", type: "debit", category: "Entertainment", channel: "mobile", merchant: "Four Seasons", location: "San Francisco, CA" },
      { id: "TX-051", amount: 45000.0, description: "Wire to Hong Kong - HSBC", status: "pending", date: "2026-02-22", type: "debit", category: "Transfer", channel: "wire", location: "Hong Kong", reference: "HK-WR-9912" },
      { id: "TX-052", amount: 12000.0, description: "Sotheby's Auction - Contemporary Art", status: "approved", date: "2026-02-12", type: "debit", category: "Art", channel: "online", merchant: "Sotheby's" },
      { id: "TX-053", amount: 3200.0, description: "Tesla Supercharger + Service", status: "approved", date: "2026-02-20", type: "debit", category: "Auto", channel: "mobile", merchant: "Tesla" },
      { id: "TX-054", amount: 175.0, description: "Philz Coffee - Monthly Tab", status: "approved", date: "2026-02-15", type: "debit", category: "Dining", channel: "mobile", merchant: "Philz Coffee", location: "SF, CA" },
    ],
    loans: [],
    notes: [
      { id: "N-F1", text: "Ultra-high-net-worth client. Dedicated wealth advisor assigned. Quarterly portfolio reviews.", author: "Private Banking Div", timestamp: "2025-01-10 08:00", category: "general" },
      { id: "N-F2", text: "HK wire $45K pending. Client confirmed: fund transfer to subsidiary. Documentation on file.", author: "John Smith", timestamp: "2026-02-22 10:30", category: "compliance" },
    ],
    beneficiaries: [
      { id: "BEN-09", name: "Goldman Sachs PB", bankName: "Goldman Sachs", accountNumber: "****0042", routingNumber: "021000089", type: "domestic" },
      { id: "BEN-10", name: "Quantum Capital HK", bankName: "HSBC Hong Kong", accountNumber: "****7788", routingNumber: "N/A", type: "international", country: "Hong Kong" },
    ],
    scheduledPayments: [
      { id: "SP-11", payee: "1 Market St HOA", amount: 2800, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Housing" },
    ],
  },
  {
    id: "CUST-6623-W",
    name: "Priya Patel",
    email: "priya.patel@healthsys.org",
    phone: "+1 (555) 345-6789",
    address: "200 Longwood Ave, Boston, MA 02115",
    accountType: "Premium",
    creditLimit: 40000,
    balance: 87650.0,
    savingsBalance: 195000.0,
    accountNumber: "****2245",
    routingNumber: "011000015",
    joinDate: "2021-02-28",
    riskLevel: "low",
    kycStatus: "verified",
    frozen: false,
    occupation: "Chief Medical Officer",
    employer: "Boston Health Systems",
    monthlyIncome: 28000,
    dob: "1980-**-**",
    ssn: "***-**-2245",
    lastLogin: "2026-02-20 04:30 PM",
    twoFactorEnabled: true,
    transactions: [
      { id: "TX-056", amount: 28000.0, description: "Salary Deposit - Boston Health", status: "approved", date: "2026-02-15", type: "credit", category: "Income", channel: "ach" },
      { id: "TX-057", amount: 2400.0, description: "Student Loan Payment - Navient", status: "approved", date: "2026-02-01", type: "debit", category: "Loan", channel: "ach" },
      { id: "TX-058", amount: 450.0, description: "Whole Foods Market - Boston", status: "approved", date: "2026-02-18", type: "debit", category: "Groceries", channel: "mobile", merchant: "Whole Foods", location: "Boston, MA" },
      { id: "TX-059", amount: 15000.0, description: "Fidelity IRA Contribution", status: "pending", date: "2026-02-22", type: "debit", category: "Investment", channel: "online", merchant: "Fidelity" },
      { id: "TX-060", amount: 890.0, description: "JetBlue - BOS to SFO", status: "approved", date: "2026-02-14", type: "debit", category: "Travel", channel: "online", merchant: "JetBlue" },
      { id: "TX-061", amount: 180.0, description: "Harvard Medical Library", status: "approved", date: "2026-02-20", type: "debit", category: "Education", channel: "online" },
      { id: "TX-062", amount: 3500.0, description: "Condo Association - Quarterly", status: "approved", date: "2026-01-01", type: "debit", category: "Housing", channel: "ach" },
    ],
    loans: [
      { id: "LN-008", type: "student", originalAmount: 180000, remainingBalance: 92000, interestRate: 4.25, monthlyPayment: 2400, nextPaymentDate: "2026-03-01", status: "current", startDate: "2015-09-01", term: 120 },
      { id: "LN-009", type: "mortgage", originalAmount: 520000, remainingBalance: 445000, interestRate: 3.5, monthlyPayment: 2800, nextPaymentDate: "2026-03-01", status: "current", startDate: "2021-06-01", term: 360, collateral: "200 Longwood Ave #8B" },
    ],
    notes: [
      { id: "N-G1", text: "Medical professional with stable income. Excellent credit score (810). Maxing retirement contributions.", author: "Auto-System", timestamp: "2026-01-01 00:00", category: "general" },
    ],
    beneficiaries: [
      { id: "BEN-11", name: "Fidelity IRA", bankName: "Fidelity", accountNumber: "****9901", routingNumber: "011000015", type: "domestic", nickname: "Retirement" },
      { id: "BEN-12", name: "Navient Student Loans", bankName: "Navient", accountNumber: "****4455", routingNumber: "031100157", type: "domestic" },
    ],
    scheduledPayments: [
      { id: "SP-12", payee: "Navient Student Loan", amount: 2400, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Loan" },
      { id: "SP-13", payee: "Condo Mortgage", amount: 2800, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Housing" },
      { id: "SP-14", payee: "Fidelity Auto-Invest", amount: 3000, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Investment" },
    ],
  },
  {
    id: "CUST-7789-T",
    name: "James Thornton III",
    email: "j.thornton@thornton-estates.com",
    phone: "+1 (555) 111-0000",
    address: "88 Billionaire's Row, Greenwich, CT 06830",
    accountType: "Wealth Management",
    creditLimit: 500000,
    balance: 4250000.0,
    savingsBalance: 1200000.0,
    accountNumber: "****0011",
    routingNumber: "021000021",
    joinDate: "2014-11-01",
    riskLevel: "medium",
    kycStatus: "under_review",
    frozen: false,
    occupation: "Chairman",
    employer: "Thornton Family Office",
    monthlyIncome: 200000,
    dob: "1965-**-**",
    ssn: "***-**-0011",
    lastLogin: "2026-02-19 03:00 PM",
    twoFactorEnabled: true,
    transactions: [
      { id: "TX-063", amount: 500000.0, description: "Wire - Swiss Private Bank (UBS Zurich)", status: "pending", date: "2026-02-22", type: "debit", category: "Transfer", channel: "wire", location: "Zurich, Switzerland", reference: "UBS-CH-2026-88" },
      { id: "TX-064", amount: 120000.0, description: "Christie's Auction - Impressionist Lot", status: "approved", date: "2026-02-15", type: "debit", category: "Art", channel: "wire", merchant: "Christie's", location: "New York, NY" },
      { id: "TX-065", amount: 850000.0, description: "Trust Distribution - Thornton Family Trust", status: "approved", date: "2026-02-01", type: "credit", category: "Income", channel: "wire" },
      { id: "TX-066", amount: 25000.0, description: "Charitable Donation - Met Museum", status: "approved", date: "2026-02-10", type: "debit", category: "Charity", channel: "wire", merchant: "Metropolitan Museum" },
      { id: "TX-067", amount: 8900.0, description: "Teterboro Airport - Private Jet Charter", status: "approved", date: "2026-02-18", type: "debit", category: "Travel", channel: "wire" },
      { id: "TX-068", amount: 1500.0, description: "Greenwich Country Club - Monthly", status: "approved", date: "2026-02-01", type: "debit", category: "Entertainment", channel: "ach" },
      { id: "TX-069", amount: 75000.0, description: "Wire to Bermuda - Shell Corp", status: "flagged", date: "2026-02-20", type: "debit", category: "Transfer", channel: "wire", location: "Bermuda", reference: "BM-SHELL-4421" },
      { id: "TX-070", amount: 200000.0, description: "Quarterly Dividend - Thornton Holdings", status: "approved", date: "2026-01-15", type: "credit", category: "Income", channel: "wire" },
    ],
    loans: [
      { id: "LN-010", type: "credit_line", originalAmount: 2000000, remainingBalance: 180000, interestRate: 4.0, monthlyPayment: 0, nextPaymentDate: "2026-03-15", status: "current", startDate: "2018-01-01", term: 0 },
    ],
    notes: [
      { id: "N-H1", text: "UHNW client. Family office with complex entity structure. Enhanced due diligence required annually.", author: "Private Banking Div", timestamp: "2025-11-01 09:00", category: "compliance" },
      { id: "N-H2", text: "KYC under review — updated beneficial ownership declaration requested for Thornton Holdings entities.", author: "Compliance Dept", timestamp: "2026-02-15 14:00", category: "compliance" },
      { id: "N-H3", text: "Wire to Bermuda shell company flagged. Client claims tax-efficient structure. Pending SAR decision.", author: "AML Team", timestamp: "2026-02-20 16:30", category: "alert" },
      { id: "N-H4", text: "$500K wire to UBS Zurich pending. Requires senior management sign-off per BSA policy.", author: "John Smith", timestamp: "2026-02-22 11:00", category: "escalation" },
    ],
    beneficiaries: [
      { id: "BEN-13", name: "UBS Private Bank Zurich", bankName: "UBS AG", accountNumber: "****CH01", routingNumber: "N/A", type: "international", country: "Switzerland" },
      { id: "BEN-14", name: "Thornton Bermuda Ltd", bankName: "Butterfield Bank", accountNumber: "****BM99", routingNumber: "N/A", type: "international", country: "Bermuda" },
      { id: "BEN-15", name: "Christie's Auction House", bankName: "Barclays", accountNumber: "****UK22", routingNumber: "N/A", type: "international", country: "United Kingdom" },
    ],
    scheduledPayments: [
      { id: "SP-15", payee: "Greenwich Country Club", amount: 1500, frequency: "monthly", nextDate: "2026-03-01", status: "active", category: "Entertainment" },
      { id: "SP-16", payee: "Met Museum Patron Circle", amount: 25000, frequency: "annually", nextDate: "2026-12-01", status: "active", category: "Charity" },
    ],
  },
];

// ─── Policy Rules ───

export const POLICY_RULES = {
  teller: [
    "View customer profiles (read-only PII access)",
    "Search transaction ledger by date, ID, or keyword",
    "Approve standard transactions under $1,000",
    "Request temporary credit overrides under $500",
    "Flag suspicious activity for manager review",
    "Add notes to customer profiles",
    "View loan details (read-only)",
    "Schedule domestic payments under $5,000",
    "Cannot modify customer personal information",
    "Cannot freeze or unfreeze accounts",
    "Cannot delete or modify audit logs",
    "Cannot decline or reverse transactions",
    "Cannot approve international wires",
    "Cannot modify loan terms",
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
    "Decline or reverse transactions",
    "Approve international wire transfers",
    "SAR filing and BSA compliance actions",
    "Modify loan terms and restructure debt",
  ],
};

// ─── Notifications ───

export const INITIAL_NOTIFICATIONS = [
  { id: "N-001", type: "alert", title: "Suspicious Activity Detected", message: "TX-022: Bitcoin ATM withdrawal of $9,999 flagged for AML review.", timestamp: "14:22", read: false },
  { id: "N-002", type: "warning", title: "KYC Verification Pending", message: "David Miller (CUST-1102-M) KYC documentation has expired.", timestamp: "13:45", read: false },
  { id: "N-003", type: "info", title: "System Maintenance", message: "Scheduled maintenance window: Feb 22, 2:00-4:00 AM EST.", timestamp: "12:00", read: true },
  { id: "N-004", type: "alert", title: "Wire Transfer Alert", message: "TX-015: $3,200 wire to Cayman Islands flagged by AML system.", timestamp: "11:30", read: false },
  { id: "N-005", type: "warning", title: "Credit Limit Review", message: "3 accounts due for annual credit limit reassessment.", timestamp: "10:15", read: true },
  { id: "N-006", type: "alert", title: "High-Value Wire Pending", message: "TX-063: $500,000 wire to UBS Zurich requires senior approval.", timestamp: "14:45", read: false },
  { id: "N-007", type: "alert", title: "Shell Company Wire", message: "TX-069: $75,000 wire to Bermuda shell corp flagged for SAR.", timestamp: "14:10", read: false },
  { id: "N-008", type: "warning", title: "Delinquent Loan", message: "David Miller (CUST-1102-M) personal loan 15 days past due.", timestamp: "09:00", read: false },
  { id: "N-009", type: "info", title: "Quarterly Review Due", message: "5 client accounts due for quarterly compliance review.", timestamp: "08:30", read: true },
  { id: "N-010", type: "warning", title: "2FA Not Enabled", message: "David Miller has not enabled two-factor authentication.", timestamp: "08:00", read: true },
];

// ─── Spending Categories for Analytics ───

export const SPENDING_CATEGORIES = [
  "Housing", "Groceries", "Dining", "Retail", "Travel", "Entertainment",
  "Business", "Technology", "Transport", "Gas", "Investment", "Loan",
  "Transfer", "Crypto", "Luxury", "Art", "Charity", "Education",
  "Insurance", "Utilities", "Tax", "Auto", "Electronics",
];

// ─── Risk Score Calculation ───

export function calculateRiskScore(customer: Customer): number {
  let score = 100; // Start at 100 (perfect)
  if (customer.riskLevel === "high") score -= 30;
  if (customer.riskLevel === "critical") score -= 50;
  if (customer.riskLevel === "medium") score -= 10;
  if (customer.kycStatus === "pending") score -= 15;
  if (customer.kycStatus === "expired") score -= 20;
  if (customer.kycStatus === "under_review") score -= 10;
  if (!customer.twoFactorEnabled) score -= 10;
  const flaggedTx = customer.transactions.filter(t => t.status === "flagged").length;
  score -= flaggedTx * 10;
  const pendingWires = customer.transactions.filter(t => t.status === "pending" && t.channel === "wire").length;
  score -= pendingWires * 5;
  if (customer.loans.some(l => l.status === "delinquent")) score -= 15;
  if (customer.loans.some(l => l.status === "default")) score -= 25;
  return Math.max(0, Math.min(100, score));
}
