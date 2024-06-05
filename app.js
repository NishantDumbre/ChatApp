// Nodejs core modules
const fs = require('fs');
const path = require('path');


// Nodejs npm installed modules
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');


// Importing socket.io
const {createServer} = require('http')
const {Server} = require('socket.io')


// Utils
const sequelize = require('./backend/utils/database');
// Models
const User = require('./backend/models/users');
const Group = require('./backend/models/groups');
const UserGroup = require('./backend/models/user-groups');
const Message = require('./backend/models/messages');
const ForgotPasswordRequest = require('./backend/models/forgot-password-requests');


// Route imports
const homepageRoutes = require('./backend/routes/homepage');
const userRoutes = require('./backend/routes/user');
const groupRoutes = require('./backend/routes/group');



// Setting up server
const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
    cors:{
        origin: "*"
    }
})


//* socket.io connections
io.on('connect', (socket) => {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    console.log(socket.id)
    socket.on('newMessage', (lastMessageId) => {
      io.emit('newMessage', lastMessageId);
    });
  })


// Middlewares
app.use(helmet());
app.use(compression());
app.use(bodyParser.json({ extended: false }));


// Routes
app.use(homepageRoutes);
app.use(userRoutes);
app.use(groupRoutes);


/* ---------- Database relations start ---------- */

// User -> ForgotPasswordRequest : one to many
User.hasMany(ForgotPasswordRequest, {
    foreignKey: 'userId', 
    onDelete: 'CASCADE' 
});

// Message -> User : one to one  (specified 2 foreign keys)
Message.belongsTo(User, { foreignKey: 'sender', as: 'Sender' });
Message.belongsTo(User, { foreignKey: 'receiver', as: 'Receiver' });


// User -> Group : many to many
Group.belongsToMany(User, { through: UserGroup });
User.belongsToMany(Group, { through: UserGroup });

// Group -> Message : one to many
Group.hasMany(Message)
Message.belongsTo(Group)

/* ---------- Database relations end ---------- */


// Sync and start the server
sequelize.sync()
    .then(() => {
        server.listen(3000)
    })
    .catch((err) => console.log(err));
