const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const routes = require('./backend/routes/routes')
const sequelize = require('./backend/util/database')
const Users = require('./backend/models/usersModel')


const app = express()

app.use(helmet())
app.use(compression())
//app.use(morgan('combined', { stream: accessLogStream }))

app.use(cors())
app.use(bodyParser.json({ extended: false }));

app.use(routes)

sequelize.sync()
    .then(() => {
        app.listen(3000)
    })
    .catch((err) => console.log(err))