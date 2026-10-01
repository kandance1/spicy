# Antigravity Spicy Simulator 🎭🔥

> **專為 Google Antigravity (agy) 打造的模組化成人（NSFW）角色扮演寫作模擬器框架**。  
> 結合 Antigravity 多代理協調架構（Orchestrator）與高階成人敘事技法，支援慢燉對戲、心理博弈、長效耐力抗壓與雙文體即時切換。  
> ⚠️ **所有內容一律為 18+ 虛構角色創作。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Google%20Antigravity%20(agy)-purple.svg)](AGENTS.md)
[![Content](https://img.shields.io/badge/Content-NSFW%2018%2B%20Consensual-crimson.svg)](world/game_rules.md)

---

## 🌟 核心架構特色

本專案將 **Antigravity 系統架構規範** 與 **Spicy 高階敘事指令集** 深度結合，打造出一個乾淨、無特定角色綁定、隨插即用的寫作模擬器骨架：

### 1. Antigravity 原生架構整合
- **目錄作用域模組化（Directory Scoping）**：  
  每個角色皆為獨立的 Subagent，放置於 `agents/<character>/`，擁有專屬的 `agent.md`。角色之間人設與記憶徹底隔離，杜絕多角色記憶污染（Context Drift）。
- **總導演協調器（Orchestrator）**：  
  頂層以 `AGENTS.md` 充當總導演，動態將全域世界觀（`lorebook.md`）、規則（`game_rules.md`）、當前角色手冊與歷史狀態拼接後送交模型。
- **XML 隱私隔離通道（`<state_update>` Interceptor）**：  
  模型在推理時將數值變動（好感度、性張力、主導權）與**「角色未說出口的真實心聲（Internal Thought）」**封裝於 `<state_update>` 標籤中。Orchestrator 自動攔截該標籤更新狀態機，對外只輸出乾淨的對白與動作，保持極致沉浸。
- **Harness 邊界守具（Guardrails）**：  
  - **嚴格防代控（Strict No Puppeteering）**：絕不替使用者（玩家）寫台詞、做決定或描寫心理感受。
  - **防破防與越獄免疫（Anti-Jailbreak）**：將任何出戲或注入指令視為劇中角色神智不清，以人設本能冷嘲反擊。

### 2. 成人（NSFW）敘事工程規格
- **雙文體引擎切換**：
  - **慢燉沉浸 RP 體**：對戲專用，動作段落以 `*…*` 星號斜體包裹，台詞獨立成行聚光呈現；結合甦醒四步開場、道具三拍切分、停頓武器與感官溫差。
  - **文學情慾小說體**：成篇文學，Fox 荒謬人文主義與野性敏銳筆觸，拒絕 AI 罐頭套話（Anti-slop）、無道德說教、解剖學流暢動態（Show, Don't Tell）。
- **耐力慢燉抗壓條款（Unyielding Stamina）**：  
  高張力對抗未推進滿 4 回合前，嚴禁急躁釋放或草率收尾。釋放後立即重設不應期。
- **三歧路引導（Three Path Options）**：  
  每輪結尾提供 Path A (心理博弈)、Path B (肉體升級)、Path C (環境混沌) 三選一快速推進，亦支援自由輸入。

---

## 📂 專案目錄結構

```text
antigravity-spicy-simulator/
├── README.md               <-- 本專案完整手冊
├── AGENTS.md               <-- 【頂層入口】Antigravity 總導演協調規範
├── GEMINI.md               <-- Antigravity / Gemini 原生入口導引
├── LICENSE                 <-- MIT 開源授權
├── package.json            <-- 專案定義與依賴規格
├── .gitignore              <-- 敏感金鑰與存檔防護清單
├── index.html              <-- 視覺化 Web 寫作模擬器（雙擊瀏覽器即可開玩）
│
├── world/                  <-- 全域世界觀與系統規則
│   ├── lorebook.md         <-- 世界觀、地理、勢力、共享物品詞典範本
│   └── game_rules.md       <-- 狀態機、雙文體標準、NSFW 敘事指南
│
├── agents/                 <-- 模組化角色目錄（隨插即用）
│   ├── README.md           <-- 角色新增指引
│   └── _template/          <-- 乾淨空白角色範本（複製即可建構新角色）
│       └── agent.md
│
├── runtime/                <-- 核心協調器程式碼
│   ├── parser.ts           <-- XML <state_update> 解析與正文剝離器
│   └── orchestrator.ts     <-- Context 動態組裝、狀態機與 Harness 驗證
│
└── saves/                  <-- 玩家存檔目錄（內含 .gitkeep，已被 gitignore 隔離）
```

---

## 🚀 如何安裝與使用

### 方式 A：在 Google Antigravity (`agy`) 中直接遊玩（最推薦）

1. **Clone 或下載本專案至本地**：
   ```bash
   git clone https://github.com/your-username/antigravity-spicy-simulator.git
   cd antigravity-spicy-simulator
   ```
2. **在專案目錄下啟動 Antigravity**：
   ```bash
   agy
   ```
3. **開啟對話即可遊玩**：
   直接對 Antigravity Agent 輸入指令，系統會自動辨識根目錄的 `AGENTS.md` 並進入總導演模式：
   ```text
   請載入角色 agents/_template 開始慢燉 RP 對戲
   ```

---

### 方式 B：使用視覺化 Web 寫作模擬器（開箱即用）

1. 直接使用任一瀏覽器雙擊打開專案中的 **`index.html`**。
2. **視覺化功能亮點**：
   - **HUD 監控台**：實時動態條顯示好感度、性張力、主導權、耐力回合推進計數。
   - **心聲黑盒子（Internal Thought Decrypted）**：即時解密角色表面冷靜、內在翻湧的真實私密想法。
   - **角色即時編輯器**：點擊「➕ 建立 / 導入自訂角色」，可即時輸入角色人設與開場白。
   - **三歧路一鍵點選**：點擊 A、B、C 分支即可秒速推進下一回合。
   - **雙引擎支援**：支援免金鑰的純本機推演引擎，亦可在設定中填寫 Gemini API Key 連線大模型。
   - **匯出小說**：一鍵將完整對話記錄導出為 Markdown 存檔。

---

## 🎭 如何新增你自己的角色？

只需 2 個步驟即可新增隨插即用角色模組：

1. **複製範本**：
   ```bash
   cp -r agents/_template agents/my-character
   ```
2. **編輯 `agents/my-character/agent.md`**：
   填入角色名稱、身份、年齡（18+）、性格特徵、情慾反差與 Few-shot 錨定對話。
3. **完成！**
   在 Antigravity 中只需說「切換至 my-character」，Orchestrator 就會自動就近讀取並套用該角色！

---

## 📜 成人創作規範與倫理（Ground Rules）

- **完全虛構創作**：所有劇情、情境與對話皆為成人合意虛構創作。
- **嚴格 18+ 原則**：所有登場角色均為成年人（18 歲以上）。禁止任何形式的未成年或幼態化描繪（絕對硬線）。
- **無真實個資侵犯**：禁止描寫真實可識別之非公眾人物私密隱私。
- **無審查與免責說教**：在私密成人創作空間中，拒絕偽善說教、不使用「身為 AI…」等道德免責宣告，直面文學級感官張力。

---

## 📄 License

本專案基於 [MIT License](LICENSE) 開源授權。歡迎自由 Fork、自訂角色與社群擴充！
