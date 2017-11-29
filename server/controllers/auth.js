let passport = require('passport')

let User = require('../models/User')

const postLogin = (req, res, next) => {
  req.assert('email', 'Email cannot be blank.').notEmpty()
  req.assert('password', 'Password cannot be blank.').notEmpty()
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      // Return an array of validation error messages.
      const message = result.useFirstErrorOnly().array().map(error => error.msg)
      return res.status(400).json({ message })
    }
    req.body.username = req.body.email
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
          email: user.email,
        })
      })
    })(req, res, next)
  })
}

const postRegister = (req, res, next) => {
  req.assert('email', 'Email cannot be blank.').notEmpty()
  req.assert('password', 'Password cannot be blank.').notEmpty()

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      // Return an array of validation error messages.
      const message = result.useFirstErrorOnly().array().map(error => error.msg)
      return res.status(400).json({ message })
    }
    User.findOne({email:req.body.email}, (err, user) => {
      if(err) {
        return next(err)
      }
      if(user) {
        return res.status(400).json({
          message: 'Username already exists.',
        })
      }
      var user = new User({
        email: req.body.email,
        password: req.body.password,
      })
      user.save((err) => {
        if(err) {
          return next(err)
        }
        return res.status(200).json({
          email: user.email,
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
      email: user.email,
    })
  })
}

module.exports = {
  postLogin,
  getLogout,
  postRegister,
  getProfile,
};
