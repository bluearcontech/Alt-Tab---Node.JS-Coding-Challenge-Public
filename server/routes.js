let express = require('express')

let isAuthenticated = require('./middleware/passport')
let AuthController = require('./controllers/auth')

let router = new express.Router()

router.post('/login', AuthController.postLogin)
router.get('/logout', AuthController.getLogout)
router.post('/register', AuthController.postRegister)
router.get('/profile', isAuthenticated,  AuthController.getProfile)

module.exports = router
