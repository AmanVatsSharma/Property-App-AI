/**
 * @file AIFab.tsx
 * @module layout
 * @description Floating AI assistant button
 * @author BharatERP
 * @created 2025-03-10
 */

export default function AIFab() {
  return (
    <div className="ai-fab">
      <button
        type="button"
        className="ai-fab-btn"
        title="Ask UrbanNest AI"
        aria-label="Open AI assistant"
      >
        🤖
      </button>
    </div>
  );
}
