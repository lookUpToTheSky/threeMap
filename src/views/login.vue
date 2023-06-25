<template>
  <div class="login-view">
    <a-form
      :model="formState"
      name="normal_login"
      class="login-form"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        label="用户名"
        name="username"
        :rules="[{ required: true, message: '请输入用户名!' }]"
      >
        <a-input v-model:value="formState.username">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        label="密&emsp;码"
        name="password"
        :rules="[{ required: true, message: '请输入密码!' }]"
      >
        <a-input-password v-model:value="formState.password">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <div class="login-form-wrap">
        <a-form-item name="remember" no-style>
          <a-checkbox v-model:checked="formState.remember"
            >记住我</a-checkbox
          >
        </a-form-item>
        <a class="login-form-forgot" href="">忘记密码？</a>
      </div>

      <a-form-item>
        <a-button
          :disabled="disabled"
          type="primary"
          html-type="submit"
          class="login-form-button"
        >
          登录
        </a-button>
      </a-form-item>  
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed } from "vue";
import { useRouter } from 'vue-router'
interface FormState {
  username: string;
  password: string;
  remember?: boolean;
}

const formState = reactive<FormState>({
  username: "",
  password: "",
  remember: true,
})
let router = useRouter()
const onFinish = (values: FormState) => {
  router.push({ name: 'map'})
};
const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};
const disabled = computed(() => {
  return !(formState.username && formState.password);
});
</script>

<style lang="less" scoped>
.login-view {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #6dbbf6, #3292a3);
  display: flex;
  align-items: center;
  justify-content: center;
  .login-form {
    max-width: 300px;
    background-color: #fff;
    padding: 20px;
  }
  .login-form-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .login-form-forgot {
    margin-bottom: 24px;
  }
  .login-form-button {
    width: 100%;
  }
}
</style>
