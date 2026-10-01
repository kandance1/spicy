import * as fs from 'fs';
import * as path from 'path';
import { parseAgentResponse, StateUpdatePayload } from './parser';

export interface GameState {
  characterName: string;
  styleMode: 'immersive_rp' | 'literary_novel';
  affinity: number;       // 0 ~ 100
  tension: number;        // 0 ~ 100
  dominance: number;      // 0 ~ 100 (50 為均勢平衡)
  staminaRounds: number;  // 回合累計（>=4 方可進入峰值釋放）
  triggerFlags: string[];
  lastInternalThought: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export class AntigravityOrchestrator {
  private baseDir: string;
  private state: GameState;

  constructor(baseDir: string = path.join(__dirname, '..')) {
    this.baseDir = baseDir;
    const availableAgents = this.listAvailableAgents();
    const defaultAgent = availableAgents.length > 0 ? availableAgents[0] : '_template';

    this.state = {
      characterName: defaultAgent,
      styleMode: 'immersive_rp',
      affinity: 20,
      tension: 30,
      dominance: 50,
      staminaRounds: 0,
      triggerFlags: [],
      lastInternalThought: '',
      history: []
    };
  }

  // 1. 動態掃描 agents/ 目錄下所有可用的角色模組
  public listAvailableAgents(): string[] {
    const agentsDir = path.join(this.baseDir, 'agents');
    if (!fs.existsSync(agentsDir)) return [];

    return fs.readdirSync(agentsDir).filter(item => {
      const fullPath = path.join(agentsDir, item);
      return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'agent.md'));
    });
  }

  // 2. 切換當前登場角色
  public switchCharacter(agentName: string) {
    const agentPath = path.join(this.baseDir, 'agents', agentName, 'agent.md');
    if (!fs.existsSync(agentPath)) {
      throw new Error(`找不到角色模組: agents/${agentName}/agent.md`);
    }
    this.state.characterName = agentName;
    this.state.staminaRounds = 0;
    this.state.triggerFlags = [];
    console.log(`[Orchestrator] 角色已成功切換為: ${agentName}`);
  }

  // 3. 安全讀取指定相對路徑檔案
  private readFileSafely(relPath: string): string {
    const fullPath = path.join(this.baseDir, relPath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf-8');
    }
    return '';
  }

  // 4. 組裝發往 LLM 的完整動態 Context (Prompt)
  public assemblePrompt(): string {
    const orchestratorGuide = this.readFileSafely('AGENTS.md');
    const lorebook = this.readFileSafely('world/lorebook.md');
    const rules = this.readFileSafely('world/game_rules.md');
    const characterModule = this.readFileSafely(`agents/${this.state.characterName}/agent.md`);

    return `
=== SYSTEM ORCHESTRATOR INSTRUCTIONS ===
${orchestratorGuide}

=== GLOBAL LOREBOOK ===
${lorebook}

=== GAME RULES & MECHANICS ===
${rules}

=== CURRENT ACTIVE CHARACTER MODULE ===
${characterModule}

=== RUNTIME STATE MATRIX ===
- 當前角色: ${this.state.characterName}
- 文體模式: ${this.state.styleMode === 'immersive_rp' ? '慢燉沉浸對戲體 (*星號動作* + 獨立聚光台詞)' : '文學小說體 (Show Don\'t Tell / 高張力散文)'}
- 好感度 (Affinity): ${this.state.affinity}/100
- 性張力 (Tension): ${this.state.tension}/100
- 主導權 (Dominance): ${this.state.dominance}/100
- 耐力推進回合 (Stamina Rounds): ${this.state.staminaRounds} (未達 4 回合前保持克制與抗壓，嚴禁早洩收尾)
- 已觸發劇情事件: [${this.state.triggerFlags.join(', ')}]
- 角色最近心聲: "${this.state.lastInternalThought}"
`;
  }

  // 5. Harness 邊界檢查：防代控與合法性
  public validateHarness(characterOutput: string): { valid: boolean; reason?: string } {
    const puppeteeringPatterns = [
      /你說道[：:]/i,
      /妳說道[：:]/i,
      /妳心想/i,
      /妳忍不住回答/i,
      /妳感到一陣/i,
      /妳的身體不由自主/i
    ];
    for (const pattern of puppeteeringPatterns) {
      if (pattern.test(characterOutput)) {
        return { valid: false, reason: '偵測到代控玩家 (Puppeteering) 違規' };
      }
    }
    return { valid: true };
  }

  // 6. 狀態機更新
  public applyStateUpdate(update: StateUpdatePayload | null) {
    if (!update) return;

    this.state.affinity = Math.max(0, Math.min(100, this.state.affinity + (update.affinity_delta || 0)));
    this.state.tension = Math.max(0, Math.min(100, this.state.tension + (update.tension_delta || 0)));
    this.state.dominance = Math.max(0, Math.min(100, this.state.dominance + (update.dominance_delta || 0)));

    if (update.stamina_round_increment) {
      this.state.staminaRounds += update.stamina_round_increment;
    }

    if (update.trigger_flags && Array.isArray(update.trigger_flags)) {
      this.state.triggerFlags = Array.from(new Set([...this.state.triggerFlags, ...update.trigger_flags]));
    }

    if (update.internal_thought) {
      this.state.lastInternalThought = update.internal_thought;
    }
  }

  // 7. 推進一輪交互
  public processTurn(userInput: string, rawLLMOutput: string) {
    const parsed = parseAgentResponse(rawLLMOutput);
    this.applyStateUpdate(parsed.stateUpdate);

    this.state.history.push({ role: 'user', content: userInput });
    this.state.history.push({ role: 'assistant', content: parsed.sanitizedNarrative });

    return {
      state: { ...this.state },
      narrative: parsed.sanitizedNarrative,
      paths: parsed.paths,
      internalThought: parsed.stateUpdate?.internal_thought || this.state.lastInternalThought
    };
  }

  // 8. 存檔與讀檔 (Saves)
  public saveGame(slotName: string = 'save_default.json') {
    const savePath = path.join(this.baseDir, 'saves', slotName);
    fs.writeFileSync(savePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  public loadGame(slotName: string = 'save_default.json') {
    const savePath = path.join(this.baseDir, 'saves', slotName);
    if (fs.existsSync(savePath)) {
      this.state = JSON.parse(fs.readFileSync(savePath, 'utf-8'));
    }
  }

  public getState(): GameState {
    return { ...this.state };
  }
}
