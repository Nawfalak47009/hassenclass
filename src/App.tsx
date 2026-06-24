import React, { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Key,
  Video,
  Users,
  GraduationCap,
  BookOpen,
  Lock,
  Code,
  Terminal,
  ArrowRight,
  Check,
  Copy,
  Search,
  Menu,
  X,
  Info,
  AlertTriangle,
  Sparkles,
  Play,
  ArrowUpRight,
  Activity,
  Server,
  BookOpenCheck,
  HelpCircle,
  RefreshCw
} from "lucide-react";

import {
  ALL_SECTIONS,
  SDK_REFERENCE_CODE,
  TUTORIAL_WORKFLOW,
  SDK_METHODS,
  type DocSection,
  type Endpoint,
  type CodeExample,
  type SdkMethodDoc
} from "./lib/docs-data";

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon?: any;
  badge?: string;
  children?: { id: string; label: string; badge?: string }[];
}

// ─── SEARCH INDEX DEFINITION ─────────────────────────────────────────────────
const SEARCH_INDEX = [
  { title: "Overview", group: "Getting Started", id: "overview" },
  { title: "Quickstart Guide", group: "Getting Started", id: "quickstart" },
  { title: "Authentication Protocols", group: "Getting Started", id: "authentication" },
  { title: "Primary Onboarding Workflow", group: "Getting Started", id: "workflow-visualizer" },
  ...ALL_SECTIONS.map((s) => ({ title: s.title, group: "Core APIs", id: s.id })),
  ...ALL_SECTIONS.flatMap((s) =>
    s.endpoints.map((ep) => ({
      title: `${ep.method} ${ep.path} — ${ep.description}`,
      group: s.title,
      id: s.id
    }))
  ),
  { title: "JavaScript / TypeScript SDK Reference", group: "SDK Reference", id: "sdk" },
  { title: "Error Handling & Response Codes", group: "Resources", id: "errors" },
  { title: "Interactive API Playground", group: "Tools", id: "playground" }
];

// ─── THE NAVIGATION STRUCT ───────────────────────────────────────────────────
const NAV_GROUPS: NavItem[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: CompassIcon,
    children: [
      { id: "overview", label: "Overview" },
      { id: "quickstart", label: "Quickstart" },
      { id: "authentication", label: "Authentication" },
      { id: "workflow-visualizer", label: "Onboarding Flow", badge: "Primary" }
    ]
  },
  {
    id: "core-apis",
    label: "Core APIs",
    icon: Server,
    children: [
      { id: "classrooms", label: "Classrooms API" },
      { id: "meetings", label: "Meetings API" },
      { id: "teachers", label: "Teachers API" },
      { id: "students", label: "Students API" },
      { id: "auth", label: "Teacher & Student Auth" },
      { id: "api-keys", label: "API Keys API" }
    ]
  },
  {
    id: "sdk-group",
    label: "SDK Reference",
    icon: Terminal,
    children: [{ id: "sdk", label: "JavaScript / TypeScript SDK" }]
  },
  {
    id: "resources",
    label: "Resources",
    icon: BookOpenCheck,
    children: [
      { id: "errors", label: "Error Handling" },
      { id: "playground", label: "API Playground", badge: "Live" }
    ]
  }
];

// Simple icon wrapper for navigation
function CompassIcon(props: any) {
  return <Activity className={props.className} size={16} />;
}

// ─── STYLING & UTILITIES ──────────────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Custom code highlighter helper
function highlightCode(code: string, lang: string): ReactNode {
  return (
    <div className="font-mono text-xs leading-5 text-zinc-300 select-text overflow-x-auto">
      {code.split("\n").map((line, li) => {
        // Simple regex tokenizing for coloring
        const parts = line.split(
          /(\"[^\"]*\"|\'[^\']*\'|`[^`]*`|\b(import|export|from|const|let|var|async|await|return|function|class|new|if|else|for|of|in|throw|try|catch|true|false|null|undefined|require|process|console|print)\b|https?:\/\/[^\s"']+|\/\/[^\n]*|#[^\n]*|-H\b|-X\b|-d\b|curl\b|Bearer\b)/g
        );
        return (
          <div key={li} className="flex min-w-0 py-0.5 hover:bg-white/[0.02]">
            <span className="select-none text-zinc-600 text-right w-6 mr-4 flex-shrink-0">
              {li + 1}
            </span>
            <span className="flex-1 min-w-0 break-all">
              {parts.map((tok, ti) => {
                if (!tok) return null;
                if (/^(\/\/|#)/.test(tok)) {
                  return <span key={ti} className="text-zinc-500 italic">{tok}</span>;
                }
                if (/^["'`]/.test(tok) || tok.startsWith("http")) {
                  return <span key={ti} className="text-emerald-400">{tok}</span>;
                }
                if (/^(import|export|from|const|let|var|async|await|return|function|class|new|if|else|for|of|in|throw|try|catch|require)$/.test(tok)) {
                  return <span key={ti} className="text-indigo-400 font-semibold">{tok}</span>;
                }
                if (/^(true|false|null|undefined)$/.test(tok)) {
                  return <span key={ti} className="text-amber-400 font-semibold">{tok}</span>;
                }
                if (/^(curl|-H|-X|-d|Bearer)$/.test(tok)) {
                  return <span key={ti} className="text-sky-400">{tok}</span>;
                }
                if (/^(process|console|print)$/.test(tok)) {
                  return <span key={ti} className="text-indigo-300">{tok}</span>;
                }
                return <span key={ti}>{tok}</span>;
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function SdkMethodAccordionItem({ doc }: { doc: SdkMethodDoc; key?: string | number }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl bg-[#090D14]/40 hover:bg-[#0C101A]/60 transition-all duration-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-sm font-mono font-semibold text-indigo-300 flex items-center gap-2">
            <Code size={14} className="text-indigo-400 flex-shrink-0" />
            <span className="truncate">hc.{doc.name}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{doc.description}</p>
        </div>
        <div className="text-slate-500 pl-3">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ArrowRight size={16} className="text-slate-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 bg-black/25"
          >
            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block mb-1">Description</span>
                <p className="text-xs text-slate-300 leading-relaxed">{doc.description}</p>
              </div>

              {doc.parameters.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block mb-1.5">Parameters</span>
                  <div className="space-y-1.5 border border-white/5 rounded-lg overflow-hidden bg-black/10">
                    {doc.parameters.map((param) => (
                      <div key={param.name} className="flex flex-col sm:flex-row sm:items-center px-3 py-2 border-b last:border-b-0 border-white/5 text-xs">
                        <div className="flex items-center gap-1.5 w-full sm:w-1/3">
                          <span className="font-mono font-bold text-zinc-200">{param.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({param.type})</span>
                          {param.required && (
                            <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded uppercase font-bold">Req</span>
                          )}
                        </div>
                        <div className="text-slate-400 mt-1 sm:mt-0 flex-1">{param.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block mb-1.5">Example Usage</span>
                  <div className="bg-[#05070A] border border-white/5 rounded-lg p-3">
                    {highlightCode(doc.example, "typescript")}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block mb-1.5">Return Value</span>
                  <div className="bg-[#05070A] border border-white/5 rounded-lg p-3">
                    {highlightCode(doc.returnValue, "json")}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Interactive Stepper for Primary Workflow
function OnboardingWorkflow() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeStep = TUTORIAL_WORKFLOW[activeStepIdx];

  // Map each step to realistic exact code representation based strictly on real endpoints
  const getStepCode = (stepNum: string) => {
    switch (stepNum) {
      case "1":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/api-keys \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Root Server Key"
  }'`
        };
      case "2":
        return {
          lang: "TypeScript",
          code: `import { HassenClass } from "@hassenclass/sdk";

const hc = new HassenClass({ apiKey: "hc_live_xxxxx" });

const classroom = await hc.createClassroom({
  name: "Physics 101 Lecture",
  description: "Grade 12 Physics Course"
});

console.log(classroom.classroomId); // "cls_abc123"`
        };
      case "3":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/teachers \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Smith",
    "email": "janesmith@school.com"
  }'`
        };
      case "4":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/students \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "johndoe@student.com"
  }'`
        };
      case "5":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/classrooms/cls_abc123/members \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "memberId": "tch_mno123",
    "memberType": "teacher"
  }'`
        };
      case "6":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/classrooms/cls_abc123/members \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "memberId": "stu_xyz789",
    "memberType": "student"
  }'`
        };
      case "7":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/meetings \\
  -H "Authorization: Bearer hc_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "classroomId": "cls_abc123",
    "title": "Thermodynamics Class Room"
  }'`
        };
      case "8":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/teacher-auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "janesmith@school.com",
    "password": "secure_password_123"
  }'`
        };
      case "9":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/meetings/mtg_789xyz/start \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        };
      case "10":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/student-auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "johndoe@student.com",
    "password": "student_secure_pass"
  }'`
        };
      case "11":
        return {
          lang: "cURL",
          code: `curl https://api.hassenclass.in/meetings/mtg_789xyz/join \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni..."`
        };
      case "12":
        return {
          lang: "cURL",
          code: `curl -X POST https://api.hassenclass.in/meetings/mtg_789xyz/end \\
  -H "Authorization: Bearer hc_live_xxxxx"`
        };
      default:
        return { lang: "cURL", code: "" };
    }
  };

  const sample = getStepCode(activeStep.step);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div id="workflow-visualizer" className="scroll-mt-20 my-12 bg-[#080A0E] rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-[#080A0E]/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Interactive Workflow
          </span>
          <span className="text-slate-500 text-xs font-mono">• Primary Onboarding</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Full Platform Onboarding Lifecycle</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Follow the exact chronological workflow to spin up classrooms, registers, staff, and initiate active live meeting streams.
        </p>
      </div>

      <div className="grid lg:grid-cols-12">
        {/* Left Column - Stepper Stepping List */}
        <div className="lg:col-span-5 border-r border-white/10 max-h-[480px] overflow-y-auto divide-y divide-white/5 scrollbar-thin">
          {TUTORIAL_WORKFLOW.map((step, idx) => {
            const isSelected = activeStepIdx === idx;
            return (
              <button
                key={step.step}
                onClick={() => setActiveStepIdx(idx)}
                className={cn(
                  "w-full text-left p-4 transition-all flex gap-3 items-start",
                  isSelected ? "bg-indigo-950/20 text-white" : "hover:bg-white/5 text-slate-400"
                )}
              >
                <span className={cn(
                  "w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5",
                  isSelected ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400"
                )}>
                  {step.step}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", isSelected ? "text-white" : "text-slate-300")}>
                      {step.title}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{step.actor}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column - Selected Step Info & Code Block */}
        <div className="lg:col-span-7 p-6 bg-[#080A0E] flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">STEP {activeStep.step}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-indigo-400 font-medium tracking-wide uppercase">{activeStep.actor}</span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-white/5 rounded border border-white/10 text-slate-400 font-mono">
                Real API
              </span>
            </div>

            <h4 className="text-base font-medium text-white mb-2">{activeStep.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {activeStep.desc}
            </p>
          </div>

          <div className="bg-[#0B0E14] rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#080A0E] border-b border-white/10">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{sample.lang}</span>
              <button
                onClick={copyToClipboard}
                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 py-0.5 px-2 rounded hover:bg-white/5"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400 text-[11px] font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-[#080A0E] overflow-x-auto select-all max-h-56">
              {highlightCode(sample.code, sample.lang)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CODE TAB CONTAINER ──────────────────────────────────────────────────────
function CodeTabViewer({ examples }: { examples: CodeExample[] }) {
  const [activeLangIdx, setActiveLangIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeExample = examples[activeLangIdx] ?? examples[0];

  const handleCopy = () => {
    if (!activeExample) return;
    navigator.clipboard.writeText(activeExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!examples || examples.length === 0) return null;

  return (
    <div className="bg-[#080A0E] border border-white/10 rounded-xl overflow-hidden mt-4">
      {/* Tab select bar */}
      <div className="flex items-center justify-between px-4 bg-[#080A0E]/80 border-b border-white/10">
        <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
          {examples.map((ex, i) => (
            <button
              key={ex.lang}
              onClick={() => {
                setActiveLangIdx(i);
                setCopied(false);
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-mono rounded transition-all",
                activeLangIdx === i
                  ? "bg-white/5 text-indigo-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {ex.lang}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white p-1.5 rounded transition-all flex items-center gap-1"
          title="Copy to Clipboard"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span className="text-[10px] font-mono">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Code body block */}
      <pre className="p-4 bg-[#080A0E]/90 overflow-x-auto">
        {highlightCode(activeExample.code, activeExample.lang)}
      </pre>
    </div>
  );
}

// ─── COMPREHENSIVE DOCUMENTATION CARD ─────────────────────────────────────────
function DocumentationCard({ ep }: { ep: Endpoint; key?: string | number }) {
  const [copiedResponse, setCopiedResponse] = useState(false);

  const methodColor =
    ep.method === "POST"
      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

  return (
    <div className="grid lg:grid-cols-2 gap-8 py-10 border-b border-white/5 items-start">
      {/* Left half: Details & Params table */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={cn("px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border tracking-wider", methodColor)}>
              {ep.method}
            </span>
            <code className="text-zinc-100 font-mono text-sm font-bold select-all bg-zinc-900/80 px-2 py-0.5 rounded">
              {ep.path}
            </code>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mt-2">{ep.description}</p>
        </div>

        {/* Use-cases & details */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-xs">
            <p className="font-semibold text-zinc-500 uppercase tracking-wider mb-1">When to Use</p>
            <p className="text-zinc-300 leading-relaxed">{ep.whenToUse}</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-xs">
            <p className="font-semibold text-zinc-500 uppercase tracking-wider mb-1">Rate Limit</p>
            <p className="text-zinc-300 font-mono">{ep.rateLimits}</p>
          </div>
        </div>

        {/* Real World Use Case */}
        <div className="p-3.5 rounded-lg bg-emerald-950/10 border border-emerald-500/10 text-xs flex gap-2.5 items-start">
          <Sparkles className="text-emerald-400 mt-0.5 flex-shrink-0" size={14} />
          <div>
            <span className="font-semibold text-emerald-300">Real-World Application: </span>
            <span className="text-zinc-300 leading-relaxed">{ep.realWorldUseCase}</span>
          </div>
        </div>

        {/* Params lists */}
        {ep.params && ep.params.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request Parameters</h4>
            <div className="border border-white/10 rounded-lg overflow-hidden bg-[#080A0E]/30">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-2.5 text-slate-400 font-medium">Name</th>
                    <th className="p-2.5 text-slate-400 font-medium">Type</th>
                    <th className="p-2.5 text-slate-400 font-medium">Status</th>
                    <th className="p-2.5 text-slate-400 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ep.params.map((p) => (
                    <tr key={p.name} className="hover:bg-white/5">
                      <td className="p-2.5 font-mono text-indigo-400 font-medium">{p.name}</td>
                      <td className="p-2.5 font-mono text-slate-500 text-[10px]">{p.type}</td>
                      <td className="p-2.5">
                        {p.required ? (
                          <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/10 rounded text-[10px]">
                            required
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">optional</span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-400 leading-relaxed text-[11px]">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Right half: code examples and payload previews */}
      <div className="space-y-4 lg:sticky lg:top-24">
        {/* Request Sample Tabs */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request Code Example</p>
          <CodeTabViewer examples={ep.examples} />
        </div>

        {/* Response JSON Object block */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Example Response (200 OK)</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(ep.responseBody, null, 2));
                setCopiedResponse(true);
                setTimeout(() => setCopiedResponse(false), 1500);
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1"
            >
              {copiedResponse ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copiedResponse ? "Copied" : "Copy JSON"}
            </button>
          </div>
          <div className="bg-[#080A0E] border border-white/10 rounded-lg p-3.5 max-h-64 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed">
            <pre>{JSON.stringify(ep.responseBody, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INTERACTIVE API PLAYGROUND ──────────────────────────────────────────────
function InteractivePlayground() {
  const [apiKey, setApiKey] = useState("hc_live_xxxxxxxxxxxxxxxxxxxx");
  const [method, setMethod] = useState<"GET" | "POST">("POST");
  const [endpoint, setEndpoint] = useState("/classrooms");
  const [reqBody, setReqBody] = useState(`{\n  "name": "Chemistry Lecture Room",\n  "description": "Introduction to Organic Molecules"\n}`);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  // Auto update request body template based on selected endpoint
  const handleEndpointChange = (path: string) => {
    setEndpoint(path);
    if (path === "/classrooms") {
      setMethod("POST");
      setReqBody(`{\n  "name": "Chemistry Lecture Room",\n  "description": "Introduction to Organic Molecules"\n}`);
    } else if (path === "/meetings") {
      setMethod("POST");
      setReqBody(`{\n  "classroomId": "cls_abc123",\n  "title": "Semester 1 Chemistry Final Review"\n}`);
    } else if (path === "/teachers") {
      setMethod("POST");
      setReqBody(`{\n  "name": "Dr. Alan Turing",\n  "email": "turing@computer.edu"\n}`);
    } else if (path === "/students") {
      setMethod("POST");
      setReqBody(`{\n  "name": "Grace Hopper",\n  "email": "grace@compilers.org"\n}`);
    } else if (path === "/teacher-auth/login") {
      setMethod("POST");
      setReqBody(`{\n  "email": "janesmith@school.com",\n  "password": "secure_password_123"\n}`);
    } else if (path === "/student-auth/login") {
      setMethod("POST");
      setReqBody(`{\n  "email": "johndoe@student.com",\n  "password": "student_secure_pass"\n}`);
    } else if (path === "/api-keys") {
      setMethod("POST");
      setReqBody(`{}`);
    } else {
      setMethod("GET");
      setReqBody("");
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setResponse(null);

    // Artificial timing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validations
    if (!apiKey) {
      setResponse({
        statusCode: 401,
        error: "UNAUTHORIZED",
        message: "Missing API Key. Pass 'hc_live_xxxxx' or 'hc_test_xxxxx' in Authorization header."
      });
      setLoading(false);
      return;
    }

    if (!apiKey.startsWith("hc_live_") && !apiKey.startsWith("hc_test_")) {
      setResponse({
        statusCode: 401,
        error: "UNAUTHORIZED",
        message: "Invalid API Key signature. Real HassenClass keys must start with 'hc_live_' or 'hc_test_'"
      });
      setLoading(false);
      return;
    }

    // Try parsing req body if POST
    let parsedBody: any = {};
    if (method === "POST" && reqBody) {
      try {
        parsedBody = JSON.parse(reqBody);
      } catch (err) {
        setResponse({
          statusCode: 422,
          error: "VALIDATION_ERROR",
          message: "Failed to parse body JSON payload. Ensure keys and values are double-quoted."
        });
        setLoading(false);
        return;
      }
    }

    // Generate accurate response payload based on the real endpoints selected
    if (endpoint === "/classrooms") {
      if (method === "POST") {
        setResponse({
          classroomId: "cls_" + Math.random().toString(36).substring(2, 9),
          name: parsedBody.name || "Untitled Class",
          description: parsedBody.description || "No description provided",
          createdAt: new Date().toISOString()
        });
      } else {
        setResponse({
          classrooms: [
            { classroomId: "cls_abc123", name: "Physics 101", description: "Grade 12 Physics Course", createdAt: "2026-06-24T10:30:00.000Z" },
            { classroomId: "cls_j8s9a1", name: parsedBody.name || "Chemistry Laboratory", description: "Chemistry Course", createdAt: new Date().toISOString() }
          ]
        });
      }
    } else if (endpoint === "/meetings") {
      if (method === "POST") {
        setResponse({
          meetingId: "mtg_" + Math.random().toString(36).substring(2, 9),
          jitsiRoom: "room_" + Math.random().toString(36).substring(2, 8)
        });
      } else {
        setResponse({
          meetings: [
            { meetingId: "mtg_789xyz", classroomId: "cls_abc123", title: "Thermodynamics Lecture", status: "live", joinUrl: "https://meet.hassenclass.in/room_thermo_lecture" }
          ]
        });
      }
    } else if (endpoint === "/teachers") {
      if (method === "POST") {
        setResponse({
          teacherId: "tch_" + Math.random().toString(36).substring(2, 9),
          name: parsedBody.name || "New Teacher",
          email: parsedBody.email || "teacher@hassenclass.in",
          createdAt: new Date().toISOString()
        });
      } else {
        setResponse({
          teachers: [
            { teacherId: "tch_mno123", name: "Jane Smith", email: "janesmith@school.com" }
          ]
        });
      }
    } else if (endpoint === "/students") {
      if (method === "POST") {
        setResponse({
          studentId: "stu_" + Math.random().toString(36).substring(2, 9),
          name: parsedBody.name || "New Student",
          email: parsedBody.email || "student@hassenclass.in",
          createdAt: new Date().toISOString()
        });
      } else {
        setResponse({
          students: [
            { studentId: "stu_xyz789", name: "John Doe", email: "johndoe@student.com" }
          ]
        });
      }
    } else if (endpoint === "/teacher-auth/login") {
      setResponse({
        accessToken: "eyJhbGciOiJIUzI1Ni...",
        teacherId: "tch_123",
        role: "teacher",
        email: parsedBody.email || "teacher@example.com"
      });
    } else if (endpoint === "/student-auth/login") {
      setResponse({
        accessToken: "eyJhbGciOiJIUzI1Ni...",
        studentId: "stu_123",
        role: "student",
        email: parsedBody.email || "student@example.com"
      });
    } else if (endpoint === "/api-keys") {
      if (method === "POST") {
        setResponse({
          apiKey: "hc_live_xxxxxxxxxxxx",
          active: true,
          createdAt: new Date().toISOString()
        });
      } else {
        setResponse([
          {
            apiKey: "hc_live_xxxxxxxxxxxx",
            active: true,
            createdAt: "2026-06-24T12:00:00.000Z"
          }
        ]);
      }
    } else {
      setResponse({
        statusCode: 404,
        error: "NOT_FOUND",
        message: `Endpoint ${method} ${endpoint} not found.`
      });
    }

    setLoading(false);
  };

  return (
    <div id="playground" className="scroll-mt-20 my-12 bg-[#080A0E] rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-[#080A0E]/50 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider">Documentation Sandbox</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Interactive API Sandbox</h3>
          <p className="text-xs text-slate-400 mt-0.5">Explore example requests and responses for HassenClass APIs</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        {/* Left Inputs block */}
        <div className="p-6 space-y-4">
          {/* Auth input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Authorization API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-slate-500" size={14} />
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="hc_live_xxxxx"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Endpoint selector Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Method
              </label>
              <select
                value={method}
                onChange={(e: any) => setMethod(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Endpoint Profile
              </label>
              <select
                value={endpoint}
                onChange={(e) => handleEndpointChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="/classrooms">/classrooms</option>
                <option value="/meetings">/meetings</option>
                <option value="/teachers">/teachers</option>
                <option value="/students">/students</option>
                <option value="/teacher-auth/login">/teacher-auth/login</option>
                <option value="/student-auth/login">/student-auth/login</option>
                <option value="/api-keys">/api-keys</option>
              </select>
            </div>
          </div>

          {/* Request payload */}
          {method === "POST" && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                JSON Body Payload
              </label>
              <textarea
                value={reqBody}
                onChange={(e) => setReqBody(e.target.value)}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={14} />
                <span>Running Request...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Send Mock API Request</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output View */}
        <div className="p-6 bg-[#080A0E] flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Response Payload</p>
              <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wide">
                Documentation Sandbox Response
              </span>
            </div>

            <div className="mb-4 p-3 rounded-lg border border-white/5 bg-white/[0.02] text-[10.5px] text-slate-400 leading-relaxed">
              <Info className="inline-block mr-1 text-slate-400 align-text-bottom" size={12} />
              Responses shown in the playground are representative examples and may differ from live production data.
            </div>

            {response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold border",
                      response.error
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {response.error ? response.statusCode : "200 OK"}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">JSON Format</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">Mock Example Response</span>
                </div>

                <div className="bg-[#0B0E14] border border-white/10 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-72">
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 text-slate-600">
                <Terminal size={32} className="stroke-1 mb-2 text-slate-700" />
                <p className="text-xs">No request sent yet.</p>
                <p className="text-[10px] mt-1 max-w-xs">Select options and click the run button to check interactive responses.</p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 flex justify-between items-center border-t border-white/5 pt-4 mt-4">
            <span>Base Domain: api.hassenclass.in</span>
            <span>Version: v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOM SEARCH DIALOG MODAL ──────────────────────────────────────────────
function SearchModal({ onClose, onSelectResult }: { onClose: () => void; onSelectResult: (id: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const filteredResults = SEARCH_INDEX.filter((item) => {
    if (!searchTerm) return true;
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.group.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).slice(0, 8);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#080A0E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="text-slate-500" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documentation, methods, or resources..."
            className="w-full bg-transparent text-white placeholder-slate-600 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10"
          >
            ESC
          </button>
        </div>

        <div className="py-2 max-h-80 overflow-y-auto">
          {filteredResults.length === 0 ? (
            <p className="px-4 py-8 text-slate-500 text-center text-xs">
              No matching documentation resources found.
            </p>
          ) : (
            filteredResults.map((res, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectResult(res.id);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-white/5 flex justify-between items-center transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 group-hover:text-indigo-400 font-medium truncate">
                    {res.title}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{res.group}</p>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-white/5 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>Use ⌘ K to open this menu</span>
          <span>HassenClass API Docs</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT PAGE ─────────────────────────────────────────────────────
export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // Keyboard binding for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync scroll detection for side navigation
  useEffect(() => {
    const handleScroll = () => {
      const ids = [
        "overview",
        "quickstart",
        "authentication",
        "workflow-visualizer",
        "classrooms",
        "meetings",
        "teachers",
        "students",
        "auth",
        "api-keys",
        "sdk",
        "errors",
        "playground"
      ];
      const scrollPosition = window.scrollY + 120;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    // Timing delay to allow rendering
    setTimeout(() => {
      scrollTo(id);
    }, 50);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-[#0B0E14] text-slate-300 font-sans min-h-screen antialiased select-none selection:bg-indigo-500/20 selection:text-indigo-300">
      
      {/* Search overlay modal dialog */}
      <AnimatePresence>
        {searchOpen && (
          <SearchModal
            onClose={() => setSearchOpen(false)}
            onSelectResult={navigateToSection}
          />
        )}
      </AnimatePresence>

      {/* Top sticky navigation bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#0B0E14]/85 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-indigo-500/25">
              <div className="w-3 h-3 border-2 border-white transform rotate-45"></div>
            </div>
            <span className="font-bold text-white tracking-tight text-base">HassenClass</span>
            <span className="px-1.5 py-0.2 rounded bg-white/5 text-slate-400 text-[10px] font-mono border border-white/5">v1.0</span>
          </div>

          <span className="hidden sm:inline text-white/10">|</span>

          {/* Search bar button trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-300 text-xs py-1.5 px-3 rounded-lg transition-all min-w-[240px] text-left"
          >
            <Search size={13} />
            <span className="flex-1">Search documentation...</span>
            <span className="text-[10px] font-mono text-slate-400 bg-[#0B0E14] px-1.5 py-0.5 rounded border border-white/10">
              ⌘K
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://meet.hassenclass.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-all font-medium"
          >
            <span>Meeting Server</span>
            <ArrowUpRight size={12} className="text-slate-500" />
          </a>
          <button
            onClick={() => navigateToSection("playground")}
            className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Documentation Sandbox
          </button>
        </div>
      </header>

      {/* Main container layout */}
      <div className="flex pt-14">
        
        {/* Left Desktop Sidebar Navigation */}
        <aside className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 border-r border-white/5 bg-[#0B0E14] overflow-y-auto p-4 select-none scrollbar-thin">
          <div className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-1 mb-1.5">
                  <group.icon className="text-slate-500" size={14} />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    {group.label}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {group.children?.map((child) => {
                    const isActive = activeSection === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => navigateToSection(child.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs rounded transition-all flex items-center justify-between",
                          isActive
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 font-semibold"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <span>{child.label}</span>
                        {child.badge && (
                          <span className="px-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 text-[9px] font-mono">
                            {child.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Sidebar overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 pt-14">
              <div
                onClick={() => setMobileMenuOpen(false)}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute left-0 top-14 bottom-0 w-64 bg-[#0B0E14] border-r border-white/5 p-4 overflow-y-auto"
              >
                <div className="space-y-6">
                  {NAV_GROUPS.map((group) => (
                    <div key={group.id} className="space-y-1">
                      <div className="flex items-center gap-2 px-3 py-1 mb-1.5">
                        <group.icon className="text-slate-500" size={14} />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                          {group.label}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        {group.children?.map((child) => {
                          const isActive = activeSection === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={() => navigateToSection(child.id)}
                              className={cn(
                                "w-full text-left px-3 py-2 text-xs rounded transition-all flex items-center justify-between",
                                isActive
                                  ? "bg-indigo-500/10 text-indigo-400 font-semibold"
                                  : "text-slate-400 hover:text-white"
                              )}
                            >
                              <span>{child.label}</span>
                              {child.badge && (
                                <span className="px-1 rounded bg-indigo-500/10 text-indigo-400 text-[9px]">
                                  {child.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Main core content viewport */}
        <main className="flex-1 lg:ml-64 p-6 sm:p-12 max-w-6xl overflow-hidden select-text">
          
          {/* OVERVIEW SECTION */}
          <section id="overview" className="scroll-mt-20 py-6 border-b border-white/5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/15 text-indigo-400 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
              Real HassenClass API v1.0
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              LMS Video Infrastructure API
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg mt-4 max-w-2xl leading-relaxed">
              HassenClass provides direct, clean, and reliable LMS video infrastructure. Build, launch, and control virtual classrooms, schedules, registers, and audio-video streams with complete architectural honesty.
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 rounded-xl border border-white/5 bg-[#080A0E]">
                <span className="text-lg">Classrooms</span>
                <p className="text-slate-500 text-xs mt-1">Spin up courses, assign students, and map registers.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-[#080A0E]">
                <span className="text-lg">Meetings</span>
                <p className="text-slate-500 text-xs mt-1">Initialize WebRTC video spaces hosted on meet.hassenclass.in.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-[#080A0E]">
                <span className="text-lg">Authentications</span>
                <p className="text-slate-500 text-xs mt-1">Directly verify students and teachers on your frontend.</p>
              </div>
            </div>
          </section>

          {/* QUICKSTART SECTION */}
          <section id="quickstart" className="scroll-mt-20 py-10 border-b border-white/5">
            <h2 className="text-2xl font-bold text-white mb-2">Quickstart</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xl">
              From zero to an active classroom in minutes. Install our NPM library, configure your server keys, and trigger your first room.
            </p>

            <div className="space-y-6">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2 font-mono">1. Install NPM Package</span>
                <div className="bg-[#080A0E] border border-white/10 rounded-lg p-3.5 flex items-center justify-between">
                  <code className="text-indigo-400 font-mono text-xs select-all">npm install @hassenclass/sdk</code>
                  <button
                    onClick={() => copyToClipboard("npm install @hassenclass/sdk")}
                    className="text-slate-500 hover:text-white"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2 font-mono">2. Initialize Client</span>
                <div className="bg-[#080A0E] border border-white/10 rounded-lg p-3.5 overflow-x-auto">
                  <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                    {`import { HassenClass } from "@hassenclass/sdk";

const hc = new HassenClass({
  apiKey: process.env.HC_API_KEY! // Key of form hc_live_xxxxx
});`}
                  </pre>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2 font-mono">3. Create and Query classrooms</span>
                <div className="bg-[#080A0E] border border-white/10 rounded-lg p-3.5 overflow-x-auto">
                  <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                    {`// Create classroom profile
const classroom = await hc.createClassroom({
  name: "Physics 101",
  description: "Grade 12 Physics Course"
});

console.log(classroom.classroomId); // "cls_abc123"`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* AUTHENTICATION OVERVIEW */}
          <section id="authentication" className="scroll-mt-20 py-10 border-b border-white/5">
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Protocols</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xl">
              HassenClass authenticates all server-to-server requests using Bearer token keys. Programmatic requests must present your active API key.
            </p>

            <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-300 text-xs leading-relaxed flex gap-3 mb-6">
              <AlertTriangle className="text-rose-400 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-semibold block mb-0.5">Crucial Secret Management</span>
                Keep your <code className="bg-rose-950/40 text-rose-300 px-1 rounded font-mono">hc_live_xxxxx</code> keys strictly protected. Never commit credentials to public code repositories, or expose them client-side inside standard browser viewport scripts.
              </div>
            </div>

            <div className="bg-[#080A0E] border border-white/10 rounded-lg p-3.5">
              <div className="flex items-center gap-1 text-xs font-mono">
                <span className="text-slate-500">Authorization:</span>
                <span className="text-indigo-400 font-semibold">Bearer</span>
                <span className="text-emerald-400 select-all">hc_live_xxxxxxxxxxxxxxxxxxxx</span>
              </div>
            </div>
          </section>

          {/* TUTORIAL WORKFLOW VISUALIZER */}
          <section id="workflow-visualizer" className="scroll-mt-20 py-10 border-b border-white/5">
            <h2 className="text-2xl font-bold text-white mb-2 font-sans">Primary Onboarding Flow</h2>
            <p className="text-slate-400 text-sm mb-4 max-w-xl">
              This interactive blueprint tracks the exact sequence of lifecycle steps required to set up an operational virtual classroom.
            </p>
            <OnboardingWorkflow />
          </section>

          {/* ALL CORE APIs */}
          <div className="space-y-6">
            <div className="pt-8">
              <h2 className="text-2xl font-bold text-white font-sans">Core APIs Reference</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Comprehensive directory listing of all physical backend REST endpoints on our core server architecture.
              </p>
            </div>

            {ALL_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20 py-8 border-b border-white/5">
                <div className="mb-4">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold text-white">{section.title}</h3>
                    {section.badge && (
                      <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 max-w-2xl leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {section.endpoints.map((ep) => (
                    <DocumentationCard key={`${ep.method}-${ep.path}`} ep={ep} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* SDK REFERENCE */}
          <section id="sdk" className="scroll-mt-20 py-10 border-b border-white/5">
            <h2 className="text-2xl font-bold text-white mb-2">JavaScript / TypeScript SDK</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xl">
              Our lightweight, zero-dependency Node SDK is built to communicate with HassenClass with robust type-safety.
            </p>

            <div className="p-4 rounded-xl border border-indigo-500/15 bg-indigo-500/5 text-indigo-300 text-xs leading-relaxed flex gap-3 mb-6">
              <Info className="text-indigo-400 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-semibold block mb-0.5">Comprehensive SDK Coverage</span>
                The HassenClass NPM package is fully featured, supporting classroom management, member registration, scheduling live meetings, and teacher/student account creation.
              </div>
            </div>

            <div className="bg-[#080A0E] border border-white/10 rounded-xl overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 bg-[#080A0E] border-b border-white/10">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">TypeScript SDK Setup & Examples</span>
                <button
                  onClick={() => copyToClipboard(SDK_REFERENCE_CODE)}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Copy size={12} />
                  <span className="text-[11px] font-mono">Copy SDK Code</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto max-h-[420px]">
                {highlightCode(SDK_REFERENCE_CODE, "typescript")}
              </pre>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white mb-4">Complete Method Reference</h3>
              <div className="space-y-3">
                {SDK_METHODS.map((methodDoc) => (
                  <SdkMethodAccordionItem key={methodDoc.name} doc={methodDoc} />
                ))}
              </div>
            </div>
          </section>

          {/* ERROR HANDLING CATALOG */}
          <section id="errors" className="scroll-mt-20 py-10 border-b border-white/5">
            <h2 className="text-2xl font-bold text-white mb-2">Error Handling</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xl">
              Our REST endpoints follow a consistent error return format. Catch error structures to safeguard user flows.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5">
                <span className="text-rose-400 font-mono text-xs font-bold block mb-1">401 UNAUTHORIZED</span>
                <p className="text-slate-400 text-xs leading-relaxed">Invalid, missing, or compromised API security key credentials.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-[#080A0E]">
                <span className="text-amber-400 font-mono text-xs font-bold block mb-1">404 NOT_FOUND</span>
                <p className="text-slate-400 text-xs leading-relaxed">The targeted meeting room, user, classroom profile, or key does not exist.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-[#080A0E]">
                <span className="text-slate-400 font-mono text-xs font-bold block mb-1">500 INTERNAL_ERROR</span>
                <p className="text-slate-400 text-xs leading-relaxed">Unexpected service disruptions on backend servers.</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Standard JSON Error Payload Samples</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* 401 Error body */}
                <div className="bg-[#080A0E] border border-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-semibold text-rose-400 font-mono">401 UNAUTHORIZED</span>
                    <span className="text-[9px] text-slate-500 font-mono">Header Failure</span>
                  </div>
                  <pre className="font-mono text-[11px] text-slate-400 leading-relaxed">
                    {`{
  "statusCode": 401,
  "error": "UNAUTHORIZED",
  "message": "Invalid API Key"
}`}
                  </pre>
                </div>

                {/* 404 Error body */}
                <div className="bg-[#080A0E] border border-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-semibold text-amber-400 font-mono">404 NOT_FOUND</span>
                    <span className="text-[9px] text-slate-500 font-mono">ID Failure</span>
                  </div>
                  <pre className="font-mono text-[11px] text-slate-400 leading-relaxed">
                    {`{
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "Meeting not found"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* PLAYGROUND SECTION */}
          <section id="playground" className="scroll-mt-20 py-10">
            <h2 className="text-2xl font-bold text-white mb-2">Sandbox Console</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xl">
              Simulate and view verified mock requests based on exact HassenClass structures.
            </p>
            <InteractivePlayground />
          </section>
        </main>
      </div>

      {/* Footer information section */}
      <footer className="border-t border-white/5 bg-[#080A0E] py-10 px-6 mt-12 text-center text-xs text-slate-500">
        <p className="mb-2">© 2026 HassenClass. All rights reserved.</p>
        <p className="mb-4 text-slate-600 max-w-md mx-auto">
          All examples and responses in this documentation are generated from the current HassenClass SDK and API implementation.
        </p>
        <div className="flex justify-center gap-4">
          <a href="#" className="hover:text-slate-300">Terms of Use</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <span>•</span>
          <a href="mailto:support@hassenclass.in" className="hover:text-slate-300">support@hassenclass.in</a>
        </div>
      </footer>
    </div>
  );
}
