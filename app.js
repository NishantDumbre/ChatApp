const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importing socket.io
const http = require('http');
const socketIo = require('socket.io');

const routes = require('./backend/routes/routes');
const sequelize = require('./backend/util/database');
const Users = require('./backend/models/usersModel');
const Groups = require('./backend/models/groupModel');
const UserGroup = require('./backend/models/userGroupModel');
const Messages = require('./backend/models/messagesModel');
const ForgotPasswordRequest = require('./backend/models/forgotPasswordRequests');

const app = express();
const server = http.createServer(app); // Creating HTTP server

app.use(helmet());
app.use(compression());
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST']
}));
app.use(bodyParser.json({ extended: false }));

// User and password requests
Users.hasMany(ForgotPasswordRequest, {
    foreignKey: 'userId', // This is the foreign key in the ForgotPasswordRequest table
    onDelete: 'CASCADE' // If a user is deleted, also delete their associated forgot password requests
});

// Messages and Users
Messages.belongsTo(Users, { foreignKey: 'user1', as: 'User1' });
Messages.belongsTo(Users, { foreignKey: 'user2', as: 'User2' });

// Users and Groups many to many
Groups.belongsToMany(Users, { through: UserGroup });
Users.belongsToMany(Groups, { through: UserGroup });


app.use(routes);


sequelize.sync()
    .then(() => {
        app.listen(3000)
    })
    .catch((err) => console.log(err));
