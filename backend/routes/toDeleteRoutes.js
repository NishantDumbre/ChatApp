const userController = require('../controllers/users')
const chatController = require('../controllers/chat')
const groupController = require('../controllers/group')
const {authenticate, decodeUsers, decodeGroups} = require('../middlewares/authenticate')

const {Router} = require('express')
const router = Router()

router.post('/signup', userController.postSignup)
router.post('/login', userController.postLogin)
router.post('/forgot-password', userController.postForgotPassword)

router.get('/get-contacts', authenticate, chatController.getContacts)

router.post('/send-user-message', authenticate, chatController.postSendMessage) 
router.post('/send-group-message', authenticate, groupController.postSendMessage) 
router.post('/get-user-messages', authenticate, chatController.getAllMessagesBetweenUsers) 
router.post('/get-group-messages', authenticate, groupController.getGroupMessages) 



router.get('/check-group-admin/:groupToken', authenticate, groupController.checkGroupAdmin) 
router.get('/get-group-members/:groupToken', authenticate, groupController.getGroupMembers) 
router.post('/delete-group-member/', authenticate, decodeGroups, groupController.deleteGroupMember) 

router.get('/get-group-members-to-add/:groupToken', authenticate, groupController.getAddGroupMembers) 
router.post('/create-group/:group', authenticate, groupController.createGroup)

module.exports = router