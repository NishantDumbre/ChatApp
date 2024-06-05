const Sequelize = require('../utils/database')
const Users = require('../models/users')
const Groups = require('../models/groups')
const Messages = require('../models/messages')

const { Op } = require('sequelize');





exports.getContacts = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const loggedInUserName = req.user.name.split(" ")[0]
        // Get all groups associated with the logged-in user along with their latest message
        const groups = await Groups.findAll({
            attributes: ['name', 'id'],
            include: [
                {
                    model: Messages,
                    where: {
                        category: 'GROUP'
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 1 // Get only the latest message
                }
            ]
        });

        // Get all contacts excluding the logged-in user along with their latest message
        const contacts = await Users.findAll({
            where: {
                id: {
                    [Op.not]: loggedInUserId
                }
            },
            attributes: ['name', 'id'],
            include: [
                {
                    model: Messages,
                    as: 'SentMessages', // Alias for sender messages
                    where: {
                        receiver: loggedInUserId,
                        category: 'USER'
                    },
                    attributes: ['createdAt'],
                    order: [['createdAt', 'DESC']],
                    limit: 1 // Get only the latest message
                },
                {
                    model: Messages,
                    as: 'ReceivedMessages', 
                    where: {
                        sender: loggedInUserId,
                        category: 'USER'
                    },
                    attributes: ['createdAt'],
                    order: [['createdAt', 'DESC']],
                    limit: 1 // Get only the latest message
                }
            ]
        });

        const allContacts = groups.concat(contacts);

        allContacts.sort((a, b) => {
            const getLastMessageTime = contact => {
                const latestMessage = contact.Messages?.[0] || 
                    contact.SentMessages?.[0] ||
                    contact.ReceivedMessages?.[0];
                return latestMessage ? new Date(latestMessage.createdAt) : new Date(0);
            };
        
            const lastMessageTimeA = getLastMessageTime(a);
            const lastMessageTimeB = getLastMessageTime(b);
        
            // Compare the timestamps of the last messages
            return lastMessageTimeB - lastMessageTimeA;
        });

        
        res.status(200).json({ success: true, contacts: allContacts, loggedInUserName });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, message: 'Error fetching contacts and groups' });
    }
};






exports.postSendMessage = async (req, res, next) => {
    const t = await Sequelize.transaction();
    try {
        const { user } = req
        const { receiver, message } = req.body
        const receiverDetails = await Users.findByPk(receiver)


        const newMessage = await Messages.create({
            message,
            sender: user.id,
            receiver: receiverDetails.id
        }, { transaction: t })
        const details = {
            sender: { id: user.id, name: user.name },
            receiver: { id: receiverDetails.id, name: receiverDetails.name },
            loggedInUser: { id: user.id, name: user.name },
            messageDetails: { id: newMessage.id }
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
        const {currentPage, receiver} = req.body
        console.log(req.body, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        const messageLimit = 8
        const messages = await Messages.findAll({
            where: {
                [Op.or]: [
                    { sender: loggedInUser.id, receiver: receiver },
                    { sender: receiver, receiver: loggedInUser.id }
                ]
            },
            include: [
                { model: Users, as: 'Sender', attributes: ['id', 'name'] },
                { model: Users, as: 'Receiver', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']],
            attributes: ['message'],
            offset: Number(currentPage) * messageLimit,
            limit: messageLimit
        });
        res.status(200).json({ messages, loggedInUser: { id: loggedInUser.id } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.getLastMessageBetweenUsers = async (req, res, next) => {
    try {
        const loggedInUser = req.user
        const { lastMessageId } = req.params
        
        const message = await Messages.findByPk(lastMessageId, {
            include: [
                { model: Users, as: 'Sender', attributes: ['id', 'name'] },
                { model: Users, as: 'Receiver', attributes: ['id', 'name'] }
            ], attributes: ['message', 'createdAt', 'groupId']
        });

        res.status(200).json({ message, loggedInUser: { id: loggedInUser.id } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.getBucketInfo = async (req, res, next) => {
    try {
        const loggedInUser = req.user

        const data = getS3Bucket()

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};