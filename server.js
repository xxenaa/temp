const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const app = express()
const ejs = require('ejs')

app.set('view engine', 'ejs')

const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'

mongoose.connect('mongodb+srv://user:M2Zlp25kFD8cKnGr@cluster0.3wohx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})




app.set('static', path.join(__dirname, 'static'));
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(express.urlencoded())
app.use(express.json() );



app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))

// app.get('/', (req,res) =>{
// 	let name= 'Marina'

//     res.render('fuel',{
// 		username: name
// 	})
// })


//app.set('static','./static')

app.get('/project', (req,res) =>{
    res.sendFile(__dirname + '/static/Project.html')
})

app.get('/login', (req,res) =>{
    res.sendFile(__dirname + '/static/login.html')
})



var Schema = new mongoose.Schema({
	name: String,
    address: String,
	address2: String
})
var userA=mongoose.model('info', Schema)

app.get('/fuel', (req,res) =>{
	userA.find({}, function(err, data){
		res.render('fuel', {
			list: data
		})
	})
	
 })

app.post('/new',function(req,res){
	new userA({
		name: req.body.name,
		address: req.body.address,
		address2: req.body.addy2
	}).save(function(err,doc){
		if(err) res.json(err);
		else res.redirect('/fuel')
	})
})


app.get('/', function(req,res){
	var result = [];
	var cursor = userA.findOne({}, {}, { sort: { 'created_at' : -1 } })
	cursor.forEach(function(doc, err){
		assert.equal(null, err);
		resultArray.push(doc);
	  })
		res.render('fuel.ejs', {items: result})
})


// app.get('/view',function(req,res){
// 	userA.find({},function(err,docs){
// 		if(err) res.json(err);
// 			else res.render();
// 	})
// })

app.post('/api/login', async (req, res) => {
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
})

app.post('/api/register', async (req, res) => {
	const { username, password: plainTextPassword } = req.body

	if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be at least 6 characters'
		})
	}

	const password = await bcrypt.hash(plainTextPassword, 10)

	try {
		const response = await User.create({
			username,
			password
		})
		console.log('User created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Username already in use' })
		}
		throw error
	}

	res.json({ status: 'ok' })
})

app.listen(9999, () => {
	console.log('Server up at 9999')
})