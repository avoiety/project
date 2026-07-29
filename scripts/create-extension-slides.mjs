import pptxgen from "pptxgenjs";

const pptx = new pptxgen();
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";
pptx.author = "MOODROBE";
pptx.lang = "ko-KR";
pptx.theme = { headFontFace: "Malgun Gothic", bodyFontFace: "Malgun Gothic", lang: "ko-KR" };

const C = { navy: "17294C", ink: "263E6B", line: "31558B", sky: "9EDCFF", paleSky: "DFF4FF", yellow: "FFE77A", cream: "FFFEF7", mint: "A9EDCE", pink: "FF9FBA", muted: "5573A5", white: "FFFFFF" };
function rect(s, x, y, w, h, fill, line = C.line, width = 1.2) { s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: fill }, line: { color: line, width } }); }
function text(s, value, x, y, w, h, options = {}) { s.addText(value, { x, y, w, h, fontFace: "Malgun Gothic", fontSize: 16, color: C.navy, margin: 0.03, fit: "shrink", valign: "mid", ...options }); }
function bg(s, color = C.paleSky) { s.background = { color }; for (let x = 0; x < 13.4; x += 0.35) s.addShape(pptx.ShapeType.line, { x, y: 0, w: 0, h: 7.5, line: { color: C.white, transparency: 78, width: 0.4 } }); for (let y = 0; y < 7.6; y += 0.35) s.addShape(pptx.ShapeType.line, { x: 0, y, w: 13.333, h: 0, line: { color: C.white, transparency: 78, width: 0.4 } }); }
function header(s, number, label) { rect(s, 0.48, 0.35, 0.77, 0.34, C.yellow, C.line, 1.1); text(s, number, 0.55, 0.405, 0.63, 0.18, { fontSize: 8, bold: true, align: "center", fontFace: "Courier New" }); text(s, label.toUpperCase(), 1.42, 0.36, 5.5, 0.28, { fontSize: 9, bold: true, color: C.muted, charSpacing: 1.5 }); text(s, "moodrobe.", 10.72, 0.35, 2.05, 0.3, { fontSize: 13, bold: true, color: C.navy, align: "right" }); }
function title(s, value, sub) { text(s, value, 0.48, 0.92, 12.15, 0.65, { fontSize: 27, bold: true }); text(s, sub, 0.5, 1.64, 11.8, 0.4, { fontSize: 14, color: C.ink, bold: true }); }
function footer(s, page) { s.addShape(pptx.ShapeType.line, { x: 0.48, y: 7.05, w: 12.35, h: 0, line: { color: C.line, width: 0.9 } }); text(s, "MOODROBE | PERSONAL WARDROBE SERVICE", 0.48, 7.14, 5.3, 0.18, { fontSize: 6.5, bold: true, color: C.muted, charSpacing: 0.7 }); text(s, String(page).padStart(2, "0"), 12.18, 7.12, 0.62, 0.18, { fontSize: 7, bold: true, color: C.muted, align: "right" }); }
function card(s, x, y, w, h, accent, heading, body) { rect(s, x + 0.07, y + 0.07, w, h, C.line, C.line, 0); rect(s, x, y, w, h, C.cream, C.line, 1.2); rect(s, x, y, w, 0.16, accent, accent, 0); text(s, heading, x + 0.22, y + 0.34, w - 0.44, 0.42, { fontSize: 14.5, bold: true, align: "center" }); text(s, body, x + 0.23, y + 0.9, w - 0.46, h - 1.1, { fontSize: 11.2, color: C.ink, breakLine: true, valign: "top" }); }

// 11. Development iteration
{
  const s = pptx.addSlide(); bg(s); header(s, "09", "Development Iteration"); title(s, "개발 과정의 시행착오와 개선", "기능을 늘리는 대신, 사용자가 실제로 끝까지 사용할 수 있는 흐름을 만드는 데 집중했습니다.");
  card(s, 0.62, 2.35, 3.72, 3.45, C.yellow, "01. 단순 추천의 한계", "초기에는 조건만 선택해 결과를 보여 주는 방식이었습니다.\n\n→ 룰렛형 슬롯 머신 UI를 적용해 추천 결과를 기다리는 순간에도 재미와 몰입을 만들었습니다.");
  card(s, 4.8, 2.35, 3.72, 3.45, C.pink, "02. 옷 데이터 입력 부담", "사진과 정보를 모두 매번 입력하면 시작하기 어렵습니다.\n\n→ 기본 의류 예시와 간단한 선택형 메타데이터(종류·색·상황)를 제공해 등록 단계를 줄였습니다.");
  card(s, 8.98, 2.35, 3.72, 3.45, C.mint, "03. 개인 데이터 보관", "서버 없이도 '내 옷장'이 유지되어야 했습니다.\n\n→ IndexedDB에 계정과 옷장을 저장하고, PIN은 원문 대신 해시로 저장했습니다.");
  footer(s, 11);
}

// 12. Graph theory and optimization
{
  const s = pptx.addSlide(); bg(s, "FFF8C9"); header(s, "10", "Discrete Mathematics I"); title(s, "이산수학 ① 가중 그래프로 표현한 옷의 관계", "의류 아이템을 정점으로, 함께 입을 수 있는 관계를 가중치 간선으로 모델링했습니다.");
  rect(s, 0.7, 2.35, 5.1, 3.7, C.cream, C.line, 1.2);
  text(s, "G = (V, E, w)", 1.1, 2.77, 4.3, 0.45, { fontSize: 24, bold: true, align: "center", fontFace: "Courier New" });
  text(s, "V : 등록한 옷 아이템\nE : 두 아이템 사이의 조합 관계\nw : 색상·상황·아우터 여부를 반영한 호환 점수", 1.03, 3.65, 4.46, 1.22, { fontSize: 14, bold: true, color: C.ink, breakLine: true, valign: "top" });
  rect(s, 6.33, 2.35, 6.3, 3.7, C.navy, C.navy, 0);
  text(s, "가중치 예시", 6.73, 2.73, 5.5, 0.28, { fontSize: 16, bold: true, color: C.yellow, align: "center" });
  text(s, "동일 색상: +5     무채색 조합: +7\n보색 조합: +6     공통 상황: 상황 수 × 2\n아우터 포함: +1", 6.87, 3.43, 5.18, 1.05, { fontSize: 15, bold: true, color: C.white, breakLine: true, align: "center" });
  text(s, "각 아이템 쌍의 관계를 수치화해, 감각적인 '어울림'을 계산 가능한 값으로 바꿨습니다.", 0.83, 6.38, 11.8, 0.3, { fontSize: 14, bold: true, color: C.ink, align: "center" });
  footer(s, 12);
}

// 13. Sets, Cartesian product, and maximum selection
{
  const s = pptx.addSlide(); bg(s); header(s, "11", "Discrete Mathematics II"); title(s, "이산수학 ② 집합 연산과 최적 조합 선택", "날씨와 상황으로 후보 집합을 줄인 뒤, 가능한 조합 전체에서 최고 점수를 선택합니다.");
  card(s, 0.63, 2.35, 3.7, 3.55, C.sky, "집합과 교집합", "아이템의 상황 집합 O(item)과 사용자가 고른 상황 o를 비교합니다.\n\nO(item) ∩ {o} ≠ ∅ 이면 우선 후보로 선택합니다.");
  card(s, 4.82, 2.35, 3.7, 3.55, C.mint, "데카르트 곱", "상의 집합 T, 하의 집합 B, 신발 집합 S에서 가능한 전체 룩은\n\nT × B × S\n\n로 생성합니다.");
  card(s, 9.01, 2.35, 3.7, 3.55, C.pink, "최대값 선택", "각 룩 (t, b, s)에 대해\n\nscore = w(t,b) + w(t,s) + w(b,s)\n\n를 계산하고, score가 최대인 조합을 추천합니다.");
  footer(s, 13);
}

await pptx.writeFile({ fileName: "MOODROBE_추가슬라이드_3장.pptx" });
