const startButton = document.querySelector("#startButton");
const viewCardsButton = document.querySelector("#viewCardsButton");
const homePanel = document.querySelector("#homePanel");
const difficultyPanel = document.querySelector("#difficultyPanel");
const gamePanel = document.querySelector("#gamePanel");
const cardLibraryPanel = document.querySelector("#cardLibraryPanel");
const difficultyButtons = document.querySelectorAll(".difficulty-button");
const difficultyStatus = document.querySelector("#difficultyStatus");
const aiStatus = document.querySelector("#aiStatus");
const drawButton = document.querySelector("#drawButton");
const cardPanel = document.querySelector("#cardPanel");
const emptyFieldSlot = document.querySelector("#emptyFieldSlot");
const playerHand = document.querySelector("#playerHand");
const emptyHandSlot = document.querySelector("#emptyHandSlot");
const moveList = document.querySelector("#moveList");
const energyFill = document.querySelector("#energyFill");
const energyValue = document.querySelector("#energyValue");
const libraryCardName = document.querySelector("#libraryCardName");
const libraryDikra = document.querySelector("#libraryDikra");
const libraryChakra = document.querySelector("#libraryChakra");
const libraryHealth = document.querySelector("#libraryHealth");
const libraryMoveList = document.querySelector("#libraryMoveList");
const libraryPassive = document.querySelector("#libraryPassive");
const nextCardButton = document.querySelector("#nextCardButton");
const backHomeButton = document.querySelector("#backHomeButton");
let opponentAi = "";
let energy = 0;
let libraryCardIndex = 0;
let playerMoves = [];
let opponentMoves = [];
let playerHandCards = [];
let activePlayerCard = null;
let opponentActiveCard = null;
let playerHP = 0;
let opponentHP = 0;
let playerMaxHP = 0;
let opponentMaxHP = 0;
let playerStatus = { defense: 0, damageHalf: false, stunned: false };
let opponentStatus = { defense: 0, damageHalf: false, stunned: false };
let currentTurn = "player"; // "player" or "opponent"
let starter = "player"; // 誰是這場戰鬥的先發

const cards = [
  {
    name: "雷切小弟弟",
    dikra: "999999999999",
    chakra: "400",
    health: "10000",
    hasEnergyMeter: true,
    passive: "passive：噁心能量條集滿可以直接把對方拿掉。",
    moves: [
      { key: "M1", name: "雷刀連擊", energy: 5, cooldown: 0, damage: "350" },
      { key: "Z招", name: "迪克滿天飛", energy: 20, cooldown: 1, damage: "400" },
      { key: "X招", name: "兆年切", energy: 35, cooldown: 1, damage: "700" },
      { key: "C招", name: "笑     容", energy: 10, cooldown: 0, damage: "0 (對手下一個打出的招式傷害減半)" },
      { key: "V招", name: "領域展開，做死or對接", energy: 50, cooldown: 3, unlockAfterTurns: 5, damage: "999999999999999999" },
      { key: "F招", name: "超究極冥王炮", energy: 99999999999, cooldown: 3, unlockAfterTurns: 8, damage: "無限" },
    ],
  },
  {
    name: "黃楷程",
    dikra: "∞",
    chakra: "無",
    health: "11000",
    hasEnergyMeter: false,
    passive: "",
    moves: [
      { key: "M1", name: "雷切", energy: 5, cooldown: 0, damage: "400" },
      { key: "Z招", name: "切換腳切", energy: 10, cooldown: 0, damage: "0" },
      { key: "X招", name: "後撤步雷切", energy: 15, cooldown: 1, damage: "700" },
      { key: "C招", name: "棒子配合雷切", energy: 20, cooldown: 2, damage: "1100" },
      { key: "V招", name: "阿嚕霸牆壁combo", energy: 35, cooldown: 3, unlockAfterTurns: 3, damage: "8000" },
      { key: "F招", name: "領域展開，無限之切", energy: 99999999999, cooldown: 7, unlockAfterTurns: 5, damage: "無限" },
    ],
  },
  {
    name: "八塊腹肌Driver團團長",
    dikra: "9999999999999999999",
    chakra: "無限",
    health: "19999",
    hasEnergyMeter: false,
    passive: "passive：八塊腹肌的力量足以扭曲時空。",
    moves: [
      { key: "M1", name: "屌切", energy: 10, cooldown: 0, damage: "500" },
      { key: "Z招", name: "起來砸你屌", energy: 15, cooldown: 0, damage: "600" },
      { key: "X招", name: "切換人格騙術色誘", energy: 20, cooldown: 2, damage: "200 (對手停止發招一局)" },
      { key: "C招", name: "黑洞吸引", energy: 30, cooldown: 1, damage: "1100" },
      { key: "V招", name: "召喚八塊腹肌", energy: 40, cooldown: 3, damage: "0 (獲得2000防禦力)" },
      { key: "F招", name: "超級自爆！！！！", energy: 100, cooldown: 5, unlockAfterTurns: 7, damage: "無限" },
    ],
  },
];

if (startButton) {
  startButton.addEventListener("click", () => {
    homePanel.hidden = true;
    difficultyPanel.hidden = false;
  });
}

if (viewCardsButton) {
  viewCardsButton.addEventListener("click", () => {
    homePanel.hidden = true;
    cardLibraryPanel.hidden = false;
    renderLibraryCard();
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

    // 重設遊戲狀態
    playerHandCards = [];
    opponentMoves = [];
    activePlayerCard = null;
    opponentActiveCard = null;
    if (drawButton) {
      drawButton.textContent = "抽牌";
      drawButton.disabled = false;
    }
    renderHand();
    if (emptyFieldSlot) emptyFieldSlot.hidden = false;
    if (cardPanel) cardPanel.hidden = true;

    const opponentEmptyFieldSlot = document.querySelector("#opponentEmptyFieldSlot");
    const opponentCardPanel = document.querySelector("#opponentCardPanel");
    const opponentHand = document.querySelector("#opponentHand");
    
    if (opponentEmptyFieldSlot) opponentEmptyFieldSlot.hidden = false;
    if (opponentCardPanel) opponentCardPanel.hidden = true;
    if (opponentHand) {
      opponentHand.innerHTML = `<div class="empty-slot" id="opponentEmptyHandSlot">對手手牌是空的</div>`;
    }

    difficultyPanel.hidden = true;
    gamePanel.hidden = false;
  });
});

if (drawButton) {
  drawButton.addEventListener("click", () => {
    // 隨機分配卡牌，保證雙方卡牌不重複
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    playerHandCards = [shuffled[0]];
    opponentActiveCard = shuffled[1];

    drawButton.textContent = "已抽牌";
    drawButton.disabled = true;
    renderHand();

    // 更新對手手牌顯示
    const opponentHand = document.querySelector("#opponentHand");
    if (opponentHand && opponentActiveCard) {
      opponentHand.innerHTML = `
        <div class="hand-card" style="opacity: 0.8; filter: brightness(0.7); cursor: not-allowed;">
          ${opponentActiveCard.name}<span>血量 ${opponentActiveCard.health}</span>
        </div>
      `;
    }
  });
}

function renderHand() {
  if (!playerHand) {
    return;
  }

  playerHand.innerHTML = "";

  if (playerHandCards.length === 0) {
    playerHand.appendChild(emptyHandSlot);
    return;
  }

  playerHandCards.forEach((card, index) => {
    const button = document.createElement("button");
    button.className = "hand-card";
    button.type = "button";
    button.innerHTML = `${card.name}<span>血量 ${card.health}</span>`;
    button.addEventListener("click", () => playCard(index));
    playerHand.appendChild(button);
  });
}

function playCard(index) {
  const card = playerHandCards.splice(index, 1)[0];
  if (!card) {
    return;
  }

  activePlayerCard = card;
  playerMaxHP = parseInt(card.health.replace(/,/g, "")) || 10000;
  playerHP = playerMaxHP;
  playerStatus = { defense: 0, damageHalf: false, stunned: false };

  // 更新我方戰鬥牌面板資訊
  document.querySelector("#cardDikra").textContent = card.dikra;
  document.querySelector("#cardChakra").textContent = card.chakra;
  document.querySelector("#cardHealth").textContent = playerHP;
  document.querySelector("#cardPassive").textContent = card.passive;

  // 根據卡牌控制能量條顯示/隱藏
  const energyMeter = document.querySelector("#energyMeter");
  if (energyMeter) {
    energyMeter.hidden = !card.hasEnergyMeter;
  }

  emptyFieldSlot.hidden = true;
  cardPanel.hidden = false;

  // 對手也出牌
  const opponentEmptyFieldSlot = document.querySelector("#opponentEmptyFieldSlot");
  const opponentCardPanel = document.querySelector("#opponentCardPanel");
  const opponentHand = document.querySelector("#opponentHand");

  if (opponentEmptyFieldSlot) opponentEmptyFieldSlot.hidden = true;
  if (opponentCardPanel && opponentActiveCard) {
    opponentCardPanel.hidden = false;
    opponentMaxHP = parseInt(opponentActiveCard.health.replace(/,/g, "")) || 10000;
    opponentHP = opponentMaxHP;
    opponentStatus = { defense: 0, damageHalf: false, stunned: false };

    // 隨機決定誰先發
    const playerStarts = Math.random() > 0.5;
    starter = playerStarts ? "player" : "opponent";
    currentTurn = starter;

    // 動態載入對手卡牌資訊
    document.querySelector("#opponentCardName").textContent = opponentActiveCard.name + (starter === "opponent" ? " (先發)" : "");
    document.querySelector("#opponentDikra").textContent = opponentActiveCard.dikra;
    document.querySelector("#opponentChakra").textContent = opponentActiveCard.chakra;
    document.querySelector("#opponentHealth").textContent = opponentHP;
    document.querySelector("#opponentPassive").textContent = opponentActiveCard.passive;

    opponentMoves = createBattleMoves(opponentActiveCard);
    renderOpponentMoves();

    // 我方卡牌名稱更新
    document.querySelector("#cardName").textContent = card.name + (starter === "player" ? " (先發)" : "");
  }
  if (opponentHand) {
    opponentHand.innerHTML = `<div class="empty-slot" id="opponentEmptyHandSlot">對手手牌是空的</div>`;
  }

  energy = 0;
  energyFill.style.width = "0%";
  energyValue.textContent = "0%";
  playerMoves = createBattleMoves(card);
  renderHand();
  renderMoves();

  // 如果對手先發，觸發對手回合
  if (currentTurn === "opponent") {
    setTimeout(opponentTurn, 1000);
  }
}

function renderMoves() {
  if (!moveList) {
    return;
  }

  moveList.innerHTML = "";

  playerMoves.forEach((move) => {
    const button = document.createElement("button");
    button.className = "move-button";
    button.type = "button";
    button.innerHTML = `<span>${move.key}：${move.name}</span><span class="move-energy">${formatMoveMeta(move, activePlayerCard)}</span>`;

    const lockRemaining = Math.max(move.cooldownRemaining, move.unlockRemaining);

    // 如果不是玩家的回合，或是招式正在冷卻，或是被封鎖，則禁用按鈕
    if (currentTurn !== "player" || lockRemaining > 0 || playerStatus.stunned) {
      button.classList.add("cooling");
      button.disabled = true;
      if (lockRemaining > 0) {
        button.style.setProperty("--cooldown-left", `${getMoveLockPercent(move)}%`);
      } else {
        button.style.setProperty("--cooldown-left", "100%"); // 非回合或封鎖時變灰
      }
    } else {
      button.addEventListener("click", () => useMove(move));
    }

    moveList.appendChild(button);
  });
}

function renderOpponentMoves() {
  const opponentMoveList = document.querySelector("#opponentMoveList");
  if (!opponentMoveList || !opponentActiveCard) {
    return;
  }

  opponentMoveList.innerHTML = "";
  opponentMoves.forEach((move) => {
    const item = document.createElement("div");
    item.className = "move-button library-move";
    item.innerHTML = `<span>${move.key}：${move.name}</span><span class="move-energy">${formatMoveMeta(move, opponentActiveCard)}</span>`;

    const lockRemaining = Math.max(move.cooldownRemaining, move.unlockRemaining);
    if (lockRemaining > 0) {
      item.classList.add("cooling");
      item.style.setProperty("--cooldown-left", `${getMoveLockPercent(move)}%`);
    } else if (currentTurn === "player" || opponentStatus.stunned) {
        item.style.opacity = "0.7";
    }

    opponentMoveList.appendChild(item);
  });
}

function useMove(selectedMove) {
  if (playerHP <= 0 || opponentHP <= 0 || currentTurn !== "player") return;

  // 檢查是否被封鎖
  if (playerStatus.stunned) {
    playerStatus.stunned = false; // 解除封鎖
    if (starter === "opponent") decrementCooldowns();
    currentTurn = "opponent";
    renderMoves();
    renderOpponentMoves();
    setTimeout(opponentTurn, 1000);
    return;
  }

  // 對「黃楷程」Z招與M1招式進行特別處理
  if (activePlayerCard && activePlayerCard.name === "黃楷程") {
    if (selectedMove.key === "Z招") {
      const m1Move = playerMoves.find(m => m.key === "M1");
      if (m1Move) {
        m1Move.name = "腳切";
        m1Move.damage = "700";
      }
    } else if (selectedMove.key === "M1" && selectedMove.name === "腳切") {
      setTimeout(() => {
        selectedMove.name = "雷切";
        selectedMove.damage = "400";
        renderMoves();
      }, 0);
    }
  }

  // 計算傷害與效果
  let damage = parseDamageValue(selectedMove.damage);
  if (selectedMove.name === "笑     容") opponentStatus.damageHalf = true;
  if (selectedMove.name === "後撤步雷切") playerStatus.defense += 200;
  if (selectedMove.name === "切換人格騙術色誘") opponentStatus.stunned = true;
  if (selectedMove.name === "召喚八塊腹肌") playerStatus.defense += 2000;

  applyDamage("opponent", damage, playerStatus, opponentStatus);
// 黃楷程不使用能量機制
if (activePlayerCard && activePlayerCard.hasEnergyMeter) {
  addEnergy(selectedMove.energy);
  // 雷切小弟弟被動：能量滿直接斬殺
  if (activePlayerCard.name === "雷切小弟弟" && energy >= 100) {
    applyDamage("opponent", 999999999, playerStatus, opponentStatus);
  }
}
  
  selectedMove.cooldownRemaining = selectedMove.cooldown;

  // 如果玩家是後發，則扣除冷卻（一局結束）
  if (starter === "opponent") {
    decrementCooldowns();
  }

  currentTurn = "opponent";
  renderMoves();
  renderOpponentMoves();

  if (opponentHP > 0) {
    setTimeout(opponentTurn, 1000);
  }
}

function opponentTurn() {
  if (opponentHP <= 0 || playerHP <= 0) return;

  // 檢查對手是否被封鎖
  if (opponentStatus.stunned) {
    opponentStatus.stunned = false; // 解除封鎖
    if (starter === "player") decrementCooldowns();
    currentTurn = "player";
    renderMoves();
    renderOpponentMoves();
    return;
  }

  const availableMoves = opponentMoves.filter(m => m.cooldownRemaining === 0 && m.unlockRemaining === 0);
  if (availableMoves.length === 0) {
    currentTurn = "player";
    renderMoves();
    return;
  }

  let move = null;
  if (opponentAi === "智障") {
    move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } else if (opponentAi === "正常") {
    move = availableMoves.find(m => parseDamageValue(m.damage) >= playerHP) || availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } else {
    move = availableMoves.find(m => parseDamageValue(m.damage) >= playerHP);
    if (!move && energy >= 80) move = availableMoves.find(m => m.name === "笑     容");
    if (!move && opponentHP < (opponentMaxHP * 0.4)) {
        move = availableMoves.find(m => m.name === "後徹步雷切" || m.name === "召喚八塊腹肌");
    }
    if (!move && !playerStatus.stunned) move = availableMoves.find(m => m.name === "切換人格騙術色誘");
    if (!move) move = availableMoves.sort((a, b) => parseDamageValue(b.damage) - parseDamageValue(a.damage))[0];
  }

  if (move) {
    let damage = parseDamageValue(move.damage);
    if (move.name === "笑     容") playerStatus.damageHalf = true;
    if (move.name === "後撤步雷切") opponentStatus.defense += 200;
    if (move.name === "召喚八塊腹肌") opponentStatus.defense += 2000;
    if (move.name === "切換人格騙術色誘") playerStatus.stunned = true;

    applyDamage("player", damage, opponentStatus, playerStatus);
    move.cooldownRemaining = move.cooldown;
  }

  // 如果對手是後發，則扣除冷卻（一局結束）
  if (starter === "player") {
    decrementCooldowns();
  }

  currentTurn = "player";
  renderMoves();
  renderOpponentMoves();
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

  // 減去防禦
  finalDamage = Math.max(0, finalDamage - defenderStatus.defense);
  defenderStatus.defense = Math.max(0, defenderStatus.defense - amount); // 防禦會被消耗

  if (target === "opponent") {
    opponentHP = Math.max(0, opponentHP - finalDamage);
    document.querySelector("#opponentHealth").textContent = opponentHP;
    if (opponentHP <= 0) alert("你贏了！");
  } else {
    playerHP = Math.max(0, playerHP - finalDamage);
    document.querySelector("#cardHealth").textContent = playerHP;
    if (playerHP <= 0) alert("你輸了...");
  }
}

function addEnergy(amount) {
  energy = Math.min(100, energy + amount);
  energyFill.style.width = `${energy}%`;
  energyValue.textContent = energy >= 100 ? "滿了" : `${energy}%`;
}

if (nextCardButton) {
  nextCardButton.addEventListener("click", () => {
    libraryCardIndex = (libraryCardIndex + 1) % cards.length;
    renderLibraryCard();
  });
}

if (backHomeButton) {
  backHomeButton.addEventListener("click", () => {
    cardLibraryPanel.hidden = true;
    homePanel.hidden = false;
  });
}

function renderLibraryCard() {
  const card = cards[libraryCardIndex];
  libraryCardName.textContent = card.name;
  libraryDikra.textContent = card.dikra;
  libraryChakra.textContent = card.chakra;
  libraryHealth.textContent = card.health;
  libraryPassive.textContent = card.passive;
  libraryMoveList.innerHTML = "";

  // 根據卡牌控制圖鑑中的能量條顯示/隱藏
  const libraryEnergyMeter = document.querySelector("#libraryEnergyMeter");
  if (libraryEnergyMeter) {
    libraryEnergyMeter.hidden = !card.hasEnergyMeter;
  }

  card.moves.forEach((move) => {
    const item = document.createElement("div");
    item.className = "move-button library-move";
    item.innerHTML = `<span>${move.key}：${move.name}</span><span class="move-energy">${formatMoveMeta(move, card)}</span>`;
    libraryMoveList.appendChild(item);
  });
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
    return (move.cooldownRemaining / move.cooldown) * 100;
  }

  if (move.unlockRemaining > 0) {
    return (move.unlockRemaining / move.unlockAfterTurns) * 100;
  }

  return 0;
}
