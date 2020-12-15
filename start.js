const fetch = require('node-fetch');
const fs = require('fs');

const configFile = 'config.json';
fetch('http://localhost:4040/api/tunnels').then(res => res.json())
.then((out) => {
  console.log("updating config with latest webhook URL...");
  const jsonConfig = JSON.parse(fs.readFileSync(configFile).toString());
  jsonConfig.webhookUrl = out.tunnels[0].public_url;
  fs.writeFileSync(configFile, JSON.stringify(jsonConfig, null, 2));
  console.log('ngrok host: ', out.tunnels[0].public_url);
})