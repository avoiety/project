import pptxgen from "pptxgenjs";
import fs from "node:fs";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "MOODROBE";
pptx.subject = "MOODROBE service presentation";
pptx.title = "MOODROBE - 나만의 옷장으로 완성하는 오늘의 코디";
pptx.company = "MOODROBE";
pptx.lang = "ko-KR";
pptx.theme = {
  headFontFace: "Malgun Gothic",
  bodyFontFace: "Malgun Gothic",
  lang: "ko-KR",
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

const C = {
  navy: "17294C",
  ink: "263E6B",
  line: "31558B",
  sky: "9EDCFF",
  paleSky: "DFF4FF",
  yellow: "FFE77A",
  cream: "FFFEF7",
  mint: "A9EDCE",
  pink: "FF9FBA",
  muted: "5573A5",
  white: "FFFFFF",
};
const poster = fs.existsSync("research-poster-highres.png") ? "research-poster-highres.png" : "research-poster.png";

function rect(slide, x, y, w, h, fill, line = C.line, width = 1.2) {
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: fill }, line: { color: line, width } });
}
function text(slide, value, x, y, w, h, options = {}) {
  slide.addText(value, {
    x, y, w, h,
    fontFace: "Malgun Gothic",
    fontSize: 16,
    color: C.navy,
    margin: 0.03,
    breakLine: false,
    fit: "shrink",
    valign: "mid",
    ...options,
  });
}
function bg(slide, color = C.paleSky) {
  slide.background = { color };
  for (let x = 0; x < 13.4; x += 0.35) slide.addShape(pptx.ShapeType.line, { x, y: 0, w: 0, h: 7.5, line: { color: C.white, transparency: 78, width: 0.4 } });
  for (let y = 0; y < 7.6; y += 0.35) slide.addShape(pptx.ShapeType.line, { x: 0, y, w: 13.333, h: 0, line: { color: C.white, transparency: 78, width: 0.4 } });
}
function header(slide, number, label) {
  rect(slide, 0.48, 0.35, 0.77, 0.34, C.yellow, C.line, 1.1);
  text(slide, number, 0.55, 0.405, 0.63, 0.18, { fontSize: 8, bold: true, align: "center", fontFace: "Courier New" });
  text(slide, label.toUpperCase(), 1.42, 0.36, 5.2, 0.28, { fontSize: 9, bold: true, color: C.muted, charSpacing: 1.5 });
  text(slide, "moodrobe.", 10.72, 0.35, 2.05, 0.3, { fontSize: 13, bold: true, color: C.navy, align: "right" });
}
function title(slide, value, sub) {
  text(slide, value, 0.48, 0.92, 12.15, 0.65, { fontSize: 28, bold: true, color: C.navy, breakLine: false });
  if (sub) text(slide, sub, 0.5, 1.64, 11.8, 0.4, { fontSize: 14, color: C.ink, bold: true });
}
function footer(slide, page) {
  slide.addShape(pptx.ShapeType.line, { x: 0.48, y: 7.05, w: 12.35, h: 0, line: { color: C.line, width: 0.9 } });
  text(slide, "MOODROBE | PERSONAL WARDROBE SERVICE", 0.48, 7.14, 5.3, 0.18, { fontSize: 6.5, bold: true, color: C.muted, charSpacing: 0.7 });
  text(slide, String(page).padStart(2, "0"), 12.18, 7.12, 0.62, 0.18, { fontSize: 7, bold: true, color: C.muted, align: "right" });
}
function bullet(slide, value, x, y, w, color = C.navy, size = 15) {
  slide.addShape(pptx.ShapeType.rect, { x, y: y + 0.12, w: 0.13, h: 0.13, fill: { color: C.pink }, line: { color: C.line, width: 0.6 } });
  text(slide, value, x + 0.26, y, w - 0.26, 0.42, { fontSize: size, color, bold: true, breakLine: false });
}
function card(slide, x, y, w, h, accent, heading, body) {
  rect(slide, x + 0.07, y + 0.07, w, h, C.line, C.line, 0);
  rect(slide, x, y, w, h, C.cream, C.line, 1.2);
  rect(slide, x, y, w, 0.16, accent, accent, 0);
  text(slide, heading, x + 0.22, y + 0.34, w - 0.44, 0.38, { fontSize: 15, bold: true });
  text(slide, body, x + 0.22, y + 0.86, w - 0.44, h - 1.03, { fontSize: 11.5, color: C.ink, bold: false, breakLine: true, valign: "top", breakLine: true });
}

// 1. Cover
{
  const s = pptx.addSlide(); bg(s, C.sky);
  rect(s, 0, 0, 13.333, 0.26, C.navy, C.navy, 0);
  rect(s, 7.97, 0.68, 4.3, 5.72, C.cream, C.line, 2);
  rect(s, 8.13, 0.84, 4.3, 5.72, C.line, C.line, 0);
  s.addImage({ path: poster, x: 8.05, y: 0.76, w: 4.3, h: 5.72, sizing: { type: "contain", x: 8.05, y: 0.76, w: 4.3, h: 5.72 } });
  rect(s, 0.7, 1.05, 1.67, 0.38, C.yellow, C.line, 1.1);
  text(s, "PERSONAL WARDROBE", 0.79, 1.16, 1.48, 0.15, { fontFace: "Courier New", fontSize: 7.5, bold: true, align: "center" });
  text(s, "MOODROBE", 0.7, 1.78, 6.8, 0.72, { fontSize: 38, bold: true, color: C.navy, charSpacing: 1 });
  text(s, "나만의 옷장으로\n완성하는 오늘의 코디", 0.72, 2.67, 6.4, 1.22, { fontSize: 28, bold: true, color: C.navy, breakLine: true, valign: "top" });
  text(s, "날씨와 상황, 그리고 내 옷장을 연결하는\n개인화 코디 추천 서비스", 0.74, 4.23, 5.7, 0.7, { fontSize: 16, bold: true, color: C.ink, breakLine: true, valign: "top" });
  rect(s, 0.73, 5.47, 5.72, 0.7, C.mint, C.line, 1.2);
  text(s, "서비스 기획 · UX/UI · 프로토타입 구현", 0.98, 5.68, 5.2, 0.2, { fontSize: 11.5, bold: true, align: "center" });
  text(s, "2026", 0.74, 6.76, 1.2, 0.18, { fontSize: 8, bold: true, color: C.muted });
}

// 2. Problem
{
  const s = pptx.addSlide(); bg(s); header(s, "01", "Problem"); title(s, "매일 반복되는 코디 결정의 피로", "옷은 충분하지만, 오늘 입을 옷을 고르는 일은 여전히 어렵습니다.");
  const items = [["날씨", "기온과 강수 여부를\n함께 고려해야 해요."], ["상황", "출근·약속·활동 등\nTPO에 맞춰야 해요."], ["조합", "가지고 있는 옷끼리\n어울리는지 판단해야 해요."]];
  items.forEach(([h, b], i) => card(s, 0.64 + i * 4.18, 2.55, 3.55, 2.12, [C.yellow, C.pink, C.mint][i], h, b));
  rect(s, 0.64, 5.33, 12.03, 0.92, C.navy, C.navy, 0);
  text(s, "핵심 문제: 선택지가 많을수록 '무엇을 입지?'라는 결정 비용이 커진다.", 0.98, 5.63, 11.3, 0.25, { fontSize: 17, bold: true, color: C.white, align: "center" }); footer(s, 2);
}

// 3. Solution
{
  const s = pptx.addSlide(); bg(s, "FFF8C9"); header(s, "02", "Solution"); title(s, "내 옷장 데이터에서 시작하는 한 벌의 답", "MOODROBE는 사용자가 등록한 실제 옷을 바탕으로 오늘의 코디를 추천합니다.");
  const flow = [["01", "옷 등록", "사진, 종류, 색상,\n어울리는 상황 입력"], ["02", "조건 선택", "날씨와 오늘의\n상황을 선택"], ["03", "코디 추천", "조합 점수를 계산해\n가장 어울리는 룩 제안"]];
  flow.forEach(([n, h, b], i) => { const x = 0.8 + i * 4.15; rect(s, x, 2.55, 3.18, 2.38, C.cream, C.line, 1.2); rect(s, x + 0.22, 2.27, 0.7, 0.45, C.pink, C.line, 1); text(s, n, x + 0.31, 2.4, 0.5, 0.15, { fontSize: 8, bold: true, align: "center" }); text(s, h, x + 0.25, 3.05, 2.7, 0.35, { fontSize: 18, bold: true, align: "center" }); text(s, b, x + 0.35, 3.72, 2.5, 0.62, { fontSize: 12, color: C.ink, align: "center", breakLine: true }); if (i < 2) text(s, ">", x + 3.4, 3.4, 0.38, 0.32, { fontSize: 26, bold: true, color: C.line, align: "center" }); });
  text(s, "개인 소유 옷의 활용도를 높이고, 매일의 코디 결정을 가볍게 만듭니다.", 1.17, 5.7, 11, 0.35, { fontSize: 16, bold: true, align: "center", color: C.navy }); footer(s, 3);
}

// 4. Target and value
{
  const s = pptx.addSlide(); bg(s); header(s, "03", "Target & Value"); title(s, "누구를 위한 서비스인가", "빠르게 결정하고 싶지만, 나다운 스타일은 포기하고 싶지 않은 사람을 위한 옷장 메이트");
  card(s, 0.65, 2.38, 3.65, 3.55, C.yellow, "주요 사용자", "- 매일 코디를 고민하는 학생·직장인\n- 가지고 있는 옷을 더 잘 활용하고 싶은 사람\n- 간편하고 친근한 패션 경험을 원하는 사용자");
  card(s, 4.83, 2.38, 3.65, 3.55, C.mint, "사용자 가치", "- 나만의 옷 기준 추천\n- 날씨와 TPO를 한 번에 반영\n- 사진 중심의 직관적인 옷장 관리");
  card(s, 9.01, 2.38, 3.65, 3.55, C.pink, "서비스 가치", "- 개인화된 코디 제안\n- 의류 재발견 및 활용도 향상\n- 재미있는 게임형 추천 경험"); footer(s, 4);
}

// 5. Key features
{
  const s = pptx.addSlide(); bg(s, "FFF8C9"); header(s, "04", "Key Features"); title(s, "세 가지 화면으로 완성한 핵심 경험", "복잡한 기능을 최소한의 흐름으로 연결해, 처음 써도 바로 이해할 수 있게 했습니다.");
  const features = [["MY CLOSET", "사진 업로드와 메타데이터 입력으로\n실제 보유 의류를 관리"], ["TODAY'S OUTFIT", "날씨·상황 선택 후 슬롯 머신을 돌려\n오늘의 코디를 확인"], ["MY PROFILE", "닉네임과 픽셀 캐릭터를 꾸미며\n개인적인 서비스 경험 강화"]];
  features.forEach(([h, b], i) => { const x = 0.66 + i * 4.18; rect(s, x, 2.48, 3.57, 3.43, C.cream, C.line, 1.2); rect(s, x + 0.18, 2.69, 3.21, 0.55, [C.sky, C.pink, C.mint][i], C.line, 1); text(s, h, x + 0.28, 2.88, 3.0, 0.17, { fontSize: 9, bold: true, align: "center", fontFace: "Courier New" }); text(s, ["옷을 모으고", "오늘을 고르고", "나를 표현하는"][i], x + 0.28, 3.65, 3.0, 0.36, { fontSize: 17, bold: true, align: "center" }); text(s, b, x + 0.38, 4.35, 2.8, 0.68, { fontSize: 12, color: C.ink, align: "center", breakLine: true }); }); footer(s, 5);
}

// 6. User flow
{
  const s = pptx.addSlide(); bg(s); header(s, "05", "User Flow"); title(s, "가입부터 추천까지, 4단계의 단순한 여정", "로컬 계정 생성 후 옷장을 채우면 개인화 추천을 바로 경험할 수 있습니다.");
  const steps = [["01", "로컬 계정 생성", "닉네임과 PIN 설정"], ["02", "옷장 구성", "사진과 특징 등록"], ["03", "오늘의 조건 선택", "날씨와 상황 선택"], ["04", "룩 결과 확인", "최적 조합 확인"]];
  steps.forEach(([n, h, b], i) => { const x = 0.52 + i * 3.16; rect(s, x, 2.83, 2.63, 2.1, C.cream, C.line, 1.2); rect(s, x + 0.18, 2.55, 0.62, 0.44, [C.yellow, C.mint, C.pink, C.sky][i], C.line, 1); text(s, n, x + 0.26, 2.69, 0.47, 0.14, { fontSize: 7, bold: true, align: "center" }); text(s, h, x + 0.21, 3.36, 2.2, 0.3, { fontSize: 14.5, bold: true, align: "center" }); text(s, b, x + 0.25, 4.05, 2.13, 0.25, { fontSize: 11, color: C.ink, align: "center" }); if (i < 3) text(s, "+", x + 2.77, 3.67, 0.3, 0.25, { fontSize: 19, bold: true, color: C.line, align: "center" }); });
  rect(s, 2.22, 5.65, 8.88, 0.55, C.navy, C.navy, 0); text(s, "등록한 내 옷 → 오늘의 맥락 → 신뢰할 수 있는 추천", 2.44, 5.82, 8.45, 0.2, { fontSize: 13, bold: true, color: C.white, align: "center" }); footer(s, 6);
}

// 7. Recommendation logic
{
  const s = pptx.addSlide(); bg(s, "FFF8C9"); header(s, "06", "Recommendation Logic"); title(s, "코디 조합을 점수로 비교하는 추천 로직", "상의·하의·신발 후보를 만들고, 색상과 상황의 어울림을 점수화합니다.");
  card(s, 0.68, 2.37, 3.55, 3.38, C.sky, "1. 후보 필터링", "날씨에 맞지 않는 카테고리를 먼저 제외하고, 선택한 상황에 맞는 아이템을 우선합니다.");
  card(s, 4.89, 2.37, 3.55, 3.38, C.mint, "2. 호환성 점수", "동일색·무채색·보색 여부와 공통 상황 수를 반영해 아이템 쌍의 점수를 계산합니다.");
  card(s, 9.1, 2.37, 3.55, 3.38, C.pink, "3. 최적 룩 선택", "가능한 상의·하의·신발 조합 중 총점이 가장 높은 한 벌을 최종 추천합니다.");
  text(s, "결과: 무작위처럼 즐겁지만, 내 옷의 맥락을 반영한 추천", 1.32, 6.17, 10.7, 0.28, { fontSize: 16, bold: true, align: "center" }); footer(s, 7);
}

// 8. UX/UI concept
{
  const s = pptx.addSlide(); bg(s); header(s, "07", "UX/UI Concept"); title(s, "'게임처럼 가볍게, 옷장처럼 친근하게'", "픽셀 그래픽과 슬롯 머신 은유로 추천 과정 자체를 즐거운 경험으로 설계했습니다.");
  const concepts = [["PIXEL UI", "뚜렷한 테두리와 밝은 원색으로\n기억하기 쉬운 서비스 인상"], ["SLOT MACHINE", "추천 결과를 기다리는 순간을\n작은 놀이로 전환"], ["WARDROBE PAL", "프로필 캐릭터로 서비스와\n사용자 사이의 정서적 연결 강화"]];
  concepts.forEach(([h, b], i) => { const x = 0.66 + i * 4.18; rect(s, x, 2.6, 3.56, 2.65, [C.sky, C.yellow, C.mint][i], C.line, 1.3); rect(s, x + 0.18, 2.78, 0.56, 0.56, C.cream, C.line, 1); text(s, ["#", "*", "+"][i], x + 0.31, 2.9, 0.3, 0.18, { fontSize: 14, bold: true, align: "center" }); text(s, h, x + 0.25, 3.62, 3.05, 0.22, { fontSize: 12, bold: true, align: "center", fontFace: "Courier New" }); text(s, b, x + 0.36, 4.2, 2.85, 0.54, { fontSize: 12, color: C.navy, bold: true, align: "center", breakLine: true }); }); footer(s, 8);
}

// 9. Technical implementation
{
  const s = pptx.addSlide(); bg(s, "FFF8C9"); header(s, "08", "Implementation"); title(s, "브라우저 안에서 완결되는 프로토타입", "별도의 서버 없이도 개인 옷장 데이터를 안전하게 분리하고, 즉시 사용할 수 있도록 구현했습니다.");
  card(s, 0.67, 2.39, 3.56, 3.28, C.sky, "React + Vite", "컴포넌트 기반 화면 구성으로 옷장, 추천, 프로필 기능을 하나의 SPA 경험으로 연결했습니다.");
  card(s, 4.88, 2.39, 3.56, 3.28, C.mint, "IndexedDB", "계정 정보와 옷장 데이터를 브라우저 로컬 저장소에 보관해 개인별 데이터를 유지합니다.");
  card(s, 9.09, 2.39, 3.56, 3.28, C.pink, "PIN Hash", "PIN 원문 대신 salt를 결합한 SHA-256 해시값을 저장해 로컬 잠금 경험을 제공합니다.");
  text(s, "현재 범위: 브라우저 전용 개인 옷장 · 다음 단계: 클라우드 동기화와 실제 날씨 연동", 0.8, 6.12, 11.9, 0.3, { fontSize: 14, bold: true, align: "center", color: C.ink }); footer(s, 9);
}

// 10. Closing
{
  const s = pptx.addSlide(); bg(s, C.sky);
  rect(s, 0, 0, 13.333, 0.26, C.navy, C.navy, 0);
  rect(s, 7.97, 0.77, 4.35, 5.78, C.cream, C.line, 2);
  rect(s, 8.14, 0.93, 4.35, 5.78, C.line, C.line, 0);
  s.addImage({ path: poster, x: 8.05, y: 0.85, w: 4.35, h: 5.78, sizing: { type: "contain", x: 8.05, y: 0.85, w: 4.35, h: 5.78 } });
  text(s, "MOODROBE", 0.72, 1.25, 6.25, 0.5, { fontSize: 30, bold: true, color: C.navy });
  text(s, "오늘의 코디 고민을\n나만의 옷장 경험으로 바꾸다", 0.72, 2.12, 6.45, 1.22, { fontSize: 27, bold: true, color: C.navy, breakLine: true });
  text(s, "내 옷을 더 잘 알고,\n더 자주 입게 만드는 개인화 코디 서비스", 0.75, 3.95, 5.9, 0.7, { fontSize: 16, bold: true, color: C.ink, breakLine: true });
  rect(s, 0.73, 5.4, 4.9, 0.65, C.yellow, C.line, 1.2);
  text(s, "THANK YOU", 0.91, 5.61, 4.52, 0.19, { fontSize: 12, bold: true, align: "center", fontFace: "Courier New" });
  text(s, "moodrobe.", 0.75, 6.68, 2.0, 0.22, { fontSize: 13, bold: true, color: C.navy });
}

await pptx.writeFile({ fileName: "MOODROBE_발표자료_10장.pptx" });
