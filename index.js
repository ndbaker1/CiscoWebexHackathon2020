//Webex Bot Starter - featuring the webex-node-bot-framework - https://www.npmjs.com/package/webex-node-bot-framework
const {
  createCitation,
  printCitations,
  printReferences,
  clearReferences
} = require('./researchBot.js');

const botFramework = require('webex-node-bot-framework');
const webhook = require('webex-node-bot-framework/webhook');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('images'));

// init framework
const config = require("./config.json");
const framework = new botFramework(config);
framework.start();
console.log("Starting framework, please wait...");

framework.on("initialized", function () {
  console.log("framework is all fired up! [Press CTRL-C to quit]");
});

let responded = false; // tracks if a response has been made, in order to find out if the user entered an invalid command

framework.hears('edit', function (bot) {
  // removing citations
})

framework.hears('validate', function (bot, trigger) {
  console.log(`validate called`);
  responded = true;
  const URL = trigger.args[1];
  bot.say(`The site ${URL} is ${validateURL(URL)} percent valid.`).then(() => {
    rooms[bot.room.title].push({
      citation: createCitation(URL),
      reference: URL
    });
  });
});

framework.hears(/clear|empty/i, function (bot) {
  responded = true
  console.log(`clear called`)
  clearReferences(bot)
});

framework.hears(/refs|references/i, function (bot) {
  responded = true
  console.log(`references called`)
  printReferences(bot)
});

framework.hears(/bib|bibliography|citations/i, function (bot) {
  responded = true
  console.log(`citations called`)
  printCitations(bot)
});

// A spawn event is generated when the framework finds a space with your bot in it
// If actorId is set, it means that user has just added your bot to a new space
// If not, the framework has discovered your bot in an existing space
framework.on('spawn', (bot, id, actorId) => {
  if (!actorId) {
    console.log(`While starting up, the framework found our bot in a space called: ${bot.room.title}`);
  } else {
    bot.say('markdown', 'You can say `help` to get the list of words I am able to respond to.' + 
      ( !bot.isDirect ? `\n\nDon't forget, in order for me to see your messages in this group space, be sure to *@mention* ${bot.person.displayName}.` : '' ));
  }
});

/* On mention with command
ex User enters @botname help, the bot will write back in markdown
*/
framework.hears(/help|what can i (do|say)|what (can|do) you do/i, function (bot, trigger) {
  console.log(`someone needs help! They asked ${trigger.text}`);
  responded = true;
  bot.say(`Hello ${trigger.person.displayName}.`)
    .then(() => sendHelp(bot))
    .catch((e) => console.error(`Problem in help hander: ${e.message}`));
});

/* On mention with unexpected bot command
   Its a good practice is to gracefully handle unexpected input
*/
framework.hears(/.*/, function (bot, trigger) {
  // This will fire for any input so only respond if we haven't already
  if (!responded) {
    console.log(`catch-all handler fired for user input: ${trigger.text}`);
    bot.say(`Sorry, I don't know how to respond to "${trigger.text}"`)
      .then(() => sendHelp(bot))
      .catch((e) => console.error(`Problem in the unexepected command hander: ${e.message}`));
  }
  responded = false;
});

function sendHelp(bot) {
  bot.say("markdown", 'These are the commands I can respond to:', '\n\n ' +
    '1. **refs, references** (list your current reference URLs)' +
    '2. **bib, bibliography, citations** (display the bibliography page using your references)' + 
    '3. **clear, empty** (removes all references & citations)' + 
    '4. **help** (what you are reading now)');
}

//Server config & housekeeping

// set the endpoint for the server POST to be the webex framework
app.post('/', webhook(framework));

// initialize the server
var server = app.listen(config.port, function () {
  framework.debug('framework listening on port %s', config.port);
});

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function () {
  framework.debug('stoppping...');
  server.close();
  framework.stop().then(function () {
    process.exit();
  });
});
