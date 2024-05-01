const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const routes = require('./backend/routes/routes')
const sequelize = require('./backend/util/database')
const Users = require('./backend/models/usersModel')
const Messages = require('./backend/models/messagesModel')
const ForgotPasswordRequest = require('./backend/models/forgotPasswordRequests')


const app = express()

app.use(helmet())
app.use(compression())
//app.use(morgan('combined', { stream: accessLogStream }))

app.use(cors({
    origin:'http://127.0.0.1:5500',
    methods:['GET', 'POST']
}));

app.use(bodyParser.json({ extended: false }));



Users.hasMany(ForgotPasswordRequest, {
    foreignKey: 'userId', // This is the foreign key in the ForgotPasswordRequest table
    onDelete: 'CASCADE' // If a user is deleted, also delete their associated forgot password requests
});

Messages.belongsTo(Users, { foreignKey: 'user1', as: 'User1' });
Messages.belongsTo(Users, { foreignKey: 'user2', as: 'User2' });

app.use(routes)

sequelize.sync()
    .then(() => {
        app.listen(3000)
    })
    .catch((err) => console.log(err))