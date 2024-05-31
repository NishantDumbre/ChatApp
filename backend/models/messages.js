const sequelize = require('../utils/database')
const { Sequelize, DataTypes } = require('sequelize')

const Messages = sequelize.define('messages',{
    id:{
        primaryKey:true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    message:{
        type: Sequelize.STRING,
    },
    sender:{
        type: DataTypes.UUID,
    },
    receiver:{
        type: DataTypes.UUID,
    },
    category:{
        type: DataTypes.ENUM('USER', 'GROUP'),
        defaultValue: 'USER'
    }
})

module.exports = Messages