const fs = require('fs');

const fix = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix useToast default import
  content = content.replace(/import useToast from/g, 'import { useToast } from');
  
  // Fix Youtube and Instagram imports
  content = content.replace(/Youtube/g, 'Play');
  content = content.replace(/Instagram/g, 'Camera');
  
  // Fix CSS warning (move @import to top)
  if (file.endsWith('.css')) {
    if (content.includes('@import url')) {
      const match = content.match(/@import url[^;]+;/);
      if (match) {
        content = content.replace(match[0], '');
        content = match[0] + '\n' + content;
      }
    }
  }

  fs.writeFileSync(file, content);
};

fix('src/pages/Today.jsx');
fix('src/pages/Tasks.jsx');
fix('src/pages/Scripts.jsx');
fix('src/pages/ScriptEditor.jsx');
fix('src/pages/ContentTracker.jsx');
fix('src/index.css');

console.log('Fixed exports and css warnings');
