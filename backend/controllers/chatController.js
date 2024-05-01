const Sequelize = require('../util/database')
const Users = require('../models/usersModel')
const ForgotPasswordRequest = require('../models/forgotPasswordRequests')
const Messages = require('../models/messagesModel')

const { Op } = require('sequelize');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



function generateToken(id, name) {
    return jwt.sign({ userId: id, name }, process.env.TOKEN_SECRET_KEY)
}



exports.getContacts = async (req, res, next) => {
    let loggedinUser = req.user
    try {

        let contacts = await Users.findAll({ where: { id: { [Op.not]: loggedinUser.id } } })
        res.status(200).json({ succees: true, contacts })
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error fetching users' })
    }
}



exports.getUserId = async (req, res, next) => {
    try {
        const { email } = req.params
        let user = await Users.findOne({ where: { email } })
        res.status(200).json({ success: true, token: generateToken(user.dataValues.id, user.dataValues.name), name:user.dataValues.name})
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error getting ID' })
    }
}




exports.postSendMessage = async (req, res, next) => {
    const t = await Sequelize.transaction();
    try {
        console.log(req.user.name)
        console.log(req.user2.name)

        let message = await Messages.create({
            message: req.body.message,
            user1: req.user.id,
            user2: req.user2.id,
            sender: req.user.id
        }, { transaction: t })

        let details = {myId: req.user.id, sender: req.user.id}

        await t.commit()
        res.status(200).json({ success: true, details })

    } catch (error) {
        await t.rollback()
        res.status(400).json({ success: false, message: 'Error getting ID' })
    }
}




exports.getAllMessagesBetweenUsers = async (req, res, next) => {
    try {
        console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`)
        const user1Id = req.user.id
        const user2Id = req.user2.id

        const messages = await Messages.findAll({
            where: {
                [Op.or]: [
                    { user1: user1Id, user2: user2Id },
                    { user1: user2Id, user2: user1Id }
                ]
            },
            include: [
                { model: Users, as: 'User1' },
                { model: Users, as: 'User2' }
            ],
            order: [['createdAt', 'ASC']]
        });
        
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
