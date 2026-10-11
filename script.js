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
let playerStackedCard = null; // 我方戰鬥牌區疊牌卡牌（雙卡同場共鬥）
let playerStackedHP = 0; // 我方疊牌卡牌血量
let playerStackedMaxHP = 0; // 我方疊牌卡牌最大血量
let opponentStackedCard = null; // 對手戰鬥牌區疊牌卡牌
let opponentStackedHP = 0; // 對手疊牌卡牌血量
let opponentStackedMaxHP = 0; // 對手疊牌卡牌最大血量
let playerStatus = { defense: 0, damageHalf: false, stunned: false };
let opponentStatus = { defense: 0, damageHalf: false, stunned: false };
let playerCardDamageMult = 1; // 當前卡牌傷害倍率 (Z/X招削弱)
let opponentCardDamageMult = 1; // 對手當前卡牌傷害倍率 (Z/X招削弱)
let playerGlobalDamageMult = 1; // 全局傷害倍率 (姜敦硯 V招 領域展開 1/4)
let opponentGlobalDamageMult = 1; // 對手全局傷害倍率 (姜敦硯 V招 領域展開 1/4)
let playerGeilaoApproached = false; // 我方姜敦硯是否已使用 M1 靠近對方
let opponentGeilaoApproached = false; // 對手姜敦硯是否已使用 M1 靠近對方
let isNoiseActive = false; // 是否處於畫面雜訊干擾中
let opponentMovesScrambled = false; // 電腦招式排列是否被打亂
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
      { key: "Z", name: "嘟", energy: 5, cooldown: 0, damage: "400", specialMechanic: "噁心能量條+5%" },
      { key: "X", name: "迪克滿天飛之陣", energy: 20, cooldown: 0, damage: "700", specialMechanic: "噁心能量條+20%" },
      { key: "C", name: "三重打包", energy: 40, cooldown: 1, damage: "5000", specialMechanic: "噁心能量條+40%" },
      { key: "V", name: "領域展開，", energy: 50, cooldown: 2, unlockAfterTurns: 4, damage: "999999999999999999", specialMechanic: "(絕招) 可以選擇你要「做死、傳說對接、視獄偽境、真Dixx不斷、迪克崩壞、(Censored)」擇一發動領域" },
      { key: "F", name: "究極冥王炮", energy: 100, cooldown: 2, unlockAfterTurns: 7, damage: "17000", specialMechanic: "(絕招) 開局7回合後解鎖" },
      { key: "G", name: "爸爸堅強又金色狂風七人隊八級大，大牛比較懶又玩高鐵的工人有他", energy: 10, cooldown: 1, damage: "0", specialMechanic: "對方卡牌所有字元變成亂碼，所有攻擊的排列順序隨機互換，電腦正常運作但點下去的位置會變" },
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
      { key: "M1", name: "雷切", energy: 5, cooldown: 0, damage: "10000" },
      { key: "Z", name: "切換腳切", energy: 10, cooldown: 2, damage: "0", specialMechanic: "雷切變成腳切，腳切傷害5000" },
      { key: "X", name: "後撤步雷切", energy: 15, cooldown: 1, damage: "700", specialMechanic: "加上1000防禦" },
      { key: "C", name: "棒子配合腳切組合", energy: 20, cooldown: 2, damage: "3000" },
      { key: "V", name: "阿嚕霸牆壁combo", energy: 35, cooldown: 3, unlockAfterTurns: 2, damage: "10000", specialMechanic: "開局3回合後解鎖(絕招)" },
      { key: "F", name: "領域展開，無限之切", energy: 100, cooldown: 7, unlockAfterTurns: 4, damage: "無限", specialMechanic: "開局5回合後解鎖(絕招)" },
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
      { key: "X招", name: "切換人格騙術色誘", energy: 20, cooldown: 1, damage: "200 (對手停止發招一局)", specialMechanic: "對手停止發招一局" },
      { key: "C招", name: "黑洞吸引", energy: 30, cooldown: 0, damage: "1100" },
      { key: "V招", name: "召喚八塊腹肌", energy: 40, cooldown: 2, damage: "0 (獲得2000防禦力)", specialMechanic: "獲得2000防禦力" },
      { key: "F招", name: "超級自爆！！！！", energy: 100, cooldown: 4, unlockAfterTurns: 6, damage: "無限", specialMechanic: "(絕招) 開局6回合後解鎖" },
    ],
  },
  {
    name: "陳豆豆",
    dikra: "0",
    chakra: "怒氣",
    health: "12000",
    hasEnergyMeter: false,
    passive: "狂怒大叫：大叫「干！」激發極致怒氣，50%機率黑閃暴擊(傷害x1.5)，並召喚Driver團長屌切連攜！",
    moves: [
      {
        key: "G",
        name: "發怒+大叫干+50%黑閃+召喚Driver團團長衝過去屌切",
        energy: 50,
        cooldown: 2,
        damage: "6000",
        specialMechanic: "(絕招) 此招式50%黑閃將會把傷害x1.5，加上八塊腹肌Driver團團長的屌切傷害",
      },
    ],
  },
  {
    name: "給佬®+姜敦硯",
    dikra: "0",
    chakra: "28328",
    health: "10000",
    hasEnergyMeter: false,
    passive: "強制掰開壓制：靠近對手後解鎖全套掰開連招，削弱對手輸出、釋放畫面雜訊干擾，存活五局後領域展開全面壓制！",
    moves: [
      {
        key: "M1",
        name: "靠近對方",
        energy: 10,
        cooldown: 0,
        damage: "0",
        specialMechanic: "先使用這招才可以解鎖其他招式",
      },
      {
        key: "Z",
        name: "衝上前掰開",
        energy: 25,
        cooldown: 0,
        damage: "3000",
        specialMechanic: "對方目前戰鬥牌打出的傷害永久減半",
      },
      {
        key: "X",
        name: "塗滿雙手精X，把人家的頭掰開",
        damage: "4000",
        cooldown: 1,
        energy: 10,
        specialMechanic: "對方目前戰鬥牌打出的傷害再次/3",
      },
      {
        key: "C",
        name: "把你耳朵掰開，塞Dixx進去",
        damage: "5000",
        cooldown: 2,
        energy: 10,
        specialMechanic: "對方螢幕出現雜訊效果直到這張牌陣亡",
      },
      {
        key: "V",
        name: "領域展開，自己掰開",
        damage: "15000",
        cooldown: 4,
        energy: 10,
        unlockAfterTurns: 4,
        specialMechanic: "(絕招) 這張牌存活四局後才解鎖，出這招後對方以後不管任何牌打出的攻擊都會變成1/4倍",
      },
      {
        key: "F",
        name: "快速下樓梯招，團長幫忙",
        damage: "0",
        cooldown: 1,
        energy: 10,
        specialMechanic: "回復血量2000",
      },
    ],
  },
  {
    name: "林走狗",
    dikra: "1000000",
    chakra: "500",
    health: "1050",
    hasEnergyMeter: false,
    passive: "血量跟狗一樣：身板脆弱如狗，但對姜敦硯具備絕對特攻，並能隨時召喚強大的Driver團長前來救援！",
    moves: [
      { key: "M1", name: "吠", damage: "800", energy: 10, cooldown: 0, unlockAfterTurns: 0, specialMechanic: "普通攻擊" },
      { key: "Z", name: "反掰開", damage: "1200", energy: 25, cooldown: 1, specialMechanic: "(絕招) 若對手是姜敦硯必殺" },
      { key: "X", name: "往你嘴裡塞迪克", damage: "500", cooldown: 1, energy: 10, specialMechanic: "對方停止出招一局" },
      { key: "C", name: "召喚團長", damage: "500", cooldown: 0, energy: 10, specialMechanic: "將Driver團長疊牌至自己戰鬥牌區(雙卡同時在場共鬥，不論團長是生是死是對方還是我的)" },
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

  // 陳豆豆機制修飾：尊重使用者自訂內容，絕不擅自添加生氣拳
  if (card.name && card.name.includes("陳豆豆")) {
    if (!card.passive) {
      card.passive = "狂怒大叫：大叫「干！」激發極致怒氣，50%機率黑閃暴擊(傷害x1.5)，並召喚Driver團長屌切連攜！";
    }
  }

  // 給佬®+姜敦硯 (第2版) 機制規範化
  if (card.name && (card.name.includes("給佬") || card.name.includes("姜敦硯"))) {
    if (!card.passive) {
      card.passive = "強制掰開壓制：靠近對手後解鎖全套掰開連招，削弱對手輸出、釋放畫面雜訊干擾，存活五局後領域展開全面壓制！";
    }
    if (Array.isArray(card.moves)) {
      card.moves.forEach((m) => {
        const isM1 = m.key === "M1" || m.key === "M1招" || (m.name && m.name.includes("靠近"));
        const isDomain = m.key === "V" || (m.name && m.name.includes("自己掰開"));
        if (isM1) {
          m.key = "M1";
          m.name = "靠近對方";
          m.unlockAfterTurns = 0;
          m.cooldown = 0;
        } else if (isDomain) {
          m.key = "V";
          m.name = "領域展開，自己掰開";
          m.unlockAfterTurns = 4;
        } else {
          m.unlockAfterTurns = 0;
        }
      });
    }
  }

  // 林走狗 機制規範化：尊重使用者自訂數值與技能，不強制覆蓋血量與被動
  if (card.name && card.name.includes("林走狗")) {
    if (!card.health) {
      card.health = "1050";
    }
    if (!card.passive) {
      card.passive = "血量跟狗一樣：身板脆弱如狗，但對姜敦硯具備絕對特攻，並能隨時召喚強大的Driver團長前來救援！";
    }
  }

  // 徹底移除「生氣拳」，確保卡牌庫中永遠不殘留生氣拳
  if (Array.isArray(card.moves)) {
    card.moves = card.moves.filter((m) => m && m.name !== "生氣拳");
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

      // 開局或存活回合解鎖解析（所有解鎖回合扣減一回合）
      if (sm.includes("回合") || sm.includes("局")) {
        const cnNums = { "一": 1, "二": 2, "兩": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10 };
        const turnMatch = sm.match(/(?:存活|開局|經過)?\s*([0-9]+|[一二兩三四五六七八九十]+)\s*(?:局|回合)(?:後)?(?:才)?解鎖/);
        if (turnMatch) {
          const val = turnMatch[1];
          const raw = cnNums[val] !== undefined ? cnNums[val] : parseInt(val);
          m.unlockAfterTurns = Math.max(0, raw - 1);
        }
      }

      // 絕不讓 M1 有解鎖等待回合！M1 是基礎起手普攻/靠近招式，立即可用
      const isM1 = m.key === "M1" || m.key === "M1招" || (m.name && m.name.includes("靠近"));
      if (isM1) {
        m.unlockAfterTurns = 0;
        m.cooldown = 0;
      }

      // 冷卻解析
      if (m.cooldown === undefined) {
        m.cooldown = isM1 ? 0 : 1;
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
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 徹底刪除新卡牌 5
        parsed = parsed.filter((c) => !c.name || (!c.name.includes("新卡牌 5") && !c.name.includes("新卡牌5")));

        // 保留第二個版本的給佬+姜敦硯，清除多餘舊版
        const geilaoDef = defaultCards.find((c) => c.name.includes("給佬") || c.name.includes("姜敦硯"));
        const geilaoIndices = [];
        parsed.forEach((c, idx) => {
          if (c.name && (c.name.includes("給佬") || c.name.includes("姜敦硯"))) {
            geilaoIndices.push(idx);
          }
        });
        if (geilaoIndices.length > 0) {
          const keepIdx = geilaoIndices[geilaoIndices.length - 1];
          parsed = parsed.filter((c, idx) => !geilaoIndices.includes(idx) || idx === keepIdx);
          const geilaoCard = parsed.find((c) => c.name && (c.name.includes("給佬") || c.name.includes("姜敦硯")));
          if (geilaoCard && geilaoDef) {
            geilaoCard.name = "給佬®+姜敦硯";
            geilaoCard.dikra = "0";
            geilaoCard.chakra = "28328";
            geilaoCard.health = "10000";
            // 每次載入時以標準最新招式資料同步，保證 M1 立即可用、僅 V 招在場存活 5 局解鎖
            geilaoCard.moves = JSON.parse(JSON.stringify(geilaoDef.moves));
          }
        }

        // 清除任何可能殘留的生氣拳
        parsed.forEach((c) => {
          if (Array.isArray(c.moves)) {
            c.moves = c.moves.filter((m) => m && m.name !== "生氣拳");
          }
        });

        // 合併預設卡牌中尚未存在的卡牌
        defaultCards.forEach((defCard) => {
          if (!parsed.some((p) => p.name === defCard.name)) {
            parsed.push(JSON.parse(JSON.stringify(defCard)));
          }
        });

        localStorage.setItem("customCardLibrary", JSON.stringify(parsed));
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

// 徹底還原卡牌面板與招式文字，確保亂碼效果結束後不殘留任何亂碼！
function restoreCardPanelDisplay(target) {
  if (target === "opponent") {
    opponentGlitchTurns = 0;
    opponentMovesScrambled = false;
    const oppPanel = document.querySelector("#opponentCardPanel");
    if (oppPanel) {
      oppPanel.classList.remove("glitched-card");
      // 徹底還原所有標籤文字（避免 dt 與 energy-label 被亂碼永久竄改）
      const dtList = oppPanel.querySelectorAll("dt");
      const dtLabels = ["迪克拉", "查克拉", "防禦", "血量"];
      dtList.forEach((dt, i) => {
        if (dtLabels[i]) dt.textContent = dtLabels[i];
      });
      const energyLabel = oppPanel.querySelector(".energy-label");
      if (energyLabel) energyLabel.textContent = "噁心能量條";
      const energyVal = oppPanel.querySelector("#opponentEnergyValue");
      if (energyVal) energyVal.textContent = opponentEnergy >= 100 ? "滿了" : `${opponentEnergy}%`;
    }

    if (opponentActiveCard) {
      const oppNameEl = document.querySelector("#opponentCardName");
      if (oppNameEl) oppNameEl.textContent = opponentActiveCard.name || "";
      const oppDikraEl = document.querySelector("#opponentDikra");
      if (oppDikraEl) oppDikraEl.textContent = opponentActiveCard.dikra || "";
      const oppChakraEl = document.querySelector("#opponentChakra");
      if (oppChakraEl) oppChakraEl.textContent = opponentActiveCard.chakra || "";
      const oppDefEl = document.querySelector("#opponentDefense");
      if (oppDefEl) oppDefEl.textContent = opponentStatus.defense;
      const oppHpEl = document.querySelector("#opponentHealth");
      if (oppHpEl) oppHpEl.textContent = opponentHP;
      const oppPassiveEl = document.querySelector("#opponentPassive");
      if (oppPassiveEl) oppPassiveEl.textContent = opponentActiveCard.passive || "";

      renderOpponentMoves();
    }
  } else {
    playerGlitchTurns = 0;
    const pPanel = document.querySelector("#cardPanel");
    if (pPanel) {
      pPanel.classList.remove("glitched-card");
      const dtList = pPanel.querySelectorAll("dt");
      const dtLabels = ["迪克拉", "查克拉", "防禦", "血量"];
      dtList.forEach((dt, i) => {
        if (dtLabels[i]) dt.textContent = dtLabels[i];
      });
      const energyLabel = pPanel.querySelector(".energy-label");
      if (energyLabel) energyLabel.textContent = "噁心能量條";
      const energyVal = pPanel.querySelector("#energyValue");
      if (energyVal) energyVal.textContent = energy >= 100 ? "滿了" : `${energy}%`;
    }

    if (activePlayerCard) {
      const nameEl = document.querySelector("#cardName");
      if (nameEl) nameEl.textContent = activePlayerCard.name || "";
      const dikraEl = document.querySelector("#cardDikra");
      if (dikraEl) dikraEl.textContent = activePlayerCard.dikra || "";
      const chakraEl = document.querySelector("#cardChakra");
      if (chakraEl) chakraEl.textContent = activePlayerCard.chakra || "";
      const defEl = document.querySelector("#playerDefense");
      if (defEl) defEl.textContent = playerStatus.defense;
      const hpEl = document.querySelector("#cardHealth");
      if (hpEl) hpEl.textContent = playerHP;
      const passiveEl = document.querySelector("#cardPassive");
      if (passiveEl) passiveEl.textContent = activePlayerCard.passive || "";

      renderMoves();
    }
  }
}

// 全面解除所有干擾效果與視覺效果（開局、換局、重新開始時調用）
function clearAllBattleEffects() {
  isNoiseActive = false;
  opponentMovesScrambled = false;
  playerGlitchTurns = 0;
  opponentGlitchTurns = 0;

  document.body.classList.remove("screen-noise-active");
  document.body.classList.remove("screen-shake");

  const pPanel = document.querySelector("#cardPanel");
  if (pPanel) {
    pPanel.classList.remove("glitched-card");
    pPanel.classList.remove("card-noise-interference");
    pPanel.classList.remove("dead");
  }

  const oppPanel = document.querySelector("#opponentCardPanel");
  if (oppPanel) {
    oppPanel.classList.remove("glitched-card");
    oppPanel.classList.remove("card-noise-interference");
    oppPanel.classList.remove("dead");
  }

  const pList = document.querySelector("#moveList");
  if (pList) {
    pList.classList.remove("card-noise-interference");
  }

  const oppList = document.querySelector("#opponentMoveList");
  if (oppList) {
    oppList.classList.remove("card-noise-interference");
  }

  const cutscene = document.querySelector("#raicheUltimateCutscene");
  if (cutscene) {
    cutscene.hidden = true;
    cutscene.setAttribute("hidden", "");
  }
  const cutsceneVid = document.querySelector("#cutsceneVideo");
  if (cutsceneVid) {
    cutsceneVid.pause();
    cutsceneVid.hidden = true;
    cutsceneVid.setAttribute("hidden", "");
  }
  const cutsceneWrapper = document.querySelector("#cutsceneVideoWrapper");
  if (cutsceneWrapper) {
    cutsceneWrapper.hidden = true;
    cutsceneWrapper.setAttribute("hidden", "");
  }
  const shoutout = document.querySelector("#ultimateSkillShoutout");
  if (shoutout) {
    shoutout.hidden = true;
    shoutout.setAttribute("hidden", "");
  }
  const expOverlay = document.querySelector("#megaGreenExplosionOverlay");
  if (expOverlay) {
    expOverlay.hidden = true;
    expOverlay.setAttribute("hidden", "");
  }
  const lockdown = document.querySelector("#inputLockdownOverlay");
  if (lockdown) {
    lockdown.hidden = true;
    lockdown.setAttribute("hidden", "");
  }

  const pStackBadge = document.querySelector("#playerStackBadge");
  if (pStackBadge) pStackBadge.remove();
  const oStackBadge = document.querySelector("#oppStackBadge");
  if (oStackBadge) oStackBadge.remove();
  const cardPanelEl = document.querySelector("#cardPanel");
  if (cardPanelEl) cardPanelEl.classList.remove("stacked-card-active");
  const oppCardPanelEl = document.querySelector("#opponentCardPanel");
  if (oppCardPanelEl) oppCardPanelEl.classList.remove("stacked-card-active");

  restoreCardPanelDisplay("opponent");
  restoreCardPanelDisplay("player");
}

// 判斷招式特殊機制是否標註 (絕招)
function hasUltimateKeyword(move) {
  if (!move || !move.specialMechanic) return false;
  const sm = String(move.specialMechanic);
  return sm.includes("絕招");
}

// 螢幕上方紅色大大的喊出招式名稱特效
function triggerUltimateShoutout(moveName, onComplete) {
  const shoutoutOverlay = document.querySelector("#ultimateSkillShoutout");
  const titleEl = document.querySelector("#shoutoutMoveName");
  if (!shoutoutOverlay || !titleEl) {
    if (onComplete) onComplete();
    return;
  }

  titleEl.textContent = moveName;
  shoutoutOverlay.hidden = false;
  shoutoutOverlay.removeAttribute("hidden");
  triggerScreenShake();

  setTimeout(() => {
    shoutoutOverlay.hidden = true;
    shoutoutOverlay.setAttribute("hidden", "");
    if (onComplete) onComplete();
  }, 1400);
}

// 雷切小弟弟 能量滿 終極領域展開全螢幕綠火閃電文字動畫
function playRaicheUltimateCutscene(onFinish) {
  const cutsceneOverlay = document.querySelector("#raicheUltimateCutscene");
  const textBox = document.querySelector("#cutsceneTextContainer");
  const skipBtn = document.querySelector("#cutsceneSkipBtn");
  const lightningContainer = document.querySelector(".cutscene-lightning-canvas");
  const fireContainer = document.querySelector(".cutscene-fire-fx");
  if (!cutsceneOverlay || !textBox) {
    if (onFinish) onFinish();
    return;
  }

  cutsceneOverlay.hidden = false;
  cutsceneOverlay.removeAttribute("hidden");
  textBox.innerHTML = "";

  let lightningCanvas = null;
  let lightningCtx = null;
  let lightningAnimInterval = null;

  let fireCanvas = null;
  let fireCtx = null;
  let fireAnimId = null;

  // 1. 動態綠色烈火粒子與火焰海系統
  if (fireContainer) {
    fireContainer.innerHTML = "";
    fireCanvas = document.createElement("canvas");
    fireCanvas.width = window.innerWidth;
    fireCanvas.height = window.innerHeight;
    fireCanvas.style.position = "absolute";
    fireCanvas.style.inset = "0";
    fireCanvas.style.pointerEvents = "none";
    fireCanvas.style.zIndex = "1";
    fireContainer.appendChild(fireCanvas);
    fireCtx = fireCanvas.getContext("2d");

    const flameCount = 75;
    const flames = [];
    for (let i = 0; i < flameCount; i++) {
      flames.push({
        x: Math.random() * fireCanvas.width,
        y: fireCanvas.height * (0.6 + Math.random() * 0.4),
        radius: Math.random() * 24 + 10,
        speedY: Math.random() * 4 + 3,
        speedX: (Math.random() - 0.5) * 3,
        life: Math.random() * 1,
        decay: Math.random() * 0.015 + 0.008,
        color: Math.random() < 0.25 ? "#ccffcc" : (Math.random() < 0.75 ? "#00ff00" : "#10bb20")
      });
    }

    let flameTime = 0;
    const renderFire = () => {
      if (finished || !fireCtx) return;
      fireCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
      flameTime += 0.04;

      const w = fireCanvas.width;
      const h = fireCanvas.height;

      // 底部洶湧綠焰波浪
      fireCtx.save();
      const grad = fireCtx.createLinearGradient(0, h, 0, h * 0.45);
      grad.addColorStop(0, "rgba(0, 255, 0, 0.75)");
      grad.addColorStop(0.35, "rgba(0, 220, 20, 0.5)");
      grad.addColorStop(0.7, "rgba(0, 120, 10, 0.25)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      fireCtx.fillStyle = grad;
      fireCtx.beginPath();
      fireCtx.moveTo(0, h);
      for (let x = 0; x <= w; x += 25) {
        const wave1 = Math.sin(x * 0.012 + flameTime * 3) * 45;
        const wave2 = Math.cos(x * 0.025 - flameTime * 2.2) * 30;
        const wave3 = Math.sin(x * 0.006 + flameTime * 1.5) * 20;
        const y = h * 0.75 + wave1 + wave2 + wave3;
        fireCtx.lineTo(x, y);
      }
      fireCtx.lineTo(w, h);
      fireCtx.closePath();
      fireCtx.fill();
      fireCtx.restore();

      // 升騰燃燒的火焰粒子與火星
      flames.forEach((f) => {
        f.y -= f.speedY;
        f.x += f.speedX + Math.sin(flameTime * 2 + f.y * 0.015) * 2;
        f.life -= f.decay;
        f.radius *= 0.985;

        if (f.life <= 0 || f.y < h * 0.15) {
          f.x = Math.random() * fireCanvas.width;
          f.y = fireCanvas.height + Math.random() * 20;
          f.radius = Math.random() * 24 + 10;
          f.speedY = Math.random() * 5 + 3.5;
          f.speedX = (Math.random() - 0.5) * 3;
          f.life = 1;
        }

        fireCtx.save();
        fireCtx.globalAlpha = Math.max(0, f.life * 0.9);
        fireCtx.fillStyle = f.color;
        fireCtx.shadowColor = "#00ff00";
        fireCtx.shadowBlur = 18;
        fireCtx.beginPath();
        fireCtx.arc(f.x, f.y, Math.max(1, f.radius), 0, Math.PI * 2);
        fireCtx.fill();
        fireCtx.restore();
      });

      fireAnimId = requestAnimationFrame(renderFire);
    };

    fireAnimId = requestAnimationFrame(renderFire);
  }

  // 2. 動態綠色閃電系統
  if (lightningContainer) {
    lightningContainer.innerHTML = "";
    lightningCanvas = document.createElement("canvas");
    lightningCanvas.width = window.innerWidth;
    lightningCanvas.height = window.innerHeight;
    lightningCanvas.style.position = "absolute";
    lightningCanvas.style.inset = "0";
    lightningCanvas.style.pointerEvents = "none";
    lightningCanvas.style.zIndex = "2";
    lightningContainer.appendChild(lightningCanvas);
    lightningCtx = lightningCanvas.getContext("2d");

    const drawBolt = (x1, y1, x2, y2, displace, depth) => {
      if (depth === 0) {
        lightningCtx.beginPath();
        lightningCtx.moveTo(x1, y1);
        lightningCtx.lineTo(x2, y2);
        lightningCtx.strokeStyle = "#00ff00";
        lightningCtx.lineWidth = Math.random() * 2.5 + 1.5;
        lightningCtx.shadowColor = "#55ff55";
        lightningCtx.shadowBlur = 15;
        lightningCtx.stroke();
        return;
      }
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;
      drawBolt(x1, y1, midX, midY, displace / 1.8, depth - 1);
      drawBolt(midX, midY, x2, y2, displace / 1.8, depth - 1);
      if (Math.random() < 0.28) {
        const branchX = midX + (Math.random() - 0.5) * displace * 0.8;
        const branchY = midY + (Math.random() - 0.5) * displace * 0.8;
        drawBolt(midX, midY, branchX, branchY, displace / 2, depth - 2);
      }
    };

    lightningAnimInterval = setInterval(() => {
      if (finished || !lightningCtx) return;
      lightningCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);
      if (Math.random() < 0.85) {
        const startX = Math.random() * lightningCanvas.width;
        const startY = 0;
        const endX = startX + (Math.random() - 0.5) * 400;
        const endY = lightningCanvas.height;
        drawBolt(startX, startY, endX, endY, 180, 5);
      }
    }, 120);
  }

  const lines = [
    { text: "自從習得冥王炮", type: "normal", delay: 900 },
    { text: "我便努力增強", type: "normal", delay: 900 },
    { text: "我花40生的時間", type: "normal", delay: 900 },
    { text: "每天Drive、嘟、雷切、做、看好康、登dua郎", type: "normal", delay: 1300 },
    { text: "努力掌握迪克拉如自己身體", type: "normal", delay: 1000 },
    { text: "如今我的技術已晉級", type: "normal", delay: 1000 },
    { text: "接受我的終極奧義", type: "normal", delay: 1000 },
    { text: "領域展開！！", type: "highlight", delay: 1200 },
    { text: "超究極", type: "climax", delay: 550 },
    { text: "冥王", type: "climax", delay: 550 },
    { text: "雷切杰刀", type: "climax", delay: 550 },
    { text: "拔不出來術", type: "climax", delay: 650 },
    { text: "登登登dua郎之炮！！！", type: "climax", delay: 1800 }
  ];

  let currentIndex = 0;
  let timer = null;
  let finished = false;
  const videoEl = document.querySelector("#cutsceneVideo");

  const endCutscene = () => {
    if (finished) return;
    finished = true;
    if (timer) clearTimeout(timer);
    if (videoEl) {
      videoEl.pause();
      videoEl.onended = null;
      videoEl.onerror = null;
      videoEl.hidden = true;
      videoEl.setAttribute("hidden", "");
    }
    const videoWrapper = document.querySelector("#cutsceneVideoWrapper");
    if (videoWrapper) {
      videoWrapper.hidden = true;
      videoWrapper.setAttribute("hidden", "");
    }
    if (lightningAnimInterval) clearInterval(lightningAnimInterval);
    if (fireAnimId) cancelAnimationFrame(fireAnimId);
    if (lightningContainer) lightningContainer.innerHTML = "";
    if (fireContainer) fireContainer.innerHTML = "";
    cutsceneOverlay.hidden = true;
    cutsceneOverlay.setAttribute("hidden", "");
    triggerScreenShake();
    if (onFinish) onFinish();
  };

  if (skipBtn) {
    skipBtn.onclick = endCutscene;
  }

  // 文字播完後，在離開黑色背景前播放 冥王動畫1080畫質.mp4
  const playVideoPhase = () => {
    if (finished) return;
    textBox.innerHTML = "";

    if (!videoEl) {
      endCutscene();
      return;
    }

    const videoWrapper = document.querySelector("#cutsceneVideoWrapper");
    if (videoWrapper) {
      videoWrapper.hidden = false;
      videoWrapper.removeAttribute("hidden");
    }

    // 確保指向最新的高畫質影片來源
    if (videoEl.getAttribute("src") !== "冥王動畫1080畫質.mp4") {
      videoEl.src = "冥王動畫1080畫質.mp4";
    }

    videoEl.hidden = false;
    videoEl.removeAttribute("hidden");
    videoEl.currentTime = 0;

    videoEl.onended = () => {
      endCutscene();
    };

    videoEl.onerror = () => {
      console.warn("冥王動畫載入失敗，自動跳過");
      endCutscene();
    };

    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("影片自動播放受阻，嘗試靜音播放:", err);
        videoEl.muted = true;
        videoEl.play().catch((e) => {
          console.error("無法播放影片，自動推進:", e);
          endCutscene();
        });
      });
    }
  };

  const showNextLine = () => {
    if (finished) return;
    if (currentIndex >= lines.length) {
      playVideoPhase();
      return;
    }

    const item = lines[currentIndex];
    const isLastLine = currentIndex === lines.length - 1;

    // 高潮字詞或最後一句單獨清空居中展示
    if (item.type.includes("climax") || item.type.includes("highlight") || isLastLine) {
      textBox.innerHTML = "";
    } else if (textBox.children && textBox.children.length >= 4) {
      if (textBox.firstChild) textBox.removeChild(textBox.firstChild);
    }

    const p = document.createElement("p");
    p.className = `cutscene-line ${item.type}${isLastLine ? " last-line" : ""}`;
    p.textContent = item.text;
    textBox.appendChild(p);

    if (item.type === "highlight" || item.type === "climax") {
      triggerScreenShake();
    }

    currentIndex++;
    timer = setTimeout(showNextLine, item.delay);
  };

  showNextLine();
}

// 5秒超華麗綠色終極連鎖大爆炸（對方卡牌上方連續核爆，全域按鍵鎖定5秒）
function playMegaGreenExplosion(targetEl, onFinish) {
  const overlay = document.querySelector("#megaGreenExplosionOverlay");
  const canvas = document.querySelector("#megaExplosionCanvas");
  const flashBg = document.querySelector(".explosion-flash-bg");
  const lockdownOverlay = document.querySelector("#inputLockdownOverlay");

  // 1. 立即鎖定全域按鍵與點擊，讓玩家不能按任何按鍵
  if (lockdownOverlay) {
    lockdownOverlay.hidden = false;
    lockdownOverlay.removeAttribute("hidden");
  }
  document.querySelectorAll("button").forEach((btn) => (btn.disabled = true));

  if (!overlay || !canvas) {
    setTimeout(() => {
      if (lockdownOverlay) {
        lockdownOverlay.hidden = true;
        lockdownOverlay.setAttribute("hidden", "");
      }
      if (onFinish) onFinish();
    }, 5000);
    return;
  }

  overlay.hidden = false;
  overlay.removeAttribute("hidden");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  // 計算目標卡牌中心坐標（若有卡牌元素則精準鎖定該卡牌中心）
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight * 0.35;
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }
    targetEl.classList.add("card-under-mega-explosion");
  }

  const startTime = performance.now();
  const duration = 5000; // 嚴格 5 秒
  let animId = null;

  const particles = [];
  const shockwaves = [];
  const stageDetonated = [false, false, false, false, false, false];
  let supernovaDetonated = false;

  // 爆破輔助函數
  const spawnBurst = (x, y, count, baseRadius, speedMult, colors) => {
    shockwaves.push({
      x,
      y,
      radius: 12,
      maxRadius: baseRadius * 2.8,
      speed: 14 * speedMult,
      alpha: 1,
      color: colors[0] || "#00ff00",
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 8.5 + 3.5) * speedMult;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.012 + 0.007,
        gravity: 0.1,
        spark: Math.random() < 0.45,
      });
    }

    triggerScreenShake();
  };

  const render = (now) => {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Phase 1: 0 ~ 800ms 空間塌縮光芒與聚能
    if (elapsed < 800) {
      const p = elapsed / 800;
      ctx.save();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 + elapsed * 0.007;
        const dist = (1 - p) * 260 + 20;
        ctx.beginPath();
        ctx.moveTo(targetX + Math.cos(angle) * dist, targetY + Math.sin(angle) * dist);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = i % 2 === 0 ? "#00ff00" : "#aaffaa";
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "#00ff00";
        ctx.shadowBlur = 18;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(targetX, targetY, p * 40 + 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#39ff14";
      ctx.shadowBlur = 35;
      ctx.fill();
      ctx.restore();

      if (flashBg) flashBg.style.opacity = `${p * 0.35}`;
    }

    // Phase 2: 800ms ~ 2300ms 連環 6 波劇烈綠焰大爆炸
    const stageTimes = [800, 1050, 1300, 1550, 1800, 2050];
    stageTimes.forEach((st, idx) => {
      if (elapsed >= st && !stageDetonated[idx]) {
        stageDetonated[idx] = true;
        const offsetX = (Math.random() - 0.5) * 140;
        const offsetY = (Math.random() - 0.5) * 90;
        spawnBurst(
          targetX + offsetX,
          targetY + offsetY,
          75,
          110,
          1.25,
          ["#00ff00", "#55ff55", "#39ff14", "#ffffff", "#00e676"]
        );
        if (flashBg) {
          flashBg.style.opacity = "0.75";
          setTimeout(() => { if (flashBg) flashBg.style.opacity = "0.2"; }, 90);
        }
      }
    });

    // Phase 3: 2300ms 終極毀滅級核爆大爆炸
    if (elapsed >= 2300 && !supernovaDetonated) {
      supernovaDetonated = true;
      spawnBurst(targetX, targetY, 360, 280, 2.4, [
        "#ffffff",
        "#00ff00",
        "#76ff03",
        "#39ff14",
        "#b9f6ca",
        "#00e676",
      ]);

      if (flashBg) {
        flashBg.style.opacity = "1";
        setTimeout(() => { if (flashBg) flashBg.style.opacity = "0.35"; }, 220);
      }
      triggerScreenShake();
      setTimeout(triggerScreenShake, 250);
      setTimeout(triggerScreenShake, 550);
    }

    // 繪製巨大沖天能量光柱 (2300ms ~ 3700ms)
    if (elapsed >= 2300 && elapsed < 3700) {
      const beamP = 1 - (elapsed - 2300) / 1400;
      ctx.save();
      const beamW = beamP * 150 + 25;
      const beamGrad = ctx.createLinearGradient(targetX - beamW / 2, 0, targetX + beamW / 2, 0);
      beamGrad.addColorStop(0, "rgba(0, 255, 0, 0)");
      beamGrad.addColorStop(0.25, "rgba(0, 255, 0, 0.8)");
      beamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.98)");
      beamGrad.addColorStop(0.75, "rgba(0, 255, 0, 0.8)");
      beamGrad.addColorStop(1, "rgba(0, 255, 0, 0)");

      ctx.fillStyle = beamGrad;
      ctx.fillRect(targetX - beamW / 2, 0, beamW, canvas.height);
      ctx.restore();
    }

    // 更新並繪製衝擊波光環
    shockwaves.forEach((sw, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = Math.max(1, (1 - sw.radius / sw.maxRadius) * 12);
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 22;
      ctx.stroke();
      ctx.restore();

      sw.radius += sw.speed;
      sw.alpha -= 0.022;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        shockwaves.splice(i, 1);
      }
    });

    // 更新並繪製能量碎片與火星粒子
    particles.forEach((p, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.6, p.radius * p.alpha), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.spark ? 16 : 8;
      ctx.fill();
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    });

    // Phase 4: 3700ms ~ 5000ms 漫天飄散翡翠餘燼火星
    if (elapsed >= 3700 && Math.random() < 0.45 && particles.length < 160) {
      particles.push({
        x: targetX + (Math.random() - 0.5) * 180,
        y: targetY + (Math.random() - 0.5) * 110,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2.2 - 1,
        radius: Math.random() * 5 + 2,
        color: Math.random() < 0.5 ? "#00ff00" : "#aaffaa",
        alpha: 0.9,
        decay: 0.015,
        gravity: -0.015,
        spark: true,
      });
    }

    if (elapsed < duration) {
      animId = requestAnimationFrame(render);
    } else {
      // 5 秒結束：清理動畫並解鎖所有按鍵
      if (animId) cancelAnimationFrame(animId);
      overlay.hidden = true;
      overlay.setAttribute("hidden", "");
      if (flashBg) flashBg.style.opacity = "0";
      if (targetEl) targetEl.classList.remove("card-under-mega-explosion");
      if (lockdownOverlay) {
        lockdownOverlay.hidden = true;
        lockdownOverlay.setAttribute("hidden", "");
      }
      if (onFinish) onFinish();
    }
  };

  animId = requestAnimationFrame(render);
}

// 將對手（電腦）的招式順序隨機洗牌打亂
function scrambleOpponentMoves() {
  opponentMovesScrambled = true;
  if (Array.isArray(opponentMoves) && opponentMoves.length > 1) {
    for (let i = opponentMoves.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opponentMoves[i], opponentMoves[j]] = [opponentMoves[j], opponentMoves[i]];
    }
  }
  renderOpponentMoves();
}

function startBattleSession() {
  clearAllBattleEffects(); // 重新開始一局後所有視覺與干擾效果解除
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
  playerStackedCard = null;
  playerStackedHP = 0;
  playerStackedMaxHP = 0;
  opponentStackedCard = null;
  opponentStackedHP = 0;
  opponentStackedMaxHP = 0;
  starter = "player";
  currentTurn = "player";
  playerStatus = { defense: 0, damageHalf: false, stunned: false };
  opponentStatus = { defense: 0, damageHalf: false, stunned: false };
  playerCardDamageMult = 1;
  opponentCardDamageMult = 1;
  playerGlobalDamageMult = 1;
  opponentGlobalDamageMult = 1;
  playerGeilaoApproached = false;
  opponentGeilaoApproached = false;

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
    clearAllBattleEffects(); // 發牌開始新局時清除所有殘留干擾效果
    // 洗牌並將所有卡牌盡可能發完；若卡牌數量為奇數，隨機選一張不發，剩下平分給雙方
    const pool = cards.map((c) => JSON.parse(JSON.stringify(c))).sort(() => Math.random() - 0.5);
    let discardedCardName = "";
    if (pool.length % 2 !== 0 && pool.length > 0) {
      const removed = pool.pop(); // 奇數時選一張不發
      discardedCardName = removed.name;
    }

    const half = Math.floor(pool.length / 2);
    playerHandCards = pool.slice(0, half);
    opponentHandCards = pool.slice(half);

    drawButton.textContent = "已發牌";
    drawButton.disabled = true;
    renderHand();
    renderOpponentHand();
    updateDeckCounts();

    // 如果雙方場上皆無牌，提示玩家出牌
    if (!activePlayerCard) {
      const discardNotice = discardedCardName ? `（牌庫總數為奇數，【${discardedCardName}】本局輪空不發）` : "";
      updateTurnBadge(`所有卡牌已全數發完（雙方手牌各 ${half} 張${discardNotice}），請點選下方卡牌上場！`);
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
  playerCardDamageMult = 1;
  playerGeilaoApproached = false;

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
  opponentCardDamageMult = 1;
  opponentGeilaoApproached = false;

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

  updateBattleCardsVisual();
}

// 建立雙卡疊牌時的完整技能清單（同時提供前排與底層兩張卡牌的所有技能）
function createStackedBattleMoves(cardA, cardB) {
  const getShortName = (card) => {
    if (!card || !card.name) return "卡牌";
    if (card.name.includes("Driver") || card.name.includes("八塊腹肌")) return "團長";
    if (card.name.includes("林走狗") || card.name.includes("陳豆豆")) return "走狗";
    if (card.name.includes("雷切")) return "雷切";
    if (card.name.includes("給佬") || card.name.includes("姜敦硯")) return "姜敦硯";
    return card.name.slice(0, 3);
  };

  const nameA = getShortName(cardA);
  const nameB = getShortName(cardB);

  const movesA = createBattleMoves(cardA).map((m) => ({
    ...m,
    ownerCard: cardA,
    ownerLabel: nameA,
  }));

  const movesB = createBattleMoves(cardB).map((m) => ({
    ...m,
    ownerCard: cardB,
    ownerLabel: nameB,
  }));

  return [...movesA, ...movesB];
}

// 我方疊牌切換前排主位與底層位置
function swapPlayerStack() {
  if (!playerStackedCard || !activePlayerCard) return;
  const tempCard = activePlayerCard;
  const tempHP = playerHP;
  const tempMaxHP = playerMaxHP;

  activePlayerCard = playerStackedCard;
  playerHP = playerStackedHP;
  playerMaxHP = playerStackedMaxHP;

  playerStackedCard = tempCard;
  playerStackedHP = tempHP;
  playerStackedMaxHP = tempMaxHP;

  playerMoves = createStackedBattleMoves(activePlayerCard, playerStackedCard);

  updateBattleCardsVisual();
  renderMoves();
  triggerScreenShake();
  updateTurnBadge(`🔄 疊牌主從切換！現在由【${activePlayerCard.name}】居於前排，【${playerStackedCard.name}】處於底層！`);
}

// 更新場上疊牌視覺（雙卡標籤、雙卡血量與雙卡名稱資訊）
function updateBattleCardsVisual() {
  // 我方戰鬥牌面板
  const cardPanelEl = document.querySelector("#cardPanel");
  if (cardPanelEl && activePlayerCard) {
    let stackBadge = document.querySelector("#playerStackBadge");
    if (playerStackedCard) {
      cardPanelEl.classList.add("stacked-card-active");
      if (!stackBadge) {
        stackBadge = document.createElement("div");
        stackBadge.id = "playerStackBadge";
        stackBadge.className = "stacked-card-badge";
        const titleRow = cardPanelEl.querySelector(".card-title-row");
        if (titleRow) cardPanelEl.insertBefore(stackBadge, titleRow);
        else cardPanelEl.prepend(stackBadge);
      }
      stackBadge.innerHTML = `
        <span class="stack-badge-title">🥞 雙卡疊牌出戰中</span>
        <span class="stack-badge-info">[底層: ${playerStackedCard.name} (HP ${playerStackedHP})]</span>
        <button type="button" class="stack-swap-btn" id="swapPlayerStackBtn">🔄 切換主位</button>
      `;
      const swapBtn = stackBadge.querySelector("#swapPlayerStackBtn");
      if (swapBtn) {
        swapBtn.onclick = (e) => {
          e.stopPropagation();
          swapPlayerStack();
        };
      }
    } else {
      cardPanelEl.classList.remove("stacked-card-active");
      if (stackBadge) stackBadge.remove();
    }

    const nameEl = document.querySelector("#cardName");
    if (nameEl) {
      nameEl.textContent = playerStackedCard ? `${activePlayerCard.name} ⚡ ${playerStackedCard.name}` : activePlayerCard.name;
    }
    const hpEl = document.querySelector("#cardHealth");
    if (hpEl) {
      hpEl.textContent = playerStackedCard ? `${playerHP} (+${playerStackedHP} 疊牌)` : playerHP;
    }
    const passiveEl = document.querySelector("#cardPassive");
    if (passiveEl) {
      passiveEl.textContent = playerStackedCard
        ? `【主位】${activePlayerCard.passive || ""} ｜【疊牌支援】${playerStackedCard.passive || ""}`
        : (activePlayerCard.passive || "");
    }
  }

  // 對手戰鬥牌面板
  const oppCardPanelEl = document.querySelector("#opponentCardPanel");
  if (oppCardPanelEl && opponentActiveCard) {
    let oppStackBadge = document.querySelector("#oppStackBadge");
    if (opponentStackedCard) {
      oppCardPanelEl.classList.add("stacked-card-active");
      if (!oppStackBadge) {
        oppStackBadge = document.createElement("div");
        oppStackBadge.id = "oppStackBadge";
        oppStackBadge.className = "stacked-card-badge";
        const oppTitleRow = oppCardPanelEl.querySelector(".card-title-row");
        if (oppTitleRow) oppCardPanelEl.insertBefore(oppStackBadge, oppTitleRow);
        else oppCardPanelEl.prepend(oppStackBadge);
      }
      oppStackBadge.innerHTML = `
        <span class="stack-badge-title">🥞 對手雙卡疊牌出戰</span>
        <span class="stack-badge-info">[底層: ${opponentStackedCard.name} (HP ${opponentStackedHP})]</span>
      `;
    } else {
      oppCardPanelEl.classList.remove("stacked-card-active");
      if (oppStackBadge) oppStackBadge.remove();
    }

    const oppNameEl = document.querySelector("#opponentCardName");
    if (oppNameEl) {
      oppNameEl.textContent = opponentStackedCard ? `${opponentActiveCard.name} ⚡ ${opponentStackedCard.name}` : opponentActiveCard.name;
    }
    const oppHpEl = document.querySelector("#opponentHealth");
    if (oppHpEl) {
      oppHpEl.textContent = opponentStackedCard ? `${opponentHP} (+${opponentStackedHP} 疊牌)` : opponentHP;
    }
    const oppPassiveEl = document.querySelector("#opponentPassive");
    if (oppPassiveEl) {
      oppPassiveEl.textContent = opponentStackedCard
        ? `【主位】${opponentActiveCard.passive || ""} ｜【疊牌支援】${opponentStackedCard.passive || ""}`
        : (opponentActiveCard.passive || "");
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
    if (playerCardDamageMult < 1) buffs.push(`⚠️ 傷害降至 ${(playerCardDamageMult * 100).toFixed(0)}%`);
    if (playerGlobalDamageMult < 1) buffs.push("🌌 領域壓制(傷害1/4)");
    if (isNoiseActive) buffs.push("📺 雜訊干擾");
    if (playerStatus.stunned) buffs.push("被封鎖行動");
    playerBuffTag.textContent = buffs.join(" | ");
  }

  if (opponentBuffTag) {
    const buffs = [];
    if (opponentStatus.defense > 0) buffs.push(`護甲 +${opponentStatus.defense}`);
    if (opponentStatus.damageHalf) buffs.push("⚠️ 下次傷害減半");
    if (opponentCardDamageMult < 1) buffs.push(`⚠️ 傷害降至 ${(opponentCardDamageMult * 100).toFixed(0)}%`);
    if (opponentGlobalDamageMult < 1) buffs.push("🌌 領域壓制(傷害1/4)");
    if (isNoiseActive) buffs.push("📺 雜訊干擾");
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

  const isPlayerGeilao = activePlayerCard && (activePlayerCard.name.includes("給佬") || activePlayerCard.name.includes("姜敦硯"));

  playerMoves.forEach((move) => {
    const button = document.createElement("button");
    button.className = "move-button";
    button.type = "button";

    const isM1 = move.key === "M1" || move.key === "M1招" || (move.name && move.name.includes("靠近"));
    const isGeilaoLocked = isPlayerGeilao && !playerGeilaoApproached && !isM1;
    const isSurvivalLocked = !isM1 && move.unlockRemaining > 0;

    let lockTag = "";
    if (isSurvivalLocked && isGeilaoLocked) {
      lockTag = ` <span class="lock-tag">🔒 需先出 M1（且在場存活剩餘 ${move.unlockRemaining} 局）</span>`;
    } else if (isSurvivalLocked) {
      lockTag = ` <span class="lock-tag">🔒 存活剩餘 ${move.unlockRemaining} 局解鎖</span>`;
    } else if (isGeilaoLocked) {
      lockTag = ` <span class="lock-tag">🔒 需先出 M1「靠近對方」</span>`;
    } else if (move.cooldownRemaining > 0) {
      lockTag = ` <span class="cd-tag">⏳ CD: ${move.cooldownRemaining} 回合</span>`;
    }

    let ownerPrefix = "";
    if (playerStackedCard && move.ownerLabel) {
      const isDriver = move.ownerLabel.includes("團長");
      const badgeCls = isDriver ? "owner-driver" : "owner-lin";
      ownerPrefix = `<span class="move-owner-badge ${badgeCls}">[${move.ownerLabel}]</span>`;
    }

    button.innerHTML = `<span>${ownerPrefix}${move.key}：${move.name}${lockTag}</span><span class="move-energy">${formatMoveMeta(move, move.ownerCard || activePlayerCard)}</span>`;

    const lockRemaining = isM1 ? 0 : Math.max(move.cooldownRemaining, move.unlockRemaining);

    if (gameOver || playerHP <= 0 || currentTurn !== "player" || lockRemaining > 0 || isGeilaoLocked) {
      button.classList.add("cooling");
      button.disabled = true;
      if (isGeilaoLocked || isSurvivalLocked) {
        button.style.setProperty("--cooldown-left", "100%");
      } else if (move.cooldownRemaining > 0) {
        button.style.setProperty("--cooldown-left", `${getMoveLockPercent(move)}%`);
      } else {
        button.style.setProperty("--cooldown-left", "100%");
      }
    } else {
      button.addEventListener("click", () => useMove(move));
    }

    moveList.appendChild(button);
  });

  // 檢查是否所有招式都在冷卻或未解鎖中：若無招可出，自動進入防守蓄力並切換回合，避免介面卡死
  const hasAvailableMove = playerMoves.some((move) => {
    const isM1 = move.key === "M1" || move.key === "M1招" || (move.name && move.name.includes("靠近"));
    const isGeilaoLocked = isPlayerGeilao && !playerGeilaoApproached && !isM1;
    const lockRemaining = isM1 ? 0 : Math.max(move.cooldownRemaining, move.unlockRemaining);
    return !lockRemaining && !isGeilaoLocked;
  });

  if (!hasAvailableMove && !gameOver && playerHP > 0 && currentTurn === "player") {
    updateTurnBadge("⏳ 所有招式正在冷卻中！本回合進入蓄力防守狀態，準備交給對手回合...");
    setTimeout(() => {
      if (!gameOver && currentTurn === "player") {
        if (starter === "opponent") decrementCooldowns();
        currentTurn = "opponent";
        updateTurnBadge("我方招式冷卻蓄力中，換對手回合！");
        renderMoves();
        renderOpponentMoves();
        setTimeout(opponentTurn, 1000);
      }
    }, 1200);
  }

  if (playerGlitchTurns > 0) {
    applyGlitchEffectToTarget("player", playerGlitchTurns);
  }
}

function renderOpponentMoves() {
  const opponentMoveList = document.querySelector("#opponentMoveList");
  if (!opponentMoveList || !opponentActiveCard) return;

  opponentMoveList.innerHTML = "";

  const isOppGeilao = opponentActiveCard && (opponentActiveCard.name.includes("給佬") || opponentActiveCard.name.includes("姜敦硯"));

  opponentMoves.forEach((move) => {
    const item = document.createElement("div");
    item.className = "move-button library-move";

    const isM1 = move.key === "M1" || move.key === "M1招" || (move.name && move.name.includes("靠近"));
    const isGeilaoLocked = isOppGeilao && !opponentGeilaoApproached && !isM1;
    const isSurvivalLocked = !isM1 && move.unlockRemaining > 0;

    let lockTag = "";
    if (isSurvivalLocked && isGeilaoLocked) {
      lockTag = ` <span class="lock-tag">🔒 需先出 M1（且在場存活剩餘 ${move.unlockRemaining} 局）</span>`;
    } else if (isSurvivalLocked) {
      lockTag = ` <span class="lock-tag">🔒 存活剩餘 ${move.unlockRemaining} 局解鎖</span>`;
    } else if (isGeilaoLocked) {
      lockTag = ` <span class="lock-tag">🔒 需先出 M1「靠近對方」</span>`;
    } else if (move.cooldownRemaining > 0) {
      lockTag = ` <span class="cd-tag">⏳ CD: ${move.cooldownRemaining} 回合</span>`;
    }

    let ownerPrefix = "";
    if (opponentStackedCard && move.ownerLabel) {
      const isDriver = move.ownerLabel.includes("團長");
      const badgeCls = isDriver ? "owner-driver" : "owner-lin";
      ownerPrefix = `<span class="move-owner-badge ${badgeCls}">[${move.ownerLabel}]</span>`;
    }

    item.innerHTML = `<span>${ownerPrefix}${move.key}：${move.name}${lockTag}</span><span class="move-energy">${formatMoveMeta(move, move.ownerCard || opponentActiveCard)}</span>`;

    const lockRemaining = isM1 ? 0 : Math.max(move.cooldownRemaining, move.unlockRemaining);
    if (lockRemaining > 0 || isGeilaoLocked) {
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

  const isM1Move = selectedMove.key === "M1" || selectedMove.key === "M1招" || (selectedMove.name && selectedMove.name.includes("靠近"));

  // 檢查招式是否尚未解鎖（開局或存活局數限制，M1 絕不鎖定）
  if (!isM1Move && selectedMove.unlockRemaining > 0) {
    updateTurnBadge(`🔒 該招式尚未解鎖！還需存活 ${selectedMove.unlockRemaining} 局才能發動！`);
    return;
  }

  // 給佬®+姜敦硯 必須先使用 M1 靠近對方
  const isPlayerGeilaoCheck = activePlayerCard && (activePlayerCard.name.includes("給佬") || activePlayerCard.name.includes("姜敦硯"));
  if (isPlayerGeilaoCheck && !playerGeilaoApproached && !isM1Move) {
    updateTurnBadge("🔒 請先使用 M1【靠近對方】解鎖全套連招！");
    return;
  }

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

  if (hasUltimateKeyword(selectedMove)) {
    triggerUltimateShoutout(selectedMove.name, () => {
      executePlayerMove(selectedMove);
    });
  } else {
    executePlayerMove(selectedMove);
  }
}

function executePlayerMove(selectedMove) {
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
    scrambleOpponentMoves(); // 對方是電腦，將他招式的排列打亂！
    if (activePlayerCard.hasEnergyMeter) {
      addEnergy(selectedMove.energy || 10);
      if (energy >= 100) {
        energy = 0;
        if (energyFill) energyFill.style.width = "0%";
        if (energyValue) energyValue.textContent = "0%";
        playRaicheUltimateCutscene(() => {
          const targetCardEl = document.querySelector("#opponentCardPanel");
          playMegaGreenExplosion(targetCardEl, () => {
            updateTurnBadge('💥【雷切小弟弟】終極奧義核爆！【領域展開，超究極冥王拔不出來術登登登dua郎之炮】！全場灰飛煙滅！');
            applyDamage("opponent", 999999999, playerStatus, opponentStatus);
            selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 1;
            selectedMove.justUsed = true;
            if (starter === "opponent") decrementCooldowns();
            if (opponentHP <= 0) {
              handleOpponentCardDefeated();
              return;
            }
            currentTurn = "opponent";
            renderMoves();
            renderOpponentMoves();
            setTimeout(opponentTurn, 1000);
          });
        });
        return;
      }
    }
    selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 1;
    selectedMove.justUsed = true; // 正在進行的回合出招，當輪結束不計入冷卻完成
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
  const isPlayerHuang = (activePlayerCard && activePlayerCard.name.includes("黃楷程")) ||
    (playerStackedCard && playerStackedCard.name.includes("黃楷程"));
  if (isPlayerHuang) {
    if (selectedMove.key === "Z" || selectedMove.key === "Z招" || selectedMove.name === "切換腳切") {
      const kickMatch = (selectedMove.specialMechanic && selectedMove.specialMechanic.match(/腳切傷害\s*(\d+)/)) || [null, "5000"];
      const kickDamage = kickMatch[1] || "5000";
      const m1Move = playerMoves.find((m) => m.key === "M1");
      if (m1Move) {
        m1Move.name = "腳切";
        m1Move.damage = kickDamage;
      }
      selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 2;
      selectedMove.justUsed = true;
      updateTurnBadge(`🥋【黃楷程】切換為「腳切」姿態！M1 傷害提升至 ${kickDamage}！`);
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
          const cardRef = (activePlayerCard && activePlayerCard.name.includes("黃楷程")) ? activePlayerCard : playerStackedCard;
          const origM1 = (cardRef && cardRef.moves && cardRef.moves.find((m) => m.key === "M1")) || { damage: "10000" };
          m1.name = "雷切";
          m1.damage = origM1.damage || "10000";
          renderMoves();
        }
      }, 0);
    }
  }

  // 計算傷害與特殊效果
  let damage = parseDamageValue(selectedMove.damage);

  // 陳豆豆招式機制：50% 黑閃 (x1.5) + 八塊腹肌Driver團團長「屌切」傷害 (+500)
  const isChenDouDouSkill = (activePlayerCard && activePlayerCard.name && activePlayerCard.name.includes("陳豆豆")) ||
    (selectedMove.specialMechanic && selectedMove.specialMechanic.includes("黑閃"));

  if (isChenDouDouSkill && (selectedMove.name.includes("黑閃") || selectedMove.name.includes("發怒") || (selectedMove.specialMechanic && selectedMove.specialMechanic.includes("黑閃")))) {
    const isBlackFlash = Math.random() < 0.5;
    const baseDmg = parseDamageValue(selectedMove.damage) || 6000;
    const driverCutDmg = 500; // 八塊腹肌Driver團團長屌切傷害

    if (isBlackFlash) {
      const flashDmg = Math.floor(baseDmg * 1.5);
      damage = flashDmg + driverCutDmg;
      triggerScreenShake();
      updateTurnBadge(`⚡🖤【陳豆豆】狂暴大叫「干！」觸發 50% 黑閃暴擊（傷害 x1.5 = ${flashDmg}）！召喚八塊腹肌Driver團長衝出屌切(+${driverCutDmg})！共造成 ${damage} 點毀滅傷害！`);
    } else {
      damage = baseDmg + driverCutDmg;
      triggerScreenShake();
      updateTurnBadge(`🔥【陳豆豆】狂暴大叫「干！」召喚八塊腹肌Driver團長衝出補上屌切(+${driverCutDmg})！共造成 ${damage} 點重擊！`);
    }
  }

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

  // 給佬®+姜敦硯 特殊招式機制 (玩家施展)
  const isPlayerGeilao = activePlayerCard && (activePlayerCard.name.includes("給佬") || activePlayerCard.name.includes("姜敦硯"));

  if (isPlayerGeilao) {
    if (selectedMove.key === "M1" || selectedMove.name === "靠近對方") {
      playerGeilaoApproached = true;
      updateTurnBadge("🏃‍♂️【給佬®+姜敦硯】成功靠近對方！全套掰開連招正式解鎖！");
    } else if (selectedMove.key === "Z" || (selectedMove.specialMechanic && selectedMove.specialMechanic.includes("傷害永久減半"))) {
      opponentCardDamageMult *= 0.5;
      triggerScreenShake();
      updateTurnBadge(`🥋【給佬®+姜敦硯】衝上前掰開！造成 ${damage} 傷害！對手當前戰鬥牌傷害永久減半（現為 ${(opponentCardDamageMult * 100).toFixed(0)}%）！`);
    } else if (selectedMove.key === "X" || (selectedMove.specialMechanic && (selectedMove.specialMechanic.includes("/3") || selectedMove.specialMechanic.includes("再次")))) {
      opponentCardDamageMult *= (1 / 3);
      triggerScreenShake();
      updateTurnBadge(`👐【給佬®+姜敦硯】塗滿雙手精X掰開對手的頭！造成 ${damage} 傷害！對手當前牌傷害再次除以 3（現為 ${(opponentCardDamageMult * 100).toFixed(0)}%）！`);
    } else if (selectedMove.key === "C" || (selectedMove.specialMechanic && selectedMove.specialMechanic.includes("雜訊"))) {
      isNoiseActive = true;
      // 任何視覺效果只賦予對方（對手側），我方畫面絕不加全螢幕雜訊
      const oppPanel = document.querySelector("#opponentCardPanel");
      if (oppPanel) oppPanel.classList.add("card-noise-interference");
      const oppList = document.querySelector("#opponentMoveList");
      if (oppList) oppList.classList.add("card-noise-interference");
      // 如果對方是電腦，則將他招式的排列打亂！
      scrambleOpponentMoves();
      triggerScreenShake();
      updateTurnBadge(`🔊【給佬®+姜敦硯】把你耳朵掰開塞Dixx進去！造成 ${damage} 傷害！對手（電腦）受到強烈雜訊干擾，招式排列被徹底打亂！`);
    } else if (selectedMove.key === "V" || selectedMove.name.includes("自己掰開")) {
      opponentGlobalDamageMult = 0.25;
      triggerScreenShake();
      updateTurnBadge(`🌌【給佬®+姜敦硯】領域展開，自己掰開！造成 ${damage} 毀滅傷害！對手以後不管換任何牌，打出的攻擊傷害永久降為 1/4！`);
    } else if (selectedMove.key === "F" || (selectedMove.specialMechanic && selectedMove.specialMechanic.includes("回復血量2000"))) {
      const healAmount = Math.min(2000, playerMaxHP - playerHP);
      playerHP += healAmount;
      const plyHPText = document.querySelector("#cardHealth");
      if (plyHPText) plyHPText.textContent = playerHP;
      updateTurnBadge(`🏃‍♂️【給佬®+姜敦硯】快速下樓梯逃跑，Driver團長掩護！回復了 ${healAmount} 點生命值！`);
    }
  }

  // 林走狗 特殊招式機制 (玩家施展)
  const isPlayerLin = (activePlayerCard && (activePlayerCard.name.includes("林走狗") || activePlayerCard.name.includes("陳豆豆"))) ||
    (playerStackedCard && (playerStackedCard.name.includes("林走狗") || playerStackedCard.name.includes("陳豆豆")));
  if (isPlayerLin || (selectedMove.specialMechanic && (selectedMove.specialMechanic.includes("姜敦硯必殺") || selectedMove.specialMechanic.includes("Driver團長")))) {
    if (selectedMove.name === "反掰開" || (selectedMove.specialMechanic && selectedMove.specialMechanic.includes("姜敦硯必殺"))) {
      const isOppGeilao = (opponentActiveCard && (opponentActiveCard.name.includes("給佬") || opponentActiveCard.name.includes("姜敦硯"))) ||
        (opponentStackedCard && (opponentStackedCard.name.includes("給佬") || opponentStackedCard.name.includes("姜敦硯")));
      if (isOppGeilao) {
        damage = 999999999999999;
        triggerScreenShake();
        updateTurnBadge("🐕💥【林走狗】施展【反掰開】！對手正是姜敦硯！觸發特攻絕對必殺！直接將姜敦硯瞬間抹殺！");
      } else {
        updateTurnBadge(`🐕【林走狗】施展【反掰開】！造成 ${damage} 傷害！（對手不是姜敦硯，未觸發必殺）`);
      }
    } else if (selectedMove.name === "召喚團長" || (selectedMove.specialMechanic && selectedMove.specialMechanic.includes("Driver團長"))) {
      if (playerStackedCard) {
        updateTurnBadge("🐕💪🥞【林走狗】大聲吠叫！八塊腹肌Driver團長已在場疊牌共鬥！造成 500 傷害！");
      } else {
        // 1. 若備戰區存在 Driver 團長，將其移出
        const oppDriverIdx = opponentHandCards.findIndex((c) => c.name && (c.name.includes("Driver") || c.name.includes("八塊腹肌")));
        if (oppDriverIdx !== -1) {
          opponentHandCards.splice(oppDriverIdx, 1);
        }
        const myDriverIdx = playerHandCards.findIndex((c) => c.name && (c.name.includes("Driver") || c.name.includes("八塊腹肌")));
        if (myDriverIdx !== -1) {
          playerHandCards.splice(myDriverIdx, 1);
        }

        // 2. 若敵方場上戰鬥牌正是 Driver 團長，直接強行奪取至我方！
        if (opponentActiveCard && (opponentActiveCard.name.includes("Driver") || opponentActiveCard.name.includes("八塊腹肌"))) {
          opponentActiveCard = null;
          if (opponentHandCards.length > 0) {
            playOpponentNextCard();
          } else {
            const opponentCardPanel = document.querySelector("#opponentCardPanel");
            const opponentEmptyFieldSlot = document.querySelector("#opponentEmptyFieldSlot");
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

        // 3. 取得 Driver 團長卡牌模板並實例化
        const driverDef = defaultCards.find((c) => c.name && (c.name.includes("Driver") || c.name.includes("八塊腹肌"))) ||
          cards.find((c) => c.name && (c.name.includes("Driver") || c.name.includes("八塊腹肌")));
        if (driverDef) {
          const summonedDriver = JSON.parse(JSON.stringify(driverDef));
          summonedDriver.health = String(summonedDriver.health || "19999");

          // 4. 疊牌！林走狗不退回備戰區，雙卡同時留在戰鬥牌區共鬥！
          const baseLinCard = activePlayerCard;
          baseLinCard.health = String(playerHP);
          playerStackedCard = baseLinCard;
          playerStackedHP = playerHP;
          playerStackedMaxHP = playerMaxHP;

          // 5. 將 Driver 團長空降疊牌至頂層（出戰位，血量 19999）
          activePlayerCard = summonedDriver;
          const healthStr = String(summonedDriver.health || "19999").replace(/,/g, "");
          playerMaxHP = parseInt(healthStr) || 19999;
          playerHP = playerMaxHP;
          playerStatus = { defense: 0, damageHalf: false, stunned: false };
          playerCardDamageMult = 1;
          playerGeilaoApproached = false;

          // 雙卡合體共鬥招式清單（同時提供團長所有技能與林走狗所有技能！）
          playerMoves = createStackedBattleMoves(activePlayerCard, playerStackedCard);

          updateBattleCardsVisual();
          renderHand();
          renderOpponentHand();
          renderMoves();
          updateDeckCounts();
          triggerScreenShake();
          updateTurnBadge("🐕💪🥞【林走狗】大聲吠叫召喚！八塊腹肌Driver團團長（血量 19999）直接空降疊牌！雙卡同時在戰鬥牌區共鬥！造成 500 傷害！");
        }
      }
    }
  }

  // 判斷是否為「切換人格騙術色誘」或「往你嘴裡塞迪克」招式（對手停止發招一局，施招者連續出招）
  const isCharm = selectedMove.name === "切換人格騙術色誘" ||
    selectedMove.name === "往你嘴裡塞迪克" ||
    (selectedMove.specialMechanic && (selectedMove.specialMechanic.includes("停止") || selectedMove.specialMechanic.includes("色誘")));

  if (isCharm) {
    applyDamage("opponent", damage, playerStatus, opponentStatus);
    selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 1;
    selectedMove.justUsed = true;
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

    currentTurn = "player";
    if (selectedMove.name === "往你嘴裡塞迪克") {
      updateTurnBadge("🐕🌭【林走狗】往對手嘴裡塞迪克！造成 500 傷害！對手被塞滿無法出招一局，我方連續出招！");
    } else {
      updateTurnBadge("💖【Driver團長】騙術色誘成功！對手停止發招一局，我方連續出招！");
    }
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
      energy = 0;
      if (energyFill) energyFill.style.width = "0%";
      if (energyValue) energyValue.textContent = "0%";
      playRaicheUltimateCutscene(() => {
        const targetCardEl = document.querySelector("#opponentCardPanel");
        playMegaGreenExplosion(targetCardEl, () => {
          updateTurnBadge('💥【雷切小弟弟】終極奧義核爆！【領域展開，超究極冥王拔不出來術登登登dua郎之炮】！全場灰飛煙滅！');
          applyDamage("opponent", 999999999, playerStatus, opponentStatus);
          selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 0;
          selectedMove.justUsed = true;
          if (starter === "opponent") decrementCooldowns();
          if (opponentHP <= 0) {
            handleOpponentCardDefeated();
            return;
          }
          currentTurn = "opponent";
          renderMoves();
          renderOpponentMoves();
          setTimeout(opponentTurn, 1000);
        });
      });
      return;
    }
  }

  selectedMove.cooldownRemaining = selectedMove.cooldown !== undefined ? selectedMove.cooldown : 0;
  selectedMove.justUsed = true; // 當前進行的回合剛出招，結束時不算一輪冷卻

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

  const isOppGeilao = opponentActiveCard && (opponentActiveCard.name.includes("給佬") || opponentActiveCard.name.includes("姜敦硯"));
  let availableMoves = opponentMoves.filter((m) => {
    const isM1 = m.key === "M1" || m.key === "M1招" || (m.name && m.name.includes("靠近"));
    if (isM1) return true;
    return m.cooldownRemaining === 0 && m.unlockRemaining === 0;
  });
  if (isOppGeilao && !opponentGeilaoApproached) {
    availableMoves = availableMoves.filter((m) => m.key === "M1" || m.key === "M1招" || (m.name && m.name.includes("靠近")));
  }

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
  if (opponentMovesScrambled || opponentGlitchTurns > 0) {
    // 招式排列被打亂且受到干擾干擾：電腦思考失常，無法以最優戰術出招，改為依被打亂後的順序隨機/首招出牌
    move = availableMoves[0] || availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } else if (opponentAi === "低") {
    move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } else if (opponentAi === "普通") {
    move = availableMoves.find((m) => parseDamageValue(m.damage) >= playerHP) || availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } else {
    move = availableMoves.find((m) => parseDamageValue(m.damage) >= playerHP);
    if (!move && opponentHP < opponentMaxHP * 0.4) {
      move = availableMoves.find((m) => m.name === "後撤步雷切" || m.name === "召喚八塊腹肌" || m.name === "快速下樓梯招，團長幫忙");
    }
    const isTargetGeilao = activePlayerCard && (activePlayerCard.name.includes("給佬") || activePlayerCard.name.includes("姜敦硯"));
    if (!move && isTargetGeilao) move = availableMoves.find((m) => m.name === "反掰開");
    if (!move) move = availableMoves.find((m) => m.name === "切換人格騙術色誘" || m.name === "往你嘴裡塞迪克");
    if (!move && opponentHandCards.length === 0) move = availableMoves.find((m) => m.name === "召喚團長");
    if (!move) move = availableMoves.sort((a, b) => parseDamageValue(b.damage) - parseDamageValue(a.damage))[0];
  }

  if (move) {
    if (hasUltimateKeyword(move)) {
      triggerUltimateShoutout(move.name, () => {
        executeOpponentMove(move);
      });
    } else {
      executeOpponentMove(move);
    }
  }
}

function executeOpponentMove(move) {
  if (move) {
    const isOppRaicheCard = opponentActiveCard && opponentActiveCard.name && opponentActiveCard.name.includes("雷切小弟弟");
    const isOppGeilao = opponentActiveCard && (opponentActiveCard.name.includes("給佬") || opponentActiveCard.name.includes("姜敦硯"));

    // 電腦使用雷切小弟弟 V招：領域展開（隨機抽 6 種領域）
    if (isOppRaicheCard && move.name && move.name.includes("領域展開")) {
      const domains = ["做死", "傳說對接", "視獄偽境", "真Dixx不斷", "迪克崩壞", "(Censored)"];
      const chosenDomain = domains[Math.floor(Math.random() * domains.length)];
      triggerScreenShake();
      updateTurnBadge(`🌌 對手【雷切小弟弟】展開領域【${chosenDomain}】！直接將我方瞬間湮滅！`);
      applyDamage("player", 999999999, opponentStatus, playerStatus);
      move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 2;
      move.justUsed = true;
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
        if (opponentEnergy >= 100) {
          opponentEnergy = 0;
          if (opponentEnergyFill) opponentEnergyFill.style.width = "0%";
          if (opponentEnergyValue) opponentEnergyValue.textContent = "0%";
          playRaicheUltimateCutscene(() => {
            const targetCardEl = document.querySelector("#cardPanel");
            playMegaGreenExplosion(targetCardEl, () => {
              updateTurnBadge('💥 對手【雷切小弟弟】終極奧義核爆！發動【領域展開，超究極冥王拔不出來術登登登dua郎之炮】！');
              applyDamage("player", 999999999, opponentStatus, playerStatus);
              move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 1;
              move.justUsed = true;
              if (starter === "player") decrementCooldowns();
              if (playerHP <= 0) {
                handlePlayerCardDefeated();
                return;
              }
              currentTurn = "player";
              renderMoves();
              renderOpponentMoves();
            });
          });
          return;
        }
      }
      move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 1;
      move.justUsed = true;
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
    const isOppHuang = (opponentActiveCard && opponentActiveCard.name.includes("黃楷程")) ||
      (opponentStackedCard && opponentStackedCard.name.includes("黃楷程"));
    if (isOppHuang) {
      if (move.key === "Z" || move.name === "切換腳切") {
        const kickMatch = (move.specialMechanic && move.specialMechanic.match(/腳切傷害\s*(\d+)/)) || [null, "5000"];
        const kickDamage = kickMatch[1] || "5000";
        const oppM1 = opponentMoves.find((m) => m.key === "M1");
        if (oppM1) {
          oppM1.name = "腳切";
          oppM1.damage = kickDamage;
        }
        move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 2;
        move.justUsed = true;
        updateTurnBadge(`🥋 對手【黃楷程】切換為「腳切」姿態！M1 傷害提升至 ${kickDamage}！`);
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
            const cardRef = (opponentActiveCard && opponentActiveCard.name.includes("黃楷程")) ? opponentActiveCard : opponentStackedCard;
            const origM1 = (cardRef && cardRef.moves && cardRef.moves.find((m) => m.key === "M1")) || { damage: "10000" };
            m1.name = "雷切";
            m1.damage = origM1.damage || "10000";
            renderOpponentMoves();
          }
        }, 0);
      }
    }

    let damage = parseDamageValue(move.damage);

    // 電腦陳豆豆招式機制：50% 黑閃 (x1.5) + 八塊腹肌Driver團團長「屌切」傷害 (+500)
    const isOppChenDouDouSkill = (opponentActiveCard && opponentActiveCard.name && opponentActiveCard.name.includes("陳豆豆")) ||
      (move.specialMechanic && move.specialMechanic.includes("黑閃"));

    if (isOppChenDouDouSkill && (move.name.includes("黑閃") || move.name.includes("發怒") || (move.specialMechanic && move.specialMechanic.includes("黑閃")))) {
      const isBlackFlash = Math.random() < 0.5;
      const baseDmg = parseDamageValue(move.damage) || 6000;
      const driverCutDmg = 500; // 八塊腹肌Driver團團長屌切傷害

      if (isBlackFlash) {
        const flashDmg = Math.floor(baseDmg * 1.5);
        damage = flashDmg + driverCutDmg;
        triggerScreenShake();
        updateTurnBadge(`⚡🖤 對手【陳豆豆】大叫「干！」觸發 50% 黑閃暴擊（傷害 x1.5 = ${flashDmg}）！召喚Driver團長衝出屌切(+${driverCutDmg})！造成 ${damage} 點毀滅傷害！`);
      } else {
        damage = baseDmg + driverCutDmg;
        triggerScreenShake();
        updateTurnBadge(`🔥 對手【陳豆豆】大叫「干！」召喚八塊腹肌Driver團長衝出補上屌切(+${driverCutDmg})！造成 ${damage} 點傷害！`);
      }
    }

    const isOppCharm = move.name === "切換人格騙術色誘" ||
      move.name === "往你嘴裡塞迪克" ||
      (move.specialMechanic && (move.specialMechanic.includes("停止") || move.specialMechanic.includes("色誘")));

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

    // 電腦為林走狗時的招式機制
    const isOppLin = (opponentActiveCard && (opponentActiveCard.name.includes("林走狗") || opponentActiveCard.name.includes("陳豆豆"))) ||
      (opponentStackedCard && (opponentStackedCard.name.includes("林走狗") || opponentStackedCard.name.includes("陳豆豆")));
    if (isOppLin || (move.specialMechanic && (move.specialMechanic.includes("姜敦硯必殺") || move.specialMechanic.includes("Driver團長")))) {
      if (move.name === "反掰開" || (move.specialMechanic && move.specialMechanic.includes("姜敦硯必殺"))) {
        const isTargetGeilao = (activePlayerCard && (activePlayerCard.name.includes("給佬") || activePlayerCard.name.includes("姜敦硯"))) ||
          (playerStackedCard && (playerStackedCard.name.includes("給佬") || playerStackedCard.name.includes("姜敦硯")));
        if (isTargetGeilao) {
          damage = 999999999999999;
          triggerScreenShake();
          updateTurnBadge("🐕💥 對手【林走狗】施展【反掰開】！我方正是姜敦硯！觸發特攻絕對必殺！直接將姜敦硯瞬間抹殺！");
        } else {
          updateTurnBadge(`🐕 對手【林走狗】施展【反掰開】！造成 ${damage} 傷害！（可惜我方不是姜敦硯，未觸發必殺）`);
        }
      } else if (move.name === "召喚團長" || (move.specialMechanic && move.specialMechanic.includes("Driver團長"))) {
        if (opponentStackedCard) {
          updateTurnBadge("🐕💪🥞 對手【林走狗】大聲吠叫！八塊腹肌Driver團長已在場疊牌共鬥！造成 500 傷害！");
        } else {
          // 1. 若備戰區存在 Driver 團長，移出
          const pDriverIdx = playerHandCards.findIndex((c) => c.name && (c.name.includes("Driver") || c.name.includes("八塊腹肌")));
          if (pDriverIdx !== -1) {
            playerHandCards.splice(pDriverIdx, 1);
          }
          const oppDriverIdx = opponentHandCards.findIndex((c) => c.name && (c.name.includes("Driver") || c.name.includes("八塊腹肌")));
          if (oppDriverIdx !== -1) {
            opponentHandCards.splice(oppDriverIdx, 1);
          }

          // 2. 若我方當前戰鬥牌正是 Driver 團長，直接被敵方搶走！
          if (activePlayerCard && (activePlayerCard.name.includes("Driver") || activePlayerCard.name.includes("八塊腹肌"))) {
            activePlayerCard = null;
            if (playerHandCards.length > 0) {
              deployCard(playerHandCards[0], 0);
            } else {
              const cardPanelEl = document.querySelector("#cardPanel");
              if (cardPanelEl) {
                cardPanelEl.hidden = true;
                cardPanelEl.setAttribute("hidden", "");
                cardPanelEl.style.display = "none";
              }
              if (emptyFieldSlot) {
                emptyFieldSlot.hidden = false;
                emptyFieldSlot.removeAttribute("hidden");
                emptyFieldSlot.style.display = "";
              }
            }
          }

          // 3. 取得 Driver 團長卡牌模板並實例化
          const driverDef = defaultCards.find((c) => c.name && (c.name.includes("Driver") || c.name.includes("八塊腹肌"))) ||
            cards.find((c) => c.name && (c.name.includes("Driver") || c.name.includes("八塊腹肌")));
          if (driverDef) {
            const summonedDriver = JSON.parse(JSON.stringify(driverDef));
            summonedDriver.health = String(summonedDriver.health || "19999");

            // 4. 疊牌！對手林走狗不退回備戰區，雙卡同時留在敵方戰鬥牌區共鬥！
            const baseOppLin = opponentActiveCard;
            baseOppLin.health = String(opponentHP);
            opponentStackedCard = baseOppLin;
            opponentStackedHP = opponentHP;
            opponentStackedMaxHP = opponentMaxHP;

            opponentActiveCard = summonedDriver;
            const oppHealthStr = String(summonedDriver.health || "19999").replace(/,/g, "");
            opponentMaxHP = parseInt(oppHealthStr) || 19999;
            opponentHP = opponentMaxHP;
            opponentStatus = { defense: 0, damageHalf: false, stunned: false };
            opponentCardDamageMult = 1;
            opponentGeilaoApproached = false;

            // 生成對手雙卡疊牌招式清單
            opponentMoves = createStackedBattleMoves(opponentActiveCard, opponentStackedCard);

            updateBattleCardsVisual();
            renderHand();
            renderOpponentHand();
            renderOpponentMoves();
            updateDeckCounts();
            updateFieldStatusTags();
            triggerScreenShake();
            updateTurnBadge("🐕💪🥞 對手【林走狗】大聲吠叫召喚！八塊腹肌Driver團團長（血量 19999）直接空降疊牌！雙卡同時在戰鬥牌區共鬥！造成 500 傷害！");
          }
        }
      }
    }

    // 電腦為給佬®+姜敦硯時的招式機制
    if (isOppGeilao) {
      if (move.key === "M1" || move.name === "靠近對方") {
        opponentGeilaoApproached = true;
        updateTurnBadge("🏃‍♂️ 對手【給佬®+姜敦硯】靠近我方！全套掰開連招正式解鎖！");
      } else if (move.key === "Z" || (move.specialMechanic && move.specialMechanic.includes("傷害永久減半"))) {
        playerCardDamageMult *= 0.5;
        triggerScreenShake();
        updateTurnBadge(`🥋 對手【給佬®+姜敦硯】衝上前掰開！造成 ${damage} 傷害！我方當前牌傷害永久減半（現為 ${(playerCardDamageMult * 100).toFixed(0)}%）！`);
      } else if (move.key === "X" || (move.specialMechanic && (move.specialMechanic.includes("/3") || move.specialMechanic.includes("再次")))) {
        playerCardDamageMult *= (1 / 3);
        triggerScreenShake();
        updateTurnBadge(`👐 對手【給佬®+姜敦硯】塗滿雙手精X掰開我方頭部！造成 ${damage} 傷害！我方當前牌傷害再次除以 3（現為 ${(playerCardDamageMult * 100).toFixed(0)}%）！`);
      } else if (move.key === "C" || (move.specialMechanic && move.specialMechanic.includes("雜訊"))) {
        isNoiseActive = true;
        document.body.classList.add("screen-noise-active");
        const pPanel = document.querySelector("#cardPanel");
        if (pPanel) pPanel.classList.add("card-noise-interference");
        triggerScreenShake();
        updateTurnBadge(`🔊 對手【給佬®+姜敦硯】把我方耳朵掰開塞Dixx進去！造成 ${damage} 傷害！螢幕陷入強烈雜訊干擾，直到該牌陣亡！`);
      } else if (move.key === "V" || move.name.includes("自己掰開")) {
        playerGlobalDamageMult = 0.25;
        triggerScreenShake();
        updateTurnBadge(`🌌 對手【給佬®+姜敦硯】領域展開，自己掰開！造成 ${damage} 毀滅傷害！我方往後任何牌的所有傷害永久變為 1/4！`);
      } else if (move.key === "F" || (move.specialMechanic && move.specialMechanic.includes("回復血量2000"))) {
        const oppHeal = Math.min(2000, opponentMaxHP - opponentHP);
        opponentHP += oppHeal;
        const oppHPText = document.querySelector("#opponentHealth");
        if (oppHPText) oppHPText.textContent = opponentHP;
        updateTurnBadge(`🏃‍♂️ 對手【給佬®+姜敦硯】快速下樓梯招，Driver團長掩護！回復了 ${oppHeal} 點生命值！`);
      }
    }

    applyDamage("player", damage, opponentStatus, playerStatus);

    // 電腦使用雷切小弟弟或噁心能量條機制
    const oppHasEnergy = opponentActiveCard && (opponentActiveCard.hasEnergyMeter || (move.specialMechanic && move.specialMechanic.includes("噁心能量條")));
    if (oppHasEnergy) {
      addOpponentEnergy(move.energy || 15);
      if (opponentEnergy >= 100) {
        opponentEnergy = 0;
        if (opponentEnergyFill) opponentEnergyFill.style.width = "0%";
        if (opponentEnergyValue) opponentEnergyValue.textContent = "0%";
        playRaicheUltimateCutscene(() => {
          const targetCardEl = document.querySelector("#cardPanel");
          playMegaGreenExplosion(targetCardEl, () => {
            updateTurnBadge('💥 對手【雷切小弟弟】終極奧義核爆！發動【領域展開，超究極冥王拔不出來術登登登dua郎之炮】！');
            applyDamage("player", 999999999, opponentStatus, playerStatus);
            move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 0;
            move.justUsed = true;
            if (starter === "player") decrementCooldowns();
            if (playerHP <= 0) {
              handlePlayerCardDefeated();
              return;
            }
            currentTurn = "player";
            renderMoves();
            renderOpponentMoves();
          });
        });
        return;
      }
    }

    move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 0;
    move.justUsed = true;
    updateFieldStatusTags();

    // 檢查玩家卡牌是否陣亡
    if (playerHP <= 0) {
      handlePlayerCardDefeated();
      return;
    }

    // 若電腦使用色誘或塞迪克，電腦自己也要發招（連續追擊），跳過玩家回合！
    if (isOppCharm) {
      if (opponentGlitchTurns > 0) {
        opponentGlitchTurns--;
        if (opponentGlitchTurns === 0) removeGlitchEffectFromTarget("opponent");
      }
      move.cooldownRemaining = move.cooldown !== undefined ? move.cooldown : 1;
      move.justUsed = true;
      decrementCooldowns();
      currentTurn = "opponent";
      if (move.name === "往你嘴裡塞迪克") {
        updateTurnBadge("🐕🌭 對手【林走狗】往我方嘴裡塞迪克！造成 500 傷害！我方被塞滿無法出招一局，對手連續追擊！");
      } else {
        updateTurnBadge("💖 對手【Driver團長】騙術色誘成功！我方停止發招一局，對手連續追擊！");
      }
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
  if (playerStackedCard) return; // 若戰鬥牌區仍有疊牌，絕不觸發全滅判定

  const cardPanelEl = document.querySelector("#cardPanel");
  if (cardPanelEl) cardPanelEl.classList.add("dead");

  // 若當前卡牌為姜敦硯，陣亡時解除對手的雜訊效果與被打亂狀態
  if (activePlayerCard && (activePlayerCard.name.includes("給佬") || activePlayerCard.name.includes("姜敦硯"))) {
    if (!opponentActiveCard || (!opponentActiveCard.name.includes("給佬") && !opponentActiveCard.name.includes("姜敦硯"))) {
      isNoiseActive = false;
      opponentMovesScrambled = false;
      document.body.classList.remove("screen-noise-active");
      const oppPanel = document.querySelector("#opponentCardPanel");
      if (oppPanel) oppPanel.classList.remove("card-noise-interference");
      if (cardPanelEl) cardPanelEl.classList.remove("card-noise-interference");
      const oppList = document.querySelector("#opponentMoveList");
      if (oppList) oppList.classList.remove("card-noise-interference");
      if (opponentActiveCard && Array.isArray(opponentActiveCard.moves)) {
        opponentMoves = JSON.parse(JSON.stringify(opponentActiveCard.moves));
        renderOpponentMoves();
      }
    }
  }

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
  if (opponentStackedCard) return; // 若對手戰鬥牌區仍有疊牌，絕不觸發陣亡換牌

  const opponentCardPanel = document.querySelector("#opponentCardPanel");
  if (opponentCardPanel) opponentCardPanel.classList.add("dead");

  // 若對手卡牌為姜敦硯，陣亡時解除我方的雜訊效果
  if (opponentActiveCard && (opponentActiveCard.name.includes("給佬") || opponentActiveCard.name.includes("姜敦硯"))) {
    if (!activePlayerCard || (!activePlayerCard.name.includes("給佬") && !activePlayerCard.name.includes("姜敦硯"))) {
      isNoiseActive = false;
      document.body.classList.remove("screen-noise-active");
      if (opponentCardPanel) opponentCardPanel.classList.remove("card-noise-interference");
      const pPanel = document.querySelector("#cardPanel");
      if (pPanel) pPanel.classList.remove("card-noise-interference");
      const pList = document.querySelector("#moveList");
      if (pList) pList.classList.remove("card-noise-interference");
    }
  }

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
    clearAllBattleEffects();
    startBattleSession();
  });
}

if (gameExitButton) {
  gameExitButton.addEventListener("click", () => {
    clearAllBattleEffects();
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

      const domainMove = pendingDomainMove;
      pendingDomainMove = null;

      triggerUltimateShoutout(`領域展開：${chosenDomain}`, () => {
        const targetCardEl = document.querySelector("#opponentCardPanel");
        playMegaGreenExplosion(targetCardEl, () => {
          updateTurnBadge(`🌌【雷切小弟弟】展開領域【${chosenDomain}】！時空湮滅，直接將對手瞬間抹殺！`);
          applyDamage("opponent", 999999999999999999, playerStatus, opponentStatus);

          domainMove.cooldownRemaining = domainMove.cooldown !== undefined ? domainMove.cooldown : 3;

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
  // G 招效果結束：徹底還原卡牌與招式的所有字元與排版，絕不殘留任何亂碼！
  restoreCardPanelDisplay(target);
  updateFieldDisplay();
}

function decrementCooldowns() {
  playerMoves.forEach((move) => {
    // 正在進行的回合結束不算一輪（剛出招的當輪結算不扣減）
    if (move.justUsed) {
      move.justUsed = false;
    } else if (move.cooldownRemaining > 0) {
      move.cooldownRemaining -= 1;
    }

    // 剛派上場的當輪結算不算一輪存活
    if (move.justDeployed) {
      move.justDeployed = false;
    } else if (move.unlockRemaining > 0) {
      move.unlockRemaining -= 1;
    }
  });

  opponentMoves.forEach((move) => {
    if (move.justUsed) {
      move.justUsed = false;
    } else if (move.cooldownRemaining > 0) {
      move.cooldownRemaining -= 1;
    }

    if (move.justDeployed) {
      move.justDeployed = false;
    } else if (move.unlockRemaining > 0) {
      move.unlockRemaining -= 1;
    }
  });
}

function parseDamageValue(damageStr) {
  if (damageStr === "無限") return 999999;
  if (damageStr.includes("999999")) return 999999;
  return parseInt(damageStr) || 0;
}

function applyDamage(target, amount, attackerStatus, defenderStatus) {
  let finalDamage = amount;

  // 姜敦硯機制：弱化倍率與全局領域壓制倍率
  if (target === "opponent") {
    // 玩家攻擊對手
    finalDamage = Math.floor(finalDamage * playerCardDamageMult * playerGlobalDamageMult);
  } else {
    // 對手攻擊玩家
    finalDamage = Math.floor(finalDamage * opponentCardDamageMult * opponentGlobalDamageMult);
  }

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
    if (opponentHP <= 0 && opponentStackedCard) {
      const fallenName = opponentActiveCard.name;
      opponentActiveCard = opponentStackedCard;
      opponentHP = opponentStackedHP;
      opponentMaxHP = opponentStackedMaxHP;
      opponentStackedCard = null;
      opponentStackedHP = 0;
      opponentMoves = createBattleMoves(opponentActiveCard);
      updateBattleCardsVisual();
      renderOpponentMoves();
      triggerScreenShake();
      updateTurnBadge(`💥 對手前排【${fallenName}】承受重創退場！底層【${opponentActiveCard.name}】（血量 ${opponentHP}）接續作戰！`);
    } else {
      updateBattleCardsVisual();
    }
    const oppHPText = document.querySelector("#opponentHealth");
    if (oppHPText) oppHPText.textContent = opponentStackedCard ? `${opponentHP} (+${opponentStackedHP} 疊牌)` : opponentHP;
    const oppDefText = document.querySelector("#opponentDefense");
    if (oppDefText) oppDefText.textContent = opponentStatus.defense;
  } else {
    playerHP = Math.max(0, playerHP - finalDamage);
    if (playerHP <= 0 && playerStackedCard) {
      const fallenName = activePlayerCard.name;
      activePlayerCard = playerStackedCard;
      playerHP = playerStackedHP;
      playerMaxHP = playerStackedMaxHP;
      playerStackedCard = null;
      playerStackedHP = 0;
      playerMoves = createBattleMoves(activePlayerCard);
      updateBattleCardsVisual();
      renderMoves();
      triggerScreenShake();
      updateTurnBadge(`💥 我方前排【${fallenName}】承受重創退場！底層【${activePlayerCard.name}】（血量 ${playerHP}）接續出戰！`);
    } else {
      updateBattleCardsVisual();
    }
    const plyHPText = document.querySelector("#cardHealth");
    if (plyHPText) plyHPText.textContent = playerStackedCard ? `${playerHP} (+${playerStackedHP} 疊牌)` : playerHP;
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
  const isGeilao = card && card.name && (card.name.includes("給佬") || card.name.includes("姜敦硯"));
  return card.moves.map((move) => {
    const isM1 = move.key === "M1" || move.key === "M1招" || (move.name && move.name.includes("靠近"));
    const isDomain = move.key === "V" || (move.name && move.name.includes("自己掰開"));
    let unlockTurns = move.unlockAfterTurns !== undefined ? move.unlockAfterTurns : 0;
    if (isGeilao) {
      if (isM1) {
        unlockTurns = 0;
      } else if (isDomain) {
        unlockTurns = 4;
      } else {
        unlockTurns = 0;
      }
    } else if (isM1) {
      unlockTurns = 0;
    }
    return {
      ...move,
      cooldownRemaining: 0,
      unlockRemaining: unlockTurns,
      justDeployed: unlockTurns > 0, // 標記剛上場，第一輪結算不計入已存活
      justUsed: false,
    };
  });
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
