const chatController = require('../controllers/chat')
const {authenticate} = require('../middlewares/authenticate')

const {Router} = require('express')
const router = Router()


router.get('/get-contacts', authenticate, chatController.getContacts)
router.post('/send-user-message', authenticate, chatController.postSendMessage) 
router.post('/get-user-messages', authenticate, chatController.getAllMessagesBetweenUsers) 



module.exports = router