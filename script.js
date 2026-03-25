const STORAGE_KEY = "petEggStateV1";
const TICK_MS = 1000;

const defaultState = {
  hunger: 45,
  mood: 80,
  energy: 80,
  clean: 75,
  message: "你好呀！今天也要一起玩！",
  face: "🙂",
  lastUpdate: Date.now()
};

let state = loadState();

const refs = {
  petFace: document.getElementById("petFace"),
  petMessage: document.getElementById("petMessage"),
  hungerBar: document.getElementById("hungerBar"),
  moodBar: document.getElementById("moodBar"),
  energyBar: document.getElementById("energyBar"),
  cleanBar: document.getElementById("cleanBar"),
  hungerText: document.getElementById("hungerText"),
  moodText: document.getElementById("moodText"),
  energyText: document.getElementById("energyText"),
  cleanText: document.getElementById("cleanText")
};

applyOfflineProgress();
render();

setInterval(() => {
  tick(1);
  state.lastUpdate = Date.now();
  saveState();
  render();
}, TICK_MS);

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    interact(button.dataset.action);
    state.lastUpdate = Date.now();
    saveState();
    render();
  });
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(num) {
  return Math.max(0, Math.min(100, Math.round(num)));
}

function tick(seconds) {
  state.hunger = clamp(state.hunger + 0.65 * seconds);
  state.energy = clamp(state.energy - 0.55 * seconds);
  state.clean = clamp(state.clean - 0.4 * seconds);

  let moodDrop = 0.35 * seconds;
  if (state.hunger > 75) moodDrop += 0.3 * seconds;
  if (state.energy < 25) moodDrop += 0.25 * seconds;
  if (state.clean < 30) moodDrop += 0.2 * seconds;
  state.mood = clamp(state.mood - moodDrop);

  updateMoodFace();
}

function applyOfflineProgress() {
  const now = Date.now();
  const gapSeconds = Math.floor((now - (state.lastUpdate || now)) / 1000);
  if (gapSeconds > 0) {
    tick(Math.min(gapSeconds, 60 * 60 * 8));
    state.lastUpdate = now;
    state.message = gapSeconds > 30 ? "你回来啦！我等你好久了～" : state.message;
    saveState();
  }
}

function interact(action) {
  switch (action) {
    case "feed":
      state.hunger = clamp(state.hunger - 28);
      state.mood = clamp(state.mood + 10);
      state.clean = clamp(state.clean - 4);
      state.face = "😋";
      state.message = "好吃好吃！谢谢投喂～";
      break;
    case "play":
      state.mood = clamp(state.mood + 18);
      state.hunger = clamp(state.hunger + 10);
      state.energy = clamp(state.energy - 14);
      state.clean = clamp(state.clean - 8);
      state.face = "😆";
      state.message = "玩得太开心啦！";
      break;
    case "sleep":
      state.energy = clamp(state.energy + 34);
      state.hunger = clamp(state.hunger + 8);
      state.mood = clamp(state.mood + 6);
      state.face = "😴";
      state.message = "呼呼...体力恢复了！";
      break;
    case "bath":
      state.clean = clamp(state.clean + 38);
      state.mood = clamp(state.mood + 8);
      state.face = "🫧";
      state.message = "洗香香，真舒服！";
      break;
    default:
      break;
  }

  refs.petFace.classList.remove("bounce");
  requestAnimationFrame(() => refs.petFace.classList.add("bounce"));
}

function updateMoodFace() {
  if (state.hunger > 85 || state.energy < 12) {
    state.face = "🥺";
    state.message = "我有点难受，快照顾我...";
    return;
  }
  if (state.mood < 35) {
    state.face = "😟";
    state.message = "有点无聊，陪我玩嘛。";
    return;
  }
  if (state.mood > 75 && state.energy > 40 && state.hunger < 60) {
    state.face = "😊";
    state.message = "状态超好！我们继续！";
    return;
  }
  state.face = "🙂";
  state.message = "我在这里等你互动喔。";
}

function render() {
  refs.hungerBar.value = state.hunger;
  refs.moodBar.value = state.mood;
  refs.energyBar.value = state.energy;
  refs.cleanBar.value = state.clean;

  refs.hungerText.textContent = state.hunger;
  refs.moodText.textContent = state.mood;
  refs.energyText.textContent = state.energy;
  refs.cleanText.textContent = state.clean;

  refs.petFace.textContent = state.face;
  refs.petMessage.textContent = state.message;

  setTimeout(() => refs.petFace.classList.remove("bounce"), 240);
}
