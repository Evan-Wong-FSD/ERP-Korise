<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App',
  mounted () {
    console.log(333333333)
    this.$router.push({ name: '登入' })
  }
}
</script>

<style>
  @import './assets/tailwindCSS style/output.css';
</style>
