const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const et = require('elementtree');

function updateConfigXml({ appId, appName, version, description }) {
  const configPath = path.join(__dirname, 'config.xml');
  const xmlData = fs.readFileSync(configPath, 'utf-8');
  const etree = et.parse(xmlData);
  const root = etree.getroot();

  if (appId) root.attrib.id = appId;
  if (version) root.attrib.version = version;

  function setChildText(tagName, textValue) {
    if (!textValue) return;
    let element = root.find(tagName);
    if (!element) element = et.SubElement(root, tagName);
    element.text = textValue;
  }

  setChildText('name', appName);
  setChildText('description', description);

  fs.writeFileSync(configPath, etree.write({ indent: 4 }), 'utf-8');
  console.log('✓ Updated config.xml');
}

function updateAppAssets({ html, css, js, title }) {
  const wwwDir = path.join(__dirname, 'www');

  ['', 'css', 'js'].forEach(dir => {
    const fullPath = path.join(wwwDir, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  });

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

  fs.writeFileSync(path.join(wwwDir, 'index.html'), fullHtml, 'utf-8');
  fs.writeFileSync(path.join(wwwDir, 'css', 'index.css'), css || 'body { font-family: sans-serif; }', 'utf-8');
  fs.writeFileSync(path.join(wwwDir, 'js', 'index.js'), js || '', 'utf-8');

  console.log('✓ Updated www/ assets');
}

function triggerGitHubBuild(appName) {
  console.log('🚀 Pushing updates to GitHub to trigger remote build...');
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "Generate app: ${appName}"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('\n🎉 Pushed successfully! Check your GitHub Actions tab to download the compiled APK.');
  } catch (error) {
    console.error('❌ Failed to push to GitHub:', error.message);
  }
}

// Execution Workflow
function generateApp(config) {
  console.log(`--- Preparing App: ${config.appName} ---`);
  updateConfigXml(config);
  updateAppAssets(config);
  triggerGitHubBuild(config.appName);
}

generateApp({
  appId: 'com.mycompany.smartapp',
  appName: 'Smart Calculator',
  version: '1.0.0',
  description: 'App generated via Termux and built on GitHub',
  html: '<h1>Hello from GitHub Actions Build!</h1>',
  css: 'body { background: #111; color: #fff; text-align: center; }',
  js: 'console.log("App ready!");'
});
