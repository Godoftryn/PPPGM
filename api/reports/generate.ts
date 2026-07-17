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
      return res.status(200).json({ text: mockResult, simulated: true });
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
        temperature: 0.2, // Low temperature for high precision engineering reports
      }
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: error.message });
  }
}
