const express = require('express')
const app = express()
const http = require('http').Server(app)
var io = require('socket.io')(http, {
  allowEIO3: true,
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: true
  }
})
const port = 3002
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

// const exec = require('child_process').exec

// var ls = exec('"C:/Program Files/MongoDB/Server/4.2/bin/mongorestore.exe" --port 12345 -d ERP -c ProductClassification --archive=F:/project/erp/src/pages/Backend/mongodbBackup/productSort_0523 --gzip')
// ls.stdout.on('data', function (data) {
//   console.log('stdout: ' + data.toString())
// })
// ls.stderr.on('data', function (data) {
//   console.log('stderr: ' + data.toString())
// })
// ls.on('exit', function (code) {
//   console.log('child process exited with code ' + code.toString())
// })

app.use(express.json())
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST')
  // res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

app.post('/api/getRowsData', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      client.db('ERP').collection('ProductClassification').aggregate([{ $match: {} }]).toArray((err1, document) => {
        if (!err1) {
          res.send({
            rowsData: document.reverse()
          })
          client.close()
          res.end()
        } else {
          console.log('Error => ', err1)
          client.close()
          res.end()
        }
      })
    } else {
      console.log('Error => ', err0)
      client.close()
      res.end()
    }
  })
})

app.post('/api/filterAndGetproductClassOptions', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      client.db('ERP').collection('ProductClassification').aggregate([{ $project: { _id: 0, 產品種類: 1 } }]).toArray((err1, document) => {
        if (!err1) {
          const arruniqueproductClass = [...new Set(document.map(elem => { return elem.產品種類 }))],
            filterResult = arruniqueproductClass.filter(elem => elem.toUpperCase().indexOf(req.body.inputValue.toUpperCase()) > -1)
          if (filterResult.length > 5) {
            filterResult.splice(5, filterResult.length - 5)
          }
          res.send({
            optionFiltered: filterResult
          })
          client.close()
          res.end()
        } else {
          console.log('Error => ', err1)
          client.close()
          res.end()
        }
      })
    } else {
      console.log('Error => ', err0)
      client.close()
      res.end()
    }
  })
})

app.post('/api/filterAndGetproductTitleOptions', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      client.db('ERP').collection('ProductClassification').aggregate([{ $match: { 產品種類: req.body.inputKey } }, { $project: { _id: 0, 產品名稱: 1 } }]).toArray((err1, document) => {
        if (!err1) {
          const arruniqueproductTitle = [...new Set(document.map(elem => { return elem.產品名稱 }))],
            filterResult = arruniqueproductTitle.filter(elem => elem.toUpperCase().indexOf(req.body.inputValue.toUpperCase()) > -1)
          if (filterResult.length > 5) {
            filterResult.splice(5, filterResult.length - 5)
          }
          res.send({
            optionFiltered: filterResult
          })
          client.close()
          res.end()
        } else {
          console.log('Error => ', err1)
          client.close()
          res.end()
        }
      })
    } else {
      console.log('Error => ', err0)
      client.close()
      res.end()
    }
  })
})

io.on('connection', (socket) => {
  socket.on('initialize', (frontendData) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('firmInform').aggregate([{ $match: {} }, { $project: { _id: 0, contactPersonInform: 0 } }]).toArray((err1, document) => {
          if (!err1) {
            const data = {
              _id: [],
              taxIdNums: [],
              firmName: []
            }
            document.forEach(elem => {
              data._id.splice(data._id.length, 0, elem._id)
              data.taxIdNums.splice(data.taxIdNums.length, 0, elem.firmInform.統編)
              data.firmName.splice(data.firmName.length, 0, elem.firmInform.公司名稱)
            })
            io.emit('initialize', {
              _id: data._id,
              taxIdNums: data.taxIdNums,
              firmName: data.firmName
            })
            client.close()
          } else {
            console.log('Error => ', err1)
            client.close()
          }
        })
      } else {
        console.log('Error => ', err0)
        client.close()
      }
    })
  })
  socket.on('create', (frontendData) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        (async () => {
          // frontendData.code = parseFloat(frontendData.code)
          await client.db('ERP').collection('ProductClassification').insertOne(frontendData)
          console.log('create succeed')
          client.close()
        })()
      } else {
        console.log('Error => ', err0)
        client.close()
      }
    })
  })
  socket.on('update', (frontendData) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        (async () => {
          frontendData.code = parseFloat(frontendData.code)
          await client.db('ERP').collection('ProductClassification').updateOne(
            { _id: new mongodb.ObjectID(frontendData.selected[0]._id) },
            {
              $set: {
                產品種類: frontendData.產品種類,
                產品名稱: frontendData.產品名稱,
                code: frontendData.code,
                統編: frontendData.統編
              }
            }
          )
          console.log('update succeed')
          client.close()
        })()
      } else {
        console.log('Error => ', err0)
        client.close()
      }
    })
  })
  socket.on('delete', (frontendData) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        (async () => {
          await client.db('ERP').collection('ProductClassification').deleteOne({ _id: new mongodb.ObjectID(frontendData.selected[0]._id) })
          console.log('delete succeed')
          client.close()
        })()
      } else {
        console.log('Error => ', err0)
        client.close()
      }
    })
  })
})

http.listen(port, function () {
  console.log('listening on *:3002')
})
