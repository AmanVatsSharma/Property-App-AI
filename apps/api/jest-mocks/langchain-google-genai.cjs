/**
 * CJS stub for @langchain/google-genai so Jest can load LLM code without pulling ESM (p-retry).
 * Used only in tests via moduleNameMapper.
 */
class ChatGoogleGenerativeAI {
  constructor() {}
  bindTools() {
    return { invoke: async () => ({ content: '', tool_calls: [] }) };
  }
  async invoke() {
    return { content: '' };
  }
}

module.exports = { ChatGoogleGenerativeAI };
