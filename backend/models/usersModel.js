const sequelize = require('../util/database')
const Sequelize = require('sequelize')

 

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
        allowNull: false
    }
})

module.exports = Users