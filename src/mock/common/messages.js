// 待办与消息（演示数据，随角色过滤）

export const TODOS = [
  {
    id: 'TD-0001',
    title: '【青贮备案】太和县丰乐种植专业合作社提交收储申报，请审核',
    type: 'audit',
    subsystem: 'sil',
    route: '/sil/audit',
    regionCode: '341222',
    time: '2026-09-29 09:32',
    urgent: true
  },
  {
    id: 'TD-0002',
    title: '【事件核查】FSR-2026-0012 毁麦毁粮疑似图斑待派发任务',
    type: 'dispatch',
    subsystem: 'fsr',
    route: '/fsr/events',
    regionCode: '341222',
    time: '2026-09-29 08:15',
    urgent: true
  },
  {
    id: 'TD-0003',
    title: '【计划下达】2026年度粮食生产计划已完成省级审核，请下达',
    type: 'issue',
    subsystem: 'gpm',
    route: '/gpm/decompose',
    regionCode: '340000',
    time: '2026-09-28 16:40'
  },
  {
    id: 'TD-0004',
    title: '【进度填报】旧县镇秋收进度填报即将超期（9月30日截止）',
    type: 'fill',
    subsystem: 'gpm',
    route: '/gpm/progress',
    regionCode: '341222104',
    time: '2026-09-28 14:20',
    urgent: true
  },
  {
    id: 'TD-0005',
    title: '【农药预警】太和县皖丰农资经营部草甘膦批次库存异常',
    type: 'alert',
    subsystem: 'pes',
    route: '/pes/ledger',
    regionCode: '341222',
    time: '2026-09-27 11:05'
  },
  {
    id: 'TD-0006',
    title: '【超期督办】FSR-2026-0007 撂荒图斑核查任务已超期2天',
    type: 'urge',
    subsystem: 'fsr',
    route: '/fsr/task',
    regionCode: '341200',
    time: '2026-09-27 09:00',
    urgent: true
  }
]

export const MESSAGES = [
  { id: 'MSG-0001', title: '省厅发布关于做好秋收秋种工作的通知', time: '2026-09-29 10:00', read: false, type: 'notice' },
  { id: 'MSG-0002', title: '气象预警：阜阳市未来三天有中到大雨，请注意防范', time: '2026-09-28 18:30', read: false, type: 'warn' },
  { id: 'MSG-0003', title: '2026年度粮食生产计划（送审稿）已退回，请修改后重新提交', time: '2026-09-28 15:12', read: false, type: 'audit' },
  { id: 'MSG-0004', title: '系统将于10月1日凌晨进行例行维护，请提前保存数据', time: '2026-09-27 09:00', read: true, type: 'notice' },
  { id: 'MSG-0005', title: '第三季度粮食安全事件复盘报告已生成，请查收', time: '2026-09-26 16:45', read: true, type: 'notice' }
]
