/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestMilestone, ActionItem, BOMItem, BOMComparisonResult } from "./types";

// 1. Initial Test Milestones (PGM Schedule)
export const initialMilestones: TestMilestone[] = [
  {
    id: "ms-1",
    title: "PGM-20 추진기관 1차 지상연소시험",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    status: "준비중",
    type: "지상연소",
    designChangeFlag: true,
    designChangeNotes: "EBOM 3차 개정으로 인한 노즐 가스켓 실링 소재 변경됨 (실링 영향성 필수 검토)",
    preChecklist: [
      { id: "pre-1", task: "연소실 압력 센서 교정 상태 확인", checked: true },
      { id: "pre-2", task: "질소 퍼징 밸브 기밀 테스트 완료", checked: true },
      { id: "pre-3", task: "추진제 그레인 크랙 여부 비파괴 검사(RT) 확인", checked: true },
      { id: "pre-4", task: "노즐 마운트 체결 토크 게이지 교정", checked: false },
    ],
    postChecklist: [
      { id: "post-1", task: "노즐 목 직경 계측 및 침식률 계산", checked: false },
      { id: "post-2", task: "그레인 잔류 미연소 추진제 존재 유무 검사", checked: false },
      { id: "post-3", task: "내열재 열영향부(HAZ) 두께 초음파 정밀 분석", checked: false },
    ],
  },
  {
    id: "ms-2",
    title: "구조 지지 프레임 진동 및 환경 시험",
    startDate: "2026-07-28",
    endDate: "2026-07-30",
    status: "대기",
    type: "환경시험",
    designChangeFlag: false,
    preChecklist: [
      { id: "pre-v-1", task: "진동 가속도 센서 12채널 캘리브레이션", checked: false },
      { id: "pre-v-2", task: "고정용 지그 정렬 정밀 계측", checked: false },
    ],
    postChecklist: [
      { id: "post-v-1", task: "체결부 볼트 풀림 토크 분석", checked: false },
      { id: "post-v-2", task: "응력 이완 피로 균열 액체 침투 탐상(PT) 완료", checked: false },
    ],
  },
  {
    id: "ms-3",
    title: "PGM-20 추진체 시제품 최종 통합 조립",
    startDate: "2026-08-05",
    endDate: "2026-08-10",
    status: "대기",
    type: "조립공정",
    designChangeFlag: true,
    designChangeNotes: "점화장치 하우징 리비전 변경 (치구 간섭 가능성 있음. 조립 전 간이 모형 맞춤 검사 필수)",
    preChecklist: [
      { id: "pre-a-1", task: "점화장치 O-링 윤활 처리 확인", checked: false },
      { id: "pre-a-2", task: "ESD 정전기 방지 접지 장치 상태 검증", checked: false },
    ],
    postChecklist: [
      { id: "post-a-1", task: "최종 외관 3D 스캔 치수 검사", checked: false },
    ],
  },
  {
    id: "ms-4",
    title: "추진기관 점화 및 화염 연소 안전성 2차 시험",
    startDate: "2026-08-15",
    endDate: "2026-08-18",
    status: "대기",
    type: "지상연소",
    designChangeFlag: false,
    preChecklist: [
      { id: "pre-f-1", task: "비상 소화 배관 및 원격 차단 밸브 작동 체크", checked: false },
      { id: "pre-f-2", task: "열화상 고속 카메라 기하 보정 완료", checked: false },
    ],
    postChecklist: [],
  },
];

// 2. Initial Action Items
export const initialActionItems: ActionItem[] = [
  {
    id: "task-1",
    title: "노즐 목 인서트 그래파이트 가공 전용 치구 개조",
    department: "제조기술",
    assignee: "신입사원 (본인)",
    status: "진행중",
    priority: "긴급",
    requestedDate: "2026-07-14",
    deadline: "2026-07-19",
    description: "노즐 외경 치수 공차 변경으로 인해, 기존 로터리 터닝 선반 전용 지그의 클램핑 가이드 부시 직경을 내경 105mm에서 108mm로 리보링 정밀 가공 요청.",
  },
  {
    id: "task-2",
    title: "노즐 씰 소재 가스켓 실링 내열 고무 시험 성적서 품질 검토",
    department: "품질",
    assignee: "이진우 과장",
    status: "대기",
    priority: "긴급",
    requestedDate: "2026-07-15",
    deadline: "2026-07-21",
    description: "협력사에서 제공한 내열성 수지의 300도 고온 가속 노화 후 기밀 유지성 시험 결과 성적서 검토 및 기술 분석 결재 요청.",
  },
  {
    id: "task-3",
    title: "챔버 하우징 알루미늄 단조품 가공 형상 도면 배포 요청",
    department: "설계",
    assignee: "박민호 책임연구원",
    status: "진행중",
    priority: "보통",
    requestedDate: "2026-07-10",
    deadline: "2026-07-24",
    description: "Revision 4에 따른 나사산 피치 변경사항이 적용된 최신 3D STEP 파일 및 2D 도면 배포 필요. 가공 라인 사전 셋팅용.",
  },
  {
    id: "task-4",
    title: "압력 센서 마운팅 보스 정밀 TIG 용접 치구 제작 납품",
    department: "협력업체",
    assignee: "(주)삼우정밀",
    status: "완료",
    priority: "보통",
    requestedDate: "2026-07-02",
    deadline: "2026-07-15",
    description: "용접 시 열 변형 방지용 전용 수냉식 지그 제작 및 치수 검정 성적서 첨부하여 조립라인에 납품 완료.",
  },
  {
    id: "task-5",
    title: "공정 지침서(SOP) 개정 - 연소실 추진제 장입 공정 정전기 관리",
    department: "제조기술",
    assignee: "신입사원 (본인)",
    status: "대기",
    priority: "낮음",
    requestedDate: "2026-07-16",
    deadline: "2026-08-01",
    description: "화약 충전 전도성 바닥 및 ESD 접지 밴드 점검 절차를 일일 체크리스트에 정식 추가하고 부서장 결재 추진.",
  },
];

// 3. BOM Lists (for comparison)
export const bomVersionA: BOMItem[] = [
  { partNo: "HW-PGM-001", partName: "챔버 하우징(Chamber Housing)", qty: 1, material: "AL7075-T6", revision: "Rev.3", notes: "소재 정밀 단조 및 외경 나사산 가공" },
  { partNo: "HW-PGM-002", partName: "그래파이트 노즐 목 인서트(Nozzle Throat)", qty: 1, material: "Graphite Gr.E5", revision: "Rev.1", notes: "내삭마성 소재" },
  { partNo: "HW-PGM-003", partName: "노즐 지지부 홀더(Nozzle Holder)", qty: 1, material: "SUS304", revision: "Rev.2", notes: "챔버 체결용 플랜지 통합" },
  { partNo: "HW-PGM-004", partName: "실링용 O-링 세트", qty: 2, material: "Viton Rubber", revision: "Rev.1" },
  { partNo: "HW-PGM-005", partName: "압력 센서 피팅 보스", qty: 1, material: "SUS316L", revision: "Rev.1", notes: "TIG 특수 용접 타입" },
  { partNo: "HW-PGM-006", partName: "그레인 지지 격막(Trap)", qty: 1, material: "Phenolic Resin", revision: "Rev.1" },
];

export const bomVersionB: BOMItem[] = [
  { partNo: "HW-PGM-001", partName: "챔버 하우징(Chamber Housing)", qty: 1, material: "AL7075-T6", revision: "Rev.4", notes: "나사산 피치 변경 및 내경 라이너 코팅 영역 확대" },
  { partNo: "HW-PGM-002", partName: "그래파이트 노즐 목 인서트(Nozzle Throat)", qty: 1, material: "C-C Composite (탄소복합재)", revision: "Rev.2", notes: "내식마 및 열피로 한계 향상을 위해 흑연에서 탄소 복합재로 변경" },
  { partNo: "HW-PGM-003", partName: "노즐 지지부 홀더(Nozzle Holder)", qty: 1, material: "SUS304", revision: "Rev.2" },
  { partNo: "HW-PGM-004", partName: "실링용 O-링 세트", qty: 3, material: "Fluorosilicone", revision: "Rev.2", notes: "극저온 작동 신뢰성을 위해 실리콘계 불소 고무로 교체 및 수량 1개 증설" },
  // HW-PGM-005 Removed in Rev B (Integrated Bosch)
  { partNo: "HW-PGM-006", partName: "그레인 지지 격막(Trap)", qty: 1, material: "Phenolic Resin", revision: "Rev.1" },
  { partNo: "HW-PGM-007", partName: "노즐 목 보호 알루미늄 캡", qty: 1, material: "AL6061", revision: "Rev.1", notes: "조립/운송 시 습기 및 충격 방지용 탈착식 캡 추가" },
];

export const precomputedBOMDiff: BOMComparisonResult[] = [
  {
    partNo: "HW-PGM-001",
    partName: "챔버 하우징(Chamber Housing)",
    status: "수정",
    oldRevision: "Rev.3",
    newRevision: "Rev.4",
    oldQty: 1,
    newQty: 1,
    oldMaterial: "AL7075-T6",
    newMaterial: "AL7075-T6",
    manufacturingImpact: "나사산 피치 치공구 신규 셋팅 및 내외경 원통 연마 치구 수정 필요. 라이너 코팅 공정 마스킹 치구 교체.",
  },
  {
    partNo: "HW-PGM-002",
    partName: "그래파이트 노즐 목 인서트(Nozzle Throat)",
    status: "수정",
    oldRevision: "Rev.1",
    newRevision: "Rev.2",
    oldQty: 1,
    newQty: 1,
    oldMaterial: "Graphite Gr.E5",
    newMaterial: "C-C Composite (탄소복합재)",
    manufacturingImpact: "탄소/탄소 복합소재 가공 시 분진 흡입 장치 강화 및 초경 다이아몬드 팁 공구 선정 필수 (가공 부하 증가).",
  },
  {
    partNo: "HW-PGM-004",
    partName: "실링용 O-링 세트",
    status: "수정",
    oldRevision: "Rev.1",
    newRevision: "Rev.2",
    oldQty: 2,
    newQty: 3,
    oldMaterial: "Viton Rubber",
    newMaterial: "Fluorosilicone",
    manufacturingImpact: "추가 O-링 홈 가공에 따른 가공 깊이 제어 게이지 점검. 불소실리콘 조립 전용 고착 방지 크림 사양 변경.",
  },
  {
    partNo: "HW-PGM-005",
    partName: "압력 센서 피팅 보스",
    status: "삭제",
    oldRevision: "Rev.1",
    oldQty: 1,
    oldMaterial: "SUS316L",
    manufacturingImpact: "하우징 일체형 보스 설계로 용접 공정 전면 삭제 -> 용접 검사(PT) 및 용접용 지그 관리대장 불필요.",
  },
  {
    partNo: "HW-PGM-007",
    partName: "노즐 목 보호 알루미늄 캡",
    status: "추가",
    newRevision: "Rev.1",
    newQty: 1,
    newMaterial: "AL6061",
    manufacturingImpact: "최종 출하 전 조립 공정 추가. 탈착 안전성 보장용 퀵 핀 체결 수동 지그 제작.",
  },
];

// 4. Hanwha PGM Term Glossary for Lookup
export interface GlossaryTerm {
  term: string;
  category: string;
  shortDesc: string;
  detailedDesc: string;
  jigCheckpoints: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "비추력 (Isp, Specific Impulse)",
    category: "추진 공학",
    shortDesc: "추진제 1단위 중량당 발생하는 추력과 연소 시간의 곱. 추진기관의 연비 효율지표.",
    detailedDesc: "비추력은 추진제의 고유 열화학 에너지와 고온가스가 노즐을 통과하며 팽창하는 가속 성능에 의해 정의됩니다. 비추력이 높을수록 소량의 추진제로 더 많은 에너지를 얻게 되며, 이는 대기압 변화에 따른 팽창비 조건과 밀접한 관련이 있습니다.",
    jigCheckpoints: [
      "연소시험 시 마운트 센서 하중 교정 게이지 체크",
      "노즐 팽창 영역의 제작 치수 오차 관리 (±0.05mm 이내)",
      "고압 배관 기밀 누설로 인한 추력 손실 점검"
    ]
  },
  {
    term: "노즐 목 침식 (Nozzle Throat Ablation)",
    category: "제조 기술",
    shortDesc: "고온, 고압의 연소 가스 마모와 화학 반응에 의해 노즐 목 내벽이 깎여 나가는 현상.",
    detailedDesc: "추진제가 연소될 때 발생하는 가스는 2,500K 이상의 고온과 강력한 산화 성분을 가집니다. 노즐 목에 쓰이는 흑연이나 C-C 복합재가 마모/삭마되면 노즐 목 직경이 넓어져 챔버 압력이 저하되고 연소 효율이 급감하므로 정밀한 소재 가공 및 내벽 라이너 증착 기술이 필수적입니다.",
    jigCheckpoints: [
      "가공 전용 고강도 다이아몬드 PCD 인서트 정렬 확인",
      "연소 전/후 3D 비접촉 치수 프로파일러 실측",
      "탄소 복합재 장입 치구의 열 변형 한계 검증"
    ]
  },
  {
    term: "그레인 형상 (Propellant Grain Shape)",
    category: "조립 및 충전",
    shortDesc: "고체 추진기관 내부에 충전된 화약의 단면 형상 (별형, 실린더형, 핀틀형 등).",
    detailedDesc: "그레인 형상에 따라 시간에 따른 연소 면적 변화가 결정됩니다. 예를 들어 별형(Star Shape)은 초기 연소 면적을 넓혀 점화 직후 최대의 추력을 발휘하게 하며, 원통형(Cylinder)은 일정한 추력을 유지하도록 합니다. 충전 시 기포나 균열이 발생하면 연소 면적이 순간 급증해 폭발(CATASTROPHE)을 유발하므로 비파괴 검사가 극히 까다롭습니다.",
    jigCheckpoints: [
      "진공 충전 주형 코어 지그의 축 정렬 정밀도 점검",
      "탈형(Demolding) 시 무리한 인장력 배제 전용 치구 적용",
      "충전 후 열수축 방지 가습 항온항습 치공구 가동 상태"
    ]
  },
  {
    term: "핀틀 노즐 (Pintle Nozzle)",
    category: "추진 제어",
    shortDesc: "노즐 목 내부의 중심 핀틀을 앞뒤로 가동시켜 노즐 면적을 가변적으로 조절하는 시스템.",
    detailedDesc: "고체 추진기관에서 면적 조절을 가능하게 하여 추력의 가변 조정을 유도하는 장치입니다. 고정밀 선형 액추에이터의 거동 치수 및 기밀 유지가 핵심 제조기술에 해당합니다. 실시간 추진력 제어 및 사거리 제어가 가능해집니다.",
    jigCheckpoints: [
      "중심 핀틀 축의 동축도 0.02mm 이내 정밀 가공",
      "액추에이터 결합 나사 풀림 방지 토크 와이어 안전선 체결",
      "내열 특수 오-링의 이중 삽입 및 동조 실링 압력 체크"
    ]
  }
];
