import styles from '@/pages/jam/jam.module.scss'
import Link from 'next/link'
import Image from 'next/image'
import { FaUser } from 'react-icons/fa'
import { useState } from 'react'
import { Disclosure } from '@headlessui/react'

interface Applier {
  img?: string
  name?: string
  nickname?: string
  uid?: number | string
}

export default function Apply({
  id = 0,
  applier = {} as Applier,
  message = '',
  play = '',
  created_time = '',
  state = 0,
  sendResult,
}: {
  id?: number
  applier?: Applier
  message?: string
  play?: string
  created_time?: string
  state?: number
  sendResult?: (id: number, result: number) => void
}) {
  const [resultState, setResultState] = useState(state)
  const switchState = (resultState) => {
    switch (resultState) {
      case 0:
        return (
          <>
            <div
              className="b-btn b-btn-body px-6"
              role="presentation"
              onClick={() => {
                setResultState(2)
                sendResult(id, 2)
              }}
            >
              拒絕
            </div>
            <div
              className="b-btn b-btn-primary px-6"
              role="presentation"
              onClick={() => {
                setResultState(1)
                sendResult(id, 1)
              }}
            >
              接受
            </div>
          </>
        )
      case 1:
        return (
          <>
            <div
              className={`b-btn-disable px-6 ${styles.pendingBtn}`}
              role="presentation"
            >
              等待回覆
            </div>
          </>
        )
      case 2:
        return (
          <>
            <div
              className={`b-btn-disable px-6 ${styles.rejectedBtn}`}
              role="presentation"
            >
              已拒絕
            </div>
          </>
        )
      default:
        return null
    }
  }
  return (
    <Disclosure>
      {() => (
        <>
          <div className="flex justify-between sm:items-start flex-col sm:flex-row px-1">
            <div
              className={`flex items-center flex-wrap ${styles.memberRow}`}
            >
              <div className={`${styles.cardBadge} ${styles.player}`}>
                {play}
              </div>
              <div className={`${styles.userPhotoWrapper}`}>
                {applier.img ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'}/user/${applier.img}`}
                    alt={`${applier.name}'s photo`}
                    width={32}
                    height={32}
                    className={`${styles.userPhoto}`}
                  />
                ) : (
                  <div className={`${styles.userPhotoDefault}`}>
                    <FaUser size={24} className={`${styles.userDefaultIcon}`} />
                  </div>
                )}
              </div>
              <Link
                href={`../../user/user-homepage/${applier.uid}`}
                className={`${styles.memberName}`}
              >
                {applier.nickname ? applier.nickname : applier.name}
              </Link>
            </div>

            <Disclosure.Button
              className={`flex justify-end mt-1 sm:mt-0 ${styles.disclosureBtn}`}
            >
              查看訊息
            </Disclosure.Button>
          </div>

          <Disclosure.Panel className="mt-2 border border-gray-200 rounded p-4">
            <div className="font-medium">{created_time}</div>
            <div className="mt-1">{message}</div>
            <div className="flex justify-end gap-2 mt-2">
              {switchState(resultState)}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
