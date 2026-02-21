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
  Play,
  Square,
  Gavel,
  Radio,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useBankSystem, type ChatMessage, type RoundResult } from "../hooks/useBankSystem";
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
      "relative rounded-lg overflow-hidden bg-slate-900 border w-full aspect-video",
      isSpeaking ? "border-cyan-400/80 ring-1 ring-cyan-400/40" :
      isActive ? "border-green-500/70 ring-1 ring-green-500/30" : "border-slate-700/50"
    )}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm",
            isActive && "ring-2 ring-green-400 ring-offset-2 ring-offset-slate-900"
          )}
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
      </div>
      {isSpeaking ? (
        <div className="absolute top-1 right-1">
          <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
        </div>
      ) : isActive ? (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      ) : null}
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
                : msg.sender === "Tester (Jamie)" || msg.sender === "John Smith"
                  ? "bg-emerald-50/50"
                  : "bg-slate-50",
            msg.isThought && "opacity-60",
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

/* ─── Judge Output Panel ─── */
function JudgePanel({ verdicts, roundResults }: { verdicts: ChatMessage[]; roundResults: RoundResult[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [verdicts]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
      {verdicts.length === 0 && roundResults.length === 0 && (
        <div className="text-center py-6 text-slate-500">
          <Gavel className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Judge verdicts will appear here</p>
        </div>
      )}
      {/* Round result summary cards */}
      {roundResults.map((r) => (
        <div
          key={`result-${r.round}`}
          className={cn(
            "rounded-lg border px-3 py-2",
            r.leaked
              ? "bg-rose-50 border-rose-200"
              : "bg-emerald-50 border-emerald-200"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            {r.leaked ? (
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span className={cn(
              "text-[11px] font-bold",
              r.leaked ? "text-rose-700" : "text-emerald-700"
            )}>
              Round {r.round}: {r.leaked ? "BREACHED" : "DEFENDED"}
            </span>
            <span className="text-[9px] text-slate-400 ml-auto">{r.turns_used} turns</span>
          </div>
          <p className="text-[10px] text-slate-600 leading-snug line-clamp-3">{r.summary}</p>
        </div>
      ))}
      {/* Detailed judge messages */}
      {verdicts.map((msg) => (
        <div
          key={msg.id}
          className="bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-700">Judge Analysis</span>
            <span className="text-[9px] text-amber-400 ml-auto">{msg.timestamp}</span>
          </div>
          <p className="text-[10px] text-slate-700 whitespace-pre-wrap leading-snug">{msg.text}</p>
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
  const [sidebarTab, setSidebarTab] = useState<"audit" | "judge">("audit");

  // Determine which participant is "active" based on game state
  const lastMessage = bank.messages[bank.messages.length - 1];
  const activeSpeaker = bank.isTyping
    ? "BankBot"
    : lastMessage?.sender === "Judge"
      ? "Judge"
      : lastMessage?.sender === "John Smith"
        ? "Jamie"
        : lastMessage?.sender === "BankBot"
          ? "John Smith"
          : null;

  // Map speakingAgent (backend agent name) to participant display name
  const speakingName = bank.speakingAgent === "judge" ? "Judge"
    : bank.speakingAgent === "hacker" ? "Jamie"
    : bank.speakingAgent === "bankbot" ? "John Smith"
    : null;

  const participants = [
    { name: "Judge", role: "Evaluator", color: "#d97706", initials: "JG", isActive: activeSpeaker === "Judge", isSpeaking: speakingName === "Judge" },
    { name: "Jamie", role: "Red Team", color: "#059669", initials: "JM", isActive: activeSpeaker === "Jamie", isSpeaking: speakingName === "Jamie" },
    { name: "John Smith", role: "Teller", color: "#2563eb", initials: "JS", isActive: activeSpeaker === "John Smith", isSpeaking: speakingName === "John Smith" },
  ];

  const breachCount = bank.roundResults.filter((r) => r.leaked).length;

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
              {bank.gameStatus === "running" ? (
                <>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span>Recording</span>
                  <span className="text-slate-600">|</span>
                  <span>Round {bank.currentRound}/{bank.maxRounds}</span>
                  <span className="text-slate-600">|</span>
                  <span>Turn {bank.currentTurn}</span>
                </>
              ) : bank.gameStatus === "finished" ? (
                <>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  <span>Exercise Complete</span>
                  <span className="text-slate-600">|</span>
                  <span>{breachCount}/{bank.roundResults.length} breached</span>
                </>
              ) : (
                <>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    bank.isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                  )} />
                  <span>{bank.isConnected ? "Connected" : "Connecting..."}</span>
                  <span className="text-slate-600">|</span>
                  <span>3 participants</span>
                  <span className="text-slate-600">|</span>
                  <span>Teller: John Smith</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Game status badge */}
          {bank.gameStatus === "running" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
              <Radio className="w-3 h-3 text-red-400 animate-pulse" />
              <span className="text-[10px] font-bold text-red-300">LIVE</span>
            </div>
          )}
          {bank.gameStatus === "finished" && breachCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 border border-rose-500/30 rounded-lg">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span className="text-[10px] font-bold text-rose-300">{breachCount} BREACH{breachCount > 1 ? "ES" : ""}</span>
            </div>
          )}
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
            <button
              onClick={() => bank.setAudioEnabled(!bank.audioEnabled)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                bank.audioEnabled
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white",
              )}
              title={bank.audioEnabled ? "Mute TTS" : "Unmute TTS"}
            >
              {bank.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="w-px h-6 bg-slate-700" />

            {/* Start / Stop Game Button */}
            {bank.gameStatus === "idle" || bank.gameStatus === "finished" ? (
              <button
                onClick={() => bank.startGame(4, 8)}
                disabled={!bank.isConnected}
                className={cn(
                  "h-10 px-5 rounded-full flex items-center justify-center gap-2 transition-all font-bold text-[12px]",
                  bank.isConnected
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                )}
                title="Start Red Team Exercise"
              >
                <Play className="w-4 h-4" />
                {bank.gameStatus === "finished" ? "Restart" : "Start Exercise"}
              </button>
            ) : (
              <div className="h-10 px-5 rounded-full flex items-center justify-center gap-2 bg-red-600/30 border border-red-500/30 text-red-300 font-bold text-[12px]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Running...
              </div>
            )}

            <div className="w-px h-6 bg-slate-700" />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                sidebarOpen
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-white",
              )}
              title="Sidebar"
            >
              <Users className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-700" />
            <button className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all">
              <Phone className="w-4 h-4 rotate-[135deg]" />
            </button>
          </div>
        </div>

        {/* ── Sidebar: Participants + Audit/Judge ── */}
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
                    isActive={p.isActive}
                    isSpeaking={p.isSpeaking}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar Tab Switcher */}
            <div className="flex items-center px-3 py-2 mt-1 border-b border-slate-800 gap-1">
              <button
                onClick={() => setSidebarTab("audit")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                  sidebarTab === "audit"
                    ? "bg-blue-600/20 text-blue-300"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <FileText className="w-3 h-3" />
                Audit Log
                {bank.messages.length > 0 && (
                  <span className="text-[8px] bg-blue-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                    {bank.messages.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSidebarTab("judge")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                  sidebarTab === "judge"
                    ? "bg-amber-600/20 text-amber-300"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Gavel className="w-3 h-3" />
                Judge
                {bank.judgeMessages.length > 0 && (
                  <span className="text-[8px] bg-amber-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                    {bank.judgeMessages.length}
                  </span>
                )}
              </button>
            </div>

            {/* Panel Content */}
            {sidebarTab === "audit" ? (
              <AuditLog messages={bank.messages} />
            ) : (
              <JudgePanel verdicts={bank.judgeMessages} roundResults={bank.roundResults} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
