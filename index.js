require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  }))

let persons = 
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/info', (request, response) => {
    Person.find({}).then(persons => {
        const info = `Phonebook has info for ${persons.length} people`
        const currentDate = new Date()
        response.send(`<p>${info}<br/>${currentDate}<\p>`)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    Person.deleteOne({ id: id })
        .then(result => {
            if (result.deletedCount === 0) {
                return response.status(404).send({ error: 'Person not found' });
            }
            response.status(204).end();
        })
})

app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (body.name === undefined) {
        return response.status(400).json({
             error: 'name is missing' 
        })
      } 
    else if (body.number === undefined) {
        return response.status(400).json({ 
            error: 'number is missing' 
        })
    } 
    else if (persons.some(person => person.name === body.name)) {
        return response.status(400).json({ 
            error: 'name already exists in the phonebook' 
        })
    }
  
    const person = new Person({
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 1000000),
    })

    console.log(person)

    person.save().then(savedPerson => {
        response.json(savedPerson)
        })
  })

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


