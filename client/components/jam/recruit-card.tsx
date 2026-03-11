import styles from '@/components/jam/recruit-card.module.scss'
import Image from 'next/image'
import Link from 'next/link'
import { FaUser } from 'react-icons/fa'

export default function RecruitCard({
  juid,
  former,
  title,
  degree,
  genre,
  player,
  region,
  created_time,
  genreData,
  playerData,
}) {
  // 讓player代碼對應樂器種類
  const playerName = player.map((p) => {
    const matchedPlayer = playerData.find((pd) => pd.id === p).name // {id, name}
    return matchedPlayer
  })
  // 累加重複的樂器種類 吉他變成吉他*2
  const countPlayer = playerName.reduce((accumulator, count) => {
    if (!accumulator[count]) {
      accumulator[count] = 1
    } else {
      accumulator[count]++
    }
    return accumulator
  }, {})
  const playerResult = Object.entries(countPlayer).map(([player, count]) => {
    return (count as number) > 1 ? `${player}*${count}` : player
  })

  // genre對應
  const genreName = genre.map((g) => {
    const matchedgenre = genreData.find((gd) => gd.id === g)
    return matchedgenre.name
  })

  // 組合日期
  const createdYear = new Date(created_time).getFullYear()
  const createdMonth = new Date(created_time).getMonth() + 1
  const createdDate = new Date(created_time).getDate()
  const combineDate = `${createdYear}-${createdMonth}-${createdDate}`
  // 計算剩餘天數
  const createdTime = new Date(created_time).getTime()
  const currentTime = new Date().getTime()
  // 取得毫秒後，轉換成天數
  const countDown = Math.floor(
    (createdTime + 30 * 24 * 60 * 60 * 1000 - currentTime) / (1000 * 3600 * 24),
  )
  return (
    <>
      <Link
        href={`/jam/recruit-list/${juid}`}
        className={`${styles.recruitCard}`}
        target="_blank"
      >
        {/* card-header */}
        <div
          className={`flex justify-between items-center flex-wrap ${styles.headerRow}`}
        >
          <div className={`${styles.former}`}>
            {/* 發起人頭像 */}
            <div className={`${styles.userPhotoWrapper}`}>
              {former.img ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'}/user/${former.img}`}
                  alt={`${former.name}'s photo`}
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
            <span className={styles.authorName}>
              {former.nickname ? former.nickname : former.name}
            </span>
            <span className={`ml-2 ${styles.authorDate}`}>
              {combineDate}
            </span>
          </div>
          {/* 程度 */}
          <div
            className={`${styles.cardBadge} ${styles.degree} flex items-center`}
          >
            {degree == 1 ? '新手練功' : '老手同樂'}
          </div>
        </div>
        {/* card-title */}
        <div className={styles.cardTitle}>
          {title}
        </div>
        {/* player */}
        <div className={`flex items-start ${styles.row8}`}>
          <span className={styles.label}>
            徵求樂手：
          </span>
          <div className={`flex flex-wrap ${styles.badgeGroup}`}>
            {playerResult.map((v, i) => {
              return (
                <div key={i} className={`${styles.cardBadge} ${styles.player}`}>
                  {v}
                </div>
              )
            })}
          </div>
        </div>
        {/* genre */}
        <div className={`flex items-start ${styles.row8}`}>
          <span className={styles.label}>
            音樂風格：
          </span>
          <div className={`flex flex-wrap ${styles.badgeGroup}`}>
            {genreName.map((v, i) => {
              return (
                <div key={i} className={`${styles.cardBadge} ${styles.genere}`}>
                  {v}
                </div>
              )
            })}
          </div>
        </div>
        {/* region & deadline */}
        <div className="flex justify-between">
          <div>
            <span className={styles.label}>地區：</span>
            <span className={styles.value}>{region}</span>
          </div>
          <div>
            <span className={styles.label}>
              倒數期限：
            </span>
            <span className={countDown <= 5 ? styles.warning : styles.value}>
              {countDown == 0 ? '今天' : countDown + ' 天'}
            </span>
          </div>
        </div>
      </Link>
    </>
  )
}
