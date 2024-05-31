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
        const { receiver, message } = req.body
        const receiverDetails = await Users.findByPk(receiver)


        await Messages.create({
            message,
            sender: user.id,
            receiver: receiverDetails.id
        }, { transaction: t })
        const details = {
            sender: { id: user.id, name: user.name },
            receiver: { id: receiverDetails.id, name: receiverDetails.name },
            loggedInUser: { id: user.id, name: user.name }
        }
        await t.commit()
        res.status(200).json({ success: true, details })

    } catch (error) {
        await t.rollback()
        res.status(400).json({ success: false, message: 'Error getting ID' })
    }
}




exports.getAllMessagesBetweenUsers = async (req, res, next) => {
    try {
        const loggedInUser = req.user
        const otherUserOrGroup = req.body.receiver
        const messages = await Messages.findAll({
            where: {
                [Op.or]: [
                    { sender: loggedInUser.id, receiver: otherUserOrGroup },
                    { sender: otherUserOrGroup, receiver: loggedInUser.id }
                ]
            },
            include: [
                { model: Users, as: 'Sender', attributes: ['id', 'name'] },
                { model: Users, as: 'Receiver', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'ASC']],
            attributes: ['message']
        });
        console.log(messages)
        res.status(200).json({messages, loggedInUser:{id: loggedInUser.id}});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
