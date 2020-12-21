const fs = require('fs')

const roomsDir = 'rooms'

exports.roomData = (function () {
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

exports.initializeRoom = (bot) => {
  if (getEntries(bot) === undefined) {
    setEntries(bot, [])
  }
}

exports.clearReferences = (bot) => {
  setEntries(bot, []) // destroys the refernce to the old list of references
  bot.say('References Cleared.')
}

exports.addReference = (bot) => {
  bot.sendCard(addReferenceCard())
}

exports.removeReference = (bot, index) => {
  const referenceURL = getEntries(bot)[+index].reference
  removeEntry(bot, +index)
  bot.say('Removed ' + referenceURL + ' from references.')
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
    const cardJSON = generateCitationsCard(getEntries(bot))
    bot.say('Bibliography').then(() => {
      bot.sendCard(cardJSON, 'JSON Card could not be loaded...');
    })
  } else {
    bot.say('There are currently no references.')
  }
}

/**
 * Response to a JSON card submission
 */
exports.handleAttachmentAction = (bot, inputs) => {
  if (inputs.type == 'add reference') {
    addEntry(bot, {
      reference: inputs.reference,
      citation: 'test citation'//formatCitationData(inputs)
    })
    bot.say('Reference Added.')
  }
}

/**
 * Turn object with citation data into an mla, apa, or etc citation string
 */
function formatCitationData(citationData) {
  return;
}

// returns the template for a JSON adaptive card
function generateCitationsCard(entries) {
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

function addReferenceCard() {
  return {
    "type": "AdaptiveCard",
    "body": [
      {
        "type": "ColumnSet",
        "columns": [
          {
            "type": "Column",
            "width": 35,
            "items": [
              {
                "type": "Input.Text",
                "id": "reference",
                "placeholder": "Reference URL"
              },
              {
                "type": "Input.Text",
                "id": "author",
                "placeholder": "Author"
              },
              {
                "type": "TextBlock",
                "text": "Citation Format"
              },
              {
                "type": "Input.ChoiceSet",
                "placeholder": "Placeholder text",
                "choices": [
                  {
                    "title": "MLA",
                    "value": "mla"
                  },
                  {
                    "title": "APA",
                    "value": "apa"
                  }
                ],
                "id": "format",
                "style": "expanded"
              }
            ]
          }
        ],
        "spacing": "Padding",
        "horizontalAlignment": "Center"
      },
      {
        "type": "ActionSet",
        "actions": [
          {
            "type": "Action.Submit",
            "title": "Add Reference with Citation",
            "data": {
              type: "add reference"
            }
          }
        ],
        "horizontalAlignment": "Center",
        "spacing": "Large"
      }
    ],
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.2"
  }
}

function getEntries(bot) {
  return exports.roomData[bot.room.title]
}

function addEntry(bot, entry) {
  exports.roomData[bot.room.title].push(entry)
  exports.roomData[bot.room.title].sort((a, b) => a.citation < b.citation ? -1 : 1);
  fs.writeFileSync(`${roomsDir}/${bot.room.title}.json`, JSON.stringify(exports.roomData[bot.room.title], null, 2))
}

function removeEntry(bot, index) {
  exports.roomData[bot.room.title].splice(index, 1)
  fs.writeFileSync(`${roomsDir}/${bot.room.title}.json`, JSON.stringify(exports.roomData[bot.room.title], null, 2))
}

function setEntries(bot, newEntries) {
  exports.roomData[bot.room.title] = newEntries
  fs.writeFileSync(`${roomsDir}/${bot.room.title}.json`, '[]')
}

