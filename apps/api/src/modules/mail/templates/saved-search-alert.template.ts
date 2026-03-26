/**
 * @file saved-search-alert.template.ts
 * @module mail
 * @description HTML and plain-text templates for saved-search alert emails.
 * @author BharatERP
 * @created 2026-03-19
 */

export function savedSearchAlertHtml(opts: {
  name: string;
  locality?: string;
  count: number;
  searchUrl: string;
}): string {
  const { name, locality, count, searchUrl } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#080c14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb}
  .wrap{max-width:560px;margin:0 auto;padding:32px 16px}
  .card{background:#161d2e;border:1px solid rgba(255,255,255,0.06);border-radius:18px;padding:32px}
  .logo{font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px;margin-bottom:28px}
  .logo span{color:#00d4aa}
  h1{font-size:24px;font-weight:700;color:#fff;margin:0 0 10px;letter-spacing:-0.5px}
  p{font-size:15px;color:rgba(255,255,255,0.55);line-height:1.65;margin:0 0 22px}
  .pill{display:inline-block;background:rgba(0,212,170,0.12);border:1px solid rgba(0,212,170,0.25);color:#00d4aa;font-size:12px;font-weight:700;padding:4px 14px;border-radius:100px;margin-bottom:20px}
  .cta{display:inline-block;background:linear-gradient(135deg,#00d4aa,#00c49a);color:#080c14;font-weight:700;font-size:15px;padding:14px 32px;border-radius:100px;text-decoration:none;margin-top:4px}
  .footer{margin-top:28px;font-size:12px;color:rgba(255,255,255,0.2);text-align:center;line-height:1.6}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="logo">KonKreet</div>
    <span class="pill">🔔 Search Alert</span>
    <h1>${count} new ${count === 1 ? "property" : "properties"} found</h1>
    <p>New listings matching your saved search <strong style="color:#fff">"${name}"</strong>${locality ? ` in <strong style="color:#fff">${locality}</strong>` : ""} are available. Don't miss out.</p>
    <a href="${searchUrl}" class="cta">View Matches →</a>
  </div>
  <div class="footer">
    You're receiving this because you saved a search on KonKreet<br>
    <a href="${searchUrl}&unsubscribe=1" style="color:rgba(255,255,255,0.3)">Unsubscribe</a>
  </div>
</div>
</body>
</html>`;
}

export function savedSearchAlertText(opts: { name: string; count: number; searchUrl: string }): string {
  return `KonKreet — ${opts.count} new ${opts.count === 1 ? "property" : "properties"} match "${opts.name}".\n\nView: ${opts.searchUrl}`;
}
