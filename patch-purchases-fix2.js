const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Purchases.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix: remove the .not('iccid', 'is', null) filter so all orders show as eSIMs
content = content.replace(
  `      .eq('user_id', userId)
      .not('iccid', 'is', null)
      .order('created_at', { ascending: false });`,
  `      .eq('user_id', userId)
      .order('created_at', { ascending: false });`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ My eSIMs tab fixed — all orders now shown as eSIMs');
