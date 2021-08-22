<template>
  <div class="q-pa-md my-font-medium bg-grey-1">
    <!-- <q-btn-group spread>
      <q-btn color="purple" label="常用清單" icon="timeline" @click="selCls = true, showList()" />
      <q-btn color="purple" label="自訂類別" icon="visibility" @click="selCls = false, showCustom()" />
    </q-btn-group>

    <q-select v-show="selCls" v-model="productClassListSelected" :options="productClassOptionsInList" label="產品種類清單" />

    <q-input v-show="!selCls" outlined v-model="productClassInput" label="產品種類" />

    <q-btn v-show="!selCls" color="primary" label="加入一列" @click="addRow" /> -->

    <q-btn-group spread>
      <q-btn push label="常用清單" icon="description" :style="btnGroup.list ? 'background-color: #f2c037;' : 'background-color: #00bcd4;'" @click="btnGroup.list = true, btnGroup.custom = false, showList()" />
      <q-btn push label="自訂類別" icon="settings" :style="btnGroup.custom ? 'background-color: #f2c037;' : 'background-color: #00bcd4;'" @click="btnGroup.custom = true, btnGroup.list = false, showCustom()" />
    </q-btn-group>

    <!-- 常用清單 -->
    <!-- <q-select v-show="btnGroup.list" v-model="productClassListSelected" :options="productClassOptionsInList" label="常用清單" /> -->

    <!-- 自訂類別 -->
    <!-- <div class="row justify-between">
      <q-input v-show="btnGroup.custom" outlined v-model="productClassInput" label="產品種類" class="col-10" />
      <q-btn v-show="btnGroup.custom" color="primary" label="加入一列" @click="addRow()" class="col-1" />
    </div> -->

    <q-table
      :data="data"
      :columns="columns"
      row-key="產品種類"
      selection="single"
      :selected.sync="dataSelected"
      class="my-sticky-dynamic text-grey-10"
      v-show="btnGroup.list || btnGroup.custom"
    >
      <template v-slot:top-left>
        <!-- 自訂類別 -->
        <div class="row q-gutter-md" v-if="btnGroup.custom">
          <q-input dense outlined bg-color="grey-4" v-model="customSheetNameInput" label="自訂清單名稱" />
          <q-btn color="white" text-color="black" label="新增常用清單" @click="newCustomIntoList()" />
        </div>
        <!-- 常用清單 -->
        <q-btn color="white" text-color="black" label="刪除常用清單" v-if="btnGroup.list"
          @click="productClassListSelected ? deleteListItem = true : deleteListItem = false"
        />
      </template>

      <template v-slot:top-right>
        <!-- 自訂類別 --><!-- 常用清單 -->
        <!-- q-gutter-md -->
        <div class="row justify-between" style="width: 37vw;">
          <q-select dense outlined bg-color="grey-4" v-model="productClassListSelected" :options="productClassOptionsInList" label="常用清單" v-show="btnGroup.list" class="col-3" />
          <!-- <q-input dense outlined bg-color="grey-4" v-model="productClassSelectedFromDB" label="產品種類" :class="btnGroup.custom ? 'col-5' : 'col-4'" /> -->

          <!-- :style="`width: ${(backgroundWidth - 250) / 2}px;`" -->
          <!-- @input="getRespectiveValueByTaxIdNum()" -->
          <q-select
            dense
            no-error-icon
            use-input
            new-value-mode="add-unique"
            outlined
            clearable
            bg-color="grey-4"
            input-debounce="500"
            label="產品種類"
            :options="productClassOptionsFromDB"
            @filter="(value, update) => { fetchAndFilter(value, update) }"
            v-model="productClassSelectedFromDB"
            :class="btnGroup.custom ? 'col-5' : 'col-4'"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label>{{ scope.opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:append>
              <q-icon name="input" />
            </template>
          </q-select>
          <q-btn color="white" text-color="black" label="新增" @click="addRow()" v-show="btnGroup.custom" class="col-2" />
          <q-btn color="white" text-color="black" label="更新" @click="openUpdateTableDataListDialog(), updateTableData(btnGroup.custom)" class="col-2" />
          <q-btn color="white" text-color="black" label="刪除" @click="openDeleteOnTableDialog()" class="col-2" />
        </div>

        <!-- 常用清單更新 -->
        <q-dialog v-model="dialog.list.update" persistent>
          <q-card class="bg-grey-4">
            <q-card-section class="row items-center">
              <q-icon name="update" class="text-warning" style="font-size: 4rem;" />
              <span class="q-ml-sm" style="font-size: 1.2rem;">是否永久保存此更新？</span>
            </q-card-section>

            <q-card-actions align="center">
              <q-btn size="md" label="是" color="white" text-color="grey-10" v-close-popup @click="updateListAndTableData(btnGroup.list)" />
              <q-btn size="md" label="否" color="white" text-color="grey-10" v-close-popup @click="updateTableData(btnGroup.list)" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- 常用清單刪除 -->
        <q-dialog v-model="dialog.list.delete" persistent>
          <q-card class="bg-grey-4">
            <q-card-section class="row items-center">
              <q-icon name="warning" class="text-negative" style="font-size: 4rem;" />
              <span class="q-ml-sm" style="font-size: 1.2rem;">是否永久刪除此筆資料？</span>
            </q-card-section>

            <q-card-actions align="center">
              <q-btn push size="md" label="是" color="negative" text-color="white" v-close-popup @click="deleteListAndTableData()" />
              <q-btn size="md" label="否" color="white" text-color="grey-10" v-close-popup @click="deleteTableData()" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- 刪除常用清單 -->
        <q-dialog v-model="deleteListItem" persistent>
          <q-card class="bg-grey-4">
            <q-card-section class="row items-center">
              <q-icon name="warning" class="text-negative" style="font-size: 4rem;" />
              <span class="q-ml-sm" style="font-size: 1.2rem;">是否確定刪除此清單？</span>
            </q-card-section>

            <q-card-actions align="center">
              <q-btn push size="md" label="是" color="negative" text-color="white" v-close-popup @click="deleteDataInList()" />
              <q-btn size="md" label="否" color="white" text-color="grey-10" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- 自訂類別刪除 -->
        <q-dialog v-model="dialog.custom.delete" persistent>
          <q-card class="bg-grey-4">
            <q-card-section class="row items-center">
              <q-icon name="warning" class="text-negative" style="font-size: 4rem;" />
              <span class="q-ml-sm" style="font-size: 1.2rem;">是否確定刪除此筆資料？</span>
            </q-card-section>

            <q-card-actions align="center">
              <q-btn push size="md" label="是" color="negative" text-color="white" v-close-popup @click="deleteTableData()" />
              <q-btn size="md" label="否" color="white" text-color="grey-10" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </template>
    </q-table>
  </div>
</template>

<script>
// import { bomSheet } from 'boot/axios'
import { Notify, SessionStorage } from 'quasar'
import { ProductClassificationAPI, bomSheet } from 'boot/axios'
// import Vue from 'vue'
// import VueSocketIO from 'vue-socket.io'
export default {
  props: ['operation', 'returnBackFirstPage', 'arrproductClass', 'bomTablePreview'],
  data () {
    return {
      dataSelected: [],
      productClassListSelected: null,
      productClassOptionsInList: [],
      // productClassInput: '',
      // productClassSelectedFromDB: '',
      productClassSelectedFromDB: '',
      productClassOptionsFromDB: [],
      customSheetNameInput: '',
      deleteListItem: false,
      columns: [{
        name: '產品種類',
        label: '產品種類',
        align: 'center',
        field: '產品種類'
      }],
      data: [],
      // selCls: false,
      btnGroup: {
        list: false,
        custom: false
      },
      // informFromDB: [{
      //   name: '1st',
      //   subArr: [
      //     '設備',
      //     '設備1',
      //     '設備2'
      //   ]
      // },
      // {
      //   name: '2ND',
      //   subArr: [
      //     '設備00',
      //     '設備001',
      //     '設備002'
      //   ]
      // }],
      informFromDB: [],
      dialog: {
        list: {
          update: false,
          delete: false
        },
        custom: {
          delete: false
        }
      }
    }
  },
  mounted () {
    // Vue.use(new VueSocketIO({
    //   debug: true,
    //   // 服務器端地址
    //   connection: 'http://localhost:3006',
    //   vuex: {}
    // }))
    if (SessionStorage.has('btnGroupInproductClassManagement')) {
      this.btnGroup = SessionStorage.getItem('btnGroupInproductClassManagement')
    }
    loadData('arrproductClass', this.data)
    // loadData('informFromDB', this.informFromDB)
    bomSheet.post('/api/getInformFromDB').then((res) => {
      res.data.informFromDB.forEach(elem => {
        this.informFromDB.splice(this.informFromDB.length, 0, elem)
      })
    })
  },
  methods: {
    addRow () {
      // if (this.productClassInput) {
      if (this.productClassSelectedFromDB) {
        if (!arrproductClassData(this.data).includes(this.productClassSelectedFromDB)) {
          this.data.splice(this.data.length, 0, { 產品種類: this.productClassSelectedFromDB })
          SessionStorage.set('arrproductClass', this.data)
          if (SessionStorage.has('dataInBomSheet')) {
            const dataInBomSheet = SessionStorage.getItem('dataInBomSheet'),
              indexAddRow = dataInBomSheet.findIndex(elem => elem.column1 === '運費')
            dataInBomSheet.splice(indexAddRow, 0, { column0: null, column1: this.productClassSelectedFromDB, column2: null, column3: null, column4: null, column5: null, column6: null, column7: null })
            SessionStorage.set('dataInBomSheet', dataInBomSheet)
          }
          this.productClassSelectedFromDB = ''
        } else {
          notify('warning', '輸入 "產品種類" 已存在')
        }
      } else {
        notify('warning', '不能輸入空值')
      }
    },
    showList () {
      this.productClassListSelected = null
      // this.data.splice(0, this.data.length)
      this.productClassOptionsInList.splice(0, this.productClassOptionsInList.length, ...arrNameInInformFromDB(this.informFromDB))
    },
    showCustom () {
      this.productClassSelectedFromDB = ''
      // this.data.splice(0, this.data.length)
    },
    openDeleteOnTableDialog () {
      if (this.dataSelected.length > 0) {
        if (this.btnGroup.list) {
          this.dialog.list.delete = true
        } else if (this.btnGroup.custom) {
          this.dialog.custom.delete = true
        }
      }
    },
    openUpdateTableDataListDialog () {
      if (this.btnGroup.list && this.dataSelected.length > 0) {
        this.dialog.list.update = true
      }
    },
    updateTableData (btnInGroup) {
      if (btnInGroup) {
        if (this.dataSelected.length === 0) {
          notify('warning', '請先選擇一列')
        } else if (!arrproductClassData(this.data).includes(this.productClassSelectedFromDB)) {
          this.data[specificproductClassIndex(this.data, this.dataSelected[0].產品種類)].產品種類 = this.productClassSelectedFromDB
          this.productClassSelectedFromDB = ''
          this.dataSelected.splice(0, this.dataSelected.length)
          notify('positive', '更新成功')
        } else {
          notify('warning', '輸入 "產品種類" 已存在')
        }
      }
    },
    deleteTableData () {
      if (this.dataSelected.length > 0) {
        // if (SessionStorage.has('dataInBomSheet')) {
        //   const dataInBomSheet = SessionStorage.getItem('dataInBomSheet')
        //   const indexproductClassDeletedInproductClassManagement = this.data.findIndex(elem => elem.產品種類 === this.dataSelected[0].產品種類)
        //   const respectiveIndexproductClassInBomSheet = dataInBomSheet.findIndex(elem => elem.column1 === this.data[indexproductClassDeletedInproductClassManagement].產品種類)
        //   const indexsRemoved = this.data[indexproductClassDeletedInproductClassManagement + 1]
        //     ? dataInBomSheet.findIndex(elem => elem.column1 === this.data[indexproductClassDeletedInproductClassManagement + 1].產品種類) - respectiveIndexproductClassInBomSheet
        //     : dataInBomSheet.length - respectiveIndexproductClassInBomSheet
        //   dataInBomSheet.splice(respectiveIndexproductClassInBomSheet, indexsRemoved)
        //   SessionStorage.set('dataInBomSheet', dataInBomSheet)
        // }
        deleteDataElem(this.data, this.dataSelected)
        this.data.splice(specificproductClassIndex(this.data, this.dataSelected[0].產品種類), 1)
        SessionStorage.set('arrproductClass', this.data)
        this.productClassSelectedFromDB = ''
        this.dataSelected.splice(0, this.dataSelected.length)
        notify('positive', '刪除成功')
      } else {
        notify('warning', '請先選擇一列')
      }
    },
    newCustomIntoList () {
      if (this.customSheetNameInput && this.data.length > 0 && !arrNameInInformFromDB(this.informFromDB).includes(this.customSheetNameInput)) {
        this.informFromDB.splice(this.informFromDB.length, 0, {
          name: this.customSheetNameInput,
          subArr: arrproductClassData(this.data)
        })
        this.customSheetNameInput = ''
        notify('positive', '新增成功')
      }
    },
    updateListAndTableData (btnInGroup) {
      if (btnInGroup && this.dataSelected.length > 0) {
        if (!arrproductClassData(this.data).includes(this.productClassSelectedFromDB)) {
          const specificSubArr = this.informFromDB[specificNameIndexInInformFromDB(this.informFromDB, this.productClassListSelected)].subArr
          this.data[specificproductClassIndex(this.data, this.dataSelected[0].產品種類)].產品種類 = this.productClassSelectedFromDB
          specificSubArr.splice(specificproductClassIndexInInformFromDB(specificSubArr, this.dataSelected[0].產品種類), 1, this.productClassSelectedFromDB)
          this.productClassSelectedFromDB = ''
          this.dataSelected.splice(0, this.dataSelected.length)
          notify('positive', '更新成功')
        } else {
          notify('warning', '輸入 "產品種類" 已存在')
        }
      }
    },
    deleteListAndTableData () {
      if (this.dataSelected.length > 0) {
        const specificSubArr = this.informFromDB[specificNameIndexInInformFromDB(this.informFromDB, this.productClassListSelected)].subArr
        this.data.splice(specificproductClassIndex(this.data, this.dataSelected[0].產品種類), 1)
        specificSubArr.splice(specificproductClassIndexInInformFromDB(specificSubArr, this.dataSelected[0].產品種類), 1)
        this.productClassSelectedFromDB = ''
        this.dataSelected.splice(0, this.dataSelected.length)
        notify('positive', '刪除成功')
      }
    },
    deleteDataInList () {
      if (this.productClassListSelected) {
        this.informFromDB.splice(specificNameIndexInInformFromDB(this.informFromDB, this.productClassListSelected), 1)
        this.productClassOptionsInList.splice(specificproductClassOPtionIndex(this.productClassOptionsInList, this.productClassListSelected), 1)
        this.productClassListSelected = null
        this.data.splice(0, this.data.length)
        notify('positive', '刪除成功')
      }
    },
    fetchAndFilter (value, update) {
      if (value) {
        ProductClassificationAPI.post('/api/filterAndGetproductClassOptions', { inputValue: value }).then((res) => {
          updateOptions(update, this.productClassOptionsFromDB, res.data.optionFiltered)
        })
      }
    }
  },
  sockets: {
    importDataClassOne (backendData) {
      this.btnGroup.custom = true
      this.data.splice(0, this.data.length, ...backendData.dataClassOne)
    }
  },
  watch: {
    productClassListSelected (value) {
      if (value) {
        var select = this.informFromDB.find(elem => elem.name === this.productClassListSelected)
        this.data.splice(0, this.data.length, ...select.subArr.map(elem => {
          return { 產品種類: elem }
        }))
      }
    },
    operation (value) {
      if (value === 'reset') {
        this.data.splice(0, this.data.length)
        this.$emit('operationStatus', {
          key: 'operation',
          value: undefined
        })
      } else if (value === 'pending') {
        if (this.data.length > 0) {
          // this.$emit('getBasicInformData', {
          //   key: 'arrproductClass',
          //   value: this.data.map(elem => { return elem.產品種類 })
          // })
          SessionStorage.set('arrproductClass', this.data)
          SessionStorage.set('informFromDB', this.informFromDB)
          SessionStorage.set('btnGroupInproductClassManagement', this.btnGroup)
          this.$emit('getArrproductClass')
          this.$emit('resultSubmited', {
            key: 'productClassManagementStatus',
            value: 'succeed'
          })
        } else {
          this.$emit('operationStatus', {
            key: 'operation',
            value: undefined
          })
          notify('warning', '尚有資料未填入')
        }
      }
    },
    returnBackFirstPage (value) {
      this.data.splice(this.data, 0, ...this.arrproductClass)
    },
    'bomTablePreview.switch' (value) {
      SessionStorage.set('arrproductClass', this.data)
    }
  }
}

function deleteDataElem (data, dataSelected) {
  if (SessionStorage.has('dataInBomSheet')) {
    const dataInBomSheet = SessionStorage.getItem('dataInBomSheet'),
      indexproductClassDeletedInproductClassManagement = data.findIndex(elem => elem.產品種類 === dataSelected[0].產品種類),
      respectiveIndexproductClassInBomSheet = dataInBomSheet.findIndex(elem => elem.column1 === data[indexproductClassDeletedInproductClassManagement].產品種類),
      indexsRemoved = data[indexproductClassDeletedInproductClassManagement + 1]
        ? dataInBomSheet.findIndex(elem => elem.column1 === data[indexproductClassDeletedInproductClassManagement + 1].產品種類) - respectiveIndexproductClassInBomSheet
        // : dataInBomSheet.length - respectiveIndexproductClassInBomSheet
        : dataInBomSheet.findIndex(elem => elem.column1 === '運費') - respectiveIndexproductClassInBomSheet
    dataInBomSheet.splice(respectiveIndexproductClassInBomSheet, indexsRemoved)
    SessionStorage.set('dataInBomSheet', dataInBomSheet)
  }
}

function loadData (keyInStorage, localKey) {
  if (SessionStorage.has(keyInStorage)) {
    const valueInStorage = SessionStorage.getItem(keyInStorage)
    localKey.splice(0, localKey.length, ...valueInStorage)
  }
}

function updateOptions (update, options, arrOptions) {
  update(() => {
    options.splice(0, options.length, ...arrOptions)
  })
}

function specificproductClassIndexInInformFromDB (subArr, productClassSelectedInData) {
  subArr.indexOf(productClassSelectedInData)
}

function specificproductClassOPtionIndex (productClassOptionsInList, productClassListSelected) {
  // return productClassOptionsInList.findIndex(elem => elem === productClassListSelected)
  return productClassOptionsInList.indexOf(productClassListSelected)
}

function specificNameIndexInInformFromDB (informFromDB, productClassListSelected) {
  return informFromDB.findIndex(elem => elem.name === productClassListSelected)
  // return informFromDB.indexOf(productClassListSelected)
}

function arrNameInInformFromDB (informFromDB) {
  return informFromDB.map(elem => {
    return elem.name
  })
}

function specificproductClassIndex (data, productClassSelectedInData) {
  return data.findIndex(elem => elem.產品種類 === productClassSelectedInData)
  // return data.indexOf(productClassSelectedInData)
}

function arrproductClassData (data) {
  return data.map(elem => {
    return elem.產品種類
  })
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
.my-sticky-dynamic
  /* height or max-height is important */
  // height: 743px
  height: 30rem
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
