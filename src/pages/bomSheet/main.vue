<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <!-- header-nav -->
    <q-stepper
      v-model="step"
      vertical
      flat
      color="primary"
      header-class="text-bold"
      header-nav
      animated
    >
      <q-step
        :name="1"
        title="基本資料"
        icon="settings"
        :done="step > 1"
      >
        <q-stepper-navigation class="row justify-end q-gutter-lg bottle-btn-position q-pb-lg">
          <q-btn @click="previewBomTable()" size="lg" class="border-radius-btn col-2" color="btn-confirm-color" text-color="grey-10" label="預覽" v-if="bomTablePreview.status === 'positive'" />

          <q-btn-dropdown size="lg" label="匯入資料" class="border-radius-btn col-2 text-white" style="background-color: #00bcd4;">
            <q-list>
              <q-item>
                <q-item-section>
                  <q-select dense outlined v-model="project.projectName" :options="optionsProjectName" label="工程名稱" />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-select dense outlined v-model="project.projectDate" :options="optionsProjectDate" label="時間" />
                </q-item-section>
              </q-item>

              <q-item class="row">
                <q-item-section class="column">
                  <q-btn dense color="negative" label="刪除" class="self-start" v-close-popup @click="deleteBomSheetRecord()" />
                </q-item-section>
                <q-item-section class="column">
                  <q-btn dense color="btn-confirm-color" label="送出" class="self-end" v-close-popup @click="importHistoryRecord()" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn @click="onReset()" size="lg" class="border-radius-btn col-2" color="white" text-color="grey-10" label="重設" />
          <q-btn @click="operation='pending'" size="lg" class="border-radius-btn col-2" color="btn-confirm-color" text-color="grey-10" label="下一頁" />
        </q-stepper-navigation>

        <basicInform @operationStatus="operationStatus" @resultSubmited="resultSubmited" :operation="operation" :basicInformContent="basicInform" :bomTablePreview="bomTablePreview" />
        <productClassManagement @operationStatus="operationStatus" @resultSubmited="resultSubmited" @getArrproductClass="getArrproductClass" :operation="operation" :bomTablePreview="bomTablePreview" />

        <q-dialog v-model="bomTablePreview.on">
          <div style="max-width: 80vw; width:100%;">
            <bomTable :step="step" />
          </div>
        </q-dialog>
      </q-step>

      <q-step
        :name="index + 2"
        :title="elem"
        icon="create_new_folder"
        :done="step > (index + 2)"
        v-for="(elem, index) in arrproductClass"
        :key="index"
      >
        <q-stepper-navigation class="row justify-end q-gutter-lg bottle-btn-position q-pb-lg" style="width: 100%;">
          <q-btn @click="step -= 1" size="lg" class="border-radius-btn" color="white" text-color="grey-10" label="返回" />
          <q-btn size="lg" class="border-radius-btn" color="white" text-color="grey-10" label="重設" @click="resetFormForproductClass = !resetFormForproductClass" />
          <q-btn size="lg" class="border-radius-btn" color="btn-confirm-color" text-color="grey-10" label="下一頁" @click="onNextPage()" />
        </q-stepper-navigation>

        <formForproductClass :clickAddRowForproductClassOnTable="clickAddRowForproductClassOnTable" :resetFormForproductClass="resetFormForproductClass" :step="step" @addRowForproductClassOnTable="onAddRowForproductClassOnTable = !onAddRowForproductClassOnTable" />
        <br>
        <div style="border-width:3px; border-style:dashed; border-color:#9e9e9e; padding:5px;" class="text-center col cursor-pointer" @click="clickAddRowForproductClassOnTable = !clickAddRowForproductClassOnTable">
          新增一列
        </div>
        <br>
        <bomTable :productClass="elem" :onAddRowForproductClassOnTable="onAddRowForproductClassOnTable" />
      </q-step>

      <q-step
        :name="arrproductClass.length + 2"
        title="運費"
        icon="create_new_folder"
        :done="step > arrproductClass.length + 2"
        v-if="arrproductClass.length > 0"
      >
        <q-stepper-navigation class="row justify-end q-gutter-lg bottle-btn-position q-pb-lg" style="width: 100%;">
          <q-btn @click="step -= 1" size="lg" class="border-radius-btn" color="white" text-color="grey-10" label="返回" />
          <q-btn size="lg" class="border-radius-btn" color="white" text-color="grey-10" label="重設" @click="resetFormForFees = !resetFormForFees" />
          <q-btn size="lg" class="border-radius-btn" color="btn-confirm-color" text-color="grey-10" label="下一頁" @click="onNextPage()" />
        </q-stepper-navigation>

        <formForFees :clickAddRowForFeesOnTable="clickAddRowForFeesOnTable" :resetFormForFees="resetFormForFees" @addRowForFeesOnTable="onAddRowForFeesOnTable = !onAddRowForFeesOnTable" />
        <br>
        <div style="border-width:3px; border-style:dashed; border-color:#9e9e9e; padding:5px;" class="text-center col cursor-pointer" @click="clickAddRowForFeesOnTable = !clickAddRowForFeesOnTable">
          新增一列
        </div>
        <br>
        <bomTable :typeOfFee="getTypeOfFee()" :onAddRowForFeesOnTable="onAddRowForFeesOnTable" />
      </q-step>

      <q-step
        :name="arrproductClass.length + 3"
        title="其他費用"
        icon="create_new_folder"
        v-if="arrproductClass.length > 0"
      >
        <q-stepper-navigation class="row justify-end q-gutter-lg bottle-btn-position q-pb-lg" style="width: 100%;">
          <q-btn @click="step -= 1" size="lg" class="border-radius-btn" color="white" text-color="grey-10" label="返回" />
          <q-btn size="lg" class="border-radius-btn" color="white" text-color="grey-10" label="重設" @click="resetFormForFees = !resetFormForFees" />
        </q-stepper-navigation>

        <formForFees :clickAddRowForFeesOnTable="clickAddRowForFeesOnTable" :resetFormForFees="resetFormForFees" @addRowForFeesOnTable="onAddRowForFeesOnTable = !onAddRowForFeesOnTable" />
        <br>
        <div style="border-width:3px; border-style:dashed; border-color:#9e9e9e; padding:5px;" class="text-center col cursor-pointer" @click="clickAddRowForFeesOnTable = !clickAddRowForFeesOnTable">
          新增一列
        </div>
        <br>
        <bomTable :typeOfFee="getTypeOfFee()" :onAddRowForFeesOnTable="onAddRowForFeesOnTable" />
      </q-step>
    </q-stepper>
  </div>
</template>

<script>
import { bomSheet } from 'boot/axios'
import { SessionStorage, Notify } from 'quasar'
import basicInform from './basicInform.vue'
import productClassManagement from './productClassManagement.vue'
import formForproductClass from './formForproductClass.vue'
import formForFees from './formForFees.vue'
import bomTable from './bomTable.vue'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3006',
  vuex: {}
}))
export default {
  components: {
    basicInform: basicInform,
    productClassManagement: productClassManagement,
    formForproductClass: formForproductClass,
    formForFees: formForFees,
    bomTable: bomTable
  },
  data () {
    return {
      step: 1,
      operation: undefined,
      firstPageSubmitStatus: {
        basicInformStatus: undefined,
        productClassManagementStatus: undefined
      },
      arrproductClass: [],
      resetFormForproductClass: false,
      resetFormForFees: false,
      formDataNextPage: false,
      clickAddRowForproductClassOnTable: false,
      clickAddRowForFeesOnTable: false,
      onAddRowForproductClassOnTable: false,
      onAddRowForFeesOnTable: false,
      project: {
        projectName: undefined,
        projectDate: undefined
      },
      optionsProjectName: [],
      optionsProjectDate: [],
      basicInform: {
        switch: false,
        data: undefined
      },
      bomTablePreview: {
        switch: false,
        on: false,
        status: undefined
      }
    }
  },
  created () {
    SessionStorage.clear()
  },
  mounted () {
    this.getProjectNameAndDateOptions()
  },
  methods: {
    getProjectNameAndDateOptions () {
      bomSheet.post('/api/getProjectNameAndDateOptions').then((res) => {
        const { optionsProjectName, optionsProjectDate } = res.data
        this.optionsProjectName.splice(0, this.optionsProjectName.length, ...optionsProjectName)
        this.optionsProjectDate.splice(0, this.optionsProjectDate.length, ...optionsProjectDate)
      })
    },
    deleteBomSheetRecord () {
      const { projectName, projectDate } = this.project
      if (projectName && projectDate) {
        bomSheet.post('/api/deleteBomSheetRecord', { projectName: projectName, projectDate: projectDate }).then((res) => {
          this.project.projectName = undefined
          this.project.projectDate = undefined
          this.getProjectNameAndDateOptions()
          this.bomTablePreview.status = 'negative'
          notify('positive', '刪除成功')
        })
      }
    },
    importHistoryRecord () {
      const { projectName, projectDate } = this.project
      if (projectName && projectDate) {
        bomSheet.post('/api/importHistoryRecord', { projectName: projectName, projectDate: projectDate })
      }
    },
    operationStatus (value) {
      this[value.key] = value.value
    },
    resultSubmited (value) {
      this.firstPageSubmitStatus[value.key] = value.value
    },
    onNextPage (value) {
      this.step += 1
    },
    getArrproductClass () {
      if (SessionStorage.has('arrproductClass')) {
        const valueInStorage = SessionStorage.getItem('arrproductClass')
        this.arrproductClass.splice(0, this.arrproductClass.length, ...valueInStorage.map(elem => {
          return elem.產品種類
        }))
      }
    },
    getTypeOfFee () {
      if (this.step === this.arrproductClass.length + 2) {
        return '運費'
      } else if (this.step === this.arrproductClass.length + 3) {
        return '其他費用'
      }
    },
    onReset () {
      this.operation = 'reset'
      this.arrproductClass.splice(0, this.arrproductClass.length)
      SessionStorage.clear()
    },
    previewBomTable () {
      if (this.bomTablePreview.status === 'positive') {
        this.bomTablePreview.on = true
      }
    }
  },
  sockets: {
    addOptionForImportRecord (backendData) {
      const { 工程名稱, 時間 } = SessionStorage.getItem('basicInform')
      if (!this.optionsProjectName.includes(工程名稱)) {
        this.optionsProjectName.splice(this.optionsProjectName.length, 0, 工程名稱)
      }
      if (!this.optionsProjectDate.includes(時間)) {
        this.optionsProjectDate.splice(this.optionsProjectDate.length, 0, 時間)
      }
      this.step = 1
    },
    importBasicInform (backendData) {
      this.basicInform.data = backendData.basicInform
      this.basicInform.switch = !this.basicInform.switch
      this.bomTablePreview.switch = !this.bomTablePreview.switch
      this.bomTablePreview.status = 'positive'
    }
  },
  watch: {
    firstPageSubmitStatus: {
      handler: function (newValue, oldValue) {
        const { basicInformStatus, productClassManagementStatus } = this.firstPageSubmitStatus
        if (basicInformStatus === 'succeed' && productClassManagementStatus === 'succeed') {
          this.step += 1
        }
        this.operation = undefined
      },
      deep: true
    },
    step (value) {
      if (value === 2) {
        this.firstPageSubmitStatus.basicInformStatus = undefined
        this.firstPageSubmitStatus.productClassManagementStatus = undefined
      }
    },
    project: {
      handler: function (newValue, oldValue) {
        SessionStorage.set('project', this.project)
      },
      deep: true
    }
  }
}
function notify (type, message) {
  Notify.create({
    type: type,
    message: message
  })
}
</script>
