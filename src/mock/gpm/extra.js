// 粮食计划管理扩展演示数据：农事服务、离线填报及监管工作台
export const FARM_SERVICES = [
  { id: 'SERVICE-001', title: '小麦播种技术指导', type: '技术指导', crop: '小麦', regionCode: '341200', regionName: '阜阳市', provider: '阜阳市农技推广中心', publishDate: '2026-10-08', status: '已发布', content: '提供整地、选种、播期和病虫害防治技术要点。', pushCount: 128 },
  { id: 'SERVICE-002', title: '秋粮抢收农机调度', type: '农机服务', crop: '水稻', regionCode: '340000', regionName: '全省', provider: '省农业农村厅农机处', publishDate: '2026-09-28', status: '已发布', content: '对接履带式收割机、烘干机和应急作业队。', pushCount: 256 },
  { id: 'SERVICE-003', title: '低温阴雨灾害防范提醒', type: '灾害防范', crop: '玉米', regionCode: '341600', regionName: '亳州市', provider: '亳州市农业农村局', publishDate: '2026-09-25', status: '待发布', content: '关注低温、连阴雨天气，及时做好田间排水和抢收。', pushCount: 0 }
]

export const OFFLINE_REPORTS = [
  { id: 'OFFLINE-001', subjectId: 'SUB-0004', subjectName: '旧县镇赵多种植大户', regionCode: '341222104', regionName: '旧县镇', year: 2026, crop: 'wheat', cropName: '小麦', area: 220, sowDate: '2026-10-02', device: '皖企通安卓端', savedAt: '2026-10-09 16:20', status: '待同步', remark: '山区网络不稳定期间离线填报' },
  { id: 'OFFLINE-002', subjectId: 'SUB-0005', subjectName: '旧县镇田乐家庭农场', regionCode: '341222104', regionName: '旧县镇', year: 2026, crop: 'corn', cropName: '玉米', area: 180, sowDate: '2026-09-26', device: '皖企通安卓端', savedAt: '2026-09-27 08:12', status: '已同步', remark: '现场定位采集' },
  { id: 'OFFLINE-003', subjectId: 'SUB-0001', subjectName: '太和县丰乐种植专业合作社', regionCode: '341222', regionName: '太和县', year: 2026, crop: 'rice', cropName: '水稻', area: 620, sowDate: '2026-06-18', device: '移动端离线包', savedAt: '2026-06-20 11:32', status: '校验异常', remark: '地块面积与历史记录差异超过阈值' }
]

export const SMART_REFERENCES = {
  historyYield: [{ crop: '小麦', yield: 520, year: 2025 }, { crop: '水稻', yield: 610, year: 2025 }, { crop: '玉米', yield: 485, year: 2025 }],
  fertility: { high: 62, middle: 31, low: 7, suggestion: '优先在高、中等地力地块安排口粮作物，低地力地块建议增施有机肥。' },
  highStandard: { area: 4380, rate: 40.1, suggestion: '高标准农田适宜优先安排水稻、小麦等稳产作物。' },
  abandoned: { area: 96, rate: 0.9, suggestion: '建议将连续两季撂荒地纳入复耕提醒清单。' },
  weather: [{ regionName: '阜阳市', risk: '渍涝', level: '中风险', suggestion: '水稻收获后及时排水，适当调整秋冬种结构。' }, { regionName: '亳州市', risk: '低温', level: '低风险', suggestion: '玉米适当提前抢收，关注晚播小麦出苗。' }]
}
