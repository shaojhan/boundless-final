import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  setInvalidJam as setInvalidJamAction,
  setInvalidEdit as setInvalidEditAction,
} from '@/store/slices/jamSlice'
import type { RootState } from '@/store'

export function useJam() {
  const dispatch = useDispatch()
  const invalidJam = useSelector((state: RootState) => state.jam.invalidJam)
  const invalidEdit = useSelector((state: RootState) => state.jam.invalidEdit)

  const setInvalidJam = (val: boolean) => dispatch(setInvalidJamAction(val))
  const setInvalidEdit = (val: boolean) => dispatch(setInvalidEditAction(val))

  // 網址輸入無效juid
  const notifyInvalidToast = () => {
    toast.error('指定樂團不存在或已解散', {
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      iconTheme: {
        primary: '#ec3f3f',
        secondary: '',
      },
      duration: 3500,
    })
    dispatch(setInvalidJamAction(true))
  }

  // 用非正當手段進入編輯頁面
  const notifyInvalidEditToast = () => {
    toast.error('請勿進行非法操作', {
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      iconTheme: {
        primary: '#ec3f3f',
        secondary: '',
      },
      duration: 3500,
    })
    dispatch(setInvalidEditAction(true))
  }

  // 成團人數不足提示
  const notEnough = () => {
    toast.error('僅有一人無法成團', {
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      iconTheme: {
        primary: '#ec3f3f',
        secondary: '',
      },
      duration: 2500,
    })
  }

  // 取消申請提示
  const checkCancel = () => {
    toast('申請者已取消申請，將重整頁面', {
      icon: '❕',
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      duration: 2500,
    })
    setTimeout(() => {
      window.location.reload()
    }, 2500)
  }

  // 接受申請提示
  const notifyAccept = () => {
    toast.success('已接受，等待對方確認加入', {
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      iconTheme: {
        primary: '#1581cc',
        secondary: '',
      },
      duration: 2500,
    })
  }

  // 拒絕申請提示
  const notifyReject = () => {
    toast('已拒絕', {
      icon: '❕',
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      duration: 2500,
    })
  }

  // 取消申請提示
  const cancelSuccess = () => {
    toast.success('已取消申請', {
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      iconTheme: {
        primary: '#1581cc',
        secondary: '',
      },
      duration: 2500,
    })
    setTimeout(() => {
      window.location.reload()
    }, 2500)
  }

  // 刪除申請提示
  const deleteSuccess = () => {
    toast.success('資料已刪除', {
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      iconTheme: {
        primary: '#1581cc',
        secondary: '',
      },
      duration: 2500,
    })
    setTimeout(() => {
      window.location.reload()
    }, 2500)
  }

  return {
    invalidJam,
    invalidEdit,
    setInvalidJam,
    setInvalidEdit,
    notifyInvalidToast,
    notifyInvalidEditToast,
    notEnough,
    checkCancel,
    notifyAccept,
    notifyReject,
    cancelSuccess,
    deleteSuccess,
  }
}
