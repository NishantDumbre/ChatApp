const Sequelize = require('../utils/database')
const Users = require('../models/users')
const Messages = require('../models/messages')
const Groups = require('../models/groups')
const UserGroup = require('../models/user-groups');


const { Op } = require('sequelize');




exports.createGroup = async (req, res, next) => {
    const t = await Sequelize.transaction();

    try {
        const {groupName} = req.params
        const admin = []
        const members = []

        const group = await Groups.create({
            name: groupName,
        }, { transaction: t });


        const currentUser = await Users.findOne({ where: { id: req.user.id } });
        let { id, email, name } = currentUser.dataValues
        admin.push({ id, email, name })
        await group.addUser(currentUser, { through: { role: 'admin' }, transaction: t });

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





exports.postSendMessage = async (req, res, next) => {
    const t = await Sequelize.transaction();
    try {
        const { message, category, receiver } = req.body
        const { user } = req

        const sendMessage = await Messages.create({
            message,
            user1: user.id,
            groupId: receiver.id,
            sender: user.id,
            category
        }, { transaction: t })
        const details = { myId: user.id, sender: user.id }
        await t.commit()
        res.status(201).json({ success: true, details })
    } catch (error) {
        await t.rollback
        res.status(400).json(error)
    }
}




exports.getGroupMessages = async (req, res, next) => {
    const groupId = req.body.receiver
    const loggedInUser = req.user
    try {
        const messages = await Messages.findAll({
            where: { groupId }, // Assuming groupId is defined elsewhere
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Users,
                    as: 'Sender', // Alias for the included Users model
                    attributes: ['name'] // Retrieve only the 'name' attribute from the Users table
                }
            ],
            attributes: ['message', 'createdAt', 'sender']
        });
        res.status(200).json(messages, loggedInUser.name)
    } catch (error) {
        res.status(400).json(error)
    }
}




exports.getGroupMembers = async (req, res, next) => {
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


exports.checkGroupAdmin = async (req, res, next) => {
    const currentUserId = req.user.id;
    const { groupId } = req.params
    
    try {
        const admin = await UserGroup.findOne({
            where: { userId: currentUserId, groupId:groupId }
        });

        if (admin.dataValues.role == 'member') {
            throw new Error('User is not an admin');
        }
        
        res.status(200).json({success:true, message:'User is an admin'})

    } catch (error) {
        res.status(400).json({success:false, error})
    }
}




exports.deleteGroupMember = async (req, res, next) => {
    const groupId = req.body.groupId;
    const currentUserId = req.user.id;
    const { removeUserId } = req.body; 
    const t = await Sequelize.transaction()
    try {
        const admin = await UserGroup.findOne({
            where: { userId: currentUserId, groupId }
        });

        if (!admin) {
            throw new Error('User is not an admin');
        }
        const userToDelete = await Users.findOne({
            where: { Id: removeUserId }
        });

        if (!userToDelete) {
            throw new Error('User not found');
        }
        await UserGroup.destroy({
            where: { userId: userToDelete.id, groupId }
        }, {transaction:t});

        await t.commit()
        res.status(200).json({success:true});
    } catch (error) {
        await t.rollback()
        res.status(400).json({ error: error.message });
    }
};



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
            attributes:['name', 'Id']
        });
        res.status(200).json({success:true, nonGroupMembers})

    } catch (error) {
        res.status(400).json({success:false, error})
    }
}