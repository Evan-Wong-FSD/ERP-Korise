<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <section>
      <q-form @submit="onSubmit" @reset="onReset" class="row justify-center q-gutter-lg">
        <div class="row justify-center q-gutter-lg">
          <q-input
            no-error-icon
            :style="`width: ${(backgroundWidth - 250) / 2}px;`"
            :type="ternaryOperator('number', 'text', elem, '單價', '折數')"
            :prefix="ternaryOperator('$', '', elem, '單價')"
            :suffix="ternaryOperator('%', '', elem, '折數')"
            :error="ternaryOperator(error, false, elem, '稅金')"
            :rules="ternaryOperator([''], [ val => val !== null && val.length > 0 || `'${elem}' 為空值`], elem, 'Project code', '備註', '稅金')"
            :readonly="ternaryOperator(true, false, elem, '稅金')"
            :outlined="ternaryOperator(false, true, elem, '稅金')"
            :borderless="ternaryOperator(true, false, elem, '稅金')"
            :clearable="ternaryOperator(false, true, elem, '稅金')"
            :label="ternaryOperator(null, elem, elem, '稅金')"
            v-bind:value="ternaryOperator(null, materialsListInform[elem], elem, '稅金')"
            v-on:input="ternaryOperator(null, materialsListInform[elem] = $event, elem, '稅金')"
            v-if="elem !== '日期' && elem !== '複價' && elem !== 'materialsInformId'"
            v-for="(elem, index) in Object.keys(materialsListInform)"
            :key="index"
          >
            <template v-slot:prepend>
              <q-select
                outlined
                v-model="materialsListInform.稅金"
                :label="elem"
                :options="taxOptions"
                :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                v-if="elem === '稅金'"
              >
              </q-select>
            </template>

            <template v-slot:error>
              {{taxErrorMessage}}
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
          </div>
        </div>
      </q-form>
    </section>
    <q-resize-observer @resize="onResize" />
  </div>
</template>

<script>
import { date } from 'quasar'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3004',
  vuex: {}
}))
export default {
  data () {
    return {
      backgroundWidth: null,
      taxOptions: ['未稅', '含稅'],
      materialsListInform: {
        單價: '',
        折數: '',
        付款條件: '',
        稅金: '',
        'Project code': '',
        備註: ''
      },
      error: false,
      taxErrorMessage: "'稅金' 為空值",
      submitOperation: null,
      materialsListID: null
    }
  },
  methods: {
    onResize (size) {
      this.backgroundWidth = size.width
    },
    onReset () {
      Object.keys(this.materialsListInform).forEach(elem => {
        this.materialsListInform[elem] = ''
      })
    },
    onSubmit () {
      this.error = this.materialsListInform.稅金 === ''
      if (!this.error) {
        const materialsListInform = this.materialsListInform, { 單價, 折數 } = materialsListInform
        materialsListInform.日期 = date.formatDate(Date.now(), 'YYYY/M/D')
        materialsListInform.複價 = String(單價 * (折數 / 100))
        this.$socket.emit('submit', {
          _id: this.materialsListID,
          submitOperation: this.submitOperation,
          materialsListInform: materialsListInform
        })
        this.onReset()
      }
    },
    ternaryOperator (truth, untruth, key, value1, value2, value3) {
      return key === value1 || key === value2 || key === value3
        ? truth
        : untruth
    }
  },
  sockets: {
    initializeForRecordCreated: function (backendData) {
      this.submitOperation = 'create'
      this.materialsListInform.materialsInformId = backendData.materialsInformId
    },
    initializeForRecordUpdated: function (backendData) {
      this.submitOperation = 'update'
      Object.keys(backendData.materialsListInform).forEach(elem => {
        if (elem === '_id') {
          this.materialsListID = backendData.materialsListInform[elem]
        } else {
          this.materialsListInform[elem] = backendData.materialsListInform[elem]
        }
      })
    }
  }
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';
</style>
