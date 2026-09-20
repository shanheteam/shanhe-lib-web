<template>
  <div class="com-form-userinfo">
    <el-row>
      <el-col :span="10" class="text-center">
        <img
          class="profile-avatar"
          :src="assetUrl(user.avatar)"
          alt="avatar"
          @error="onAvatarError"
        />
        <!-- 上传成功之后，重新获取用户资料 -->
        <div>
          <h3>{{ user.realname || '未命名用户' }}</h3>
        </div>
      </el-col>
      <el-col :span="14">
        <el-descriptions class="margin-top" :column="1">
          <el-descriptions-item>
            <template #label>
              <el-icon><Clock /></el-icon>
              <span> 注册时间</span>
            </template>
            {{ formatDatetime(user.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <el-icon><Clock /></el-icon>
              <span> 最后登录</span>
            </template>
            {{ formatDatetime(user.login_at) }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <el-icon><Location /></el-icon>
              <span> 登录IP</span>
            </template>
            {{ user.last_login_ip || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
    <el-form label-width="80px">
          <el-form-item label="真实姓名">
            <div class="field-with-edit">
              <el-input v-model="user.realname" disabled></el-input>
              <el-button link type="primary" tag="a" href="https://user.shanhe.co/profile" target="_blank">修改</el-button>
            </div>
          </el-form-item>
          <el-form-item label="学号">
            <el-input :model-value="user.student_id || '-'" disabled></el-input>
          </el-form-item>
          <el-form-item label="联系邮箱">
            <div class="field-with-edit">
              <el-input v-model="user.email" disabled></el-input>
              <el-button link type="primary" tag="a" href="https://user.shanhe.co/profile" target="_blank">修改</el-button>
            </div>
          </el-form-item>
          <el-form-item label="联系电话">
            <div class="field-with-edit">
              <el-input v-model="user.mobile" disabled></el-input>
              <el-button link type="primary" tag="a" href="https://user.shanhe.co/profile" target="_blank">修改</el-button>
            </div>
          </el-form-item>
          <el-form-item label="联系地址">
            <div class="field-with-edit">
              <el-input
                v-model="user.address"
                type="textarea"
                :disabled="editing !== 'address'"
                :autosize="{ minRows: 2 }"
              ></el-input>
              <el-button link type="primary" @click="toggleEdit('address')">
                {{ editing === 'address' ? '保存' : '修改' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="个性签名">
            <div class="field-with-edit">
              <el-input
                v-model="user.signature"
                type="textarea"
                :disabled="editing !== 'signature'"
                :autosize="{ minRows: 2 }"
              ></el-input>
              <el-button link type="primary" @click="toggleEdit('signature')">
                {{ editing === 'signature' ? '保存' : '修改' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { formatDatetime } from '@/utils/utils'
import { assetUrl } from '@/utils/asset'

defineOptions({ name: 'FormUserinfo' })

const userStore = useUserStore()
const user = computed(() => userStore.user)
// 联系地址/个性签名 的就地编辑状态：'address' | 'signature' | ''
const editing = ref<'address' | 'signature' | ''>('')

const onAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/static/images/avatar.png'
}

const saveField = async () => {
  const field = editing.value
  if (!field) return
  editing.value = ''
  await userStore.updateUserProfile({ [field]: user.value[field] })
}

const toggleEdit = (field: 'address' | 'signature') => {
  if (editing.value === field) {
    saveField()
  } else {
    editing.value = field
  }
}
</script>
