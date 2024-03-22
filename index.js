require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Phonebook = require('./models/phonebook')


app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', function (req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/', (request, response) => {
    response.send('<h1>/api/persons - full list<br>/info - info about phonebook</h1>')
})

app.get('/info', (request, response) => {
    Phonebook.find({}).then(entries => {
        response.send(`<p>Phonebook has info for ${entries.length} people.<br><br>${new Date()}`)
    })
})

app.get('/api/persons', (request, response) => {
    Phonebook.find({}).then(entries => {
        response.json(entries)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Phonebook.findById(request.params.id)
        .then(entry => {
            if (entry) {
                response.json(entry)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/persons/', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or number is missing.'
        })
    }

    const entry = new Phonebook({
        name: body.name,
        number: body.number
    })

    entry.save().then(savedEntry => {
        response.json(savedEntry)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body =  request.body
    const entry = {
        name: body.name,
        number: body.number
    }

    Phonebook.findByIdAndUpdate(request.params.id, entry, { new: true })
        .then(updatedEntry => {
            response.json(updatedEntry)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Phonebook.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    if (error.name === 'ReferenceError') {
        return response.status(400).send({ error: 'missing field(s)' })
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})