<template>
  <div class="my-font-medium">
    <!-- style="height: 400px" -->
    <q-table
      :data="data"
      :columns="columns"
      row-key="index"
      virtual-scroll
      flat
      hide-header
      hide-bottom
      :pagination.sync="pagination"
      :table-colspan="8"
      :rows-per-page-options="[0]"
      separator="cell"
      class="invoiceSheet text-grey-10"
    >
      <template v-slot:top-left>
        <q-btn class="border-radius-btn" color="btn-confirm-color" text-color="grey-10" label="匯出檔案" @click="exportExcel()" />
      </template>

      <template v-slot:top-right>
        <div class="row q-gutter-md" v-if="step > 1">
          <q-btn class="border-radius-btn" color="white" text-color="black" label="重設費用" @click="resetFees()"/>
          <q-btn class="border-radius-btn" color="negative" label="刪除" @click="openDeleteDialog()" />
        </div>

        <q-dialog v-model="clickDelete" persistent>
          <q-card class="bg-grey-4">
            <q-card-section class="row items-center">
              <q-icon name="warning" class="text-negative" style="font-size: 4rem;" />
              <span class="q-ml-sm" style="font-size: 1.2rem;">是否確認刪除此列資料？</span>
            </q-card-section>

            <q-card-actions align="center">
              <q-btn push size="md" label="是" color="negative" text-color="white" v-close-popup @click="onDelete()" />
              <q-btn size="md" label="否" color="white" text-color="grey-10" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </template>

      <template v-slot:body="propsBody">
        <!-- <q-tr :propsBody="propsBody" :key="propsBody.pageIndex">
          {{propsBody}} -->
        <q-tr v-if="propsBody.pageIndex === 0" :propsBody="propsBody" :key="propsBody.pageIndex">
          <q-td class="text-center text-bold" style="font-size: 1.25rem;" colspan="8" :propsBody="propsBody" v-for="(elem, index) in Object.keys(propsBody.row)" :key="index">
            {{propsBody.row[elem]}}
          </q-td>
        </q-tr>

        <q-tr v-if="propsBody.pageIndex === 1" :propsBody="propsBody" :key="propsBody.pageIndex">
          <q-td class="text-center text-bold" style="font-size: 1.25rem;" colspan="8" :propsBody="propsBody" v-for="(elem, index) in Object.keys(propsBody.row)" :key="index">
            {{propsBody.row[elem]}}
          </q-td>
        </q-tr>

        <q-tr v-if="propsBody.pageIndex === 2" :propsBody="propsBody" :key="propsBody.pageIndex">
          <q-td class="text-bold" colspan="8" :propsBody="propsBody">
            <div class="row justify-evenly">
              <div v-for="(elem, index) in Object.keys(propsBody.row)" :key="index">{{propsBody.row[elem]}}</div>
            </div>
          </q-td>
        </q-tr>

        <q-tr v-if="propsBody.pageIndex === 3" :propsBody="propsBody" :key="propsBody.pageIndex">
          <q-td class="text-bold" colspan="8" :propsBody="propsBody">
            <div class="row justify-evenly">
              <div v-for="(elem, index) in Object.keys(propsBody.row)" :key="index">{{propsBody.row[elem]}}</div>
            </div>
          </q-td>
        </q-tr>

        <q-tr v-if="propsBody.pageIndex === 4" :propsBody="propsBody" :key="propsBody.pageIndex">
          <q-td class="text-center text-bold" :propsBody="propsBody" v-for="(elem, index) in Object.keys(propsBody.row)" :key="index">
            <div>{{propsBody.row[elem]}}</div>
          </q-td>
        </q-tr>

        <q-tr v-if="propsBody.pageIndex > 4 && propsBody.pageIndex < data.length - 1" :propsBody="propsBody" :key="propsBody.pageIndex">
          <q-td class="text-center" v-if="!isNaN(propsBody.row.column0)" :propsBody="propsBody" v-for="(elem, index) in Object.keys(propsBody.row)" :key="index">
            <div>{{propsBody.row[elem]}}</div>
          </q-td>

          <q-td class="text-center" v-if="isNaN(propsBody.row.column0)" :propsBody="propsBody" v-for="(elem, index) in Object.keys(propsBody.row)" :key="index">
            <q-checkbox v-if="index === 0" v-model="propsBody.row.column0.checkbox" />
            <div v-if="index > 0">{{propsBody.row[elem]}}</div>
          </q-td>
        </q-tr>

        <q-tr v-if="propsBody.pageIndex === data.length - 1" :propsBody="propsBody" :key="propsBody.pageIndex">
          <q-td class="text-center" :propsBody="propsBody" v-for="(elem, index) in Object.keys(propsBody.row)" :key="index">
            <div v-if="index === 6">{{totalRate}}</div>
            <div v-if="index !== 6">{{propsBody.row[elem]}}</div>
          </q-td>
        </q-tr>

        <!-- </q-tr> -->

        <!-- <q-tr v-if="propsBody.pageIndex > 4" :propsBody="propsBody" :key="propsBody.pageIndex">
          <q-td :propsBody="propsBody" v-for="(elem, index) in Object.keys(propsBody.row)" :key="index">
            {{propsBody.row[elem]}}
          </q-td>
        </q-tr> -->
      </template>
    </q-table>
  </div>
</template>

<script>
import { bomSheet } from 'boot/axios'
import { Notify, SessionStorage } from 'quasar'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3006',
  vuex: {}
}))
export default {
  props: ['step', 'productClass', 'typeOfFee', 'onAddRowForproductClassOnTable', 'onAddRowForFeesOnTable'],
  data () {
    return {
      data: [],
      columns: [],
      pagination: {
        rowsPerPage: 0
      },
      clickDelete: false,
      project: {
        projectName: undefined,
        projectDate: undefined
      }
    }
  },
  mounted () {
    for (let i = 0; i < 8; i++) {
      this.columns.splice(this.columns.length, 0, {
        name: `column${i}`,
        label: `column${i}`,
        align: 'center',
        field: `column${i}`
      })
    }
    if (SessionStorage.has('project')) {
      const { projectName, projectDate } = SessionStorage.getItem('project')
      this.project.projectName = projectName
      this.project.projectDate = projectDate
    }
    const { projectName, projectDate } = this.project
    bomSheet.post('/api/importBomTableData', { projectName: projectName, projectDate: projectDate }).then((res) => {
      const { tableData } = res.data,
        { 工程名稱, 時間, 聯絡人名稱, 聯絡人電話, 傳真 } = SessionStorage.getItem('basicInform'),
        dataElemFirstSection = [
          { column0: '瑋安企業有限公司' },
          { column0: '物  料  清  單' },
          { column0: `工程名稱：${工程名稱}`, column1: `日期：${時間}` },
          { column0: `連絡人：${聯絡人名稱}`, column1: `客戶電話：${聯絡人電話}`, column2: `客戶傳真：${傳真}` },
          { column0: '項次', column1: '名稱內容', column2: '規格', column3: '數量', column4: '單價', column5: '複價', column6: '小計', column7: '備註' }
        ]
      if (tableData.length > 0) {
        this.data.splice(0, this.data.length, ...[...dataElemFirstSection, ...tableData])
      } else if (this.data.length === 0) {
        const arrproductClass = SessionStorage.getItem('arrproductClass'),
          // { 工程名稱, 時間, 聯絡人名稱, 聯絡人電話, 傳真 } = SessionStorage.getItem('basicInform'),
          // dataElemFirstSection = [
          //   { column0: '瑋安企業有限公司' },
          //   { column0: '物  料  清  單' },
          //   { column0: `工程名稱：${工程名稱}`, column1: `日期：${時間}` },
          //   { column0: `連絡人：${聯絡人名稱}`, column1: `客戶電話：${聯絡人電話}`, column2: `客戶傳真：${傳真}` },
          //   { column0: '項次', column1: '名稱內容', column2: '規格', column3: '數量', column4: '單價', column5: '複價', column6: '小計', column7: '備註' }
          // ],
          dataElemSecondSection = arrproductClass.map((elem, index) => {
            return { column0: index + 1, column1: elem.產品種類, column2: null, column3: null, column4: null, column5: null, column6: null, column7: null }
          }),
          dataElemThirdSection = [
            { column0: arrproductClass.length + 1, column1: '運費', column2: null, column3: null, column4: null, column5: null, column6: null, column7: null },
            { column0: arrproductClass.length + 2, column1: '其他費用', column2: null, column3: null, column4: null, column5: null, column6: null, column7: null },

            { column0: null, column1: '訂價', column2: null, column3: null, column4: null, column5: null, column6: null, column7: null }
          ]
        this.data.splice(0, this.data.length, ...[...dataElemFirstSection, ...dataElemSecondSection, ...dataElemThirdSection])
      }
      if (SessionStorage.has('dataInBomSheet')) {
        const dataInBomSheet = SessionStorage.getItem('dataInBomSheet'), arrproductClass = SessionStorage.getItem('arrproductClass')
        dataInBomSheet.forEach((elem1, index1, arr1) => {
          if (arrproductClass.filter(elem2 => elem2.產品種類 === elem1.column1).length > 0) {
            arr1[index1].column0 = arrproductClass.findIndex(elem3 => elem3.產品種類 === elem1.column1) + 1
          }
          if (elem1.column1 === '運費') {
            arr1[index1].column0 = arrproductClass.length + 1
          } else if (elem1.column1 === '其他費用') {
            arr1[index1].column0 = arrproductClass.length + 2
          }
        })
        this.data.splice(5, this.data.length - 5, ...dataInBomSheet)
        // this.data.splice(this.data.length, 0, ...dataInBomSheet)
      }
    })
  },
  computed: {
    totalRate () {
      const allValueInColumn6 = this.data.slice(5).map(elem => {
          return elem.column6
        }),
        getTotalRate = allValueInColumn6.reduce((total, elem) => {
          // total = total === null ? 0 : parseFloat(total)
          // elem = elem === null ? 0 : parseFloat(elem)
          // return total + elem
          return Number(total) + Number(elem)
        })
      return getTotalRate.toFixed(3)
    }
  },
  methods: {
    openDeleteDialog () {
      this.data.filter(elem => isNaN(elem.column0) && elem.column0.checkbox).length > 0
        ? this.clickDelete = true
        : notify('warning', '請先選擇一列')
    },
    onDelete () {
      while (this.data.filter(elem => isNaN(elem.column0) && elem.column0.checkbox).length > 0) {
        const onCheckboxIndex = this.data.findIndex(elem => isNaN(elem.column0) && elem.column0.checkbox)
        this.data.splice(onCheckboxIndex, 1)
        SessionStorage.set('dataInBomSheet', this.data.slice(5))
        notify('positive', '刪除成功')
      }
    },
    resetFees () {
      const indexTransportationFee = this.data.findIndex(elem => elem.column1 === '運費'),
        arrproductClass = SessionStorage.getItem('arrproductClass'),
        rowOtherFee = { column0: arrproductClass.length + 2, column1: '其他費用', column2: null, column3: null, column4: null, column5: null, column6: null, column7: null },
        rowTotalRate = { column0: null, column1: '訂價', column2: null, column3: null, column4: null, column5: null, column6: null, column7: null }
      this.data.splice(indexTransportationFee + 1, this.data.length - indexTransportationFee, ...[rowOtherFee, rowTotalRate])
      SessionStorage.set('dataInBomSheet', this.data.slice(5))
    },
    exportExcel () {
      // bomSheet.request({
      //   url: '/api/exportExcel',
      //   method: 'post',
      //   data: {
      //     tableData: this.data
      //   }
      // })
      if (this.data.length > 0) {
        bomSheet.post('/api/exportExcel', { tableData: this.data }).then((res) => {
          const { 工程名稱, 時間 } = SessionStorage.getItem('basicInform')
          const downloadUrl = window.URL.createObjectURL(new Blob([base64ToArrayBuffer(res.data.bufferExcel)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' }))
          const link = document.createElement('a')
          const getYear = new Date().getFullYear(),
            getMonth = new Date().getMonth() + 1,
            getDate = new Date().getDate(),
            getHours = new Date().getHours(),
            getMinutes = new Date().getMinutes(),
            getSeconds = new Date().getSeconds()
          link.href = downloadUrl
          link.download = `BOM表 ${getYear}${getMonth}${getDate}-${getHours}${getMinutes}${getSeconds}.xlsx`
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(downloadUrl)
          bomSheet.post('/api/insertDataBomTable', { projectName: 工程名稱, projectDate: 時間, tableData: this.data })
        })
      }
    }
  },
  // sockets: {
  //   importBomSheetRecord (backendData) {
  //     this.data.splice(0, this.data.length, ...backendData.tableData)
  //   }
  // },
  watch: {
    onAddRowForproductClassOnTable (value) {
      if (SessionStorage.has('formDataForproductClass')) {
        const formDataForproductClass = SessionStorage.getItem('formDataForproductClass')
        formDataForproductClass.小計 = String(parseFloat(formDataForproductClass.複價) * parseFloat(formDataForproductClass.數量))
        const { 備註, 單價, 型號, 數量, 複價, 小計, 產品名稱 } = formDataForproductClass
        const respectiveproductClassIndexForFormData = this.data.findIndex(elem => elem.column1 === this.productClass)
        if (this.data.findIndex(elem => elem.column1 === 產品名稱 && elem.column2 === 型號) === -1) {
          this.data.splice(respectiveproductClassIndexForFormData + 1, 0, { column0: { checkbox: false }, column1: 產品名稱, column2: 型號 || null, column3: 數量, column4: 單價, column5: 複價, column6: 小計, column7: 備註 || null }) // if 備註 === undefined, isNaN(備註) will return true
          notify('positive', '新增成功')
        } else {
          this.data.splice(respectiveproductClassIndexForFormData + 1, 0, { column0: { checkbox: false }, column1: 產品名稱, column2: 型號 || null, column3: 數量, column4: 單價, column5: 複價, column6: 小計, column7: 備註 || null })
          notify('warning', `請注意 ${產品名稱} ${型號} 已經輸入過`)
        }
        SessionStorage.set('dataInBomSheet', this.data.slice(5))
      }
    },
    onAddRowForFeesOnTable (value) {
      if (SessionStorage.has('formDataForFees')) {
        const formDataForFees = SessionStorage.getItem('formDataForFees')
        formDataForFees.小計 = String(parseFloat(formDataForFees.複價) * parseFloat(formDataForFees.數量))
        const { 費用名稱, 數量, 單價, 複價, 小計, 備註 } = formDataForFees
        const respectiveproductClassIndexForFormData = this.data.findIndex(elem => elem.column1 === this.typeOfFee)
        if (this.data.findIndex(elem => elem.column1 === 費用名稱) === -1) {
          this.data.splice(respectiveproductClassIndexForFormData + 1, 0, { column0: { checkbox: false }, column1: 費用名稱, column2: null, column3: 數量, column4: 單價, column5: 複價, column6: 小計, column7: 備註 || null })
          notify('positive', '新增成功')
        } else {
          this.data.splice(respectiveproductClassIndexForFormData + 1, 0, { column0: { checkbox: false }, column1: 費用名稱, column2: null, column3: 數量, column4: 單價, column5: 複價, column6: 小計, column7: 備註 || null })
          notify('warning', `請注意 ${費用名稱} 已經輸入過`)
        }
        SessionStorage.set('dataInBomSheet', this.data.slice(5))
      }
    }
  }
}

function base64ToArrayBuffer (base64) {
  var binaryString = window.atob(base64)
  var len = binaryString.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

function notify (type, message) {
  Notify.create({
    type: type,
    message: message
  })
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&sSheet.scss';
</style>
<style lang="sass">
.invoiceSheet
  /* height or max-height is important */
  max-height: 80vh,
  height: 100%,
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    // background-color: #fff
    background-color: #bdbdbd
  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
  thead tr:first-child th
    top: 0
  tbody tr:nth-child(2n+1)
    background: #e0e0e0 //grey-4
</style>
