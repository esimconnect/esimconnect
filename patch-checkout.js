const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Checkout.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: dropdown select styling — force dark background + light text
content = content.replace(
  `width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '10px 12px', color: 'inherit', fontSize: '14px', marginBottom: '10px',`,
  `width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '10px 12px', color: '#ffffff', fontSize: '14px', marginBottom: '10px',`
);

// Fix 2: relax card validation — allow test numbers like 1234 5678 9101 112 (just check 12+ digits)
content = content.replace(
  `const digits = cardNumber.replace(/\\\\s/g, '');
    if (digits.length < 16 || cardExpiry.length < 5 || cardCvc.length < 3 || !cardName.trim()) {`,
  `const digits = cardNumber.replace(/\\\\s/g, '');
    if (digits.length < 12 || cardExpiry.length < 5 || cardCvc.length < 3 || !cardName.trim()) {`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixes applied: dropdown dark background + relaxed card validation');
