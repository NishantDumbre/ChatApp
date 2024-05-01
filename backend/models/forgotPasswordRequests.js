const sequelize = require('../util/database')
const Sequelize = require('sequelize')

const PasswordRequest = sequelize.define('passwordRequest',{
    id:{
        primaryKey:true,
        type: Sequelize.STRING,
        allowNull:false
    },
    email:{
        type: Sequelize.STRING,
        unique:true,
        allowNull:false
    },
})

module.exports = PasswordRequest