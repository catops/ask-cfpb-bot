const c2j = require('csvtojson')

const corpus = []
const ids = {}
const categories = {}
const related = {}

const questionRegex = /Question: (\d+)/

function addToGrouping(grouping, category, obj) {
  if(!grouping[category]) grouping[category] = [obj]
  else grouping[category].push(obj)
}

c2j()
  .fromFile('../ask.csv')
  .on('json', obj => {

    corpus.push(obj)

    ids[obj.ASK_ID] = obj

    obj.SubCategories.split(' | ')
      .forEach(category => {
        if(category) addToGrouping(categories, category, obj)
      })

    obj.RelatedQuestions.split(' | ')
      .forEach(question => {
        const match = question.match(questionRegex)
        if(match) addToGrouping(related, obj.ASK_ID, match[1])
      })
  })
  .on('done', () => {
    console.log(`${corpus.length} questions loaded`)
    console.log(`${Object.keys(categories).length} categories`)
  })
