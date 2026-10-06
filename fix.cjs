const fs = require('fs');

const fix = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from ["']\.\.\/store["']/g, 'from "../store/useStore"');
  content = content.replace(/from ["']\.\.\/hooks\/useScripts["']/g, 'from "../store/useStore"');
  content = content.replace(/from ["']\.\.\/hooks\/useIdeas["']/g, 'from "../store/useStore"');
  fs.writeFileSync(file, content);
};

fix('src/pages/Dashboard.jsx');
fix('src/pages/ScriptEditor.jsx');
fix('src/pages/Ideas.jsx');
fix('src/pages/Scripts.jsx');

console.log('Fixed imports');
