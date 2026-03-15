/**
 * CJS stub for @langchain/core/tools so Jest can load agent-tools.service without ESM.
 * Used only in tests via moduleNameMapper.
 */
function tool(fn, opts) {
  return {
    name: opts?.name ?? 'tool',
    description: opts?.description ?? '',
    invoke: fn,
    schema: opts?.schema,
  };
}

module.exports = { tool };
