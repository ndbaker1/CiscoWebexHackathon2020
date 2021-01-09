# Cisco Webex Research Bot

## Requirements
`ngrock` executable  
`nodejs` installation

## Startup

In Separate Shells:
```
./ngrok http 7001
npm start
```
`config.json` should be in the form:
```
{
  "webhookUrl": {PUBLIC-WEBHOOK-URL},
  "token": {WEBEX-BOT-TOKEN},
  "port": {PORT}
}
```