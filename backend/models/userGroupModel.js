const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const UserGroup = sequelize.define('usergroup', {
    role: {
        type: DataTypes.ENUM('member', 'admin'),
        defaultValue: 'member'
    }
});

module.exports = UserGroup;
