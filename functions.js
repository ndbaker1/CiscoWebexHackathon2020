exports.validateURL = (URL) => {
  console.log('validate function called')
  return 50;
}

exports.createCitation = (url) => {
  return 'this new citation';
}

exports.printCitations = (bot, entries) => {
  const cardJSON = generateCardTemplate();
  for (const entry of entries) {
    cardJSON.body[0].columns[0].items.push({
      type: 'TextBlock',
      text: entry.citation,
      size: 'small', // maybe use 'medium'
      wrap: true,
    });
  }
  bot.say('Bibliography')
  bot.sendCard(cardJSON, 'JSON Card could not be loaded...');
}

exports.printReferences = (bot, entries) => {
  let references = ''
  for (const entry of entries) {
    references += '\n* ' + entry.reference 
  }
  references = references.length ? 'References:' + references : 'There are currently no references.'
  bot.say('markdown', references);
}

// returns the template for a JSON adaptive card
function generateCardTemplate() {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: 'AdaptiveCard',
    version: '1.0',
    body: [
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            items: []
          }
        ]
      }
    ]
  };
}