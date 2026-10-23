<template>
  <div class="page-container" style="align-items:center;justify-content:center;">
    <el-result icon="warning" title="403 无权访问" sub-title="当前演示角色无权访问该页面，可切换角色后重试">
      <template #extra>
        <el-button type="primary" @click="$router.push('/entry')">返回统一入口</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
</script>
