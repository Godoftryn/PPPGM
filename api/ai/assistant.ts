import { GoogleGenAI } from "@google/genai";

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

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { mode, content, term } = req.body;
    const ai = getAI();

    if (!ai) {
      if (mode === "lookup") {
        return res.status(200).json({
          text: `[시뮬레이션 용어 해설 - API Key 미등록 상태]\n\n**${term}**에 대한 임시 분석 내용:\n- 추진기관 개발 실무에서 빈번히 참조되는 핵심 특성임.\n- 제조 기술 검토 시, 해당 거동 및 부품 가공 정밀도가 조립 연소 안정성에 직결되므로 공정 체크리스트에 필수 반영이 요구됨.`
        });
      }
      if (mode === "minutes") {
        return res.status(200).json({
          text: `[시뮬레이션 회의록 요약]\n\n### 📌 핵심 결정 사항\n1. 2차 연소 시험용 치구 수정 계획 승인\n2. 설계 변경에 따른 열차폐재 보완 조립 사양 결정\n\n### 📅 향후 일정 및 담당부서\n- **설계부**: 변경 도면 배포 (기한: 차주 월요일)\n- **품질팀**: 납품 초도품 치수 검사 성적서 리뷰 (기한: 수요일)`
        });
      }
      return res.status(200).json({
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

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Error in AI Assistant:", error);
    res.status(500).json({ error: error.message });
  }
}
