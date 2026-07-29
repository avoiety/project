import { useEffect, useMemo, useState } from "react";

const weatherOptions = [
  { id: "sunny", label: "맑음", icon: "SUN", temp: "18°" },
  { id: "cloudy", label: "흐림", icon: "CLD", temp: "15°" },
  { id: "rainy", label: "비", icon: "RNY", temp: "13°" },
  { id: "cold", label: "추움", icon: "CLD", temp: "5°" },
];
const occasions = ["일상", "출근", "약속", "활동"];
const categories = ["반팔", "긴팔", "셔츠", "니트", "아우터", "바지", "치마", "원피스", "신발", "가방"];
const colors = ["흰색", "검정", "회색", "베이지", "갈색", "파랑", "하늘색", "노랑", "분홍", "초록", "빨강"];
const profileOptions = {
  skin: ["peach", "tan", "deep"],
  hair: ["bob", "bang", "curl"],
  outfit: ["mint", "pink", "sun"],
};
const defaultProfile = { skin: "peach", hair: "bob", outfit: "mint" };
const defaultItems = [
  { id: "starter-shirt", name: "크림 코튼 셔츠", category: "셔츠", color: "흰색", occasions: ["일상", "출근", "약속"], image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80" },
  { id: "starter-jeans", name: "빈티지 블루 데님", category: "바지", color: "파랑", occasions: ["일상", "약속", "활동"], image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80" },
  { id: "starter-shoes", name: "화이트 스니커즈", category: "신발", color: "흰색", occasions, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" },
];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("moodrobe-local", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("app", { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readAccount() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction("app", "readonly").objectStore("app").get("account");
    request.onsuccess = () => { db.close(); resolve(request.result?.value || null); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function writeAccount(account) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction("app", "readwrite").objectStore("app").put({ key: "account", value: account });
    request.onsuccess = () => { db.close(); resolve(); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

function bytesToHex(bytes) { return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(""); }
function randomSalt() { const bytes = crypto.getRandomValues(new Uint8Array(16)); return bytesToHex(bytes); }
async function hashPin(pin, salt) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hash));
}

function legacyCloset() {
  try { return JSON.parse(localStorage.getItem("moodrobe-closet")) || defaultItems; } catch { return defaultItems; }
}

function App() {
  const [account, setAccount] = useState(undefined);
  const [unlocked, setUnlocked] = useState(false);
  const [page, setPage] = useState(() => ["closet", "profile"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "today");
  const [toast, setToast] = useState("");

  useEffect(() => { readAccount().then(setAccount).catch(() => setAccount(null)); }, []);
  useEffect(() => { const onHash = () => setPage(["closet", "profile"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "today"); addEventListener("hashchange", onHash); return () => removeEventListener("hashchange", onHash); }, []);

  function notify(message) { setToast(message); window.setTimeout(() => setToast(""), 2500); }
  async function saveAccount(nextAccount) { await writeAccount(nextAccount); setAccount(nextAccount); }
  function navigate(next) { location.hash = ["closet", "profile"].includes(next) ? next : "today"; }

  if (account === undefined) return <main className="account-screen"><p className="loading-copy">MOODROBE를 준비하고 있어요...</p></main>;
  if (!unlocked) return <AccountGate account={account} onCreate={saveAccount} onUnlock={() => setUnlocked(true)} />;

  return <><header className="topbar wrap"><a className="brand" href="#today">moodrobe<span>.</span></a><nav><button className={page === "closet" ? "active" : ""} onClick={() => navigate("closet")}>MY CLOSET</button><button className={page === "today" ? "active" : ""} onClick={() => navigate("today")}>TODAY'S OUTFIT</button></nav><button className="profile-trigger" onClick={() => navigate("profile")} aria-label="내 프로필 열기"><Character profile={account.profile} small /></button></header><main>{page === "closet" ? <ClosetPage account={account} onSave={saveAccount} notify={notify} /> : page === "profile" ? <ProfilePage account={account} onSave={saveAccount} notify={notify} /> : <TodayPage closet={account.closet} navigate={navigate} notify={notify} />}</main>{toast && <div className="toast" role="status">{toast}</div>}</>;
}

function AccountGate({ account, onCreate, onUnlock }) {
  const [nickname, setNickname] = useState(account?.nickname || "");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isNew = !account;

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!/^\d{4,8}$/.test(pin)) { setError("PIN은 숫자 4~8자리로 입력해 주세요."); return; }
    if (isNew) {
      if (!nickname.trim()) { setError("닉네임을 입력해 주세요."); return; }
      if (pin !== confirmPin) { setError("PIN이 서로 달라요."); return; }
      setBusy(true);
      try {
        const salt = randomSalt();
        const pinHash = await hashPin(pin, salt);
        await onCreate({ nickname: nickname.trim().slice(0, 16), salt, pinHash, profile: defaultProfile, closet: legacyCloset() });
        localStorage.removeItem("moodrobe-closet");
        onUnlock();
      } catch { setError("저장소를 열 수 없어요. 브라우저 설정을 확인해 주세요."); }
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      const pinHash = await hashPin(pin, account.salt);
      if (nickname.trim() !== account.nickname || pinHash !== account.pinHash) { setError("닉네임 또는 PIN이 맞지 않아요."); } else { onUnlock(); }
    } catch { setError("PIN을 확인하지 못했어요. 다시 시도해 주세요."); }
    setBusy(false);
  }

  return <main className="account-screen"><section className="account-card panel"><div className="account-character"><Character profile={defaultProfile} /></div><div><p className="eyebrow"><i /> LOCAL WARDROBE LOCK</p><h1>{isNew ? "나만의 옷장을\n만들어 볼까요?" : `${account.nickname}의\n옷장에 돌아왔어요!`}</h1><p className="account-description">{isNew ? "닉네임과 PIN은 이 브라우저의 IndexedDB에만 저장돼요." : "PIN을 입력하면 나만의 옷장과 캐릭터를 불러와요."}</p></div><form onSubmit={submit}><label>닉네임<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength="16" autoComplete="username" placeholder="예: 무드냥" /></label><label>PIN <small>숫자 4~8자리</small><input type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))} autoComplete={isNew ? "new-password" : "current-password"} placeholder="PIN 입력" /></label>{isNew && <label>PIN 다시 입력<input type="password" inputMode="numeric" value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 8))} autoComplete="new-password" placeholder="PIN 다시 입력" /></label>}{error && <p className="account-error" role="alert">{error}</p>}<button className="pixel-button" disabled={busy} type="submit">{busy ? "SAVING..." : isNew ? "내 옷장 만들기" : "내 옷장 열기"}</button></form><p className="account-note">PIN 원문은 저장하지 않고, 해시값만 저장합니다. 이 기능은 같은 브라우저에서만 사용할 수 있어요.</p></section></main>;
}

function Character({ profile, small = false }) { return <span className={`character ${small ? "character-small" : ""} skin-${profile.skin} hair-${profile.hair} outfit-${profile.outfit}`} aria-hidden="true"><i className="character-hair" /><i className="character-face"><b /><b /></i><i className="character-body" /><i className="character-heart" /></span>; }

function ProfilePage({ account, onSave, notify }) {
  const [draft, setDraft] = useState(account.profile);
  const [nickname, setNickname] = useState(account.nickname);
  function choose(group, value) { setDraft((current) => ({ ...current, [group]: value })); }
  async function saveProfile(event) { event.preventDefault(); const next = { ...account, nickname: nickname.trim().slice(0, 16) || account.nickname, profile: draft }; await onSave(next); notify("프로필을 꾸몄어요!"); }
  return <section className="page wrap profile-page"><PageTitle number="03" title={<>내 <em>프로필</em></>} text="오늘의 무드에 맞게 귀여운 캐릭터를 꾸며 보세요." /><form className="profile-layout" onSubmit={saveProfile}><section className="character-stage panel"><span className="profile-sparkle one">+</span><span className="profile-sparkle two">*</span><Character profile={draft} /><p>MOODROBE PAL</p><h2>{nickname || account.nickname}</h2><span>나만의 옷장 메이트</span></section><section className="profile-editor panel"><label className="profile-name">닉네임<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength="16" /></label><ProfileChoices label="피부 톤" group="skin" choices={["peach", "tan", "deep"]} value={draft.skin} onChoose={choose} /><ProfileChoices label="헤어" group="hair" choices={["bob", "bang", "curl"]} value={draft.hair} onChoose={choose} /><ProfileChoices label="옷 색" group="outfit" choices={["mint", "pink", "sun"]} value={draft.outfit} onChoose={choose} /><button className="pixel-button" type="submit">프로필 저장하기</button></section></form></section>;
}

function ProfileChoices({ label, group, choices, value, onChoose }) { const labels = { peach: "피치", tan: "태닝", deep: "브라운", bob: "단발", bang: "앞머리", curl: "컬", mint: "민트", pink: "핑크", sun: "옐로" }; return <fieldset className="profile-choices"><legend>{label}</legend><div>{choices.map((choice) => <button className={value === choice ? "selected" : ""} type="button" key={choice} onClick={() => onChoose(group, choice)}><i className={`swatch ${group}-${choice}`} />{labels[choice]}</button>)}</div></fieldset>; }

function ClosetPage({ account, onSave, notify }) {
  const closet = account.closet;
  const emptyForm = { name: "", category: "반팔", color: "흰색", occasions: ["일상"], image: "" };
  const [form, setForm] = useState(emptyForm); const [preview, setPreview] = useState(""); const [editingItem, setEditingItem] = useState(null); const [editForm, setEditForm] = useState(emptyForm); const [editPreview, setEditPreview] = useState("");
  function readImage(event, applyImage) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => applyImage(reader.result); reader.readAsDataURL(file); }
  function uploadImage(event) { readImage(event, (image) => { setPreview(image); setForm((current) => ({ ...current, image })); }); }
  function addItem(event) { event.preventDefault(); if (!form.name.trim() || !form.image) { notify("옷 이름과 사진을 모두 등록해 주세요!"); return; } onSave({ ...account, closet: [...closet, { ...form, id: crypto.randomUUID() }] }); setForm(emptyForm); setPreview(""); notify("옷장에 새 아이템을 넣었어요!"); }
  function removeItem(id) { onSave({ ...account, closet: closet.filter((item) => item.id !== id) }); notify("옷장에서 아이템을 뺐어요."); }
  function toggleOccasion(value, setValue) { setValue((current) => ({ ...current, occasions: current.occasions.includes(value) ? current.occasions.filter((item) => item !== value) : [...current.occasions, value] })); }
  function startEdit(item) { setEditingItem(item); setEditForm({ ...item, occasions: item.occasions || occasions }); setEditPreview(item.image); }
  function closeEdit() { setEditingItem(null); setEditPreview(""); }
  function saveEdit(event) { event.preventDefault(); if (!editForm.name.trim() || !editForm.image) { notify("옷 이름과 사진을 모두 등록해 주세요!"); return; } onSave({ ...account, closet: closet.map((item) => item.id === editingItem.id ? { ...item, ...editForm } : item) }); closeEdit(); notify("옷 정보를 수정했어요!"); }
  return <section className="page wrap closet-page"><PageTitle number="01" title={<>내 <em>옷장</em></>} text="실제 가지고 있는 옷을 등록하면, 오늘의 추천이 더 정확해져요." /><div className="closet-layout"><form className="registration panel" onSubmit={addItem}><div className="panel-title"><span>NEW ITEM</span><h2>옷 등록하기</h2></div><label className={`upload-box ${preview ? "has-image" : ""}`}>{preview ? <img src={preview} alt="업로드 미리보기" /> : <><b>+</b><span>사진 업로드</span><small>JPG, PNG 파일을 골라요</small></>}<input type="file" accept="image/*" onChange={uploadImage} /></label><label>옷 이름<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="예: 하늘색 반팔 티셔츠" /></label><SelectField label="종류" value={form.category} options={categories} onChange={(value) => setForm({ ...form, category: value })} /><SelectField label="색깔" value={form.color} options={colors} onChange={(value) => setForm({ ...form, color: value })} /><OccasionField value={form.occasions} onToggle={(value) => toggleOccasion(value, setForm)} /><button className="pixel-button" type="submit">옷장에 넣기 +</button></form><section className="wardrobe"><div className="wardrobe-head"><div><span>MY COLLECTION</span><h2>등록한 옷 <b>{closet.length}</b>개</h2></div><p>사진 또는 수정 버튼을 눌러<br />정보를 바꿀 수 있어요</p></div><div className="item-grid">{closet.map((item) => <article className="clothing-item" key={item.id}><button className="item-photo" aria-label={`${item.name} 수정`} onClick={() => startEdit(item)}><img src={item.image} alt={item.name} /></button><div><b>{item.name}</b><span>{item.category} · {item.color}</span><small>{(item.occasions || occasions).join(" · ")}</small></div><div className="item-actions"><button className="edit-item" onClick={() => startEdit(item)}>수정</button><button className="delete-item" aria-label={`${item.name} 삭제`} onClick={() => removeItem(item.id)}>X</button></div></article>)}</div></section></div>{editingItem && <div className="edit-backdrop" role="presentation" onMouseDown={closeEdit}><form className="edit-dialog panel" onSubmit={saveEdit} onMouseDown={(event) => event.stopPropagation()}><div className="edit-dialog-head"><div className="panel-title"><span>EDIT ITEM</span><h2>옷 정보 수정</h2></div><button type="button" aria-label="수정 창 닫기" onClick={closeEdit}>X</button></div><label className="upload-box">{editPreview ? <img src={editPreview} alt="수정할 옷 미리보기" /> : <><b>+</b><span>사진 업로드</span></>}<input type="file" accept="image/*" onChange={(event) => readImage(event, (image) => { setEditPreview(image); setEditForm((current) => ({ ...current, image })); })} /></label><label>옷 이름<input required value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} /></label><SelectField label="종류" value={editForm.category} options={categories} onChange={(value) => setEditForm({ ...editForm, category: value })} /><SelectField label="색깔" value={editForm.color} options={colors} onChange={(value) => setEditForm({ ...editForm, color: value })} /><OccasionField value={editForm.occasions} onToggle={(value) => toggleOccasion(value, setEditForm)} /><div className="edit-actions"><button className="cancel-button" type="button" onClick={closeEdit}>취소</button><button className="pixel-button" type="submit">수정 저장</button></div></form></div>}</section>;
}

const neutralColors = new Set(["흰색", "검정", "회색", "베이지", "갈색"]);
const complementaryColors = new Set(["파랑-노랑", "노랑-파랑", "하늘색-갈색", "갈색-하늘색", "분홍-초록", "초록-분홍", "빨강-하늘색", "하늘색-빨강"]);
function compatibilityWeight(first, second) { let weight = first.color === second.color ? 5 : neutralColors.has(first.color) || neutralColors.has(second.color) ? 7 : complementaryColors.has(`${first.color}-${second.color}`) ? 6 : 2; weight += (first.occasions || []).filter((occasion) => (second.occasions || []).includes(occasion)).length * 2; return weight + (first.category === "아우터" || second.category === "아우터" ? 1 : 0); }
function buildCompatibilityGraph(items) { const graph = new Map(items.map((item) => [item.id, new Map()])); items.forEach((item, index) => items.slice(index + 1).forEach((other) => { const weight = compatibilityWeight(item, other); graph.get(item.id).set(other.id, weight); graph.get(other.id).set(item.id, weight); })); return graph; }
function TodayPage({ closet, navigate, notify }) { const [weather, setWeather] = useState("sunny"); const [occasion, setOccasion] = useState("일상"); const [spinning, setSpinning] = useState(false); const [result, setResult] = useState(null); const matchingItems = useMemo(() => closet.filter((item) => weather === "rainy" ? ["아우터", "신발", "긴팔", "바지"].includes(item.category) : weather === "cold" ? !["반팔", "치마"].includes(item.category) : true), [closet, weather]); const pools = useMemo(() => ({ top: matchingItems.filter((item) => ["반팔", "긴팔", "셔츠", "니트", "아우터"].includes(item.category)), bottom: matchingItems.filter((item) => ["바지", "치마", "원피스"].includes(item.category)), shoes: matchingItems.filter((item) => item.category === "신발") }), [matchingItems]); const graph = useMemo(() => buildCompatibilityGraph(closet), [closet]); function candidates(slot) { const type = slot === "top" ? ["반팔", "긴팔", "셔츠", "니트", "아우터"] : slot === "bottom" ? ["바지", "치마", "원피스"] : ["신발"]; const filtered = pools[slot].filter((item) => (item.occasions || occasions).includes(occasion)); return filtered.length ? filtered : pools[slot].length ? pools[slot] : closet.filter((item) => type.includes(item.category)); } function spin() { if (!closet.length) { notify("먼저 내 옷장에 옷을 등록해 주세요!"); return; } setSpinning(true); setResult(null); window.setTimeout(() => { const top = candidates("top"); const bottom = candidates("bottom"); const shoes = candidates("shoes"); const looks = []; top.forEach((a) => bottom.forEach((b) => shoes.forEach((c) => looks.push({ top: a, bottom: b, shoes: c, score: graph.get(a.id).get(b.id) + graph.get(a.id).get(c.id) + graph.get(b.id).get(c.id) })))); const best = looks.sort((a, b) => b.score - a.score)[0]; setResult(best || { top: top[0], bottom: bottom[0], shoes: shoes[0] }); setSpinning(false); }, 1000); } return <section className="page wrap today-page"><PageTitle number="02" title={<>오늘의 <em>옷</em></>} text="날씨와 오늘의 상황을 고른 뒤, 카지노 룰렛을 돌려 보세요!" /><div className="today-layout"><section className="game-panel panel"><div className="panel-title"><span>QUEST SETUP</span><h2>오늘의 조건</h2></div><p className="field-label">오늘 날씨</p><div className="weather-picks">{weatherOptions.map((item) => <button className={weather === item.id ? "active" : ""} key={item.id} onClick={() => setWeather(item.id)}><i>{item.icon}</i><span>{item.label}<small>{item.temp}</small></span></button>)}</div><p className="field-label">오늘의 상황</p><div className="occasion-picks">{occasions.map((item) => <button className={occasion === item ? "active" : ""} key={item} onClick={() => setOccasion(item)}>{item}</button>)}</div><div className="status-card"><b>{weatherOptions.find((item) => item.id === weather).label} · {occasion}</b><span>날씨와 상황에 맞는 옷 {matchingItems.filter((item) => (item.occasions || occasions).includes(occasion)).length}개</span></div></section><section className="roulette-area"><div className="slot-machine"><div className="machine-top"><span>LUCKY</span><b>OUTFIT SLOTS</b><span>LUCKY</span></div><div className="reels"><SlotReel label="상의" items={pools.top} spinning={spinning} result={result?.top} /><SlotReel label="하의" items={pools.bottom} spinning={spinning} result={result?.bottom} /><SlotReel label="신발" items={pools.shoes} spinning={spinning} result={result?.shoes} /></div></div><button className="spin-button" onClick={spin} disabled={spinning}>{spinning ? "SPINNING..." : "SPIN THE LOOK!"}</button></section></div><section className="result-zone">{result ? <div className="result-items">{Object.entries(result).filter(([key]) => key !== "score").map(([slot, item]) => <article key={slot}>{item ? <><img src={item.image} alt={item.name} /><b>{item.name}</b><span>{slot === "top" ? "상의" : slot === "bottom" ? "하의" : "신발"} · {item.color}</span></> : <><b>+</b><span>등록 필요</span></>}</article>)}</div> : <div className="empty-result"><b>?</b><p>세 개의 릴을 동시에 돌려 코디를 완성해 보세요.</p>{closet.length === 0 && <button onClick={() => navigate("closet")}>내 옷장 채우러 가기 →</button>}</div>}</section></section>; }
function PageTitle({ number, title, text }) { return <div className="page-title"><span>PAGE {number}</span><div><h1>{title}</h1><p>{text}</p></div></div>; }
function SelectField({ label, value, options, onChange }) { return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function OccasionField({ value, onToggle }) { return <fieldset className="occasion-field"><legend>어울리는 상황 <small>복수 선택</small></legend><div>{occasions.map((item) => <button type="button" className={value.includes(item) ? "selected" : ""} key={item} onClick={() => onToggle(item)}>{item}</button>)}</div></fieldset>; }
function SlotReel({ label, items, spinning, result }) { const item = spinning ? items[0] : result; return <div className={`slot-reel ${spinning ? "spinning" : ""}`}><div className="reel-label">{label}</div><div className="reel-window">{item ? <><img src={item.image} alt={item.name} /><b>{item.name}</b></> : <span>?</span>}</div></div>; }
export default App;
