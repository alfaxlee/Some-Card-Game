// DOM 元素選取
const startButton = document.querySelector("#startButton");
const viewCardsButton = document.querySelector("#viewCardsButton");
const homePanel = document.querySelector("#homePanel");
const difficultyPanel = document.querySelector("#difficultyPanel");
const gamePanel = document.querySelector("#gamePanel");
const cardEditorPanel = document.querySelector("#cardEditorPanel");
const difficultyButtons = document.querySelectorAll(".difficulty-button");
const difficultyStatus = document.querySelector("#difficultyStatus");
const aiStatus = document.querySelector("#aiStatus");
const turnIndicator = document.querySelector("#turnIndicator");
const drawButton = document.querySelector("#drawButton");
const cardPanel = document.querySelector("#cardPanel");
const emptyFieldSlot = document.querySelector("#emptyFieldSlot");
const playerHand = document.querySelector("#playerHand");
const emptyHandSlot = document.querySelector("#emptyHandSlot");
const moveList = document.querySelector("#moveList");
const energyFill = document.querySelector("#energyFill");
const energyValue = document.querySelector("#energyValue");
const backHomeButton = document.querySelector("#backHomeButton");

const battleResultModal = document.querySelector("#battleResultModal");
const resultTitle = document.querySelector("#resultTitle");
const resultDesc = document.querySelector("#resultDesc");
const playAgainButton = document.querySelector("#playAgainButton");
const gameExitButton = document.querySelector("#gameExitButton");

const domainSelectModal = document.querySelector("#domainSelectModal");
const domainCancelBtn = document.querySelector("#domainCancelBtn");
let pendingDomainMove = null;

// 編輯器相關 DOM
const cardSelectDropdown = document.querySelector("#cardSelectDropdown");
const newCardBtn = document.querySelector("#newCardBtn");
const resetCardsBtn = document.querySelector("#resetCardsBtn");
const editCardName = document.querySelector("#editCardName");
const editCardDikra = document.querySelector("#editCardDikra");
const editCardChakra = document.querySelector("#editCardChakra");
const editCardHealth = document.querySelector("#editCardHealth");
const editCardPassive = document.querySelector("#editCardPassive");
const movesEditContainer = document.querySelector("#movesEditContainer");
const addMoveBtn = document.querySelector("#addMoveBtn");
const saveCardButton = document.querySelector("#saveCardButton");
const editorStatusText = document.querySelector("#editorStatusText");

// 預覽相關 DOM
const previewCardName = document.querySelector("#previewCardName");
const previewDikra = document.querySelector("#previewDikra");
const previewChakra = document.querySelector("#previewChakra");
const previewHealth = document.querySelector("#previewHealth");
const previewPassive = document.querySelector("#previewPassive");
const previewMoveList = document.querySelector("#previewMoveList");
const previewEnergyMeter = document.querySelector("#previewEnergyMeter");

let opponentAi = "";
let energy = 0;
let playerMoves = [];
let opponentMoves = [];

// 玩家與電腦的牌組與場上狀態
let playerHandCards = [];
let opponentHandCards = [];
let activePlayerCard = null;
let opponentActiveCard = null;
let playerHP = 0;
let opponentHP = 0;
let playerMaxHP = 0;
let opponentMaxHP = 0;
let playerStatus = { defense: 0, damageHalf: false, stunned: false };
let opponentStatus = { defense: 0, damageHalf: false, stunned: false };
let playerGlitchTurns = 0; // 我方卡牌與招式亂碼剩餘回合數 (一局)
let opponentGlitchTurns = 0; // 對手卡牌與招式亂碼剩餘回合數 (一局)
let currentTurn = "player"; // "player" or "opponent"
let starter = "player"; // 誰是這場戰鬥的先發
let gameOver = false;

const defaultCards = [
  {
    name: "雷切小弟弟",
    dikra: "99999999999999",
    chakra: "400",
    health: "15000",
    hasEnergyMeter: true,
    passive: '噁心能量條集滿發動"領域展開，超究極冥王拔不出來術登登登dua郎之炮"',
    moves: [
      { key: "M1", name: "雷刀連擊", energy: 10, cooldown: 0, damage: "350", specialMechanic: "噁心能量條+10%" },
      { key: "Z", name: "嘟", energy: 5, cooldown: 1, damage: "400", specialMechanic: "噁心能量條+5%" },
      { key: "X", name: "迪克滿天飛之陣", energy: 20, cooldown: 1, damage: "700", specialMechanic: "噁心能量條+20%" },
      { key: "C", name: "三重打包", energy: 40, cooldown: 2, damage: "5000", specialMechanic: "噁心能量條+40%" },
      { key: "V", name: "領域展開，", energy: 50, cooldown: 3, unlockAfterTurns: 5, damage: "999999999999999999", specialMechanic: "可以選擇你要「做死、傳說對接、視獄偽境、真Dixx不斷、迪克崩壞、(Censored)」擇一發動領域" },
      { key: "F", name: "究極冥王炮", energy: 100, cooldown: 3, unlockAfterTurns: 8, damage: "17000" },
      { key: "G", name: "爸爸堅強又金色狂風七人隊八級大，大牛比較懶又玩高鐵的工人有他", energy: 10, cooldown: 2, damage: "0", specialMechanic: "對方卡牌所有字元變成亂碼，所有攻擊的排列順序隨機互換，電腦正常運作但點下去的位置會變" },
    ],
  },
  {
    name: "黃楷程",
    dikra: "11111111111111",
    chakra: "無",
    health: "11000",
    hasEnergyMeter: false,
    passive: "切換腳切強化M1，棒子與體術連攜壓制。",
    moves: [
      { key: "M1", name: "雷切", energy: 5, cooldown: 0, damage: "600" },
      { key: "Z", name: "切換腳切", energy: 10, cooldown: 2, damage: "0", specialMechanic: "雷切變成腳切，腳切傷害2000" },
      { key: "X", name: "後撤步雷切", energy: 15, cooldown: 1, damage: "700", specialMechanic: "加上1000防禦" },
      { key: "C", name: "棒子配合腳切組合", energy: 20, cooldown: 2, damage: "1100" },
      { key: "V", name: "阿嚕霸牆壁combo", energy: 35, cooldown: 3, unlockAfterTurns: 3, damage: "8000", specialMechanic: "開局3回合後解鎖" },
      { key: "F", name: "領域展開，無限之切", energy: 100, cooldown: 7, unlockAfterTurns: 5, damage: "無限", specialMechanic: "開局5回合後解鎖" },
    ],
  },
  {
    name: "八塊腹肌Driver團團長",
    dikra: "9999999999999999999",
    chakra: "無限",
    health: "19999",
    hasEnergyMeter: false,
    passive: "passive：八塊腹肌具有堅不可摧的防禦，足以扭曲時空。",
    moves: [
      { key: "M1", name: "屌切", energy: 10, cooldown: 0, damage: "500" },
      { key: "Z招", name: "起來砸你屌", energy: 15, cooldown: 0, damage: "600" },
      { key: "X招", name: "切換人格騙術色誘", energy: 20, cooldown: 2, damage: "200 (對手停止發招一局)", specialMechanic: "對手停止發招一局" },
      { key: "C招", name: "黑洞吸引", energy: 30, cooldown: 1, damage: "1100" },
      { key: "V招", name: "召喚八塊腹肌", energy: 40, cooldown: 3, damage: "0 (獲得2000防禦力)", specialMechanic: "獲得2000防禦力" },
      { key: "F招", name: "超級自爆！！！！", energy: 100, cooldown: 5, unlockAfterTurns: 7, damage: "無限", specialMechanic: "開局7回合後解鎖" },
    ],
  },
];

// 規範化卡牌屬性與特殊機制解析（尊重使用者自訂內容，不隨意覆蓋）
function normalizeCard(card) {
  if (!card) return card;
  const isRaiche = card.name && card.name.includes("雷切小弟弟");
  if (isRaiche) {
    card.hasEnergyMeter = true;
  }

  if (Array.isArray(card.moves)) {
    card.moves = card.moves.map((move) => {
      const m = { ...move };
      const sm = m.specialMechanic || "";

      // 噁心能量條數值解析：動態支援例如 "噁心能量條+10%" 或 "+40%"
      const energyMatch = sm.match(/\+(\d+)%/) || sm.match(/(\d+)%/);
      if (energyMatch) {
        m.energy = parseInt(energyMatch[1]);
      } else if (m.energy === undefined) {
        m.energy = isRaiche ? 10 : 15;
      }

      // 開局回合解鎖解析
      if (sm.includes("解鎖")) {
        const unlockMatch = sm.match(/(\d+)\s*回合/) || sm.match(/開局\s*(\d+)/);
        if (unlockMatch) {
          m.unlockAfterTurns = parseInt(unlockMatch[1]);
        }
      }

      // 冷卻解析
      if (m.cooldown === undefined) {
        m.cooldown = (m.key === "M1") ? 0 : 1;
      }

      return m;
    });
  }
  return card;
}

// 從 localStorage 讀取自訂卡牌，若無則使用預設卡牌
function loadCustomCards() {
  try {
    const saved = localStorage.getItem("customCardLibrary");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeCard);
      }
    }
  } catch (e) {
    console.error("載入自訂卡牌失敗", e);
  }
  return JSON.parse(JSON.stringify(defaultCards)).map(normalizeCard);
}

let cards = loadCustomCards();

function saveCustomCards() {
  try {
    localStorage.setItem("customCardLibrary", JSON.stringify(cards));
  } catch (e) {
    console.error("儲存卡牌失敗", e);
  }
}

if (startButton) {
  startButton.addEventListener("click", () => {
    homePanel.hidden = true;
    difficultyPanel.hidden = false;
  });
}

if (viewCardsButton) {
  viewCardsButton.addEventListener("click", () => {
    homePanel.hidden = true;
    cardEditorPanel.hidden = false;
    initCardEditor();
  });
}

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    opponentAi = button.dataset.ai;

    if (difficultyStatus) {
      difficultyStatus.textContent = `電腦對手智商：${opponentAi}`;
    }

    if (aiStatus) {
      aiStatus.textContent = `電腦對手智商：${opponentAi}`;
    }

    startBattleSession();

    difficultyPanel.hidden = true;
    gamePanel.hidden = false;
  });
});

let opponentEnergy = 0;
const opponentEnergyMeter = document.querySelector("#opponentEnergyMeter");
const opponentEnergyFill = document.querySelector("#opponentEnergyFill");
const opponentEnergyValue = document.querySelector("#opponentEnergyValue");

function addOpponentEnergy(amount) {
  opponentEnergy = Math.min(100, opponentEnergy + amount);
  if (opponentEnergyFill) opponentEnergyFill.style.width = `${opponentEnergy}%`;
  if (opponentEnergyValue) opponentEnergyValue.textContent = opponentEnergy >= 100 ? "滿了" : `${opponentEnergy}%`;
}

function triggerScreenShake() {
  document.body.classList.remove("screen-shake");
  void document.body.offsetWidth;
  document.body.classList.add("screen-shake");
  setTimeout(() => {
    document.body.classList.remove("screen-shake");
  }, 600);
}

function startBattleSession() {
  cards = loadCustomCards(); // 確保每次開局載入最新卡牌設定
  gameOver = false;
  energy = 0;
  opponentEnergy = 0;
  playerHandCards = [];
  opponentHandCards = [];
  opponentMoves = [];
  playerMoves = [];
  activePlayerCard = null;
  opponentActiveCard = null;
  playerHP = 0;
  opponentHP = 0;
  playerMaxHP = 0;
  opponentMaxHP = 0;
  starter = "player";
  currentTurn = "player";
  playerStatus = { defense: 0, damageHalf: false, stunned: false };
  opponentStatus = { defense: 0, damageHalf: false, stunned: false };

  if (energyFill) energyFill.style.width = "0%";
  if (energyValue) energyValue.textContent = "0%";
  if (opponentEnergyFill) opponentEnergyFill.style.width = "0%";
  if (opponentEnergyValue) opponentEnergyValue.textContent = "0%";

  if (battleResultModal) {
    battleResultModal.hidden = true;
    battleResultModal.setAttribute("hidden", "");
  }

  if (domainSelectModal) {
    domainSelectModal.hidden = true;
    domainSelectModal.setAttribute("hidden", "");
  }
  pendingDomainMove = null;

  playerGlitchTurns = 0;
  opponentGlitchTurns = 0;
  const oppPanel = document.querySelector("#opponentCardPanel");
  if (oppPanel) oppPanel.classList.remove("glitched-card");
  const pPanel = document.querySelector("#cardPanel");
  if (pPanel) pPanel.classList.remove("glitched-card");

  if (drawButton) {
    drawButton.textContent = "抽牌";
    drawButton.disabled = false;
  }

  updateTurnBadge("準備抽牌與出牌");
  renderHand();
  renderOpponentHand();
  updateFieldDisplay();
}

if (drawButton) {
  drawButton.addEventListener("click", () => {
    // 洗牌並各發牌，讓玩家與對手都能擁有卡牌，體現「一張卡牌死了不代表你輸了」
    const pool = [...cards].sort(() => Math.random() - 0.5);
    playerHandCards = [pool[0], pool[1]];
    opponentHandCards = [pool[2] || pool[0], pool[0]]; // 對手也持有多張卡牌儲備

    drawButton.textContent = "已抽牌";
    drawButton.disabled = true;
    renderHand();
    renderOpponentHand();
    updateDeckCounts();

    // 如果雙方場上皆無牌，提示玩家出牌
    if (!activePlayerCard) {
      updateTurnBadge("請點選下方卡牌上場");
    }
  });
}

function updateDeckCounts() {
  const pCount = document.querySelector("#playerDeckCount");
  const oCount = document.querySelector("#opponentDeckCount");
  if (pCount) pCount.textContent = `(${playerHandCards.length} 張未上場)`;
  if (oCount) oCount.textContent = `(${opponentHandCards.length} 張未上場)`;
}

function renderHand() {
  if (!playerHand) return;
  playerHand.innerHTML = "";

  if (playerHandCards.length === 0) {
    playerHand.appendChild(emptyHandSlot);
    return;
  }

  playerHandCards.forEach((card, index) => {
    const button = document.createElement("button");
    button.className = "hand-card";
    button.type = "button";
    const canPlay = !activePlayerCard || playerHP <= 0;
    button.innerHTML = `${card.name}<span>血量 ${card.health}</span>${canPlay ? '<span style="color:#ffe28a;">[點擊派上戰場]</span>' : '<span style="color:#aaa;">[備戰中]</span>'}`;
    button.addEventListener("click", () => playCard(index));
    playerHand.appendChild(button);
  });
  updateDeckCounts();
}

function renderOpponentHand() {
  const opponentHand = document.querySelector("#opponentHand");
  if (!opponentHand) return;
  opponentHand.innerHTML = "";

  if (opponentHandCards.length === 0) {
    opponentHand.innerHTML = `<div class="empty-slot" id="opponentEmptyHandSlot">對手手牌已空</div>`;
    return;
  }

  opponentHandCards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "hand-card";
    cardDiv.style.opacity = "0.85";
    cardDiv.style.filter = "brightness(0.75)";
    cardDiv.style.cursor = "default";
    cardDiv.innerHTML = `${card.name}<span>血量 ${card.health}</span><span style="color:#ccc;">[敵方備戰]</span>`;
    opponentHand.appendChild(cardDiv);
  });
  updateDeckCounts();
}

function playCard(index) {
  if (gameOver) return;

  const card = playerHandCards[index];
  if (!card) return;

  // 如果當前已有存活卡牌，支援更換卡牌上陣（原卡牌收回手牌備戰）
  if (activePlayerCard && playerHP > 0) {
    activePlayerCard.health = String(playerHP);
    const oldCard = activePlayerCard;
    playerHandCards.splice(index, 1);
    playerHandCards.push(oldCard);
    updateTurnBadge(`🔄 更換卡牌！【${oldCard.name}】退回備戰，【${card.name}】上陣！`);
  } else {
    playerHandCards.splice(index, 1);
    updateTurnBadge(`⚔️ 【${card.name}】已派上戰場！`);
  }

  activePlayerCard = card;
  const healthStr = String(card.health || "10000").replace(/,/g, "");
  playerMaxHP = parseInt(healthStr) || 10000;
  playerHP = playerMaxHP;
  playerStatus = { defense: 0, damageHalf: false, stunned: false };

  // 更新我方戰鬥牌面板資訊
  const nameEl = document.querySelector("#cardName");
  if (nameEl) nameEl.textContent = card.name;
  const dikraEl = document.querySelector("#cardDikra");
  if (dikraEl) dikraEl.textContent = card.dikra;
  const chakraEl = document.querySelector("#cardChakra");
  if (chakraEl) chakraEl.textContent = card.chakra;
  const defEl = document.querySelector("#cardDefense");
  if (defEl) defEl.textContent = playerStatus.defense;
  const hpEl = document.querySelector("#cardHealth");
  if (hpEl) hpEl.textContent = playerHP;
  const passiveEl = document.querySelector("#cardPassive");
  if (passiveEl) passiveEl.textContent = card.passive || "";

  const cardPanelEl = document.querySelector("#cardPanel");
  if (cardPanelEl) {
    cardPanelEl.classList.remove("dead");
    cardPanelEl.hidden = false;
    cardPanelEl.removeAttribute("hidden");
    cardPanelEl.style.display = "";
  }
  if (emptyFieldSlot) {
    emptyFieldSlot.hidden = true;
    emptyFieldSlot.setAttribute("hidden", "");
    emptyFieldSlot.style.display = "none";
  }

  const energyMeter = document.querySelector("#energyMeter");
  const hasEnergy = card.hasEnergyMeter || (card.moves && card.moves.some(m => m.specialMechanic && m.specialMechanic.includes("噁心能量條")));
  if (energyMeter) {
    if (hasEnergy) {
      energyMeter.hidden = false;
      energyMeter.removeAttribute("hidden");
      energyMeter.style.display = "";
    } else {
      energyMeter.hidden = true;
      energyMeter.setAttribute("hidden", "");
      energyMeter.style.display = "none";
    }
  }

  energy = 0;
  if (energyFill) energyFill.style.width = "0%";
  if (energyValue) energyValue.textContent = "0%";
  playerMoves = createBattleMoves(card);

  // 如果對手場上沒有活著的卡牌，對手也出一張牌
  if (!opponentActiveCard || opponentHP <= 0) {
    playOpponentNextCard();
  }

  renderHand();
  renderMoves();
  updateFieldStatusTags();

  // 若回合處於玩家回合，提示玩家
  if (currentTurn === "player") {
    updateTurnBadge("我方回合：請選擇技能出招");
  } else {
    updateTurnBadge("對手回合思考中...");
    setTimeout(opponentTurn, 1000);
  }
}

function playOpponentNextCard() {
  if (opponentHandCards.length === 0) {
    opponentActiveCard = null;
    return;
  }

  opponentActiveCard = opponentHandCards.shift();
  const oppHealthStr = String(opponentActiveCard.health || "10000").replace(/,/g, "");
  opponentMaxHP = parseInt(oppHealthStr) || 10000;
  opponentHP = opponentMaxHP;
  opponentStatus = { defense: 0, damageHalf: false, stunned: false };

  const opponentCardPanel = document.querySelector("#opponentCardPanel");
  const opponentEmptyFieldSlot = document.querySelector("#opponentEmptyFieldSlot");

  if (opponentCardPanel) {
    opponentCardPanel.classList.remove("dead");
    opponentCardPanel.hidden = false;
    opponentCardPanel.removeAttribute("hidden");
    opponentCardPanel.style.display = "";
  }
  if (opponentEmptyFieldSlot) {
    opponentEmptyFieldSlot.hidden = true;
    opponentEmptyFieldSlot.setAttribute("hidden", "");
    opponentEmptyFieldSlot.style.display = "none";
  }

  const oppNameEl = document.querySelector("#opponentCardName");
  if (oppNameEl) oppNameEl.textContent = opponentActiveCard.name;
  const oppDikraEl = document.querySelector("#opponentDikra");
  if (oppDikraEl) oppDikraEl.textContent = opponentActiveCard.dikra;
  const oppChakraEl = document.querySelector("#opponentChakra");
  if (oppChakraEl) oppChakraEl.textContent = opponentActiveCard.chakra;
  const oppDefEl = document.querySelector("#opponentDefense");
  if (oppDefEl) oppDefEl.textContent = opponentStatus.defense;
  const oppHpEl = document.querySelector("#opponentHealth");
  if (oppHpEl) oppHpEl.textContent = opponentHP;
  const oppPassiveEl = document.querySelector("#opponentPassive");
  if (oppPassiveEl) oppPassiveEl.textContent = opponentActiveCard.passive || "";

  // 對手卡牌若為雷切小弟弟或具備噁心能量條
  const oppHasEnergy = opponentActiveCard.hasEnergyMeter || (opponentActiveCard.moves && opponentActiveCard.moves.some(m => m.specialMechanic && m.specialMechanic.includes("噁心能量條")));
  if (opponentEnergyMeter) {
    if (oppHasEnergy) {
      opponentEnergyMeter.hidden = false;
      opponentEnergyMeter.removeAttribute("hidden");
      opponentEnergyMeter.style.display = "";
    } else {
      opponentEnergyMeter.hidden = true;
      opponentEnergyMeter.setAttribute("hidden", "");
      opponentEnergyMeter.style.display = "none";
    }
  }
  opponentEnergy = 0;
  if (opponentEnergyFill) opponentEnergyFill.style.width = "0%";
  if (opponentEnergyValue) opponentEnergyValue.textContent = "0%";

  opponentMoves = createBattleMoves(opponentActiveCard);
  renderOpponentMoves();
  renderOpponentHand();

  // 隨機決定先發（若尚未決定）
  if (!starter) {
    starter = Math.random() > 0.5 ? "player" : "opponent";
    currentTurn = starter;
  }
}

function updateFieldDisplay() {
  const opponentCardPanel = document.querySelector("#opponentCardPanel");
  const opponentEmptyFieldSlot = document.querySelector("#opponentEmptyFieldSlot");

  if (activePlayerCard) {
    if (cardPanel) {
      cardPanel.hidden = false;
      cardPanel.removeAttribute("hidden");
      cardPanel.style.display = "";
    }
    if (emptyFieldSlot) {
      emptyFieldSlot.hidden = true;
      emptyFieldSlot.setAttribute("hidden", "");
      emptyFieldSlot.style.display = "none";
    }
  } else {
    if (cardPanel) {
      cardPanel.hidden = true;
      cardPanel.setAttribute("hidden", "");
      cardPanel.style.display = "none";
    }
    if (emptyFieldSlot) {
      emptyFieldSlot.hidden = false;
      emptyFieldSlot.removeAttribute("hidden");
      emptyFieldSlot.style.display = "";
    }
  }

  if (opponentActiveCard) {
    if (opponentCardPanel) {
      opponentCardPanel.hidden = false;
      opponentCardPanel.removeAttribute("hidden");
      opponentCardPanel.style.display = "";
    }
    if (opponentEmptyFieldSlot) {
      opponentEmptyFieldSlot.hidden = true;
      opponentEmptyFieldSlot.setAttribute("hidden", "");
      opponentEmptyFieldSlot.style.display = "none";
    }
  } else {
    if (opponentCardPanel) {
      opponentCardPanel.hidden = true;
      opponentCardPanel.setAttribute("hidden", "");
      opponentCardPanel.style.display = "none";
    }
    if (opponentEmptyFieldSlot) {
      opponentEmptyFieldSlot.hidden = false;
      opponentEmptyFieldSlot.removeAttribute("hidden");
      opponentEmptyFieldSlot.style.display = "";
    }
  }
}

function updateTurnBadge(text) {
  if (!turnIndicator) return;
  turnIndicator.textContent = text;
  turnIndicator.className = "turn-badge";
  if (currentTurn === "player") {
    turnIndicator.classList.add("player-turn");
  } else if (currentTurn === "opponent") {
    turnIndicator.classList.add("opponent-turn");
  }
}

function updateFieldStatusTags() {
  const playerBuffTag = document.querySelector("#playerBuffTag");
  const opponentBuffTag = document.querySelector("#opponentBuffTag");

  if (playerBuffTag) {
    const buffs = [];
    if (playerStatus.defense > 0) buffs.push(`護甲 +${playerStatus.defense}`);
    if (playerStatus.damageHalf) buffs.push("⚠️ 下次傷害減半");
    if (playerStatus.stunned) buffs.push("被封鎖行動");
    playerBuffTag.textContent = buffs.join(" | ");
  }

  if (opponentBuffTag) {
    const buffs = [];
    if (opponentStatus.defense > 0) buffs.push(`護甲 +${opponentStatus.defense}`);
    if (opponentStatus.damageHalf) buffs.push("⚠️ 下次傷害減半");
    if (opponentStatus.stunned) buffs.push("被封鎖行動");
    opponentBuffTag.textContent = buffs.join(" | ");
  }

  const pDef = document.querySelector("#playerDefense");
  const oDef = document.querySelector("#opponentDefense");
  if (pDef) pDef.textContent = playerStatus.defense;
  if (oDef) oDef.textContent = opponentStatus.defense;
}

function renderMoves() {
  if (!moveList) return;

  // 若我方被色誘封鎖，自動跳過我方回合並換對手出招，避免按鈕被鎖死無法推進
  if (playerStatus.stunned) {
    playerStatus.stunned = false;
    updateFieldStatusTags();
    updateTurnBadge("⚠️ 我方被色誘停止發招一局！自動跳過我方回合...");
    currentTurn = "opponent";
    renderOpponentMoves();
    setTimeout(opponentTurn, 1000);
    return;
  }

  moveList.innerHTML = "";

  playerMoves.forEach((move) => {
    const button = document.createElement("button");
    button.className = "move-button";
    button.type = "button";

    let lockTag = "";
    if (move.unlockRemaining > 0) {
      lockTag = ` <span class="lock-tag">🔒 解鎖剩餘 ${move.unlockRemaining} 回合</span>`;
    } else if (move.cooldownRemaining > 0) {
      lockTag = ` <span class="cd-tag">⏳ CD: ${move.cooldownRemaining} 回合</span>`;
    }

    button.innerHTML = `<span>${move.key}：${move.name}${lockTag}</span><span class="move-energy">${formatMoveMeta(move, activePlayerCard)}</span>`;

    const lockRemaining = Math.max(move.cooldownRemaining, move.unlockRemaining);

    if (gameOver || playerHP <= 0 || currentTurn !== "player" || lockRemaining > 0) {
      button.classList.add("cooling");
      button.disabled = true;
      if (lockRemaining > 0) {
        button.style.setProperty("--cooldown-left", `${getMoveLockPercent(move)}%`);
      } else {
        button.style.setProperty("--cooldown-left", "100%");
      }
    } else {
      button.addEventListener("click", () => useMove(move));
    }

    moveList.appendChild(button);
  });

  if (playerGlitchTurns > 0) {
    applyGlitchEffectToTarget("player", playerGlitchTurns);
  }
}

function renderOpponentMoves() {
  const opponentMoveList = document.querySelector("#opponentMoveList");
  if (!opponentMoveList || !opponentActiveCard) return;

  opponentMoveList.innerHTML = "";
  opponentMoves.forEach((move) => {
    const item = document.createElement("div");
    item.className = "move-button library-move";

    let lockTag = "";
    if (move.unlockRemaining > 0) {
      lockTag = ` <span class="lock-tag">🔒 解鎖剩餘 ${move.unlockRemaining} 回合</span>`;
    } else if (move.cooldownRemaining > 0) {
      lockTag = ` <span class="cd-tag">⏳ CD: ${move.cooldownRemaining} 回合</span>`;
    }

    item.innerHTML = `<span>${move.key}：${move.name}${lockTag}</span><span class="move-energy">${formatMoveMeta(move, opponentActiveCard)}</span>`;

    const lockRemaining = Math.max(move.cooldownRemaining, move.unlockRemaining);
    if (lockRemaining > 0) {
      item.classList.add("cooling");
      item.style.setProperty("--cooldown-left", `${getMoveLockPercent(move)}%`);
    } else if (currentTurn === "player" || opponentStatus.stunned) {
      item.style.opacity = "0.7";
    }

    opponentMoveList.appendChild(item);
  });

  if (opponentGlitchTurns > 0) {
    applyGlitchEffectToTarget("opponent", opponentGlitchTurns);
  }
}

function useMove(selectedMove) {
  if (gameOver || playerHP <= 0 || opponentHP <= 0 || currentTurn !== "player") return;

  // 檢查是否被封鎖
  if (playerStatus.stunned) {
    playerStatus.stunned = false; // 解除封鎖
    if (playerGlitchTurns > 0) {
      playerGlitchTurns--;
      if (playerGlitchTurns === 0) removeGlitchEffectFromTarget("player");
    }
    updateFieldStatusTags();
    if (starter === "opponent") decrementCooldowns();
    currentTurn = "opponent";
    updateTurnBadge("我方被色誘停止發招，換對手回合！");
    renderMoves();
    renderOpponentMoves();
    setTimeout(opponentTurn, 1000);
    return;
  }

  // 只有「雷切小弟弟」的領域展開才可以用選的（擇一發動做死、傳說對接、視獄偽境、真Dixx不斷、迪克崩壞、(Censored)）
  const isRaicheCard = activePlayerCard && activePlayerCard.name && activePlayerCard.name.includes("雷切小弟弟");
  if (isRaicheCard && selectedMove.name && selectedMove.name.includes("領域展開")) {
    if (domainSelectModal) {
      pendingDomainMove = selectedMove;
      domainSelectModal.hidden = false;
      domainSelectModal.removeAttribute("hidden");
      return;
    }
  }

  // 雷切小弟弟 G招：爸爸堅強又金色狂風...（對手全字元亂碼一局）
  if (isRaicheCard && ((selectedMove.key && selectedMove.key.toUpperCase() === "G") || (selectedMove.name && selectedMove.name.includes("爸爸堅強")))) {
    applyGlitchEffectToTarget("opponent", 1);
    if (activePlayerCard.hasEnergyMeter) {
      addEnergy(selectedMove.energy || 10);
    }
    selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 2;
    if (starter === "opponent") decrementCooldowns();
    if (playerGlitchTurns > 0) {
      playerGlitchTurns--;
      if (playerGlitchTurns === 0) removeGlitchEffectFromTarget("player");
    }
    updateFieldStatusTags();
    updateTurnBadge("🌀【雷切小弟弟】施展 G 招！對手卡牌與所有招式字元全數陷入亂碼一局，按鍵順序全面打亂！");
    currentTurn = "opponent";
    renderMoves();
    renderOpponentMoves();
    setTimeout(opponentTurn, 1000);
    return;
  }

  // 對「黃楷程」Z招與M1招式機制處理
  if (activePlayerCard && activePlayerCard.name === "黃楷程") {
    if (selectedMove.key === "Z" || selectedMove.key === "Z招" || selectedMove.name === "切換腳切") {
      const m1Move = playerMoves.find((m) => m.key === "M1");
      if (m1Move) {
        m1Move.name = "腳切";
        m1Move.damage = "2000";
      }
      selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 2;
      updateTurnBadge("🥋【黃楷程】切換為「腳切」姿態！M1 傷害提升至 2000！");
      renderMoves();
      if (starter === "opponent") decrementCooldowns();
      if (playerGlitchTurns > 0) {
        playerGlitchTurns--;
        if (playerGlitchTurns === 0) removeGlitchEffectFromTarget("player");
      }
      currentTurn = "opponent";
      setTimeout(opponentTurn, 1000);
      return;
    } else if (selectedMove.key === "M1" && selectedMove.name === "腳切") {
      setTimeout(() => {
        const m1 = playerMoves.find((m) => m.key === "M1");
        if (m1) {
          m1.name = "雷切";
          m1.damage = "600";
          renderMoves();
        }
      }, 0);
    }
  }

  // 計算傷害與特殊效果
  let damage = parseDamageValue(selectedMove.damage);

  if (selectedMove.name === "後撤步雷切") playerStatus.defense += 1000;
  if (selectedMove.name === "召喚八塊腹肌") {
    playerStatus.defense += 2000; // 獲得2000防禦力
  }

  // 支援自訂特殊機制關鍵字自動生效
  if (selectedMove.specialMechanic) {
    const sm = selectedMove.specialMechanic;
    if (sm.includes("防禦") || sm.includes("腹肌") || sm.includes("護甲")) {
      const defMatch = sm.match(/\d+/);
      const defVal = defMatch ? parseInt(defMatch[0]) : 1000;
      playerStatus.defense += defVal;
    }
    if (sm.includes("減半")) {
      opponentStatus.damageHalf = true;
    }
  }

  // 判斷是否為「切換人格騙術色誘」招式（對手停止發招一局，施招者連續出招）
  const isCharm = selectedMove.name === "切換人格騙術色誘" || (selectedMove.specialMechanic && (selectedMove.specialMechanic.includes("停止") || selectedMove.specialMechanic.includes("色誘")));

  if (isCharm) {
    applyDamage("opponent", damage, playerStatus, opponentStatus);
    selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 2;
    decrementCooldowns();
    if (playerGlitchTurns > 0) {
      playerGlitchTurns--;
      if (playerGlitchTurns === 0) removeGlitchEffectFromTarget("player");
    }
    updateFieldStatusTags();

    if (opponentHP <= 0) {
      handleOpponentCardDefeated();
      return;
    }

    // Driver團長自己發招後連續行動！跳過對手回合，我方連續出招！
    currentTurn = "player";
    updateTurnBadge("💖【Driver團長】騙術色誘成功！對手停止發招一局，我方連續出招！");
    renderMoves();
    renderOpponentMoves();
    return;
  }

  applyDamage("opponent", damage, playerStatus, opponentStatus);
  updateFieldStatusTags();

  // 能量機制（包含雷切小弟弟或自訂帶有「噁心能量條」的卡牌）
  const hasEnergy = activePlayerCard && (activePlayerCard.hasEnergyMeter || (selectedMove.specialMechanic && selectedMove.specialMechanic.includes("噁心能量條")));
  if (hasEnergy) {
    addEnergy(selectedMove.energy || 15);
    // 能量條集滿斬殺效果 (被動生效: 領域展開，超究極冥王拔不出來術登登登dua郎之炮)
    if (energy >= 100) {
      updateTurnBadge('💥【雷切小弟弟】噁心能量條 100% 爆發！發動【領域展開，超究極冥王拔不出來術登登登dua郎之炮】！全場灰飛煙滅！');
      triggerScreenShake();
      applyDamage("opponent", 999999999, playerStatus, opponentStatus);
      energy = 0;
      if (energyFill) energyFill.style.width = "0%";
      if (energyValue) energyValue.textContent = "0%";
    }
  }

  selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 1;

  if (starter === "opponent") {
    decrementCooldowns();
  }

  // 若我方處於亂碼狀態，此局出招後立即解除
  if (playerGlitchTurns > 0) {
    playerGlitchTurns--;
    if (playerGlitchTurns === 0) {
      removeGlitchEffectFromTarget("player");
    }
  }

  // 檢查對手卡牌是否死亡
  if (opponentHP <= 0) {
    handleOpponentCardDefeated();
    return;
  }

  currentTurn = "opponent";
  updateTurnBadge("對手回合思考中...");
  renderMoves();
  renderOpponentMoves();

  setTimeout(opponentTurn, 1000);
}

function opponentTurn() {
  if (gameOver || opponentHP <= 0 || playerHP <= 0) return;

  // 檢查對手是否被封鎖
  if (opponentStatus.stunned) {
    opponentStatus.stunned = false; // 解除封鎖
    if (opponentGlitchTurns > 0) {
      opponentGlitchTurns--;
      if (opponentGlitchTurns === 0) removeGlitchEffectFromTarget("opponent");
    }
    updateFieldStatusTags();
    if (starter === "player") decrementCooldowns();
    currentTurn = "player";
    updateTurnBadge("對手被封鎖停止發招一局！輪到我方");
    renderMoves();
    renderOpponentMoves();
    return;
  }

  const availableMoves = opponentMoves.filter((m) => m.cooldownRemaining === 0 && m.unlockRemaining === 0);
  if (availableMoves.length === 0) {
    if (opponentGlitchTurns > 0) {
      opponentGlitchTurns--;
      if (opponentGlitchTurns === 0) removeGlitchEffectFromTarget("opponent");
    }
    currentTurn = "player";
    updateTurnBadge("我方回合：請選擇技能出招");
    renderMoves();
    return;
  }

  let move = null;
  if (opponentAi === "低") {
    move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } else if (opponentAi === "普通") {
    move = availableMoves.find((m) => parseDamageValue(m.damage) >= playerHP) || availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } else {
    move = availableMoves.find((m) => parseDamageValue(m.damage) >= playerHP);
    if (!move && opponentHP < opponentMaxHP * 0.4) {
      move = availableMoves.find((m) => m.name === "後撤步雷切" || m.name === "召喚八塊腹肌");
    }
    if (!move) move = availableMoves.find((m) => m.name === "切換人格騙術色誘");
    if (!move) move = availableMoves.sort((a, b) => parseDamageValue(b.damage) - parseDamageValue(a.damage))[0];
  }

  if (move) {
    const isOppRaicheCard = opponentActiveCard && opponentActiveCard.name && opponentActiveCard.name.includes("雷切小弟弟");

    // 電腦使用雷切小弟弟 V招：領域展開（隨機抽 6 種領域）
    if (isOppRaicheCard && move.name && move.name.includes("領域展開")) {
      const domains = ["做死", "傳說對接", "視獄偽境", "真Dixx不斷", "迪克崩壞", "(Censored)"];
      const chosenDomain = domains[Math.floor(Math.random() * domains.length)];
      triggerScreenShake();
      updateTurnBadge(`🌌 對手【雷切小弟弟】展開領域【${chosenDomain}】！直接將我方瞬間湮滅！`);
      applyDamage("player", 999999999, opponentStatus, playerStatus);
      move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 3;
      if (starter === "player") decrementCooldowns();
      if (opponentGlitchTurns > 0) {
        opponentGlitchTurns--;
        if (opponentGlitchTurns === 0) removeGlitchEffectFromTarget("opponent");
      }
      updateFieldStatusTags();
      if (playerHP <= 0) {
        handlePlayerCardDefeated();
        return;
      }
      currentTurn = "player";
      renderMoves();
      renderOpponentMoves();
      return;
    }

    // 電腦使用雷切小弟弟 G招：爸爸堅強又金色狂風...（我方全字元亂碼一局）
    if (isOppRaicheCard && ((move.key && move.key.toUpperCase() === "G") || (move.name && move.name.includes("爸爸堅強")))) {
      applyGlitchEffectToTarget("player", 1);
      if (opponentActiveCard.hasEnergyMeter) {
        addOpponentEnergy(move.energy || 10);
      }
      move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 2;
      if (starter === "player") decrementCooldowns();
      if (opponentGlitchTurns > 0) {
        opponentGlitchTurns--;
        if (opponentGlitchTurns === 0) removeGlitchEffectFromTarget("opponent");
      }
      updateFieldStatusTags();
      updateTurnBadge("🌀 對手【雷切小弟弟】施展 G 招！我方卡牌與所有招式字元全數陷入亂碼一局，按鍵排列錯位！");
      currentTurn = "player";
      renderMoves();
      renderOpponentMoves();
      return;
    }

    // 對「黃楷程」Z招與M1特殊切換處理（電腦施展時）
    if (opponentActiveCard && opponentActiveCard.name === "黃楷程") {
      if (move.key === "Z" || move.name === "切換腳切") {
        const oppM1 = opponentMoves.find((m) => m.key === "M1");
        if (oppM1) {
          oppM1.name = "腳切";
          oppM1.damage = "2000";
        }
        move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 2;
        updateTurnBadge("🥋 對手【黃楷程】切換為「腳切」姿態！M1 傷害提升至 2000！");
        renderOpponentMoves();
        if (starter === "player") decrementCooldowns();
        if (opponentGlitchTurns > 0) {
          opponentGlitchTurns--;
          if (opponentGlitchTurns === 0) removeGlitchEffectFromTarget("opponent");
        }
        currentTurn = "player";
        renderMoves();
        return;
      } else if (move.key === "M1" && move.name === "腳切") {
        setTimeout(() => {
          const m1 = opponentMoves.find((m) => m.key === "M1");
          if (m1) {
            m1.name = "雷切";
            m1.damage = "600";
            renderOpponentMoves();
          }
        }, 0);
      }
    }

    let damage = parseDamageValue(move.damage);
    const isOppCharm = move.name === "切換人格騙術色誘" || (move.specialMechanic && (move.specialMechanic.includes("停止") || move.specialMechanic.includes("色誘")));

    if (move.name === "後撤步雷切") opponentStatus.defense += 1000;
    if (move.name === "召喚八塊腹肌") {
      opponentStatus.defense += 2000;
    }

    // 電腦自訂特殊機制生效
    if (move.specialMechanic) {
      const sm = move.specialMechanic;
      if (sm.includes("防禦") || sm.includes("腹肌") || sm.includes("護甲")) {
        const defMatch = sm.match(/\d+/);
        opponentStatus.defense += defMatch ? parseInt(defMatch[0]) : 1000;
      }
      if (sm.includes("減半")) {
        playerStatus.damageHalf = true;
      }
    }

    applyDamage("player", damage, opponentStatus, playerStatus);

    // 電腦使用雷切小弟弟或噁心能量條機制
    const oppHasEnergy = opponentActiveCard && (opponentActiveCard.hasEnergyMeter || (move.specialMechanic && move.specialMechanic.includes("噁心能量條")));
    if (oppHasEnergy) {
      addOpponentEnergy(move.energy || 15);
      if (opponentEnergy >= 100) {
        updateTurnBadge('💥 對手【雷切小弟弟】噁心能量條 100% 爆發！發動【領域展開，超究極冥王拔不出來術登登登dua郎之炮】！');
        triggerScreenShake();
        applyDamage("player", 999999999, opponentStatus, playerStatus);
        opponentEnergy = 0;
        if (opponentEnergyFill) opponentEnergyFill.style.width = "0%";
        if (opponentEnergyValue) opponentEnergyValue.textContent = "0%";
      }
    }

    move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 1;
    updateFieldStatusTags();

    // 檢查玩家卡牌是否陣亡
    if (playerHP <= 0) {
      handlePlayerCardDefeated();
      return;
    }

    // 若電腦使用色誘，電腦自己也要發招（連續追擊），跳過玩家回合！
    if (isOppCharm) {
      if (opponentGlitchTurns > 0) {
        opponentGlitchTurns--;
        if (opponentGlitchTurns === 0) removeGlitchEffectFromTarget("opponent");
      }
      move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 2;
      decrementCooldowns();
      currentTurn = "opponent";
      updateTurnBadge("💖 對手【Driver團長】騙術色誘成功！我方停止發招一局，對手連續追擊！");
      renderMoves();
      renderOpponentMoves();
      setTimeout(opponentTurn, 1000);
      return;
    }
  }

  if (starter === "player") {
    decrementCooldowns();
  }

  // 檢查玩家卡牌是否陣亡
  if (playerHP <= 0) {
    handlePlayerCardDefeated();
    return;
  }

  // 若對手處於亂碼狀態，此局出招後立即解除
  if (opponentGlitchTurns > 0) {
    opponentGlitchTurns--;
    if (opponentGlitchTurns === 0) {
      removeGlitchEffectFromTarget("opponent");
    }
  }

  currentTurn = "player";
  updateTurnBadge("我方回合：請選擇技能出招");
  renderMoves();
  renderOpponentMoves();
}

function handlePlayerCardDefeated() {
  const cardPanelEl = document.querySelector("#cardPanel");
  if (cardPanelEl) cardPanelEl.classList.add("dead");

  // 一張卡牌死了不代表你輸了：檢查手牌中是否還有其他備戰卡牌
  if (playerHandCards.length > 0) {
    updateTurnBadge("當前卡牌已陣亡！請從我方手牌選擇下一張卡牌上陣！");
    renderHand();
    renderMoves();
  } else {
    // 真正全軍覆沒才算輸
    showBattleResult(false, "我方所有卡牌皆已陣亡！再接再厲！");
  }
}

function handleOpponentCardDefeated() {
  const opponentCardPanel = document.querySelector("#opponentCardPanel");
  if (opponentCardPanel) opponentCardPanel.classList.add("dead");

  if (opponentHandCards.length > 0) {
    updateTurnBadge("對手卡牌已陣亡！對手正在派上下一張卡牌...");
    renderOpponentMoves();
    setTimeout(() => {
      playOpponentNextCard();
      currentTurn = "player";
      updateTurnBadge("對手新卡牌已上陣！輪到我方回合");
      renderMoves();
    }, 1200);
  } else {
    // 對手所有卡牌死亡，獲勝！
    showBattleResult(true, "太神了！你擊敗了對手的所有卡牌，取得全場勝利！");
  }
}

function showBattleResult(isVictory, descText) {
  gameOver = true;
  if (!battleResultModal) return;

  const resultTitle = document.querySelector("#resultTitle");
  const resultDesc = document.querySelector("#resultDesc");
  const resultEyebrow = document.querySelector("#resultEyebrow");

  if (isVictory) {
    resultEyebrow.textContent = "VICTORY";
    resultTitle.textContent = "你贏了！";
    resultTitle.className = "modal-title win";
  } else {
    resultEyebrow.textContent = "DEFEAT";
    resultTitle.textContent = "戰鬥失敗";
    resultTitle.className = "modal-title lose";
  }

  if (resultDesc) resultDesc.textContent = descText;
  battleResultModal.hidden = false;
}

if (playAgainButton) {
  playAgainButton.addEventListener("click", () => {
    startBattleSession();
  });
}

if (gameExitButton) {
  gameExitButton.addEventListener("click", () => {
    if (battleResultModal) battleResultModal.hidden = true;
    gamePanel.hidden = true;
    difficultyPanel.hidden = false;
  });
}

// 領域展開彈窗互動 (雷切小弟弟 V招)
if (domainSelectModal) {
  domainSelectModal.querySelectorAll(".domain-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosenDomain = btn.dataset.domain || btn.textContent.trim();
      domainSelectModal.hidden = true;
      domainSelectModal.setAttribute("hidden", "");

      if (!pendingDomainMove) return;

      triggerScreenShake();
      updateTurnBadge(`🌌【雷切小弟弟】展開領域【${chosenDomain}】！時空湮滅，直接將對手瞬間抹殺！`);
      applyDamage("opponent", 999999999999999999, playerStatus, opponentStatus);

      pendingDomainMove.cooldownRemaining = pendingDomainMove.cooldown !== undefined ? pendingDomainMove.cooldown : 3;
      pendingDomainMove = null;

      if (starter === "opponent") decrementCooldowns();
      if (playerGlitchTurns > 0) {
        playerGlitchTurns--;
        if (playerGlitchTurns === 0) removeGlitchEffectFromTarget("player");
      }
      updateFieldStatusTags();

      if (opponentHP <= 0) {
        handleOpponentCardDefeated();
        return;
      }

      currentTurn = "opponent";
      updateTurnBadge("對手回合思考中...");
      renderMoves();
      renderOpponentMoves();
      setTimeout(opponentTurn, 1000);
    });
  });
}

if (domainCancelBtn) {
  domainCancelBtn.addEventListener("click", () => {
    if (domainSelectModal) {
      domainSelectModal.hidden = true;
      domainSelectModal.setAttribute("hidden", "");
    }
    pendingDomainMove = null;
  });
}

// 亂碼與按鍵位置打亂效果 (雷切小弟弟 G招：所有字元全變亂碼，不管是數字中文還是符號，持續一局)
const glitchChars = [
  "█", "▞", "▓", "§", "#", "?", "!", "%", "&", "@", "Ø", "Ж", "¥", "µ", "★", "✦", "$", "*", "░", "▒",
  "⚡", "⚔", "☠", "☣", "Δ", "Ω", "Ψ", "Ξ", "λ", "π", "◬", "◈", "◇", "◆", "¤", "¶", "‡", "†"
];

function scrambleString(str) {
  if (!str) return "";
  // 所有字元都要變成亂碼，不管是數字、中文、符號還是英文字母
  return str
    .split("")
    .map((c) => {
      if (c === "\n" || c === "\r") return c;
      return glitchChars[Math.floor(Math.random() * glitchChars.length)];
    })
    .join("");
}

function scrambleAllTextNodes(element) {
  if (!element) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue && node.nodeValue.trim().length > 0) {
      node.nodeValue = scrambleString(node.nodeValue);
    }
  }
}

function applyGlitchEffectToTarget(target, turns = 1) {
  if (target === "opponent") {
    if (opponentGlitchTurns === 0) opponentGlitchTurns = turns;
    const oppPanel = document.querySelector("#opponentCardPanel");
    if (oppPanel) {
      oppPanel.classList.add("glitched-card");
      scrambleAllTextNodes(oppPanel);
    }

    const list = document.querySelector("#opponentMoveList");
    if (list) {
      scrambleAllTextNodes(list);
      // 所有招式按鈕順序隨機互換
      if (list.children.length > 1) {
        const items = Array.from(list.children);
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          list.appendChild(items[j]);
        }
      }
    }
  } else {
    if (playerGlitchTurns === 0) playerGlitchTurns = turns;
    const pPanel = document.querySelector("#cardPanel");
    if (pPanel) {
      pPanel.classList.add("glitched-card");
      scrambleAllTextNodes(pPanel);
    }

    const list = document.querySelector("#moveList");
    if (list) {
      scrambleAllTextNodes(list);
      // 所有招式按鈕在畫面的排列順序隨機互換 (點下去的位置會變，但功能依舊正常)
      if (list.children.length > 1) {
        const items = Array.from(list.children);
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          list.appendChild(items[j]);
        }
      }
    }
  }
}

function removeGlitchEffectFromTarget(target) {
  if (target === "opponent") {
    opponentGlitchTurns = 0;
    const oppPanel = document.querySelector("#opponentCardPanel");
    if (oppPanel) oppPanel.classList.remove("glitched-card");
    updateFieldDisplay();
    renderOpponentMoves();
  } else {
    playerGlitchTurns = 0;
    const pPanel = document.querySelector("#cardPanel");
    if (pPanel) pPanel.classList.remove("glitched-card");
    updateFieldDisplay();
    renderMoves();
  }
}

function decrementCooldowns() {
  playerMoves.forEach((move) => {
    if (move.cooldownRemaining > 0) move.cooldownRemaining -= 1;
    if (move.unlockRemaining > 0) move.unlockRemaining -= 1;
  });
  opponentMoves.forEach((move) => {
    if (move.cooldownRemaining > 0) move.cooldownRemaining -= 1;
    if (move.unlockRemaining > 0) move.unlockRemaining -= 1;
  });
}

function parseDamageValue(damageStr) {
  if (damageStr === "無限") return 999999;
  if (damageStr.includes("999999")) return 999999;
  return parseInt(damageStr) || 0;
}

function applyDamage(target, amount, attackerStatus, defenderStatus) {
  let finalDamage = amount;

  // 檢查減半效果
  if (attackerStatus.damageHalf) {
    finalDamage = Math.floor(finalDamage / 2);
    attackerStatus.damageHalf = false;
  }

  // 減去防禦（防禦會吸收傷害）
  const absorbedByDefense = Math.min(defenderStatus.defense, finalDamage);
  finalDamage = Math.max(0, finalDamage - defenderStatus.defense);
  defenderStatus.defense = Math.max(0, defenderStatus.defense - absorbedByDefense);

  if (target === "opponent") {
    opponentHP = Math.max(0, opponentHP - finalDamage);
    const oppHPText = document.querySelector("#opponentHealth");
    if (oppHPText) oppHPText.textContent = opponentHP;
    const oppDefText = document.querySelector("#opponentDefense");
    if (oppDefText) oppDefText.textContent = opponentStatus.defense;
  } else {
    playerHP = Math.max(0, playerHP - finalDamage);
    const plyHPText = document.querySelector("#cardHealth");
    if (plyHPText) plyHPText.textContent = playerHP;
    const plyDefText = document.querySelector("#playerDefense");
    if (plyDefText) plyDefText.textContent = playerStatus.defense;
  }
}

function addEnergy(amount) {
  energy = Math.min(100, energy + amount);
  if (energyFill) energyFill.style.width = `${energy}%`;
  if (energyValue) energyValue.textContent = energy >= 100 ? "滿了" : `${energy}%`;
}

if (backHomeButton) {
  backHomeButton.addEventListener("click", () => {
    if (cardEditorPanel) cardEditorPanel.hidden = true;
    homePanel.hidden = false;
  });
}

// ---------------- 卡牌設計器 (Card Editor) 核心邏輯 ---------------- //
let currentEditingIndex = 0;
let editingCardData = null;

function initCardEditor() {
  cards = loadCustomCards();
  renderCardSelectOptions();
  selectCardForEditing(0);
}

function renderCardSelectOptions() {
  if (!cardSelectDropdown) return;
  cardSelectDropdown.innerHTML = "";
  cards.forEach((card, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${index + 1}. ${card.name}`;
    cardSelectDropdown.appendChild(option);
  });
  cardSelectDropdown.value = currentEditingIndex;
}

if (cardSelectDropdown) {
  cardSelectDropdown.addEventListener("change", (e) => {
    selectCardForEditing(parseInt(e.target.value) || 0);
  });
}

if (newCardBtn) {
  newCardBtn.addEventListener("click", () => {
    const newCard = {
      name: `新卡牌 ${cards.length + 1}`,
      dikra: "1000000",
      chakra: "500",
      health: "12000",
      hasEnergyMeter: false,
      passive: "自訂被動技能效果",
      moves: [
        { key: "M1", name: "普通攻擊", damage: "500", energy: 10, cooldown: 0 },
        { key: "Z招", name: "必殺連擊", damage: "1200", energy: 25, cooldown: 1 },
      ],
    };
    cards.push(newCard);
    saveCustomCards();
    currentEditingIndex = cards.length - 1;
    renderCardSelectOptions();
    selectCardForEditing(currentEditingIndex);
    showEditorStatus("已建立新卡牌，請開始編輯！");
  });
}

if (resetCardsBtn) {
  resetCardsBtn.addEventListener("click", () => {
    if (confirm("確定要重設為預設卡牌嗎？所有自訂卡牌將被重置。")) {
      cards = JSON.parse(JSON.stringify(defaultCards));
      saveCustomCards();
      currentEditingIndex = 0;
      renderCardSelectOptions();
      selectCardForEditing(0);
      showEditorStatus("已重置為官方預設卡牌！");
    }
  });
}

function selectCardForEditing(index) {
  if (!cards[index]) return;
  currentEditingIndex = index;
  editingCardData = JSON.parse(JSON.stringify(cards[index]));

  // 填入基本欄位
  if (editCardName) editCardName.value = editingCardData.name;
  if (editCardDikra) editCardDikra.value = editingCardData.dikra;
  if (editCardChakra) editCardChakra.value = editingCardData.chakra;
  if (editCardHealth) editCardHealth.value = editingCardData.health;
  if (editCardPassive) editCardPassive.value = editingCardData.passive || "";

  renderMovesForm();
  updateLivePreview();
}

function renderMovesForm() {
  if (!movesEditContainer || !editingCardData) return;
  movesEditContainer.innerHTML = "";

  editingCardData.moves.forEach((move, moveIndex) => {
    const moveCard = document.createElement("div");
    moveCard.className = "move-card-edit";

    const hasSpecial = move.specialMechanic !== undefined && move.specialMechanic !== null;

    moveCard.innerHTML = `
      <div class="move-card-header">
        <span class="move-badge-title">招式 ${moveIndex + 1}</span>
        ${editingCardData.moves.length > 1 ? `<button class="delete-move-btn" type="button" title="刪除招式" data-index="${moveIndex}">✕</button>` : ""}
      </div>
      <div class="move-fields-row">
        <div class="form-field">
          <label>按鍵</label>
          <input type="text" class="editor-input move-key-input" value="${move.key || ""}" placeholder="如: M1, Z" data-index="${moveIndex}" />
        </div>
        <div class="form-field">
          <label>攻擊名稱</label>
          <input type="text" class="editor-input move-name-input" value="${move.name || ""}" placeholder="如: 雷切" data-index="${moveIndex}" />
        </div>
        <div class="form-field">
          <label>傷害</label>
          <input type="text" class="editor-input move-damage-input" value="${move.damage || ""}" placeholder="如: 700 或 無限" data-index="${moveIndex}" />
        </div>
        <div class="form-field">
          <label>冷卻(回合)</label>
          <input type="number" min="0" max="99" class="editor-input move-cooldown-input" value="${move.cooldown !== undefined ? move.cooldown : (move.key === 'M1' ? 0 : 1)}" placeholder="0" data-index="${moveIndex}" />
        </div>
      </div>
      
      <!-- 特殊機制區塊（加號自訂） -->
      <div class="special-mechanic-wrapper">
        ${hasSpecial
        ? `
          <div class="mechanic-field-box">
            <div class="mechanic-header">
              <label>特殊機制設定 (填寫後我會幫你編寫與修飾生效程式碼)</label>
              <button type="button" class="remove-mechanic-btn" data-index="${moveIndex}">✕ 移除特殊機制</button>
            </div>
            <input type="text" class="editor-input move-special-input" value="${move.specialMechanic}" placeholder="例如: 噁心能量條、召喚腹肌防禦、停止對手一局、反彈傷害" data-index="${moveIndex}" />
          </div>
        `
        : `
          <div class="special-mechanic-toggle">
            <button class="add-mechanic-btn" type="button" data-index="${moveIndex}">+ 加入特殊機制</button>
            <span style="font-size: 0.78rem; color: #888;">(沒按加號/沒填等於無特殊機制)</span>
          </div>
        `
      }
      </div>
    `;

    movesEditContainer.appendChild(moveCard);
  });

  // 綁定動態事件
  bindMoveEvents();
}

function bindMoveEvents() {
  // 刪除招式
  document.querySelectorAll(".delete-move-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      editingCardData.moves.splice(idx, 1);
      renderMovesForm();
      updateLivePreview();
    });
  });

  // 加入特殊機制 (+)
  document.querySelectorAll(".add-mechanic-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      editingCardData.moves[idx].specialMechanic = "噁心能量條";
      renderMovesForm();
      updateLivePreview();
    });
  });

  // 移除特殊機制
  document.querySelectorAll(".remove-mechanic-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      delete editingCardData.moves[idx].specialMechanic;
      renderMovesForm();
      updateLivePreview();
    });
  });

  // 即時監聽輸入
  document.querySelectorAll(".move-key-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.index);
      editingCardData.moves[idx].key = e.target.value;
      updateLivePreview();
    });
  });

  document.querySelectorAll(".move-name-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.index);
      editingCardData.moves[idx].name = e.target.value;
      updateLivePreview();
    });
  });

  document.querySelectorAll(".move-damage-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.index);
      editingCardData.moves[idx].damage = e.target.value;
      updateLivePreview();
    });
  });

  document.querySelectorAll(".move-cooldown-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.index);
      editingCardData.moves[idx].cooldown = Math.max(0, parseInt(e.target.value) || 0);
      updateLivePreview();
    });
  });

  document.querySelectorAll(".move-special-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.index);
      editingCardData.moves[idx].specialMechanic = e.target.value;
      updateLivePreview();
    });
  });
}

// 新增招式按鈕
if (addMoveBtn) {
  addMoveBtn.addEventListener("click", () => {
    if (!editingCardData) return;
    const defaultKeys = ["M1", "Z招", "X招", "C招", "V招", "F招", "G招"];
    const nextKey = defaultKeys[editingCardData.moves.length] || `招式${editingCardData.moves.length + 1}`;
    editingCardData.moves.push({
      key: nextKey,
      name: "新攻擊",
      damage: "500",
      cooldown: 1,
      energy: 10,
    });
    renderMovesForm();
    updateLivePreview();
  });
}

// 監聽基本屬性輸入
[editCardName, editCardDikra, editCardChakra, editCardHealth, editCardPassive].forEach((input) => {
  if (input) {
    input.addEventListener("input", () => {
      if (!editingCardData) return;
      editingCardData.name = editCardName.value;
      editingCardData.dikra = editCardDikra.value;
      editingCardData.chakra = editCardChakra.value;
      editingCardData.health = editCardHealth.value;
      editingCardData.passive = editCardPassive.value;
      updateLivePreview();
    });
  }
});

// 即時預覽更新
function updateLivePreview() {
  if (!editingCardData) return;

  if (previewCardName) previewCardName.textContent = editingCardData.name || "未命名卡牌";
  if (previewDikra) previewDikra.textContent = editingCardData.dikra || "-";
  if (previewChakra) previewChakra.textContent = editingCardData.chakra || "-";
  if (previewHealth) previewHealth.textContent = editingCardData.health || "-";
  if (previewPassive) previewPassive.textContent = editingCardData.passive || "";

  // 判斷是否需要能量條預覽
  const hasEnergy = editingCardData.hasEnergyMeter || editingCardData.moves.some((m) => m.specialMechanic && m.specialMechanic.includes("噁心能量條"));
  if (previewEnergyMeter) {
    previewEnergyMeter.hidden = !hasEnergy;
  }

  if (previewMoveList) {
    previewMoveList.innerHTML = "";
    editingCardData.moves.forEach((move) => {
      const item = document.createElement("div");
      item.className = "move-button library-move";
      const specialTag = move.specialMechanic ? ` <span style="color:#ffe28a; font-size:0.75rem;">[${move.specialMechanic}]</span>` : "";
      const cdTag = move.cooldown ? ` (CD: ${move.cooldown})` : " (無CD)";
      item.innerHTML = `<span>${move.key}：${move.name}${cdTag}${specialTag}</span><span class="move-energy">${move.damage}</span>`;
      previewMoveList.appendChild(item);
    });
  }
}

// 儲存卡牌
if (saveCardButton) {
  saveCardButton.addEventListener("click", () => {
    if (!editingCardData) return;

    // 自動判斷是否包含噁心能量條特殊機制
    const hasEnergy = editingCardData.moves.some((m) => m.specialMechanic && m.specialMechanic.includes("噁心能量條"));
    editingCardData.hasEnergyMeter = hasEnergy || editingCardData.hasEnergyMeter;

    // 確保每招基本冷卻設定與特殊機制規格化
    editingCardData = normalizeCard(editingCardData);

    cards[currentEditingIndex] = JSON.parse(JSON.stringify(editingCardData));
    saveCustomCards();
    renderCardSelectOptions();
    showEditorStatus("儲存成功！卡牌資料已更新，隨時可以在對戰中使用。你可以告訴我，我會幫你編寫特殊機制的詳細生效效果！");
  });
}

function showEditorStatus(msg) {
  if (!editorStatusText) return;
  editorStatusText.textContent = msg;
  editorStatusText.style.color = "#5af5b1";
  setTimeout(() => {
    if (editorStatusText) editorStatusText.textContent = "";
  }, 5000);
}

function formatMoveMeta(move, card) {
  if (!card || !card.hasEnergyMeter) {
    return `${move.damage}`;
  }
  const energyStr = move.energy > 999999 ? "+無限%" : `+${move.energy}%`;
  return `${move.damage} | ${energyStr}`;
}

function createBattleMoves(card) {
  return card.moves.map((move) => ({
    ...move,
    cooldownRemaining: 0,
    unlockRemaining: move.unlockAfterTurns || 0,
  }));
}

function getMoveLockPercent(move) {
  if (move.cooldownRemaining > 0) {
    return (move.cooldownRemaining / (move.cooldown || 1)) * 100;
  }

  if (move.unlockRemaining > 0) {
    return (move.unlockRemaining / (move.unlockAfterTurns || 1)) * 100;
  }

  return 0;
}
