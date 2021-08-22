<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <firmInformRecordHeader @select="switchOption" />
    <br>
    <firmInformRecordBody v-if="option === '記錄'" />
    <firmInformSheet v-if="option === '表單'" />
  </div>
</template>

<script>
import firmInformRecordHeader from './firmInformRecordHeader.vue'
import firmInformRecordBody from './firmInformRecordBody.vue'
import firmInformSheet from './firmInformSheet.vue'
export default {
  components: {
    firmInformRecordHeader: firmInformRecordHeader,
    firmInformRecordBody: firmInformRecordBody,
    firmInformSheet: firmInformSheet
  },
  data () {
    return {
      option: '記錄'
    }
  },
  methods: {
    switchOption (value) {
      this.option = value.option
    }
  }
}
</script>
