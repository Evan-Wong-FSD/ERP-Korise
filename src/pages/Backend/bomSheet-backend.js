const express = require('express')
const app = express()
const http = require('http').Server(app)
var io = require('socket.io')(http, {
  allowEIO3: true,
  cors: {
    origin: 'http://localhost:8080',
    // origin: 'http://192.168.0.198:8080',
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: true
  }
})
const port = 3006
const ExcelJS = require('exceljs')
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

app.post('/api/getInformFromDB', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      client.db('ERP').collection('usualListForBomSheet').aggregate([{ $project: { _id: 0 } }]).toArray((err1, document) => {
        if (!err1) {
          res.send({
            informFromDB: document
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

app.post('/api/insertDataBomTable', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      const { projectName, projectDate, tableData } = req.body
      client.db('ERP').collection('bomSheetExported').aggregate([{ $match: { 'row2.column0': `工程名稱：${projectName}`, 'row2.column1': `日期：${projectDate}` } }]).toArray((err1, document) => {
        if (!err1) {
          if (document.length === 0) {
            (async () => {
              const dataInserted = {}
              tableData.forEach((elem, index) => {
                dataInserted[`row${index}`] = elem
              })
              await client.db('ERP').collection('bomSheetExported').insertOne(dataInserted)
              client.close()
              io.emit('addOptionForImportRecord')
              io.emit('insertBasicInform')
            })()
          }
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

app.post('/api/insertBasicInform', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      const { basicInform } = req.body
      client.db('ERP').collection('basicInformForBomSheet').aggregate([{ $match: { 工程名稱: basicInform.工程名稱, 時間: basicInform.時間 } }]).toArray((err1, document) => {
        if (!err1) {
          if (document.length === 0) {
            (async () => {
              await client.db('ERP').collection('basicInformForBomSheet').insertOne(basicInform)
              client.close()
            })()
          }
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

app.post('/api/getProjectNameAndDateOptions', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      client.db('ERP').collection('basicInformForBomSheet').aggregate([{ $project: { _id: 0, 工程名稱: 1, 時間: 1 } }]).toArray((err1, document) => {
        if (!err1) {
          const optionsProjectName = [], optionsProjectDate = []
          if (document.length > 0) {
            document.forEach(elem => {
              optionsProjectName.splice(optionsProjectName.length, 0, elem.工程名稱)
              optionsProjectDate.splice(optionsProjectDate.length, 0, elem.時間)
            })
          }
          res.send({
            optionsProjectName: [...new Set(optionsProjectName)],
            optionsProjectDate: optionsProjectDate
          })
          res.end()
        } else {
          console.log('Error => ', err0)
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

app.post('/api/deleteBomSheetRecord', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      (async () => {
        const { projectName, projectDate } = req.body
        await client.db('ERP').collection('bomSheetExported').deleteOne({ 'row2.column0': `工程名稱：${projectName}`, 'row2.column1': `日期：${projectDate}` })
        await client.db('ERP').collection('basicInformForBomSheet').deleteOne({ 工程名稱: projectName, 時間: projectDate })
        client.close()
        res.end()
      })()
    } else {
      console.log('Error => ', err0)
      client.close()
      res.end()
    }
  })
})

app.post('/api/importHistoryRecord', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      const { projectName, projectDate } = req.body
      client.db('ERP').collection('bomSheetExported').aggregate([{ $match: { 'row2.column0': `工程名稱：${projectName}`, 'row2.column1': `日期：${projectDate}` } }, { $project: { _id: 0 } }]).toArray((err1, document) => {
        if (!err1) {
          var dataClassOne = []
          Object.keys(document[0]).forEach(elem => {
            if (document[0][elem].column0 && !isNaN(document[0][elem].column0) && document[0][elem].column1 !== '運費' && document[0][elem].column1 !== '其他費用') {
              const classOne = document[0][elem].column1
              dataClassOne.splice(dataClassOne.length, 0, { 產品種類: classOne })
            }
          })
          io.emit('importDataClassOne', {
            dataClassOne: dataClassOne
          })
          importBasicInform(projectName, projectDate)
          client.close()
          res.end()
        } else {
          console.log('Error => ', err0)
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

app.post('/api/importBomTableData', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      const { projectName, projectDate } = req.body
      client.db('ERP').collection('bomSheetExported').aggregate([{ $match: { 'row2.column0': `工程名稱：${projectName}`, 'row2.column1': `日期：${projectDate}` } }, { $project: { _id: 0 } }]).toArray((err1, document) => {
        if (!err1) {
          var tableData = []
          if (document.length > 0) {
            Object.keys(document[0]).slice(5).forEach(elem => {
              tableData.splice(tableData.length, 0, document[0][elem])
            })
          }
          res.send({
            tableData: tableData
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

app.post('/api/checkDuplicateProjectName', function (req, res) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      const { projectName, projectDate } = req.body
      client.db('ERP').collection('bomSheetExported').aggregate([{ $match: { 'row2.column0': `工程名稱：${projectName}`, 'row2.column1': `日期：${projectDate}` } }]).toArray((err1, document) => {
        if (!err1) {
          res.send({
            duplicate: document.length > 0
          })
          client.close()
          res.end()
        } else {
          console.log('Error => ', err0)
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

app.post('/api/exportExcel', function (req, res) {
  (async () => {
    const workbook = new ExcelJS.Workbook()
    const { tableData } = req.body
    workbook.addWorksheet('BOM表')
    const worksheet = workbook.getWorksheet('BOM表')

    // insert columns
    const columns = []
    for (let i = 0; i < 8; i++) {
      columns.splice(columns.length, 0, {
        header: `column${i}`,
        key: `column${i}`
      })
    }
    worksheet.columns = columns

    // insert data
    tableData.forEach((elem, index, arr) => {
      if (index > 4 && isNaN(elem.column0)) {
        arr[index].column0 = null
      }
    })
    const rows = tableData
    worksheet.addRows(rows)

    // remove header
    worksheet.spliceRows(1, 1)

    // merge cells
    const projectName = worksheet.getCell('A3').value,
      date = worksheet.getCell('B3').value,
      contactPerson = worksheet.getCell('A4').value,
      phone = worksheet.getCell('B4').value,
      fax = worksheet.getCell('C4').value
    worksheet.mergeCells('A1:H1')
    worksheet.mergeCells('A2:H2')
    worksheet.getCell('A3').value = `${projectName}                             ${date}`
    worksheet.getCell('A4').value = `${contactPerson}        ${phone}        ${fax}`
    worksheet.mergeCells('A3:H3')
    worksheet.mergeCells('A4:H4')

    // set cells alignment and border
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    alphabet.forEach(elem => {
      for (let i = 1; i <= tableData.length; i++) {
        worksheet.getCell(`${elem}${i}`).alignment = { vertical: 'middle', horizontal: 'center' }
        worksheet.getCell(`${elem}${i}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      }
    })

    // calculate total rate
    const column6 = worksheet.getColumn('column6')
    const getTotalRate = column6.values.slice(6).reduce((total, elem) => {
      return Number(total) + Number(elem)
    })
    const lastRow = worksheet.getRow(rows.length)
    lastRow.getCell('column6').value = getTotalRate

    const buffer = await workbook.xlsx.writeBuffer()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
    res.send({
      bufferExcel: buffer.toString('base64')
    })
    res.end()
  })()
})

function importBasicInform (projectName, projectDate) {
  MongoClient.connect('mongodb://127.0.0.1:12345', { useUnifiedTopology: true }, function (err0, client) {
    if (!err0) {
      client.db('ERP').collection('basicInformForBomSheet').aggregate([{ $match: { 工程名稱: projectName, 時間: projectDate } }, { $project: { _id: 0 } }]).toArray((err1, document) => {
        if (!err1) {
          io.emit('importBasicInform', {
            basicInform: document[0]
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
}

http.listen(port, function () {
  console.log('listening on *:3006')
})
