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
  accessory: ["none", "heart", "star"],
};
const defaultProfile = { skin: "peach", hair: "bob", outfit: "mint", accessory: "heart" };
const defaultItems = [
  { id: "starter-shirt", name: "크림 코튼 셔츠", category: "셔츠", color: "흰색", occasions: ["일상", "출근", "약속"], image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80" },
  { id: "starter-jeans", name: "빈티지 블루 데님", category: "바지", color: "파랑", occasions: ["일상", "약속", "활동"], image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80" },
  { id: "starter-shoes", name: "화이트 스니커즈", category: "신발", color: "흰색", occasions, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" },
];

const colorValues = { "흰색": "#fffef7", "검정": "#263e6b", "회색": "#91a2b8", "베이지": "#e8c99a", "갈색": "#aa754f", "파랑": "#4f8be3", "하늘색": "#8ed8ef", "노랑": "#f4cf4b", "분홍": "#ef85a5", "초록": "#77c89d", "빨강": "#e96d69" };
function categoryPlaceholder(category, color) {
  const fill = colorValues[color] || "#9edcff";
  const type = category === "신발" ? "shoe" : ["바지", "치마", "원피스"].includes(category) ? "bottom" : "top";
  const shapes = {
    top: '<path d="M70 45 42 64l17 25 14-10v74h54V79l14 10 17-25-28-19-12 16H82z"/>',
    bottom: '<path d="M67 42h66l-7 111h-27l-1-56-5 56H66z"/>',
    shoe: '<path d="M45 104c20 0 34-20 43-42l25 19v24c12 7 27 11 42 12v20H45z"/>'
  };
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#dff4ff"/><path d="M20 170h160" stroke="#31558b" stroke-width="8"/><g fill="${fill}" stroke="#31558b" stroke-width="8" stroke-linejoin="round">${shapes[type]}</g></svg>`)}`;
}

function showDeleteConfirm(item, onConfirm) {
  const backdrop = document.createElement("div");
  const dialog = document.createElement("section");
  const title = document.createElement("h2");
  const message = document.createElement("p");
  const actions = document.createElement("div");
  const cancel = document.createElement("button");
  const confirm = document.createElement("button");
  backdrop.className = "delete-backdrop";
  dialog.className = "delete-dialog panel";
  title.textContent = "정말 삭제할까요?";
  message.innerHTML = `<strong>'${item.name}'</strong>을(를) 옷장에서 삭제합니다.<br />삭제한 아이템은 되돌릴 수 없어요.`;
  cancel.className = "cancel-button";
  cancel.type = "button";
  cancel.textContent = "취소";
  confirm.className = "confirm-delete";
  confirm.type = "button";
  confirm.textContent = "삭제하기";
  const close = () => backdrop.remove();
  cancel.addEventListener("click", close);
  confirm.addEventListener("click", () => { onConfirm(); close(); });
  backdrop.addEventListener("mousedown", (event) => { if (event.target === backdrop) close(); });
  actions.append(cancel, confirm);
  dialog.append(title, message, actions);
  backdrop.append(dialog);
  document.body.append(backdrop);
  cancel.focus();
}

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
  const [page, setPage] = useState(() => ["home", "closet", "profile", "today"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "home");
  const [toast, setToast] = useState("");

  useEffect(() => { readAccount().then(setAccount).catch(() => setAccount(null)); }, []);
  useEffect(() => { const onHash = () => setPage(["home", "closet", "profile", "today"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "home"); addEventListener("hashchange", onHash); return () => removeEventListener("hashchange", onHash); }, []);

  function notify(message) { setToast(message); window.setTimeout(() => setToast(""), 2500); }
  async function saveAccount(nextAccount) { await writeAccount(nextAccount); setAccount(nextAccount); }
  function navigate(next) { location.hash = ["home", "closet", "profile", "today"].includes(next) ? next : "home"; }

  if (account === undefined) return <main className="account-screen"><p className="loading-copy">MOODROBE를 준비하고 있어요...</p></main>;
  if (!unlocked) return <AccountGate account={account} onCreate={saveAccount} onUnlock={() => setUnlocked(true)} />;

  return <><header className="topbar wrap"><a className="brand" href="#home">moodrobe<span>.</span></a><nav><button className={page === "home" ? "active" : ""} onClick={() => navigate("home")}>MY ROOM</button><button className={page === "closet" ? "active" : ""} onClick={() => navigate("closet")}>MY CLOSET</button><button className={page === "today" ? "active" : ""} onClick={() => navigate("today")}>TODAY'S OUTFIT</button></nav><button className="profile-trigger" onClick={() => navigate("profile")} aria-label="내 프로필 열기"><Character profile={account.profile} small /></button></header><main>{page === "home" ? <HomePage account={account} navigate={navigate} /> : page === "closet" ? <ClosetPage account={account} onSave={saveAccount} notify={notify} /> : page === "profile" ? <ProfilePage account={account} onSave={saveAccount} notify={notify} /> : <TodayPage closet={account.closet} navigate={navigate} notify={notify} />}</main>{toast && <div className="toast" role="status">{toast}</div>}</>;
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

  return <main className="account-screen"><section className="account-card panel"><div className="account-character"><Character profile={account?.profile || defaultProfile} /></div><div><p className="eyebrow"><i /> LOCAL WARDROBE LOCK</p><h1>{isNew ? "나만의 옷장을\n만들어 볼까요?" : `${account.nickname}의\n옷장에 돌아왔어요!`}</h1><p className="account-description">{isNew ? "귀여운 캐릭터와 함께 나만의 스타일 공간을 시작해요." : "나만의 옷장과 캐릭터를 불러와요."}</p></div><form onSubmit={submit}><label>닉네임<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength="16" autoComplete="username" placeholder="예: 강무드" /></label><label>PIN <small>숫자 4~8자리</small><input type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))} autoComplete={isNew ? "new-password" : "current-password"} placeholder="PIN 입력" /></label>{isNew && <label>PIN 다시 입력<input type="password" inputMode="numeric" value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 8))} autoComplete="new-password" placeholder="PIN 다시 입력" /></label>}{error && <p className="account-error" role="alert">{error}</p>}<button className="pixel-button" disabled={busy} type="submit">{busy ? "SAVING..." : isNew ? "내 옷장 만들기" : "내 옷장 열기"}</button></form><p className="account-note">계정 정보는 같은 브라우저 내에서만 사용할 수 있어요.</p></section></main>;
}

function Character({ profile, small = false }) { return <span className={`character ${small ? "character-small" : ""} skin-${profile.skin} hair-${profile.hair} outfit-${profile.outfit} acc-${profile.accessory || "none"}`} aria-hidden="true"><i className="character-hair-back" /><i className="character-body" /><i className="character-face"><b /><b /></i><i className="character-hair-front" />{profile.accessory === "star" ? <i className="character-star" /> : profile.accessory === "heart" ? <i className="character-heart" /> : null}</span>; }

function HomePage({ account, navigate }) {
  const closet = account.closet || [];
  const tops = closet.filter((item) => ["반팔", "긴팔", "셔츠", "니트", "아우터"].includes(item.category)).length;
  const bottoms = closet.filter((item) => ["바지", "치마", "원피스"].includes(item.category)).length;
  const shoes = closet.filter((item) => item.category === "신발").length;
  const mission = closet.length ? `${closet[Math.floor(closet.length / 2)].color} 아이템으로 오늘의 포인트를 만들어 봐요!` : "첫 번째 아이템을 등록해 나만의 옷장을 시작해 봐요!";
  return <section className="home-page wrap"><section className="room-hero panel"><div className="room-copy"><p className="eyebrow"><i /> MY LITTLE DRESSING ROOM</p><h1>안녕, <em>{account.nickname}</em>!<br />오늘은 어떤 무드로<br />나가 볼까요?</h1><p>옷장 메이트가 오늘의 스타일을<br />함께 골라 줄게요.</p><div className="room-actions"><button className="home-primary" onClick={() => navigate("today")}>오늘의 옷 추천 <span>→</span></button><button className="home-secondary" onClick={() => navigate("closet")}>옷 등록하기 +</button></div></div><div className="room-scene"><span className="scene-sun" /><span className="scene-cloud one" /><span className="scene-cloud two" /><span className="scene-shelf"><i /><i /><i /></span><Character profile={account.profile} /><span className="scene-rug" /></div></section><section className="home-grid"><section className="home-stats panel"><div className="home-section-title"><span>WARDROBE CHECK</span><h2>나의 옷장 현황</h2></div><div className="stat-cards"><StatCard value={closet.length} label="전체 아이템" icon="ALL" /><StatCard value={tops} label="상의" icon="TOP" /><StatCard value={bottoms} label="하의" icon="BTM" /><StatCard value={shoes} label="신발" icon="SHO" /></div></section><section className="style-mission panel"><span>DAILY STYLE MISSION</span><b>!</b><h2>오늘의 작은 미션</h2><p>{mission}</p><button onClick={() => navigate("today")}>룰렛으로 코디 고르기 →</button></section></section><section className="home-closet-callout panel"><div><span>READY WHEN YOU ARE</span><h2>{closet.length ? "새로운 조합을 발견해 볼까요?" : "아직 비어 있는 옷장이에요!"}</h2><p>{closet.length ? "날씨와 상황을 고르면, 등록한 옷으로 최적의 코디를 찾아 드려요." : "사진과 함께 가진 옷을 등록하면 나만의 추천이 시작돼요."}</p></div><button className="pixel-button" onClick={() => navigate(closet.length ? "today" : "closet")}>{closet.length ? "코디 추천 받기" : "첫 옷 등록하기"}</button></section></section>;
}

function StatCard({ value, label, icon }) { return <article><i>{icon}</i><strong>{value}</strong><span>{label}</span></article>; }

function ProfilePage({ account, onSave, notify }) {
  const [draft, setDraft] = useState(account.profile);
  const [nickname, setNickname] = useState(account.nickname);
  function choose(group, value) { setDraft((current) => ({ ...current, [group]: value })); }
  async function saveProfile(event) { event.preventDefault(); const next = { ...account, nickname: nickname.trim().slice(0, 16) || account.nickname, profile: draft }; await onSave(next); notify("프로필을 꾸몄어요!"); }
  return <section className="page wrap profile-page"><PageTitle number="03" title={<>내 <em>프로필</em></>} text="오늘의 무드에 맞게 귀여운 캐릭터를 꾸며 보세요." /><form className="profile-layout" onSubmit={saveProfile}><section className="character-stage panel"><span className="profile-sparkle one">+</span><span className="profile-sparkle two">*</span><Character profile={draft} /><p>MOODROBE PAL</p><h2>{nickname || account.nickname}</h2><span>나만의 옷장 메이트</span></section><section className="profile-editor panel"><label className="profile-name">닉네임<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength="16" /></label><ProfileChoices label="피부 톤" group="skin" choices={["peach", "tan", "deep"]} value={draft.skin} onChoose={choose} /><ProfileChoices label="헤어" group="hair" choices={["bob", "bang", "curl"]} value={draft.hair} onChoose={choose} /><ProfileChoices label="옷 색" group="outfit" choices={["mint", "pink", "sun"]} value={draft.outfit} onChoose={choose} /><ProfileChoices label="액세서리" group="accessory" choices={["none", "heart", "star"]} value={draft.accessory || "none"} onChoose={choose} /><button className="pixel-button" type="submit">프로필 저장하기</button></section></form><PinChangePanel account={account} onSave={onSave} notify={notify} /></section>;
}

function PinChangePanel({ account, onSave, notify }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function changePin(event) {
    event.preventDefault();
    setError("");
    if (!/^\d{4,8}$/.test(pin)) { setError("새 PIN은 숫자 4~8자리로 입력해 주세요."); return; }
    if (pin !== confirmPin) { setError("새 PIN이 서로 달라요."); return; }
    setBusy(true);
    try {
      const salt = randomSalt();
      await onSave({ ...account, salt, pinHash: await hashPin(pin, salt) });
      setPin("");
      setConfirmPin("");
      notify("새 PIN으로 변경했어요!");
    } catch { setError("PIN을 저장하지 못했어요. 다시 시도해 주세요."); }
    setBusy(false);
  }
  return <form className="pin-change panel" onSubmit={changePin}><div><span>LOCAL SECURITY</span><h2>PIN 다시 설정하기</h2><p>현재 이 기기에서 로그인된 상태라 새 PIN을 바로 만들 수 있어요.</p></div><div className="pin-fields"><label>새 PIN<input type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))} autoComplete="new-password" placeholder="숫자 4~8자리" /></label><label>새 PIN 확인<input type="password" inputMode="numeric" value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 8))} autoComplete="new-password" placeholder="한 번 더 입력" /></label></div>{error && <p className="pin-error" role="alert">{error}</p>}<button className="pixel-button" disabled={busy} type="submit">{busy ? "SAVING..." : "새 PIN 저장하기"}</button></form>;
}

function ProfileChoices({ label, group, choices, value, onChoose }) { 
  const labels = { peach: "피치", tan: "태닝", deep: "브라운", bob: "단발", bang: "앞머리", curl: "컬", mint: "민트", pink: "핑크", sun: "옐로", none: "없음", heart: "하트", star: "별" }; 
  const descriptions = {
    peach: "밝은 피치 톤 피부",
    tan: "화사한 태닝 톤 피부",
    deep: "매력적인 브라운 톤 피부",
    bob: "단정한 단발 머리",
    bang: "귀여운 앞머리",
    curl: "발랄한 컬리 머리",
    mint: "상큼한 민트색 상의",
    pink: "러블리한 핑크색 상의",
    sun: "따스한 옐로색 상의",
    none: "액세서리 없음",
    heart: "사랑스러운 하트 뱃지",
    star: "빛나는 별 뱃지"
  };
  return <fieldset className="profile-choices"><legend>{label}</legend><div>{choices.map((choice) => <button className={value === choice ? "selected" : ""} type="button" key={choice} title={descriptions[choice]} onClick={() => onChoose(group, choice)}><i className={`swatch ${group}-${choice}`} />{labels[choice] || choice}</button>)}</div></fieldset>; 
}

function ClosetPage({ account, onSave, notify }) {
  const closet = account.closet;
  const emptyForm = { name: "", category: "반팔", color: "흰색", occasions: ["일상"], image: "" };
  const [form, setForm] = useState(emptyForm); const [preview, setPreview] = useState(""); const [editingItem, setEditingItem] = useState(null); const [editForm, setEditForm] = useState(emptyForm); const [editPreview, setEditPreview] = useState("");
  function readImage(event, applyImage) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => applyImage(reader.result); reader.readAsDataURL(file); }
  function uploadImage(event) { readImage(event, (image) => { setPreview(image); setForm((current) => ({ ...current, image })); }); }
  function addItem(event) { event.preventDefault(); if (!form.name.trim()) { notify("옷 이름을 등록해 주세요!"); return; } onSave({ ...account, closet: [...closet, { ...form, image: form.image || categoryPlaceholder(form.category, form.color), id: crypto.randomUUID() }] }); setForm(emptyForm); setPreview(""); notify("옷장에 새 아이템을 넣었어요!"); }
  function removeItem(id) { const item = closet.find((candidate) => candidate.id === id); if (!item) return; showDeleteConfirm(item, () => { onSave({ ...account, closet: closet.filter((candidate) => candidate.id !== id) }); notify("옷장에서 아이템을 뺐어요."); }); }
  function toggleOccasion(value, setValue) { setValue((current) => ({ ...current, occasions: current.occasions.includes(value) ? current.occasions.filter((item) => item !== value) : [...current.occasions, value] })); }
  function startEdit(item) { setEditingItem(item); setEditForm({ ...item, occasions: item.occasions || occasions }); setEditPreview(item.image); }
  function closeEdit() { setEditingItem(null); setEditPreview(""); }
  function saveEdit(event) { event.preventDefault(); if (!editForm.name.trim()) { notify("옷 이름을 등록해 주세요!"); return; } onSave({ ...account, closet: closet.map((item) => item.id === editingItem.id ? { ...item, ...editForm, image: editForm.image || categoryPlaceholder(editForm.category, editForm.color) } : item) }); closeEdit(); notify("옷 정보를 수정했어요!"); }
  return <section className="page wrap closet-page"><PageTitle number="01" title={<>내 <em>옷장</em></>} text="실제 가지고 있는 옷을 등록하면, 오늘의 추천이 더 정확해져요." /><div className="closet-layout"><form className="registration panel" onSubmit={addItem}><div className="panel-title"><span>NEW ITEM</span><h2>옷 등록하기</h2></div><label className={`upload-box ${preview ? "has-image" : ""}`}>{preview ? <img src={preview} alt="업로드 미리보기" /> : <><b>+</b><span>사진 업로드</span><small>JPG, PNG 파일을 골라요</small></>}<input type="file" accept="image/*" onChange={uploadImage} /></label><label>옷 이름<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="예: 하늘색 반팔 티셔츠" /></label><SelectField label="종류" value={form.category} options={categories} onChange={(value) => setForm({ ...form, category: value })} /><SelectField label="색깔" value={form.color} options={colors} onChange={(value) => setForm({ ...form, color: value })} /><OccasionField value={form.occasions} onToggle={(value) => toggleOccasion(value, setForm)} /><button className="pixel-button" type="submit">옷장에 넣기 +</button></form><section className="wardrobe"><div className="wardrobe-head"><div><span>MY COLLECTION</span><h2>등록한 옷 <b>{closet.length}</b>개</h2></div><p>사진 또는 수정 버튼을 눌러<br />정보를 바꿀 수 있어요</p></div><div className="item-grid">{closet.map((item) => <article className="clothing-item" key={item.id}><button className="item-photo" aria-label={`${item.name} 수정`} onClick={() => startEdit(item)}><img src={item.image} alt={item.name} /></button><div><b>{item.name}</b><span>{item.category} · {item.color}</span><small>{(item.occasions || occasions).join(" · ")}</small></div><div className="item-actions"><button className="edit-item" onClick={() => startEdit(item)}>수정</button><button className="delete-item" aria-label={`${item.name} 삭제`} onClick={() => removeItem(item.id)}>X</button></div></article>)}</div></section></div>{editingItem && <div className="edit-backdrop" role="presentation" onMouseDown={closeEdit}><form className="edit-dialog panel" onSubmit={saveEdit} onMouseDown={(event) => event.stopPropagation()}><div className="edit-dialog-head"><div className="panel-title"><span>EDIT ITEM</span><h2>옷 정보 수정</h2></div><button type="button" aria-label="수정 창 닫기" onClick={closeEdit}>X</button></div><label className="upload-box">{editPreview ? <img src={editPreview} alt="수정할 옷 미리보기" /> : <><b>+</b><span>사진 업로드</span></>}<input type="file" accept="image/*" onChange={(event) => readImage(event, (image) => { setEditPreview(image); setEditForm((current) => ({ ...current, image })); })} /></label><label>옷 이름<input required value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} /></label><SelectField label="종류" value={editForm.category} options={categories} onChange={(value) => setEditForm({ ...editForm, category: value })} /><SelectField label="색깔" value={editForm.color} options={colors} onChange={(value) => setEditForm({ ...editForm, color: value })} /><OccasionField value={editForm.occasions} onToggle={(value) => toggleOccasion(value, setEditForm)} /><div className="edit-actions"><button className="cancel-button" type="button" onClick={closeEdit}>취소</button><button className="pixel-button" type="submit">수정 저장</button></div></form></div>}</section>;
}

const neutralColors = new Set(["흰색", "검정", "회색", "베이지", "갈색"]);
const complementaryColors = new Set(["파랑-노랑", "노랑-파랑", "하늘색-갈색", "갈색-하늘색", "분홍-초록", "초록-분홍", "빨강-하늘색", "하늘색-빨강"]);
function compatibilityWeight(first, second) { let weight = first.color === second.color ? 5 : neutralColors.has(first.color) || neutralColors.has(second.color) ? 7 : complementaryColors.has(`${first.color}-${second.color}`) ? 6 : 2; weight += (first.occasions || []).filter((occasion) => (second.occasions || []).includes(occasion)).length * 2; return weight + (first.category === "아우터" || second.category === "아우터" ? 1 : 0); }
function buildCompatibilityGraph(items) { const graph = new Map(items.map((item) => [item.id, new Map()])); items.forEach((item, index) => items.slice(index + 1).forEach((other) => { const weight = compatibilityWeight(item, other); graph.get(item.id).set(other.id, weight); graph.get(other.id).set(item.id, weight); })); return graph; }
function TodayPage({ closet, navigate, notify }) { const [weather, setWeather] = useState("sunny"); const [occasion, setOccasion] = useState("일상"); const [spinning, setSpinning] = useState(false); const [result, setResult] = useState(null); const matchingItems = useMemo(() => closet.filter((item) => weather === "rainy" ? ["아우터", "신발", "긴팔", "바지"].includes(item.category) : weather === "cold" ? !["반팔", "치마"].includes(item.category) : true), [closet, weather]); const pools = useMemo(() => ({ top: matchingItems.filter((item) => ["반팔", "긴팔", "셔츠", "니트", "아우터"].includes(item.category)), bottom: matchingItems.filter((item) => ["바지", "치마", "원피스"].includes(item.category)), shoes: matchingItems.filter((item) => item.category === "신발") }), [matchingItems]); const graph = useMemo(() => buildCompatibilityGraph(closet), [closet]); function candidates(slot) { const type = slot === "top" ? ["반팔", "긴팔", "셔츠", "니트", "아우터"] : slot === "bottom" ? ["바지", "치마", "원피스"] : ["신발"]; const filtered = pools[slot].filter((item) => (item.occasions || occasions).includes(occasion)); return filtered.length ? filtered : pools[slot].length ? pools[slot] : closet.filter((item) => type.includes(item.category)); } function spin() { if (!closet.length) { notify("먼저 내 옷장에 옷을 등록해 주세요!"); return; } setSpinning(true); setResult(null); window.setTimeout(() => { const top = candidates("top"); const bottom = candidates("bottom"); const shoes = candidates("shoes"); const looks = []; top.forEach((a) => bottom.forEach((b) => shoes.forEach((c) => looks.push({ top: a, bottom: b, shoes: c, score: graph.get(a.id).get(b.id) + graph.get(a.id).get(c.id) + graph.get(b.id).get(c.id) })))); const best = looks.sort((a, b) => b.score - a.score)[0]; setResult(best || { top: top[0], bottom: bottom[0], shoes: shoes[0] }); setSpinning(false); }, 1000); } return <section className="page wrap today-page"><PageTitle number="02" title={<>오늘의 <em>옷</em></>} text="날씨와 상황을 고른 뒤, 룰렛을 돌려 보세요!" /><div className="today-layout"><section className="game-panel panel"><div className="panel-title"><span>QUEST SETUP</span><h2>오늘의 조건</h2></div><p className="field-label">오늘 날씨</p><div className="weather-picks">{weatherOptions.map((item) => <button className={weather === item.id ? "active" : ""} key={item.id} onClick={() => setWeather(item.id)}><i>{item.icon}</i><span>{item.label}<small>{item.temp}</small></span></button>)}</div><p className="field-label">오늘의 상황</p><div className="occasion-picks">{occasions.map((item) => <button className={occasion === item ? "active" : ""} key={item} onClick={() => setOccasion(item)}>{item}</button>)}</div><div className="status-card"><b>{weatherOptions.find((item) => item.id === weather).label} · {occasion}</b><span>날씨와 상황에 맞는 옷 {matchingItems.filter((item) => (item.occasions || occasions).includes(occasion)).length}개</span></div></section><section className="roulette-area"><div className="slot-machine"><div className="machine-top"><span>LUCKY</span><b>OUTFIT SLOTS</b><span>LUCKY</span></div><div className="reels"><SlotReel label="상의" items={pools.top} spinning={spinning} result={result?.top} /><SlotReel label="하의" items={pools.bottom} spinning={spinning} result={result?.bottom} /><SlotReel label="신발" items={pools.shoes} spinning={spinning} result={result?.shoes} /></div></div><button className="spin-button" onClick={spin} disabled={spinning}>{spinning ? "SPINNING..." : "SPIN THE LOOK!"}</button></section></div><section className="result-zone">{result ? <div className="result-items">{Object.entries(result).filter(([key]) => key !== "score").map(([slot, item]) => <article key={slot}>{item ? <><img src={item.image} alt={item.name} /><b>{item.name}</b><span>{slot === "top" ? "상의" : slot === "bottom" ? "하의" : "신발"} · {item.color}</span></> : <><b>+</b><span>등록 필요</span></>}</article>)}</div> : <div className="empty-result"><b>?</b><p>룰렛을 돌려 코디를 완성해 보세요.</p>{closet.length === 0 && <button onClick={() => navigate("closet")}>내 옷장 채우러 가기 →</button>}</div>}</section></section>; }
function PageTitle({ number, title, text }) { return <div className="page-title"><span>PAGE {number}</span><div><h1>{title}</h1><p>{text}</p></div></div>; }
function SelectField({ label, value, options, onChange }) { return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function OccasionField({ value, onToggle }) { return <fieldset className="occasion-field"><legend>어울리는 상황 <small>복수 선택</small></legend><div>{occasions.map((item) => <button type="button" className={value.includes(item) ? "selected" : ""} key={item} onClick={() => onToggle(item)}>{item}</button>)}</div></fieldset>; }
function SlotReel({ label, items, spinning, result }) { const [preview, setPreview] = useState(null); useEffect(() => { if (!spinning) { setPreview(null); return undefined; } const pick = () => setPreview(items.length ? items[Math.floor(Math.random() * items.length)] : null); pick(); const timer = window.setInterval(pick, 130); return () => window.clearInterval(timer); }, [items, spinning]); const item = spinning ? preview : result; return <div className={`slot-reel ${spinning ? "spinning" : ""}`}><div className="reel-label">{label}</div><div className="reel-window">{item ? <><img src={item.image} alt={item.name} /><b>{item.name}</b></> : <span>?</span>}</div></div>; }
export default App;
