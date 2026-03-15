/**
 * CJS stub for @langchain/core/messages so Jest can load agent-orchestrator without ESM.
 * Used only in tests via moduleNameMapper.
 */
class BaseMessage {
  constructor(content) {
    this.content = content;
  }
}

class HumanMessage extends BaseMessage {}
class AIMessage extends BaseMessage {}
class SystemMessage extends BaseMessage {}

function ToolMessage(opts) {
  return { content: opts?.content, tool_call_id: opts?.tool_call_id, status: opts?.status };
}

module.exports = { HumanMessage, AIMessage, SystemMessage, ToolMessage };
