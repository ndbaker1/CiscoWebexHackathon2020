exports.validateURL = (URL) => {
  console.log('validate function called')
  return 50;
}

exports.createCitation = (url) => {
  return 'this new citation';
}

exports.printCitations = (bot, citations) => {
  const cardJSON = generateCardTemplate();
  for (const entry of citations) {
    cardJSON.body[0].columns[0].items.push({
      type: 'TextBlock',
      text: entry.citation,
      size: 'small', // maybe use 'medium'
      wrap: true,
    });
  }
  bot.sendCard(cardJSON, 'JSON Card could not be loaded...');
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