let passport = require('passport')

let User = require('../models/User')

const postLogin = (req, res, next) => {
  req.assert('username', 'Username cannot be blank.').notEmpty()
  req.assert('password', 'Password cannot be blank.').notEmpty()
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      // Return an array of validation error messages.
      const message = result.useFirstErrorOnly().array().map(error => error.msg)
      return res.status(400).json({ message })
    }
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return res.status(401).json(info)
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err)
        }

        return res.status(200).json({
          username: user.username,
        })
      })
    })(req, res, next)
  })
}

const postRegister = (req, res, next) => {
  req.assert('username', 'UserName cannot be blank.').notEmpty()
  req.assert('password', 'Password cannot be blank.').notEmpty()

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      // Return an array of validation error messages.
      const message = result.useFirstErrorOnly().array().map(error => error.msg)
      return res.status(400).json({ message })
    }
    User.findOne({username:req.body.username}, (err, user) => {
      if(err) {
        return next(err)
      }
      if(user) {
        return res.status(400).json({
          message: 'Username already exists.',
        })
      }
      var user = new User({
        username: req.body.username,
        password: req.body.password,
      })
      user.save((err) => {
        if(err) {
          return next(err)
        }
        return res.status(200).json({
          username: user.username,
          password: user.password
        })
      })
    })

  })
}

const getLogout = (req, res) => {
  req.logout()
  return res.status(200).end()
}

const getProfile = (req, res, next) => {
  User.findById(req.user._id, (err, user) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.status(400).end()
    }

    return res.status(200).json({
      username: user.username,
    })
  })
}

module.exports = {
  postLogin,
  getLogout,
  postRegister,
  getProfile,
};
