import styles from '@/components/jam/recruit-card.module.scss'
import Image from 'next/image'
import Link from 'next/link'
import logoMb from '@/assets/logo_mb.svg'

export default function JamCard({
  juid = '',
  name = '',
  cover_img = '',
  genre = [],
  region = '',
  formed_time = '',
  genreData = [],
}) {
  // genre對應
  const genreName = genre.map((g) => {
    const matchedgenre = genreData.find((gd) => gd.id === g)
    return matchedgenre.name
  })

  // 組合日期
  const createdYear = new Date(formed_time).getFullYear()
  const createdMonth = new Date(formed_time).getMonth() + 1
  const createdDate = new Date(formed_time).getDate()
  const combineDate = `${createdYear}-${createdMonth}-${createdDate}`
  return (
    <>
      <Link
        href={`/jam/jam-list/${juid}`}
        className={`${styles.recruitCard}`}
        target="_blank"
      >
        <div className={`${styles.coverWrapper}`}>
          {cover_img ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'}/jam/${cover_img}`}
              fill
              className={styles.coverImg}
              alt={cover_img}
            />
          ) : (
            <div className={`${styles.noCoverBackground}`}>
              <Image src={logoMb} alt="logo-mobile" />
            </div>
          )}
        </div>
        {/* card-title */}
        <div className={styles.cardTitle}>
          {name}
        </div>
        {/* player */}
        {/* genre */}
        <div className={`flex items-start ${styles.genreRow}`}>
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
              成立時間：
            </span>
            <span className={styles.value}>{combineDate}</span>
          </div>
        </div>
      </Link>
    </>
  )
}
