// 演示角色定义：5 个角色覆盖省/市/县/皖政通/种植主体
export const DEMO_ROLES = [
  {
    code: 'province',
    name: '张明',
    unit: '安徽省农业农村厅',
    roleName: '省级管理人员',
    regionCode: '340000',
    regionName: '安徽省',
    subjectId: null,
    homeRoute: '/entry',
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
    homeRoute: '/entry',
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
    homeRoute: '/entry',
    avatarColor: '#0f5eb5'
  },
  {
    code: 'wanzhengtong',
    name: '王芳',
    unit: '太和县农业农村局',
    roleName: '县级管理人员（皖政通）',
    regionCode: '341222',
    regionName: '安徽省/阜阳市/太和县',
    subjectId: null,
    homeRoute: '/mobile/wanzhengtong',
    avatarColor: '#1668dc'
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
]

export const findRole = (code) => DEMO_ROLES.find((r) => r.code === code)
