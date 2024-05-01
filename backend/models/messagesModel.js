const sequelize = require('../util/database')
const Sequelize = require('sequelize')

const Messages = sequelize.define('messages',{
    id:{
        primaryKey:true,
        type: Sequelize.INTEGER,
        allowNull:false,
        autoIncrement: true,
    },
    message:{
        type: Sequelize.STRING,
    },
    user1:{
        type: Sequelize.INTEGER
    },
    user2:{
        type: Sequelize.INTEGER
    },
    sender:{
        type:Sequelize.INTEGER
    }
})

module.exports = Messages