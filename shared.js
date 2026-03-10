// Shared nav + footer injection
function injectNav(activePage) {
  const ann = `<div class="ann-bar"><span class="ann-pill">NEW</span> AI Copilot 2.0 launched — smarter matching, legal scanner & EMI optimizer <a href="ai-copilot.html" class="ann-link">Try free →</a></div>`;
  const pages = [
    { href: 'search.html', label: 'Buy' },
    { href: 'search.html?mode=rent', label: 'Rent' },
    { href: 'search.html?type=new', label: 'New Projects' },
    { href: 'search.html?type=commercial', label: 'Commercial' },
    { href: 'ai-copilot.html', label: 'AI Copilot ✦' },
    { href: 'market-pulse.html', label: 'Market Pulse' },
  ];
  const links = pages.map(p => `<a href="${p.href}" class="npill${activePage===p.label?' active':''}">${p.label}</a>`).join('');
  const navHTML = `
  <nav id="mainNav">
    <a href="index.html" class="logo"><div class="logo-icon">🏙️</div><span class="logo-text">UrbanNest<span class="ai">.ai</span></span></a>
    <div class="nav-pills">${links}</div>
    <div class="nav-r">
      <button class="nbtn-ghost" onclick="location.href='about.html'">About</button>
      <button class="nbtn-ghost">Sign In</button>
      <button class="nbtn-primary" onclick="location.href='post-property.html'">Post Free ✦</button>
    </div>
  </nav>`;
  document.body.insertAdjacentHTML('afterbegin', navHTML);
  document.body.insertAdjacentHTML('afterbegin', ann);
  window.addEventListener('scroll', () => {
    document.getElementById('mainNav').classList.toggle('scrolled', scrollY > 30);
  });
}

function injectFooter() {
  document.body.insertAdjacentHTML('beforeend', `
  <footer>
    <div class="footer-grid">
      <div>
        <div class="logo"><div class="logo-icon">🏙️</div><span class="logo-text">UrbanNest<span class="ai">.ai</span></span></div>
        <p class="footer-desc">India's most intelligent real estate platform. AI-powered search, price intelligence and neighbourhood scoring across 340+ cities.</p>
        <div class="footer-socials"><div class="soc">𝕏</div><div class="soc">in</div><div class="soc">f</div><div class="soc">📸</div></div>
      </div>
      <div class="footer-col"><h5>Discover</h5><ul><li><a href="search.html">Buy Property</a></li><li><a href="search.html?mode=rent">Rent Property</a></li><li><a href="search.html?type=new">New Projects</a></li><li><a href="search.html?type=commercial">Commercial</a></li></ul></div>
      <div class="footer-col"><h5>AI Tools</h5><ul><li><a href="ai-copilot.html">AI Copilot</a></li><li><a href="emi-calculator.html">EMI Calculator</a></li><li><a href="neighbourhood.html">Neighbourhood Score</a></li><li><a href="price-forecast.html">Price Forecast</a></li><li><a href="legal-checker.html">Legal Checker</a></li></ul></div>
      <div class="footer-col"><h5>Company</h5><ul><li><a href="about.html">About Us</a></li><li><a href="about.html#investors">Investors</a></li><li><a href="post-property.html">For Builders</a></li><li><a href="#">Careers</a></li><li><a href="#">Press</a></li></ul></div>
      <div class="footer-col"><h5>Legal</h5><ul><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Use</a></li><li><a href="#">RERA Info</a></li><li><a href="#">Cookie Policy</a></li></ul></div>
    </div>
    <div class="footer-bottom"><span>© 2025 UrbanNest Technologies Pvt. Ltd. · DPIIT Recognised</span><span>Built with <span class="teal">AI ✦</span> in India 🇮🇳</span></div>
  </footer>
  <div class="ai-fab"><button class="ai-fab-btn" title="Ask UrbanNest AI">🤖</button></div>`);
}

function revealOnScroll() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e,i) => { if(e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i*70); });
  }, { threshold: 0.07 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
