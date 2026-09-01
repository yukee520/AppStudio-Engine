const fs = require('fs');
const path = require('path');
const et = require('elementtree');

function updateConfigXml({ appId, appName, version, description, authorName, authorEmail }) {
  const configPath = path.join(__dirname, 'config.xml');

  const xmlData = fs.readFileSync(configPath, 'utf-8');
  const etree = et.parse(xmlData);
  const root = etree.getroot();

  if (appId) root.attrib.id = appId;
  if (version) root.attrib.version = version;

  function setChildText(tagName, textValue) {
    if (!textValue) return;
    let element = root.find(tagName);
    if (!element) {
      element = et.SubElement(root, tagName);
    }
    element.text = textValue;
  }

  setChildText('name', appName);
  setChildText('description', description);

  if (authorName || authorEmail) {
    let authorEl = root.find('author');
    if (!authorEl) {
      authorEl = et.SubElement(root, 'author');
    }
    if (authorEmail) authorEl.attrib.email = authorEmail;
    if (authorName) authorEl.text = authorName;
  }

  const updatedXml = etree.write({ indent: 4 });
  fs.writeFileSync(configPath, updatedXml, 'utf-8');
  console.log('Successfully updated config.xml');
}

updateConfigXml({
  appId: 'com.mycompany.customapp',
  appName: 'My Dynamic App',
  version: '1.2.0',
  description: 'An app generated with dynamic configurations',
  authorName: 'Developer Team',
  authorEmail: 'dev@mycompany.com'
});
