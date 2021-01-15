# Cisco Webex Research Bot

## About

### Problem
Online collaborative platforms like Webex Teams are great for group discussion, but we believe there is a need for services which assist students with their group dynamic. More specifically, we believe Webex Teams could benefit from creating some services that cater to students interested in doing group research project. Its typical for a freshly assembled group of students to waste time syncing up and deciding how to manage their resources, or what sort of tech stack they plan on using.

### Solution
A service we want to provide is the ability to create resource citations and help students cooperatively manage project resources all from Webex. Using a Webex Bot we can integrate several forms of information documentation directly into the scope of Webex, making the process of sharing links, citations, and relevant project info with peers as simple as inviting them to a Teams room. This also creates a platform with zero downtime between starting a meeting, getting to work, and sharing your discoveries amongst your peers.

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
