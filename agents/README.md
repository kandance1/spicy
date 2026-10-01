# 角色模組目錄（Pluggable Characters）

本目錄採用 **Antigravity 目錄階層作用域（Directory Scoping）** 架構，支援多角色隨插即用。

---

## 快速新增一個角色

1. **複製範本目錄**：
   ```bash
   cp -r agents/_template agents/my-character
   ```
2. **編輯角色手冊**：
   開啟 `agents/my-character/agent.md`，填寫：
   - 頂部 YAML Frontmatter：角色名稱（`name`）、身分（`role`）、年齡（`age >= 18`）、初始數值矩陣。
   - 角色人設、外貌氣味、語調特徵、私下反差與情慾反應。
3. **完成！**
   在 Antigravity 對話中輸入：
   ```text
   請切換至角色 my-character 開始對戲
   ```
   Orchestrator 會自動掃描並動態載入該資料夾中的 `agent.md`！
