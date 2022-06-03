<script setup lang="ts">
    import Api from '../Api'
    import { EditRound, EditOffRound, SaveAltRound, CopyAllRound } from '@vicons/material'
    import { Bytes, ethers } from "ethers"
    import { FormInst, useLoadingBar} from 'naive-ui'
    import { reactive, ref } from 'vue';

    let data = defineProps<{ collectionName: string, documentId: string, rawDoc: any }>()
    let rawDocument = reactive(<any>{})
    let editing = ref(false)
    for (let i in data.rawDoc) {
        if (i != '_id') {
            rawDocument[i] = data.rawDoc[i]
        }
    }
    let modDic = reactive(<any>{})
    const formRef = ref<FormInst | null>(null)
    const loadingBar = useLoadingBar()
    let active = ref(false)
    let hover = ref(false);

    function handleCancelEditClick() {
        editing.value = false
    }

    function handleEditClick() {
        for (let i in rawDocument) {
            delete modDic[i]
            modDic[i] = rawDocument[i]
        }
        editing.value = true
    }

    async function handleSaveEditClick() {
        try {
            loadingBar.start()
            const { ethereum } = (window as any)
            if (!ethereum) {
                alert("Get MetaMask!");
                loadingBar.error()
                return;
            } else {
                const accounts = await ethereum.request({ method: "eth_requestAccounts" });
                console.log("Account found: ", accounts[0]);
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                let address = await signer.getAddress()
                let msg = await Api.getMessageToSign(address)
                let signature = await signer.signMessage(msg as string | Bytes)
                let res = await Api.editDocument(address, signature, data.collectionName, data.documentId, modDic)
                if (res == 400) {
                    console.log("Edit failed to be saved! Please check your edit and try again.")
                    editing.value = false
                    loadingBar.error()
                    return
                }
                console.log("Edit saved successfully!")
                editing.value = false
                loadingBar.finish()
                return
            }
        } catch (error) {
            loadingBar.error()
        }
    }

    function handleCloneClick() {
        for (let i in rawDocument) {
            modDic[i] = rawDocument[i]
        }
        active.value = true
    }

    async function handleSaveCloneClick() {
        try {
            loadingBar.start()
            const { ethereum } = (window as any)
            if (!ethereum) {
                alert("Get MetaMask!");
                loadingBar.error()
                return;
            } else {
                const accounts = await ethereum.request({ method: "eth_requestAccounts" });
                console.log("Account found: ", accounts[0]);
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                let address = await signer.getAddress()
                let msg = await Api.getMessageToSign(address)
                let signature = await signer.signMessage(msg as string | Bytes)
                console.log(address, signature, data.collectionName, modDic)
                let res = await Api.newDocument(address, signature, data.collectionName, modDic)
                if (res == 400) {
                    console.log("Clone failed to be saved! Please check your fields and try again.")
                    active.value = false
                    loadingBar.error()
                    return
                }
                console.log("Clone saved successfully!")
                active.value = false
                loadingBar.finish()
                return
            }
        } catch (error) {
            loadingBar.error()
        }
        active.value = false
    }

</script>

<template>
    <n-card @mouseenter="hover = true" @mouseleave="hover = false" :style="editing ? { border:'1px solid #f2c97d' } : hover ? { border:'1px solid #63e2b7' } : { border : '' }">
        <n-scrollbar x-scrollable>
            <n-form
                :ref="formRef"
                :model="modDic"
                label-placement="top"
                size="small"
                label-width="auto"
            >
                <n-form-item
                    class="document_form"
                    v-for="(fieldValue, key) in rawDocument" :key="key"
                    :label="key.toString()"
                    :path="key.toString()"
                >
                    <n-space v-if="editing == false">
                            {{fieldValue}}
                    </n-space>
                    <!-- string -->
                    <template v-else-if="typeof fieldValue == 'string'">
                        <n-input 
                            v-model:value="modDic[key.toString()]" 
                            :placeholder="fieldValue"
                        />
                    </template>
                    <!-- number -->
                    <template v-else-if="typeof fieldValue == 'number'">
                        <n-input-number
                            v-model:value="modDic[key.toString()]"
                            :placeholder="fieldValue.toString()"
                            :validator="(x: number) => x >= 0"
                            :style="{ width: '100%' }"
                        />
                    </template>
                    <!-- boolean -->
                    <template v-else-if="typeof fieldValue == 'boolean'">
                        <n-switch
                            v-model:value="modDic[key.toString()]"
                        />
                    </template>
                    <!-- array -->
                    <template v-else-if="Array.isArray(fieldValue) && (typeof fieldValue[0] == 'string' || fieldValue.length == 0)">
                        <n-dynamic-input
                            v-model:value="modDic[key.toString()]"
                        />
                    </template>
                    <!-- array of object -->
                    <template v-else-if="Array.isArray(fieldValue) && typeof fieldValue[0] == 'object'">
                        <n-dynamic-input 
                            v-model:value="modDic[key.toString()]"
                            :on-create="()=>{
                                return {
                                    asset: '',
                                    weightControlOn: false,
                                    weightMin: 0,
                                    weightMax: 0,
                                    quantityControlOn: false,
                                    quantityMin: '',
                                    quantityMax: '',
                                }
                            }"
                        >
                            <template #default="{ value }">
                                <div style="display: flex; align-items: center; width: 100%">
                                    <n-input v-model:value="value.asset" placeholder="Asset" type="text" style="margin-right: 8px; width:17%" />
                                    <n-switch v-model:value="value.weightControlOn" style="margin-right: 3px" />
                                    <n-input-number v-model:value="value.weightMin" placeholder="weightMin" :show-button="false" style="margin-right: 3px; width:17%" />
                                    <n-input-number v-model:value="value.weightMax" placeholder="weightMax" :show-button="false" style="margin-right: 8px; width:17%" />
                                    <n-switch v-model:value="value.quantityControlOn" style="margin-right: 3px" />
                                    <n-input v-model:value="value.quantityMin" placeholder="quantityMin" :show-button="false" style="margin-right: 3px; width:17%" />
                                    <n-input v-model:value="value.quantityMax" placeholder="quantityMax" :show-button="false" style="margin-right: -15px; width:17%" />
                                </div>
                            </template>
                        </n-dynamic-input>
                    </template>
                </n-form-item>
            </n-form>
        </n-scrollbar>
        
        <template #action>
            <n-space>
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleEditClick" :disabled="editing">
                            <template #icon>
                                <n-icon><EditRound /></n-icon>
                            </template>
                        </n-button>
                    </template>
                    Edit
                </n-tooltip>
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleCloneClick" :disabled="editing">
                            <template #icon>
                                <n-icon><CopyAllRound /></n-icon>
                            </template>
                        </n-button>
                    </template>
                    Clone
                </n-tooltip>
            
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleCancelEditClick" :disabled="!editing">
                            <template #icon>
                                <n-icon><EditOffRound /></n-icon>
                            </template>
                        </n-button>
                    </template>
                    Cancel Edit
                </n-tooltip>
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleSaveEditClick" :disabled="!editing">
                            <template #icon>
                                <n-icon><SaveAltRound /></n-icon>
                            </template>
                        </n-button>
                    </template>
                    Save Edit
                </n-tooltip>
            </n-space>
        </template>
    </n-card>

    <n-drawer
        v-model:show="active"
        :width="430"
    >
        <n-drawer-content title="Clone Document" closable>
            <n-form
                :ref="formRef"
                :model="modDic"
                label-placement="top"
                size="small"
                label-width="auto"
                :style="{
                    width: '100%'
                }"
            >
                <n-form-item
                    class="document_form"
                    v-for="(fieldValue, key) in rawDocument" :key="key"
                    :label="key.toString()"
                    :path="key.toString()"
                >
                    <!-- string -->
                    <template v-if="typeof fieldValue == 'string'">
                        <n-input v-model:value="modDic[key.toString()]" :placeholder="fieldValue"/>
                    </template>
                    <!-- number -->
                    <template v-else-if="typeof fieldValue == 'number'">
                        <n-input-number
                            v-model:value="modDic[key.toString()]"
                            :placeholder="fieldValue.toString()"
                            :style="{ width: '100%' }"
                            :validator="(x: number) => x >= 0"
                        />
                    </template>
                    <!-- boolean -->
                    <template v-else-if="typeof fieldValue == 'boolean'">
                        <n-switch
                            v-model:value="modDic[key.toString()]"
                        />
                    </template>
                    <!-- array -->
                    <template v-else-if="Array.isArray(fieldValue) && (typeof fieldValue[0] == 'string' || fieldValue.length == 0)">
                        <n-dynamic-input
                            v-model:value="modDic[key.toString()]"
                        />
                    </template>
                    <!-- array of object -->
                    <template v-else-if="Array.isArray(fieldValue) && typeof fieldValue[0] == 'object'">
                        <n-dynamic-input 
                            v-model:value="modDic[key.toString()]"
                            :on-create="()=>{
                                return {
                                    asset: '',
                                    weightControlOn: false,
                                    weightMin: 0,
                                    weightMax: 0,
                                    quantityControlOn: false,
                                    quantityMin: '',
                                    quantityMax: '',
                                }
                            }"
                        >
                            <template #default="{ value }">
                                <div style="display: flex; align-items: center; width: 100%">
                                    <n-input v-model:value="value.asset" placeholder="Asset" type="text" style="margin-right: 8px; width:17%" />
                                    <n-switch v-model:value="value.weightControlOn" style="margin-right: 3px" />
                                    <n-input-number v-model:value="value.weightMin" placeholder="weightMin" :show-button="false" style="margin-right: 3px; width:17%" />
                                    <n-input-number v-model:value="value.weightMax" placeholder="weightMax" :show-button="false" style="margin-right: 8px; width:17%" />
                                    <n-switch v-model:value="value.quantityControlOn" style="margin-right: 3px" />
                                    <n-input v-model:value="value.quantityMin" placeholder="quantityMin" :show-button="false" style="margin-right: 3px; width:17%" />
                                    <n-input v-model:value="value.quantityMax" placeholder="quantityMax" :show-button="false" style="margin-right: -15px; width:17%" />
                                </div>
                            </template>
                        </n-dynamic-input>
                    </template>
                </n-form-item>
            </n-form>
            <template #footer>
                    <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleSaveCloneClick">
                            <template #icon>
                                <n-icon><SaveAltRound /></n-icon>
                            </template>
                        </n-button>
                    </template>
                    SaveClone
                </n-tooltip>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<style>
.n-card {
    height: 100%;
}
.document_form {
    margin-bottom: -15px;
}
</style>