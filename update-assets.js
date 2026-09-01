const fs = require('fs');
const path = require('path');

/**
 * Overwrites static assets in www/ with custom code.
 * @param {Object} options
 * @param {string} options.html - Custom HTML structure for body
 * @param {string} options.css - Custom CSS styles
 * @param {string} options.js - Custom JavaScript runtime logic
 * @param {string} options.title - Document title
 */
function updateAppAssets({ html, css, js, title }) {
  const wwwDir = path.join(__dirname, 'www');

  // Ensure www directory structure exists
  ['', 'css', 'js'].forEach(dir => {
    const fullPath = path.join(wwwDir, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  });

  // 1. Inject HTML (Wraps custom HTML with Cordova mandatory scripts)
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, width=device-width, viewport-fit=cover">
    <link rel="stylesheet" type="text/css" href="css/index.css">
    <title>${title || 'Custom App'}</title>
</head>
<body>
    ${html || '<h1>App Loaded Successfully</h1>'}
    <script type="text/javascript" src="cordova.js"></script>
    <script type="text/javascript" src="js/index.js"></script>
</body>
</html>`;

  // 2. Inject JS (Wraps logic in Cordova deviceready listener)
  const fullJs = `document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Cordova device is ready.');
    ${js || '// Custom application code goes here'}
}`;

  // Write custom assets to disk
  fs.writeFileSync(path.join(wwwDir, 'index.html'), fullHtml, 'utf-8');
  fs.writeFileSync(path.join(wwwDir, 'css', 'index.css'), css || 'body { font-family: sans-serif; padding: 20px; }', 'utf-8');
  fs.writeFileSync(path.join(wwwDir, 'js', 'index.js'), fullJs, 'utf-8');

  console.log('Successfully updated www/ assets');
}

// --- Test Execution ---
updateAppAssets({
  title: 'My Custom App',
  html: `
    <div id="app">
      <h1>Hello from Dynamic App!</h1>
      <button id="btn">Click Me</button>
      <p id="output"></p>
    </div>
  `,
  css: `
    body { background-color: #f0f4f8; font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
    button { padding: 10px 20px; font-size: 16px; border-radius: 5px; border: none; background: #007bff; color: white; }
  `,
  js: `
    document.getElementById('btn').addEventListener('click', function() {
      document.getElementById('output').innerText = 'Button clicked inside custom Cordova app!';
    });
  `
});
