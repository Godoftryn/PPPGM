/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TestReportData {
  id?: string;
  testName: string;
  chamberPressure: number; // MPa
  combustionTemp: number; // K
  thrust: number; // kN
  burnTime: number; // sec
  targetValue: string; // e.g. "98% satisfaction"
  comments: string;
  generatedText?: string;
  createdAt?: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  checked: boolean;
}

export interface TestMilestone {
  id: string;
  title: string; // e.g. "지상 연소 1차 시험"
  startDate: string;
  endDate: string;
  status: "대기" | "준비중" | "완료" | "연기됨";
  type: "지상연소" | "비행시험" | "환경시험" | "조립공정";
  preChecklist: ChecklistItem[];
  postChecklist: ChecklistItem[];
  designChangeFlag: boolean; // True if design change affects this test
  designChangeNotes?: string; // Impact notes
}

export interface ActionItem {
  id: string;
  title: string;
  department: "설계" | "품질" | "제조기술" | "생산" | "협력업체";
  assignee: string;
  status: "대기" | "진행중" | "완료";
  priority: "긴급" | "보통" | "낮음";
  requestedDate: string;
  deadline: string;
  description?: string;
}

export interface BOMItem {
  partNo: string;
  partName: string;
  qty: number;
  material: string;
  revision: string;
  notes?: string;
}

export interface BOMComparisonResult {
  partNo: string;
  partName: string;
  status: "추가" | "삭제" | "수정" | "유지";
  oldQty?: number;
  newQty?: number;
  oldRevision?: string;
  newRevision?: string;
  oldMaterial?: string;
  newMaterial?: string;
  manufacturingImpact: string; // Notes on tooling/jig mod, etc.
}
