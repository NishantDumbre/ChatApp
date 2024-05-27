const sequelize = require('../utils/database')
const { Sequelize, DataTypes } = require('sequelize');

const Groups = sequelize.define('groups',{
    id:{
        primaryKey:true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    name:{
        type: Sequelize.STRING,
        allowNull:false
    },
})

module.exports = Groups