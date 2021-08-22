<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <invoiceRecordHeader />

    <br>

    <invoiceRecordBody />
  </div>
</template>

<script>
// import invoiceRecordHeader from '../pages/invoiceRecordHeader.vue'
// import invoiceRecordBody from '../pages/invoiceRecordBody.vue'
import invoiceRecordHeader from './invoiceRecordHeader.vue'
import invoiceRecordBody from './invoiceRecordBody.vue'
export default {
  components: {
    invoiceRecordHeader: invoiceRecordHeader,
    invoiceRecordBody: invoiceRecordBody
  },
  data () {
    return {
      newInvoice: '進項'
    }
  }
}
</script>
