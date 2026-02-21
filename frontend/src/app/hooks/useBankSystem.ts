import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { MOCK_CUSTOMERS, INITIAL_NOTIFICATIONS, Customer, Transaction } from "../lib/mock-db";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

export type Role = "teller" | "manager";
export type TabType = "dashboard" | "customers" | "transactions" | "compliance";
export type GameStatus = "idle" | "running" | "finished";

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

export interface RoundResult {
  round: number;
  turns_used: number;
  leaked: boolean;
  summary: string;
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

  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [currentRound, setCurrentRound] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [maxRounds, setMaxRounds] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [judgeMessages, setJudgeMessages] = useState<ChatMessage[]>([]);

  // WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const handleEventRef = useRef<(data: any) => void>(() => {});

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
      return msg;
    },
    [],
  );

  const addJudgeMessage = useCallback(
    (text: string) => {
      const msg: ChatMessage = {
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        sender: "Judge",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setJudgeMessages((prev) => [...prev, msg]);
      return msg;
    },
    [],
  );

  // Handle incoming WebSocket events
  handleEventRef.current = (data: any) => {
    const event = data.event;

    switch (event) {
      case "game_started":
        setGameStatus("running");
        setMaxRounds(data.config?.max_rounds || 4);
        setRoundResults([]);
        setJudgeMessages([]);
        addMessage("System", `Red team exercise started. ${data.config?.max_rounds || 4} rounds, ${data.config?.max_turns || 8} turns per round.`);
        toast.success("Red team exercise started");
        break;

      case "round_start":
        setCurrentRound(data.round);
        setCurrentTurn(0);
        setMessages([]);
        addMessage("System", `Round ${data.round}/${data.max_rounds} starting...`);
        toast.info(`Round ${data.round} starting`);
        break;

      case "hacker_message":
        setCurrentTurn(data.turn);
        // The hacker impersonates John Smith talking to BankBot
        addMessage("John Smith", data.message);
        setIsTyping(true);
        break;

      case "tool_call":
        addMessage("System", `Tool: ${data.tool}(${JSON.stringify(data.input).slice(0, 80)}...)`, true);
        break;

      case "bank_message":
        setIsTyping(false);
        addMessage("BankBot", data.message);
        break;

      case "judge_verdict":
        setIsTyping(false);
        addMessage("Judge", data.analysis);
        addJudgeMessage(`Round ${data.round} (Turn ${data.turn}): ${data.analysis}`);
        toast.warning(`Judge verdict - Round ${data.round}`);
        break;

      case "round_end": {
        const result: RoundResult = {
          round: data.round,
          turns_used: data.turns_used,
          leaked: data.leaked,
          summary: data.summary,
        };
        setRoundResults((prev) => [...prev, result]);
        addMessage(
          "System",
          `Round ${data.round} ended: ${data.leaked ? "BREACHED" : "DEFENDED"} (${data.turns_used} turns)`
        );
        break;
      }

      case "game_over":
        setGameStatus("finished");
        addMessage(
          "System",
          `Exercise complete. ${data.breaches}/${data.total_rounds} rounds breached.`
        );
        toast.success("Red team exercise complete");
        break;

      case "error":
        setIsTyping(false);
        addMessage("System", `Error: ${data.message}`);
        toast.error(data.message);
        break;

      default:
        console.log("Unknown event:", event, data);
    }
  };

  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected to backend");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleEventRef.current(data);
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      wsRef.current?.close();
    };
  }, [connectWebSocket]);

  // Start the game
  const startGame = useCallback(
    (rounds = 4, turns = 8) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
        // Retry after connection
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({ action: "start_game", max_rounds: rounds, max_turns: turns })
            );
          } else {
            toast.error("Could not connect to backend");
          }
        }, 1000);
        return;
      }

      wsRef.current.send(
        JSON.stringify({ action: "start_game", max_rounds: rounds, max_turns: turns })
      );
    },
    [connectWebSocket],
  );

  // Manual message handler (for user typing in chat during non-game mode)
  const handleUserMessage = useCallback(
    async (text: string) => {
      addMessage("John Smith", text);
      // During a game, the chat is driven by the backend - manual input is view-only
      if (gameStatus === "running") {
        addMessage("System", "Chat is in observation mode during the red team exercise.");
        return;
      }
    },
    [addMessage, gameStatus],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const isConnected = wsRef.current?.readyState === WebSocket.OPEN;

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
    // Game state
    gameStatus,
    currentRound,
    currentTurn,
    maxRounds,
    roundResults,
    judgeMessages,
    startGame,
    isConnected,
  };
}
