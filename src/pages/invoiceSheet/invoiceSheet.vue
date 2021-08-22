<template>
  <div class="my-font-medium">
    <header class="row justify-between q-px-lg q-pt-lg">
      <div>
        <h1 class="text-h4 text-grey-10 text-center">進銷項表單</h1>
        <div style="width: 215.124px; border-top: 6px solid #00bcd4; width: 215.124px; margin-top: 10px;" />
      </div>
    </header>

    <br>

    <tableForWholeInvoice :settingInWholeTable="settingInWholeTable" @switchTable="showSpecificTable" v-if="showTableForWholeInvoice" />
    <tableForSpecificInvoice :invoiceNum="invoiceNum" @switchTable="showWholeTable" v-if="showTableForSpecificInvoice" />
  </div>
</template>

<script>
import tableForWholeInvoice from './tableForWholeInvoice.vue'
import tableForSpecificInvoice from './tableForSpecificInvoice.vue'
export default {
  components: {
    tableForWholeInvoice: tableForWholeInvoice,
    tableForSpecificInvoice: tableForSpecificInvoice
  },
  data () {
    return {
      invoiceNum: null,
      showTableForWholeInvoice: true,
      showTableForSpecificInvoice: false,
      settingInWholeTable: null
    }
  },
  methods: {
    showSpecificTable (value) {
      this.invoiceNum = value.invoiceNum
      this.showTableForWholeInvoice = value.showTableForWholeInvoice
      this.showTableForSpecificInvoice = value.showTableForSpecificInvoice
      this.settingInWholeTable = value.settingInWholeTable
    },
    showWholeTable (value) {
      this.showTableForWholeInvoice = value.showTableForWholeInvoice
      this.showTableForSpecificInvoice = value.showTableForSpecificInvoice
    }
  }
}
</script>

<style lang="scss">
  @import '../../layouts/CSS/p&sSheet.scss';
</style>
<style lang="sass">
.invoiceSheet
  /* height or max-height is important */
  // height: 743px
  height: 80vh
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
  tbody tr:nth-child(2n+1)
    background: #e0e0e0 //grey-4
</style>
