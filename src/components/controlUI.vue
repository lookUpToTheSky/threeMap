<template>
  <div class="control-view">
      <!-- <a-radio-group v-model:value="value" @click="changeVal"> -->
    <a-space :size="1" class="space-wrap">
      <a-button
      ghost
      :type="activeVal==item.id?'danger':'primary'"
      :value="item.id" 
      v-for="(item, index) in list" 
      @click="changeVal(item)"
      :key="index">{{item.name}}</a-button>
    </a-space>
      <!-- </a-radio-group> -->
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, Ref} from 'vue'
  import { getAreaList } from '@/api/fetch'
  let activeVal:Ref<string>  = ref("110000")
  let list:Ref<object[]> = ref([])
  const emits = defineEmits<{
    (e: 'changeItem', item: object): void
  }>()
  const getList = async () =>  {
    const data = await getAreaList()
    list.value = data
  }
  const changeVal = (item:object) => {
    activeVal.value = item.id
    emits('changeItem', item)
  }
   onMounted( () => {
    getList()
  })
</script>

<style lang="less" scoped>
.control-view {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 30px;
}
.space-wrap {
  flex-wrap: wrap;
}
    
</style>