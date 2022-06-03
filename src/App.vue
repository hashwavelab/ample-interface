<script setup lang="ts">
  import Collection from './components/Collection.vue'
  import Api from './Api'
  import { darkTheme } from 'naive-ui';
	import { LightModeOutlined, DarkModeOutlined, AddCircleOutlineRound, DnsOutlined } from '@vicons/material'
  import { ref, onMounted, reactive } from 'vue';
  
  let serverError = ref(false)
  let active = ref(true)
  let theme = ref<typeof darkTheme | null>(darkTheme);
  let selectedSource = ref<string | null>(null)
  let rawDB: any = reactive({})
  let sourceList: any[] = reactive([])
  let collectionList: string[] = reactive([])

  function handleAddCollectionClick() {
    console.log("under development")
  }

  onMounted(async () => {
    try {
      let db = await Api.getDB()
      for (let index in db) {
        rawDB[index] = db[index]
        collectionList.push(index)
      }
      let sl = await Api.getSourceList()
      for (let i of sl) {
        sourceList.push({
          label: i,
          value: i
        })
      }      
    } catch (error) {
      console.log(error)
      serverError.value = true
    }
  })
</script>

<template>
  <n-config-provider :theme="theme">
    <n-card class="body" :bordered="false">
      <n-page-header subtitle="Authorization Manageable Platform to Leverage Efficiency">
        <n-divider></n-divider>
        <template #title>
          <a style="text-decoration: none; color: inherit">
            AMPLE
          </a>
        </template>
        <template #extra>
          <n-space>
            <n-select 
              size="small" 
              clearable
              v-model:value="selectedSource" 
              :options="sourceList" 
              placeholder="Please Select a Source" 
              :style="{
                minWidth: '185px'
              }"  
            />
            <n-switch 
              v-model:value="active" 
              size="large" 
              @click="theme == null ? (theme = darkTheme) : (theme = null)">
              <template #checked-icon>
                <n-icon :component="DarkModeOutlined" />
              </template>
              <template #unchecked-icon>
                <n-icon :component="LightModeOutlined" />
              </template>
            </n-switch>
          </n-space>
        </template>
      </n-page-header>
      <n-collapse>
        <template #arrow>
          <n-icon>
            <DnsOutlined />
          </n-icon>
        </template>
        <n-collapse-item :name="collectionName.toString()" :title="collectionName.toString()" v-for="(collection , collectionName) in rawDB" :key="collectionName">
          <template #header-extra>
            Total Documents: {{collection.length}}
          </template>
          <Collection :rawCollection=collection :collectionName=collectionName.toString() :selectedSource="selectedSource ? selectedSource.toString() : 'all'" />
        </n-collapse-item>
      </n-collapse>
      <n-result
        v-if="serverError"
        status="500"
        title="500 Server Error"
        description="Please go check your server!"
      >
      </n-result>
      <n-divider></n-divider>
      <n-tooltip trigger="hover" v-if="!serverError">
        <template #trigger>
          <n-button class="add_collection_card" @click="handleAddCollectionClick" dashed>
            <n-icon size="35px">
              <AddCircleOutlineRound />
            </n-icon>
          </n-button>
        </template>
        Insert Collection
      </n-tooltip>
    </n-card>
  </n-config-provider>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: start;
  color: #000000;
  background-color: #19191b;
  height: 100vh;
  margin-top: 0px;
}
.body {
  height: auto;
}
.add_collection_card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 55px;
  width: 100%;
}
</style>
