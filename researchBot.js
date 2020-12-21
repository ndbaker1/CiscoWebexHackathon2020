const fs = require('fs');
const roomsDir = 'rooms'

exports.validateURL = (URL) => {
  console.log('validate function called')
  return 50;
}

exports.roomData = (function() {
  const roomData = {}
  for (const roomFile of fs.readdirSync(roomsDir)) {
    if (roomFile.endsWith('.json')) {
      const roomName = roomFile.substring(0, roomFile.lastIndexOf('.json'))
      const jsonString = fs.readFileSync(`${roomsDir}/${roomFile}`).toString()
      roomData[roomName] = JSON.parse(jsonString)
    }
  }
  return roomData
})()

exports.clearReferences = (bot) => {
  setEntries(bot, []) // destroys the refernce to the old list of references
  bot.say('References Cleared.')
}

exports.addReference = (bot) => {

}

exports.removeReference = (bot) => {
  
}

exports.printReferences = (bot) => {
  if (getEntries(bot).length > 0) {
    bot.say('markdown', getEntries(bot).reduce((acc, entry) => acc + `\n* ${entry.reference}`, 'References:'));
  } else {
    bot.say('There are currently no references.')
  }
}


exports.printCitations = (bot) => {
  if (getEntries(bot).length > 0) {
    const cardJSON = generateCardTemplate(getEntries(bot))
    bot.say('Bibliography').then(() => {
      bot.sendCard(cardJSON, 'JSON Card could not be loaded...');
    })
  } else {
    bot.say('There are currently no references.')
  }
}

// returns the template for a JSON adaptive card
function generateCardTemplate(entries) {
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
            items: entries.map(entry => {
              return {
                type: 'TextBlock',
                text: entry.citation,
                size: 'small', // maybe use 'medium'
                wrap: true,
              }
            })
          }
        ]
      }
    ]
  }
}

function getEntries(bot) {
  return exports.roomData[bot.room.title]
}

function addEntry(bot, entry) {
  exports.roomData[bot.room.title].push(entry)
  exports.roomData[bot.room.title].sort((a, b) => a.citation < b.citation ? -1 : 1);
  fs.writeFileSync(`${roomsDir}/${bot.room.title}.json`, JSON.stringify(exports.roomData[bot.room.title]))
}

function removeEntry(bot, index) {
  exports.roomData[bot.room.title].splice(index, 1)
  fs.writeFileSync(`${roomsDir}/${bot.room.title}.json`, JSON.stringify(exports.roomData[bot.room.title]))
}

function setEntries(bot, newEntries) {
  exports.roomData[bot.room.title] = newEntries
  fs.writeFileSync(`${roomsDir}/${bot.room.title}.json`, '[]')
}

[
  {
    "reference": "examplesite.test.com",
    "citation": "Franck, Caroline, et al. “Agricultural Subsidies and the American Obesity Epidemic.” American Journal of Preventative Medicine, vol. 45, no. 3, Sept. 2013, pp. 327-333."
  },
  {
    "reference": "anothersite.abb",
    "citation": "Burke, Kenneth. Language as Symbolic Action: Essays on Life, Literature, and Method. University of California Press, 1966."
  },
  {
    "reference": "googlee.ee",
    "citation": "Best, David, and Sharon Marcus. “Surface Reading: An Introduction.” Representations, vol. 108, no. 1, Fall 2009, pp. 1-21. JSTOR, doi:10.1525/rep.2009.108.1.1"
  }
]
