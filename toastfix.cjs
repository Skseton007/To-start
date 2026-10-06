const fs = require('fs');
let c = fs.readFileSync('src/components/Toast.jsx', 'utf8');
c = c.replace(/value=\{\{.*?\}\}/, 'value={{ addToast, success: (msg) => addToast(msg, "success"), error: (msg) => addToast(msg, "error"), info: (msg) => addToast(msg, "info") }}');
fs.writeFileSync('src/components/Toast.jsx', c);
console.log('Fixed Toast.jsx');
