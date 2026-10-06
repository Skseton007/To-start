const fs = require('fs');
const files = [
  'src/pages/ContentTracker.jsx',
  'src/pages/CalendarPage.jsx',
  'src/pages/History.jsx',
  'src/pages/Settings.jsx',
  'src/components/Layout.jsx',
  'src/components/SearchModal.jsx',
  'src/components/QuickAdd.jsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/import useStore from ["']\.\.\/store\/useStore["']/g, 'import { useStore } from "../store/useStore"');
    fs.writeFileSync(f, c);
  }
});
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/@import url[^;]+;/, '');
css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');\n` + css;
fs.writeFileSync('src/index.css', css);
