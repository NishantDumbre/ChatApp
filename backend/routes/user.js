const chatController = require('../controllers/chat')
const { authenticate } = require('../middlewares/authenticate')
const { generatePresignedUrl } = require('../services/S3Services')

const { Router } = require('express')
const router = Router()


router.get('/get-contacts', authenticate, chatController.getContacts)
router.post('/send-user-message', authenticate, chatController.postSendMessage)
router.post('/get-user-messages', authenticate, chatController.getAllMessagesBetweenUsers)
router.get('/get-last-message/:lastMessageId', authenticate, chatController.getLastMessageBetweenUsers)

router.get('/get-S3-presignedURL/:fileName', authenticate, generatePresignedUrl)


module.exports = router