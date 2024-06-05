const Sequelize = require('../utils/database')
const Users = require('../models/users')
const Messages = require('../models/messages')
const Groups = require('../models/groups')
const UserGroup = require('../models/user-groups');

const { Op, QueryTypes } = require('sequelize');



// Creates a group. The one who creates the group is ADMIN by default
exports.createGroup = async (req, res, next) => {
    const t = await Sequelize.transaction();

    try {
        const { groupName } = req.params
        const admin = []
        const members = []

        const group = await Groups.create({
            name: groupName,
        }, { transaction: t });


        const currentUser = await Users.findOne({ where: { id: req.user.id } });
        let { id, email, name } = currentUser.dataValues
        admin.push({ id, email, name })
        await group.addUser(currentUser, { through: { role: 'ADMIN' }, transaction: t });

        for (let data of req.body) {
            let user = await Users.findOne({ where: { id: data } })
            let { id, name } = user.dataValues
            members.push({ id, name })
            await group.addUser(user, { transaction: t });
        }

        t.commit()
        res.status(200).json({ success: true, admin, members, name: groupName, id: group.id })
    } catch (error) {
        await t.rollback()
        console.log(error)
    }
}



// Sends message in a group
exports.sendMessage = async (req, res, next) => {
    const t = await Sequelize.transaction();
    try {
        const { receiver, message } = req.body
        const { user } = req
        const receiverDetails = await Groups.findByPk(receiver)

        const newMessage = await Messages.create({
            message,
            sender: user.id,
            groupId: receiverDetails.id,
            category: 'GROUP'
        }, { transaction: t })
        const details = {
            sender: { id: user.id, name: user.name },
            receiver: { id: receiverDetails.id },
            loggedInUser: { id: user.id, name: user.name },
            messageDetails: { id: newMessage.id }
        }
        await t.commit()
        res.status(201).json({ success: true, details })
    } catch (error) {
        await t.rollback
        console.log(error)
        res.status(400).json(error)
    }
}



// Gets all group messages
exports.getGroupMessages = async (req, res, next) => {
    const groupId = req.body.receiver
    const loggedInUser = req.user
    try {
        const allMessages = await Messages.findAll({
            where: { groupId }, // Assuming groupId is defined elsewhere
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Users,
                    as: 'Sender', // Alias for the included Users model
                    attributes: ['id', 'name'] // Retrieve only the 'name' attribute from the Users table
                }
            ],
            attributes: ['message', 'createdAt', 'groupId']
        });
        
        const messages = allMessages.map(message => ({
            Sender: { id: message.Sender.dataValues.id, name: message.Sender.dataValues.name },
            Receiver: { id: message.groupId, id: message.name },
            message: message.message,
        }));

        res.status(200).json({ messages, loggedInUser: { id: loggedInUser.id } })
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}





// Gets the existing members of a group
exports.getExistingGroupMembers = async (req, res, next) => {
    const { groupId } = req.params

    try {
        const group = await Groups.findOne({
            where: { id: groupId }
        });

        if (!group) {
            throw new Error('Group not found');
        }
        const users = await group.getUsers({
            attributes: ['name', 'Id'],
        });
        res.status(200).json(users)

    } catch (error) {
        console.error('Error fetching users by group secret ID:', error);
        throw error;
    }
}



// fetches the users that are not present in the group
exports.getAddGroupMembers = async (req, res, next) => {
    const { groupId } = req.params

    try {
        const groupUserIds = await UserGroup.findAll({
            where: { groupId },
            attributes: ['userId']
        })

        let ids = groupUserIds.map(entry => entry.dataValues.userId);

        const nonGroupMembers = await Users.findAll({
            where: {
                id: { [Op.notIn]: ids }
            },
            attributes: ['name', 'Id']
        });
        res.status(200).json({ success: true, nonGroupMembers })

    } catch (error) {
        res.status(400).json({ success: false, error })
    }
}



// Leaves the group
exports.leaveGroup = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { groupId } = req.body;
    const t = await Sequelize.transaction()
    try {
        const isAdmin = await UserGroup.findOne({
            where: { userId: currentUserId, groupId }
        });

        let nextAdmin = null
        if (isAdmin.role == 'ADMIN') {
            const allAdmins = await UserGroup.findAll({
                where: { role: 'ADMIN', groupId }
            })
            if (isAdmin && allAdmins.length == 1) {
                const randomValue = await Sequelize.query(
                    'SELECT id FROM usergroups WHERE groupId = :groupId ORDER BY RAND() LIMIT 1;',
                    {
                        replacements: { groupId },
                        type: QueryTypes.SELECT,
                    }
                );

                await UserGroup.update(
                    { role: 'ADMIN' },
                    { where: { id: randomValue[0].id } },
                    { transaction: t }
                );

                const newAdmin = await UserGroup.findOne({
                    where: { id: randomValue[0].id }
                });

                nextAdmin = newAdmin.id
            }
        }

        await UserGroup.destroy({
            where: { userId: currentUserId, groupId }
        }, { transaction: t });

        await t.commit()
        res.status(200).json({ success: true, nextAdmin });
    } catch (error) {
        await t.rollback()
        console.log(error)
        res.status(400).json({ error: error.message });
    }
};



// Checks if a user is admin of te group or not
exports.checkGroupAdmin = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { groupId } = req.params

    try {
        const admin = await UserGroup.findOne({
            where: { userId: currentUserId, groupId: groupId }
        });

        if (admin.dataValues.role == 'MEMBER') {
            throw new Error('User is not an admin');
        }

        res.status(200).json({ success: true, message: 'User is an admin' })

    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
}



// Deletes a member from an existing group
exports.deleteGroupMember = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { groupId, removeUserId } = req.body;
    const t = await Sequelize.transaction()
    try {
        const admin = await UserGroup.findOne({
            where: { userId: currentUserId, groupId }
        });

        if (!admin) {
            throw new Error('User is not an admin');
        }

        await UserGroup.destroy({
            where: { id: removeUserId }
        }, { transaction: t });

        await t.commit()
        res.status(200).json({ success: true });
    } catch (error) {
        await t.rollback()
        res.status(400).json({ error: error.message });
    }
};



// Adds a member to an existing group
exports.addMemberExistingGroup = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { groupId, addUserId } = req.body;
    const t = await Sequelize.transaction()
    try {
        const admin = await UserGroup.findOne({
            where: { userId: currentUserId, groupId }
        });

        if (!admin) {
            throw new Error('User is not an admin');
        }

        const group = await Groups.findOne({ where: { id: groupId } });

        await group.addUser(addUserId, { through: { role: 'MEMBER' }, transaction: t });

        await t.commit()
        res.status(200).json({ success: true });
    } catch (error) {
        await t.rollback()
        console.log(error)
        res.status(400).json({ error: error.message });
    }
};



// Adds a member to an existing group
exports.makeUserAdmin = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { groupId, userGroupId } = req.body;
    const t = await Sequelize.transaction()
    try {
        const admin = await UserGroup.findOne({
            where: { userId: currentUserId, groupId }
        });

        if (!admin) {
            throw new Error('User is not an admin');
        }

        await UserGroup.update(
            { role: 'ADMIN' },
            { where: { id: userGroupId } },
            { transaction: t }
        );

        await t.commit()
        res.status(200).json({ success: true });
    } catch (error) {
        await t.rollback()
        console.log(error)
        res.status(400).json({ error: error.message });
    }
};



// Delete group and its messages

exports.deleteGroup = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { deleteGroupId } = req.body;
    const t = await Sequelize.transaction()
    try {
        const admin = await UserGroup.findOne({
            where: { userId: currentUserId, groupId: deleteGroupId }
        });

        if (!admin) {
            throw new Error('User is not an admin');
        }

        await UserGroup.destroy({ where: { groupId: deleteGroupId }, transaction: t })
        await Messages.destroy({ where: { groupId: deleteGroupId }, transaction: t })
        await Groups.destroy({ where: { id: deleteGroupId }, transaction: t })

        await t.commit()
        res.status(200).json({ success: true })
    } catch (error) {
        await t.rollback()
        console.log(error)
        res.status(400).json({ error: error.message });
    }
}