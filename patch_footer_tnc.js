const fs = require('fs');

// Add footer to Home.js
let homeLines = fs.readFileSync('src/pages/Home.js', 'utf8').split('\n');
for (let i = homeLines.length - 1; i >= 0; i--) {
  if (homeLines[i].trim() === '</main>') {
    const footer = [
      "      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>",
      "        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>\u00a9 2026 AAAi Ventures Pte. Ltd. \u00b7 Singapore</div>",
      "        <div style={{ display: 'flex', gap: '20px' }}>",
      '          <Link to="/terms" style={{ fontSize: \'13px\', color: \'rgba(255,255,255,0.4)\', textDecoration: \'none\' }}>Terms &amp; Conditions</Link>',
      '          <a href="mailto:support@esimconnect.world" style={{ fontSize: \'13px\', color: \'rgba(255,255,255,0.4)\', textDecoration: \'none\' }}>Contact</a>',
      "        </div>",
      "      </footer>",
    ];
    homeLines.splice(i + 1, 0, ...footer);
    console.log('Footer added at line ' + (i+1));
    break;
  }
}
fs.writeFileSync('src/pages/Home.js', homeLines.join('\n'), 'utf8');

// Add T&C to Navbar
let navLines = fs.readFileSync('src/components/Navbar.js', 'utf8').split('\n');
let insertions = [];
for (let i = 0; i < navLines.length; i++) {
  if (navLines[i].trim() === 'Saved Trips') insertions.push(i + 1);
}
insertions.reverse().forEach(idx => {
  navLines.splice(idx, 0,
    '              </Link>',
    '              <Link to="/terms" className={isActive(\'/terms\')} onClick={() => setMenuOpen(false)}>',
    '                T&C'
  );
});
fs.writeFileSync('src/components/Navbar.js', navLines.join('\n'), 'utf8');
console.log('T&C added to Navbar at ' + insertions.length + ' locations');
