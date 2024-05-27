const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const UserGroup = sequelize.define('usergroup', {
    id:{
        primaryKey:true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    role: {
        type: DataTypes.ENUM('MEMBER', 'ADMIN'),
        defaultValue: 'MEMBER'
    }
});

module.exports = UserGroup;
