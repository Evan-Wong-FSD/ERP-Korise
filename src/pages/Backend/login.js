export function login () {
  const express = require('express')
  const app = express()
  const http = require('http').Server(app)
  const port = 3007
  require('dotenv').config()

  app.use(express.json())
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST')
    // res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Allow-Headers', '*')
    next()
  })

  app.post('/api/login', function (req, res) {
    const { username, password } = req.body
    if (username === process.env.USER && password === process.env.PASS) {
      res.send({ loginStatus: true })
    } else {
      res.send({ loginStatus: false })
    }
  })

  http.listen(port, function () {
    console.log('listening on *:3007')
  })
}
