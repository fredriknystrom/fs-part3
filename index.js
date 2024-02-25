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

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => { 
            if (result) {
                response.status(204).end();
                console.log("deleted person")
                console.log(result)
            }
            else {
                response.status(404).send({ error: 'Person not found' });
            }
            
        })
        .catch(error => next(error))
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

    person.save().then(savedPerson => {
        response.json(savedPerson)
        console.log("added new person")
        console.log(person)
        })
  })

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


