import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Phone,
  Shield,
  Settings,
  MoreVertical,
  Users,
  Bot,
  Clock,
  FileText,
  AlertTriangle,
  UserCheck,
  Activity,
} from "lucide-react";
import { useBankSystem, type ChatMessage } from "../hooks/useBankSystem";
import { BankPortal } from "./BankPortal";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ─── Video Tile ─── */
function VideoTile({
  name,
  role,
  color,
  initials,
  isMuted = false,
  isActive = false,
  isSpeaking = false,
}: {
  name: string;
  role: string;
  color: string;
  initials: string;
  isMuted?: boolean;
  isActive?: boolean;
  isSpeaking?: boolean;
}) {
  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden bg-slate-900 w-full aspect-video transition-all duration-300",
      isActive
        ? "border-2 border-emerald-400 shadow-lg shadow-emerald-500/20"
        : isSpeaking
          ? "border-2 border-blue-400 shadow-lg shadow-blue-500/20"
          : "border border-slate-700/50",
    )}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm transition-transform",
            isSpeaking && "animate-pulse scale-110",
          )}
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
      </div>
      {isSpeaking && (
        <div className="absolute top-1 right-1 flex items-center gap-0.5">
          <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: "100ms" }} />
          <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
        <div className="flex items-center gap-1.5">
          {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
          <span className="text-[10px] text-white font-medium truncate">{name}</span>
          <span className="text-[9px] text-slate-400 truncate">{role}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Audit Log Sidebar ─── */
function AuditLog({ messages }: { messages: ChatMessage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const iconFor = (sender: string) => {
    switch (sender) {
      case "BankBot":
        return <Bot className="w-3.5 h-3.5 text-blue-500" />;
      case "John Smith":
        return <UserCheck className="w-3.5 h-3.5 text-slate-500" />;
      case "Judge":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case "Tester (Jamie)":
        return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
      {messages.length === 0 && (
        <div className="text-center py-6 text-slate-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Audit events will appear here</p>
        </div>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex items-start gap-2 text-[11px] rounded-md px-2 py-1.5",
            msg.sender === "BankBot"
              ? "bg-blue-50/50"
              : msg.sender === "Judge"
                ? "bg-amber-50/50"
                : msg.sender === "Tester (Jamie)"
                  ? "bg-emerald-50/50"
                  : "bg-slate-50",
          )}
        >
          <div className="mt-0.5 flex-shrink-0">{iconFor(msg.sender)}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">{msg.sender}</span>
              <span className="text-slate-400">{msg.timestamp}</span>
            </div>
            <p className="text-slate-600 mt-0.5 whitespace-pre-wrap break-words line-clamp-3">
              {msg.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function MeetUI() {
  const bank = useBankSystem();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { gameState } = bank;

  // Determine which participant is "speaking" based on game phase
  const speakingAgent = gameState.active
    ? gameState.phase === "tester_thinking"
      ? "Jamie"
      : gameState.phase === "bankbot_thinking"
        ? "BankBot"
        : gameState.phase === "judge_evaluating"
          ? "Judge"
          : null
    : null;

  const participants = [
    { name: "Judge", role: "Evaluator", color: "#d97706", initials: "JG" },
    { name: "Jamie", role: "Red Team", color: "#059669", initials: "JM" },
    { name: "John Smith", role: "Teller", color: "#2563eb", initials: "JS" },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="h-14 flex items-center justify-between px-4 bg-slate-900/80 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-none">
              Red Team Banking Agent — Live Session
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              {gameState.active ? (
                <>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Red Team Live · Round {gameState.currentRound}/{gameState.maxRounds} · Turn {gameState.currentTurn}/{gameState.maxTurns}
                </>
              ) : gameState.phase === "game_over" ? (
                <>
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Exercise Complete · {gameState.roundResults.filter(r => r.breached).length}/{gameState.roundResults.length} breached
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Ready · 3 participants · Teller: John Smith
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            00:12:34
          </button>
          <button className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Stage: Banking Portal ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-2 overflow-hidden">
            <div className="w-full h-full rounded-xl overflow-hidden border border-slate-700/50 bg-white">
              <BankPortal bank={bank} />
            </div>
          </div>

          {/* ── Controls Bar ── */}
          <div className="h-16 flex items-center justify-center gap-3 bg-slate-900/80 border-t border-slate-800 flex-shrink-0 px-4">
            <button
              onClick={() => setMicOn(!micOn)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                micOn
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white",
              )}
              title={micOn ? "Mute" : "Unmute"}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setVideoOn(!videoOn)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                videoOn
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white",
              )}
              title={videoOn ? "Turn off camera" : "Turn on camera"}
            >
              {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all">
              <MonitorUp className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-700" />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                sidebarOpen
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-white",
              )}
              title="Audit Log"
            >
              <Users className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-700" />
            <button className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all">
              <Phone className="w-4 h-4 rotate-[135deg]" />
            </button>
          </div>
        </div>

        {/* ── Sidebar: Participants + Audit ── */}
        {sidebarOpen && (
          <div className="w-72 flex flex-col bg-slate-900/60 border-l border-slate-800 flex-shrink-0">
            {/* Participant Tiles */}
            <div className="flex-shrink-0 px-2 pt-2">
              <div className="grid grid-cols-3 gap-1.5">
                {participants.map((p) => (
                  <VideoTile
                    key={p.name}
                    name={p.name}
                    role={p.role}
                    color={p.color}
                    initials={p.initials}
                    isMuted={p.name !== "John Smith"}
                    isSpeaking={speakingAgent === p.name}
                    isActive={
                      speakingAgent === p.name ||
                      (p.name === "John Smith" && speakingAgent === "BankBot")
                    }
                  />
                ))}
              </div>
            </div>

            {/* Audit Log */}
            <div className="flex items-center justify-between px-3 py-2 mt-1 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-300">Audit Log</span>
                {bank.messages.length > 0 && (
                  <span className="text-[9px] bg-blue-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                    {bank.messages.length}
                  </span>
                )}
              </div>
            </div>
            <AuditLog messages={bank.messages} />
          </div>
        )}
      </div>
    </div>
  );
}
