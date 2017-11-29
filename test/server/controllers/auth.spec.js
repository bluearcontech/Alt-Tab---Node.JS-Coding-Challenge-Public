let request = require('supertest')
let passport = require('passport')
let Strategy = passport.Strategy
let util = require('util')

let createServer = require('../../../server/app')
let User = require('../../../server/models/User')

describe('AuthController', () => {
  describe('POST /api/login', () => {
    let serverInstance

    before(() => {
      const server = createServer()
      serverInstance = request(server)

      function MockStrategy(verify) {
        this.name = 'local'
        this._verify = verify
      }

      util.inherits(MockStrategy, Strategy)

      MockStrategy.prototype.authenticate = function authenticate(req) {
        const verfied = (err, user, info) => {
          if (err) {
            return this.error(err)
          }
          if (!user) {
            return this.fail(info)
          }
          return this.success(user, info)
        }

        this._verify(req.body.username, req.body.password, verfied)
      }

      passport.use(new MockStrategy((username, password, done) => {
        if (username === 'admin@admin.com' && password === 'admin') {
          return done(null, {
            id: 'some-user-id',
          })
        }
        return done(null, false, { message: 'Invalid username or password.' })
      }))
    })

    it('should return 400 Bad Request when parameters are missing', (done) => {
      serverInstance
        .post('/api/login')
        .expect(400, done)
    })

    it('should return 401 Unauthorized when credentials are incorrect', (done) => {
      serverInstance
        .post('/api/login')
        .send({
          username: 'admin@admin.com',
          password: 'incorrect-password',
        })
        .expect(401, done)
    })

    it('should return 200 OK when credentials are correct', (done) => {
      serverInstance
        .post('/api/login')
        .send({
          username: 'admin@admin.com',
          password: 'admin',
        })
        .expect(200, done)
    })
  })

  describe('POST /api/register', () => {
    let serverInstance
    before(() => {
      const server = createServer([(req, res, next) => {
        req.user = { // eslint-disable-line no-param-reassign
          id: 'some-user-id',
        }
        next()
      }])

      serverInstance = request(server)
    })

    it('should return 400 Bad Request when parameters are missing', (done) => {
      serverInstance
        .post('/api/register')
        .expect(400, done)
    })

    it('should return 400 Bad Request when an username already exists', (done) => {
      User.findOne = (query, cb) => {
        cb(null, true)
      }

      serverInstance
        .post('/api/register')
        .send({
          username: 'username',
          password: 'password',
        })
        .expect(400, done)
    })

    it('should return 200 OK after adding a new user', (done) => {
      User.findOne = (query, cb) => {
        cb(null, false)
      }

      User.prototype.save = (cb) => {
        cb(null)
      }

      serverInstance
        .post('/api/register')
        .send({
          username: 'username',
          password: 'password',
        })
        .expect(200, done)
    })
  })

  describe('GET /api/logout', () => {
    it('should return 200 OK', (done) => {
      request(createServer())
        .get('/api/logout')
        .expect(200, done)
    })
  })

  describe('GET /api/profile', () => {
    it('should return 401 Unauthorized when an user has not logged in', (done) => {
      request(createServer())
        .get('/api/profile')
        .expect(401, done)
    })

    it('should return 200 OK after accessing profile', (done) => {
      const server = createServer([(req, res, next) => {
        req.user = { // eslint-disable-line no-param-reassign
          id: 'some-user-id',
        }
        next()
      }])

      User.findById = (id, cb) => {
        cb(null, {
          save: (callback) => {
            callback(null)
          },
        })
      }

      request(server)
        .get('/api/profile')
        .expect(200, done)
    })
  })
})
