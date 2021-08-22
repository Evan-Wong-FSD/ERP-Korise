<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <section>
      <q-form @submit="checkForm()" @reset="onReset" class="row justify-center q-gutter-lg">
        <q-stepper
          v-model="page"
          ref="stepper"
          alternative-labels
          color="primary"
          flat
          animated
          class="bg-grey-1"
        >
          <q-step
            :name="1"
            title="發票基本資料"
            icon="assignment"
            :done="page > 1"
          >
            <div class="row justify-center q-gutter-lg">
              <q-select
                no-error-icon
                :use-input="ternaryOperator(false, true, elem1, ['時間', '發票號', '稅額', '備註 (選填)', '期年', 'blank'])"
                :hide-dropdown-icon="ternaryOperator(true, false, elem1, ['時間', '發票號', '稅額', '備註 (選填)', '期年', 'blank'])"
                :error="isError(elem1)"
                :readonly="ternaryOperator(true, false, elem1, ['發票號', '稅額', '備註 (選填)', '期年', 'blank'])"
                :outlined="ternaryOperator(false, true, elem1, ['發票號', '稅額', '備註 (選填)', '期年', 'blank'])"
                :borderless="ternaryOperator(true, false, elem1, ['發票號', '稅額', '備註 (選填)', '期年', 'blank'])"
                :clearable="ternaryOperator(false, true, elem1, ['發票號', '稅額', '備註 (選填)', '期年', 'blank'])"
                :label="ternaryOperator(null, elem1, elem1, ['發票號', '稅額', '備註 (選填)', '期年', 'blank'])"
                :options="option"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                @focus="focusSelect = elem1"
                @filter="(value, update) => { distributeFilter(elem1, value, update) }"
                v-bind:value="ternaryOperator(null, invoiceRecord.firstPage[elem1], elem1, ['發票號', '稅額', '備註 (選填)', '期年', 'blank'])"
                v-on:input="ternaryOperator(null, invoiceRecord.firstPage[elem1] = $event, elem1, ['發票號', '稅額', '備註 (選填)', '期年', 'blank'])"
                v-for="(elem1, index1) in Object.keys(invoiceRecord.firstPage)"
                :key="index1"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" v-if="ternaryOperator(false, true, elem1, ['發票號', '稅額', '備註 (選填)', '期年', 'blank'])">
                    <q-item-section>
                      <q-item-label>{{ scope.opt }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:prepend>
                  <div class="cursor-pointer q-gutter-x-sm" :style="invoiceRecord.firstPage[elem1] ? 'width: auto;' : `width: ${(backgroundWidth - 250) / 2}px;`" v-if="elem1 === '時間'">
                    <q-icon name="event" />
                    <span v-show="!invoiceRecord.firstPage[elem1]" style="font-size: 1rem;">時間</span>
                    <q-popup-proxy @before-show="createDate" transition-show="scale" transition-hide="scale">
                      <div>
                        <q-date v-model="newDate">
                          <div class="row items-center justify-end q-gutter-sm">
                            <q-btn label="取消" color="primary" flat v-close-popup />
                            <q-btn label="確定" color="primary" flat @click="save" v-close-popup />
                          </div>
                        </q-date>
                      </div>
                    </q-popup-proxy>
                  </div>

                  <q-input
                    no-error-icon
                    :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                    :type="ternaryOperator('number', 'text', elem1, ['稅額', '期年'])"
                    :outlined="ternaryOperator(true, false, elem1, ['發票號', '稅額', '備註 (選填)', '期年'])"
                    :clearable="ternaryOperator(true, false, elem1, ['發票號', '稅額', '備註 (選填)', '期年'])"
                    :label="ternaryOperator(elem1, null, elem1, ['發票號', '稅額', '備註 (選填)', '期年'])"
                    v-bind:value="ternaryOperator(invoiceRecord.firstPage[elem1], null, elem1, ['發票號', '稅額', '備註 (選填)', '期年'])"
                    v-on:input="ternaryOperator(invoiceRecord.firstPage[elem1] = $event, null, elem1, ['發票號', '稅額', '備註 (選填)', '期年'])"
                    v-if="ternaryOperator(true, false, elem1, ['發票號', '稅額', '備註 (選填)', '期年'])"
                  />
                </template>

                <template v-slot:error>
                  <p v-if="elem1 !== '備註 (選填)'">{{errorMessage[elem1]}}</p>
                </template>
              </q-select>
            </div>
          </q-step>

          <q-step
            :name="2"
            title="發票細項"
            icon="assignment"
          >
            <div class="row justify-center q-gutter-lg">
              <q-select
                no-error-icon
                new-value-mode="add-unique"
                :use-input="ternaryOperator(true, false, elem1, ['產品種類', '產品名稱', '型號', '原價', '議價'])"
                :hide-dropdown-icon="ternaryOperator(false, true, elem1, ['產品種類', '產品名稱', '型號', '原價', '議價'])"
                :error="isError(elem1)"
                :readonly="ternaryOperator(false, true, elem1, ['產品種類', '產品名稱', '型號', '原價', '議價'])"
                :outlined="ternaryOperator(true, false, elem1, ['產品種類', '產品名稱', '型號', '原價', '議價'])"
                :borderless="ternaryOperator(false, true, elem1, ['產品種類', '產品名稱', '型號', '原價', '議價'])"
                :clearable="ternaryOperator(true, false, elem1, ['產品種類', '產品名稱', '型號', '原價', '議價'])"
                :label="ternaryOperator(elem1, null, elem1, ['產品種類', '產品名稱', '型號', '原價', '議價'])"
                :options="option"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                @focus="focusSelect = elem1"
                @filter="(value, update) => { distributeFilter(elem1, value, update) }"
                v-bind:value="ternaryOperator(invoiceRecord.secondPage[elem1], null, elem1, ['產品種類', '產品名稱', '型號', '原價', '議價'])"
                v-on:input="ternaryOperator(invoiceRecord.secondPage[elem1] = $event, null, elem1, ['產品種類', '產品名稱', '型號', '原價', '議價'])"
                v-for="(elem1, index1) in Object.keys(invoiceRecord.secondPage)"
                :key="index1"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" v-if="ternaryOperator(false, true, elem1, ['數量', 'Project code', 'blank'])">
                    <q-item-section>
                      <q-item-label>{{ scope.opt }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:append>
                  <q-icon name="input" v-if="ternaryOperator(false, true, elem1, ['數量', 'Project code', 'blank'])" />
                </template>

                <template v-slot:prepend>
                  <q-select
                    no-error-icon
                    :use-input="false"
                    :hide-dropdown-icon="false"
                    :readonly="false"
                    :outlined="true"
                    :borderless="false"
                    :clearable="true"
                    :label="elem1"
                    :options="option"
                    :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                    @focus="focusSelect = elem1"
                    @filter="(value, update) => { distributeFilter(elem1, value, update) }"
                    v-bind:value="invoiceRecord.secondPage[elem1]"
                    v-on:input="invoiceRecord.secondPage[elem1] = $event"
                    v-if="ternaryOperator(true, false, elem1, ['Project code'])"
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
                    no-error-icon
                    :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                    type="number"
                    :outlined="true"
                    :clearable="true"
                    :label="elem1"
                    v-bind:value="invoiceRecord.secondPage[elem1]"
                    v-on:input="invoiceRecord.secondPage[elem1] = $event"
                    v-if="ternaryOperator(true, false, elem1, ['數量'])"
                  />
                </template>

                <template v-slot:error>
                  <p>{{errorMessage[elem1]}}</p>
                </template>
              </q-select>
            </div>
          </q-step>

          <template v-slot:navigation>
            <q-stepper-navigation class="row justify-end q-gutter-lg text-grey-10 bottle-btn-position q-pb-lg">
              <q-btn
                type="reset"
                size="lg"
                color="white"
                text-color="grey-10"
                label="重設"
                class="border-radius-btn"
              />
              <q-btn
                type="submit"
                size="lg"
                color="btn-confirm-color"
                text-color="grey-10"
                :label="page < 2 ? '繼續' : '確定'"
                class="border-radius-btn"
              />
              <q-btn
                size="lg"
                flat
                text-color="grey-10"
                label="返回"
                class="q-ml-sm border-radius-btn"
                @click="onReset() || $refs.stepper.previous()"
                v-if="page > 1"
              />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-form>
    </section>

    <q-resize-observer @resize="onResize" />
  </div>
</template>

<script>
import { invoiceSheetAPI } from 'boot/axios'
import { date } from 'quasar'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3005',
  vuex: {}
}))
export default {
  data () {
    return {
      page: 1,
      backgroundWidth: null,
      booleanIsValid: undefined,
      newDate: null,
      errorMessage: null,
      focusSelect: '',
      submitOperation: 'create',
      invoiceRecord_id: null,
      invoiceNumUpdated: null,
      option: [],
      invoiceRecord: {
        firstPage: {
          進銷項: undefined,
          時間: undefined,
          發票種類: undefined,
          發票號: undefined,
          統編: undefined,
          公司名稱: undefined,
          期年: undefined,
          期數: undefined,
          稅額: undefined,
          稅別: undefined,
          '備註 (選填)': undefined,
          blank: undefined
        },
        secondPage: {
          產品種類: undefined,
          產品名稱: undefined,
          型號: undefined,
          數量: undefined,
          原價: undefined,
          議價: undefined,
          'Project code': undefined,
          blank: undefined
        }
      },
      rowData: {
        materialsInform_id: [],
        統編: [],
        公司名稱: [],
        產品種類: [],
        產品名稱: [],
        型號: [],
        原價: [],
        議價: []
      }
    }
  },
  mounted () {
    const { firstPage, secondPage } = this.invoiceRecord
    invoiceSheetAPI.post('/api/initializeForRecord').then((res) => {
      const { taxIdNums, firmName } = res.data
      this.rowData.統編 = taxIdNums
      this.rowData.公司名稱 = firmName
    })
    this.errorMessage = { ...firstPage, ...secondPage }
  },
  methods: {
    onResize (size) {
      this.backgroundWidth = size.width
    },
    createDate () {
      this.newDate = date.formatDate(Date.now(), 'YYYY/MM/DD')
    },
    save () {
      const newDateSplit = this.newDate.split('/')
      newDateSplit[0] = parseInt(newDateSplit[0], 10) - 1911
      this.invoiceRecord.firstPage.時間 = date.formatDate(Date.parse(newDateSplit.join('-')), 'YYYY/M/D')
    },
    ternaryOperator (correct, incorrect, key, arrValue) {
      return arrValue.includes(key) ? correct : incorrect
    },
    distributeFilter (elem, value, update) {
      if (elem === '期數') {
        filterOptionForSpecificElement(update, this.option, ['1-2月', '3-4月', '5-6月', '7-8月', '9-10月', '11-12月'])
      } else if (elem === '稅別') {
        filterOptionForSpecificElement(update, this.option, ['營所稅'])
      } else if (elem === 'Project code') {
        filterOptionForSpecificElement(update, this.option, ['00000'])
      } else if (elem === '進銷項') {
        filterOptionForSpecificElement(update, this.option, ['進項', '銷項'])
      } else if (elem === '發票種類') {
        filterOptionForSpecificElement(update, this.option, ['三聯式統一發票', '二聯式統一發票', '特種統一發票', '收銀機統一發票', '電子發票'])
      } else if (elem === '原價') {
        filterOptionForSpecificElement(update, this.option, this.rowData.原價)
      } else if (elem === '議價') {
        filterOptionForSpecificElement(update, this.option, this.rowData.議價)
      } else {
        this.filterOptionForOthers(value, update)
      }
    },
    filterOptionForOthers (value, update) {
      update(() => {
        if (!value) {
          this.option.splice(0, this.option.length)
        } else {
          var processedData = this.rowData[this.focusSelect].filter(
            elem => elem.toUpperCase().indexOf(value.toUpperCase()) > -1
          )
          if (processedData.length > 5) {
            processedData.splice(5, processedData.length - 5)
          }
          this.option.splice(0, this.option.length, ...processedData)
        }
      })
    },
    isError (elem1) { // 只要有設 'error' 參數，'error'會把所有 elem 代進來
      const { firstPage, secondPage } = this.invoiceRecord
      let Break = false
      if (this.page === 1) {
        Object.keys(firstPage).forEach(elem2 => { // 不能包成 function 因為 booleanIsValid 和 Break 代進去沒法變更value
          if (!Break && (elem1 !== '備註 (選填)' && elem1 !== 'blank') && (elem2 === elem1)) {
            this.booleanIsValid = Boolean(firstPage[elem2])
            if (firstPage[elem2] === '' || firstPage[elem2] === null) {
              this.errorMessage[elem2] = `'${elem2}' 為空值`
              Break = true
            }
          }
        })
      } else if (this.page === 2) {
        if (!Break && Boolean(secondPage.原價) && isNaN(secondPage.原價)) {
          this.booleanIsValid = false
          this.errorMessage.原價 = "'原價' 必須為數字"
          Break = true
        } else {
          this.errorMessage.原價 = undefined
        }
        if (!Break && Boolean(secondPage.議價) && isNaN(secondPage.議價)) {
          this.booleanIsValid = false
          this.errorMessage.議價 = "'議價' 必須為數字"
          Break = true
        } else {
          this.errorMessage.議價 = undefined
        }
        if (!Break) {
          Object.keys(secondPage).forEach(elem2 => {
            if (elem1 !== 'blank' && elem2 === elem1) {
              this.booleanIsValid = Boolean(secondPage[elem2])
              if (secondPage[elem2] === '' || secondPage[elem2] === null) {
                this.errorMessage[elem2] = `'${elem2}' 為空值`
                Break = true
              } else {
                this.errorMessage[elem2] = undefined
              }
            }
          })
        }
      }
      return Break
    },
    onReset () {
      const { firstPage, secondPage } = this.invoiceRecord
      if (this.page === 1) {
        reset(firstPage)
      } else if (this.page === 2) {
        reset(secondPage)
      }
    },
    checkForm () {
      const { firstPage, secondPage } = this.invoiceRecord
      if (this.page === 1 && this.booleanIsValid && isInputValid(firstPage)) {
        this.$refs.stepper.next()
      } else if (this.page === 2 && this.booleanIsValid && isInputValid(secondPage)) {
        this.onSubmit()
      } else {
        this.$q.notify({
          type: 'warning',
          message: '尚有欄位未填入資料'
        })
      }
    },
    onSubmit () {
      const { firstPage, secondPage } = this.invoiceRecord
      firstPage['備註 (選填)'] = firstPage['備註 (選填)'] ? firstPage['備註 (選填)'] : '' // 如 '備註 (選填)' 為 'undefined'，socket.io 不會回傳到後台
      this.$socket.emit('submit', {
        submitOperation: this.submitOperation,
        _id: this.invoiceRecord_id,
        invoiceNumUpdated: this.invoiceNumUpdated,
        invoiceRecord: {
          firstPage: firstPage,
          secondPage: secondPage
        }
      })
      this.onReset()
    }
  },
  sockets: {
    initializeForUpdated: function (backendData) {
      const { firstPage, secondPage } = this.invoiceRecord
      this.submitOperation = 'update'
      this.invoiceRecord_id = backendData.recordData._id
      this.invoiceNumUpdated = backendData.invoiceNum
      insertDataForinvoiceRecordUpdated(firstPage, backendData.recordData)
      insertDataForinvoiceRecordUpdated(secondPage, backendData.recordData)
    },
    getProductClassByTaxIdNum: function (backendData) {
      this.rowData.產品種類 = backendData.productClass
    },
    getFirmNameByProductClass: function (backendData) {
      this.rowData.產品名稱 = backendData.productName
    },
    getModelAnd_idByClass2: function (backendData) {
      this.rowData.型號 = backendData.model
      this.rowData.materialsInform_id = backendData.materialsInform_id
    },
    getPricesByMaterialsInform_id: function (backendData) {
      this.rowData.原價 = backendData.usualPrice
      this.rowData.議價 = backendData.negotiatedPrice
    },
    submitSucceed: function (backendData) {
      this.$q.notify({
        type: 'positive',
        message: backendData.message
      })
    }
  },
  watch: {
    'invoiceRecord.firstPage.統編': function (value) {
      if (value && !this.invoiceRecord.firstPage.公司名稱) {
        const { 統編, 公司名稱 } = this.rowData,
          taxIdNumsIndex = 統編.indexOf(value)
        this.invoiceRecord.firstPage.公司名稱 = 公司名稱[taxIdNumsIndex]
        this.$socket.emit('getProductClassByTaxIdNum', {
          taxIdNum: value
        })
      } else if (!value) {
        this.invoiceRecord.firstPage.公司名稱 = ''
      }
    },
    'invoiceRecord.firstPage.公司名稱': function (value) {
      if (value && !this.invoiceRecord.firstPage.統編) {
        const { 統編, 公司名稱 } = this.rowData,
          firmNameIndex = 公司名稱.indexOf(value)
        this.invoiceRecord.firstPage.統編 = 統編[firmNameIndex]
      } else if (!value) {
        this.invoiceRecord.firstPage.統編 = ''
      }
    },
    'invoiceRecord.secondPage.產品種類': function (value) {
      if (value) {
        this.$socket.emit('getFirmNameByProductClass', {
          productClass: value
        })
      } else if (!value) {
        this.invoiceRecord.firstPage.公司名稱 = ''
        this.rowData.公司名稱 = []
        this.invoiceRecord.secondPage.型號 = ''
        this.rowData.型號 = [] // 'invoiceRecord.firstPage.統編' 不用放，因為 "產品名稱" 在第二頁
      }
    },
    'invoiceRecord.secondPage.產品名稱': function (value) {
      if (value) {
        this.$socket.emit('getModelAnd_idByClass2', {
          class2: value
        })
      } else if (!value) {
        this.invoiceRecord.secondPage.型號 = ''
        this.rowData.型號 = [] // 'invoiceRecord.firstPage.統編' 不用放，因為 "產品名稱" 在第二頁
      }
    },
    'invoiceRecord.secondPage.型號': function (value) {
      if (value) {
        const modelIndexAtRowData = this.rowData.型號.indexOf(this.invoiceRecord.secondPage.型號)
        if (modelIndexAtRowData > -1) {
          this.$socket.emit('getPricesByMaterialsInform_id', {
            materialsInform_id: this.rowData.materialsInform_id[modelIndexAtRowData]
          })
        }
      } else if (!value) {
        this.invoiceRecord.secondPage.原價 = ''
        this.invoiceRecord.secondPage.議價 = ''
        this.rowData.原價 = []
        this.rowData.議價 = []
      }
    }
  }
}
function reset (invoiceRecordPage) {
  Object.keys(invoiceRecordPage).forEach(elem => {
    invoiceRecordPage[elem] = undefined
  })
}

function insertDataForinvoiceRecordUpdated (invoiceRecordPage, backendDataRecordData) {
  Object.keys(invoiceRecordPage).forEach(elem1 => {
    invoiceRecordPage[elem1] = backendDataRecordData[elem1]
  })
}

function filterOptionForSpecificElement (update, option, arrOptionElement) {
  update(() => {
    option.splice(0, option.length, ...arrOptionElement)
  })
}

function isInputValid (invoiceRecordPage) {
  const invoiceRecordPageValue = []
  Object.keys(invoiceRecordPage).forEach(elem1 => {
    if (elem1 !== '備註 (選填)' && elem1 !== 'blank') {
      invoiceRecordPageValue.splice(invoiceRecordPageValue.length, 0, invoiceRecordPage[elem1])
    }
  })
  return invoiceRecordPageValue.findIndex(elem2 => !elem2) === -1 // 確保每個輸入都是有效
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';
</style>
