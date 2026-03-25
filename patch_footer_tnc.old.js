const fs = require('fs');

// ── Add footer to Home.js ────────────────────────────────────────────────────
let home = fs.readFileSync('src/pages/Home.js', 'utf8');

const oldEnding = '      </main>\n    </div>\n  );\n}';
const newEnding = `      </main>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>© 2026 AAAi Ventures Pte. Ltd. · Singapore</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/terms" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/privacy" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</Link>
          <a href="mailto:support@esimconnect.world" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}`;

if (home.includes(oldEnding)) {
  home = home.replace(oldEnding, newEnding);
  fs.writeFileSync('src/pages/Home.js', home, 'utf8');
  console.log('✅ Footer added to Home page');
} else {
  console.log('❌ Home ending not found');
}

// ── Add T&C to Navbar ────────────────────────────────────────────────────────
let nav = fs.readFileSync('src/components/Navbar.js', 'utf8');

const oldSavedLink = `<Link to="/saved-itineraries" className={isActive('/saved-itineraries')} onClick={() => setMenuOpen(false)}>
                Saved Trips
              </Link>`;

const newSavedLink = `<Link to="/saved-itineraries" className={isActive('/saved-itineraries')} onClick={() => setMenuOpen(false)}>
                Saved Trips
              </Link>
              <Link to="/terms" className={isActive('/terms')} onClick={() => setMenuOpen(false)}>
                T&C
              </Link>`;

if (nav.includes(oldSavedLink)) {
  nav = nav.split(oldSavedLink).join(newSavedLink);
  fs.writeFileSync('src/components/Navbar.js', nav, 'utf8');
  console.log('✅ T&C link added to Navbar');
} else {
  console.log('❌ Saved Trips link not found in Navbar');
}
