/**
 * StateUpdate XML Parser & Content Sanitizer
 * 負責攔截並提取 LLM 回傳內容中的 <state_update> XML 標籤，
 * 實現內部狀態機與前端玩家可見對白之完全隔離。
 */

export interface StateUpdatePayload {
  affinity_delta: number;
  tension_delta: number;
  dominance_delta: number;
  stamina_round_increment: number;
  trigger_flags: string[];
  internal_thought: string;
}

export interface ParsedResponse {
  stateUpdate: StateUpdatePayload | null;
  sanitizedNarrative: string;
  paths: {
    pathA?: string;
    pathB?: string;
    pathC?: string;
  };
}

export function parseAgentResponse(rawText: string): ParsedResponse {
  const stateUpdateRegex = /<state_update>([\s\S]*?)<\/state_update>/i;
  const match = rawText.match(stateUpdateRegex);

  let stateUpdate: StateUpdatePayload | null = null;
  let cleanText = rawText;

  if (match && match[1]) {
    try {
      stateUpdate = JSON.parse(match[1].trim());
    } catch (err) {
      console.warn('[Parser] 狀態更新標籤 JSON 解析失敗，嘗試寬鬆容錯處理:', err);
    }
    // 從玩家可見內文中剝除內部標籤
    cleanText = rawText.replace(stateUpdateRegex, '').trim();
  }

  // 解析三歧路選項 (A / B / C)
  const paths: ParsedResponse['paths'] = {};
  const pathARegex = /(?:A\s*[\(（](?:心理[^）\)]*[\)）]|A[:：])\s*([^\n\r]+)/i;
  const pathBRegex = /(?:B\s*[\(（](?:肉體[^）\)]*[\)）]|B[:：])\s*([^\n\r]+)/i;
  const pathCRegex = /(?:C\s*[\(（](?:環境[^）\)]*[\)）]|C[:：])\s*([^\n\r]+)/i;

  const matchA = cleanText.match(pathARegex);
  const matchB = cleanText.match(pathBRegex);
  const matchC = cleanText.match(pathCRegex);

  if (matchA) paths.pathA = matchA[1].trim();
  if (matchB) paths.pathB = matchB[1].trim();
  if (matchC) paths.pathC = matchC[1].trim();

  return {
    stateUpdate,
    sanitizedNarrative: cleanText,
    paths
  };
}
