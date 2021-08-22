<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <section>
      <q-form @submit="onSubmit" @reset="onReset" class="row justify-center q-gutter-lg">
        <div class="row justify-center q-gutter-lg">
          <q-input
            no-error-icon
            :style="`width: ${(backgroundWidth - 250) / 2}px;`"
            :error="isValid(elem1)"
            :rules="ternaryOperator([''], [ val => val !== null && val.length > 0 || `'${elem1}' 為空值`], elem1, '統編', '公司名稱', '產品名稱', '電壓', '電流', '頻率', '輸出功率')"
            :readonly="ternaryOperator(true, false, elem1, '統編', '公司名稱', '產品名稱')"
            :outlined="ternaryOperator(false, true, elem1, '統編', '公司名稱', '產品名稱')"
            :borderless="ternaryOperator(true, false, elem1, '統編', '公司名稱', '產品名稱')"
            :clearable="ternaryOperator(false, true, elem1, '統編', '公司名稱', '產品名稱')"
            :label="ternaryOperator(null, elem1, elem1, '統編', '公司名稱', '產品名稱')"
            v-bind:value="ternaryOperator(null, materialsInform[elem1], elem1, '統編', '公司名稱', '產品名稱')"
            v-on:input="ternaryOperator(null, materialsInform[elem1] = $event, elem1, '統編', '公司名稱', '產品名稱')"
            v-for="(elem1, index1) in Object.keys(materialsInform)"
            :key="index1"
          >
            <template v-slot:prepend>
              <q-select
                outlined
                v-model="materialsInform.統編"
                use-input
                :label="elem1"
                :options="taxIDnumsOptions"
                clearable
                @filter="taxIDnumsFilterFn"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                v-if="elem1 === '統編'"
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
                outlined
                v-model="materialsInform.公司名稱"
                use-input
                :label="elem1"
                :options="firmNameOptions"
                clearable
                @filter="firmNameFilterFn"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                v-if="elem1 === '公司名稱'"
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
                outlined
                v-model="materialsInform.產品名稱"
                use-input
                :label="elem1"
                :options="class2Options"
                clearable
                @filter="class2FilterFn"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                v-if="elem1 === '產品名稱'"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section>
                      <q-item-label>{{ scope.opt }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </template>

            <template v-slot:error>
              {{errorMessage}}
            </template>
          </q-input>

          <div class="row justify-end q-gutter-lg text-grey-10 bottle-btn-position q-pb-lg" style="width: 100%;">
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
              label="確定"
              class="border-radius-btn"
            />
            <!-- <q-btn
              size="lg"
              flat
              text-color="grey-10"
              label="返回"
              class="q-ml-sm border-radius-btn"
            /> -->
          </div>
        </div>
      </q-form>
    </section>

    <q-resize-observer @resize="onResize" />
  </div>
</template>

<script>
import { materialsInformtAPI } from 'boot/axios'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3003',
  vuex: {}
}))
export default {
  data () {
    return {
      backgroundWidth: null,
      errorMessage: null,
      isValidBoolean: null,
      materialsInform: {
        統編: '',
        公司名稱: '',
        產品名稱: '',
        型號: '',
        描述: '',
        電壓: '',
        電流: '',
        頻率: '',
        輸出功率: '',
        規格: '',
        特性: '',
        料號: ''
      },
      taxIDnumsOptions: [],
      firmNameOptions: [],
      class2Options: [],
      initializedData: {
        _idMaterialsInform: null,
        taxIdNums: null,
        firmName: null,
        class2: null
      },
      submitOperation: 'create',
      materialsInformID: null
    }
  },
  mounted () {
    // this.$socket.emit('initializeForRecord', {
    //   taxIdNum: null
    // })
    materialsInformtAPI.post('/api/initializeForRecord', { taxIdNum: null }).then((res) => {
      const { _idMaterialsInform, taxIdNums, firmName } = res.data
      this.initializedData._idMaterialsInform = _idMaterialsInform
      this.initializedData.taxIdNums = taxIdNums
      this.initializedData.firmName = firmName
    })
  },
  methods: {
    // onItemClick (value) {
    //   this.menuValue = value
    // },
    onResize (size) {
      this.backgroundWidth = size.width
    },
    onReset () {
      Object.keys(this.materialsInform).forEach(elem => {
        this.materialsInform[elem] = ''
      })
    },
    onSubmit () {
      var loopBreak = false
      Object.keys(this.materialsInform).forEach(elem => {
        // const includeOptionalInput = elem !== '電壓' && elem !== '電流' && elem !== '頻率' && elem !== '輸出功率'
        if (loopBreak === false && this.materialsInform[elem] === '') {
          this.materialsInform[elem] = null
          if (elem === '電壓' || elem === '電流' || elem === '頻率' || elem === '輸出功率') {
            this.materialsInform[elem] = ''
          }
          loopBreak = true
        }
      })
      if (this.isValidBoolean) {
        // const { _idFirmInform, taxIdNums } = this.initializedData
        this.$socket.emit('submit', {
          // _idFirmInform: _idFirmInform[taxIdNums.findIndex(elem => elem === this.materialsInform.統編)],
          submitOperation: this.submitOperation,
          _id: this.materialsInformID,
          materialsInform: this.materialsInform
        })
        // this.onReset()
        Object.keys(this.materialsInform).forEach(elem => {
          this.materialsInform[elem] = this.ternaryOperator('', null, elem, '統編', '公司名稱', '產品名稱', '電壓', '電流', '頻率', '輸出功率')
        })
      }
    },
    taxIDnumsFilterFn (value, update) {
      update(() => {
        const taxIDnumsOptions = this.taxIDnumsOptions
        if (value === '' || value === null) {
          taxIDnumsOptions.splice(0, taxIDnumsOptions.length)
        } else {
          var filteredData = this.initializedData.taxIdNums.filter(
            v => v.indexOf(value.toUpperCase()) > -1
          )
          if (filteredData.length > 5) {
            filteredData.splice(5, filteredData.length - 5)
          }
          taxIDnumsOptions.splice(0, taxIDnumsOptions.length, ...filteredData)
        }
      })
    },
    firmNameFilterFn (value, update) {
      update(() => {
        const firmNameOptions = this.firmNameOptions
        if (value === '' || value === null) {
          firmNameOptions.splice(0, firmNameOptions.length)
        } else {
          var filteredData = this.initializedData.firmName.filter(
            v => v.indexOf(value.toUpperCase()) > -1
          )
          if (filteredData.length > 5) {
            filteredData.splice(5, filteredData.length - 5)
          }
          firmNameOptions.splice(0, firmNameOptions.length, ...filteredData)
        }
      })
    },
    class2FilterFn (value, update) {
      update(() => {
        const class2Options = this.class2Options
        if (value === '' || value === null) {
          class2Options.splice(0, class2Options.length, ...this.initializedData.class2)
          if (class2Options.length > 5) {
            class2Options.splice(5, class2Options.length - 5)
          }
        } else {
          var filteredData = this.initializedData.class2.filter(
            v => v.indexOf(value.toUpperCase()) > -1
          )
          if (filteredData.length > 5) {
            filteredData.splice(5, filteredData.length - 5)
          }
          class2Options.splice(0, class2Options.length, ...filteredData)
        }
      })
    },
    isValid (elem) {
      if (elem === '統編') {
        this.isValidBoolean = Boolean(this.materialsInform.統編)
        if (this.materialsInform.統編 === null) {
          this.errorMessage = `'${elem}' 為空值`
          return true
        }
      } else if (elem === '公司名稱') {
        this.isValidBoolean = Boolean(this.materialsInform.公司名稱)
        if (this.materialsInform.公司名稱 === null) {
          this.errorMessage = `'${elem}' 為空值`
          return true
        }
      } else if (elem === '產品名稱') {
        this.isValidBoolean = Boolean(this.materialsInform.產品名稱)
        if (this.materialsInform.產品名稱 === null) {
          this.errorMessage = `'${elem}' 為空值`
          return true
        }
      }
    },
    ternaryOperator (truth, untruth, key, value1, value2, value3, value4, value5, value6, value7) {
      return key === value1 || key === value2 || key === value3 || key === value4 || key === value5 || key === value6 || key === value7
        ? truth
        : untruth
    }
  },
  sockets: {
    // initializeForRecord: function (backendData) {
    //   this.initializedData._idMaterialsInform = backendData._idMaterialsInform
    //   this.initializedData.taxIdNums = backendData.taxIdNums
    //   this.initializedData.firmName = backendData.firmName
    // },
    initializeForUpdated: function (backendData) {
      this.submitOperation = 'update'
      Object.keys(backendData.recordData).forEach(elem => {
        if (elem === '_id') {
          this.materialsInformID = backendData.recordData[elem]
        } else {
          this.materialsInform[elem] = backendData.recordData[elem]
        }
      })
    },
    submitSucceed: function (backendData) {
      this.$q.notify({
        type: 'positive',
        message: backendData.message
      })
    }
    // taxIdNumExist: function (backendData) {
    //   this.initializedData.class2 = backendData.class2
    //   this.class2Options.splice(this.class2Options.length, 0, ...backendData.class2)
    //   if (this.class2Options.length > 5) {
    //     this.class2Options.splice(5, this.class2Options.length - 5)
    //   }
    // }
  },
  watch: {
    'materialsInform.統編': function (value) {
      // const firmName = this.materialsInform.公司名稱
      // if ((value !== '' && value !== null) && (firmName === '' || firmName === null)) {
      // if (value !== '' && value !== null) {
      if (value && !this.materialsInform.公司名稱) {
        const { taxIdNums, firmName } = this.initializedData
        // this.isValidBoolean = this.isValid('統編')
        // if (this.isValidBoolean === true) {
        const taxIdNumsIndex = taxIdNums.findIndex(elem => elem === value)
        this.materialsInform.公司名稱 = firmName[taxIdNumsIndex]
        // this.$socket.emit('initializeForRecord', {
        //   taxIdNum: value
        // })
        materialsInformtAPI.post('/api/initializeForRecord', { taxIdNum: value }).then((res) => {
          const { class2 } = res.data
          this.initializedData.class2 = class2
          this.class2Options.splice(this.class2Options.length, 0, ...class2)
          if (this.class2Options.length > 5) {
            this.class2Options.splice(5, this.class2Options.length - 5)
          }
        })
      } else if (!value) {
        this.materialsInform.公司名稱 = ''
      }
      // }
    },
    'materialsInform.公司名稱': function (value) {
      // if (value !== '' && value !== null) {
      if (value && !this.materialsInform.統編) {
        const { taxIdNums, firmName } = this.initializedData
        // this.isValidBoolean = this.isValid('公司名稱')
        // if (this.isValidBoolean === true) {
        // const taxIdNumsIndex = taxIdNums.findIndex(elem => elem === value)
        const firmNameIndex = firmName.findIndex(elem => elem === value)
        this.materialsInform.統編 = taxIdNums[firmNameIndex]
        // this.$socket.emit('initializeForRecord', {
        //   taxIdNum: value
        // })
        materialsInformtAPI.post('/api/initializeForRecord', { taxIdNum: value }).then((res) => {
          const { class2 } = res.data
          this.initializedData.class2 = class2
          this.class2Options.splice(this.class2Options.length, 0, ...class2)
          if (this.class2Options.length > 5) {
            this.class2Options.splice(5, this.class2Options.length - 5)
          }
        })
        // }
      } else if (!value) {
        this.materialsInform.統編 = ''
      }
    }
    // 'materialsInform.產品名稱': function (value) {
    //   this.isValidBoolean = this.isValid('產品名稱')
    // }
  }
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';
</style>
