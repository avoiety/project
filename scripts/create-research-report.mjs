import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";

const root = path.resolve(import.meta.dirname, "..");
const template = path.join(root, "researchform.hwpx");
const output = path.join(root, "강은효_편집전.hwpx");

const fields = {
  "{{보고서제목}}": "날씨·상황 기반 의상 추천 서비스의 이산수학적 모델링과 구현",
  "{{연구자학교}}": "[확인 필요]",
  "{{연구자이름}}": "강은효",
  "{{서론내용}}": "외출 전 날씨에 맞는 옷을 고르고 장소와 상황에 어울리는 조합을 정하는 불편을 해결하기 위해 연구를 시작하였다. 목적은 등록한 의상 중 조건에 맞으면서 서로 어울리는 코디를 제안하는 웹 서비스를 구현하는 것이다. 날씨·상황 정보의 순서쌍을 정의역, 내 옷장 의상 집합의 멱집합을 공역으로 두고 후보군을 만들었다. 하나의 조건에 여러 의상이 대응하므로 일대일 대응이 아니라는 점을 확인했고, 의상 관계를 함께 평가하는 방법을 탐구하였다.",
  "{{탐구과정내용}}": "7월 11일에는 날씨와 상황을 입력받는 함수 관계를 정의하였다. 7월 18일에는 의상을 정점, 어울림을 간선, 조합 점수를 가중치로 하는 가중치 그래프를 만들고 탐욕 방식을 적용하였다. 처음 선택한 의상과 마지막 의상 사이의 가중치가 빠지는 문제가 있어, 후보를 필터링한 뒤 상의 T·하의 B·신발 S의 모든 T×B×S 조합을 평가하도록 바꾸었다. 7월 25일에는 부울 논리식과 분류 구조를 탐색했고, 7월 27~28일에는 Opencode로 React 웹사이트를 구현하며 상황 조건과 그래프 평가 로직을 점검했다.",
  "{{탐구결과내용}}": "MOODROBE는 의상 사진 등록·수정·삭제, 날씨·상황 선택, 코디 추천과 브라우저 로컬 저장을 제공한다. 날씨는 맑음·흐림·비·추움, 상황은 일상·출근·약속·활동으로 구성했다. 가중치는 같은 색 5점, 중립색 조합 7점, 지정 보색 조합 6점, 기타 2점에 공통 상황당 2점과 아우터 보너스 1점을 더해 계산한다. T×B×S의 모든 조합에서 세 의상 쌍의 가중치 합을 구하고 가장 높은 점수의 조합을 추천한다.",
  "{{결론내용}}": "날씨와 상황에 맞는 의상을 찾는 함수 관계에서 출발해, 가중치 그래프로 의상 관계를 표현하는 추천 방식으로 확장하였다. 탐욕 방식의 한계는 세 의상의 모든 쌍 관계를 합산해 전체 조합을 평가하는 방법으로 보완했다. 함수·집합·부울 논리·가중치 그래프·데카르트 곱과 최댓값 선택을 실제 웹 서비스 구현에 적용했다. 다만 고정 가중치는 개인 선호와 세부 의상 정보를 충분히 반영하지 못하고, 브라우저 로컬 저장은 다른 기기 동기화를 지원하지 않는다.",
  "{{소감내용}}": "입력 조건에 맞는 의상을 찾는 함수만으로는 코디 전체의 조화를 판단하기 어렵다는 점을 확인하였다. 탐욕 방식의 오류를 발견한 뒤 전체 조합의 관계를 비교하는 방법으로 바꾸면서 수학적 모델과 구현 결과를 함께 검증하는 과정의 중요성을 배웠다. 웹사이트 구현 후에도 상황 조건과 가중치 그래프가 반영되었는지 다시 확인하고 수정했다.",
  "{{제언내용}}": "사용자 선택과 피드백으로 가중치를 조정해 개인 선호를 반영할 필요가 있다. 소재·두께·격식과 습도·바람 같은 세부 정보를 추가하면 필터링을 더 정교하게 할 수 있다. 의상 수가 늘어날 때의 T×B×S 조합 증가를 고려해 후보 집합 축소와 탐색 효율을 검토해야 한다. 클라우드 저장으로 백업·복구·동기화를 지원하는 방안도 탐색할 수 있다.",
  "{{참고문헌내용}}": "1. 강은효, bogo.md, 연구일지, 제공 자료.\n2. 강은효, 포스터수정.pptx, 상황에 따른 의상 추천 서비스 개발, 슬라이드 1.\n3. MOODROBE 프로젝트, README.md, 기능 및 로컬 저장 방식 설명.\n4. MOODROBE 프로젝트, src/App.jsx, 후보 필터링 및 가중치 그래프 구현 코드.\n5. MOODROBE 프로젝트, MOODROBE_발표자료_10장.pptx, 슬라이드 7-9.\n6. MOODROBE 프로젝트, MOODROBE_추가슬라이드_3장.pptx, 슬라이드 2-3.",
};

if (fs.existsSync(output)) throw new Error(`Refusing to overwrite ${path.basename(output)}`);
const zip = await JSZip.loadAsync(fs.readFileSync(template));
for (const [name, entry] of Object.entries(zip.files)) {
  if (!/^Contents\/section\d+\.xml$/.test(name)) continue;
  let xml = await entry.async("string");
  for (const [token, value] of Object.entries(fields)) xml = xml.replaceAll(token, value);
  // Do not add synthetic directory entries; the template does not contain them.
  zip.file(name, xml, { createFolders: false });
}
fs.writeFileSync(output, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
console.log(output);
