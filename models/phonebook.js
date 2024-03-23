const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
const url = process.env.MONGODB_URI

mongoose.connect(url)
	.then(() => {
		console.log('Connected to MongoDB')
	}).catch(error => {
		console.log('Error connecting to MongoDB:', error.message)
	})

const phonebookSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: [true, 'Name is required!']
	},
	number: {
		type: String,
		minLength: 8,
		required: [true, 'Person\'s phone number is required!'],
		validate: {
			validator: function(v) {
				return /\d{4}-\d{3}-\d{3}$/.test(v)
			},
			message: props => `${props.value} is not a valid phone number!`
		}
	}
})

phonebookSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Entry', phonebookSchema)