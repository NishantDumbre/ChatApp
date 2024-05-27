const groupController = require('../controllers/group')
const {authenticate} = require('../middlewares/authenticate')

const {Router} = require('express')
const router = Router()


router.post('/send-group-message', authenticate, groupController.postSendMessage) 
router.post('/get-group-messages', authenticate, groupController.getGroupMessages) 

router.get('/check-group-admin/:groupId', authenticate, groupController.checkGroupAdmin) 
router.get('/get-existing-group-members/:groupId', authenticate, groupController.getGroupMembers) 
router.post('/delete-group-member/', authenticate, groupController.deleteGroupMember) 

router.get('/get-group-members-to-add/:groupId', authenticate, groupController.getAddGroupMembers) 
router.post('/create-group/:groupName', authenticate, groupController.createGroup)

module.exports = router