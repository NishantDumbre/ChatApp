const sequelize = require('../utils/database')
const { Sequelize } = require('sequelize');

const PasswordRequest = sequelize.define('passwordRequest',{
    id:{
        primaryKey:true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
    },
    email:{
        type: Sequelize.STRING,
        unique:true,
        allowNull:false
    },
})

module.exports = PasswordRequest


//pascal case for modals