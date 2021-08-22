<template>
  <div class="my-font-medium">
    <section>
      <strong style="display: flex; justify-content: center; font-size: 1.25rem;" v-if="setDuration && dateSelected">{{`自選期間：${showDateTooltip()}`}}</strong>
      <strong style="display: flex; justify-content: center; font-size: 1.25rem;" v-if="accountPeriod.open">{{`會計期間：{ 年份：${accountPeriod.year}；期間：${accountPeriod.period} }`}}</strong>
      <q-table
        flat
        :data="data"
        :columns="columns"
        row-key="_id"
        :pagination.sync="pagination"
        :loading="loading"
        :filter="filter"
        selection="single"
        :selected.sync="selected"
        @request="onRequest"
        binary-state-sort
        class="invoiceSheet text-grey-10"
      >
        <template v-slot:top-left>
          <div class="row q-gutter-md">
            <div
              class="cursor-pointer rounded-borders shadow-2 q-pa-sm q-gutter-x-sm text-grey-2"
              :style="setDuration ? 'background-color: #f2c037;' : 'background-color: #00bcd4;'"
              @click="dateSelectedOffToggle"
            >
              <q-icon size="sm" name="event" />

              <span style="font-size: 1rem;">自選期間</span>

              <q-popup-proxy
                @before-show="dateSelected = newDate()"
                transition-show="scale"
                transition-hide="scale"
              >
                <div>
                  <q-date v-model="dateSelected" range>
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn label="取消" color="primary" flat v-close-popup />
                      <q-btn label="確定" color="primary" flat @click="dateSelectedOnToggle" v-close-popup />
                    </div>
                  </q-date>
                </div>
              </q-popup-proxy>

              <q-tooltip class="bg-amber text-black shadow-4" :offset="[10, 10]" v-if="setDuration && dateSelected">
                {{showDateTooltip()}}
              </q-tooltip>
            </div>

            <q-btn-dropdown label="會計期間" icon="schedule" class="text-grey-2" :style="accountPeriod.open ? 'background-color: #f2c037;' : 'background-color: #00bcd4;'">
              <q-toggle class="absolute-top-right " v-model="accountPeriod.open" @input="setDuration = false" />

              <br>

              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label>
                      <q-input borderless v-model="accountPeriod.year" label="年份" input-class="text-center">
                        <template v-slot:prepend>
                          <q-icon class="cursor-pointer" name="add" @click="accountPeriod.year += 1" />
                        </template>
                        <template v-slot:append>
                          <q-icon class="cursor-pointer" name="remove" @click="accountPeriod.year -= 1" />
                        </template>
                      </q-input>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item>
                  <q-item-section>
                    <q-item-label>
                      <q-select borderless v-model="accountPeriod.period" :options="periodOptions" label="期數" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <div
              class="cursor-pointer rounded-borders shadow-2 q-pa-sm q-gutter-x-sm text-grey-2"
              style="background-color: #00bcd4;"
              @click="callTableForSpecificTable()"
            >
              <q-icon size="sm" name="description" />
              <span style="font-size: 1rem;">清單</span>
            </div>

            <export-excel
              :data="worsksheetData"
              :fields="worsksheetColumns"
              :name="worsksheetName"
              :before-generate="generateWorksheetContent"
              class="cursor-pointer rounded-borders shadow-2 q-pa-sm q-gutter-x-sm text-grey-2"
              style="background-color: #00bcd4;"
            >
              <q-icon size="sm" name="archive" />
              <span style="font-size: 1rem;">滙出檔案</span>
            </export-excel>
          </div>
        </template>

        <template v-slot:top-right>
          <div class="row q-gutter-md">
            <q-select dense multiple v-model="invoiceType" :options="invoiceOptions" label='進銷項' :style="`min-width: ${topRightWidth / 6}px;`">
              <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                <q-item v-bind="itemProps" v-on="itemEvents">
                  <q-item-section>
                    <q-item-label>{{opt}}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle :value="selected" @input="toggleOption(opt)" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select dense v-model="tableSearchKey" :options="columnsHeader" label="搜尋欄目" :style="`min-width: ${topRightWidth / 6}px;`" />
            <q-input dense debounce="1000" v-model="filter" placeholder="搜尋" :style="`min-width: ${topRightWidth / 6}px;`">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <span>
              <q-btn color="white" text-color="black" label="剛除" @click="deleteConfirm = selected.length > 0 ? true : false" />
              <q-dialog v-model="deleteConfirm" persistent>
                <q-card class="bg-grey-4">
                  <q-card-section class="row items-center">
                    <q-icon name="warning" class="text-negative" style="font-size: 4rem;" />
                    <span class="q-ml-sm" style="font-size: 1.2rem;">是否確定刪除此筆資料？</span>
                  </q-card-section>

                  <q-card-actions align="center">
                    <q-btn push size="md" label="刪除" color="negative" text-color="white" v-close-popup @click="onDelete(selected)" />
                    <q-btn size="md" label="取消" color="white" text-color="grey-10" v-close-popup />
                  </q-card-actions>
                </q-card>
              </q-dialog>
            </span>

            <q-resize-observer @resize="topRightResize" />
          </div>
        </template>
      </q-table>
    </section>
  </div>
</template>

<script>
import { date, Notify } from 'quasar'
import { invoiceSheetAPI } from 'boot/axios'
import Vue from 'vue'
import excel from 'vue-excel-export'
import VueSocketIO from 'vue-socket.io'
Vue.use(excel)
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3005',
  vuex: {}
}))
export default {
  props: ['settingInWholeTable'],
  data () {
    return {
      filter: '',
      loading: false,
      dateSelected: null,
      setDuration: false,
      input: {
        項目: null,
        code: null
      },
      pagination: {
        sortBy: '時間',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: null
      },
      invoiceType: [],
      invoiceOptions: ['進項', '銷項'],
      tableSearchKey: '公司名稱',
      columnsHeader: ['公司名稱', '發票號', '稅別', '統編', '發票種類', '備註 (選填)'],
      columns: [
        {
          name: '進銷項', // 不用放在滙出接單
          label: '進銷項',
          align: 'center',
          field: '進銷項'
        },
        {
          name: '期數', // 不用放在滙出接單
          label: '期數',
          align: 'center',
          field: '期數'
        },
        {
          name: '公司名稱',
          label: '公司名稱',
          align: 'center',
          field: '公司名稱'
        },
        {
          name: '發票號',
          label: '發票號',
          align: 'center',
          field: '發票號'
        },
        {
          name: '時間',
          label: '時間',
          align: 'center',
          field: '時間',
          sortable: true
        },
        {
          name: '稅別',
          label: '稅別',
          align: 'center',
          field: '稅別'
        },
        {
          name: '統編',
          label: '統編',
          align: 'center',
          field: '統編'
        },
        {
          name: '消售額',
          label: '消售額',
          align: 'center',
          field: '消售額',
          sortable: true
        },
        {
          name: '稅額',
          label: '稅額',
          align: 'center',
          field: '稅額',
          sortable: true
        },
        {
          name: '總額',
          label: '總額',
          align: 'center',
          field: '總額',
          sortable: true
        },
        {
          name: '發票種類',
          label: '發票種類',
          align: 'center',
          field: '發票種類'
        },
        {
          name: '備註 (選填)',
          label: '備註 (選填)',
          align: 'center',
          field: '備註 (選填)'
        }
      ],
      rowData: [],
      data: [],
      worsksheetName: `進銷項表單 ${date.formatDate(Date.parse(new Date()), 'YYYY-MM-DD HH:mm:ss')}`,
      worsksheetColumns: null,
      worsksheetData: null,
      json_meta: [[{ key: 'charset', value: 'utf-8' }]], // used for "vue-excel-export" (NPM)
      deleteConfirm: false,
      selected: [],
      periodOptions: ['1-2月', '3-4月', '5-6月', '7-8月', '9-10月', '11-12月'],
      accountPeriod: {
        open: true,
        year: new Date().getFullYear() - 1911,
        period: undefined
      },
      topLeftWidth: null,
      topRightWidth: null
    }
  },
  mounted () {
    const getMonth = new Date().getMonth()
    this.accountPeriod.period = getMonth % 2 === 0 ? this.periodOptions[getMonth / 2] : this.periodOptions[(getMonth - 1) / 2] // 計算出當月所屬期數
    if (this.settingInWholeTable) {
      (async () => {
        Object.keys(this.settingInWholeTable).forEach(elem1 => {
          if (elem1 === 'accountPeriod') {
            Object.keys(this.settingInWholeTable[elem1]).forEach(elem2 => {
              this[elem1][elem2] = this.settingInWholeTable[elem1][elem2]
            })
          } else {
            this[elem1] = this.settingInWholeTable[elem1]
          }
        })
      })()
    }
  },
  methods: {
    async fetch (url) {
      await this.onAPI(url)
      this.onRequest({
        pagination: this.pagination
      })
    },
    getAPIdata () {
      return {
        filter: {
          active: Boolean(this.filter),
          tableSearchKey: this.tableSearchKey,
          value: this.filter
        },
        invoiceType: {
          active: this.invoiceType.length === 1,
          value: this.invoiceType
        },
        accountPeriod: {
          active: this.accountPeriod.open,
          year: String(this.accountPeriod.year),
          period: this.accountPeriod.period
        },
        specificPeriod: {
          active: this.setDuration,
          value: this.dateSelected
        }
      }
    },
    async onAPI (url) {
      await invoiceSheetAPI.post(`/api/${url}`, this.getAPIdata()).then((res) => {
        this.rowData.splice(0, this.rowData.length, ...res.data.rowData)
      })
    },
    onRequest (props) {
      var { page, rowsPerPage, sortBy, descending } = props.pagination
      this.loading = true
      if (this.setDuration) {
        rowsPerPage = 0
        filterDates(this.dateSelected, this.rowData)
      }
      // emulate server
      // update rowsCount with appropriate value
      this.pagination.rowsNumber = this.rowData.length
      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage
      // calculate starting row of data
      const startRow = (page - 1) * rowsPerPage
      // fetch data from "server"
      const returnedData = this.fetchFromServer(startRow, fetchCount, sortBy, descending, this.rowData)
      // clear out existing data and add new
      this.data.splice(0, this.data.length, ...addTotalAmount(returnedData))
      // don't forget to update local pagination object
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      // ...and turn of loading indicator
      this.loading = false
    },
    // emulate ajax call
    // SELECT * FROM ... WHERE...LIMIT...
    fetchFromServer (startRow, count, sortBy, descending, rowData) {
      if (sortBy) {
        const sortFn = sortBy === '時間'
          ? (descending
            ? (a, b) => (Date.UTC(...b[sortBy].split('/')) - Date.UTC(...a[sortBy].split('/')))
            : (a, b) => (Date.UTC(...a[sortBy].split('/')) - Date.UTC(...b[sortBy].split('/')))
          )
          : (descending
            ? (a, b) => (parseFloat(b[sortBy]) - parseFloat(a[sortBy]))
            : (a, b) => (parseFloat(a[sortBy]) - parseFloat(b[sortBy]))
          )
        rowData.sort(sortFn)
      }
      return rowData.slice(startRow, startRow + count)
    },
    newDate () {
      return date.formatDate(Date.now(), 'YYYY/MM/DD')
    },
    showDateTooltip () {
      return Object.keys(this.dateSelected).length > 2
        ? this.dateSelected
        : `${this.dateSelected.from} ~ ${this.dateSelected.to}`
    },
    dateSelectedOnToggle () {
      this.accountPeriod.open = false
      this.setDuration = !this.setDuration
      this.onRequest({
        pagination: this.pagination,
        filter: this.filter
      })
    },
    dateSelectedOffToggle () {
      this.setDuration = false
      this.onRequest({
        pagination: this.pagination,
        filter: this.filter
      })
    },
    onDelete (selected) {
      this.$socket.emit('delete', {
        selected: selected
      })
      this.selected.splice(0, this.selected.length)
    },
    callTableForSpecificTable () {
      if (this.selected.length > 0 && Object.keys(this.selected[0]).includes('_id')) {
        this.$emit('switchTable', {
          invoiceNum: this.selected[0].發票號,
          showTableForWholeInvoice: false,
          showTableForSpecificInvoice: true,
          settingInWholeTable: {
            tableSearchKey: this.tableSearchKey,
            filter: this.filter,
            invoiceType: this.invoiceType,
            accountPeriod: {
              open: this.accountPeriod.open,
              year: String(this.accountPeriod.year),
              period: this.accountPeriod.period
            },
            setDuration: this.setDuration,
            dateSelected: this.dateSelected
          }
        })
      } else {
        notify('warning', '請勾選一列有效資料')
      }
    },
    generateWorksheetContent () {
      this.worsksheetData = this.data.map(elem => {
        return {
          進銷項: elem.進銷項,
          時間: elem.時間,
          發票號: elem.發票號,
          統編: elem.統編,
          公司名稱: elem.公司名稱,
          稅額: elem.稅額,
          稅別: elem.稅別,
          '備註 (選填)': elem['備註 (選填)'],
          消售額: elem.消售額,
          總額: elem.總額,
          種類: elem.發票種類
        }
      })
      this.worsksheetColumns = {
        進銷項: '進銷項',
        業主: '公司名稱',
        發票號: '發票號',
        日期: '時間',
        '稅別/項目': '稅別',
        統編: '統編',
        銷售額: '消售額',
        稅額: '稅額',
        總額: '總額',
        種類: '種類',
        備註: '備註 (選填)'
      }
    },
    topLeftResize (size) {
      this.topLeftWidth = size.width
    },
    topRightResize (size) {
      this.topRightWidth = size.width
    },
    tableDataStyle (pageIndex) {
      const BgCol = pageIndex % 2 === 0
        ? 'background-color: #e0e0e0;'
        : 'background-color: #ffffff;'
      const maxWidth = this.$q.screen.gt.sm
        ? 'max-width:150px;'
        : ''
      return `${BgCol} ${maxWidth}`
    }
  },
  sockets: {
    deleteSucceed: function (backendData) {
      this.deleteConfirm = false
      this.onRequest({
        pagination: this.pagination,
        filter: this.filter
      })
      notify('positive', backendData.message)
    }
  },
  watch: {
    filter: function (value) {
      (async () => {
        await this.fetch('getRowsDataBySetting')
      })()
    },
    invoiceType: function (value) {
      (async () => {
        await this.fetch('getRowsDataBySetting')
      })()
    },
    accountPeriod: {
      handler: function (newValue, oldValue) {
        (async () => {
          await this.fetch('getRowsDataBySetting')
        })()
      },
      deep: true
    },
    setDuration: function (value) {
      (async () => {
        await this.fetch('getRowsDataBySetting')
      })()
    }
  }
}
function filterDates (dateSelected, rowData) {
  if (Object.keys(dateSelected).length > 2) { // Object.keys('2021/07/15').length === 10
    const UTCdate = Date.parse(dateSelected.split('/').join('-')),
      filterRowData = rowData.filter(elem => parseInt(elem.會計時間) === UTCdate)
    rowData.splice(0, rowData.length, ...filterRowData)
  } else {
    const UTCdateFrom = Date.parse(dateSelected.from.split('/').join('-')),
      UTCdateTo = Date.parse(dateSelected.to.split('/').join('-')),
      filterRowData = rowData.filter(elem => (parseInt(elem.會計時間) >= UTCdateFrom) && (parseInt(elem.會計時間) <= UTCdateTo))
    rowData.splice(0, rowData.length, ...filterRowData)
  }
}

function addTotalAmount (returnedData) {
  let totalSale = 0, totalTax = 0, totalSum = 0
  returnedData.forEach(elem => {
    totalSale = totalSale + elem.消售額
    totalTax = totalTax + elem.稅額
    totalSum = totalSum + elem.總額
  })
  returnedData.splice(returnedData.length, 0, { 進銷項: '合計', 消售額: totalSale, 稅額: totalTax, 總額: totalSum })
  return returnedData
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
  // height: 743px
  height: 80vh
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
