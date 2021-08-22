<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <header class="row justify-between q-px-lg q-pt-lg">
      <div>
        <h1 class="text-h4 text-grey-10 text-center">物料清單</h1>
        <div class="header-width header-underline"></div>
      </div>
    </header>

    <br>

    <div class="row justify-evenly">
      <q-input
        dense
        ref="filterForTree"
        filled
        v-model="filterForTree"
        label="搜尋"
        class="col-11"
      >
        <template v-slot:append>
          <q-icon v-if="filterForTree !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
          <q-icon v-if="filterForTree === ''" name="search" />
        </template>
      </q-input>
    </div>

    <br>

    <q-splitter
      v-model="splitterModel"
      :limits="[20, 20]"
      style="height: 743px"
    >

      <template v-slot:before>
        <div class="q-pa-md">
          <q-tree
            :nodes="simple"
            node-key="label"
            selected-color="primary"
            :filter="filterForTree"
            :filter-method="myFilterMethod"
            :selected.sync="treeSelected"
            :expanded.sync="expandedKeys"
            @update:expanded="nodeExpanded"
          >
            <template v-slot:header-class2="prop">
              <div class="row items-center">
                <div style="font-size: 1.2rem" class="text-weight-bold text-grey-10">{{ prop.node.label }}</div>
              </div>
            </template>

            <template v-slot:header-model="prop">
              <div class="row items-center cursor-pointer">
                <div style="font-size: 1.2rem">{{ prop.node.label }}</div>
              </div>
            </template>
          </q-tree>
        </div>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="treeSelected"
          animated
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel :name="elem.型號" v-for="(elem, index) in treeData" :key="index">
            <q-table
              flat
              :data="tableData"
              :columns="columns"
              row-key="_id"
              :pagination.sync="pagination"
              :loading="loading"
              :filter="filterForTable"
              selection="single"
              :selected.sync="tableSelected"
              @request="onRequest"
              binary-state-sort
              class="materialsListTable text-grey-10"
            >

              <template v-slot:top-right>
                <div class="row q-gutter-md">
                  <q-select dense v-model="tableSearchKey" :options="columnsHeader" label="搜尋欄目" :style="`min-width: ${topRightWidth / 4}px;`" />
                  <q-input dense debounce="300" v-model="filterForTable" placeholder="搜尋" :style="`max-width: ${topRightWidth / 1.5}px;`">
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                  <span>
                    <q-btn color="white" text-color="black" label="新增" @click="onCreate()" />
                    <q-dialog v-model="createBtn">
                      <div style="max-width: 80vw; width:100%;">
                        <materialsListRecord />
                      </div>
                    </q-dialog>

                    <!-- <q-btn color="white" text-color="black" label="更新" class="q-mx-md" @click="onUpdate(tableSelected)" /> -->
                    <q-btn color="white" text-color="black" label="更新" class="q-mx-md" @click="onUpdate()" />
                    <q-dialog v-model="updateBtn">
                      <div style="max-width: 80vw; width:100%;">
                        <materialsListRecord />
                      </div>
                    </q-dialog>

                    <q-btn color="white" text-color="black" label="剛除" @click="deleteConfirm = tableSelected.length > 0 ? true : false" />
                    <!-- <q-btn color="white" text-color="black" label="剛除" /> -->
                    <q-dialog v-model="deleteConfirm" persistent>
                      <q-card class="bg-grey-4">
                        <q-card-section class="row items-center">
                          <q-icon name="warning" class="text-negative" style="font-size: 4rem;" />
                          <span class="q-ml-sm" style="font-size: 1.2rem;">是否確定刪除此筆資料？</span>
                        </q-card-section>

                        <q-card-actions align="center">
                          <q-btn push size="md" label="刪除" color="negative" text-color="white" v-close-popup @click="onDelete(tableSelected)" />
                          <q-btn size="md" label="取消" color="white" text-color="grey-10" v-close-popup />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </span>
                  <q-resize-observer @resize="topRightResize" />
                </div>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>

<script>
import { materialsListAPI } from 'boot/axios'
import { Notify } from 'quasar'
import materialsListRecord from './materialsListRecord.vue'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3004',
  vuex: {}
}))
export default {
  components: {
    materialsListRecord: materialsListRecord
  },
  data () {
    return {
      filterForTree: '',
      filterForTable: '',
      loading: false,
      splitterModel: 20,
      treeSelected: '',
      tableSelected: [],
      tableSearchKey: '日期',
      // expanded: ['產品名稱'],
      simple: [
        // {
        //   label: '產品名稱',
        //   header: 'class2',
        //   children: []
        // }
      ],
      treeData: null,
      pagination: {
        sortBy: '日期',
        descending: false,
        page: 1,
        rowsPerPage: 6,
        rowsNumber: 10
      },
      columnsHeader: ['日期', '單價', '折數', '複價', '付款條件', '稅金', 'Project code', '備註'],
      columns: [
        {
          name: '日期',
          label: '日期',
          align: 'center',
          field: '日期',
          sortable: true
        },
        {
          name: '單價',
          label: '單價',
          align: 'center',
          field: '單價',
          sortable: true
        },
        {
          name: '折數',
          label: '折數',
          align: 'center',
          field: '折數',
          format: val => `${val}%`,
          sortable: true
        },
        {
          name: '複價',
          label: '複價',
          align: 'center',
          field: '複價',
          sortable: true
        },
        {
          name: '付款條件',
          label: '付款條件',
          align: 'center',
          field: '付款條件'
        },
        {
          name: '稅金',
          label: '稅金',
          align: 'center',
          field: '稅金'
        },
        {
          name: 'Project code',
          label: 'Project code',
          align: 'center',
          field: 'Project code'
        },
        {
          name: '備註',
          label: '備註',
          align: 'center',
          field: '備註'
        }
      ],
      tableData: [],
      topRightWidth: null,
      createBtn: false,
      updateBtn: false,
      deleteConfirm: false,
      expandedKeys: []
    }
  },
  mounted () {
    this.initializeForTree()
  },
  methods: {
    initializeForTree () {
      materialsListAPI.post('/api/initializeForTree').then((res) => {
        const simple = this.simple
        const arrProductSort = new Set([...res.data.arrMaterialsInform.map(elem => {
          return elem.產品名稱
        })])
        this.treeData = res.data.arrMaterialsInform
        simple.splice(0, simple.length)
        arrProductSort.forEach(elem1 => {
          simple.splice(simple.length, 0, {
            label: elem1,
            header: 'class2',
            children: []
          })
          const simpleChildren = simple[simple.length - 1].children
          simpleChildren.splice(0, simpleChildren.length)
          res.data.arrMaterialsInform.filter(elem2 => elem2.產品名稱 === elem1).forEach(elem3 => {
            if (!simpleChildren.includes(elem3.型號)) {
              simpleChildren.splice(simpleChildren.length, 0, {
                label: elem3.型號,
                header: 'model'
              })
            }
          })
        })
      })
    },
    async onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter
      this.loading = true
      let rowsData = null
      const treeData = this.treeData, treeSelected = this.treeSelected
      console.log('treeData')
      console.log(treeData)
      await materialsListAPI.post('/api/getRowsData', { materialsInformId: treeData.find(elem => elem.產品名稱 === this.expandedKeys[0] && elem.型號 === treeSelected)._id }).then((res) => {
        rowsData = res.data.rowsData
      })
      // emulate server
      // update rowsCount with appropriate value
      this.pagination.rowsNumber = this.getRowsNumberCount(filter, rowsData, this.tableSearchKey)
      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage
      // calculate starting row of data
      const startRow = (page - 1) * rowsPerPage
      // fetch data from "server"
      const returnedData = this.fetchFromServer(startRow, fetchCount, filter, this.tableSearchKey, sortBy, descending, rowsData)
      // clear out existing data and add new
      this.tableData.splice(0, this.tableData.length, ...returnedData)
      // don't forget to update local pagination object
      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
      // ...and turn of loading indicator
      this.loading = false
    },
    fetchFromServer (startRow, count, filter, tableSearchKey, sortBy, descending, rowsData) {
      const data = filter
        ? rowsData.filter(row => row[tableSearchKey].toString().includes(filter))
        : rowsData.slice()
      if (sortBy) {
        const sortFn = sortBy === '日期'
          ? (descending
            ? (a, b) => (Date.UTC(...b[sortBy].split('/')) - Date.UTC(...a[sortBy].split('/')))
            : (a, b) => (Date.UTC(...a[sortBy].split('/')) - Date.UTC(...b[sortBy].split('/')))
          )
          : (descending
            ? (a, b) => (parseFloat(b[sortBy]) - parseFloat(a[sortBy]))
            : (a, b) => (parseFloat(a[sortBy]) - parseFloat(b[sortBy]))
          )
        data.sort(sortFn)
      }
      return data.slice(startRow, startRow + count)
    },
    getRowsNumberCount (filter, rowsData, tableSearchKey) {
      if (!filter) {
        return rowsData.length
      }
      let count = 0
      rowsData.forEach(elem => {
        if (elem[tableSearchKey].toString().includes(filter)) {
          ++count
        }
      })
      return count
    },
    myFilterMethod (node, filter) {
      const filt = filter.toLowerCase()
      return (node.label && node.label.toLowerCase().indexOf(filt) > -1) || (node.story && node.story.toLowerCase().indexOf(filt) > -1)
    },
    nodeExpanded (expanded) {
      if (expanded.length > 1) {
        expanded.splice(0, 1)
      }
    },
    onCreate () {
      this.$socket.emit('initializeForRecordCreated', {
        materialsInformId: this.treeData.find(elem => elem.產品名稱 === this.expandedKeys[0] && elem.型號 === this.treeSelected)._id
      })
      this.createBtn = true
    },
    onUpdate () {
      if (this.tableSelected.length > 0) {
        this.$socket.emit('initializeForRecordUpdated', {
          tableSelectedID: this.tableSelected[0]._id
        })
        this.updateBtn = true
      }
    },
    onDelete (tableSelected) {
      console.log('tableSelected[0]._id')
      console.log(tableSelected[0]._id)
      this.$socket.emit('delete', {
        tableSelectedID: tableSelected[0]._id
      })
      this.deleteConfirm = false
    },
    resetFilter () {
      this.filterForTree = ''
      this.$refs.filterForTree.focus()
    },
    topRightResize (size) {
      this.topRightWidth = size.width
    }
  },
  watch: {
    treeSelected: function (value) {
      console.log('treeSelected')
      console.log(value)
      if (this.treeData.some(elem => elem.產品名稱 === this.expandedKeys[0] && elem.型號 === value)) {
        this.onRequest({
          pagination: this.pagination,
          filter: undefined
        })
      }
    }
  },
  sockets: {
    submitSucceed: function (backendData) {
      this.createBtn = false
      this.updateBtn = false
      refreshTable(this.initializeForTree, this.onRequest, this.pagination, backendData.message)
    },
    deleteSucceed: function (backendData) {
      this.tableSelected.splice(0, this.tableSelected.length)
      this.deleteConfirm = false
      refreshTable(this.initializeForTree, this.onRequest, this.pagination, backendData.message)
    }
  }
}
// async function refreshTable (initializeForTree, onRequest, message) {
//   await initializeForTree()
function refreshTable (initializeForTree, onRequest, parameterPagination, message) {
  initializeForTree()
  onRequest({
    pagination: parameterPagination,
    filter: undefined
  })
  Notify.create({
    type: 'positive',
    message: message
  })
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&sSheet.scss';
</style>
<style lang="sass">
.materialsListTable
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
