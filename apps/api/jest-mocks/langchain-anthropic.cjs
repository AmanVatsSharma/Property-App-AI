/**
 * CJS stub for @langchain/anthropic so Jest can load agent-orchestrator without ESM.
 * Used only in tests via moduleNameMapper.
 */
class ChatAnthropic {
  constructor() {}
  bindTools() {
    return { invoke: async () => ({ content: '', tool_calls: [] }) };
  }
}

module.exports = { ChatAnthropic };
