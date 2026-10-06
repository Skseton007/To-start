const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/@import url[^;]+;/g, '');
fs.writeFileSync('src/index.css', css);

let html = fs.readFileSync('index.html', 'utf8');
const link = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">\n';
if (!html.includes('fonts.googleapis.com')) {
    html = html.replace('<title>', link + '    <title>');
    fs.writeFileSync('index.html', html);
}
console.log('Fixed HTML and CSS');
