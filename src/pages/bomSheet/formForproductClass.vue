<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <section>
      <div class="row justify-center">
        <q-select
          square
          outlined
          no-error-icon
          use-input
          new-value-mode="add-unique"
          filled
          clearable
          input-debounce="500"
          label="產品名稱"
          :options="options"
          @filter="(value, update) => { filterAndGetproductTitleOptions(arrproductClass[step - 2], value, update) }"
          v-model="formDataForproductClass.產品名稱"
          class="col"
          :rules="[ val => (val !== null && val !== '') || '產品名稱 輸入無效' ]"
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
          square
          outlined
          no-error-icon
          use-input
          new-value-mode="add-unique"
          filled
          clearable
          input-debounce="500"
          label="型號"
          :options="options"
          @filter="(value, update) => { filterAndGetModelOptions(formDataForproductClass.產品名稱, value, update) }"
          @input="getPricesByproductTitleAndModel()"
          v-model="formDataForproductClass.型號"
          class="col"
          :rules="[ val => (!Boolean(val) || val.length === 0 || val.length > 0) || '' ]"
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
      </div>

      <br>

      <div class="row justify-center">
        <q-input
          square
          outlined
          filled
          v-model="formDataForproductClass.數量"
          label="數量"
          type="number"
          class="col"
          :rules="[ val => (val !== null && val !== '') || '數量 輸入無效' ]"
        />

        <q-select
          square
          outlined
          no-error-icon
          use-input
          new-value-mode="add-unique"
          filled
          clearable
          input-debounce="500"
          label="單價"
          :options="originalPriceOptions"
          v-model="formDataForproductClass.單價"
          class="col"
          :rules="[ val => (val !== null && val !== '') || '單價 輸入無效' ]"
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
          square
          outlined
          no-error-icon
          use-input
          new-value-mode="add-unique"
          filled
          clearable
          input-debounce="500"
          label="複價"
          :options="negotiatedPriceOptions"
          v-model="formDataForproductClass.複價"
          class="col"
          :rules="[ val => (val !== null && val !== '') || '複價 輸入無效' ]"
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
          square
          outlined
          filled
          v-model="formDataForproductClass.備註"
          label="備註"
          class="col"
          :rules="[ val => (!Boolean(val) || val.length === 0 || val.length > 0) || '' ]"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { Notify, SessionStorage } from 'quasar'
import { ProductClassificationAPI, materialsInformtAPI } from 'boot/axios'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3003',
  vuex: {}
}))
export default {
  props: ['clickAddRowForproductClassOnTable', 'resetFormForproductClass', 'step'],
  data () {
    return {
      options: [],
      originalPriceOptions: [],
      negotiatedPriceOptions: [],
      arrproductClass: [],
      formDataForproductClass: {
        產品名稱: undefined,
        型號: undefined,
        數量: undefined,
        單價: undefined,
        複價: undefined,
        備註: undefined
      }
    }
  },
  mounted () {
    if (SessionStorage.has('arrproductClass')) {
      const valueInStorage = SessionStorage.getItem('arrproductClass')
      this.arrproductClass.splice(0, this.arrproductClass.length, ...valueInStorage.map(elem => {
        return elem.產品種類
      }))
    }
  },
  methods: {
    filterAndGetproductTitleOptions (productClass, value, update) {
      if (value) {
        ProductClassificationAPI.post('/api/filterAndGetproductTitleOptions', { inputKey: productClass, inputValue: value }).then((res) => {
          updateOptions(update, this.options, res.data.optionFiltered)
        })
      }
    },
    filterAndGetModelOptions (productTitle, value, update) {
      if (value) {
        materialsInformtAPI.post('/api/filterAndGetModelOptions', { inputKey: productTitle, inputValue: value }).then((res) => {
          updateOptions(update, this.options, res.data.optionFiltered)
        })
      }
    },
    getPricesByproductTitleAndModel () {
      const { 產品名稱, 型號 } = this.formDataForproductClass
      if (產品名稱 && 型號) {
        materialsInformtAPI.post('/api/getPricesByproductTitleAndModel', { productTitle: 產品名稱, model: 型號 }).then((res) => {
          this.originalPriceOptions.splice(0, this.originalPriceOptions.length, ...res.data.originalPrice)
          this.negotiatedPriceOptions.splice(0, this.negotiatedPriceOptions.length, ...res.data.negotiatedPrice)
        })
      }
    }
  },
  watch: {
    resetFormForproductClass (value) {
      onReset(this.options, this.originalPriceOptions, this.negotiatedPriceOptions, this.formDataForproductClass)
    },
    clickAddRowForproductClassOnTable (value) {
      const { incorrectElemIndex, isValid } = isInputValid(this.formDataForproductClass)
      if (isValid) {
        SessionStorage.set('formDataForproductClass', this.formDataForproductClass)
        this.$emit('addRowForproductClassOnTable')
        onReset(this.options, this.originalPriceOptions, this.negotiatedPriceOptions, this.formDataForproductClass)
      } else {
        notify('warning', `${Object.keys(this.formDataForproductClass)[incorrectElemIndex]} 輸入無效`)
      }
    }
  }
}

function updateOptions (update, options, arrOptions) {
  update(() => {
    options.splice(0, options.length, ...arrOptions)
  })
}

function isInputValid (formDataForproductClass) {
  const formDataValue = []
  Object.keys(formDataForproductClass).forEach(elem => {
    if (elem !== '備註' && elem !== '型號') {
      formDataValue.splice(formDataValue.length, 0, formDataForproductClass[elem])
    }
  })
  const incorrectElemIndex = formDataValue.findIndex(elem => !elem), isValid = incorrectElemIndex === -1
  return { incorrectElemIndex: incorrectElemIndex, isValid: isValid }
}

function onReset (options, originalPriceOptions, negotiatedPriceOptions, formDataForproductClass) {
  options.splice(0, options.length)
  originalPriceOptions.splice(0, originalPriceOptions.length)
  negotiatedPriceOptions.splice(0, negotiatedPriceOptions.length)
  Object.keys(formDataForproductClass).forEach(elem => {
    formDataForproductClass[elem] = undefined
  })
}

function notify (type, message) {
  Notify.create({
    type: type,
    message: message
  })
}
</script>
