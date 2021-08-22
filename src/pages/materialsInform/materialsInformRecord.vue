<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <materialsInformRecordHeader @select="switchOption" />
    <br>
    <materialsInformRecordBody v-if="select === '記錄'" />
    <materialsInformSheet v-if="select === '表單'" />
  </div>
</template>

<script>
import materialsInformRecordHeader from './materialsInformRecordHeader.vue'
import materialsInformRecordBody from './materialsInformRecordBody.vue'
import materialsInformSheet from './materialsInformSheet.vue'
export default {
  components: {
    materialsInformRecordHeader: materialsInformRecordHeader,
    materialsInformRecordBody: materialsInformRecordBody,
    materialsInformSheet: materialsInformSheet
  },
  data () {
    return {
      select: '記錄'
    }
  },
  methods: {
    switchOption (value) {
      this.select = value.option
    }
  }
}
</script>
