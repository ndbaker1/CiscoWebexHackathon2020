const fs = require('fs')

exports.commandListString =
  '1. **add, add reference** (display an interface for adding references)\n' +
  '2. **rm, remove, remove reference { followed by a number }** (remove a reference based on index starting at 0)\n' +
  '3. **clear, empty** (removes all references & citations)\n' +
  '4. **refs, references** (list your current reference URLs)\n' +
  '5. **bib, bibliography, citations** (display the bibliography page using your references)\n' +
  '6. **help** (what you are reading now)\n' +
  '7. **exit, leave** (tell the bot to remove itself from the room)'

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
    const removeIndex = +trigger.args[2] || +trigger.args[3] || '0' // if the second or third arg is not a number, then use 0
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

const roomsDir = 'src/rooms' // relative to the root dir
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
  setEntries(bot, []) // destroys the old list of references
  bot.say('References Cleared.')
}

function addReference(bot, inputs) {
  addEntry(bot, {
    reference: inputs.Reference,
    citation: formatCitationData(inputs)
  })
  bot.say('Reference Added for ' + inputs.Reference + '.')
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
    bot.say('Bibliography:').then(() => bot.sendCard(cardJSON, 'JSON Card could not be loaded...'))
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
  const getField = field => (citationData[field] || '').trim() // safe access which wont return undefined
  switch (getField('format') || 'MLA') {
    case 'MLA':
      return `${getField('Author')}. "${getField('Title')}." ${getField('Container')}, ${getField('Reference')}`
    case 'APA':
      return `${getField('Author')}. "${getField('Title')}." ${getField('Container')}, ${getField('Reference')}`
  }
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
            items: entries.map(entry => ({
              type: 'TextBlock',
              text: entry.citation,
              size: 'medium', // maybe use 'medium'
              wrap: true,
            }))
          }
        ]
      }
    ]
  }
}
const CITATION_FIELD_DATA_ARRAY = [
  {
    id: 'Reference',
    placeholder: 'Reference URL or Name'
  },
  {
    id: 'Author',
    placeholder: 'Author',
  },
  {
    id: 'Title',
    placeholder: 'Title',
  },
  {
    id: 'Container',
    placeholder: 'Container (News Network, Literary Work, etc..)',
  }
]
const CITATIONS_CHOICES = ['MLA', 'APA']
const SOURCE_TYPES = ['Book', 'Article', 'Website']

function inputCardItem(fieldData) {
  return {
    type: "Input.Text",
    id: fieldData.id,
    placeholder: fieldData.placeholder
  }
}

function choiceCardItem(inputID, options) {
  return [
    {
      type: "TextBlock",
      text: "Citation Format"
    },
    {
      type: "Input.ChoiceSet",
      isMultiSelect: false,
      style: "compact",
      choices: options.map(option => ({
        title: option,
        value: option
      })),
      id: inputID
    }
  ]
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
              ...choiceCardItem('sourceType', SOURCE_TYPES),
              ...CITATION_FIELD_DATA_ARRAY.map(field => inputCardItem(field)),
              ...choiceCardItem('format', CITATIONS_CHOICES)
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
              "type": "add reference" // this is where 
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

// entries are the arrays of { reference, citation } dicts
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

