import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY environment variable is not defined. Offline/Mock mode activated.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Route: Generate Report
app.post("/api/reports/generate", async (req, res) => {
  try {
    const {
      testName,
      chamberPressure, // MPa or bar
      combustionTemp, // K or °C
      thrust, // kN
      burnTime, // seconds
      targetValue, // e.g., 98% satisfaction
      comments,
    } = req.body;

    const ai = getAI();
    if (!ai) {
      // Return a high-quality simulated response if the key is missing (for local preview testing)
      const mockResult = `[시뮬레이션 보고서 - API Key 미등록 상태]\n\n1. 개요\n본 보고서는 PGM 추진기관 개발 과정 중 수행된 [${testName || "지상 연소 시험"}]의 결과를 요약한 문서임.\n\n2. 시험 데이터 분석\n- 연소실 압력 (Chamber Pressure): ${chamberPressure || "0.0"} MPa\n- 연소 온도 (Combustion Temp): ${combustionTemp || "0"} K\n- 연소 추력 (Thrust): ${thrust || "0.0"} kN\n- 연소 시간 (Burn Time): ${burnTime || "0.0"} sec\n\n3. 기술 검토 및 종합 평가\n- 상기 시험 조건에서 사전 설계 제원(목표치: ${targetValue || "95%"}) 대비 안정적인 추진 성능을 나타내었음.\n- 압력 변동 계수 및 추력 선도는 정상 범위 내에 분포하며, 노즐 목 열팽창 및 아블레이션 거동 역시 설계 기준치 이내로 준수함.\n- 추가 의견: ${comments || "특이사항 없음. 공정 프로세스 안정성 우수."}\n\n4. 결론\n연소 거동 및 추진제 충전율 평가는 성공적으로 종결되었으며, 2차 비행 시험 일정과의 연계를 권장함.`;
      return res.json({ text: mockResult, simulated: true });
    }

    const systemPrompt = `당신은 한화에어로스페이스 PGM(정밀유도무기/추진기관) 사업부의 수석 제조기술 및 설계 엔지니어입니다.
신입사원이 입력한 추진기관 지상연소시험 또는 추진제 연소 시험 등의 수치 데이터를 기반으로, 사내 보고서 양식에 맞는 대단히 공학적이고 전문적인 "공학 기술 분석 의견서"를 작성해 주십시오.

[작성 스타일 가이드]
1. 문체는 격식 있는 군수/방산 연구소 보고서 어조(~임, ~함, ~하였음, ~판단됨)를 엄격히 사용하십시오.
2. 분석 내용에는 입력된 수치(압력, 온도, 추력, 시간 등)를 정확히 활용하여 과학적 인과관계를 설명하십시오.
3. 추진공학 전문용어(예: 비추력(Isp), 압력 특성, 노즐 목 침식, 그레인 형상, 추진제 연소 거동)를 적절히 융합하여 신뢰성을 극대화하십시오.
4. 출력은 깔끔하게 구조화된 보고서 형태로 출력되도록 마크다운 포맷을 사용하십시오.`;

    const prompt = `다음 데이터를 바탕으로 추진기관 시험 분석 보고서(개요, 시험 결과 분석, 공학적 평가 및 제조기술 검토, 향후 조치사항)를 전문적으로 작성해라:

- 시험명: ${testName || "추진기관 지상 연소 시험"}
- 연소실 압력 (Chamber Pressure): ${chamberPressure} MPa
- 연소 온도 (Combustion Temp): ${combustionTemp} K
- 연소 추력 (Thrust): ${thrust} kN
- 연소 시간 (Burn Time): ${burnTime} 초
- 목표 달성률/성공기준: ${targetValue || "설계 기준 충족"}
- 특이사항/신입사원 관찰: ${comments || "특이사항 없음"}

보고서 내에 반드시 입력된 수치들의 정합성을 기술적으로 분석한 문장을 포함해라. (예: 압력이 몇 MPa이며, 이는 구조적 허용 응력 범위 내에 속하는지 여부 등)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for high precision factual engineering reports
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: error.message });
  }
});

// API Route: AI Assistant
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { mode, content, term } = req.body;
    const ai = getAI();

    if (!ai) {
      if (mode === "lookup") {
        return res.json({
          text: `[시뮬레이션 용어 해설 - API Key 미등록 상태]\n\n**${term}**에 대한 임시 분석 내용:\n- 추진기관 개발 실무에서 빈번히 참조되는 핵심 특성임.\n- 제조 기술 검토 시, 해당 거동 및 부품 가공 정밀도가 조립 연소 안정성에 직결되므로 공정 체크리스트에 필수 반영이 요구됨.`
        });
      }
      if (mode === "minutes") {
        return res.json({
          text: `[시뮬레이션 회의록 요약]\n\n### 📌 핵심 결정 사항\n1. 2차 연소 시험용 치구 수정 계획 승인\n2. 설계 변경에 따른 열차폐재 보완 조립 사양 결정\n\n### 📅 향후 일정 및 담당부서\n- **설계부**: 변경 도면 배포 (기한: 차주 월요일)\n- **품질팀**: 납품 초도품 치수 검사 성적서 리뷰 (기한: 수요일)`
        });
      }
      return res.json({
        text: `[시뮬레이션 문장 수정]\n\n입력된 초안을 기술 보고서 어조로 다듬은 결과임:\n\n"${content}"`
      });
    }

    let prompt = "";
    let systemInstruction = "";

    if (mode === "lookup") {
      systemInstruction = "당신은 한화에어로스페이스 PGM 사업부의 수석 지식 마스터입니다. 추진공학, 방산 제조 기술, 품질 보증 기술 용어에 대해 정밀하고 현실적인 백과사전식 해설을 제공합니다. 용어 설명과 더불어 실제 현업(가공, 조립, 시험)에서 신입사원이 체크해야 할 제조기술 포인트(치구 관리, 안전 수칙, 도면 revision 체크 등)를 3줄 이내로 덧붙여 주십시오.";
      prompt = `다음 방산/추진 기술 용어에 대해 전문적이고 실무 중심의 해설을 제공해라: "${term}"`;
    } else if (mode === "minutes") {
      systemInstruction = "당신은 회의 결과를 신속하고 직관적으로 보고서화하는 비서입니다. 입력받은 거칠고 두서없는 메모를 분석하여, 1) 회의 개요, 2) 결정 사항(Decisions), 3) 향후 액션 아이템(Action Items) - 담당부서, 마감일, 구체적 수량을 표나 명확한 리스트로 요약 및 구조화해 주십시오.";
      prompt = `다음 미정리 회의록 메모를 공용 보고서 형태로 명확하게 구조화해라:\n\n${content}`;
    } else {
      // refine
      systemInstruction = "당신은 한화에어로스페이스 기술 문서 감수 담당관입니다. 신입사원이 작성한 다소 미숙하거나 캐주얼한 보고서 문장을 공학적으로 세련되고 신뢰성 높은 명조계열 보고서 어휘 및 격식체(~임, ~함, ~하였음, ~판단됨)로 교정해 주십시오. 교정 전/후 비교와 함께 어휘 선택 이유를 명료하게 서술해 주십시오.";
      prompt = `다음 기술 문장 초안을 세련된 방산 공학 문서 어조로 감수 및 교정해라:\n\n"${content}"`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in AI Assistant:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 PGM Ops-Assistant Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
