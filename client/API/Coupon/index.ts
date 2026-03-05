import API from '..'
import { format } from 'date-fns'
import type { CouponItem, CreateCouponParam } from '@/types/api'

class Coupon {
  url: string

  constructor() {
    this.url = 'coupon/'
  }

  FindAll(userID = 0): Promise<CouponItem[]> {
    return new Promise((resolve, reject) => {
      API.Get({
        url: this.url + 'FindAll' + '/' + userID,
        success: (data) => {
          const formatted = (data as CouponItem[]).map((i) => ({
            ...i,
            created_time: format(
              new Date(i.created_time),
              'yyyy-MM-dd HH:mm:ss',
            ),
            limit_time: format(new Date(i.limit_time), 'yyyy-MM-dd HH:mm:ss'),
          }))
          resolve(formatted)
        },
        fail: (err) => reject(err),
      })
    })
  }

  Create(
    p: CreateCouponParam = { user_id: 0, coupon_template_id: 0 },
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      API.Post<CreateCouponParam>({
        url: this.url + 'Create',
        param: p,
        success: (data) => resolve(data),
        fail: (err) => reject(err),
      })
    })
  }

  Update(_id = 1): Promise<unknown> {
    return new Promise((resolve, reject) => {
      API.Post({
        url: this.url + 'Update',
        success: (data) => resolve(data),
        fail: (err) => reject(err),
      })
    })
  }

  Redeem(
    user_id: number,
    coupon_code: string,
  ): Promise<{ success: boolean; message: string; coupon?: object }> {
    return new Promise((resolve, reject) => {
      API.Post({
        url: this.url + 'Redeem',
        param: { user_id, coupon_code },
        success: (data) =>
          resolve(data as { success: boolean; message: string; coupon?: object }),
        fail: (err) => reject(err),
      })
    })
  }

  CalcDiscount(): void {}
}

export default new Coupon()
