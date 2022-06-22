<script setup lang="ts">
import Collection from './components/Collection.vue'
import Api from './Api'
import { darkTheme } from 'naive-ui';
import { LightModeOutlined, DarkModeOutlined, AddCircleOutlineRound, DnsOutlined } from '@vicons/material'
import { ref, onMounted, reactive } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';

const { loginWithRedirect, logout, getAccessTokenSilently, user, isAuthenticated } = useAuth0();
let serverError = ref(false)
let active = ref(true)
let theme = ref<typeof darkTheme | null>(darkTheme);
let selectedSource = ref<string | null>(null)
let rawDB: any = reactive({})
let sourceList: any[] = reactive([])
let collectionList: string[] = reactive([])

function HandleAddCollectionClick() {
  console.log("under development")
}

function Login() {
  loginWithRedirect();
}

function Logout() {
  logout({ returnTo: window.location.origin });
}

async function DoSomeThingWithToken() {
  const token = await getAccessTokenSilently();
  console.log(token)
}

onMounted(async () => {
  try {
    const token = await getAccessTokenSilently();
    let db = await Api.getDB(token)
    for (let index in db) {
      rawDB[index] = db[index]
      collectionList.push(index)
    }
    let sl = await Api.getSourceList(token)
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
      <!-- Authorization Manageable db Platform to Leverage Efficiency -->
      <n-page-header subtitle="">
        <n-divider></n-divider>
        <template #title>
          <!-- <a style="text-decoration: none; color: inherit">
            AMPLE
          </a> -->
          <div style="margin-left: -10px; margin-bottom: -10px">
            AMPLE
          </div>
        </template>
        <template #avatar>
          <img v-if="theme == null" src="./assets/hashwave_light_transparent.png"
            alt="Vue logo" height="45">
          <img v-else src="./assets/hashwave_dark_transparent.png" alt="Vue logo"
            height="45">
        </template>
        <template #extra>
          <n-space>
            <n-select size="small" clearable v-model:value="selectedSource" :options="isAuthenticated ? sourceList : []"
              placeholder="Please Select a Source" :style="{
                minWidth: '185px'
              }" />
            <n-switch v-model:value="active" size="large" @click="theme == null ? (theme = darkTheme) : (theme = null)">
              <template #checked-icon>
                <n-icon :component="DarkModeOutlined" />
              </template>
              <template #unchecked-icon>
                <n-icon :component="LightModeOutlined" />
              </template>
            </n-switch>
            <n-button size="small" v-if="isAuthenticated" @click="Logout">Log out</n-button>
            <n-button size="small" v-else @click="Login">Log in</n-button>
          </n-space>
        </template>
      </n-page-header>
      <n-result v-if="!isAuthenticated" status="403" title="403 Forbidden"
        description="Seems like you are not logged in.">
        <n-divider></n-divider>
      </n-result>
      <n-result v-else-if="isAuthenticated && serverError" status="500" title="500 Server Error"
        description="Please go check your server!">
        <n-divider></n-divider>
      </n-result>
      <div v-else-if="isAuthenticated && !serverError">
        <n-collapse>
          <template #arrow>
            <n-icon>
              <DnsOutlined />
            </n-icon>
          </template>
          <n-collapse-item :name="collectionName.toString()" :title="collectionName.toString()"
            v-for="(collection, collectionName) in rawDB" :key="collectionName">
            <template #header-extra>
              Total Documents: {{ collection.length }}
            </template>
            <Collection :rawCollection=collection :collectionName=collectionName.toString()
              :selectedSource="selectedSource ? selectedSource.toString() : 'all'" />
          </n-collapse-item>
        </n-collapse>
        <n-divider></n-divider>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button class="add_collection_card" @click="DoSomeThingWithToken" dashed>
              <n-icon size="35px">
                <AddCircleOutlineRound />
              </n-icon>
            </n-button>
          </template>
          Insert Collection
        </n-tooltip>
      </div>
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
