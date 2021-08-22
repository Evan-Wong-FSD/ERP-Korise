<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <header class="row justify-between q-px-lg q-pt-lg">
      <div>
        <h1 class="text-h4 text-grey-10 text-center">廠商資料</h1>
        <div class="header-width header-underline"></div>
      </div>

      <q-btn-dropdown unelevated size="lg" color="mainColor" :ripple="false" :label="menuValue" class="border-radius-btn-dropdown">
        <q-list>
          <q-item clickable v-close-popup @click="onItemClick(elem)" v-model="menuValue" v-for="(elem, index) in menuOption" :key="index">
            <q-item-section>
              <q-item-label class="my-font-medium text-grey-10">{{elem}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </header>
  </div>
</template>

<script>
export default {
  data () {
    return {
      menuValue: '記錄',
      menuOption: ['記錄', '表單']
    }
  },
  methods: {
    onItemClick (value) {
      this.menuValue = value
      this.$emit('select', {
        option: value
      })
    }
  }
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&srecord.scss';
</style>
