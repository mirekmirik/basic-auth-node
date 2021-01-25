require('dotenv').config()
const express = require('express')
const app = express()
const PORT = 3000
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { Schema } = mongoose






app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))



app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/views/register.htm')
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.htm')
})

app.get('/main', (req, res) => {
    res.send('Вы успешно вошли в аккаунт')
})




const authSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    login: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const Auth = mongoose.model('Auth', authSchema)

//Регистрация
app.post('/register', async (req, res) => {
    const { username, login, password } = req.body
    const candidate = await Auth.findOne({ login })
    if (candidate) {
        res.json({ 'error': 'этот пользователь уже зарегистрирован, пожалуйста укажите другое имя' })
    } else {
        const hashPassword = await bcrypt.hash(password, 10)
        const authRegister = new Auth({
            username,
            login,
            password: hashPassword
        })
        await authRegister.save((err, data) => {
            if (err) {
                res.json({ error: 'что-то пошло не так попробуйте еще раз' })
            } else {
                res.json({
                    message: 'Вы успешно зарегистрировались, ваши данные:',
                    username: data.username,
                    login: data.login,
                    password: data.password
                })
            }
        })
    }
})
//Вход
app.post('/login', async (req, res) => {
    //Вход админа
    const { username, login, password } = req.body
    if (req.body.login == 'mrslvbndk') {
        const admin = await Auth.findOne({ login })
        if (admin) {
            const areSame = await bcrypt.compare(password, admin.password)
            if (areSame) {
                res.send('Вы вошли в систему как администратор!')
            } else {
                res.json({
                    error: 'У вас другой пароль'
                })
            }
        } else {
            res.json({
                'error': 'Такого пользователя не существует'
            })
        }
    }

    //Вход обычного пользователя
    const candidate = await Auth.findOne({ login })
    if (candidate) {
        const areSame = await bcrypt.compare(password, candidate.password)
        if (areSame) {
            res.redirect('/main')
        } else {
            res.json({
                error: 'У вас другой пароль'
            })
        }
    } else {
        res.json({
            'error': 'Такого пользователя не существует'
        })
    }
})









async function start() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useFindAndModify: true,
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    app.listen(PORT, () => console.log(`The server has been started on PORT ${3000}`))
}
start()
