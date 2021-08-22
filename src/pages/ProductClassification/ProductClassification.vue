<template>
  <div class="my-font-medium">
    <header class="row justify-between q-px-lg q-pt-lg">
      <div>
        <h1 class="text-h4 text-grey-10 text-center">產品種類</h1>
        <div style="width: 215.124px; border-top: 6px solid #00bcd4; width: 215.124px; margin-top: 10px;" />
      </div>
    </header>

    <br>

    <section>
      <!-- 高度要再做調整 -->
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
        class="my-sticky-dynamic text-grey-10"
      >
        <template v-slot:top-left>
          <div class="row q-gutter-md q-pb-md">
            <q-select dense v-model="searchKey" :options="columnsHeader" label="搜尋欄目" :style="`min-width: ${topLeftWidth / 4}px;`" />
            <q-input dense debounce="300" v-model="filter" placeholder="搜尋" :style="`max-width: ${topLeftWidth / 1.5}px;`">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-resize-observer @resize="topLeftResize" />
          </div>
        </template>

        <template v-slot:top-right>
          <div class="row q-gutter-md">
            <!-- <q-input dense outlined v-model="產品名稱" bg-color="grey-4" label="統編" />
            <q-input dense outlined v-model="產品名稱" bg-color="grey-4" label="廠商" /> -->
            <!-- <q-input dense outlined v-model="產品名稱" bg-color="grey-4" label="產品名稱" />
            <q-input dense outlined v-model="code" bg-color="grey-4" label="code" /> -->
            <q-select
              dense
              outlined
              label="統編"
              v-model="selectInput.統編.input"
              use-input
              :options="taxIdNumsFiltered"
              @filter="taxIdNumsFilterFn"
              clearable
              :style="`width: ${topRightWidth / 4}px;`"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label>{{ scope.opt }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              dense
              outlined
              label="公司名稱"
              v-model="selectInput.公司名稱.input"
              use-input
              :options="firmNameFiltered"
              @filter="firmNameFilterFn"
              clearable
              :style="`width: ${topRightWidth / 4}px;`"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label>{{ scope.opt }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              dense
              outlined
              bg-color="grey-4"
              :label="elem"
              v-bind:value="input[elem]"
              v-on:input="input[elem] = $event"
              v-for="(elem, index) in Object.keys(input)"
              :key="index"
              :style="`width: ${topRightWidth / 8}px;`"
            />
            <span>
              <q-btn color="white" text-color="black" label="新增" @click="createBtn(rowsData, input.產品種類, input.產品名稱, input.code, selectInput.統編.input)" />
              <q-btn color="white" text-color="black" label="更新" @click="updateBtn(selected, input.產品種類, input.產品名稱, input.code, selectInput.統編.input)" class="q-mx-md" />
              <q-btn color="white" text-color="black" label="剛除" @click="deleteBtn(selected)" />
            </span>
            <q-resize-observer @resize="topRightResize" />
          </div>
        </template>

        <!-- <template v-slot:body="props">
          <q-tr :props="props">
            <q-td :props="props" :style="tableDataStyle(props.pageIndex)" v-for="elem in columns" :key="elem.name">
              {{ props.row[elem.name] }}
            </q-td>
          </q-tr>
        </template> -->
      </q-table>
    </section>
  </div>
</template>

<script>
import { ProductClassificationAPI } from 'boot/axios'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3002',
  vuex: {}
}))
export default {
  data () {
    return {
      filter: '',
      loading: false,
      // 產品名稱: null,
      // code: null,
      input: {
        // 統編: null,
        產品種類: null,
        產品名稱: null,
        code: null
      },
      rowsData: null,
      pagination: {
        sortBy: '統編',
        descending: false,
        page: 1,
        rowsPerPage: 6,
        rowsNumber: 10
      },
      // columnFiltered: '',
      searchKey: '統編',
      columnsHeader: ['統編', '產品種類', '產品名稱', 'code'],
      columns: [
        // 不需要sortable
        {
          name: '統編',
          label: '統編',
          align: 'center',
          field: '統編'
        },
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
          name: 'code',
          label: 'code',
          align: 'center',
          field: 'code'
        }
      ],
      data: [],
      selected: [],
      topLeftWidth: null,
      topRightWidth: null,
      taxIdNumsFiltered: [],
      firmNameFiltered: [],
      selectInput: {
        統編: {
          input: null,
          datafiltered: [],
          rawData: null
        },
        公司名稱: {
          input: null,
          datafiltered: [],
          rawData: null
        }
      }
    }
  },
  mounted () {
    // get initial data from server (1st page)
    this.onRequest({
      pagination: this.pagination,
      filter: undefined
    })
  },
  methods: {
    onRequest (props) {
      const { page, rowsPerPage } = props.pagination, filter = props.filter
      // this.產品名稱 = null
      // this.code = null
      this.input.產品種類 = null
      this.input.產品名稱 = null
      this.input.code = null
      this.selectInput.統編.input = null
      this.selectInput.公司名稱.input = null
      this.loading = true
      let rowsData = null
      this.$socket.emit('initialize');
      (async () => {
        await ProductClassificationAPI.post('/api/getRowsData').then((res) => {
          rowsData = res.data.rowsData
        })
        // emulate server
        // setTimeout(() => {
        // update rowsCount with appropriate value
        this.rowsData = rowsData
        this.pagination.rowsNumber = this.getRowsNumberCount(filter, rowsData, this.searchKey)
        // get all rows if "All" (0) is selected
        const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage
        // calculate starting row of data
        const startRow = (page - 1) * rowsPerPage
        // fetch data from "server"
        const returnedData = this.fetchFromServer(startRow, fetchCount, filter, this.searchKey, rowsData)
        // clear out existing data and add new
        this.data.splice(0, this.data.length, ...returnedData)
        // don't forget to update local pagination object
        this.pagination.page = page
        this.pagination.rowsPerPage = rowsPerPage
        // this.pagination.sortBy = sortBy
        // this.pagination.descending = descending
        // ...and turn of loading indicator
        this.loading = false
        // }, 1500)
      })()
    },
    // emulate ajax call
    // SELECT * FROM ... WHERE...LIMIT...
    fetchFromServer (startRow, count, filter, searchKey, rowsData) {
      const data = filter
        // ? this.original.filter(row => row.name.includes(filter))
        // : this.original.slice()
        ? rowsData.filter(row => row[searchKey].toString().includes(filter))
        : rowsData.slice()
      // 需要sortBy嗎？
      // if (sortBy) {
      //   const sortFn = sortBy === 'desc'
      //     ? (descending
      //       ? (a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0)
      //       : (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
      //     )
      //     : (descending
      //       ? (a, b) => (parseFloat(b[sortBy]) - parseFloat(a[sortBy]))
      //       : (a, b) => (parseFloat(a[sortBy]) - parseFloat(b[sortBy]))
      //     )
      //   data.sort(sortFn)
      // }
      return data.slice(startRow, startRow + count)
    },
    // emulate 'SELECT count(*) FROM ...WHERE...'
    getRowsNumberCount (filter, rowsData, searchKey) {
      if (!filter) {
        // return this.original.length
        return rowsData.length
      }
      let count = 0
      // this.original.forEach((treat) => {
      //   if (treat.name.includes(filter)) {
      //     ++count
      //   }
      // })
      rowsData.forEach(elem => {
        // sortBy需再設定
        if (elem[searchKey].toString().includes(filter)) {
          ++count
        }
      })
      return count
    },
    createBtn (rowsData, item1, item2, code, taxIdNum) {
      if (taxIdNum === null || taxIdNum === '') {
        this.$q.notify({
          type: 'negative',
          message: '"統編" 不得為空值'
        })
        return
      } else if (item1 === null || item1.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: '"產品種類" 不得為空值'
        })
        return
      } else if (item2 === null || item2.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: '"產品名稱" 不得為空值'
        })
        return
      } else if (isExist(rowsData, '產品名稱', item2)) {
        this.$q.notify({
          type: 'negative',
          message: '所輸入 "產品名稱" 已存在'
        })
        return
      } else if (code === null || code.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: '"code" 不得為空值'
        })
        return
      } else if (isExist(rowsData, 'code', code)) {
        this.$q.notify({
          type: 'negative',
          message: '所輸入 "code" 已存在'
        })
        return
      }
      this.$socket.emit('create', {
        產品種類: item1,
        產品名稱: item2,
        code: code,
        統編: taxIdNum
      })
      this.onRequest({
        pagination: this.pagination,
        filter: undefined
      })
    },
    updateBtn (selected, item1, item2, code, taxIdNum) {
      if (taxIdNum === null || taxIdNum === '') {
        this.$q.notify({
          type: 'negative',
          message: '"統編" 不得為空值'
        })
      } else if (item1 === null || item1.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: '"產品種類" 不得為空值'
        })
      } else if (item2 === null || item2.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: '"產品名稱" 不得為空值'
        })
      } else if (code === null || code.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: '"code" 不得為空值'
        })
      } else if (selected.length > 0) {
        this.$socket.emit('update', {
          selected: selected,
          產品種類: item1,
          產品名稱: item2,
          code: code,
          統編: taxIdNum
        })
        this.onRequest({
          pagination: this.pagination,
          filter: undefined
        })
        this.selected.splice(0, this.selected.length)
      }
    },
    deleteBtn (selected) {
      if (selected.length > 0) {
        this.$socket.emit('delete', {
          selected: selected
        })
        this.onRequest({
          pagination: this.pagination
        })
        this.selected.splice(0, this.selected.length)
      }
    },
    taxIdNumsFilterFn (val, update) {
      update(() => {
        let datafiltered = this.taxIdNumsFiltered
        // let { datafiltered, rawData } = this.selectInput.統編
        if (val === '') {
          // this.selectInput.統編.datafiltered = []
          datafiltered.splice(0, datafiltered.length)
        } else {
          datafiltered = this.selectInput.統編.rawData.filter(
            v => v.indexOf(val.toUpperCase()) > -1
          )
          if (datafiltered.length > 5) {
            datafiltered.splice(5, datafiltered.length - 5)
          }
          // this.filterOptions = filterOptions
          this.taxIdNumsFiltered = datafiltered
        }
      })
    },
    firmNameFilterFn (val, update) {
      update(() => {
        let datafiltered = this.firmNameFiltered
        if (val === '') {
          datafiltered.splice(0, datafiltered.length)
        } else {
          datafiltered = this.selectInput.公司名稱.rawData.filter(
            v => v.indexOf(val.toUpperCase()) > -1
          )
          if (datafiltered.length > 5) {
            datafiltered.splice(5, datafiltered.length - 5)
          }
          this.firmNameFiltered = datafiltered
        }
      })
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
    },
    ternaryOperator (truth, untruth, key, value) {
      return key === value ? truth : untruth
    }
  },
  sockets: {
    initialize: function (backendData) {
      this.selectInput.統編.rawData = backendData.taxIdNums
      this.selectInput.公司名稱.rawData = backendData.firmName
    }
  },
  watch: {
    'selectInput.統編.input': function (value) {
      if (value !== null && this.selectInput.統編.rawData.includes(value.toString())) {
        this.selectInput.公司名稱.input = this.selectInput.公司名稱.rawData[this.selectInput.統編.rawData.findIndex(elem => elem === value)]
      }
    },
    'selectInput.公司名稱.input': function (value) {
      if (value !== null && this.selectInput.公司名稱.rawData.includes(value.toString())) {
        this.selectInput.統編.input = this.selectInput.統編.rawData[this.selectInput.公司名稱.rawData.findIndex(elem => elem === value)]
      }
    },
    selected: function (value) {
      if (value.length > 0) {
        this.selectInput.統編.input = value[0].統編
        this.selectInput.公司名稱.input = value[0].公司名稱
        Object.keys(this.input).forEach(elem => {
          this.input[elem] = value[0][elem]
        })
      } else {
        this.selectInput.統編.input = ''
        this.selectInput.公司名稱.input = ''
        Object.keys(this.input).forEach(elem => {
          this.input[elem] = ''
        })
      }
    }
  }
}

function isExist (rowsData, key, value) {
  let boolean = false
  rowsData.forEach(elem => {
    if (elem[key].toString() === value) {
      boolean = true
    }
  })
  return boolean
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&sSheet.scss';
</style>
<style lang="sass">
.my-sticky-dynamic
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
</style>
