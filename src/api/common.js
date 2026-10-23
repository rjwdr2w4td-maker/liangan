// 公共 API：登录、待办、消息、区划
import { mockRequest } from './request'
import { TODOS, MESSAGES, REGION_TREE } from '@/mock'

export const fetchTodos = (role) =>
  mockRequest(() => TODOS.filter((t) => {
    if (!role) return false
    if (role.subjectId) return t.regionCode.startsWith(role.regionCode.slice(0, 6)) && t.type !== 'audit'
    if (role.regionCode === '340000') return true
    return t.regionCode.startsWith(role.regionCode)
  }))

export const fetchMessages = () => mockRequest(() => MESSAGES)

export const fetchRegionTree = () => mockRequest(() => REGION_TREE)
