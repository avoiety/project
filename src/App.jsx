import { useEffect, useMemo, useState } from "react";

const weatherOptions = [
  { id: "sunny", label: "맑음", icon: "SUN", temp: "18°", note: "체감 17° · 가벼운 겉옷을 챙기세요" },
  { id: "cloudy", label: "흐림", icon: "CLD", temp: "15°", note: "체감 14° · 얇은 레이어를 추천해요" },
  { id: "rainy", label: "비", icon: "RNY", temp: "13°", note: "방수 소재와 미끄럽지 않은 신발이 좋아요" },
  { id: "cold", label: "추움", icon: "CLD", temp: "5°", note: "체감 온도가 낮아요 · 보온에 신경 쓰세요" },
];

const occasions = [
  { id: "daily", label: "일상" },
  { id: "work", label: "출근" },
  { id: "date", label: "약속" },
  { id: "active", label: "활동" },
];

const recommendationBank = {
  sunny: {
    daily: { title: "Soft Utility", score: 96, description: "힘을 뺀 실루엣에 질감으로 균형을 잡은, 햇살 좋은 날의 가벼운 레이어링.", pieces: ["오프화이트 셔츠", "빈티지 데님", "브라운 로퍼"], reason: "상의의 밝은 톤과 데님의 깊이가 안정적인 대비를 만들어요.", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85" },
    work: { title: "Clear Form", score: 94, description: "단정한 선과 부드러운 색감으로 신뢰감은 높이고 답답함은 덜었어요.", pieces: ["스트라이프 셔츠", "네이비 슬랙스", "블랙 더비"], reason: "명도 차이가 선명해 깔끔한 인상을 완성합니다.", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85" },
    date: { title: "Warm Contrast", score: 97, description: "담백하지만 가까이 볼수록 디테일이 살아나는 약속을 위한 조합입니다.", pieces: ["니트 베스트", "크림 팬츠", "스웨이드 슈즈"], reason: "따뜻한 뉴트럴 톤이 편안하고 세련된 무드를 만듭니다.", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85" },
    active: { title: "Easy Motion", score: 93, description: "긴 하루에도 흐트러지지 않는 가벼운 활동성을 중심으로 골랐어요.", pieces: ["코튼 티셔츠", "카고 팬츠", "캔버스 스니커즈"], reason: "여유 있는 비율이 움직임과 스타일을 모두 챙깁니다.", image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85" },
  },
  cloudy: { title: "Cloudy Layer", score: 94, description: "흐린 날의 빛에 어울리는 차분한 레이어링으로 구성했어요.", pieces: ["그레이 니트", "블랙 진", "화이트 스니커즈"], reason: "무채색의 농도 차이가 단조롭지 않은 깊이를 더합니다.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85" },
  rainy: { title: "Rainy Balance", score: 95, description: "비 오는 날에도 산뜻함을 잃지 않는 실용적인 조합이에요.", pieces: ["나일론 재킷", "다크 데님", "러버 첼시부츠"], reason: "가벼운 소재와 묵직한 신발의 대비가 안정적입니다.", image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=85" },
  cold: { title: "Winter Ease", score: 94, description: "포근한 온도감 안에서 실루엣이 살아나는 겨울 코디입니다.", pieces: ["울 코트", "램스울 니트", "와이드 팬츠"], reason: "결이 다른 소재를 겹쳐 따뜻하고 풍성한 인상을 줍니다.", image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85" },
};

const defaultSaved = [];

function App() {
  const [weather, setWeather] = useState("sunny");
  const [occasion, setOccasion] = useState("daily");
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("moodrobe-saved") || "[]"));
  const [notice, setNotice] = useState("");
  const selectedWeather = weatherOptions.find((item) => item.id === weather);
  const outfit = useMemo(() => weather === "sunny" ? recommendationBank.sunny[occasion] : recommendationBank[weather], [weather, occasion]);
  const outfitKey = `${weather}-${occasion}-${outfit.title}`;
  const isSaved = saved.some((item) => item.key === outfitKey);

  useEffect(() => localStorage.setItem("moodrobe-saved", JSON.stringify(saved)), [saved]);

  function findOutfit() {
    document.getElementById("recommendation")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleSave() {
    setSaved((current) => isSaved ? current.filter((item) => item.key !== outfitKey) : [...current, { key: outfitKey, title: outfit.title, pieces: outfit.pieces }]);
    setNotice(isSaved ? "저장한 코디에서 삭제했어요." : "내 스타일 로그에 저장했어요.");
    window.setTimeout(() => setNotice(""), 2400);
  }

  return (
    <>
      <header className="topbar wrap">
        <a className="brand" href="#top">moodrobe<span>.</span></a>
        <nav aria-label="주 메뉴"><a href="#recommendation">추천</a><a href="#closet">내 옷장</a></nav>
        <div className="avatar" aria-label="J의 프로필">J</div>
      </header>
      <main id="top">
        <section className="hero wrap">
          <div className="hero-copy"><p className="eyebrow"><i /> PERSONAL OUTFIT ENGINE</p><h1>오늘, 나답게<br /><em>입을</em> 이유.</h1><p>날씨와 일정, 그리고 당신의 옷장을 읽어<br />가장 자연스러운 조합을 찾아드려요.</p><div className="weather-note"><b>{selectedWeather.icon}</b><span><strong>{selectedWeather.temp} {selectedWeather.label}, 서울</strong><small>{selectedWeather.note}</small></span></div></div>
          <div className="hero-photo"><img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85" alt="베이지 재킷 스타일" /><div className="photo-tag">TODAY'S <b>EDIT</b><span>01</span></div></div>
        </section>

        <section className="composer wrap" aria-labelledby="input-heading">
          <div className="section-heading"><p>01 / INPUT</p><h2 id="input-heading">오늘의 <em>장면</em>을 골라주세요.</h2></div>
          <ChoiceRow label="날씨" caption="WEATHER" options={weatherOptions} value={weather} onChange={setWeather} />
          <ChoiceRow label="상황" caption="OCCASION" options={occasions} value={occasion} onChange={setOccasion} />
          <button className="primary-action" onClick={findOutfit}>내 옷장으로 코디 찾기 <span>→</span></button>
        </section>

        <section className="recommendation wrap" id="recommendation" aria-live="polite">
          <div className="result-heading"><div><p>02 / RESULT</p><h2><em>가장 잘 어울리는</em> 오늘의 조합</h2></div><button className="refresh" onClick={findOutfit} aria-label="추천 코디로 이동">R</button></div>
          <article className="outfit-card"><div className="outfit-image"><img src={outfit.image} alt={`${outfit.title} 추천 코디`} /><span>MATCH <b>{outfit.score}%</b></span></div><div className="outfit-details"><p className="kicker">{weather.toUpperCase()} / {occasion.toUpperCase()}</p><h3>{outfit.title}</h3><p className="description">{outfit.description}</p><div className="pieces">{outfit.pieces.map((piece) => <span key={piece}>{piece}</span>)}</div><div className="reason"><b>WHY IT WORKS</b><p>{outfit.reason}</p></div><button className={`save-button ${isSaved ? "saved" : ""}`} onClick={toggleSave}>{isSaved ? "♥ 저장된 코디" : "♡ 이 코디 저장하기"}</button></div></article>
        </section>

        <section className="closet" id="closet"><div className="wrap"><p>03 / YOUR DATA</p><div className="closet-heading"><h2>당신의 옷장이<br />점점 <em>똑똑해지고</em> 있어요.</h2><span>저장한 코디와 피드백이<br />다음 추천의 취향이 됩니다.</span></div><div className="stats"><Stat value="34" label="등록한 아이템" /><Stat value={String(saved.length).padStart(2, "0")} label="저장한 코디" /><Stat value="87%" label="취향 일치도" /></div>{saved.length > 0 && <div className="saved-list"><b>최근 저장한 코디</b>{saved.slice(-3).reverse().map((item) => <span key={item.key}>{item.title} · {item.pieces.join(" / ")}</span>)}</div>}</div></section>
      </main>
      <footer className="wrap"><a className="brand" href="#top">moodrobe<span>.</span></a><span>LESS SEARCHING, MORE DRESSING.</span><span>© 2026</span></footer>
      {notice && <div className="toast" role="status">{notice}</div>}
    </>
  );
}

function ChoiceRow({ label, caption, options, value, onChange }) {
  return <div className="choice-row"><div><small>{caption}</small><b>{label}</b></div><div className="choices">{options.map((option) => <button key={option.id} className={value === option.id ? "active" : ""} onClick={() => onChange(option.id)}>{option.icon && <i>{option.icon}</i>}{option.label}</button>)}</div></div>;
}

function Stat({ value, label }) { return <div><strong>{value}</strong><span>{label}</span></div>; }

export default App;
