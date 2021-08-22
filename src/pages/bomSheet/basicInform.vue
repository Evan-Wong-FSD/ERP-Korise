<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <section>
      <!-- @submit="onSubmit" @reset="onReset" -->
      <q-form class="row justify-center q-gutter-lg">
        <div class="row justify-center q-gutter-lg">
          <!-- :rules="ternaryOperator([''], [ val => val !== null && val.length > 0 || `'${elem1}' 為空值`], elem1, ['日期'])" -->
          <!-- :type="ternaryOperator('number', 'text', elem1, ['聯絡人電話', '傳真'])" -->
          <!-- ddd
          {{basicInform}} -->
          <q-input
            no-error-icon
            :style="`width: ${(backgroundWidth - 250) / 2}px;`"
            :error="isError(elem1)"
            :readonly="ternaryOperator(true, false, elem1, ['日期', '統編', '公司名稱', '聯絡人名稱', '聯絡人電話', '傳真'])"
            :outlined="ternaryOperator(false, true, elem1, ['日期', '統編', '公司名稱'])"
            :borderless="ternaryOperator(true, false, elem1, ['日期', '統編', '公司名稱'])"
            :clearable="ternaryOperator(false, true, elem1, ['日期', '統編', '公司名稱', '聯絡人名稱', '聯絡人電話', '傳真'])"
            :label="ternaryOperator(null, elem1, elem1, ['日期', '統編', '公司名稱'])"
            v-bind:value="ternaryOperator(null, basicInform[elem1], elem1, ['日期', '統編', '公司名稱'])"
            v-on:input="ternaryOperator(null, basicInform[elem1] = $event, elem1, ['日期', '統編', '公司名稱'])"
            v-for="(elem1, index1) in Object.keys(basicInform)"
            :key="index1"
          >
            <template v-slot:prepend>
              <div class="cursor-pointer q-gutter-x-sm" :style="basicInform[elem1] ? 'width: auto;' : `width: ${(backgroundWidth - 250) / 2}px;`" v-if="elem1 === '時間'">
                <q-icon name="event" />
                <span v-show="!basicInform[elem1]" style="font-size: 1rem;">時間</span>
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

              <!-- :error="isError(elem1)" -->
              <!-- @filter="filterOptions" -->
              <!-- @focus="focusSelect = elem1" -->
              <q-select
                no-error-icon
                use-input
                outlined
                clearable
                input-debounce="500"
                :label="elem1"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                :options="options"
                @filter="(value, update) => { fetchAndFilter(elem1, value, update) }"
                @input="getRespectiveValueByTaxIdNum()"
                v-model="basicInform.統編"
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
                no-error-icon
                use-input
                outlined
                clearable
                input-debounce="500"
                :label="elem1"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                :options="options"
                @filter="(value, update) => { fetchAndFilter(elem1, value, update) }"
                @input="getRespectiveValueByFirmName()"
                v-model="basicInform.公司名稱"
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
            </template>

            <template v-slot:error>
              <p>{{errorMessage[elem1]}}</p>
            </template>
          </q-input>
        </div>
      </q-form>
    </section>

    <q-resize-observer @resize="onResize" />
  </div>
</template>

<script>
import { date, Notify, SessionStorage } from 'quasar'
import { firmInformAPI, bomSheet } from 'boot/axios'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
export default {
  props: ['operation', 'returnBackFirstPage', 'basicInformData', 'basicInformContent', 'bomTablePreview'],
  data () {
    return {
      backgroundWidth: null,
      newDate: null,
      options: [],
      errorMessage: null,
      booleanIsValid: undefined,
      focusSelect: '',
      basicInform: {
        工程名稱: undefined,
        時間: undefined, // q-date
        統編: undefined, // q-select
        公司名稱: undefined, // q-select
        聯絡人名稱: undefined, // q-select
        聯絡人電話: undefined, // readonly
        傳真: undefined, // readonly
        'Project code': undefined
      }
    }
  },
  mounted () {
    Vue.use(new VueSocketIO({
      debug: true,
      // 服務器端地址
      connection: 'http://localhost:3006',
      vuex: {}
    }))
    this.errorMessage = Object.fromEntries(Object.entries(this.basicInform))
    if (SessionStorage.has('basicInform')) {
      const basicInformInStorage = SessionStorage.getItem('basicInform')
      Object.keys(basicInformInStorage).forEach(elem => {
        this.basicInform[elem] = basicInformInStorage[elem]
      })
    }
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
      this.basicInform.時間 = date.formatDate(Date.parse(newDateSplit.join('-')), 'YYYY/M/D')
    },
    ternaryOperator (correct, incorrect, key, arrValue) {
      return arrValue.includes(key) ? correct : incorrect
    },
    fetchAndFilter (elem, value, update) {
      if (value) {
        firmInformAPI.post('/api/filterAndGetOptions', { inputKey: elem, inputValue: value }).then((res) => {
          updateOptions(update, this.options, res.data.optionFiltered)
        })
      }
    },
    getRespectiveValueByTaxIdNum () {
      if (this.basicInform.統編) {
        firmInformAPI.post('/api/getRespectiveValueByTaxIdNum', { taxIdNum: this.basicInform.統編 }).then((res) => {
          const { 公司名稱, 傳真, 聯絡人名稱, 聯絡人電話 } = res.data,
            { 電話國際區號, 電話區碼, 電話號碼, 電話分機 } = 聯絡人電話,
            { 傳真國際區號, 傳真區碼, 傳真號碼 } = 傳真
          this.basicInform.公司名稱 = 公司名稱
          this.basicInform.聯絡人名稱 = 聯絡人名稱
          this.basicInform.聯絡人電話 = `${電話國際區號 !== 886 ? `${電話國際區號} ` : ''}${電話區碼} - ${電話號碼}${電話分機 ? ` #${電話分機}` : ''}`
          this.basicInform.傳真 = `${傳真國際區號 !== 886 ? `${傳真國際區號} ` : ''}${傳真區碼} - ${傳真號碼}`
        })
      }
    },
    getRespectiveValueByFirmName () {
      if (this.basicInform.公司名稱) {
        firmInformAPI.post('/api/getRespectiveValueByFirmName', { firmName: this.basicInform.公司名稱 }).then((res) => {
          const { 統編, 傳真, 聯絡人名稱, 聯絡人電話 } = res.data,
            { 電話國際區號, 電話區碼, 電話號碼, 電話分機 } = 聯絡人電話,
            { 傳真國際區號, 傳真區碼, 傳真號碼 } = 傳真
          this.basicInform.統編 = 統編
          this.basicInform.聯絡人名稱 = 聯絡人名稱
          this.basicInform.聯絡人電話 = `${電話國際區號 !== 886 ? `${電話國際區號} ` : ''}${電話區碼} - ${電話號碼}${電話分機 ? ` #${電話分機}` : ''}`
          this.basicInform.傳真 = `${傳真國際區號 !== 886 ? `${傳真國際區號} ` : ''}${傳真區碼} - ${傳真號碼}`
        })
      }
    },
    isError (elem1) { // 只要有設 'error' 參數，'error'會把所有 elem 代進來
      let Break = false
      Object.keys(this.basicInform).forEach(elem2 => { // 不能包成 function 因為 booleanIsValid 和 Break 代進去沒法變更value
        // if (!Break && (elem1 !== '備註 (選填)' && elem1 !== 'blank') && (elem2 === elem1)) {
        if (!Break && (elem2 === elem1)) {
          this.booleanIsValid = Boolean(this.basicInform[elem2])
          if (this.basicInform[elem2] === '' || this.basicInform[elem2] === null) {
            this.errorMessage[elem2] = `'${elem2}' 為空值`
            Break = true
          }
        }
      })
      return Break
    }
  },
  sockets: {
    insertBasicInform: function (backendData) {
      bomSheet.post('/api/insertBasicInform', { basicInform: this.basicInform })
    }
    // importBasicInform (backendData) {
    //   // bomSheet.post('/api/importBasicInform', backendData).then((res) => {
    //   // const dataBasicInform = res.data.basicInform
    //   const { basicInform } = backendData
    //   Object.keys(this.basicInform).forEach(elem => {
    //     Vue.set(this.basicInform, elem, basicInform[elem])
    //   })
    //   this.booleanIsValid = true
    //   // })
    // }
  },
  watch: {
    operation (value) {
      if (value === 'reset') {
        Object.keys(this.basicInform).forEach(elem => {
          this.basicInform[elem] = undefined
        })
      } else if (value === 'pending') {
        if (this.booleanIsValid && isInputValid(this.basicInform)) {
          const { 工程名稱, 時間 } = this.basicInform
          bomSheet.post('/api/checkDuplicateProjectName', { projectName: 工程名稱, projectDate: 時間 }).then((res) => {
            SessionStorage.set('basicInform', this.basicInform)
            if (!res.data.duplicate) {
              this.$emit('resultSubmited', {
                key: 'basicInformStatus',
                value: 'succeed'
              })
            } else {
              notify('negative', '"工程名稱" 和 "時間" 組合已存在')
              this.$emit('operationStatus', {
                key: 'operation',
                value: undefined
              })
            }
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
      this.basicInform = this.basicInformData
    },
    'basicInformContent.switch' (value) {
      this.booleanIsValid = true
      this.basicInform = this.basicInformContent.data
    },
    'bomTablePreview.switch' (value) {
      SessionStorage.set('basicInform', this.basicInform)
    }
  }
}

function updateOptions (update, options, arrOptions) {
  update(() => {
    options.splice(0, options.length, ...arrOptions)
  })
}

function isInputValid (basicInform) {
  const basicInformValue = []
  Object.keys(basicInform).forEach(elem1 => {
    basicInformValue.splice(basicInformValue.length, 0, basicInform[elem1])
  })
  return basicInformValue.findIndex(elem2 => !elem2) === -1 // 確保每個輸入都是有效
}

function notify (type, message) {
  Notify.create({
    type: type,
    message: message
  })
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';
</style>
<style lang="sass">
.my-sticky-dynamic
  /* height or max-height is important */
  // height: 743px
  height: 40vh
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
