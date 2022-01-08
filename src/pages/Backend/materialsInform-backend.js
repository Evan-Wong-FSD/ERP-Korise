export function materialsInformBackend () {
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
  const port = 3003
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
        client.db('ERP').collection('materialsInform').aggregate([{ $match: {} }]).toArray((err1, document) => {
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

  app.post('/api/filterAndGetModelOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('materialsInform').aggregate([{ $match: { 產品名稱: req.body.inputKey } }, { $project: { _id: 0, 型號: 1 } }]).toArray((err1, document) => {
          if (!err1) {
            const arruniquemodel = [...new Set(document.map(elem => { return elem.型號 }))],
              filterResult = arruniquemodel.filter(elem => elem.toUpperCase().indexOf(req.body.inputValue.toUpperCase()) > -1)
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

  app.post('/api/getPricesByproductTitleAndModel', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        const arrId = []
        client.db('ERP').collection('materialsInform').aggregate([
          { $match: { 產品名稱: req.body.productTitle, 型號: req.body.model } },
          { $project: { _id: 1 } }
        ]).toArray((err1, document) => {
          if (!err1) {
            arrId.splice(arrId.length, 0, ...document.map(elem => {
              return String(elem._id)
            }))
          } else {
            console.log('Error => ', err1)
            client.close()
          }
        })
        client.db('ERP').collection('materialsList').aggregate([{ $project: { _id: 0, materialsInformId: 1, 單價: 1, 複價: 1 } }]).toArray((err1, document) => {
          if (!err1) {
            const appropriateElement = document.filter(elem => arrId.includes(elem.materialsInformId)),
              originalPrice = appropriateElement.map(elem => { return elem.單價 }),
              negotiatedPrice = appropriateElement.map(elem => { return elem.複價 })
            res.send({
              originalPrice: originalPrice,
              negotiatedPrice: negotiatedPrice
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

  app.post('/api/initializeForRecord', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        if (req.body.taxIdNum) {
          client.db('ERP').collection('ProductClassification').aggregate([{ $match: { 統編: req.body.taxIdNum } }, { $project: { _id: 0, 產品名稱: 1 } }]).toArray((err1, document) => {
            if (!err1) {
              var class2 = []
              document.forEach(elem => {
                class2.splice(class2.length, 0, elem.產品名稱)
              })
              res.send({
                class2: class2
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
          const data = {
            taxIdNums: [],
            firmName: []
          }
          client.db('ERP').collection('firmInform').aggregate([{ $match: {} }]).toArray((err1, document) => {
            if (!err1) {
              document.forEach(elem => {
                data.taxIdNums.splice(data.taxIdNums.length, 0, elem.firmInform.統編)
                data.firmName.splice(data.firmName.length, 0, elem.firmInform.公司名稱)
              })
              res.send({
                _idMaterialsInform: data._idMaterialsInform,
                taxIdNums: data.taxIdNums,
                firmName: data.firmName
              })
              client.close()
              res.end()
            } else {
              console.log('Error => ', err1)
              client.close()
              res.end()
            }
          })
        }
      } else {
        console.log('Error => ', err0)
        client.close()
        res.end()
      }
    })
  })

  io.on('connection', (socket) => {
    socket.on('submit', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          if (frontendData.submitOperation === 'create') {
            (async () => {
              await client.db('ERP').collection('materialsInform').insertOne(frontendData.materialsInform)
              io.emit('submitSucceed', {
                message: '新增成功'
              })
              client.close()
            })()
          } else if (frontendData.submitOperation === 'update') {
            (async () => {
              await client.db('ERP').collection('materialsInform').updateOne({ _id: new mongodb.ObjectID(frontendData._id) }, { $set: frontendData.materialsInform })
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
    socket.on('update', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          client.db('ERP').collection('materialsInform').aggregate([{ $match: { _id: new mongodb.ObjectID(frontendData.selected._id) } }]).toArray((err1, document) => {
            if (!err1) {
              io.emit('initializeForUpdated', {
                recordData: document[0]
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
    socket.on('delete', (frontendData) => {
      MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
        if (!err0) {
          (async () => {
            await client.db('ERP').collection('materialsInform').deleteOne({ _id: new mongodb.ObjectID(frontendData.selected[0]._id) })
            io.emit('deleteSucceed', {
              message: '剛除成功'
            })
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
    console.log('listening on *:3003')
  })
}
