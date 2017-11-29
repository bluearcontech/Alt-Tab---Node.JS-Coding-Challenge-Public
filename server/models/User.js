let bcrypt = require('bcrypt-nodejs')
let mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: String,
}, {
  timestamps: true,
})

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this
  if (!user.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, null, (err, hash) => { // eslint-disable-line
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

/**
 * Helper method for validating user's password
 */
userSchema.methods.checkPassword = function checkPassword(plain, cb) {
  bcrypt.compare(plain, this.password, (err, isMatch) => {
    cb(err, isMatch)
  })
}

const User = mongoose.model('User', userSchema)

module.exports = User;
