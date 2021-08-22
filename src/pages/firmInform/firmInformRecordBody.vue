<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <section>
      <q-form @submit="onSubmit" @reset="onReset" class="row justify-center q-gutter-lg">
        <q-stepper
          v-model="step"
          ref="stepper"
          alternative-labels
          color="primary"
          flat
          animated
          class="bg-grey-1"
        >
          <q-step
            :name="1"
            title="廠商資料"
            icon="assignment"
            :done="step > 1"
          >
            <div class="row justify-center q-gutter-lg">
              <q-input
                no-error-icon
                :type="inputType(elem1)"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                :error="isValid(elem1)"
                :rules="ternaryOperator([''], [ val => val !== null && val.length > 0 || `'${elem1}' 為空值`], elem1, '統編', '公司名稱', '公司電話', '公司所在地', '傳真', '網址', '備註 (選填)')"
                :readonly="ternaryOperator(true, false, elem1, '統編', '公司名稱', '公司電話', '公司所在地', '傳真')"
                :outlined="ternaryOperator(false, true, elem1, '統編', '公司名稱', '公司電話', '公司所在地', '傳真')"
                :borderless="ternaryOperator(true, false, elem1, '統編', '公司名稱', '公司電話', '公司所在地', '傳真')"
                :clearable="ternaryOperator(false, true, elem1, '統編', '公司名稱', '公司電話', '公司所在地', '傳真')"
                :label="ternaryOperator(null, elem1, elem1, '統編', '公司名稱', '公司電話', '公司所在地', '傳真')"
                v-bind:value="ternaryOperator(null, selectItems.firmInform[elem1], elem1, '統編', '公司名稱', '公司電話', '公司所在地', '傳真')"
                v-on:input="ternaryOperator(null, selectItems.firmInform[elem1] = $event, elem1, '統編', '公司名稱', '公司電話', '公司所在地', '傳真')"
                v-for="(elem1, index1) in Object.keys(selectItems.firmInform)"
                :key="index1"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_money" v-if="elem1 === '資本額'" />

                  <q-select
                    outlined
                    use-input
                    clearable
                    v-model="selectItems.firmInform.公司所在地"
                    input-debounce='0'
                    new-value-mode='add-unique'
                    :label="elem1"
                    :options="regions"
                    @filter="regionsFilterFn"
                    :hide-dropdown-icon="selectItems.hideDropdownIcon"
                    :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                    v-if="elem1 === '公司所在地'"
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

                  <q-select
                    outlined
                    v-model="selectItems.firmInform.統編"
                    input-debounce="0"
                    new-value-mode="add-unique"
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
                    <template v-slot:append>
                      <q-icon name="input" />
                    </template>
                  </q-select>

                  <q-select
                    outlined
                    v-model="selectItems.firmInform.公司名稱"
                    input-debounce="0"
                    new-value-mode="add-unique"
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
                    <template v-slot:append>
                      <q-icon name="input" />
                    </template>
                  </q-select>

                  <q-input
                    outlined
                    type="tel"
                    :label="elem2"
                    :name="elem2"
                    :disable="inputDisable(index2, selectItems.firmInform.公司所在地)"
                    v-bind:value="selectItems.firmInform[elem1][elem2]"
                    v-on:input="selectItems.firmInform[elem1][elem2] = $event"
                    :style="`min-width: ${inputBoxWidth / 3}px`"
                    v-if="elem1 === '傳真' && index2 < 2"
                    v-for="(elem2, index2) in Object.keys(selectItems.firmInform.傳真)"
                    :key="index2"
                  />

                  <q-input
                    outlined
                    type="tel"
                    :label="elem3"
                    :name="elem3"
                    :disable="inputDisable(index3, selectItems.firmInform.公司所在地)"
                    v-bind:value="selectItems.firmInform[elem1][elem3]"
                    v-on:input="selectItems.firmInform[elem1][elem3] = $event"
                    :style="`min-width: ${inputBoxWidth / 3}px`"
                    v-if="elem1 === '公司電話' && index3 < 2"
                    v-for="(elem3, index3) in Object.keys(selectItems.firmInform.公司電話)"
                    :key="index3"
                  />
                </template>

                <template v-slot:append>
                  <q-input
                    outlined
                    type="tel"
                    label="傳真號碼"
                    name="傳真號碼"
                    v-model="selectItems.firmInform.傳真.傳真號碼"
                    :style="`min-width: ${inputBoxWidth / 3}px`"
                    v-if="elem1 === '傳真'"
                  />

                  <q-input
                    outlined
                    type="tel"
                    label="電話號碼"
                    name="電話號碼"
                    v-model="selectItems.firmInform.公司電話.電話號碼"
                    :style="`min-width: ${inputBoxWidth / 3}px`"
                    v-if="elem1 === '公司電話'"
                  />
                </template>

                <template v-slot:error>
                  {{errorMessage}}
                </template>

                <q-resize-observer @resize="inputBoxsWidth" />
              </q-input>
            </div>
          </q-step>

          <!-- ----------------------------------------------------------------- -->

          <q-step
            :name="2"
            title="聯絡人資料"
            icon="assignment"
          >
            <div class="row justify-center q-gutter-lg">
              <q-input
                no-error-icon
                :type="inputType(elem1)"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                :error="isValid(elem1)"
                :rules="ternaryOperator([''], [ val => val !== null && val.length > 0 || `'${elem1}' 為空值`], elem1, '聯絡人所在地', '聯絡人電話', '聯絡人手機', '備註 (選填)', 'blank')"
                :readonly="ternaryOperator(true, false, elem1, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                :outlined="ternaryOperator(false, true, elem1, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                :borderless="ternaryOperator(true, false, elem1, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                :clearable="ternaryOperator(false, true, elem1, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                :label="ternaryOperator(null, elem1, elem1, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                v-bind:value="ternaryOperator(null, selectItems.contactPersonInform[elem1], elem1, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                v-on:input="ternaryOperator(null, selectItems.contactPersonInform[elem1] = $event, elem1, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                v-for="(elem1, index1) in Object.keys(selectItems.contactPersonInform)"
                :key="index1"
              >

                <template v-slot:prepend>
                  <q-select
                    outlined
                    use-input
                    clearable
                    v-model="selectItems.contactPersonInform.聯絡人所在地"
                    input-debounce='0'
                    new-value-mode='add-unique'
                    :label="elem1"
                    :options="regions"
                    @filter="regionsFilterFn"
                    :hide-dropdown-icon="selectItems.hideDropdownIcon"
                    :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                    v-if="elem1 === '聯絡人所在地'"
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

                  <q-input
                    outlined
                    type="tel"
                    :label="elem2"
                    :name="elem2"
                    :disable="inputDisable(index2, selectItems.contactPersonInform.聯絡人所在地)"
                    v-bind:value="selectItems.contactPersonInform[elem1][elem2]"
                    v-on:input="selectItems.contactPersonInform[elem1][elem2] = $event"
                    :style="`min-width: ${inputBoxWidth / 4}px`"
                    v-if="elem1 === '聯絡人電話'"
                    v-for="(elem2, index2) in Object.keys(selectItems.contactPersonInform.聯絡人電話)"
                    :key="index2"
                  />

                  <q-input
                    outlined
                    type="tel"
                    :label="elem3"
                    :name="elem3"
                    :disable="inputDisable(index3, selectItems.contactPersonInform.聯絡人所在地)"
                    v-bind:value="selectItems.contactPersonInform[elem1][elem3]"
                    v-on:input="selectItems.contactPersonInform[elem1][elem3] = $event"
                    :style="`min-width: ${inputBoxWidth / 2}px`"
                    v-if="elem1 === '聯絡人手機' && index3 === 0"
                    v-for="(elem3, index3) in Object.keys(selectItems.contactPersonInform.聯絡人手機)"
                    :key="index3"
                  />
                </template>

                <template v-slot:append>
                  <q-input
                    outlined
                    type="tel"
                    label="手機號碼"
                    name="手機號碼"
                    v-model="selectItems.contactPersonInform.聯絡人手機.手機號碼"
                    :style="`min-width: ${inputBoxWidth / 2}px`"
                    v-if="elem1 === '聯絡人手機'"
                  />
                </template>

                <template v-slot:error>
                  {{errorMessage}}
                </template>

                <q-resize-observer @resize="inputBoxsWidth" />
              </q-input>
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
                @click="nextStep()"
                color="btn-confirm-color"
                text-color="grey-10"
                :label="step === 1 ? '繼續' : '確定'"
                class="border-radius-btn"
              />
              <q-btn
                size="lg"
                v-if="step > 1"
                flat
                text-color="grey-10"
                @click="previousStep"
                label="返回"
                class="q-ml-sm border-radius-btn"
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
import { firmInformAPI } from 'boot/axios'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import { Notify } from 'quasar'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3001',
  vuex: {}
}))
const productSort = []
const regions = {
  基隆市: '02',
  台北市: '02',
  新北市: '02',
  桃園縣: '03',
  新竹市: '03',
  新竹縣: '03',
  苗栗縣: '037',
  台中市: '04',
  彰化縣: '04',
  南投縣: '049',
  雲林縣: '05',
  嘉義市: '05',
  嘉義縣: '05',
  台南市: '06',
  高雄市: '07',
  屏東縣: '08',
  台東縣: '089',
  花蓮縣: '03',
  宜蘭縣: '03',
  澎湖縣: '06',
  金門縣: '082',
  連江縣: '0836'
}
export default {
  data () {
    return {
      backgroundWidth: null,
      errorMessage: null,
      inputBoxWidth: null,
      isValidBoolean: null,
      productSort: productSort,
      regions: Object.keys(regions),
      selectItems: {
        contactPersonInform: {
          聯絡人名稱: '',
          聯絡人所在地: '',
          聯絡人電話: {
            電話國際區號: null,
            電話區碼: null,
            電話號碼: null,
            電話分機: null
          },
          聯絡人手機: {
            手機國際區號: null,
            手機號碼: null
          },
          '備註 (選填)': '',
          blank: null
        },
        firmInform: {
          統編: '',
          公司所在地: '',
          公司名稱: '',
          Email: '',
          傳真: {
            傳真國際區號: null,
            傳真區碼: null,
            傳真號碼: null
          },
          地址: '',
          負責人: '',
          公司電話: {
            電話國際區號: null,
            電話區碼: null,
            電話號碼: null
          },
          公司類型: '',
          產品: '',
          主要產品: '',
          資本額: '',
          網址: '',
          '備註 (選填)': ''
        },
        hideDropdownIcon: true
      },
      step: 1,
      taxIDnumsOptions: ['無'],
      firmNameOptions: [],
      initializedData: {
        _id: null,
        taxIdNums: null,
        firmName: null
      }
    }
  },
  mounted () {
    firmInformAPI.post('/api/initializeForRecord', { taxIdNumExist: false, _id: null }).then((res) => {
      const { _id, taxIdNums, firmName } = res.data
      this.initializedData._id = _id
      this.initializedData.taxIdNums = taxIdNums
      this.initializedData.firmName = firmName
    })
  },
  methods: {
    regionsFilterFn (value, update) {
      update(() => {
        if (this.step === 1 && this.selectItems.firmInform.統編 === '無') {
          this.regions = []
        } else if (value === '' || value === null) {
          this.regions = []
        } else {
          var filteredData = Object.keys(regions).filter(
            v => v.indexOf(value.toUpperCase()) > -1
          )
          this.regions = filteredData
        }
      })
    },
    taxIDnumsFilterFn (value, update) {
      update(() => {
        const taxIDnumsOptions = this.taxIDnumsOptions
        if (value === '' || value === null) {
          taxIDnumsOptions.splice(0, taxIDnumsOptions.length, '無')
        } else {
          var filteredData = this.initializedData.taxIdNums.filter(
            v => v.indexOf(value.toUpperCase()) > -1
          )
          if (filteredData.length > 5) {
            filteredData.splice(5, filteredData.length - 5)
          }
          taxIDnumsOptions.splice(0, taxIDnumsOptions.length, ...['無', ...filteredData])
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
    inputDisable (index, location) {
      if (Object.keys(regions).includes(location) === false) {
        if (index === 0) {
          return false
        } else if (index === 1) {
          return true
        } else if (index === 2) {
          return false
        }
      } else if (Object.keys(regions).includes(location) === true) {
        if (index === 0) {
          return true
        } else if (index === 1) {
          return false
        } else if (index === 2) {
          return false
        }
      }
    },
    inputType (elem) {
      if (elem === 'Email') {
        return 'email'
      } else if (elem === '資本額') {
        return 'number'
      } else {
        return 'text'
      }
    },
    isValid (elem) {
      if (elem === '統編') {
        if (this.selectItems.firmInform.統編 === '無') {
          return false
        } else if (this.selectItems.firmInform.統編 === null) {
          this.errorMessage = `'${elem}' 為空值`
          return true
        } else if ((this.selectItems.firmInform.統編 !== '' && this.selectItems.firmInform.統編.length !== 8) || isNaN(this.selectItems.firmInform.統編)) {
          this.errorMessage = `請輸入正確 '${elem}'`
          return true
        }
      } else if (elem === '公司名稱') {
        if (this.selectItems.firmInform.公司名稱 === null) {
          this.errorMessage = `'${elem}' 為空值`
          return true
        }
      } else if (elem === '公司電話') {
        if (this.selectItems.firmInform.公司電話.電話國際區號 === '') {
          this.errorMessage = "'電話國際區號' 為空值"
          return true
        } else if (isNaN(this.selectItems.firmInform.公司電話.電話國際區號)) {
          this.errorMessage = "請輸入正確 '電話國際區號'"
          return true
        } else if (this.regions.includes(this.selectItems.firmInform.公司所在地) && this.selectItems.firmInform.公司電話.電話區碼 === '') {
          this.errorMessage = "'電話區碼' 為空值"
          return true
        } else if (isNaN(this.selectItems.firmInform.公司電話.電話區碼)) {
          this.errorMessage = "請輸入正確 '電話區碼'"
          return true
        } else if (this.selectItems.firmInform.公司電話.電話號碼 === '') {
          this.errorMessage = "'電話號碼' 為空值"
          return true
        } else if (isNaN(this.selectItems.firmInform.公司電話.電話號碼)) {
          this.errorMessage = "請輸入正確 '電話號碼'"
          return true
        } else if (this.selectItems.firmInform.公司電話.電話號碼 !== null && this.regions.includes(this.selectItems.firmInform.公司所在地)) {
          if (this.selectItems.firmInform.公司電話.電話號碼.length < 7 || this.selectItems.firmInform.公司電話.電話號碼.length > 8) {
            this.errorMessage = "請輸入正確 '電話號碼'"
            return true
          }
        }
      } else if (elem === '公司所在地') {
        if (this.selectItems.firmInform.公司所在地 === null) {
          this.errorMessage = `'${elem}' 為空值`
          return true
        } else if (this.selectItems.firmInform.公司所在地 !== '' && this.selectItems.firmInform.統編 !== '無' && Object.keys(regions).includes(this.selectItems.firmInform.公司所在地) === false) {
          this.errorMessage = `請輸入正確 '${elem}'`
          return true
        }
      } else if (elem === '傳真') {
        if (this.selectItems.firmInform.統編 === '無' && this.selectItems.firmInform.傳真.傳真國際區號 === '') {
          this.errorMessage = "'傳真國際區號' 為空值"
          return true
        } else if (isNaN(this.selectItems.firmInform.傳真.傳真國際區號)) {
          this.errorMessage = "請輸入正確 '傳真國際區號'"
          return true
        } else if (this.regions.includes(this.selectItems.firmInform.公司所在地) && this.selectItems.firmInform.傳真.傳真區碼 === '') {
          this.errorMessage = "'傳真區碼' 為空值"
          return true
        } else if (isNaN(this.selectItems.firmInform.傳真.傳真區碼)) {
          this.errorMessage = "請輸入正確 '傳真區碼'"
          return true
        } else if (this.selectItems.firmInform.傳真.傳真號碼 === '') {
          this.errorMessage = "'傳真號碼' 為空值"
          return true
        } else if (isNaN(this.selectItems.firmInform.傳真.傳真號碼)) {
          this.errorMessage = "請輸入正確 '傳真號碼'"
          return true
        } else if (this.selectItems.firmInform.傳真.傳真號碼 !== null && this.regions.includes(this.selectItems.firmInform.公司所在地)) {
          if (this.selectItems.firmInform.傳真.傳真號碼.length < 7 || this.selectItems.firmInform.傳真.傳真號碼.length > 8) {
            this.errorMessage = "請輸入正確 '傳真號碼'"
            return true
          }
        }
      } else if (elem === 'Email') {
        if (this.selectItems.firmInform.Email === null) {
          this.errorMessage = `'${elem}' 為空值`
          return true
        } else if (this.selectItems.firmInform.Email !== '' && this.selectItems.firmInform.Email.includes('@') === false) {
          this.errorMessage = `請輸入正確 '${elem}'`
          return true
        }
      } else if (elem === '聯絡人所在地') {
        if (this.selectItems.firmInform.Email === null) {
          this.errorMessage = `'${elem}' 為空值`
          return true
        }
      } else if (elem === '聯絡人電話') {
        if (this.selectItems.contactPersonInform.聯絡人電話.電話國際區號 === '') {
          this.errorMessage = "'電話國際區號' 為空值"
          return true
        } else if (isNaN(this.selectItems.contactPersonInform.聯絡人電話.電話國際區號)) {
          this.errorMessage = "請輸入正確 '電話國際區號'"
          return true
        } else if (this.regions.includes(this.selectItems.contactPersonInform.聯絡人所在地) && this.selectItems.contactPersonInform.聯絡人電話.電話區碼 === '') {
          this.errorMessage = "'電話區碼' 為空值"
          return true
        } else if (isNaN(this.selectItems.contactPersonInform.聯絡人電話.電話區碼)) {
          this.errorMessage = "請輸入正確 '電話區碼'"
          return true
        } else if (this.selectItems.contactPersonInform.聯絡人電話.電話號碼 === '') {
          this.errorMessage = "'電話號碼' 為空值"
          return true
        } else if (isNaN(this.selectItems.contactPersonInform.聯絡人電話.電話號碼)) {
          this.errorMessage = "請輸入正確 '電話號碼'"
          return true
        } else if ((this.selectItems.contactPersonInform.聯絡人電話.電話號碼 !== null && this.regions.includes(this.selectItems.contactPersonInform.聯絡人所在地)) && (this.selectItems.contactPersonInform.聯絡人電話.電話號碼.length < 7 || this.selectItems.contactPersonInform.聯絡人電話.電話號碼.length > 8)) {
          this.errorMessage = "請輸入正確 '電話號碼'"
          return true
        }
      } else if (elem === '聯絡人手機') {
        if (this.selectItems.contactPersonInform.聯絡人手機.手機國際區號 === '') {
          this.errorMessage = "'手機國際區號' 為空值"
          return true
        } else if (this.selectItems.contactPersonInform.聯絡人手機.手機國際區號 !== null && isNaN(this.selectItems.contactPersonInform.聯絡人手機.手機國際區號)) {
          this.errorMessage = "請輸入正確 '手機國際區號'"
          return true
        } else if (this.selectItems.contactPersonInform.聯絡人手機.手機號碼 === '') {
          this.errorMessage = "'手機號碼' 為空值"
          return true
        } else if ((this.selectItems.contactPersonInform.聯絡人手機.手機號碼 !== null && isNaN(this.selectItems.contactPersonInform.聯絡人手機.手機號碼)) || (this.selectItems.contactPersonInform.聯絡人手機.手機號碼 !== null && this.regions.includes(this.selectItems.contactPersonInform.聯絡人所在地) && this.selectItems.contactPersonInform.聯絡人手機.手機號碼.length !== 9)) {
          this.errorMessage = "請輸入正確 '手機號碼'"
          return true
        }
      }
    },
    onResize (size) {
      this.backgroundWidth = size.width
    },
    onReset () {
      if (this.step === 1) {
        resetFunc(this.selectItems.firmInform, '傳真', '公司電話')
      } else if (this.step === 2) {
        resetFunc(this.selectItems.contactPersonInform, undefined, '聯絡人電話', '聯絡人手機')
      }
    },
    inputBoxsWidth (size) {
      this.inputBoxWidth = size.width
    },
    ternaryOperator (truth, untruth, key, value1, value2, value3, value4, value5, value6, value7) {
      return key === value1 || key === value2 || key === value3 || key === value4 || key === value5 || key === value6 || key === value7
        ? truth
        : untruth
    },
    nextStep () {
      if (this.step === 1) {
        setTimeout(() => {
          var loopBreak = false;
          (async () => {
            if (this.selectItems.firmInform.統編 === '') {
              this.selectItems.firmInform.統編 = null
              return
            } else if (this.selectItems.firmInform.公司名稱 === '') {
              this.selectItems.firmInform.公司名稱 = null
              return
            } else if (this.selectItems.firmInform.公司所在地 === '') {
              this.selectItems.firmInform.公司所在地 = null
              return
            } else if (this.selectItems.firmInform.Email === '') {
              this.selectItems.firmInform.Email = null
              return
            }
            await [this.selectItems.firmInform.傳真, this.selectItems.firmInform.公司電話].forEach((elem1, index1, arr1) => {
              Object.keys(elem1).forEach((elem2, index2, arr2) => {
                if (elem1[elem2] === null && loopBreak === false) {
                  arr1[index1][arr2[index2]] = ''
                  loopBreak = true
                }
              })
            })
            if (inputValidChecking(this.isValidBoolean, 10, this.selectItems.firmInform, '統編', '公司名稱', '公司所在地', 'Email', '傳真', '公司電話', '備註 (選填)') > 15) {
              return this.$refs.stepper.next()
            }
          })()
        }, 500)
      }
    },
    previousStep () {
      if (this.isValidBoolean === undefined || this.isValidBoolean === false) {
        return this.$refs.stepper.previous()
      }
    },
    onSubmit () {
      if (this.step === 2) {
        var loopBreak = false;
        (async () => {
          if (this.selectItems.contactPersonInform.聯絡人名稱 === '') {
            this.selectItems.contactPersonInform.聯絡人名稱 = null
            return
          } else if (this.selectItems.contactPersonInform.聯絡人所在地 === '') {
            this.selectItems.contactPersonInform.聯絡人所在地 = null
            return
          }
          await [this.selectItems.contactPersonInform.聯絡人電話, this.selectItems.contactPersonInform.聯絡人手機].forEach((elem1, index1, arr1) => {
            Object.keys(elem1).forEach((elem2, index2, arr2) => {
              if (elem1[elem2] === null && loopBreak === false && elem2 !== '電話分機') {
                if (this.regions.includes(this.selectItems.contactPersonInform.聯絡人所在地)) {
                  arr1[index1][arr2[index2]] = ''
                  loopBreak = true
                } else if (elem2 !== '電話區碼') {
                  arr1[index1][arr2[index2]] = ''
                  loopBreak = true
                }
              }
            })
          })
          if (this.isValidBoolean === undefined || this.isValidBoolean === false) {
            const { 統編, 公司名稱 } = this.selectItems.firmInform
            const { _id, taxIdNums, firmName } = this.initializedData
            const taxIdNumExist = taxIdNums.includes(統編) || firmName.includes(公司名稱)
            const id = taxIdNums.includes(統編)
              ? _id[taxIdNums.findIndex(elem => elem === 統編)]
              : firmName.includes(公司名稱)
                ? _id[firmName.findIndex(elem => elem === 公司名稱)]
                : null
            this.$socket.emit('submit', {
              taxIdNumExist: taxIdNumExist,
              _id: id,
              firmInformData: this.selectItems
            })
            taxIdNumExist ? submit('更新') : submit('新增')
            this.step = 1
            resetFunc(this.selectItems.firmInform, '傳真', '公司電話')
            resetFunc(this.selectItems.contactPersonInform, undefined, '聯絡人電話', '聯絡人手機')
          }
        })()
      }
    }
  },
  watch: {
    'selectItems.firmInform.公司名稱': function (value) {
      const { _id, firmName } = this.initializedData
      if (_id !== null && firmName !== null) {
        initializeForRecord(value, _id, firmName, this.selectItems)
      }
      this.isValidBoolean = this.isValid('公司名稱')
    },
    'selectItems.firmInform.統編': function (value) {
      const { _id, taxIdNums } = this.initializedData
      if (_id !== null && taxIdNums !== null) {
        initializeForRecord(value, _id, taxIdNums, this.selectItems)
      }
      this.isValidBoolean = this.isValid('統編')
    },
    'selectItems.firmInform.公司電話': {
      handler (newValue, oldValue) {
        this.isValidBoolean = this.isValid('公司電話')
      },
      immediate: true,
      deep: true
    },
    'selectItems.firmInform.公司所在地': function (value) {
      if (value === null) {
        this.selectItems.firmInform.傳真.傳真國際區號 = null
        this.selectItems.firmInform.公司電話.電話國際區號 = null
        this.selectItems.firmInform.傳真.傳真區碼 = null
        this.selectItems.firmInform.公司電話.電話區碼 = null
      } else {
        if (Object.keys(regions).includes(value)) {
          this.selectItems.firmInform.傳真.傳真國際區號 = 886
          this.selectItems.firmInform.公司電話.電話國際區號 = 886
          this.selectItems.firmInform.傳真.傳真區碼 = regions[value]
          this.selectItems.firmInform.公司電話.電話區碼 = regions[value]
        }
      }
      this.isValidBoolean = this.isValid('公司所在地')
    },
    'selectItems.firmInform.傳真': {
      handler (newValue, oldValue) {
        this.isValidBoolean = this.isValid('傳真')
      },
      immediate: true,
      deep: true
    },
    'selectItems.firmInform.Email': function (value) {
      this.isValidBoolean = this.isValid('Email')
    },
    'selectItems.contactPersonInform.聯絡人電話': {
      handler (newValue, oldValue) {
        this.isValidBoolean = this.isValid('聯絡人電話')
      },
      immediate: true,
      deep: true
    },
    'selectItems.contactPersonInform.聯絡人手機': {
      handler (newValue, oldValue) {
        this.isValidBoolean = this.isValid('聯絡人手機')
      },
      immediate: true,
      deep: true
    },
    'selectItems.contactPersonInform.聯絡人所在地': function (value) {
      if (value === null) {
        this.selectItems.contactPersonInform.聯絡人電話.電話國際區號 = null
        this.selectItems.contactPersonInform.聯絡人手機.手機國際區號 = null
        this.selectItems.contactPersonInform.聯絡人電話.電話區碼 = null
      } else if (Object.keys(regions).includes(value)) {
        this.selectItems.contactPersonInform.聯絡人電話.電話國際區號 = 886
        this.selectItems.contactPersonInform.聯絡人手機.手機國際區號 = 886
        this.selectItems.contactPersonInform.聯絡人電話.電話區碼 = regions[value]
      }
    },
    regions: function (value) {
      if (value.length === 0) {
        this.selectItems.hideDropdownIcon = true
      } else if (value.length > 0) {
        this.selectItems.hideDropdownIcon = false
      }
    }
  }
}
function inputValidChecking (isValidBoolean, errorMessageIsNullValue, form, key1, key2, key3, key4, key5, key6) {
  var inputCompleted = 0
  if (isValidBoolean === undefined || isValidBoolean === false) {
    inputCompleted += errorMessageIsNullValue
  }
  Object.keys(form).forEach(elem1 => {
    if (elem1 !== key1 && elem1 !== key2 && elem1 !== key3 && elem1 !== key4 && elem1 !== key5 && elem1 !== key6) {
      if (form[elem1] !== null && form[elem1].length > 0) {
        inputCompleted += 1
      }
    }
  })
  return inputCompleted
}
function resetFunc (targetInform, fax, phone, mobile) {
  Object.keys(targetInform).forEach(elem1 => {
    if (elem1 === fax || elem1 === phone || elem1 === mobile) {
      Object.keys(targetInform[elem1]).forEach(elem2 => {
        targetInform[elem1][elem2] = null
      })
    } else {
      targetInform[elem1] = ''
    }
  })
}
function initializeForRecord (value, _id, inputItem, selectItems) {
  if (value !== null && inputItem.includes(value)) {
    firmInformAPI.post('/api/initializeForRecord', { taxIdNumExist: true, _id: _id[inputItem.findIndex(elem => elem === value)] }).then((res) => {
      const { recordData } = res.data
      selectItems.contactPersonInform = recordData.contactPersonInform
      selectItems.firmInform = recordData.firmInform
    })
  }
}
function submit (message) {
  Notify.create({
    type: 'positive',
    message: `"${message}" 成功`
  })
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';
</style>
