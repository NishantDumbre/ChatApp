const sequelize = require('../util/database')
const Sequelize = require('sequelize')
const { v4: uuidv4 } = require('uuid');
 

const Users = sequelize.define('users',{
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
    secretId:{
        type: Sequelize.STRING,
        defaultValue: uuidv4()
    }
})

module.exports = Users