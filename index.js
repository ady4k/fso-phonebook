const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', function (req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
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

const generateId = () => {
    const maxId = persons.length > 0 ? Math.max(...persons.map(n => n.id)) : 0
    return maxId + 1
}

app.get('/', (request, response) => {
    response.send('<h1>/api/persons - full list<br>/info - info about phonebook</h1>')
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people.<br><br>${new Date()}`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const person = persons.find(x => x.id === Number(request.params.id))
    if (!person) {
        return response.status(404).end()
    }

    response.json(person)
})

app.post('/api/persons/', (request, response) => {
    const id = Math.floor(Math.random() * 999999999)
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or number is missing.'
        })
    }

    if (persons.find(x => x.id === id)) {
        return response.status(400).json({
            error: `A person with id ${id} already exists in the phonebook!`
        })
    }

    if (persons.find(x => x.name === body.name)) {
        return response.status(400).json({
            error: 'Name must be unique.',
            message: `A person with the name ${body.name} already exists in the phonebook!`,
        })
    }

    const person = {
        id: id,
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    response.status(201).json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(x => x.id === id)
    if (person) {
        persons = persons.filter(x => x !== person)
        response.status(204).end()
    } else {
        response.status(400).json({
            error: `Person with id ${id} does not exist in the phonebook.`
        })
    }
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})