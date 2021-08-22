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
const port = 3005
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

// app.post('/api/getRowsDataForWholeInvoice', function (req, res) {
//   MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
//     if (!err0) {
//       getRowsDataForWholeInvoice(client, res)
//     } else {
//       console.log('Error => ', err0)
//       client.close()
//     }
//   })
// })

app.post('/api/getRowsDataForSpecificInvoice', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      // getRowsDataForSpecificInvoice(client, req, res)
      client.db('ERP').collection('invoiceRecord').aggregate([
        { $match: { 發票號: req.body.invoiceNum } },
        { $project: { 產品種類: 1, 產品名稱: 1, 型號: 1, 數量: 1, 原價: 1, 議價: 1, 'Project code': 1 } }
      ]).toArray((err1, document) => {
        if (!err1) {
          res.send({
            rowData: document.reverse()
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
      res.end()
    }
  })
})

app.post('/api/getRowsDataBySetting', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      var match = {}, { filter, invoiceType, accountPeriod, specificPeriod } = req.body
      if (filter.active) {
        match[filter.tableSearchKey] = filter.value
      }
      if (invoiceType.active) {
        match.進銷項 = invoiceType.value[0]
      }
      if (accountPeriod.active) {
        match.期年 = accountPeriod.year
        match.期數 = accountPeriod.period
      }
      if (specificPeriod.active && specificPeriod.value) { // 檢查 specificPeriod.value 是否有效值
        if (Object.keys(specificPeriod.value).length > 2) {
          const utcDate = Date.parse(specificPeriod.value.split('/').join('-'))
          match.會計時間 = utcDate
        } else {
          const matchEntries = Object.entries(match),
            utcDateFrom = Date.parse(specificPeriod.value.from.split('/').join('-')),
            utcDateTo = Date.parse(specificPeriod.value.to.split('/').join('-'))
          matchEntries.splice(matchEntries.length, 0, ['會計時間', { $gt: utcDateFrom - 1, $lte: utcDateTo + 1 }])
          match = Object.fromEntries(matchEntries)
        }
      }
      if (Object.keys(match).length > 0) {
        client.db('ERP').collection('invoiceRecord').aggregate([
          { $match: match },
          { $project: { 產品種類: 0, 產品名稱: 0, 型號: 0, 原價: 0, 'Project code': 0, blank: 0 } }
        ]).toArray((err1, document) => {
          if (!err1) {
            console.log('document')
            console.log(document)
            res.send({
              rowData: calculateSale(document)
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
        res.end()
      }
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
      client.db('ERP').collection('materialsInform').aggregate([{ $project: { _id: 0, 統編: 1, 公司名稱: 1 } }]).toArray((err1, document) => {
        if (!err1) {
          const data = {
            taxIdNums: [...new Set(document.map(elem => { return elem.統編 }))],
            firmName: [...new Set(document.map(elem => { return elem.公司名稱 }))]
          }
          res.send(data)
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
  socket.on('getProductClassByTaxIdNum', (frontendData) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('ProductClassification').aggregate([{ $match: { 統編: frontendData.taxIdNum } }, { $project: { _id: 0, 產品種類: 1 } }]).toArray((err1, document) => {
          if (!err1) {
            const data = {
              productClass: [...new Set(document.map(elem => { return elem.產品種類 }))]
            }
            io.emit('getProductClassByTaxIdNum', data)
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
  socket.on('getFirmNameByProductClass', (frontendData) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('ProductClassification').aggregate([{ $match: { 產品種類: frontendData.productClass } }, { $project: { _id: 0, 產品名稱: 1 } }]).toArray((err1, document) => {
          if (!err1) {
            const data = {
              productName: [...new Set(document.map(elem => { return elem.產品名稱 }))]
            }
            io.emit('getFirmNameByProductClass', data)
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
  socket.on('getModelAnd_idByClass2', (frontendData) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('materialsInform').aggregate([{ $match: { 產品名稱: frontendData.class2 } }, { $project: { 型號: 1 } }]).toArray((err1, document) => {
          if (!err1) {
            const data = {
              // model: [...new Set(document.map(elem => { return elem.型號 }))],
              model: document.map(elem => { return elem.型號 }),
              materialsInform_id: document.map(elem => { return elem._id })
            }
            io.emit('getModelAnd_idByClass2', data)
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
  socket.on('getPricesByMaterialsInform_id', (frontendData) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('materialsList').aggregate([{ $match: { materialsInformId: frontendData.materialsInform_id } }, { $project: { _id: 0, 單價: 1, 複價: 1 } }]).toArray((err1, document) => {
          if (!err1) {
            const data = {
              usualPrice: [...new Set(document.map(elem => { return elem.單價 }))],
              negotiatedPrice: [...new Set(document.map(elem => { return elem.複價 }))]
            }
            io.emit('getPricesByMaterialsInform_id', data)
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
  socket.on('update', (frontendData) => {
    MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
      if (!err0) {
        client.db('ERP').collection('invoiceRecord').aggregate([{ $match: { _id: new mongodb.ObjectID(frontendData.selected._id) } }]).toArray((err2, document) => {
          io.emit('initializeForUpdated', {
            recordData: document[0],
            invoiceNum: frontendData.invoiceNum
          })
          client.close()
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
        // client.db('ERP').collection('ProductClassification').aggregate([{ $match: { 產品名稱: frontendData.invoiceRecord.產品名稱 } }, { $project: { _id: 0, 產品種類: 1 } }]).toArray((err1, document) => {
        //   if (!err1) {
        //     // const invoiceRecord = { ...frontendData.invoiceRecord.firstPage, ...frontendData.invoiceRecord.secondPage }
        //     frontendData.invoiceRecord.secondPage.產品種類 = document[0].產品種類
        //     if (frontendData.submitOperation === 'create') {
        //       (async () => {
        //         await client.db('ERP').collection('invoiceRecord').insertOne({ ...frontendData.invoiceRecord.firstPage, ...frontendData.invoiceRecord.secondPage })
        //         io.emit('submitSucceed', {
        //           message: '新增成功'
        //         })
        //         client.close()
        //       })()
        //     } else if (frontendData.submitOperation === 'update') {
        //       (async () => {
        //         await client.db('ERP').collection('invoiceRecord').updateMany({ 發票號: frontendData.invoiceRecord.secondPage.發票號 }, { $set: frontendData.invoiceRecord.firstPage })
        //         await client.db('ERP').collection('invoiceRecord').updateOne({ _id: new mongodb.ObjectID(frontendData._id) }, { $set: frontendData.invoiceRecord.secondPage })
        //         io.emit('submitSucceed', {
        //           message: '更新成功'
        //         })
        //         client.close()
        //       })()
        //     }
        //   } else {
        //     console.log('Error => ', err1)
        //     client.close()
        //   }
        // })
        if (frontendData.submitOperation === 'create') {
          // client.db('ERP').collection('ProductClassification').aggregate([{ $match: { 產品名稱: frontendData.invoiceRecord.secondPage.產品名稱 } }, { $project: { _id: 0, 產品種類: 1 } }]).toArray((err1, document) => {
          // if (!err1) {
          (async () => {
            // frontendData.invoiceRecord.secondPage.產品種類 = document[0].產品種類
            const invoiceRecord = { ...frontendData.invoiceRecord.firstPage, ...frontendData.invoiceRecord.secondPage },
              year = new Date().getFullYear(),
              month = new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1,
              date = new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate();
            ['稅額', '數量', '原價', '議價'].forEach(elem => {
              invoiceRecord[elem] = parseFloat(invoiceRecord[elem])
            })
            // invoiceRecord.產品種類 = document[0].產品種類
            console.log('month')
            console.log(month)
            invoiceRecord.會計時間 = Date.parse(`${year}-${month}-${date}`)
            await client.db('ERP').collection('invoiceRecord').insertOne(invoiceRecord)
            io.emit('submitSucceed', {
              message: '新增成功'
            })
            client.close()
          })()
          // } else {
          //   console.log('Error => ', err1)
          //   client.close()
          // }
          // })
        } else if (frontendData.submitOperation === 'update') {
          (async () => {
            frontendData.invoiceRecord.firstPage.稅額 = parseFloat(frontendData.invoiceRecord.firstPage.稅額);
            ['數量', '原價', '議價'].forEach(elem => {
              frontendData.invoiceRecord.secondPage[elem] = parseFloat(frontendData.invoiceRecord.secondPage[elem])
            })
            await client.db('ERP').collection('invoiceRecord').updateMany({ 發票號: frontendData.invoiceNumUpdated }, { $set: frontendData.invoiceRecord.firstPage })
            await client.db('ERP').collection('invoiceRecord').updateOne({ _id: new mongodb.ObjectID(frontendData._id) }, { $set: frontendData.invoiceRecord.secondPage })
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
          await client.db('ERP').collection('invoiceRecord').deleteOne({ _id: new mongodb.ObjectID(frontendData.selected[0]._id) })
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
  console.log('listening on *:3005')
})

// function getRowsDataForWholeInvoice (client, res) {
//   client.db('ERP').collection('invoiceRecord').aggregate([{ $project: { 產品種類: 0, 產品名稱: 0, 型號: 0, 原價: 0, 'Project code': 0, blank: 0 } }]).toArray((err1, document) => {
//     if (!err1) {
//       res.send({
//         rowData: calculateSale(document)
//       })
//       client.close()
//     } else {
//       console.log('Error => ', err1)
//       client.close()
//     }
//   })
// }

function calculateSale (document) {
  const data = [],
    arrSameInvoiceNumRecord = [],
    arrUniqueInvoiceNum = [...new Set(document.map(elem => { return elem.發票號 }))]
  arrUniqueInvoiceNum.forEach(elem1 => {
    arrSameInvoiceNumRecord.splice(0, arrSameInvoiceNumRecord.length, ...document.filter(elem2 => elem2.發票號 === elem1))
    data.splice(data.length, 0, arrSameInvoiceNumRecord[0])
    data[data.length - 1].消售額 = 0
    arrSameInvoiceNumRecord.forEach((elem3, index3, arr3) => {
      data[data.length - 1].消售額 += (parseFloat(elem3.數量) * parseFloat(elem3.議價))
      if (index3 === arr3.length - 1) {
        data[data.length - 1].總額 = data[data.length - 1].消售額 + parseFloat(data[data.length - 1].稅額)
        // data[data.length - 1].消售額 = String(data[data.length - 1].消售額)
        delete data[data.length - 1].數量
        delete data[data.length - 1].議價
      }
    })
  })
  return data.reverse()
}

// function getRowsDataForSpecificInvoice (client, req, res) {
//   client.db('ERP').collection('invoiceRecord').aggregate([
//     { $match: { 發票號: req.body.invoiceNum } },
//     { $project: { 產品種類: 1, 產品名稱: 1, 型號: 1, 數量: 1, 原價: 1, 議價: 1, 'Project code': 1 } }
//   ]).toArray((err1, document) => {
//     if (!err1) {
//       res.send({
//         rowData: document.reverse()
//       })
//       client.close()
//     } else {
//       console.log('Error => ', err1)
//       client.close()
//     }
//   })
// }
