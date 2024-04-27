const userController = require('../controllers/usersController')

const {Router} = require('express')
const router = Router()

router.post('/signup', userController.signup)



module.exports = router