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
  "webhookUrl": "http://b2e902d24c72.ngrok.io",
  "token": "NDM4ZmUzYmYtMmJmYi00OGUxLWI3Y2MtYjBjYTBhZThkODI1ODQzYmNiYWQtZDA3_P0A1_581901ea-d6d4-4e58-9294-0fa22ab39d78",
  "port": "7001"
}
```