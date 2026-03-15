/**
 * CJS stub for @langchain/openai so Jest can load agent-orchestrator without ESM.
 * Used only in tests via moduleNameMapper.
 */
class ChatOpenAI {
  constructor() {}
  bindTools() {
    return { invoke: async () => ({ content: '', tool_calls: [] }) };
  }
}

module.exports = { ChatOpenAI };
