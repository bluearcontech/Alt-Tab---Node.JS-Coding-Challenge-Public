let createServer = require('./app')
let seed = require('./seed')

let server = createServer()

server.listen(server.get('port'), () => {
  console.log(`Server listening on port ${server.get('port')}`)
  seed()
})