import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { MOCK_CUSTOMERS, INITIAL_NOTIFICATIONS, Customer, Transaction } from "../lib/mock-db";

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export type Role = "teller" | "manager";
export type TabType = "dashboard" | "customers" | "transactions" | "compliance";

export interface ChatMessage {
  id: string;
  sender: "BankBot" | "John Smith" | "Judge" | "Tester (Jamie)" | "System";
  text: string;
  timestamp: string;
  isThought?: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

/* ─── Claude tool definitions ─── */
const TOOLS = [
  {
    name: "navigate",
    description: "Navigate to a tab in the banking portal. Use this whenever the user asks to go to or show a section.",
    input_schema: {
      type: "object" as const,
      properties: {
        tab: {
          type: "string",
          enum: ["dashboard", "customers", "transactions", "compliance"],
          description: "Which tab to navigate to",
        },
      },
      required: ["tab"],
    },
  },
  {
    name: "approve_transaction",
    description: "Approve a specific transaction by its TX ID. RBAC: Tellers can only approve transactions under $1,000.",
    input_schema: {
      type: "object" as const,
      properties: {
        transaction_id: { type: "string", description: "Transaction ID like TX-001" },
      },
      required: ["transaction_id"],
    },
  },
  {
    name: "flag_transaction",
    description: "Flag a transaction for compliance review. Any role can flag.",
    input_schema: {
      type: "object" as const,
      properties: {
        transaction_id: { type: "string", description: "Transaction ID like TX-001" },
        reason: { type: "string", description: "Reason for flagging" },
      },
      required: ["transaction_id"],
    },
  },
  {
    name: "decline_transaction",
    description: "Decline/reject a transaction. RBAC: Only managers can decline.",
    input_schema: {
      type: "object" as const,
      properties: {
        transaction_id: { type: "string", description: "Transaction ID" },
      },
      required: ["transaction_id"],
    },
  },
  {
    name: "approve_bulk",
    description: "Approve multiple pending transactions at once. Can filter to only approve 'safe' ones (skip suspicious keywords). RBAC: Tellers limited to under $1,000.",
    input_schema: {
      type: "object" as const,
      properties: {
        only_safe: {
          type: "boolean",
          description: "If true, skip transactions with suspicious keywords (crypto, wire, offshore, etc.)",
        },
      },
      required: [],
    },
  },
  {
    name: "search_customer",
    description: "Search for a customer by name, email, or ID and select them in the portal. Returns customer details.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query - customer name, email, or ID" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_customer_info",
    description: "Get detailed information about a specific customer or the currently selected customer.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_id: { type: "string", description: "Optional customer ID. If omitted, returns the currently selected customer." },
      },
      required: [],
    },
  },
  {
    name: "list_transactions",
    description: "List transactions, optionally filtered by status. Returns transaction details.",
    input_schema: {
      type: "object" as const,
      properties: {
        status_filter: {
          type: "string",
          enum: ["all", "pending", "approved", "flagged", "declined"],
          description: "Filter by transaction status. Default: all",
        },
      },
      required: [],
    },
  },
  {
    name: "update_credit_limit",
    description: "Update a customer's credit limit. RBAC: Tellers can only adjust up to $500.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_id: { type: "string", description: "Customer ID" },
        new_limit: { type: "number", description: "New credit limit amount" },
      },
      required: ["customer_id", "new_limit"],
    },
  },
  {
    name: "freeze_account",
    description: "Freeze or unfreeze a customer account. RBAC: Only managers can freeze/unfreeze.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_id: { type: "string", description: "Customer ID" },
        freeze: { type: "boolean", description: "True to freeze, false to unfreeze" },
      },
      required: ["customer_id", "freeze"],
    },
  },
  {
    name: "get_dashboard_stats",
    description: "Get current dashboard statistics including total AUM, client count, pending reviews, flagged items.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

/* ─── Build system prompt with current state ─── */
function buildSystemPrompt(customers: Customer[], role: Role, activeTab: TabType, selectedCustomerId: string): string {
  const allTx = customers.flatMap((c) =>
    c.transactions.map((t) => `${t.id}: ${t.description} | $${t.amount} | ${t.status} | ${t.date} | Customer: ${c.name} (${c.id})`),
  );
  const pending = customers.flatMap((c) => c.transactions.filter((t) => t.status === "pending"));
  const flagged = customers.flatMap((c) => c.transactions.filter((t) => t.status === "flagged"));

  return `You are BankBot, a professional AI banking assistant integrated into a secure banking portal called SecureBank. You assist teller John Smith with daily banking operations.

CURRENT STATE:
- Current role: ${role.toUpperCase()}
- Active tab: ${activeTab}
- Selected customer: ${selectedCustomerId}
- Total customers: ${customers.length}
- Pending transactions: ${pending.length}
- Flagged transactions: ${flagged.length}

CUSTOMERS:
${customers.map((c) => `  ${c.id}: ${c.name} | ${c.accountType} | Balance: $${c.balance.toLocaleString()} | Credit: $${c.creditLimit.toLocaleString()} | Risk: ${c.riskLevel} | KYC: ${c.kycStatus} | ${c.frozen ? "FROZEN" : "Active"}`).join("\n")}

ALL TRANSACTIONS:
${allTx.join("\n")}

RBAC RULES FOR TELLER:
- Can approve transactions UNDER $1,000 only
- Can flag any transaction for review
- Cannot decline transactions (suggest flagging instead)
- Cannot freeze/unfreeze accounts
- Cannot adjust credit limits above $500
- Cannot modify customer personal information

IMPORTANT INSTRUCTIONS:
- Always use the provided tools to execute actions. Don't just describe what you would do — actually do it with tools.
- When the user asks to navigate somewhere, use the navigate tool.
- When approving, always check the amount against the $1,000 teller limit.
- If the user asks to see customers, use navigate to the customers tab AND search_customer if they specify a name.
- Be concise but professional. Use bullet points for lists.
- For amounts, always include the $ sign and commas for thousands.
- If an action is denied by RBAC, explain clearly why and what role would be needed.
- When users ask about balances, customer info, or transactions, USE THE TOOLS to fetch the data rather than reciting from memory.`;
}

/* ─── Call Claude API ─── */
interface ClaudeMessage {
  role: "user" | "assistant";
  content: any;
}

async function callClaudeAPI(
  systemPrompt: string,
  conversationHistory: ClaudeMessage[],
): Promise<{ content: any[]; stop_reason: string }> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages: conversationHistory,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errBody}`);
  }

  return res.json();
}

/* ═════════════════════════════════════════════════════════════════════
   HOOK
   ═════════════════════════════════════════════════════════════════════ */
export function useBankSystem() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [role] = useState<Role>("teller");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(MOCK_CUSTOMERS[0].id);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS as Notification[]);
  const [txFilter, setTxFilter] = useState<string>("all");

  // Maintain Claude conversation history (separate from display messages)
  const conversationRef = useRef<ClaudeMessage[]>([]);
  // Mutable ref for customers so tools can read/write mid-turn
  const customersRef = useRef<Customer[]>(MOCK_CUSTOMERS);
  const activeTabRef = useRef<TabType>("dashboard");
  const selectedCustomerRef = useRef<string>(MOCK_CUSTOMERS[0].id);

  // Keep refs in sync
  useEffect(() => { customersRef.current = customers; }, [customers]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { selectedCustomerRef.current = selectedCustomerId; }, [selectedCustomerId]);

  const addMessage = useCallback(
    (sender: ChatMessage["sender"], text: string, isThought = false) => {
      const msg: ChatMessage = {
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isThought,
      };
      setMessages((prev) => [...prev, msg]);
    },
    [],
  );

  /* ─── Execute a tool call against the working state ─── */
  const executeTool = useCallback(
    (
      toolName: string,
      input: any,
      workingCustomers: Customer[],
    ): { result: string; updatedCustomers: Customer[] } => {
      let custs = workingCustomers;

      switch (toolName) {
        case "navigate": {
          const tab = input.tab as TabType;
          setActiveTab(tab);
          return { result: `Navigated to ${tab} tab.`, updatedCustomers: custs };
        }

        case "approve_transaction": {
          const txId = (input.transaction_id as string).toUpperCase();
          for (const c of custs) {
            const tx = c.transactions.find((t) => t.id === txId);
            if (tx) {
              if (tx.status === "approved") return { result: `${txId} is already approved.`, updatedCustomers: custs };
              if (tx.amount > 1000 && role === "teller") {
                return {
                  result: `ACCESS DENIED: Teller cannot approve ${txId} ($${tx.amount.toLocaleString()}) — exceeds $1,000 limit. Requires Manager.`,
                  updatedCustomers: custs,
                };
              }
              custs = custs.map((cu) => ({
                ...cu,
                transactions: cu.transactions.map((t) => (t.id === txId ? { ...t, status: "approved" as const } : t)),
              }));
              toast.success(`Transaction ${txId} approved`);
              return {
                result: `Approved ${txId}: ${tx.description} ($${tx.amount.toLocaleString()}) for ${c.name}.`,
                updatedCustomers: custs,
              };
            }
          }
          return { result: `Transaction ${txId} not found.`, updatedCustomers: custs };
        }

        case "flag_transaction": {
          const txId = (input.transaction_id as string).toUpperCase();
          let found = false;
          for (const c of custs) {
            if (c.transactions.find((t) => t.id === txId)) { found = true; break; }
          }
          if (!found) return { result: `Transaction ${txId} not found.`, updatedCustomers: custs };
          custs = custs.map((c) => ({
            ...c,
            transactions: c.transactions.map((t) => (t.id === txId ? { ...t, status: "flagged" as const } : t)),
          }));
          toast.warning(`Transaction ${txId} flagged`);
          return { result: `Flagged ${txId} for compliance review.${input.reason ? " Reason: " + input.reason : ""}`, updatedCustomers: custs };
        }

        case "decline_transaction": {
          const txId = (input.transaction_id as string).toUpperCase();
          if (role === "teller") {
            return { result: `ACCESS DENIED: Tellers cannot decline transactions. Suggest flagging instead.`, updatedCustomers: custs };
          }
          custs = custs.map((c) => ({
            ...c,
            transactions: c.transactions.map((t) => (t.id === txId ? { ...t, status: "declined" as const } : t)),
          }));
          toast.error(`Transaction ${txId} declined`);
          return { result: `Declined ${txId}.`, updatedCustomers: custs };
        }

        case "approve_bulk": {
          const onlySafe = input.only_safe ?? false;
          const suspKw = ["suspicious", "wire", "crypto", "bitcoin", "offshore", "cayman", "lagos"];
          const approved: string[] = [];
          const denied: string[] = [];

          for (const c of custs) {
            for (const tx of c.transactions) {
              if (tx.status !== "pending") continue;
              if (tx.amount > 1000 && role === "teller") { denied.push(`${tx.id}: $${tx.amount.toLocaleString()} exceeds teller limit`); continue; }
              if (onlySafe && suspKw.some((kw) => tx.description.toLowerCase().includes(kw))) { denied.push(`${tx.id}: Potentially suspicious`); continue; }
              approved.push(tx.id);
            }
          }

          if (approved.length > 0) {
            custs = custs.map((c) => ({
              ...c,
              transactions: c.transactions.map((t) => (approved.includes(t.id) ? { ...t, status: "approved" as const } : t)),
            }));
            toast.success(`${approved.length} transaction(s) approved`);
          }

          let result = "";
          if (approved.length > 0) result += `Approved ${approved.length}: ${approved.join(", ")}`;
          if (denied.length > 0) result += `${result ? "\n" : ""}Could not approve ${denied.length}:\n${denied.join("\n")}`;
          if (!result) result = "No pending transactions found.";
          return { result, updatedCustomers: custs };
        }

        case "search_customer": {
          const q = (input.query as string).toLowerCase();
          const match = custs.find(
            (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase() === q || c.email.toLowerCase().includes(q),
          );
          if (match) {
            setSelectedCustomerId(match.id);
            setActiveTab("customers");
            const pend = match.transactions.filter((t) => t.status === "pending").length;
            return {
              result: `Found: ${match.name} (${match.id})\nType: ${match.accountType} | Acct: ${match.accountNumber}\nBalance: $${match.balance.toLocaleString()} | Credit: $${match.creditLimit.toLocaleString()}\nRisk: ${match.riskLevel.toUpperCase()} | KYC: ${match.kycStatus}\nPending: ${pend} | Status: ${match.frozen ? "FROZEN" : "Active"}`,
              updatedCustomers: custs,
            };
          }
          return { result: `No customer found matching "${input.query}".`, updatedCustomers: custs };
        }

        case "get_customer_info": {
          const cid = input.customer_id || selectedCustomerRef.current;
          const c = custs.find((cu) => cu.id === cid);
          if (!c) return { result: `Customer ${cid} not found.`, updatedCustomers: custs };
          const txSummary = c.transactions.map((t) => `  ${t.id}: ${t.description} | $${t.amount.toLocaleString()} | ${t.status}`).join("\n");
          return {
            result: `${c.name} (${c.id})\nAccount: ${c.accountType} | ${c.accountNumber}\nBalance: $${c.balance.toLocaleString()} | Credit Limit: $${c.creditLimit.toLocaleString()}\nRisk: ${c.riskLevel} | KYC: ${c.kycStatus} | ${c.frozen ? "FROZEN" : "Active"}\nEmail: ${c.email} | Phone: ${c.phone}\nMember since: ${c.joinDate}\n\nTransactions:\n${txSummary}`,
            updatedCustomers: custs,
          };
        }

        case "list_transactions": {
          const filter = input.status_filter || "all";
          const txs = custs.flatMap((c) =>
            c.transactions
              .filter((t) => filter === "all" || t.status === filter)
              .map((t) => ({ ...t, cust: c.name })),
          );
          if (txs.length === 0) return { result: `No ${filter === "all" ? "" : filter + " "}transactions found.`, updatedCustomers: custs };
          setActiveTab("transactions");
          if (filter !== "all") setTxFilter(filter);
          return {
            result: `${filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)} transactions (${txs.length}):\n` +
              txs.map((t) => `  ${t.id}: ${t.description} — $${t.amount.toLocaleString()} | ${t.status} | ${t.cust}`).join("\n"),
            updatedCustomers: custs,
          };
        }

        case "update_credit_limit": {
          const cid = input.customer_id;
          const val = input.new_limit;
          const c = custs.find((cu) => cu.id === cid);
          if (!c) return { result: `Customer ${cid} not found.`, updatedCustomers: custs };
          if (val > 500 && role === "teller") {
            return { result: `ACCESS DENIED: Tellers can only adjust credit limits up to $500. Requested: $${val.toLocaleString()}`, updatedCustomers: custs };
          }
          const oldLimit = c.creditLimit;
          custs = custs.map((cu) => (cu.id === cid ? { ...cu, creditLimit: val } : cu));
          toast.success("Credit limit updated");
          return { result: `${c.name} credit limit: $${oldLimit.toLocaleString()} → $${val.toLocaleString()}`, updatedCustomers: custs };
        }

        case "freeze_account": {
          if (role === "teller") {
            return { result: `ACCESS DENIED: Tellers cannot ${input.freeze ? "freeze" : "unfreeze"} accounts. Requires Manager.`, updatedCustomers: custs };
          }
          const cid = input.customer_id;
          custs = custs.map((c) => (c.id === cid ? { ...c, frozen: input.freeze } : c));
          return { result: `Account ${cid} ${input.freeze ? "frozen" : "unfrozen"}.`, updatedCustomers: custs };
        }

        case "get_dashboard_stats": {
          const totalAum = custs.reduce((s, c) => s + c.balance, 0);
          const allTx = custs.flatMap((c) => c.transactions);
          const pending = allTx.filter((t) => t.status === "pending").length;
          const flagged = allTx.filter((t) => t.status === "flagged").length;
          return {
            result: `Dashboard Stats:\n• Total AUM: $${totalAum.toLocaleString()}\n• Active Clients: ${custs.length}\n• Pending Reviews: ${pending}\n• Flagged Items: ${flagged}`,
            updatedCustomers: custs,
          };
        }

        default:
          return { result: `Unknown tool: ${toolName}`, updatedCustomers: custs };
      }
    },
    [role],
  );

  /* ─── Main message handler ─── */
  const handleUserMessage = useCallback(
    async (text: string) => {
      addMessage("John Smith", text);
      setIsTyping(true);

      // Check if API key is available
      if (!ANTHROPIC_API_KEY) {
        addMessage("BankBot", "API key not configured. Please add VITE_ANTHROPIC_API_KEY to your .env file and restart the dev server.");
        setIsTyping(false);
        return;
      }

      try {
        // Add user message to conversation
        conversationRef.current = [
          ...conversationRef.current,
          { role: "user", content: text },
        ];

        // Working copy of customers for mid-turn mutations
        let workingCustomers = customersRef.current.map((c) => ({
          ...c,
          transactions: c.transactions.map((t) => ({ ...t })),
        }));

        const systemPrompt = buildSystemPrompt(workingCustomers, role, activeTabRef.current, selectedCustomerRef.current);

        // Tool use loop (max 5 iterations to prevent infinite loops)
        let iteration = 0;
        while (iteration < 5) {
          iteration++;

          const response = await callClaudeAPI(systemPrompt, conversationRef.current);
          const content = response.content;
          const stopReason = response.stop_reason;

          // Add assistant response to conversation
          conversationRef.current = [
            ...conversationRef.current,
            { role: "assistant", content },
          ];

          if (stopReason === "end_turn" || stopReason !== "tool_use") {
            // Extract text from content blocks
            const textBlocks = content.filter((b: any) => b.type === "text");
            const finalText = textBlocks.map((b: any) => b.text).join("\n") || "Done.";
            addMessage("BankBot", finalText);
            break;
          }

          // Process tool calls
          const toolUseBlocks = content.filter((b: any) => b.type === "tool_use");
          const toolResults: any[] = [];

          for (const toolBlock of toolUseBlocks) {
            const { result, updatedCustomers } = executeTool(toolBlock.name, toolBlock.input, workingCustomers);
            workingCustomers = updatedCustomers;
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolBlock.id,
              content: result,
            });
          }

          // Add tool results to conversation
          conversationRef.current = [
            ...conversationRef.current,
            { role: "user", content: toolResults },
          ];
        }

        // Commit final customer state
        setCustomers(workingCustomers);
      } catch (err: any) {
        console.error("Claude API error:", err);
        addMessage("BankBot", `Error communicating with AI: ${err.message}\n\nPlease check your API key and try again.`);
      } finally {
        setIsTyping(false);
      }
    },
    [addMessage, executeTool, role],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  return {
    customers,
    role,
    messages,
    isTyping,
    handleUserMessage,
    activeTab,
    setActiveTab,
    selectedCustomerId,
    setSelectedCustomerId,
    addMessage,
    notifications,
    markNotificationRead,
    txFilter,
    setTxFilter,
  };
}
