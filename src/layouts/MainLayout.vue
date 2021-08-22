<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="header-background-color">
      <q-toolbar>
        <q-btn dense flat round size="2em" icon="menu" class="text-grey-10" @click="left = !left" />

        <q-toolbar-title>
          <header class="header-flex-container q-gutter-x-lg">
            <picture><img src="../assets/picture/Korise logo.png"></picture>
            <h1 class="header-align-self text-h3 text-dark"><strong>ERP System</strong></h1>
          </header>
        </q-toolbar-title>

        <!-- <q-btn dense flat round size="2em" icon="menu" class="text-grey-10" @click="right = !right" /> -->
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="left" side="left" bordered>
      <nav>
        <router-link :to="`/${button}`" v-for="(button, buttonIndex) in Object.keys(menuButton)" :key="buttonIndex">
          <q-btn push :label="button" size="xl" class="menu-button my-font-medium text-weight-bolder" :class="menuButton[button] === true ? 'menu-button-selected' : 'menu-button-non-selected'" @click="menuButtonColor(button)" />
        </router-link>
      </nav>
    </q-drawer>

    <!-- <q-drawer show-if-above v-model="right" side="right" bordered>
      <section>
        <header class="text-white bg-red text-h5 my-font-medium text-weight-bolder warning-title q-pa-md">
          Warning
        </header>
        <br/>
        <div v-for="(e, i) in 3" :key="i + Math.random()">
          <div class="text-white text-h6 my-font-medium warning-msg" style="border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <div class="row q-pa-sm">
              材料名稱
              <q-space />
              <q-btn flat round padding="0px" icon="highlight_off" color="dark" size="md" v-close-popup />
            </div>
            <q-linear-progress :value="progress" rounded size="md" color="negative" track-color="grey-10" style="width:90%;" class="float-right" />
            <div class="q-pa-sm">剩餘：2夥</div>
          </div>
          <br/>
        </div>
        <div v-for="(e, i) in 2" :key="i + Math.random()">
          <div class="text-white text-h6 my-font-medium warning-msg" style="border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <div class="row q-pt-sm q-px-sm">
              貨款到期
              <q-space />
              <q-btn flat round padding="0px" icon="highlight_off" color="dark" size="md" v-close-popup />
            </div>
            <div class="q-pl-sm">發票號碼：EL36310601</div>
            <div class="q-pb-sm q-px-sm">剩餘：3天</div>
          </div>
          <br/>
        </div>
      </section>
    </q-drawer> -->

    <q-page-container>
      <main class="bg-grey-1 main-page-height">
        <router-view />
      </main>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data () {
    return {
      left: false,
      // right: false,
      seamless: false,
      menuButton: {
        // Dashboard: false,
        進銷庫存記錄: false,
        進銷項表單: false,
        物料清單: false,
        // 產品BOM表: false,
        // 工程BOM表: false,
        BOM表: false,
        材料資料: false,
        產品種類: false,
        廠商資料: false
      }
      // progress: 0.2
    }
  },
  methods: {
    menuButtonColor (button) {
      Object.keys(this.menuButton).forEach(elem => {
        this.menuButton[elem] = false
      })
      this.menuButton[button] = true
    }
  },
  watch: {
    right: function (value) {
      if (value === true) {
        this.seamless = true
      } else {
        this.seamless = false
      }
    }
  }
}
</script>

<style lang="scss">
  @import './CSS/MainLayout.scss';
</style>
