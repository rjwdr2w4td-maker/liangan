<template>
  <div class="mobile-shell">
    <div class="phone-wrap">
      <div class="phone-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-shell {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background:
    radial-gradient(1200px 500px at 20% -10%, rgba(15, 94, 181, 0.12), transparent),
    radial-gradient(800px 400px at 90% 110%, rgba(38, 166, 154, 0.1), transparent),
    var(--ah-bg);
  overflow: auto;
  padding: 20px 0;
}

.phone-wrap {
  width: 390px;
  height: 780px;
  max-width: none;
  max-height: none;
  box-sizing: border-box;
  border-radius: 44px;
  border: 10px solid #1a2332;
  box-shadow:
    0 0 0 2px #39465c,
    0 24px 60px rgba(9, 27, 51, 0.35);
  overflow: hidden;
  position: relative;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.phone-content {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
}

.phone-content > :deep(.mobile-page) {
  width: 100%;
  min-width: 0;
  min-height: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

</style>
