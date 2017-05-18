const c2j = require('csvtojson')

const corpus = []
const ids = {}
let categories
const categoriesObj = {}
const related = {}

const questionRegex = /Question: (\d+)/

function addToGrouping(grouping, category, obj) {
  if(!grouping[category]) grouping[category] = [obj]
  else grouping[category].push(obj)
}

c2j()
  .fromFile('../ask.csv')
  .on('json', obj => {
    obj.SubCategories = obj.SubCategories.split(' | ').filter(x => x)
    obj.RelatedQuestions = obj.RelatedQuestions.split(' | ')
      .filter(x => x)
      .map(question => question.match(questionRegex)[1])

    corpus.push(obj)

    ids[obj.ASK_ID] = obj

    obj.SubCategories.forEach(category => {
      addToGrouping(categoriesObj, category, obj)
    })

    obj.RelatedQuestions.forEach(question => {
      addToGrouping(related, obj.ASK_ID, question)
    })
  })
  .on('done', () => {
    categories = Object.keys(categoriesObj)
    console.log(`${corpus.length} questions loaded`)
    console.log(`${categories.length} categories`)

    ask(['mortgage', 'credit', 'score'])
  })

function incr(obj, key) {
  if(obj[key]) return obj[key]++
  return obj[key] = 1
}

function ask(tokens) {
  const categoryHits = {}
  const tokenHits = {}

  corpus.forEach(obj => {
    tokens.forEach(token => {
      if(obj.Question.match(token)){
        incr(tokenHits, obj.ASK_ID)
        obj.SubCategories.forEach(category => incr(categoryHits, category))
      }
    })
  })
console.log(categoryHits['Definitions'])
  console.log('\nBest matched categories:\n', Object.keys(categoryHits).sort((a,b) => {
    return categoryHits[b] - categoryHits[a]
  }).slice(0,3))
  console.log('\nPossible questions:\n', Object.keys(tokenHits).sort((a,b) => {
    return tokenHits[b] - tokenHits[a]
  }).slice(0,10).map(v=>{return ids[v].Question}))
}
