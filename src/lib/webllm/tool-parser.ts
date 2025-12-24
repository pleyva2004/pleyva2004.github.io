// src/lib/webllm/tool-parser.ts
import type { ParsedToolCall } from './types';

/**
 * Regex to match <tool>JSON</tool> blocks in model output
 */
const TOOL_BLOCK_REGEX = /<tool>([\s\S]*?)<\/tool>/g;

/**
 * Extract all tool calls from model output text
 *
 * @param text - Raw model output that may contain <tool>...</tool> blocks
 * @returns Array of parsed tool calls
 *
 * @example
 * Input: "Let me check that. <tool>{"action":"check_availability","date":"2025-01-15"}</tool>"
 * Output: [{ action: "check_availability", args: { date: "2025-01-15" }, rawMatch: "<tool>...</tool>" }]
 */
export function extractToolCalls(text: string): ParsedToolCall[] {
  const toolCalls: ParsedToolCall[] = [];

  let match;
  while ((match = TOOL_BLOCK_REGEX.exec(text)) !== null) {
    const rawMatch = match[0];
    const jsonContent = match[1].trim();

    try {
      const parsed = JSON.parse(jsonContent);

      // Validate structure
      if (typeof parsed.action !== 'string') {
        console.warn('[Tool Parser] Missing action field in tool call:', jsonContent);
        continue;
      }

      // Extract action and remaining args
      const { action, ...args } = parsed;

      toolCalls.push({
        action,
        args,
        rawMatch
      });

    } catch (err) {
      console.error('[Tool Parser] Failed to parse tool JSON:', jsonContent, err);
      // Skip malformed tool calls
    }
  }

  // Reset regex lastIndex for next use
  TOOL_BLOCK_REGEX.lastIndex = 0;

  return toolCalls;
}

/**
 * Remove all <tool>...</tool> blocks from text for display
 *
 * @param text - Text potentially containing tool blocks
 * @returns Text with tool blocks removed
 */
export function removeToolBlocks(text: string): string {
  return text.replace(TOOL_BLOCK_REGEX, '').trim();
}

/**
 * Check if text contains an incomplete/pending tool call
 * (opened <tool> but no closing </tool> yet)
 *
 * @param text - Text to check
 * @returns true if there's an unclosed tool tag
 */
export function hasIncompleteToolCall(text: string): boolean {
  const openCount = (text.match(/<tool>/g) || []).length;
  const closeCount = (text.match(/<\/tool>/g) || []).length;
  return openCount > closeCount;
}

/**
 * Convert ParsedToolCall to the format expected by /api/tools
 */
export function toApiToolCall(toolCall: ParsedToolCall): {
  id: string;
  name: string;
  argumentsJson: string;
} {
  return {
    id: `tool_${Date.now()}`,
    name: toolCall.action,
    argumentsJson: JSON.stringify(toolCall.args)
  };
}
