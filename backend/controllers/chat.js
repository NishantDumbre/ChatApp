const Sequelize = require('../utils/database')
const Users = require('../models/users')
const Groups = require('../models/groups')
const Messages = require('../models/messages')

const { Op } = require('sequelize');





exports.getContacts = async (req, res, next) => {
    let loggedinUser = req.user
    try {
        const user = await Users.findByPk(req.user.id)
        const groups = await user.getGroups()
        const contacts = await Users.findAll({
            where: { id: { [Op.not]: loggedinUser.id } }, attributes: ['name', 'email', 'id']
        })
        res.status(200).json({ succees: true, contacts, groups })
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: 'Error fetching users' })
    }
}




exports.postSendMessage = async (req, res, next) => {
    const t = await Sequelize.transaction();
    try {
        const { user } = req
        const receiver = await Users.findByPk(req.body.receiver)

        const message = await Messages.create({
            message: req.body.message,
            user1: user.id,
            user2: receiver.id,
            sender: user.id,
        }, { transaction: t })

        const details = { myId: user.id, sender: user.id }
        await t.commit()
        res.status(200).json({ success: true, details })

    } catch (error) {
        await t.rollback()
        res.status(400).json({ success: false, message: 'Error getting ID' })
    }
}




exports.getAllMessagesBetweenUsers = async (req, res, next) => {
    try {
        const user1Id = req.user.id
        const user2Id = req.body.receiver
        console.log(req.body)
        console.log(user2Id, user1Id)
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
