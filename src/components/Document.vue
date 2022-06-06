<script setup lang="ts">
import Api from '../Api'
import { EditRound, EditOffRound, SaveAltRound, CopyAllRound } from '@vicons/material'
import { Bytes, ethers } from "ethers"
import { FormInst, useLoadingBar, useMessage } from 'naive-ui'
import { reactive, ref } from 'vue';

const data = defineProps<{ collectionName: string, documentId: string, rawDoc: any }>()
const emit = defineEmits(['clone']);
let rawDocument = reactive(<any>{})
let editing = ref(false)
for (let i in data.rawDoc) {
    if (i != '_id') {
        rawDocument[i] = data.rawDoc[i]
    }
}
let modDic = reactive(<any>{})
let active = ref(false)
let hover = ref(false);
const formRef = ref<FormInst | null>(null)
const loadingBar = useLoadingBar()
const message = useMessage()

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
        if (!checkDuplicatedElementsInModDic(modDic)) {
            loadingBar.error()
            return
        }
        const { ethereum } = (window as any)
        if (!ethereum) {
            loadingBar.error()
            message.error("Go get MetaMask!")
            return;
        } else {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            let address = await signer.getAddress()
            let msg = await Api.getMessageToSign(address)
            let signature = await signer.signMessage(msg as string | Bytes)
            let res = await Api.editDocument(address, signature, data.collectionName, data.documentId, modDic)
            if (res == 400) {
                editing.value = false
                loadingBar.error()
                message.error("Edit failed to be saved! Please check your edit and try again.")
                return
            }
            // update rawDocument to display the new document
            for (let i in modDic) {
                delete rawDocument[i]
                rawDocument[i] = modDic[i]
            }
            editing.value = false
            loadingBar.finish()
            message.success("Edit saved successfully!")
            return
        }
    } catch (error: any) {
        loadingBar.error()
        message.error(error.message)
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
        if (!checkDuplicatedElementsInModDic(modDic)) {
            loadingBar.error()
            return
        }
        const { ethereum } = (window as any)
        if (!ethereum) {
            loadingBar.error()
            message.error("Go get MetaMask!")
            return;
        } else {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            let address = await signer.getAddress()
            let msg = await Api.getMessageToSign(address)
            let signature = await signer.signMessage(msg as string | Bytes)
            let res = await Api.newDocument(address, signature, data.collectionName, modDic)
            if (res[0] == 400) {
                active.value = false
                loadingBar.error()
                message.error("Clone failed to be saved! Please check your fields and try again.")
                return
            }
            let returnDic = modDic
            returnDic._id = res[1]
            active.value = false
            loadingBar.finish()
            message.success("Clone saved successfully!")
            emit('clone', returnDic)
            return
        }
    } catch (error: any) {
        loadingBar.error()
        message.error(error.message)
    }
    active.value = false
}

function checkDuplicatedElementsInModDic(modDic: any): boolean {
    for (let fieldName in modDic) {
        if (Array.isArray(modDic[fieldName]) && typeof modDic[fieldName][0] == 'string') {
            let dic: any = {}
            for (let i of modDic[fieldName]) {
                if (i in dic) {
                    message.warning("Duplicated element detected: " + i + " in " + fieldName)
                    return false
                } else {
                    dic[i] = 0
                }
            }
        }
    }
    return true
}
</script>

<template>
    <n-card @mouseenter="hover = true" @mouseleave="hover = false"
        :style="editing ? { border: '1px solid #f2c97d' } : hover ? { border: '1px solid #63e2b7' } : { border: '' }">
        <n-form :ref="formRef" :model="modDic" :label-placement="editing ? 'top' : 'left'" size="small"
            label-width="auto" :style="{'margin-bottom':'-20px'}">
            <n-form-item class="document_form" v-for="(fieldValue, key) in rawDocument" :key="key"
                :label="key.toString().slice(0, 1).toUpperCase() + key.toString().slice(1,)" :path="key.toString()"
                :style="{ 'margin-bottom': '-15px', 'align-items': 'start' }">
                <n-scrollbar x-scrollable>
                    <template v-if="editing == false">
                        <div>
                            {{ fieldValue }}
                        </div>
                    </template>
                    <!-- string -->
                    <template v-else-if="typeof fieldValue == 'string'">
                        <n-input v-model:value="modDic[key.toString()]" :placeholder="fieldValue" />
                    </template>
                    <!-- number -->
                    <template v-else-if="typeof fieldValue == 'number'">
                        <n-input-number v-model:value="modDic[key.toString()]" :placeholder="fieldValue.toString()"
                            :validator="(x: number) => x >= 0" :style="{ width: '100%' }" />
                    </template>
                    <!-- boolean -->
                    <template v-else-if="typeof fieldValue == 'boolean'">
                        <n-switch v-model:value="modDic[key.toString()]" />
                    </template>
                    <!-- array -->
                    <template
                        v-else-if="Array.isArray(fieldValue) && (typeof fieldValue[0] == 'string' || fieldValue.length == 0)">
                        <n-dynamic-input v-model:value="modDic[key.toString()]" />
                    </template>
                    <!-- array of object -->
                    <template v-else-if="Array.isArray(fieldValue) && typeof fieldValue[0] == 'object'">
                        <n-dynamic-input v-model:value="modDic[key.toString()]" :on-create="() => {
                            return {
                                asset: '',
                                weightControlOn: false,
                                weightMin: 0,
                                weightMax: 0,
                                quantityControlOn: false,
                                quantityMin: '',
                                quantityMax: '',
                            }
                        }">
                            <template #default="{ value }">
                                <div style="display: flex; align-items: center; width: 100%">
                                    <n-input v-model:value="value.asset" placeholder="Asset" type="text"
                                        style="margin-right: 8px; width:17%" />
                                    <n-switch v-model:value="value.weightControlOn" style="margin-right: 3px" />
                                    <n-input-number v-model:value="value.weightMin" placeholder="weightMin"
                                        :show-button="false" style="margin-right: 3px; width:17%" />
                                    <n-input-number v-model:value="value.weightMax" placeholder="weightMax"
                                        :show-button="false" style="margin-right: 8px; width:17%" />
                                    <n-switch v-model:value="value.quantityControlOn" style="margin-right: 3px" />
                                    <n-input v-model:value="value.quantityMin" placeholder="quantityMin"
                                        :show-button="false" style="margin-right: 3px; width:17%" />
                                    <n-input v-model:value="value.quantityMax" placeholder="quantityMax"
                                        :show-button="false" style="margin-right: -15px; width:17%" />
                                </div>
                            </template>
                        </n-dynamic-input>
                    </template>
                </n-scrollbar>
            </n-form-item>
        </n-form>


        <template #action>
            <n-space>
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleEditClick" :disabled="editing">
                            <template #icon>
                                <n-icon>
                                    <EditRound />
                                </n-icon>
                            </template>
                        </n-button>
                    </template>
                    Edit
                </n-tooltip>
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleCloneClick" :disabled="editing">
                            <template #icon>
                                <n-icon>
                                    <CopyAllRound />
                                </n-icon>
                            </template>
                        </n-button>
                    </template>
                    Clone
                </n-tooltip>
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleCancelEditClick" :disabled="!editing">
                            <template #icon>
                                <n-icon>
                                    <EditOffRound />
                                </n-icon>
                            </template>
                        </n-button>
                    </template>
                    Cancel Edit
                </n-tooltip>
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleSaveEditClick" :disabled="!editing">
                            <template #icon>
                                <n-icon>
                                    <SaveAltRound />
                                </n-icon>
                            </template>
                        </n-button>
                    </template>
                    Save Edit
                </n-tooltip>
            </n-space>
        </template>
    </n-card>

    <n-drawer v-model:show="active" :width="430">
        <n-drawer-content title="Clone Document" closable>
            <n-scrollbar>
                <n-form :ref="formRef" :model="modDic" label-placement="top" size="small" label-width="auto"
                    :style="{ width: '100%' }">
                    <n-form-item class="document_form" v-for="(fieldValue, key) in rawDocument" :key="key"
                        :label="key.toString().slice(0, 1).toUpperCase() + key.toString().slice(1,)"
                        :path="key.toString()">
                        <!-- string -->
                        <template v-if="typeof fieldValue == 'string'">
                            <n-input v-model:value="modDic[key.toString()]" :placeholder="fieldValue" />
                        </template>
                        <!-- number -->
                        <template v-else-if="typeof fieldValue == 'number'">
                            <n-input-number v-model:value="modDic[key.toString()]" :placeholder="fieldValue.toString()"
                                :style="{ width: '100%' }" :validator="(x: number) => x >= 0" />
                        </template>
                        <!-- boolean -->
                        <template v-else-if="typeof fieldValue == 'boolean'">
                            <n-switch v-model:value="modDic[key.toString()]" />
                        </template>
                        <!-- array -->
                        <template
                            v-else-if="Array.isArray(fieldValue) && (typeof fieldValue[0] == 'string' || fieldValue.length == 0)">
                            <n-dynamic-input v-model:value="modDic[key.toString()]" />
                        </template>
                        <!-- array of object -->
                        <template v-else-if="Array.isArray(fieldValue) && typeof fieldValue[0] == 'object'">
                            <n-dynamic-input v-model:value="modDic[key.toString()]" :on-create="() => {
                            return {
                                asset: '',
                                weightControlOn: false,
                                weightMin: 0,
                                weightMax: 0,
                                quantityControlOn: false,
                                quantityMin: '',
                                quantityMax: '',
                            }
                        }">
                                <template #default="{ value }">
                                    <div style="display: flex; align-items: center; width: 100%">
                                        <n-input v-model:value="value.asset" placeholder="Asset" type="text"
                                            style="margin-right: 8px; width:17%" />
                                        <n-switch v-model:value="value.weightControlOn" style="margin-right: 3px" />
                                        <n-input-number v-model:value="value.weightMin" placeholder="weightMin"
                                            :show-button="false" style="margin-right: 3px; width:17%" />
                                        <n-input-number v-model:value="value.weightMax" placeholder="weightMax"
                                            :show-button="false" style="margin-right: 8px; width:17%" />
                                        <n-switch v-model:value="value.quantityControlOn" style="margin-right: 3px" />
                                        <n-input v-model:value="value.quantityMin" placeholder="quantityMin"
                                            :show-button="false" style="margin-right: 3px; width:17%" />
                                        <n-input v-model:value="value.quantityMax" placeholder="quantityMax"
                                            :show-button="false" style="margin-right: -15px; width:17%" />
                                    </div>
                                </template>
                            </n-dynamic-input>
                        </template>
                    </n-form-item>
                </n-form>
            </n-scrollbar>
            <template #footer>
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button primary circle @click="handleSaveCloneClick">
                            <template #icon>
                                <n-icon>
                                    <SaveAltRound />
                                </n-icon>
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
</style>