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

      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="left" side="left" bordered>
      <nav>
        <!-- <router-link :to="`/${button}`" v-for="(button, buttonIndex) in Object.keys(menuButton)" :key="buttonIndex"> -->
        <q-btn push
        :label="button"
        size="xl"
        :disable="!loginStatus"
        class="menu-button my-font-medium text-weight-bolder"
        :class="menuButton[button] === true ? 'menu-button-selected' : 'menu-button-non-selected'"
        @click="menuButtonColor(button), changeRoute(button)"
        v-for="(button, buttonIndex) in Object.keys(menuButton)"
        :key="buttonIndex"
      />
        <!-- </router-link> -->
      </nav>
    </q-drawer>

    <q-page-container>
      <main class="bg-grey-1 main-page-height">
        <router-view @validateLogin="validateLogin" />
      </main>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data () {
    return {
      left: false,
      seamless: false,
      loginStatus: null,
      menuButton: {
        進銷庫存記錄: false,
        進銷項表單: false,
        物料清單: false,
        BOM表: false,
        材料資料: false,
        產品種類: false,
        廠商資料: false
      }
    }
  },
  methods: {
    menuButtonColor (button) {
      Object.keys(this.menuButton).forEach(elem => {
        this.menuButton[elem] = false
      })
      this.menuButton[button] = true
    },
    validateLogin (value) {
      this.loginStatus = value.loginStatus
      if (value.loginStatus === false) {
        this.$q.notify({
          type: 'negative',
          message: '帳號或密碼錯誤'
        })
      }
    },
    changeRoute (route) {
      this.$router.push({ path: `/${route}` })
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
