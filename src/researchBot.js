const fs = require('fs')
const mkdirp = require('mkdirp')

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
    bot.sendCard(addReferenceCard(bot), 'The Response Could not be loaded properly.')
  })

  framework.hears(/rm|remove|remove reference/i, function (bot, trigger) {
    callback('remove')
    const removeIndex = +trigger.args[2] || +trigger.args[3] || 0 // if the second or third arg is not a number, then use 0
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
    clearEntries(bot)
  }
}

function clearReferences(bot) {
  clearEntries(bot) // destroys the old list of references
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
  if (index >= 1 && index <= getEntries(bot).length) {
    const referenceToRemove = getEntries(bot)[index - 1].reference
    removeEntry(bot, index - 1)
    bot.say('Removed ' + referenceToRemove + ' from references.')
  } else {
    bot.say('Invalid index ' + index + ' in reference set.')
  }
}

function printReferences(bot) {
  if (getEntries(bot).length > 0) {
    let counter = 1
    bot.say('markdown', getEntries(bot).reduce((acc, entry) => acc + `\n${counter++}. ${entry.reference}`, 'References:'));
  } else {
    bot.say('There are currently no references.')
  }
}

function printCitations(bot) {
  if (getEntries(bot).length > 0) {
    let counter = 1
    bot.say('markdown', getEntries(bot).reduce((acc, entry) => acc + `\n${counter++}. ${entry.citation}`, 'Bibliographies:'))
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
  const dateInfo = new Date().toDateString().split(' ')
  switch (getField('format') || 'MLA') {
    default:
      return `${getField('Authors')}.` +
        ` "${getField('Title')}."` +
        ` _${getField('Container')}_,` +
        ` ${getField('Publish Date')},` +
        ` ${getField('Reference')}. Accessed ${+dateInfo[2]} ${dateInfo[1]} ${dateInfo[3]}.`
  }
}

const CITATION_FIELD_DATA_ARRAY = [
  {
    id: 'Reference',
    placeholder: 'Reference URL or Name'
  },
  {
    id: 'Authors',
    placeholder: 'Authors',
  },
  {
    id: 'Title',
    placeholder: 'Title',
  },
  {
    id: 'Publish Date',
    placeholder: 'Date Published'
  },
  {
    id: 'Container',
    placeholder: 'Container (News Network, Literary Work, etc..)',
  }
]
const CITATIONS_CHOICES = ['MLA', 'APA']
const SOURCE_TYPES = ['Website', 'Book', 'Article']

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
    "version": "1.0"
  }
}

// entries are the arrays of { reference, citation } dicts
function getEntries(bot) {
  return roomData[bot.room.id]
}

function addEntry(bot, entry) {
  roomData[bot.room.id].push(entry)
  roomData[bot.room.id].sort((a, b) => a.citation < b.citation ? -1 : 1);
  mkdirp(roomsDir).then(() => fs.writeFileSync(`${roomsDir}/${bot.room.id}.json`, JSON.stringify(roomData[bot.room.id], null, 2)))
}

function removeEntry(bot, index) {
  roomData[bot.room.id].splice(index, 1)
  mkdirp(roomsDir).then(() => fs.writeFileSync(`${roomsDir}/${bot.room.id}.json`, JSON.stringify(roomData[bot.room.id], null, 2)))
}

function clearEntries(bot) {
  roomData[bot.room.id] = []
  mkdirp(roomsDir).then(() => fs.writeFileSync(`${roomsDir}/${bot.room.id}.json`, '[]'))
}

