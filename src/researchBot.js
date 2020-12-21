const fs = require('fs')

exports.researchBotBootstrap = function (framework, callback) {
  framework.on('attachmentAction', function (bot, trigger) {
    handleAttachmentAction(bot, trigger.attachmentAction.inputs)
  })

  framework.hears(/add|add reference/i, function (bot) {
    callback('add')
    bot.sendCard(addReferenceCard(bot))
  })

  framework.hears(/rm|remove|remove reference/i, function (bot, trigger) {
    callback('remove')
    const removeIndex = +trigger.args[2] || +trigger.args[3] || '0'
    removeReference(bot, removeIndex)
  })

  framework.hears(/clear|empty/i, function (bot) {
    callback('clear')
    clearReferences(bot)
  })

  framework.hears(/refs|references/i, function (bot) {
    callback('references')
    printReferences(bot)
  })

  framework.hears(/bib|bibliography|citations/i, function (bot) {
    callback('citations')
    printCitations(bot)
  })

  // Leave the room
  framework.hears(/exit|leave/i, function (bot) {
    callback('exit')
    bot.say('Goodbye!')
      .then(() => fs.unlinkSync(`${roomsDir}/${bot.room.id}.json`))
      .then(() => bot.exit())
  })
}

const roomsDir = 'src/rooms' // relative to the 
const roomData = {}

exports.initializeBot = function (bot) {
  const dataFile = `${roomsDir}/${bot.room.id}.json`
  if (fs.existsSync(dataFile)) {
    const jsonString = fs.readFileSync(dataFile).toString()
    roomData[bot.room.id] = JSON.parse(jsonString)
  } else {
    setEntries(bot, [])
  }
}

function clearReferences(bot) {
  setEntries(bot, []) // destroys the refernce to the old list of references
  bot.say('References Cleared.')
}

function addReference(bot, inputs) {
  addEntry(bot, {
    reference: inputs.reference,
    citation: formatCitationData(inputs)
  })
  bot.say('Reference Added for ' + inputs.reference + '.')
}

function removeReference(bot, index) {
  // + indicates str-to-int conversion
  removeEntry(bot, +index)
  bot.say('Removed ' + getEntries(bot)[+index].reference + ' from references.')
}

function printReferences(bot) {
  if (getEntries(bot).length > 0) {
    bot.say('markdown', getEntries(bot).reduce((acc, entry) => acc + `\n* ${entry.reference}`, 'References:'));
  } else {
    bot.say('There are currently no references.')
  }
}

function printCitations(bot) {
  if (getEntries(bot).length > 0) {
    const cardJSON = generateCitationsCard(getEntries(bot))
    bot.say('Bibliography').then(() => bot.sendCard(cardJSON, 'JSON Card could not be loaded...'))
  } else {
    bot.say('There are currently no references.')
  }
}

/**
 * Response to a JSON card submission
 */
function handleAttachmentAction(bot, inputs) {
  if (inputs.type == 'add reference') {
    addReference(bot, inputs)
  }
}

/**
 * Turn object with citation data into an mla, apa, or etc citation string
 */
function formatCitationData(citationData) {
  return 'test citation';
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
  return roomData[bot.room.id]
}

function addEntry(bot, entry) {
  roomData[bot.room.id].push(entry)
  roomData[bot.room.id].sort((a, b) => a.citation < b.citation ? -1 : 1);
  fs.writeFileSync(`${roomsDir}/${bot.room.id}.json`, JSON.stringify(roomData[bot.room.id], null, 2))
}

function removeEntry(bot, index) {
  roomData[bot.room.id].splice(index, 1)
  fs.writeFileSync(`${roomsDir}/${bot.room.id}.json`, JSON.stringify(roomData[bot.room.id], null, 2))
}

function setEntries(bot, newEntries) {
  roomData[bot.room.id] = newEntries
  fs.writeFileSync(`${roomsDir}/${bot.room.id}.json`, '[]')
}
