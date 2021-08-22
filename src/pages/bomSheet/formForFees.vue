<template>
  <div id="container" class="my-font-medium bg-grey-1">
    <section>
      <q-input
        square
        outlined
        no-error-icon
        clearable
        filled
        v-model="formDataForFees.費用名稱"
        label="費用名稱"
        class="col"
        :rules="[ val => (val !== null && val !== '' && val !== '運費' && val !== '其他費用') || '費用名稱 輸入無效' ]"
      />

      <div class="row justify-center">
        <!-- :rules="[ val => (val !== null || val !== '') || '數量 為空值' ]" -->
        <!-- v-model="數量" -->
        <q-input
          square
          outlined
          no-error-icon
          clearable
          filled
          v-bind:value="formDataForFees[elem]"
          v-on:input="formDataForFees[elem] = $event"
          :label="elem"
          type="number"
          class="col-3"
          :rules="[ val => (val !== null && val !== '') || `${elem} 輸入無效` ]"
          v-if="elem !== '費用名稱' && elem !== '備註'"
          v-for="(elem, index) in Object.keys(formDataForFees)"
          :key="index"
        />

        <!-- :rules="[ val => (val !== '運費' && val !== '其他費用') || '備註 輸入無效' ]" -->
        <q-input
          square
          outlined
          no-error-icon
          clearable
          filled
          v-model="formDataForFees.備註"
          label="備註"
          class="col-3"
          :rules="[ val => (!Boolean(val) || val.length === 0 || val.length > 0) || '' ]"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { Notify, SessionStorage } from 'quasar'
export default {
  props: ['clickAddRowForFeesOnTable', 'resetFormForFees'],
  data () {
    return {
      formDataForFees: {
        費用名稱: undefined,
        數量: undefined,
        單價: undefined,
        複價: undefined,
        備註: undefined
      }
    }
  },
  watch: {
    resetFormForFees (value) {
      // Object.keys(this.formDataForFees).forEach(elem => {
      //   this.formDataForFees[elem] = undefined
      // })
      onReset(this.formDataForFees)
    },
    clickAddRowForFeesOnTable (value) {
      const { incorrectElemIndex, isValid } = isInputValid(this.formDataForFees)
      if (isValid) {
        SessionStorage.set('formDataForFees', this.formDataForFees)
        this.$emit('addRowForFeesOnTable')
        onReset(this.formDataForFees)
      } else {
        notify('negative', `${Object.keys(this.formDataForFees)[incorrectElemIndex]} 輸入無效`)
      }
    }
  }
}

function isInputValid (formDataForFees) {
  const formDataValue = []
  Object.keys(formDataForFees).forEach(elem => {
    if ((formDataForFees[elem] === '運費' || formDataForFees[elem] === '其他費用') && elem === '費用名稱') {
      formDataValue.splice(formDataValue.length, 0, false)
    } else if (elem !== '備註') {
      formDataValue.splice(formDataValue.length, 0, formDataForFees[elem])
    }
  })
  const incorrectElemIndex = formDataValue.findIndex(elem => !elem), isValid = incorrectElemIndex === -1
  return { incorrectElemIndex: incorrectElemIndex, isValid: isValid }
}

function onReset (formDataForFees) {
  Object.keys(formDataForFees).forEach(elem => {
    formDataForFees[elem] = undefined
  })
}

function notify (type, message) {
  Notify.create({
    type: type,
    message: message
  })
}
</script>
