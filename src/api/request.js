// 模拟网络请求：随机延迟 + 深拷贝返回，模拟真实接口体感
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function mockRequest(dataFn, min = 300, max = 700) {
  const ms = Math.floor(min + Math.random() * (max - min))
  return delay(ms)
    .then(() => (typeof dataFn === 'function' ? dataFn() : dataFn))
    .then((result) => JSON.parse(JSON.stringify(result)))
}
