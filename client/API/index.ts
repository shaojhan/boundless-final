import axios from 'axios'
import type { ApiGetParam, ApiPostParam } from '@/types/api'

class API {
  url: string

  Get(param: ApiGetParam): void {
    axios
      .get(this.url + param.url)
      .then((res) => param.success(res.data))
      .catch((err) => param.fail(err))
  }

  Post<T = Record<string, unknown>>(param: ApiPostParam<T>): void {
    axios
      .post(this.url + param.url, param.param)
      .then((res) => param.success(res.data))
      .catch((err) => param.fail(err))
  }

  constructor() {
    this.url = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'}/api/`
  }
}

export default new API()
