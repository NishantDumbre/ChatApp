const sequelize = require('../utils/database')
const { Sequelize, DataTypes } = require('sequelize');

 

const Users = sequelize.define('users',{
    id:{
        primaryKey:true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, 
    },
    name:{
        type: Sequelize.STRING,
        allowNull:false
    },
    email:{
        type: Sequelize.STRING,
        unique:true,
        allowNull:false
    },
    phone:{
        type: Sequelize.STRING,
        unique:true,
        allowNull:false
    },
    password:{
        type: Sequelize.STRING,
        allowNull:false
    },
})

module.exports = Users