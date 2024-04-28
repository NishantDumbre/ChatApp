const sequelize = require('../util/database')
const Sequelize = require('sequelize')

const passwordRequest = sequelize.define('passwordRequest',{
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

module.exports = passwordRequest