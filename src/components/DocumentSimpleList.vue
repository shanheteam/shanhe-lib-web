<template>
  <div class="com-document-simple-list">
    <ul>
      <li v-for="doc in docs" :key="'doc-' + doc.id">
        <el-popover
          v-if="showPopover"
          :placement="placement"
          width="520"
          trigger="hover"
          :open-delay="500"
          @show="getPopoverDocument(doc.id)"
        >
          <document-card
            v-if="activeDocument.id > 0"
            :document="activeDocument"
          />
          <template #reference>
            <router-link
              :target="target"
              :to="`/document/${doc.uuid || doc.id}`"
              class="el-link el-link--default"
            >
              <img
                :src="'/static/images/' + getIcon(doc.ext) + '_24.png'"
                :alt="getIcon(doc.ext) + '文档'"
              />
              {{ doc.title }}
            </router-link>
          </template>
        </el-popover>
        <router-link
          v-else
          :target="target"
          :to="`/document/${doc.uuid || doc.id}`"
          class="el-link el-link--default"
        >
          <img
            :src="'/static/images/' + getIcon(doc.ext) + '_24.png'"
            :alt="getIcon(doc.ext) + '文档'"
          />
          {{ doc.title }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import { getDocument } from '@/api/document'
import { getIcon } from '@/utils/utils'

defineOptions({ name: 'DocumentSimpleList' })
const props = defineProps({
  docs: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  target: {
    type: String,
    default: '_blank',
  },
  showPopover: {
    type: Boolean,
    default: true,
  },
  placement: {
    type: String,
    default: 'left',
  },
})

const documentMap = ref<Record<string, any>>({})
const activeDocument = ref<any>({})

watch(
  () => props.docs,
  (newDocs: any[]) => {
    newDocs.forEach((doc) => {
      documentMap.value[doc.id] = doc
    })
  },
  { immediate: true },
)

const getPopoverDocument = async (id: number) => {
  const doc = documentMap.value[id]
  if (doc) {
    activeDocument.value = doc
    return
  }

  activeDocument.value = { id: 0 }
  if (!props.showPopover) {
    return
  }
  if (documentMap.value[id]) {
    activeDocument.value = documentMap.value[id]
    return
  }

  const res: any = await getDocument({ id, with_author: true })
  activeDocument.value = res.data
  documentMap.value[id] = res.data
}
</script>
