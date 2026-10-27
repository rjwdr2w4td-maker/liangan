// 演示角色定义：6 个角色覆盖省/市/县/乡/种植主体/农药经营主体
export const DEMO_ROLES = [
  {
    code: 'province',
    name: '张明',
    unit: '安徽省农业农村厅',
    roleName: '省级管理人员',
    regionCode: '340000',
    regionName: '安徽省',
    subjectId: null,
    homeRoute: '/portal',
    avatarColor: '#b03a3a'
  },
  {
    code: 'city',
    name: '李强',
    unit: '阜阳市农业农村局',
    roleName: '市级管理人员',
    regionCode: '341200',
    regionName: '阜阳市',
    subjectId: null,
    homeRoute: '/portal',
    avatarColor: '#8a6d3b'
  },
  {
    code: 'county',
    name: '王芳',
    unit: '太和县农业农村局',
    roleName: '县级管理人员',
    regionCode: '341222',
    regionName: '太和县',
    subjectId: null,
    homeRoute: '/portal',
    avatarColor: '#0f5eb5'
  },
  {
    code: 'grower',
    name: '陈勇',
    unit: '太和县丰乐种植专业合作社',
    roleName: '种植主体（皖企通）',
    regionCode: '341222',
    regionName: '太和县',
    subjectId: 'SUB-0001',
    homeRoute: '/mobile/wanqitong',
    avatarColor: '#6a4fa3'
  },
  {
    code: 'pesticide',
    name: '刘敏',
    unit: '太和县皖丰农资经营部',
    roleName: '农药经营主体（皖企通）',
    regionCode: '341222',
    regionName: '太和县',
    subjectId: 'PES-S-0012',
    homeRoute: '/mobile/wanqitong',
    avatarColor: '#c2571a'
  }
]

export const findRole = (code) => DEMO_ROLES.find((r) => r.code === code)
