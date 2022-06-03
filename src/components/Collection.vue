<script setup lang="ts">
    import { computed } from 'vue';
    import Document from './Document.vue'
    import { AddCircleOutlineRound } from '@vicons/material'

    let data = defineProps<{ rawCollection: any[], collectionName: string, selectedSource: string }>()

    function handleAddDocumentClick() {
        console.log("under development")
    }

    const filtedRawCollection = computed(() => {
        if (data.selectedSource == "all") {
            return data.rawCollection
        } else {
            let filtedArray = new Array()
            for (let document of data.rawCollection) {
                let source: string
                switch (data.collectionName) {
                    case "chain_evm_configs":
                        source = document.chainName
                        break;
                    case "evm_sgm_configs":
                    case "sources":
                        source = document.name
                        break;
                    case "evm_workers":
                        source = document.chain
                        break;
                    case "obex_trading_pairs":
                        source = document.exchangeName
                        break;
                    case "source_position_controls":
                        source = document.sourceName
                        break;
                    default:
                        source = document.source
                        break;
                }
                if (source == data.selectedSource) {
                    filtedArray.push(document)
                }
            }
            return filtedArray
        }
    })
</script>

<template>
    <n-scrollbar x-scrollable>
        <n-grid :x-gap="10" :y-gap="10" cols="1 s:1 m:2 l:3 xl:4" responsive="screen">
            <n-gi>
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-button class="add_document_card" @click="handleAddDocumentClick" dashed>
                            <n-icon size="35px">
                                <AddCircleOutlineRound />
                            </n-icon>
                        </n-button>
                    </template>
                    Insert Document
                </n-tooltip>
            </n-gi>
            <n-gi v-for="document in filtedRawCollection" :key="document._id" >
                <n-loading-bar-provider>
                    <Document :collectionName=collectionName :documentId="document._id" :rawDoc=document />
                </n-loading-bar-provider>
            </n-gi>
        </n-grid>
    </n-scrollbar>
</template>

<style>
.add_document_card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
</style>