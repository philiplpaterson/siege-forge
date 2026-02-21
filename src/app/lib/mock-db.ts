export interface Transaction {
  id: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'flagged' | 'declined';
  date: string;
  type: 'debit' | 'credit';
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  accountType: 'Private Client' | 'Business' | 'Standard' | 'Premium';
  creditLimit: number;
  balance: number;
  accountNumber: string;
  routingNumber: string;
  joinDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  kycStatus: 'verified' | 'pending' | 'expired';
  frozen: boolean;
  transactions: Transaction[];
  avatarUrl?: string;
}

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
    accountNumber: "****4821",
    routingNumber: "021000021",
    joinDate: "2019-03-15",
    riskLevel: "low",
    kycStatus: "verified",
    frozen: false,
    transactions: [
      { id: "TX-001", amount: 120.45, description: "Whole Foods Market #10182", status: "approved", date: "2026-02-18", type: "debit", category: "Groceries" },
      { id: "TX-002", amount: 2500.00, description: "Binance Exchange - Crypto Purchase", status: "pending", date: "2026-02-20", type: "debit", category: "Crypto" },
      { id: "TX-005", amount: 45.20, description: "Starbucks #14522 - NYC", status: "approved", date: "2026-02-21", type: "debit", category: "Dining" },
      { id: "TX-006", amount: 890.00, description: "Apple Store Fifth Ave", status: "approved", date: "2026-02-22", type: "debit", category: "Retail" },
      { id: "TX-015", amount: 3200.00, description: "Wire Transfer - Cayman Islands", status: "flagged", date: "2026-02-21", type: "debit", category: "Transfer" },
      { id: "TX-016", amount: 15000.00, description: "Payroll Deposit - JPM Corp", status: "approved", date: "2026-02-15", type: "credit", category: "Income" },
      { id: "TX-025", amount: 234.50, description: "Target Store #2281", status: "approved", date: "2026-02-17", type: "debit", category: "Retail" },
    ]
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
    accountNumber: "****7732",
    routingNumber: "021000021",
    joinDate: "2017-08-22",
    riskLevel: "low",
    kycStatus: "verified",
    frozen: false,
    transactions: [
      { id: "TX-003", amount: 45.50, description: "Blue Bottle Coffee - Tribeca", status: "approved", date: "2026-02-19", type: "debit", category: "Dining" },
      { id: "TX-004", amount: 8000.00, description: "Rolex Boutique - Fifth Ave", status: "pending", date: "2026-02-21", type: "debit", category: "Luxury" },
      { id: "TX-007", amount: 12500.00, description: "Internal Transfer - Savings", status: "approved", date: "2026-02-22", type: "credit", category: "Transfer" },
      { id: "TX-017", amount: 340.00, description: "Amazon Business Prime", status: "approved", date: "2026-02-20", type: "debit", category: "Business" },
      { id: "TX-018", amount: 55000.00, description: "Commercial Lease Payment Q1", status: "approved", date: "2026-02-01", type: "debit", category: "Business" },
      { id: "TX-026", amount: 1250.00, description: "Client Dinner - Nobu NYC", status: "approved", date: "2026-02-19", type: "debit", category: "Entertainment" },
    ]
  },
  {
    id: "CUST-3310-L",
    name: "Catherine Lee",
    email: "c.lee@global-tech.com",
    phone: "+1 (555) 987-6543",
    address: "456 Silicon Valley Blvd, Palo Alto, CA 94301",
    accountType: "Premium",
    creditLimit: 50000,
    balance: 62450.00,
    accountNumber: "****1198",
    routingNumber: "121000248",
    joinDate: "2020-11-05",
    riskLevel: "medium",
    kycStatus: "verified",
    frozen: false,
    transactions: [
      { id: "TX-008", amount: 15000.00, description: "SBA Loan Payment", status: "approved", date: "2026-02-20", type: "debit", category: "Loan" },
      { id: "TX-009", amount: 450.75, description: "Staples Office Supply", status: "approved", date: "2026-02-21", type: "debit", category: "Business" },
      { id: "TX-012", amount: 3200.00, description: "Delta Airlines - SFO to JFK", status: "approved", date: "2026-02-22", type: "debit", category: "Travel" },
      { id: "TX-019", amount: 7800.00, description: "AWS Cloud Services - February", status: "pending", date: "2026-02-21", type: "debit", category: "Technology" },
      { id: "TX-020", amount: 125.00, description: "Uber Rides - February", status: "approved", date: "2026-02-19", type: "debit", category: "Transport" },
    ]
  },
  {
    id: "CUST-1102-M",
    name: "David Miller",
    email: "david.miller@freelance.io",
    phone: "+1 (555) 444-5555",
    address: "888 Broadway, Austin, TX 78701",
    accountType: "Standard",
    creditLimit: 5000,
    balance: 1250.20,
    accountNumber: "****3344",
    routingNumber: "111000025",
    joinDate: "2023-06-10",
    riskLevel: "high",
    kycStatus: "pending",
    frozen: false,
    transactions: [
      { id: "TX-010", amount: 65.40, description: "Shell Gas Station #4412", status: "approved", date: "2026-02-21", type: "debit", category: "Gas" },
      { id: "TX-011", amount: 4500.00, description: "Suspicious Wire - Lagos, NG", status: "pending", date: "2026-02-23", type: "debit", category: "Transfer" },
      { id: "TX-021", amount: 150.00, description: "Venmo Transfer - John D.", status: "approved", date: "2026-02-20", type: "debit", category: "Transfer" },
      { id: "TX-022", amount: 9999.00, description: "Bitcoin ATM Withdrawal", status: "flagged", date: "2026-02-22", type: "debit", category: "Crypto" },
      { id: "TX-027", amount: 82.30, description: "Walmart Supercenter", status: "approved", date: "2026-02-18", type: "debit", category: "Retail" },
    ]
  },
  {
    id: "CUST-4451-B",
    name: "Elena Rodriguez",
    email: "elena.rod@marketing-pro.com",
    phone: "+1 (555) 222-3333",
    address: "555 Ocean Drive, Miami, FL 33139",
    accountType: "Private Client",
    creditLimit: 75000,
    balance: 310200.00,
    accountNumber: "****9087",
    routingNumber: "067014822",
    joinDate: "2018-01-20",
    riskLevel: "low",
    kycStatus: "verified",
    frozen: false,
    transactions: [
      { id: "TX-013", amount: 1200.00, description: "Rent Payment - Ocean View Apt", status: "approved", date: "2026-02-15", type: "debit", category: "Housing" },
      { id: "TX-014", amount: 5000.00, description: "Wire Transfer Inbound - Miami", status: "approved", date: "2026-02-20", type: "credit", category: "Transfer" },
      { id: "TX-023", amount: 680.00, description: "Nordstrom - Aventura Mall", status: "approved", date: "2026-02-21", type: "debit", category: "Retail" },
      { id: "TX-024", amount: 22000.00, description: "Vanguard S&P 500 Investment", status: "pending", date: "2026-02-22", type: "debit", category: "Investment" },
      { id: "TX-028", amount: 95.00, description: "Netflix + Spotify Annual", status: "approved", date: "2026-02-10", type: "debit", category: "Entertainment" },
    ]
  }
];

export const POLICY_RULES = {
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

export const INITIAL_NOTIFICATIONS = [
  { id: "N-001", type: "alert", title: "Suspicious Activity Detected", message: "TX-022: Bitcoin ATM withdrawal of $9,999 flagged for AML review.", timestamp: "14:22", read: false },
  { id: "N-002", type: "warning", title: "KYC Verification Pending", message: "David Miller (CUST-1102-M) KYC documentation has expired.", timestamp: "13:45", read: false },
  { id: "N-003", type: "info", title: "System Maintenance", message: "Scheduled maintenance window: Feb 22, 2:00-4:00 AM EST.", timestamp: "12:00", read: true },
  { id: "N-004", type: "alert", title: "Wire Transfer Alert", message: "TX-015: $3,200 wire to Cayman Islands flagged by AML system.", timestamp: "11:30", read: false },
  { id: "N-005", type: "warning", title: "Credit Limit Review", message: "3 accounts due for annual credit limit reassessment.", timestamp: "10:15", read: true },
];
