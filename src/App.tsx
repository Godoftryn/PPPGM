/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  ListTodo,
  Layers,
  Cpu,
  AlertTriangle,
  Clipboard,
  CheckCircle2,
  Download,
  Printer,
  Plus,
  Search,
  Trash2,
  Clock,
  ArrowRightLeft,
  HelpCircle,
  Send,
  Check,
  FileSpreadsheet,
  FileCode2,
  X,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  TestReportData,
  TestMilestone,
  ActionItem,
  BOMItem,
  BOMComparisonResult,
} from "./types";
import {
  initialMilestones,
  initialActionItems,
  bomVersionA,
  bomVersionB,
  precomputedBOMDiff,
  glossaryTerms,
  GlossaryTerm,
} from "./data";

export default function App() {
  // Current active tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "report" | "schedule" | "tasks" | "bom" | "assistant">("dashboard");

  // System States
  const [milestones, setMilestones] = useState<TestMilestone[]>(initialMilestones);
  const [actionItems, setActionItems] = useState<ActionItem[]>(initialActionItems);
  const [reports, setReports] = useState<TestReportData[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<TestMilestone | null>(initialMilestones[0]);

  // Report Generator Form State
  const [reportForm, setReportForm] = useState({
    testName: "PGM-20 추진기관 1차 지상연소시험",
    chamberPressure: "5.4",
    combustionTemp: "2950",
    thrust: "45.2",
    burnTime: "15.6",
    targetValue: "98% 달성 (설계 압력 변동 허용치 이내)",
    comments: "초반 점화 과도 응답에서 압력 오버슈트가 약 4% 나타났으나, 0.5초 이내 안정 상태 도달함. 연소 종료 후 노즐 내벽 비접촉 3D 스캔 결과 삭마 현상은 예측 모델 대비 양호함.",
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeReportText, setActiveReportText] = useState<string>("");
  const [isPrintLayout, setIsPrintLayout] = useState(false);

  // New Action Item Form State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    department: "설계" as ActionItem["department"],
    assignee: "신입사원 (본인)",
    priority: "보통" as ActionItem["priority"],
    deadline: "",
    description: "",
  });

  // BOM Form States
  const [bomListA, setBomListA] = useState<BOMItem[]>(bomVersionA);
  const [bomListB, setBomListB] = useState<BOMItem[]>(bomVersionB);
  const [bomDiff, setBomDiff] = useState<BOMComparisonResult[]>(precomputedBOMDiff);
  const [isAddingPart, setIsAddingPart] = useState<"A" | "B" | null>(null);
  const [newPart, setNewPart] = useState<BOMItem>({
    partNo: "HW-PGM-",
    partName: "",
    qty: 1,
    material: "",
    revision: "Rev.1",
    notes: "",
  });

  // AI Assistant States
  const [assistantMode, setAssistantMode] = useState<"lookup" | "refine" | "minutes">("lookup");
  const [selectedGlossary, setSelectedGlossary] = useState<GlossaryTerm | null>(glossaryTerms[0]);
  const [assistantInput, setAssistantInput] = useState<string>("");
  const [assistantOutput, setAssistantOutput] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customTerm, setCustomTerm] = useState("");

  // KST/UTC Clock State
  const [currentTime, setCurrentTime] = useState<string>("");
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) + " (KST)");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handler for Toggle Checklist Item (Milestones)
  const handleToggleChecklist = (milestoneId: string, type: "pre" | "post", itemId: string) => {
    setMilestones((prev) =>
      prev.map((ms) => {
        if (ms.id !== milestoneId) return ms;
        const listName = type === "pre" ? "preChecklist" : "postChecklist";
        const updatedList = ms[listName].map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        const updatedMs = { ...ms, [listName]: updatedList };
        if (selectedMilestone && selectedMilestone.id === ms.id) {
          setSelectedMilestone(updatedMs);
        }
        return updatedMs;
      })
    );
  };

  // Handler for Status Toggle on Action Items
  const handleToggleActionItemStatus = (itemId: string) => {
    setActionItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextStatus: ActionItem["status"] =
          item.status === "대기" ? "진행중" : item.status === "진행중" ? "완료" : "대기";
        return { ...item, status: nextStatus };
      })
    );
  };

  // Handler for adding a new Action Item
  const handleCreateActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.deadline) return;

    const newItem: ActionItem = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      department: newTask.department,
      assignee: newTask.assignee,
      status: "대기",
      priority: newTask.priority,
      requestedDate: new Date().toISOString().split("T")[0],
      deadline: newTask.deadline,
      description: newTask.description,
    };

    setActionItems((prev) => [newItem, ...prev]);
    setShowTaskModal(false);
    setNewTask({
      title: "",
      department: "설계",
      assignee: "신입사원 (본인)",
      priority: "보통",
      deadline: "",
      description: "",
    });
  };

  // Handler for adding a part to BOM v1.0 or v1.1
  const handleAddBOMItem = (target: "A" | "B") => {
    if (!newPart.partNo || !newPart.partName) return;
    const targetList = target === "A" ? bomListA : bomListB;
    const updatedList = [...targetList, { ...newPart }];

    if (target === "A") setBomListA(updatedList);
    else setBomListB(updatedList);

    // Dynamic Recalculation of Difference for visual realism
    recalculateBOMDiff(target === "A" ? updatedList : bomListA, target === "B" ? updatedList : bomListB);

    setIsAddingPart(null);
    setNewPart({
      partNo: "HW-PGM-",
      partName: "",
      qty: 1,
      material: "",
      revision: "Rev.1",
      notes: "",
    });
  };

  // Simplified BOM diff engine to support client updates on part insertion
  const recalculateBOMDiff = (listA: BOMItem[], listB: BOMItem[]) => {
    const diff: BOMComparisonResult[] = [];
    const mapA = new Map(listA.map((item) => [item.partNo, item]));
    const mapB = new Map(listB.map((item) => [item.partNo, item]));

    // Check additions and updates
    listB.forEach((itemB) => {
      const itemA = mapA.get(itemB.partNo);
      if (!itemA) {
        diff.push({
          partNo: itemB.partNo,
          partName: itemB.partName,
          status: "추가",
          newQty: itemB.qty,
          newRevision: itemB.revision,
          newMaterial: itemB.material,
          manufacturingImpact: "신규 공급사 선정 상태 확인 및 라인 수동 조립 준비 점검.",
        });
      } else if (
        itemA.qty !== itemB.qty ||
        itemA.revision !== itemB.revision ||
        itemA.material !== itemB.material
      ) {
        diff.push({
          partNo: itemB.partNo,
          partName: itemB.partName,
          status: "수정",
          oldQty: itemA.qty,
          newQty: itemB.qty,
          oldRevision: itemA.revision,
          newRevision: itemB.revision,
          oldMaterial: itemA.material,
          newMaterial: itemB.material,
          manufacturingImpact: `리비전 및 물량 변동 검토 요망. 조립 치구 치수 호환성 및 수입검사(IQC) 프로세스 변경 사항 업데이트 필요.`,
        });
      }
    });

    // Check deletions
    listA.forEach((itemA) => {
      if (!mapB.has(itemA.partNo)) {
        diff.push({
          partNo: itemA.partNo,
          partName: itemA.partName,
          status: "삭제",
          oldQty: itemA.qty,
          oldRevision: itemA.revision,
          oldMaterial: itemA.material,
          manufacturingImpact: "단종 부품 보관 라인 철수 및 ERP 조립 공정 루트(Routing) 전면 업데이트 필수.",
        });
      }
    });

    // Keep unchanged for full list view simulation
    listB.forEach((itemB) => {
      const itemA = mapA.get(itemB.partNo);
      if (
        itemA &&
        itemA.qty === itemB.qty &&
        itemA.revision === itemB.revision &&
        itemA.material === itemB.material
      ) {
        diff.push({
          partNo: itemB.partNo,
          partName: itemB.partName,
          status: "유지",
          oldQty: itemA.qty,
          newQty: itemB.qty,
          oldRevision: itemA.revision,
          newRevision: itemB.revision,
          manufacturingImpact: "기존 가공 지침서 및 검사 전용 지그 동일 유지.",
        });
      }
    });

    setBomDiff(diff);
  };

  // call Backend API: Report generation
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm),
      });
      const data = await response.json();
      setActiveReportText(data.text);

      // Save to saved reports list
      const newSavedReport: TestReportData = {
        id: `report-${Date.now()}`,
        ...reportForm,
        chamberPressure: parseFloat(reportForm.chamberPressure),
        combustionTemp: parseFloat(reportForm.combustionTemp),
        thrust: parseFloat(reportForm.thrust),
        burnTime: parseFloat(reportForm.burnTime),
        generatedText: data.text,
        createdAt: new Date().toLocaleDateString("ko-KR") + " " + new Date().toLocaleTimeString("ko-KR"),
      };
      setReports((prev) => [newSavedReport, ...prev]);
    } catch (err) {
      console.error(err);
      alert("보고서 생성 중 오류가 발생했습니다. 로컬 백엔드를 다시 확인하십시오.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // call Backend API: AI Assistant (Refine, minutes, lookup)
  const handleAssistantAction = async (mode: "refine" | "minutes" | "lookup", targetText?: string) => {
    setIsAiLoading(true);
    setAssistantOutput("");
    try {
      const bodyPayload: any = { mode };
      if (mode === "lookup") {
        bodyPayload.term = targetText || customTerm;
      } else {
        bodyPayload.content = assistantInput;
      }

      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await response.json();
      setAssistantOutput(data.text);
    } catch (err) {
      console.error(err);
      setAssistantOutput("로컬 AI 엔진과 연결할 수 없습니다. Gemma API Key 설정 혹은 로컬 서버 포트를 체크해 주십시오.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Copy to Clipboard Utility
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("클립보드에 복사되었습니다! 아레아한글(HWP) 이나 MS Word 에 붙여넣어 즉시 활용하십시오.");
  };

  // Download File Utility
  const handleDownloadFile = (fileName: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Quick Action: Pre-populate Minutes Example
  const loadMinutesExample = () => {
    setAssistantInput(`7/15 PGM-20 2차 지상연소 추진제 충전공정 회의록 정리본

참석자: 김철수 팀장, 박민호 책임(설계), 이진우 과장(품질), 신입사원(제조기술)
안건: 지난 연소시험 시 발견된 지지 프레임 진동 주파수 간섭 개선안 및 차주 공정 계획

결정내용:
- 진동 완화를 위해 SUS304 지지 보스를 핀 장착식에서 플랜지 볼트 직결식으로 설계 변경하기로 박책임님이 합의함. 설계도면은 다음주 화요일까지 제조기술로 인계하기로 함.
- 품질팀 이과장님은 가스켓 O-링 조립 시 불소실리콘 고온 노화성적서 사안을 금요일 오전까지 피드백 해줘야 조립라인 통과가 됨.
- 신입사원은 조립라인 가이드 터닝 선반 전용 물량 치구 직경 개조 상태를 토요일까지 점검 마무리하고 시운전 완료해 놓을 것.`);
  };

  // Quick Action: Pre-populate Technical Refinement Example
  const loadRefineExample = () => {
    setAssistantInput(`압력도 잘 나왔고 온도도 대충 맞음. 근데 노즐 목이 약간 삭마되었는데 심하진 않고 예측 범위랑 비슷해 보여서 성공적인 시험 같다고 대충 결론 냄. 설계 변경 가스켓 써봤는데 가스 누설은 1도 안 보였음.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1a1f2c] text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-5 border-b border-slate-800 bg-[#141822]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold tracking-wider text-sm shadow-md shadow-orange-500/20">
              PGM
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">PGM Ops-Assistant</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">HANWHA AEROSPACE</p>
            </div>
          </div>
        </div>

        {/* User Badge */}
        <div className="p-4 mx-3 my-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
          <p className="text-[11px] text-slate-400">접속 중인 임직원</p>
          <p className="text-sm font-semibold text-white mt-0.5">신입사원 (PM / 제조기술)</p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>보안 연구망 오프라인 모드</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-2.5 space-y-1">
          <button
            onClick={() => { setActiveTab("dashboard"); setIsPrintLayout(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-orange-500 text-white shadow-sm"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            종합 대시보드
          </button>
          
          <button
            onClick={() => { setActiveTab("report"); setIsPrintLayout(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "report"
                ? "bg-orange-500 text-white shadow-sm"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4.5 h-4.5" />
            보고서 자동 생성기
          </button>

          <button
            onClick={() => { setActiveTab("schedule"); setIsPrintLayout(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "schedule"
                ? "bg-orange-500 text-white shadow-sm"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-4.5 h-4.5" />
            시험 일정 & Gantt
          </button>

          <button
            onClick={() => { setActiveTab("tasks"); setIsPrintLayout(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "tasks"
                ? "bg-orange-500 text-white shadow-sm"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListTodo className="w-4.5 h-4.5" />
            협력부서 Action Item
          </button>

          <button
            onClick={() => { setActiveTab("bom"); setIsPrintLayout(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "bom"
                ? "bg-orange-500 text-white shadow-sm"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4.5 h-4.5" />
            BOM 리비전 비교 검토
          </button>

          <button
            onClick={() => { setActiveTab("assistant"); setIsPrintLayout(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "assistant"
                ? "bg-orange-500 text-white shadow-sm"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4.5 h-4.5" />
            로컬 AI (Gemma) 어시스트
          </button>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-[#12151f] text-center text-[11px] text-slate-500 font-mono">
          <p>PGM Ops-Assistant v1.0</p>
          <p className="mt-1 text-[10px] text-slate-600">Hanwha Proprietary Security</p>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">/</span>
            <span className="text-sm font-semibold tracking-tight text-slate-700 uppercase">
              {activeTab === "dashboard" && "종합 대시보드"}
              {activeTab === "report" && "보고서 자동 생성기 (Report Engine)"}
              {activeTab === "schedule" && "추진기관 시험 일정 및 Gantt 차트"}
              {activeTab === "tasks" && "협력부서 Action Item 추적 및 관리"}
              {activeTab === "bom" && "BOM(EBOM/PBOM) Revision 비교 & 기술영향 검토"}
              {activeTab === "assistant" && "로컬 LLM (Gemma) AI 지원 도구"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime || "시계 가동중..."}</span>
            </div>
            <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1.5 rounded-md border border-orange-200 font-sans font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>PGM 추진부서 전용</span>
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            
            {/* 1. DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                id="dashboard-view"
              >
                {/* Welcome Hero Grid */}
                <div className="bg-gradient-to-r from-slate-900 via-[#1f2638] to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden border border-slate-800">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Cpu className="w-48 h-48 text-white" />
                  </div>
                  <div className="relative z-10">
                    <span className="bg-orange-500/90 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white">
                      현업 신입사원 업무 자동화 허브
                    </span>
                    <h2 className="text-2xl font-bold mt-3 tracking-tight">
                      반가운 소식입니다! 오늘 마감 예정인 긴급 공작 지그 개조 건이 존재합니다.
                    </h2>
                    <p className="text-slate-300 text-sm mt-1.5 max-w-2xl font-sans font-light">
                      PGM 추진기관 시험 결과에 기초한 보고서 자동 완성 및 설계 리비전 비교, 
                      타 부서 간 액션 아이템 유기적 추적으로 수동 문서 리소스를 70% 이상 절감합니다.
                    </p>
                    <div className="flex gap-4 mt-5">
                      <button
                        onClick={() => setActiveTab("report")}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-orange-500/10 flex items-center gap-1.5 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        보고서 작성하기
                      </button>
                      <button
                        onClick={() => setActiveTab("assistant")}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Cpu className="w-4 h-4 text-orange-400" />
                        로컬 AI 비서 열기
                      </button>
                    </div>
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">진행 중 시험 일정</span>
                      <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        {milestones.filter((m) => m.status === "준비중" || m.status === "완료").length}건
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">전체 {milestones.length}개 마일스톤</span>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">미해결 액션 아이템</span>
                      <span className="text-2xl font-bold text-red-600 mt-1 block">
                        {actionItems.filter((item) => item.status !== "완료").length}건
                      </span>
                      <span className="text-[11px] text-red-500 font-medium block">
                        ⚠️ 긴급 처리 대상: {actionItems.filter((item) => item.priority === "긴급" && item.status !== "완료").length}건
                      </span>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">BOM 변경 기술영향 검증</span>
                      <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        {bomDiff.filter((d) => d.status !== "유지").length}개 품목
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">Rev.3 ➔ Rev.4 변동분</span>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">생성 보고서 누적 본 수</span>
                      <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                        {reports.length + 3}건
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">KST 로컬 서버 자동 누적</span>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Dashboard Split Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Critical Upcoming Tasks & Schedule Progress */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-4.5 h-4.5 text-orange-500" />
                        가장 임박한 추진기관 시험 일정 및 체크리스트
                      </h3>
                      <button
                        onClick={() => setActiveTab("schedule")}
                        className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-0.5"
                      >
                        상세보기 <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {milestones.slice(0, 2).map((ms) => {
                      const totalChecks = ms.preChecklist.length + ms.postChecklist.length;
                      const checkedItems =
                        ms.preChecklist.filter((c) => c.checked).length +
                        ms.postChecklist.filter((c) => c.checked).length;
                      const progressPercent = totalChecks > 0 ? Math.round((checkedItems / totalChecks) * 100) : 0;

                      return (
                        <div key={ms.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-all">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{ms.title}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  ms.status === "준비중"
                                    ? "bg-amber-100 text-amber-800"
                                    : ms.status === "완료"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}>
                                  {ms.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                                기간: {ms.startDate} ~ {ms.endDate} | {ms.type} 카테고리
                              </p>
                            </div>
                            {ms.designChangeFlag && (
                              <span className="flex items-center gap-1 text-[11px] font-bold bg-orange-50 text-orange-700 px-2 py-1 rounded-md border border-orange-200/50">
                                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                                도면수정 반영됨
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3.5 space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>시험 진척도 (체크리스트 수립률)</span>
                              <span className="font-semibold">{checkedItems}/{totalChecks} ({progressPercent}%)</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Urgent Action Items Summary Card */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <ListTodo className="w-4.5 h-4.5 text-red-500" />
                        긴급 추적 조치 사항
                      </h3>
                      <button
                        onClick={() => setActiveTab("tasks")}
                        className="text-xs text-orange-600 font-semibold hover:underline"
                      >
                        전체 관리
                      </button>
                    </div>

                    <div className="space-y-3">
                      {actionItems
                        .filter((item) => item.status !== "완료")
                        .slice(0, 3)
                        .map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleToggleActionItemStatus(item.id)}
                            className="p-3 rounded-lg border border-l-4 hover:bg-slate-50 cursor-pointer transition-all flex justify-between items-center bg-white border-slate-200"
                            style={{
                              borderLeftColor:
                                item.priority === "긴급"
                                  ? "#ef4444"
                                  : item.priority === "보통"
                                  ? "#f97316"
                                  : "#94a3b8",
                            }}
                          >
                            <div className="space-y-1 max-w-[80%]">
                              <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                                {item.title}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                  {item.department}
                                </span>
                                <span>담당: {item.assignee}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-red-600 font-bold block">
                                D-{Math.max(1, Math.round((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono block">
                                ~{item.deadline}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* BOM Diff Insight and Fast Assistance */}
                <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-200/70 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <h4 className="text-sm font-bold text-orange-800 flex items-center gap-1">
                      <FileSpreadsheet className="w-4.5 h-4.5 text-orange-600" />
                      신입사원을 위한 공정/BOM 리비전 변경점 브리핑
                    </h4>
                    <p className="text-xs text-orange-950/80 leading-relaxed font-sans">
                      현재 <strong>Rev.3</strong>에서 <strong>Rev.4</strong>로 설계 변경이 단행된 결과, 가장 주력 부품인 
                      [그래파이트 노즐 목 인서트] 소재가 [탄소 복합재]로 최종 사양 변경되었습니다. 이에 따라 제조 선반 가공 속도, 치공구 피치 규격 재조정 및 집진 가동 압력 점검이 긴급 요구됩니다. 해당 내용의 치구 도면 비교는 <strong>BOM 리비전 비교 검토</strong> 탭에서 확인해 주십시오.
                    </p>
                  </div>
                  <div className="flex flex-col justify-center space-y-2">
                    <button
                      onClick={() => setActiveTab("bom")}
                      className="w-full bg-white hover:bg-slate-50 text-orange-700 border border-orange-200 py-2 px-3 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      BOM 비교 및 가공 지침 확인
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("assistant");
                        setSelectedGlossary(glossaryTerms.find(t => t.term.includes("노즐 목")) || glossaryTerms[1]);
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      노즐 목 침식 제어 기술 해설 보기
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. REPORT ENGINE TAB */}
            {activeTab === "report" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-6"
                id="report-engine"
              >
                {/* Inputs Panel (Left) */}
                <div className="xl:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">추진기관 원시 시험 데이터 입력</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      시험에서 측정된 실측 가스를 기재하면 Gemma AI가 분석 보고서를 생성합니다.
                    </p>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">대상 시험 명칭</label>
                      <input
                        type="text"
                        value={reportForm.testName}
                        onChange={(e) => setReportForm({ ...reportForm, testName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">연소실 압력 (MPa)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={reportForm.chamberPressure}
                          onChange={(e) => setReportForm({ ...reportForm, chamberPressure: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 font-mono font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">연소 온도 (K)</label>
                        <input
                          type="number"
                          value={reportForm.combustionTemp}
                          onChange={(e) => setReportForm({ ...reportForm, combustionTemp: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 font-mono font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">최대 추력 (kN)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={reportForm.thrust}
                          onChange={(e) => setReportForm({ ...reportForm, thrust: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 font-mono font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">연소 시간 (초)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={reportForm.burnTime}
                          onChange={(e) => setReportForm({ ...reportForm, burnTime: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 font-mono font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">목표 사양 대비 달성률 / 기준 만족도</label>
                      <input
                        type="text"
                        value={reportForm.targetValue}
                        onChange={(e) => setReportForm({ ...reportForm, targetValue: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">실측 특이사항 및 관찰 내용 (자유 메모)</label>
                      <textarea
                        rows={5}
                        value={reportForm.comments}
                        onChange={(e) => setReportForm({ ...reportForm, comments: e.target.value })}
                        placeholder="현장에서 육안 관찰이나 오실로스코프로 파악한 내용을 자유롭게 타이핑하세요."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
                      />
                    </div>

                    <button
                      onClick={handleGenerateReport}
                      disabled={isGeneratingReport}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-lg text-xs tracking-tight shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 transition-all"
                    >
                      {isGeneratingReport ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Gemma 기술 보고서 작성 연산 중...
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" />
                          한화 사내양식 분석서 자동생성
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Report Preview Panel (Right) */}
                <div className="xl:col-span-7 space-y-4">
                  
                  {/* Action Bar */}
                  <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">A4 공식 정밀 문서 프리뷰</span>
                    {activeReportText && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyToClipboard(activeReportText)}
                          className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                          정식 클립보드 복사
                        </button>
                        <button
                          onClick={() => handleDownloadFile(`${reportForm.testName}_기술보고서.txt`, activeReportText)}
                          className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          TXT 다운로드
                        </button>
                        <button
                          onClick={() => setIsPrintLayout(!isPrintLayout)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5 text-orange-400" />
                          {isPrintLayout ? "일반 뷰로 전환" : "공식 인쇄 레이아웃"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Render Area */}
                  <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 min-h-[500px] flex items-stretch">
                    {isGeneratingReport ? (
                      <div className="w-full flex flex-col items-center justify-center text-center p-8 space-y-3 bg-white rounded-lg border border-slate-200">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                          <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">로컬 AI (Gemma Quantized) 연산 엔진 가동 중</p>
                        <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
                          Chamber Pressure 변량 대비 노즐 구조 응력 변형 임계 한계성 검토 및 
                          추력-압력 지수 관계 수식 연계를 포함한 방산 한화 표준 어조로 문장 교정 중입니다.
                        </p>
                      </div>
                    ) : activeReportText ? (
                      <div className={`w-full bg-white p-8 rounded-lg border border-slate-200 overflow-y-auto max-h-[650px] font-sans relative ${
                        isPrintLayout ? "shadow-2xl max-w-2xl mx-auto A4-print" : ""
                      }`}>
                        
                        {/* Mock Document Header for Print View */}
                        {isPrintLayout && (
                          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
                            <div>
                              <p className="text-[10px] tracking-widest text-slate-400 font-mono font-bold">CONFIDENTIAL // HANWHA PROPULSION SECURITY</p>
                              <h1 className="text-xl font-black mt-1 text-slate-950">PGM 추진공학 기술 의견 분석서</h1>
                              <p className="text-[11px] text-slate-500 mt-1">한화에어로스페이스 PGM 사업부 제조기술 파트</p>
                            </div>
                            
                            {/* Mock Sign Off Box (결재란) */}
                            <table className="border-collapse text-[10px] text-center border border-slate-400">
                              <thead>
                                <tr>
                                  <th className="border border-slate-400 px-2 py-0.5 font-medium bg-slate-50">담당</th>
                                  <th className="border border-slate-400 px-2 py-0.5 font-medium bg-slate-50">과장</th>
                                  <th className="border border-slate-400 px-2 py-0.5 font-medium bg-slate-50">팀장</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="h-9">
                                  <td className="border border-slate-400 px-2 py-0.5 text-[9px] text-slate-400 flex items-center justify-center h-full">신입사원</td>
                                  <td className="border border-slate-400 px-2 py-0.5 text-slate-300">이진우</td>
                                  <td className="border border-slate-400 px-2 py-0.5 text-slate-300">김철수</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Document Content */}
                        <div className="prose prose-sm text-slate-800 whitespace-pre-line text-xs leading-relaxed">
                          {activeReportText}
                        </div>

                        {/* Print Footer */}
                        {isPrintLayout && (
                          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
                            <p>한화에어로스페이스 주식회사 PGM 추진본부 | 문서코드: HW-PGM-OP-2026</p>
                            <p className="mt-0.5">본 기술문서의 무단 반출 및 전재는 관련 법령에 의해 금지됩니다.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-slate-200 text-slate-400">
                        <FileCode2 className="w-12 h-12 text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-700">보고서 미생성 상태</p>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                          좌측 수치 입력란에 추진제 시험 데이터값을 입력하신 후 '표준양식 분석서 자동생성' 버튼을 클릭해 주십시오.
                        </p>
                        
                        {/* Quick fill link */}
                        <button
                          onClick={() => {
                            setReportForm({
                              testName: "추진제 그레인 핀틀 가변 2차 시험",
                              chamberPressure: "6.8",
                              combustionTemp: "3120",
                              thrust: "52.4",
                              burnTime: "20.1",
                              targetValue: "100% 완전 성공 (설계 한계치 도달)",
                              comments: "핀틀 구동식 액추에이터 거동 동조 속도를 0.1초 단축 조정한 보람이 있음. 압력 상승 기울기가 매우 날카롭고 후반 압력 감쇄 곡선도 깔끔하게 비례 제어되었음. 탄소복합재 인서트로 바꾼 덕에 삭마는 거의 제로임."
                            });
                          }}
                          className="mt-4 text-[11px] text-orange-600 font-semibold hover:underline bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
                        >
                          🧪 [지그 변경 적용] 가변 2차 시험 데이터 즉시 대입
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Saved Reports History (Local) */}
                  {reports.length > 0 && (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-800">금일 로컬 생성 보고서 이력 ({reports.length})</h4>
                      <div className="space-y-2 text-xs">
                        {reports.map((rep) => (
                          <div
                            key={rep.id}
                            onClick={() => {
                              setReportForm({
                                testName: rep.testName,
                                chamberPressure: rep.chamberPressure.toString(),
                                combustionTemp: rep.combustionTemp.toString(),
                                thrust: rep.thrust.toString(),
                                burnTime: rep.burnTime.toString(),
                                targetValue: rep.targetValue,
                                comments: rep.comments,
                              });
                              setActiveReportText(rep.generatedText || "");
                            }}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-orange-300 transition-all cursor-pointer flex justify-between items-center"
                          >
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-800 line-clamp-1">{rep.testName}</p>
                              <p className="text-[10px] text-slate-400">
                                압력: {rep.chamberPressure} MPa | 추력: {rep.thrust} kN | 시간: {rep.burnTime}s
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">{rep.createdAt?.split(" ")[1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. TEST SCHEDULER TAB */}
            {activeTab === "schedule" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                id="test-scheduler"
              >
                {/* Gantt Chart Panel */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">PGM 추진기관 시험 전체 로드맵 (Gantt Chart)</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        개발 일정 타임라인에 따른 설계 리비전(Revision) 변경 영향 분석 및 사전/사후 체크리스트 연동 현황입니다.
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500 block" /> 지상연소</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500 block" /> 환경시험</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 block" /> 조립공정</div>
                    </div>
                  </div>

                  {/* Simulated Gantt Grid */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px] text-xs font-mono select-none">
                      {/* Gantt Header */}
                      <div className="grid grid-cols-12 gap-1 border-b border-slate-200 pb-2 text-slate-400 text-center font-bold">
                        <div className="col-span-4 text-left font-sans pl-2">추진기관 시험/공정 태스크명</div>
                        <div>07-15</div>
                        <div>07-20</div>
                        <div>07-25</div>
                        <div>07-30</div>
                        <div>08-05</div>
                        <div>08-10</div>
                        <div>08-15</div>
                        <div>08-20</div>
                      </div>

                      {/* Gantt Rows */}
                      <div className="py-2.5 space-y-4">
                        {milestones.map((ms) => {
                          // Rough timeline position mappings
                          let barStyle = {};
                          if (ms.id === "ms-1") barStyle = { marginLeft: "10.5%", width: "12%" };
                          else if (ms.id === "ms-2") barStyle = { marginLeft: "35%", width: "15%" };
                          else if (ms.id === "ms-3") barStyle = { marginLeft: "55%", width: "20%" };
                          else if (ms.id === "ms-4") barStyle = { marginLeft: "78%", width: "15%" };

                          const colorClass =
                            ms.type === "지상연소"
                              ? "bg-orange-500 text-white"
                              : ms.type === "환경시험"
                              ? "bg-indigo-500 text-white"
                              : "bg-emerald-500 text-white";

                          return (
                            <div
                              key={ms.id}
                              onClick={() => setSelectedMilestone(ms)}
                              className={`grid grid-cols-12 gap-1 items-center p-1.5 rounded-lg cursor-pointer transition-all ${
                                selectedMilestone?.id === ms.id ? "bg-slate-100 border border-slate-300" : "hover:bg-slate-50 border border-transparent"
                              }`}
                            >
                              <div className="col-span-4 font-sans text-xs font-semibold pl-2 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  ms.type === "지상연소"
                                    ? "bg-orange-500"
                                    : ms.type === "환경시험"
                                    ? "bg-indigo-500"
                                    : "bg-emerald-500"
                                }`} />
                                <span className="truncate">{ms.title}</span>
                              </div>
                              
                              {/* Timeline track */}
                              <div className="col-span-8 relative h-7 bg-slate-100/70 rounded-md overflow-hidden">
                                <div
                                  className={`absolute top-1 h-5 rounded flex items-center justify-center font-bold text-[9px] px-2 shadow-xs transition-all ${colorClass}`}
                                  style={barStyle}
                                >
                                  {ms.status}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checklist Detail Panel (Split layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Selected Milestone Specs */}
                  <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
                    <div className="pb-3 border-b border-slate-100">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
                        Active Milestone
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">{selectedMilestone?.title}</h4>
                      <p className="text-slate-400 mt-1">태스크 상세 검토 및 영향도 분석</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">일정 기간:</span>
                        <span className="font-semibold text-slate-800">{selectedMilestone?.startDate} ~ {selectedMilestone?.endDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">카테고리:</span>
                        <span className="font-bold text-slate-800">{selectedMilestone?.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">현재 상태:</span>
                        <span className="font-bold text-slate-800">{selectedMilestone?.status}</span>
                      </div>
                    </div>

                    {/* Design Change Flag Segment */}
                    <div className={`p-4 rounded-lg border flex flex-col gap-2 ${
                      selectedMilestone?.designChangeFlag
                        ? "bg-orange-50/50 border-orange-200 text-orange-950"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-xs">
                        {selectedMilestone?.designChangeFlag ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span>⚠️ 도면 설계 변경 감지됨</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-slate-400" />
                            <span>최신 설계 적용 상태 (특이사항 무)</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {selectedMilestone?.designChangeFlag
                          ? selectedMilestone.designChangeNotes
                          : "이전 리비전 대비 치공구 간섭이나 소재 교체 건이 존재하지 않아 표준 지침서대로 안전조립 및 수입검사를 진행하십시오."}
                      </p>
                      {selectedMilestone?.designChangeFlag && (
                        <button
                          onClick={() => setActiveTab("bom")}
                          className="mt-1 text-[11px] font-bold text-orange-700 hover:underline text-left self-start"
                        >
                          BOM 개정 비교표 검토 바로가기 ➔
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Interactive Checklists (Pre & Post) */}
                  <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Clipboard className="w-4.5 h-4.5 text-orange-500" />
                      실무 체크리스트 점검대장 (체크 시 진척도 자동 갱신)
                    </h4>

                    {selectedMilestone ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        
                        {/* Pre-Test Checklist */}
                        <div className="space-y-3">
                          <h5 className="font-bold text-slate-800 bg-slate-100/80 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Pre-Test Checklist (시험 전 준비 상태)
                          </h5>
                          
                          {selectedMilestone.preChecklist.length === 0 ? (
                            <p className="text-slate-400 italic text-center py-4">사전 수립된 체크리스트가 없습니다.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {selectedMilestone.preChecklist.map((item) => (
                                <label
                                  key={item.id}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border hover:bg-slate-50 cursor-pointer transition-all ${
                                    item.checked ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => handleToggleChecklist(selectedMilestone.id, "pre", item.id)}
                                    className="mt-0.5 rounded text-orange-500 focus:ring-orange-500 h-3.5 w-3.5"
                                  />
                                  <span className={`leading-relaxed font-sans ${item.checked ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>
                                    {item.task}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Post-Test Checklist */}
                        <div className="space-y-3">
                          <h5 className="font-bold text-slate-800 bg-slate-100/80 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Post-Test Checklist (시험 후 공학 분석)
                          </h5>

                          {selectedMilestone.postChecklist.length === 0 ? (
                            <p className="text-slate-400 italic text-center py-4">사후 수립된 체크리스트가 없습니다.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {selectedMilestone.postChecklist.map((item) => (
                                <label
                                  key={item.id}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border hover:bg-slate-50 cursor-pointer transition-all ${
                                    item.checked ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => handleToggleChecklist(selectedMilestone.id, "post", item.id)}
                                    className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-500 h-3.5 w-3.5"
                                  />
                                  <span className={`leading-relaxed font-sans ${item.checked ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>
                                    {item.task}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-8">일정을 선택하시면 체크리스트가 연동 표시됩니다.</p>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 4. ACTION ITEMS TAB */}
            {activeTab === "tasks" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                id="task-tracker"
              >
                {/* Control bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">타 부서 협력 업무 & 액션 아이템 추적대장</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      설계, 품질, 생산 파트 및 협력제조업체에 발주/요청한 현안들의 기한과 완료 상태를 추적합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3.5 rounded-lg text-xs shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 transition-all self-start sm:self-center"
                  >
                    <Plus className="w-4 h-4" />
                    신규 액션 아이템 등록
                  </button>
                </div>

                {/* Task Grid Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                          <th className="p-4 pl-6">상태</th>
                          <th className="p-4">태스크명 (요청 내역)</th>
                          <th className="p-4">관련 부서</th>
                          <th className="p-4">담당자</th>
                          <th className="p-4">요청일</th>
                          <th className="p-4 text-center">우선순위</th>
                          <th className="p-4 text-right pr-6">마감 마지노선</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actionItems.map((item) => (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                              item.status === "완료" ? "bg-slate-50/30 text-slate-400" : ""
                            }`}
                          >
                            <td className="p-4 pl-6">
                              <button
                                onClick={() => handleToggleActionItemStatus(item.id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded font-bold text-[10px] uppercase tracking-wide transition-all ${
                                  item.status === "완료"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : item.status === "진행중"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {item.status === "완료" && <Check className="w-3 h-3" />}
                                {item.status}
                              </button>
                            </td>
                            <td className="p-4 font-medium">
                              <div className="space-y-0.5">
                                <span className={item.status === "완료" ? "line-through text-slate-400" : "text-slate-950 font-semibold"}>
                                  {item.title}
                                </span>
                                {item.description && (
                                  <p className="text-[11px] text-slate-500 font-light leading-relaxed max-w-lg">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="p-4 font-medium">{item.department}</td>
                            <td className="p-4 font-mono">{item.assignee}</td>
                            <td className="p-4 text-slate-400 font-mono">{item.requestedDate}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.priority === "긴급"
                                  ? "bg-red-100 text-red-800"
                                  : item.priority === "보통"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-slate-200 text-slate-600"
                              }`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono pr-6 font-semibold">
                              <span className={item.status === "완료" ? "text-slate-400" : "text-red-600"}>
                                {item.deadline}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Modal for adding item */}
                {showTaskModal && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
                      <div className="bg-[#1a1f2c] px-6 py-4 flex justify-between items-center text-white">
                        <h4 className="text-sm font-bold flex items-center gap-1.5">
                          <ListTodo className="w-4.5 h-4.5 text-orange-400" />
                          신규 액션 아이템 대장 등록
                        </h4>
                        <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateActionItem} className="p-6 space-y-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">태스크명 / 요청사항</label>
                          <input
                            type="text"
                            required
                            placeholder="예: 지상 연소 지그 기하 공차 가공 발주 건"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-semibold text-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">협업 대상 부서</label>
                            <select
                              value={newTask.department}
                              onChange={(e) => setNewTask({ ...newTask, department: e.target.value as ActionItem["department"] })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                            >
                              <option value="설계">설계</option>
                              <option value="품질">품질</option>
                              <option value="제조기술">제조기술</option>
                              <option value="생산">생산</option>
                              <option value="협력업체">협력업체</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">상세 담당자</label>
                            <input
                              type="text"
                              value={newTask.assignee}
                              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">우선순위</label>
                            <select
                              value={newTask.priority}
                              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as ActionItem["priority"] })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-bold text-slate-800"
                            >
                              <option value="긴급">🔴 긴급</option>
                              <option value="보통">🟡 보통</option>
                              <option value="낮음">🟢 낮음</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">마감 완료 기한</label>
                            <input
                              type="date"
                              required
                              value={newTask.deadline}
                              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">상세 제조 지침 / 특이 내용</label>
                          <textarea
                            rows={3}
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            placeholder="변경 치수, 가공 허용 공차, 인계 부품 도면 번호 등을 기입하세요."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowTaskModal(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 transition-all"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-md shadow-orange-500/15 transition-all"
                          >
                            액션 등록
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 5. BOM REVISION COMPARER TAB */}
            {activeTab === "bom" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                id="bom-comparer"
              >
                {/* Intro banner */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4.5 h-4.5 text-orange-500" />
                      추진기관 조립 BOM (v1.0 Graphite Throat vs v1.1 Carbon-Carbon Throat) 비교 분석
                    </h3>
                    <p className="text-xs text-slate-400">
                      이전 리비전 설계 품목(EBOM) 대비 제조 조립용 공정 품목(PBOM)의 추가, 삭제, 수정을 대조하고 치구 개조 기술영향을 파악합니다.
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs shrink-0">
                    <button
                      onClick={() => setIsAddingPart("A")}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      v1.0 품목 추가
                    </button>
                    <button
                      onClick={() => setIsAddingPart("B")}
                      className="bg-[#1a1f2c] hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-orange-400" />
                      v1.1 품목 추가
                    </button>
                  </div>
                </div>

                {/* Add BOM item modal */}
                {isAddingPart && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
                      <div className="bg-[#1a1f2c] px-6 py-4 flex justify-between items-center text-white">
                        <h4 className="text-sm font-bold">
                          BOM {isAddingPart === "A" ? "v1.0" : "v1.1"} 신규 품목 추가
                        </h4>
                        <button onClick={() => setIsAddingPart(null)} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-5 space-y-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">도면 부품 번호 (Part No)</label>
                          <input
                            type="text"
                            value={newPart.partNo}
                            onChange={(e) => setNewPart({ ...newPart, partNo: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">부품명 (Part Name)</label>
                          <input
                            type="text"
                            placeholder="예: O-Ring"
                            value={newPart.partName}
                            onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">단위 수량 (Qty)</label>
                            <input
                              type="number"
                              value={newPart.qty}
                              onChange={(e) => setNewPart({ ...newPart, qty: parseInt(e.target.value) || 1 })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">부품 리비전 (Revision)</label>
                            <input
                              type="text"
                              value={newPart.revision}
                              onChange={(e) => setNewPart({ ...newPart, revision: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">재질 사양 (Material)</label>
                          <input
                            type="text"
                            placeholder="예: SUS304"
                            value={newPart.material}
                            onChange={(e) => setNewPart({ ...newPart, material: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setIsAddingPart(null)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleAddBOMItem(isAddingPart)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold"
                          >
                            추가하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparative Matrix Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Side-by-Side Raw BOM Viewers */}
                  <div className="lg:col-span-6 space-y-4">
                    
                    {/* v1.0 EBOM Card */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                        <span className="font-bold text-slate-800 text-xs">v1.0 EBOM (기존 흑연 노즐 적용 구조)</span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-500">
                          Total {bomListA.length} items
                        </span>
                      </div>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto text-[11px]">
                        {bomListA.map((item) => (
                          <div key={item.partNo} className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-lg flex justify-between items-start font-sans">
                            <div>
                              <p className="font-semibold text-slate-900">{item.partName}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {item.partNo} | {item.material} | {item.revision}
                              </p>
                            </div>
                            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                              {item.qty} EA
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* v1.1 PBOM Card */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                        <span className="font-bold text-slate-800 text-xs text-[#1a1f2c]">v1.1 PBOM (최신 설계 변경 탄소복합재 구조)</span>
                        <span className="text-[10px] bg-slate-950 text-orange-400 px-2 py-0.5 rounded font-mono font-bold">
                          Total {bomListB.length} items
                        </span>
                      </div>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto text-[11px]">
                        {bomListB.map((item) => (
                          <div key={item.partNo} className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-lg flex justify-between items-start font-sans">
                            <div>
                              <p className="font-semibold text-slate-950">{item.partName}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {item.partNo} | {item.material} | {item.revision}
                              </p>
                            </div>
                            <span className="bg-[#1a1f2c] text-white px-2 py-0.5 rounded font-mono font-bold">
                              {item.qty} EA
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Comparative Highlighting Diff & Workshop Action Guides */}
                  <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                      <ArrowRightLeft className="w-4.5 h-4.5 text-orange-500" />
                      설계 리비전별 가공/조립 기술영향 분석 리포트
                    </h4>

                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                      {bomDiff.map((diffItem, index) => (
                        <div
                          key={`${diffItem.partNo}-${index}`}
                          className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
                            diffItem.status === "추가"
                              ? "bg-emerald-50/50 border-emerald-200"
                              : diffItem.status === "삭제"
                              ? "bg-red-50/50 border-red-200 opacity-75"
                              : diffItem.status === "수정"
                              ? "bg-amber-50/50 border-amber-200"
                              : "bg-slate-50/50 border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                diffItem.status === "추가"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : diffItem.status === "삭제"
                                  ? "bg-red-100 text-red-800"
                                  : diffItem.status === "수정"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-200 text-slate-600"
                              }`}>
                                {diffItem.status}
                              </span>
                              <h5 className="font-bold text-slate-950 font-sans mt-1">
                                {diffItem.partName} ({diffItem.partNo})
                              </h5>
                            </div>
                            <div className="text-right font-mono text-[10px] text-slate-500">
                              {diffItem.status === "수정" && (
                                <>
                                  <p>{diffItem.oldRevision} ➔ {diffItem.newRevision}</p>
                                  <p className="mt-0.5 text-slate-400">수량: {diffItem.oldQty}EA ➔ {diffItem.newQty}EA</p>
                                </>
                              )}
                              {diffItem.status === "추가" && (
                                <>
                                  <p>{diffItem.newRevision}</p>
                                  <p className="mt-0.5 text-slate-400">수량: {diffItem.newQty}EA</p>
                                </>
                              )}
                              {diffItem.status === "삭제" && (
                                <>
                                  <p>{diffItem.oldRevision} 단종</p>
                                  <p className="mt-0.5 text-slate-400">수량: {diffItem.oldQty}EA 감축</p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Impact notes - highly valued by aerospace technicians */}
                          <div className="p-3 bg-white/80 rounded-lg border border-slate-200/50 shadow-xs">
                            <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-orange-500" />
                              제조 현장 치구 및 공정 지침 (Manufacturing Impact)
                            </p>
                            <p className="text-[11px] text-slate-700 mt-1.5 leading-relaxed font-sans">
                              {diffItem.manufacturingImpact}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 6. AI ASSISTANT PLAYGROUND TAB */}
            {activeTab === "assistant" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                id="ai-playground"
              >
                
                {/* Left Side: Category / Input Menu */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  
                  {/* Mode Toggles */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                    <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-mono">
                      Gemma Local LLM Integration Mode
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">도메인 전용 AI 지원 프로세스</h3>
                    
                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <button
                        onClick={() => { setAssistantMode("lookup"); setAssistantOutput(""); }}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                          assistantMode === "lookup"
                            ? "bg-orange-50 border-orange-400 text-orange-950 font-bold"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Search className="w-5 h-5" />
                        <span>추진공학 용어 백과</span>
                      </button>
                      
                      <button
                        onClick={() => { setAssistantMode("refine"); setAssistantOutput(""); }}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                          assistantMode === "refine"
                            ? "bg-orange-50 border-orange-400 text-orange-950 font-bold"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500"
                        }`}
                      >
                        <FileCode2 className="w-5 h-5" />
                        <span>기술 보고 문장 감수</span>
                      </button>

                      <button
                        onClick={() => { setAssistantMode("minutes"); setAssistantOutput(""); }}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                          assistantMode === "minutes"
                            ? "bg-orange-50 border-orange-400 text-orange-950 font-bold"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500"
                        }`}
                      >
                        <ListTodo className="w-5 h-5" />
                        <span>회의록 요약 구조화</span>
                      </button>
                    </div>
                  </div>

                  {/* Context Sensitive Interactive Fields */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex-1 flex flex-col justify-between space-y-4">
                    
                    {/* Mode: Term Lookup */}
                    {assistantMode === "lookup" && (
                      <div className="space-y-4 flex-1">
                        <div className="pb-2 border-b border-slate-100">
                          <h4 className="text-xs font-bold text-slate-800">사내 추진기술 다빈도 활용 전문 용어대장</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">원하는 용어를 클릭해 지공구 관리 체크리스트 및 공학해설을 조회하세요.</p>
                        </div>
                        
                        <div className="space-y-2 max-h-[220px] overflow-y-auto">
                          {glossaryTerms.map((g) => (
                            <div
                              key={g.term}
                              onClick={() => {
                                setSelectedGlossary(g);
                                setCustomTerm(g.term);
                                handleAssistantAction("lookup", g.term);
                              }}
                              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex justify-between items-center ${
                                selectedGlossary?.term === g.term
                                  ? "bg-orange-50 border-orange-300 font-semibold"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <div className="space-y-0.5">
                                <p className="text-slate-900">{g.term}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-1 font-sans">{g.shortDesc}</p>
                              </div>
                              <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold font-sans">
                                {g.category}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Search Custom Term */}
                        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                          <label className="block font-semibold text-slate-700">기타 우주항공 특수 단어 직접 검색</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="예: 재생냉각 노즐, 하이브리드 로켓 등"
                              value={customTerm}
                              onChange={(e) => setCustomTerm(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                            />
                            <button
                              onClick={() => handleAssistantAction("lookup")}
                              className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg font-bold shrink-0"
                            >
                              조회
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mode: Sentence Refinement / Minutes Summary */}
                    {(assistantMode === "refine" || assistantMode === "minutes") && (
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="pb-2 border-b border-slate-100 flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">
                              {assistantMode === "refine" ? "보고서 초안 문장 기입" : "회의록 원시 메모 기입"}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">현장 피드백이나 메신저 대화록을 붙여넣으십시오.</p>
                          </div>
                          
                          {/* Quick Preload buttons */}
                          <button
                            onClick={assistantMode === "refine" ? loadRefineExample : loadMinutesExample}
                            className="text-[10px] text-orange-600 font-semibold hover:underline bg-orange-50 px-2 py-1 rounded border border-orange-200"
                          >
                            ✍️ 예시 데이터 자동 기입
                          </button>
                        </div>

                        <textarea
                          rows={10}
                          value={assistantInput}
                          onChange={(e) => setAssistantInput(e.target.value)}
                          placeholder={
                            assistantMode === "refine"
                              ? "교정하고자 하는 거친 구어체 문장을 여기에 작성해 주십시오."
                              : "회의 도중 거칠게 요약해 놓은 안건, 결정 사안, 날짜, 주체 등을 여기에 편하게 적어주십시오."
                          }
                          className="w-full flex-1 p-3 border border-slate-200 rounded-lg text-xs leading-relaxed font-sans focus:outline-none focus:border-orange-500"
                        />

                        <button
                          onClick={() => handleAssistantAction(assistantMode)}
                          disabled={!assistantInput || isAiLoading}
                          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white font-semibold py-2.5 rounded-lg text-xs tracking-tight shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 transition-all"
                        >
                          {isAiLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              로컬 LLM 요약 추론 연산 중...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              {assistantMode === "refine" ? "격식체 기술 감수 실행" : "회의록 Action Item 구조화"}
                            </>
                          )}
                        </button>
                      </div>
                    )}

                  </div>
                </div>

                {/* Right Side: Smart Output Preview */}
                <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[500px]">
                  
                  {/* Top Bar */}
                  <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <Cpu className="w-4.5 h-4.5 text-orange-500" />
                        Gemma 연동 추론 결과 피드백
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">보안 오프라인 가중치를 활용하여 수동 기안을 마감합니다.</p>
                    </div>
                    {assistantOutput && (
                      <button
                        onClick={() => handleCopyToClipboard(assistantOutput)}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all"
                      >
                        <Clipboard className="w-3.5 h-3.5 text-orange-400" />
                        클립보드 복사
                      </button>
                    )}
                  </div>

                  {/* Answer Shell */}
                  <div className="flex-1 my-4 bg-slate-50 p-5 rounded-xl border border-slate-200 overflow-y-auto max-h-[500px]">
                    {isAiLoading ? (
                      <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                          <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">로컬 정밀 추론 연산 가동중</p>
                        <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                          방산 보안 가중치 템플릿(SOP)을 대조하여 한화에어로스페이스 임직원 전용 보고서 양식으로 마크다운 변환 중입니다.
                        </p>
                      </div>
                    ) : assistantOutput ? (
                      <div className="prose prose-sm text-slate-800 whitespace-pre-line text-xs leading-relaxed font-sans">
                        {assistantOutput}
                      </div>
                    ) : assistantMode === "lookup" && selectedGlossary ? (
                      <div className="space-y-4 text-xs font-sans">
                        <div>
                          <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                            {selectedGlossary.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-950 mt-1.5">{selectedGlossary.term}</h4>
                        </div>
                        <p className="text-slate-600 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200/60 shadow-2xs">
                          {selectedGlossary.detailedDesc}
                        </p>

                        <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200/50">
                          <h5 className="font-bold text-orange-950 flex items-center gap-1 mb-2.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                            공정 기술 치구 및 안전 관리 체크포인트 (신입사원 가이드)
                          </h5>
                          <ul className="space-y-2 text-slate-700 list-disc list-inside">
                            {selectedGlossary.jigCheckpoints.map((cp, idx) => (
                              <li key={idx} className="leading-relaxed">{cp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                        <HelpCircle className="w-12 h-12 text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-700">추론 가동 대기</p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                          왼쪽 패널의 카테고리(용어 대조, 초안 감수, 회의록 요약) 중 하나를 선택하시고 분석 버튼을 누르시면 여기에 Gemma 추론 피드백이 표시됩니다.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono text-center pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 select-none">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>추출본은 클립보드 복사 후 사내 전용 결재망(HWP/SOP)에 즉시 호환됩니다.</span>
                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

    </div>
  );
}
