export function firmInformBackend () {
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
  const port = 3001
  const mongodb = require('mongodb')
  const MongoClient = mongodb.MongoClient

  // const exec = require('child_process').exec

  // var ls = exec('"C:/Program Files/MongoDB/Server/4.2/bin/mongorestore.exe" --port 12345 -d ERP -c firmInform --archive=F:/project/erp/src/pages/Backend/mongodbBackup/firmInform_0514 --gzip')
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

  app.post('/api/filterAndGetOptions', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('firmInform').aggregate([{ $project: { _id: 0, 'firmInform.統編': 1, 'firmInform.公司名稱': 1 } }]).toArray((err1, document) => {
          if (!err1) {
            const { inputKey, inputValue } = req.body,
              arrAllSpecificOption = document.map(elem => {
                return elem.firmInform[inputKey]
              }),
              filterResult = arrAllSpecificOption.filter(elem => elem.toUpperCase().indexOf(inputValue.toUpperCase()) > -1)
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

  app.post('/api/getRespectiveValueByTaxIdNum', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('firmInform').aggregate([
          { $match: { 'firmInform.統編': req.body.taxIdNum } },
          { $project: { _id: 0, 'firmInform.公司名稱': 1, 'firmInform.傳真': 1, 'contactPersonInform.聯絡人名稱': 1, 'contactPersonInform.聯絡人電話': 1 } }
        ]).toArray((err1, document) => {
          if (!err1) {
            const { 公司名稱, 傳真 } = document[0].firmInform, { 聯絡人名稱, 聯絡人電話 } = document[0].contactPersonInform
            res.send({
              公司名稱: 公司名稱,
              傳真: 傳真,
              聯絡人名稱: 聯絡人名稱,
              聯絡人電話: 聯絡人電話
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

  app.post('/api/getRespectiveValueByFirmName', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('firmInform').aggregate([
          { $match: { 'firmInform.公司名稱': req.body.firmName } },
          { $project: { _id: 0, 'firmInform.統編': 1, 'firmInform.傳真': 1, 'contactPersonInform.聯絡人名稱': 1, 'contactPersonInform.聯絡人電話': 1 } }
        ]).toArray((err1, document) => {
          if (!err1) {
            const { 統編, 傳真 } = document[0].firmInform, { 聯絡人名稱, 聯絡人電話 } = document[0].contactPersonInform
            res.send({
              統編: 統編,
              傳真: 傳真,
              聯絡人名稱: 聯絡人名稱,
              聯絡人電話: 聯絡人電話
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

  app.post('/api/initializeForSheet', function (req, res) {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('firmInform').aggregate([{ $match: {} }]).toArray((err1, document) => {
          if (!err1) {
            res.send({
              arrFirmInform: document
            })
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
        const { taxIdNumExist, _id } = req.body
        if (taxIdNumExist) {
          client.db('ERP').collection('firmInform').aggregate([{ $match: { _id: new mongodb.ObjectID(_id) } }, { $project: { _id: 0 } }]).toArray((err2, document2) => {
            res.send({
              recordData: document2[0]
            })
            client.close()
            res.end()
          })
        } else {
          client.db('ERP').collection('firmInform').aggregate([{ $match: {} }]).toArray((err2, document2) => {
            if (!err2) {
              const data = {
                _id: [],
                taxIdNums: [],
                firmName: []
              }
              document2.forEach(elem => {
                data._id.splice(data._id.length, 0, elem._id)
                data.taxIdNums.splice(data.taxIdNums.length, 0, elem.firmInform.統編)
                data.firmName.splice(data.firmName.length, 0, elem.firmInform.公司名稱)
              })
              res.send({
                _id: data._id,
                taxIdNums: data.taxIdNums,
                firmName: data.firmName
              })
              client.close()
              res.end()
            } else {
              console.log('Error => ', err2)
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
          delete frontendData.firmInformData.hideDropdownIcon
          if (frontendData.taxIdNumExist) {
            (async () => {
              await client.db('ERP').collection('firmInform').updateOne({ _id: new mongodb.ObjectID(frontendData._id) }, { $set: frontendData.firmInformData })
              console.log('update succeed')
              client.close()
            })()
          } else {
            (async () => {
              await client.db('ERP').collection('firmInform').insertOne(frontendData.firmInformData)
              console.log('create succeed')
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
            await client.db('ERP').collection('firmInform').deleteOne({ _id: new mongodb.ObjectID(frontendData._id) })
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
    console.log('listening on *:3001')
  })
}
