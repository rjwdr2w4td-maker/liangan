<template>
  <div class="mobile-page" role="main" aria-label="皖政通粮食计划管理">
    <div class="mobile-head">
      <button class="back-button" @click="$router.back()">‹</button>
      <div><b>粮食计划管理</b><span>进度填报、政策查询与灾情处置</span></div>
    </div>

    <section class="summary-card">
      <div class="summary-icon">粮</div>
      <div><b>粮食生产进度协同</b><p>基层填报，上级审核，异常数据及时修正和督办。</p></div>
    </section>

    <div class="feature-grid">
      <button class="feature-card progress" @click="$router.push('/mobile/wzt-progress')">
        <span class="feature-icon">进</span><strong>进度填报</strong><small>查看播种与收获进度数据</small>
      </button>
      <button class="feature-card policy" @click="$router.push('/mobile/wzt-policies')">
        <span class="feature-icon">惠</span><strong>惠农政策</strong><small>惠农政策发布与快速查询</small>
      </button>
      <button class="feature-card disaster" @click="$router.push('/mobile/wzt-disaster')">
        <span class="feature-icon">灾</span><strong>灾情上报</strong><small>点击填报灾情信息，提交现场图文</small>
      </button>
    </div>

    <section class="notice-card">
      <div class="section-title"><b>工作提醒</b><span>实时同步</span></div>
      <div class="notice-row"><i class="warning-dot"></i><div><b>待审核进度填报 3 条</b><p>请及时核验乡镇上报的播种与收获数据。</p></div></div>
      <div class="notice-row"><i class="info-dot"></i><div><b>最新惠农政策</b><p>点击惠农政策查看补贴、保险和农机购置等政策。</p></div></div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.mobile-page{width:100%;min-height:100%;box-sizing:border-box;background:#f5f7fa;padding:14px;overflow-x:hidden}.mobile-head{display:flex;align-items:center;gap:8px;background:#fff;border-radius:14px;padding:14px 12px;color:#1f3c68}.mobile-head b{display:block;font-size:20px}.mobile-head span{display:block;color:#667085;font-size:12px;margin-top:4px}.back-button{border:0;background:none;font-size:36px;line-height:1;color:#333;padding:0 8px 4px 0}.summary-card{display:flex;align-items:center;gap:12px;margin:12px 0;background:linear-gradient(135deg,#eaf6f1,#f8fbfa);border:1px solid #d6eee5;border-radius:14px;padding:16px;color:#176b58}.summary-icon{width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:#42a85a;color:#fff;font-size:22px;font-weight:700}.summary-card b{font-size:15px}.summary-card p{margin:5px 0 0;color:#667085;font-size:12px;line-height:1.5}.feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.feature-card{border:0;border-radius:14px;padding:16px 12px;text-align:left;min-height:145px;color:#fff;cursor:pointer;box-shadow:0 5px 12px rgba(31,52,73,.08)}.feature-card.progress{background:linear-gradient(135deg,#3478c7,#4a96df)}.feature-card.policy{background:linear-gradient(135deg,#2d8c72,#45b18d)}.feature-card.disaster{grid-column:span 2;background:linear-gradient(135deg,#e16a54,#ef9360);min-height:120px}.feature-icon{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.2);font-size:18px;font-weight:700}.feature-card strong,.feature-card small{display:block}.feature-card strong{font-size:16px;margin-top:13px}.feature-card small{font-size:12px;line-height:1.5;opacity:.9;margin-top:6px}.notice-card{background:#fff;border-radius:14px;padding:16px;margin-top:12px}.section-title{display:flex;justify-content:space-between;align-items:center;color:#243b5a;margin-bottom:8px}.section-title span{font-size:11px;color:#98a2b3}.notice-row{display:flex;gap:10px;border-top:1px solid #edf0f5;padding:12px 0}.notice-row b{font-size:13px;color:#344054}.notice-row p{font-size:12px;color:#667085;line-height:1.5;margin:4px 0 0}.warning-dot,.info-dot{width:8px;height:8px;flex:0 0 8px;border-radius:50%;margin-top:5px}.warning-dot{background:#f59e0b}.info-dot{background:#3b82f6}
</style>
