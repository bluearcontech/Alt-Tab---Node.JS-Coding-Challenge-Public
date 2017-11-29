require('babel-register')({
  only: [/server/, /test/],
})
require('babel-polyfill')
require('isomorphic-fetch')

