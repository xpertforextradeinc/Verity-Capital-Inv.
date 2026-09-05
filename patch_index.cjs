const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('model-viewer.min.js')) {
  html = html.replace(
    '</head>',
    '  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>\n</head>'
  );
  fs.writeFileSync('index.html', html);
  console.log('index.html updated');
} else {
  console.log('model-viewer already exists');
}
