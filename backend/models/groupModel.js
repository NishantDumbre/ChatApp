const sequelize = require('../util/database')
const Sequelize = require('sequelize')
const { v4: uuidv4 } = require('uuid');

const Groups = sequelize.define('groups',{
    id:{
        autoIncrement:true,
        primaryKey:true,
        type: Sequelize.INTEGER,
        allowNull:false
    },
    name:{
        type: Sequelize.STRING,
        allowNull:false
    },
    secretId:{
        type: Sequelize.STRING,
        defaultValue: uuidv4()
    }
})

module.exports = Groups