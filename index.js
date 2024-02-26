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
        response.send(`<p>${info}<br/>${currentDate}<p>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => { 
            if (result) {
                response.status(204).end()
                console.log("deleted person")
                console.log(result)
            }
            else {
                response.status(404).send({ error: 'Person not found' })
            }
            
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const body = request.body

    const personUpdate = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(id, personUpdate, {new: true, runValidators: true, context: 'query'})
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson)
            }
        })
        .catch(error => next(error))
})

// Handling requests with unknown endpoint
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)


// Middleware for error handling
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } 
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


