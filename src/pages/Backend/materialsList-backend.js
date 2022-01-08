export function materialsListBackend () {
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
  const port = 3004
  const mongodb = require('mongodb')
  const MongoClient = mongodb.MongoClient

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
        client.db('ERP').collection('materialsList').aggregate([{ $match: { materialsInformId: req.body.materialsInformId } }, { $project: { materialsInformId: 0 } }]).toArray((err1, document) => {
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

  app.post('/api/initializeForTree', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('materialsInform').aggregate([{ $match: {} }, { $project: { 產品名稱: 1, 型號: 1 } }]).toArray((err1, document) => {
          if (!err1) {
            res.send({
              arrMaterialsInform: document
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
    socket.on('initializeForRecordCreated', (frontendData) => {
      io.emit('initializeForRecordCreated', {
        materialsInformId: frontendData.materialsInformId
      })
    })
    socket.on('initializeForRecordUpdated', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          client.db('ERP').collection('materialsList').aggregate([{ $match: { _id: new mongodb.ObjectID(frontendData.tableSelectedID) } }, { $project: { materialsInformId: 0 } }]).toArray((err1, document) => {
            if (!err1) {
              io.emit('initializeForRecordUpdated', {
                materialsListInform: document[0]
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
    socket.on('submit', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          if (frontendData.submitOperation === 'create') {
            (async () => {
              await client.db('ERP').collection('materialsList').insertOne(frontendData.materialsListInform)
              io.emit('submitSucceed', {
                message: '新增成功'
              })
              client.close()
            })()
          } else if (frontendData.submitOperation === 'update') {
            (async () => {
              await client.db('ERP').collection('materialsList').updateOne({ _id: new mongodb.ObjectID(frontendData._id) }, { $set: frontendData.materialsListInform })
              io.emit('submitSucceed', {
                message: '更新成功'
              })
              client.close()
            })()
          }
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
            await client.db('ERP').collection('materialsList').deleteOne({ _id: new mongodb.ObjectID(frontendData.tableSelectedID) })
            io.emit('deleteSucceed', {
              message: '刪除成功'
            })
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
    console.log('listening on *:3004')
  })
}
