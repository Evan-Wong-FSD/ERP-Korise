<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <!-- <header class="row justify-between q-px-lg q-pt-lg">
      <div>
        <h1 class="text-h4 text-grey-10 text-center">廠商資料</h1>
        <div class="header-width header-underline"></div>
      </div>

      <q-btn-dropdown unelevated size="lg" color="mainColor" :ripple="false" :label="menuValue" class="border-radius-btn-dropdown">
        <q-list>
          <q-item clickable v-close-popup @click="onItemClick(elem)" v-model="menuValue" v-for="(elem, index) in menuOption" :key="index">
            <q-item-section>
              <router-link :to="elem === '記錄' ? '/廠商資料' : `/廠商資料${elem}`">
                <q-item-label class="my-font-medium text-grey-10">{{elem}}</q-item-label>
              </router-link>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </header>

    <br> -->

    <div class="row justify-evenly">
      <q-input
        dense
        ref="filter"
        filled
        v-model="filter"
        label="搜尋"
        class="col-9"
      >
        <template v-slot:append>
          <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
          <q-icon v-if="filter === ''" name="search" />
        </template>
      </q-input>

      <span>
        <q-btn
          text-color="grey-10"
          :color="ternaryOperator('btn-confirm-color', 'warning', updateBtn, '更新')"
          :label="updateBtn"
          class="q-mr-md"
          @click="updateBtn = ternaryOperator('完成', '更新', updateBtn, '更新')"
        />
        <q-btn
          color="negative"
          label="刪除"
          class="q-ml-md"
          @click="confirm = selected !== '' && selected !== null ? true : false"
        />

        <q-dialog v-model="confirm" persistent>
          <q-card class="bg-grey-4">
            <q-card-section class="row items-center">
              <q-icon name="warning" class="text-negative" style="font-size: 4rem;" />
              <span class="q-ml-sm" style="font-size: 1.2rem;">是否確定刪除 "統編：{{selected}}" 此筆資料？</span>
            </q-card-section>

            <q-card-actions align="center">
              <q-btn push size="md" label="刪除" color="negative" text-color="white" v-close-popup @click="onDelete(selected)" />
              <q-btn size="md" label="取消" color="white" text-color="grey-10" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </span>
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
            :filter="filter"
            :filter-method="myFilterMethod"
            :selected.sync="selected"
            :expanded.sync="expanded"
          >
            <template v-slot:header-taxIdNumTitle="prop">
              <div class="row items-center">
                <div style="font-size: 1.2rem" class="text-weight-bold text-grey-10">{{ prop.node.label }}</div>
              </div>
            </template>

            <template v-slot:header-taxIdNum="prop">
              <div class="row items-center" @click="step = 1">
                <div style="font-size: 1.2rem">{{ prop.node.label }}</div>
              </div>
            </template>

            <template v-slot:body-firmName="prop">
              <div class="text-grey-10">
                {{ prop.node.story }}
              </div>
            </template>
          </q-tree>
        </div>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="selected"
          animated
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel :name="elem1.firmInform.統編" v-for="(elem1, index1) in data" :key="index1">
            <firmInformRecordBody v-if="updateBtn === '完成'" />

            <q-stepper
              v-model="step"
              ref="stepper"
              alternative-labels
              color="primary"
              animated
              flat
              class="bg-grey-1"
              v-if="updateBtn === '更新'"
            >
              <q-step
                :name="1"
                title="廠商資料"
                icon="assignment"
                :done="step > 1"
              >
                <div class="row justify-center q-gutter-lg">
                  <q-input
                    :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                    readonly
                    :outlined="ternaryOperator(false, true, elem2, '統編', '公司電話', '公司所在地', '傳真')"
                    :borderless="ternaryOperator(true, false, elem2, '統編', '公司電話', '公司所在地', '傳真')"
                    :label="ternaryOperator(null, elem2, elem2, '統編', '公司電話', '公司所在地', '傳真')"
                    v-bind:value="ternaryOperator(null, elem1.firmInform[elem2], elem2, '統編', '公司電話', '公司所在地', '傳真')"
                    v-on:input="ternaryOperator(null, elem1.firmInform[elem2] = $event, elem2, '統編', '公司電話', '公司所在地', '傳真')"
                    v-for="(elem2, index2) in Object.keys(elem1.firmInform)"
                    :key="index2"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_money" v-if="elem2 === '資本額'" />

                      <q-select
                        outlined
                        readonly
                        v-bind:value="elem1.firmInform.公司所在地"
                        v-on:input="elem1.firmInform.公司所在地 = $event"
                        :label="elem2"
                        hide-dropdown-icon
                        :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                        v-if="elem2 === '公司所在地'"
                      />

                      <q-select
                        outlined
                        readonly
                        v-bind:value="elem1.firmInform.統編"
                        v-on:input="elem1.firmInform.統編 = $event"
                        :label="elem2"
                        hide-dropdown-icon
                        :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                        v-if="elem2 === '統編'"
                      />

                      <q-input
                        outlined
                        readonly
                        :label="elem3"
                        :name="elem3"
                        v-bind:value="elem1.firmInform[elem2][elem3]"
                        v-on:input="elem1.firmInform[elem2][elem3] = $event"
                        :style="`min-width: ${inputBoxWidth / 3}px`"
                        v-if="elem2 === '傳真' && index3 < 2"
                        v-for="(elem3, index3) in Object.keys(elem1.firmInform.傳真)"
                        :key="index3"
                      />

                      <q-input
                        outlined
                        readonly
                        :label="elem3"
                        :name="elem3"
                        v-bind:value="elem1.firmInform[elem2][elem3]"
                        v-on:input="elem1.firmInform[elem2][elem3] = $event"
                        :style="`min-width: ${inputBoxWidth / 3}px`"
                        v-if="elem2 === '公司電話' && index3 < 2"
                        v-for="(elem3, index3) in Object.keys(elem1.firmInform.公司電話)"
                        :key="index3"
                      />
                    </template>

                    <template v-slot:append>
                      <q-input
                        outlined
                        readonly
                        label="傳真號碼"
                        name="傳真號碼"
                        v-bind:value="elem1.firmInform.傳真.傳真號碼"
                        v-on:input="elem1.firmInform.傳真.傳真號碼 = $event"
                        :style="`min-width: ${inputBoxWidth / 3}px`"
                        v-if="elem2 === '傳真'"
                      />

                      <q-input
                        outlined
                        readonly
                        label="電話號碼"
                        name="電話號碼"
                        v-bind:value="elem1.firmInform.公司電話.電話號碼"
                        v-on:input="elem1.firmInform.公司電話.電話號碼 = $event"
                        :style="`min-width: ${inputBoxWidth / 3}px`"
                        v-if="elem2 === '公司電話'"
                      />
                    </template>

                    <q-resize-observer @resize="inputBoxsWidth" />
                  </q-input>
                </div>
              </q-step>

              <q-step
                :name="2"
                title="聯絡人資料"
                icon="assignment"
              >
                <div class="row justify-center q-gutter-lg">
                  <q-input
                    :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                    readonly
                    :outlined="ternaryOperator(false, true, elem2, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                    :borderless="ternaryOperator(true, false, elem2, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                    :label="ternaryOperator(null, elem2, elem2, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                    v-bind:value="ternaryOperator(null,elem1.contactPersonInform[elem2], elem2, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                    v-on:input="ternaryOperator(null, elem1.contactPersonInform[elem2] = $event, elem2, '聯絡人所在地', '聯絡人電話', '聯絡人手機', 'blank')"
                    v-for="(elem2, index2) in Object.keys(elem1.contactPersonInform)"
                    :key="index2"
                  >

                    <template v-slot:prepend>
                      <q-select
                        outlined
                        readonly
                        v-bind:value="elem1.contactPersonInform.聯絡人所在地"
                        v-on:input="elem1.contactPersonInform.聯絡人所在地 = $event"
                        :label="elem2"
                        hide-dropdown-icon
                        :style="`width: ${(backgroundWidth - 250) / 2}px;`"
                        v-if="elem2 === '聯絡人所在地'"
                      />

                      <q-input
                        outlined
                        readonly
                        :label="elem3"
                        :name="elem3"
                        v-bind:value="elem1.contactPersonInform[elem2][elem3]"
                        v-on:input="elem1.contactPersonInform[elem2][elem3] = $event"
                        :style="`min-width: ${inputBoxWidth / 4}px`"
                        v-if="elem2 === '聯絡人電話'"
                        v-for="(elem3, index3) in Object.keys(elem1.contactPersonInform.聯絡人電話)"
                        :key="index3"
                      />

                      <q-input
                        outlined
                        readonly
                        :label="elem3"
                        :name="elem3"
                        v-bind:value="elem1.contactPersonInform[elem2][elem3]"
                        v-on:input="elem1.contactPersonInform[elem2][elem3] = $event"
                        :style="`min-width: ${inputBoxWidth / 2}px`"
                        v-if="elem2 === '聯絡人手機' && index3 === 0"
                        v-for="(elem3, index3) in Object.keys(elem1.contactPersonInform.聯絡人手機)"
                        :key="index3"
                      />
                    </template>

                    <template v-slot:append>
                      <q-input
                        outlined
                        readonly
                        label="手機號碼"
                        name="手機號碼"
                        v-bind:value="elem1.contactPersonInform.聯絡人手機.手機號碼"
                        v-on:input="elem1.contactPersonInform.聯絡人手機.手機號碼 = $event"
                        :style="`min-width: ${inputBoxWidth / 2}px`"
                        v-if="elem2 === '聯絡人手機'"
                      />
                    </template>

                    <q-resize-observer @resize="inputBoxsWidth" />
                  </q-input>
                </div>
              </q-step>

              <template v-slot:navigation>
                <q-stepper-navigation class="row justify-end bottle-btn-position">
                  <q-btn
                    size="lg"
                    @click="ternaryOperator($refs.stepper[0].next(), $refs.stepper[0].previous(), step, 1)"
                    color="btn-confirm-color"
                    text-color="grey-10"
                    :label="ternaryOperator('下一頁', '上一頁', step, 1)"
                    class="border-radius-btn"
                  />
                </q-stepper-navigation>
              </template>
            </q-stepper>

            <q-resize-observer @resize="onResize" />
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>

<script>
import { firmInformAPI } from 'boot/axios'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import firmInformRecordBody from './firmInformRecordBody.vue'
Vue.use(new VueSocketIO({
  debug: true,
  // 服務器端地址
  connection: 'http://localhost:3001',
  vuex: {}
}))
export default {
  components: {
    firmInformRecordBody: firmInformRecordBody
  },
  data () {
    return {
      backgroundWidth: null,
      inputBoxWidth: null,
      confirm: false,
      updateBtn: '更新',
      menuValue: '表單',
      menuOption: ['記錄', '表單'],
      splitterModel: 20,
      selected: '',
      filter: '',
      expanded: ['統編'],
      step: 1,
      simple: [
        {
          label: '統編',
          header: 'taxIdNumTitle',
          children: []
        }
      ],
      data: null
    }
  },
  mounted () {
    firmInformAPI.post('/api/initializeForSheet').then((res) => {
      const { arrFirmInform } = res.data
      const children = this.simple[0].children
      this.data = arrFirmInform
      arrFirmInform.forEach((elem, index, arr) => {
        children.splice(children.length, 0, {
          label: elem.firmInform.統編,
          header: 'taxIdNum',
          body: 'firmName',
          story: elem.firmInform.公司名稱
        })
      })
    })
  },
  methods: {
    onItemClick (value) {
      this.menuValue = value
    },
    onResize (size) {
      this.backgroundWidth = size.width
    },
    onDelete (taxIdNum) {
      this.data.forEach(elem => {
        if (taxIdNum === elem.firmInform.統編) {
          this.$socket.emit('delete', {
            _id: elem._id
          })
        }
      })
      initializeForSheet(this.simple[0].children, this.$socket)
    },
    inputBoxsWidth (size) {
      this.inputBoxWidth = size.width
    },
    myFilterMethod (node, filter) {
      const filt = filter.toLowerCase()
      return (node.label && node.label.toLowerCase().indexOf(filt) > -1) || (node.story && node.story.toLowerCase().indexOf(filt) > -1)
    },
    resetFilter () {
      this.filter = ''
      this.$refs.filter.focus()
    },
    ternaryOperator (truth, untruth, key, value1, value2, value3, value4, value5, value6) {
      return key === value1 || key === value2 || key === value3 || key === value4 || key === value5 || key === value6
        ? truth
        : untruth
    }
  },
  watch: {
    updateBtn: function (value) {
      if (value === '更新') {
        initializeForSheet(this.simple[0].children, this.$socket)
      } else if (value === '完成') {
        const socket = this.$socket
        const selected = this.selected
        this.data.forEach(elem => {
          if (selected === elem.firmInform.統編) {
            socket.emit('initializeForRecord', {
              taxIdNumExist: true,
              _id: elem._id
            })
          }
        })
      }
    }
  }
}
function initializeForSheet (children, socket) {
  // const children = this.simple[0].children
  children.splice(0, children.length)
  socket.emit('initializeForSheet')
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';
</style>
