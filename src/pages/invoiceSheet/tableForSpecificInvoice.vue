<template>
  <div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="_id"
      selection="single"
      :selected.sync="selected"
      class="invoiceSheet text-grey-10"
    >
      <template v-slot:top-left>
        <div class="row q-gutter-md">
          <strong class="q-py-sm" style="font-size: 1.2rem;">{{`發票號：${invoiceNum}`}}</strong>
          <div
            class="cursor-pointer rounded-borders shadow-2 q-pa-sm q-gutter-x-sm text-grey-2"
            style="background-color: #00bcd4;"
            @click="callTableForSpecificTable()"
          >
            <q-icon size="sm" name="description" />
            <span style="font-size: 1rem;">總表</span>
          </div>
        </div>
      </template>

      <template v-slot:top-right>
        <div class="row q-gutter-md">
          <q-btn color="white" text-color="black" label="更新" class="q-mx-md" @click="onUpdate(selected)" />
          <q-dialog v-model="updateBtn">
            <div style="max-width: 80vw; width:100%;">
              <invoiceRecordBody />
            </div>
          </q-dialog>

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
        </div>
      </template>
    </q-table>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { invoiceSheetAPI } from 'boot/axios'
import invoiceRecordBody from '../invoiceRecord/invoiceRecordBody.vue'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3005',
  vuex: {}
}))
export default {
  props: ['invoiceNum'],
  components: {
    invoiceRecordBody: invoiceRecordBody
  },
  data () {
    return {
      selected: [],
      updateBtn: false,
      deleteConfirm: false,
      pagination: {
        sortBy: '數量',
        descending: false,
        page: 1,
        rowsPerPage: 0,
        rowsNumber: null
      },
      columns: [
        {
          name: '產品種類',
          label: '產品種類',
          align: 'center',
          field: '產品種類'
        },
        {
          name: '產品名稱',
          label: '產品名稱',
          align: 'center',
          field: '產品名稱'
        },
        {
          name: '型號',
          label: '型號',
          align: 'center',
          field: '型號'
        },
        {
          name: '數量',
          label: '數量',
          align: 'center',
          field: '數量',
          sortable: true
        },
        {
          name: '原價',
          label: '原價',
          align: 'center',
          field: '原價',
          sortable: true
        },
        {
          name: '議價',
          label: '議價',
          align: 'center',
          field: '議價',
          sortable: true
        },
        {
          name: 'Project code',
          label: 'Project code',
          align: 'center',
          field: 'Project code'
        }
      ],
      data: []
    }
  },
  mounted () {
    this.onRequest({
      pagination: this.pagination
    })
  },
  methods: {
    callTableForSpecificTable () {
      this.$emit('switchTable', {
        showTableForWholeInvoice: true,
        showTableForSpecificInvoice: false
        // settingInWholeTable: this.settingInWholeTable
      })
    },
    onUpdate (selected) {
      if (selected.length > 0 && Object.keys(selected[0]).includes('_id')) {
        this.$socket.emit('update', {
          selected: selected[0],
          invoiceNum: this.invoiceNum
        })
        this.updateBtn = true
      }
    },
    onDelete (selected) {
      this.$socket.emit('delete', {
        selected: selected
      })
      this.selected.splice(0, this.selected.length)
    },
    async onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      let rowData = null
      this.loading = true
      await invoiceSheetAPI.post('/api/getRowsDataForSpecificInvoice', { invoiceNum: this.invoiceNum }).then((res) => {
        rowData = res.data.rowData
      })
      // emulate server
      // update rowsCount with appropriate value
      this.pagination.rowsNumber = rowData.length
      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage
      // calculate starting row of data
      const startRow = (page - 1) * rowsPerPage
      // fetch data from "server"
      const returnedData = this.fetchFromServer(startRow, fetchCount, sortBy, descending, rowData)
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
    fetchFromServer (startRow, count, sortBy, descending, rowData) {
      if (sortBy) {
        const sortFn = descending
          ? (a, b) => (parseFloat(b[sortBy]) - parseFloat(a[sortBy]))
          : (a, b) => (parseFloat(a[sortBy]) - parseFloat(b[sortBy]))
        rowData.sort(sortFn)
      }
      return rowData.slice(startRow, startRow + count)
    }
  },
  sockets: {
    submitSucceed: function (backendData) {
      this.updateBtn = false
      this.onRequest({
        pagination: this.pagination
      })
      notify('positive', backendData.message)
    },
    deleteSucceed: function (backendData) {
      this.deleteConfirm = false
      this.onRequest({
        pagination: this.pagination
      })
      notify('positive', backendData.message)
    }
  }
}

function addTotalAmount (returnedData) {
  let totalNumber = 0, totalOriginalPrice = 0, totalNegotiatedPrice = 0
  returnedData.forEach(elem => {
    totalNumber = totalNumber + elem.數量
    totalOriginalPrice = totalOriginalPrice + elem.原價
    totalNegotiatedPrice = totalNegotiatedPrice + elem.議價
  })
  returnedData.splice(returnedData.length, 0, { 產品種類: '合計', 數量: totalNumber, 原價: totalOriginalPrice, 議價: totalNegotiatedPrice })
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
