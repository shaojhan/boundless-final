import { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'

// icons
import { IoHome } from 'react-icons/io5'
import { ImExit } from 'react-icons/im'
import ArticleCard from '@/components/user/article-cardForUser'
import { useAvatarImage } from '@/hooks/useAvatarImage'

//選項資料 data
// import CityCountyData from '@/data/CityCountyData.json'
import playerData from '@/data/player.json'
import genreData from '@/data/genre.json'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function Test() {
  const [userHomePageData, setuserHomePageData] = useState({
    id: '',
    uid: '',
    name: '',
    email: '',
    phone: '',
    postcode: '',
    country: '',
    township: '',
    address: '',
    birthday: '',
    genre_like: '',
    play_instrument: '',
    info: '',
    img: '',
    gender: '',
    nickname: '',
    google_uid: '',
    photo_url: '',
    privacy: '',
    my_lesson: '',
    my_jam: '',
    updated_time: '',
    valid: '',
  })

  const router = useRouter()
  const { uid } = router.query

  const getHomePageData = async (uid) => {
    try {
      const response = await fetch(`/user/user-homepage/${uid}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const uiduserHomePageData = await response.json()

      setuserHomePageData(uiduserHomePageData)

      // 在這裡處理後端返回的資料
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }
  //-------------------------獲得該文章資料
  const [article, setArticle] = useState([])
  const getDatas = async (uid) => {
    try {
      const res = await fetch(`/user/homepageArticle/${uid}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const datas = await res.json()
      if (datas) {
        setArticle(datas)
      }
    } catch (e) {
      console.error(e)
    }
  }
  //-------------------------------獲得UID------------------------------
  useEffect(() => {
    if (uid) {
      getHomePageData(uid)
      getDatas(uid)
    }
  }, [uid])
  //-------------------------------資料處理-------------------------------

  const avatarImage = useAvatarImage()

  // ---------------性別-------------
  let gender
  // @ts-expect-error -- legacy JS comparison (string == number)
  if (userHomePageData.gender == 1) {
    gender = '男'
    // @ts-expect-error -- legacy JS comparison
  } else if (userHomePageData.gender == 2) {
    gender = '女'
    // @ts-expect-error -- legacy JS comparison
  } else if (userHomePageData.gender == 3) {
    gender = '其他'
  } else {
    gender = '尚未填寫'
  }

  // ---------------生日-------------
  let birthday = '2000-01-01'
  if (userHomePageData.birthday) {
    // 原本處理方式 但和SQL資料庫有時區差異------------
    // birthday = userData.birthday.split('T')[0]

    // testTime = new Date(testTime)
    // const taipeiTime = new Date(testTime.getTime() + 8 * 60 * 60 * 1000)
    // YYYYMMDDTime = taipeiTime.toISOString().slice(0, 19).replace('T', ' ')
    // 原本處理方式 但和SQL資料庫有時區差異------------
    let defaultTime = userHomePageData.birthday
    let inputDate = new Date(defaultTime)
    let year = inputDate.getFullYear()
    let month = String(inputDate.getMonth() + 1).padStart(2, '0') // 月份從0開始，需要加1，並保持兩位數
    let day = String(inputDate.getDate()).padStart(2, '0') // 日期需保持兩位數
    birthday = `${year}-${month}-${day}`
  }

  // ---------------曲風-------------
  let totalGenreData = genreData.map((v) => ({
    key: v.id,
    value: v.id,
    label: v.name,
  }))
  let genreLike,
    finalGenreLike = `尚未填寫`
  if (userHomePageData.genre_like) {
    genreLike = userHomePageData.genre_like
    // 使用 split 方法將字串拆分成陣列
    let [genreLike1, genreLike2, genreLike3] = genreLike.split(',')
    // 傻人方法
    for (let i = 0; i < totalGenreData.length; i++) {
      // @ts-expect-error -- legacy JS comparison
      if ([genreLike1] == totalGenreData[i].value) {
        genreLike1 = totalGenreData[i].label
        break // 找到匹配後就跳出迴圈
      }
    }
    for (let i = 0; i < totalGenreData.length; i++) {
      // @ts-expect-error -- legacy JS comparison
      if ([genreLike2] == totalGenreData[i].value) {
        genreLike2 = totalGenreData[i].label
        break // 找到匹配後就跳出迴圈
      }
    }
    for (let i = 0; i < totalGenreData.length; i++) {
      // @ts-expect-error -- legacy JS comparison
      if ([genreLike3] == totalGenreData[i].value) {
        genreLike3 = totalGenreData[i].label
        break // 找到匹配後就跳出迴圈
      }
    }
    //判斷最後結果
    if (genreLike1 && genreLike2 && genreLike3 !== undefined) {
      finalGenreLike = `${genreLike1}, ${genreLike2}, ${genreLike3}`
    } else if (genreLike1 && genreLike2 !== undefined) {
      finalGenreLike = `${genreLike1}, ${genreLike2}`
    } else if (genreLike1 !== undefined) {
      finalGenreLike = `${genreLike1}`
    }
  }

  // ---------------演奏樂器-------------
  let totalPlayerData = playerData.map((v) => ({
    key: v.id,
    value: v.id,
    label: v.name,
  }))
  let playInstrument,
    finalPlayInstrument = `尚未填寫`
  if (userHomePageData.play_instrument) {
    playInstrument = userHomePageData.play_instrument
    // 使用 split 方法將字串拆分成陣列
    let [playInstrument1, playInstrument2, playInstrument3] =
      playInstrument.split(',')
    // 傻人方法
    for (let i = 0; i < totalPlayerData.length; i++) {
      // @ts-expect-error -- legacy JS comparison
      if ([playInstrument1] == totalPlayerData[i].value) {
        playInstrument1 = totalPlayerData[i].label
        break // 找到匹配後就跳出迴圈
      }
    }
    for (let i = 0; i < totalPlayerData.length; i++) {
      // @ts-expect-error -- legacy JS comparison
      if ([playInstrument2] == totalPlayerData[i].value) {
        playInstrument2 = totalPlayerData[i].label
        break // 找到匹配後就跳出迴圈
      }
    }
    for (let i = 0; i < totalPlayerData.length; i++) {
      // @ts-expect-error -- legacy JS comparison
      if ([playInstrument3] == totalPlayerData[i].value) {
        playInstrument3 = totalPlayerData[i].label
        break // 找到匹配後就跳出迴圈
      }
    }
    //判斷最後結果
    if (playInstrument1 && playInstrument2 && playInstrument3 !== undefined) {
      finalPlayInstrument = `${playInstrument1}, ${playInstrument2}, ${playInstrument3}`
    } else if (playInstrument1 && playInstrument2 !== undefined) {
      finalPlayInstrument = `${playInstrument1}, ${playInstrument2}`
    } else if (playInstrument1 !== undefined) {
      finalPlayInstrument = `${playInstrument1}`
    }
  }
  // ---------------公開資訊-------------
  //帶入隱私設定進來, 但是不可更改
  let privacy,
    privacyBD = '',
    privacyPhone = '',
    privacyEmail = '',
    ArrPrivacy
  if (userHomePageData.privacy) {
    privacy = userHomePageData.privacy
    ArrPrivacy = privacy.split(',')
    privacyBD = ArrPrivacy[0]
    privacyPhone = ArrPrivacy[1]
    privacyEmail = ArrPrivacy[2]
  }

  // 純func書籤
  const handleToggleFav = (id) => {
    const newArticles = article.map((v, _i) => {
      if (v.id === id) return { ...v, fav: !v.fav }
      else return v
    })
    setArticle(newArticles)
  }

  const [search, _setSearch] = useState('')

  // // 資料排序
  const [dataSort, _setDataSort] = useState('latest')

  const filterArticle = useMemo(() => {
    // 首先根據排序條件對文章進行排序
    let sorted
    // if (dataSort === 'latest') {
    //   sorted = article.sort(
    //     (a, b) => new Date(b.published_time) - new Date(a.published_time)
    //   )
    // } else if (dataSort === 'oldest') {
    //   sorted = article.sort(
    //     (a, b) => new Date(a.published_time) - new Date(b.published_time)
    //   )
    // } else {
    sorted = article
    // }

    // 然後應用搜索過濾器
    return sorted.filter((article) => {
      return article.title.includes(search)
    })
  }, [article, dataSort, search])

  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // ----------------------假資料  ----------------------

  useFilterToggle()

  return (
    <>
      <Head>
        <title>個人首頁</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      <div
        className="container mx-auto px-6 relative"
        style={{ minHeight: '95svh' }}
      >
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          {/* 用戶資訊 */}
          <div className="menu-mb-user-info flex items-center flex-col mb-6">
            <div className="mb-photo-wrapper mb-2">
              <Image
                src={avatarImage}
                alt="user photo mb"
                fill
                sizes="(max-width: 150px)"
              ></Image>
            </div>
            {/* 暫時註解 本頁暫不想放入讀取登入者資料 如果手機板改成元件再開啟 */}
            {/* <div>{LoginUserData.nickname}</div> */}
          </div>
          <Link
            className="mm-item"
            href="/user/user-info"
            style={{ borderTop: '1px solid #b9b9b9' }}
          >
            會員中心
          </Link>
          <Link className="mm-item" href="/lesson/lesson-list">
            探索課程
          </Link>
          <Link className="mm-item" href="/instrument/instrument-list">
            樂器商城
          </Link>
          <Link className="mm-item" href="/jam/recruit-list">
            Let &apos;s JAM!
          </Link>
          <Link className="mm-item" href="/article/article-list">
            樂友論壇
          </Link>
          <div className="mm-item" style={{ color: '#1581cc' }}>
            登出
            <ImExit size={20} className="ml-2" />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3">
          <div className="w-full px-6">
            {/* 麵包屑 */}
            <div
              className="breadcrumb-wrapper-ns"
              style={{ paddingBlock: '20px 30px' }}
            >
              <ul className="flex items-center p-0 m-0">
                <IoHome size={20} />
                <li style={{ marginLeft: '8px' }}>
                  {userHomePageData.nickname}的個人首頁
                </li>
                {/* <FaChevronRight />
                <Link href="/jam/recruit-list">
                  <li style={{ marginLeft: '10px' }}>團員募集</li>
                </Link>

                <FaChevronRight />
                <li style={{ marginLeft: '10px' }}>JAM 資訊</li> */}
              </ul>
            </div>
            {/* 主內容 */}
            <main className="content">
              <div className="container mx-auto px-6 custom-container">
                <div className="flex flex-wrap -mx-3">
                  <div className="lg:w-1/4 px-6 w-full px-6">
                    <div className="user-homePage-sideWarp ">
                      <div className="user-homePage-content-left w-full px-6 ">
                        <div className="user-homePage-topInfo">
                          <div className="user-homePage-avatar">
                            <Image
                              className="avatar"
                              src={avatarImage}
                              alt=""
                              priority
                              width={150}
                              height={150}
                            />
                          </div>
                          <div className="user-homePage-name">
                            {userHomePageData.nickname}
                          </div>
                          <div className="user-homePage-bandName">
                            {userHomePageData.my_jam}
                          </div>
                        </div>
                        <div className="user-homePage-Info">
                          <div className="user-homePage-Info-title">
                            會員資訊
                          </div>
                          <div className="user-homePage-Info-list">
                            <div className="user-homePage-info-item">
                              <div className="user-homePage-info-item-titleText">
                                暱稱：
                              </div>
                              <div className="user-homePage-info-item-Content">
                                <div className="user-homePage-info-item-contentText">
                                  {userHomePageData.nickname}
                                </div>
                              </div>
                            </div>
                            <div className="user-homePage-info-item">
                              <div className="user-homePage-info-item-titleText">
                                性別：
                              </div>
                              <div className="user-homePage-info-item-Content">
                                <div className="user-homePage-info-item-contentText">
                                  {gender}
                                </div>
                              </div>
                            </div>
                            <div className="user-homePage-info-item">
                              <div className="user-homePage-info-item-titleText">
                                生日：
                              </div>
                              <div className="user-homePage-info-item-Content">
                                <div className="user-homePage-info-item-contentText">
                                  {privacyBD === '1' ? birthday : '未公開'}
                                </div>
                              </div>
                            </div>
                            <div className="user-homePage-info-item">
                              <div className="user-homePage-info-item-titleText">
                                喜歡曲風：
                              </div>
                              <div className="user-homePage-info-item-Content">
                                <div className="user-homePage-info-item-contentText">
                                  {finalGenreLike}
                                </div>
                              </div>
                            </div>
                            <div className="user-homePage-info-item">
                              <div className="user-homePage-info-item-titleText">
                                演奏樂器：
                              </div>
                              <div className="user-homePage-info-item-Content">
                                <div className="user-homePage-info-item-contentText">
                                  {finalPlayInstrument}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="user-homePage-Info contactInfo">
                          <div className="user-homePage-Info-title">
                            聯絡方式
                          </div>
                          <div className="user-homePage-Info-list">
                            <div className="user-homePage-info-item">
                              <div className="user-homePage-info-item-titleText">
                                手機：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              </div>
                              <div className="user-homePage-info-item-Content">
                                <div className="user-homePage-info-item-contentText">
                                  {privacyPhone === '1'
                                    ? userHomePageData.phone
                                    : '未公開'}
                                </div>
                              </div>
                            </div>
                            <div className="user-homePage-info-item">
                              <div className="user-homePage-info-item-titleText">
                                信箱：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              </div>
                              <div className="user-homePage-info-item-Content">
                                <div className="user-homePage-info-item-contentText">
                                  {privacyEmail === '1'
                                    ? userHomePageData.email
                                    : '未公開'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-3/4 px-6 w-full px-6 user-homePage-content-right ">
                    <div className="user-homePage-content-right-Info">
                      <div className="user-homePage-content-right-titleText">
                        自我介紹
                      </div>
                      <div className="user-homePage-content-right-infoText">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {userHomePageData.info}
                      </div>
                      <div className="user-homePage-content-right-socialMedia"></div>
                    </div>
                    <div className="user-homePage-content-right-article">
                      <div className="user-homePage-content-right-article-titleText">
                        發表文章
                      </div>
                      <div className="user-homePage-content-right-article-cardList">
                        {/* 導入ArticleCard元件 爆版 */}
                        {filterArticle.map((v, _i) => {
                          const {
                            id,
                            auid,
                            title,
                            content,
                            img,
                            user_id,
                            author,
                            published_time,
                            articles,
                            fav,
                            category_name,
                            comment_likes,
                            article_author_name,
                            article_author_img,
                          } = v
                          return (
                            <ArticleCard
                              key={id}
                              id={id}
                              auid={auid}
                              title={title}
                              content={content}
                              img={img}
                              user_id={user_id}
                              author={author}
                              published_time={published_time}
                              articles={articles}
                              fav={fav}
                              category_name={category_name}
                              handleToggleFav={handleToggleFav}
                              comment_likes={comment_likes}
                              article_author_name={article_author_name}
                              article_author_img={article_author_img}
                            />
                          )
                        })}
                        {/* <ArticleCard />
                        <ArticleCard />
                        <ArticleCard />
                        <ArticleCard /> */}
                        {/* <div className="user-homePage-content-right-article-card">
                        
                          <div className="user-homePage-content-right-article-card-articleInfo"></div>
                          <div className="user-homePage-content-right-article-card-content" />
                          <div className="user-homePage-content-right-article-card-viewsLike" />
                          <div className="user-homePage-content-right-article-card-kind-bookmark" />
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/*   ----------------------頁面內容  ---------------------- */}
          {/* <div className="hidden sm:block sm:w-1/3 px-6 page-control"></div> */}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        /* -----------------homePage------------------ */
        .custom-container {
          padding: 0;
        }
        .user-homePage-sideWarp {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          .user-homePage-content-left {
            display: flex;           
            padding: 25px 0px;
            flex-direction: column;
            align-items: flex-start;
            border-radius: 10px;
            background: var(--gray-30, rgba(185, 185, 185, 0.3));
            margin-bottom: 20px;

            .user-homePage-topInfo {
              display: flex;
              padding: 10px 0px;
              flex-direction: column;
              align-items: center;
              gap: 5px;
              align-self: stretch;
              border-radius: 15px;

              .user-homePage-avatar {
                display: flex;
                width: 150px;
                height: 150px;
                justify-content: center;
                align-items: center;
                border-radius: 150px;
                overflow:hidden;

                .avatar {
                  width: 150px;
                  height: 150px;
                  flex-shrink: 0;
                  border-radius: 150px;
                }
              }

              .user-homePage-name {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
                gap: 15px;
                color: var(--dark, #1d1d1d);
                text-align: center;

                /* h5 */
                font-family: 'Noto Sans TC';
                font-size: 20px;
                font-style: normal;
                font-weight: 400;
                line-height: normal;
              }

              .user-homePage-bandName {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                color: var(--dark, #1d1d1d);
                text-align: center;

                /* h5 */
                font-family: 'Noto Sans TC';
                font-size: 20px;
                font-style: normal;
                font-weight: 400;
                line-height: normal;
              }
            }
            .user-homePage-Info {
              display: flex;
              padding: 10px 19px;
              flex-direction: column;
              align-items: flex-start;
              gap: 20px;
              align-self: stretch;
              border-radius: 15px;

              .user-homePage-Info-title {
                color: var(--primary-deep, #124365);
                text-align: center;

                /* h3 */
                font-family: 'Noto Sans TC';
                font-size: 28px;
                font-style: normal;
                font-weight: 700;
                line-height: normal;
              }

              .user-homePage-Info-list {
                display: flex;
                padding: 0px 10px;
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;

                .user-homePage-info-item {
                  align-self: stretch;
                  justify-content: space-between;
                  align-items: flex-start;
                  display: inline-flex;
                }
                .user-homePage-info-item-titleText {
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 10;
                  align-self: stretch;
                  overflow: hidden;
                  color: var(--primary-deep, #124365);
                  text-overflow: ellipsis;
                  font-family: 'Noto Sans TC';
                  font-size: 16px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                }
                .user-homePage-info-item-Content {
                  display: flex;
                  padding: 0px 10px;
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 16px;
                }
                .user-homePage-info-item-contentText {
                  display: -webkit-box;
                  width: 140px;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 10;
                  overflow: hidden;
                  color: var(--dark, #1d1d1d);
                  text-overflow: ellipsis;
                  word-wrap: break-word;
                  overflow-wrap: break-word;

                  /* p */
                  font-family: 'Noto Sans TC';
                  font-size: 16px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                }
              }
            }
          }
        }

        .user-homePage-content-right {
          display: flex;
          
          flex-direction: column;
          justify-content: start;
          align-items: center;
          gap: 20px;
          flex: 1 0 0;

          @media screen and (max-width: 576px) {
            {/* padding-left: 0px; */}
          }

          .user-homePage-content-right-Info {
            
            display: flex;
            padding: 10px;
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            align-self: stretch;
            border-radius: 10px;
            background: var(--gray-30, rgba(185, 185, 185, 0.3));

            @media screen and (max-width: 576px) {
              {/* width: 370px; */}
            }

            .user-homePage-content-right-titleText {
              color: var(--primary-deep, #124365);
              text-align: center;

              /* h3 */
              font-family: 'Noto Sans TC';
              font-size: 28px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
            }

            .user-homePage-content-right-infoText {
              align-self: stretch;
              color: #000;

              /* p */
              font-family: 'Noto Sans TC';
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
            }
          }

          .user-homePage-content-right-article {
            display: flex;
            padding: 10px;
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            align-self: stretch;
            border-radius: 10px;
            background: var(--gray-30, rgba(185, 185, 185, 0.3));

            @media screen and (max-width: 576px) {
              max-width: 366px;
            }
            .user-homePage-content-right-article-titleText {
              color: var(--primary-deep, #124365);
              text-align: center;

              /* h3 */
              font-family: 'Noto Sans TC';
              font-size: 28px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
            }

            .user-homePage-content-right-article-cardList {
              display: flex;
              align-items: flex-start;
              align-content: flex-start;
              gap: 30px;
              align-self: stretch;
              flex-wrap: wrap;
              color: #000;

              .user-homePage-content-right-article-card {
                display: flex;
                height: 237.422px;
                min-width: 410px;
                max-width: 525px;
                padding: 6px 8px;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
                gap: 10px;
                flex: 1 0 0;

                .user-homePage-content-right-article-card-articleInfo {
                  display: flex;
                  align-items: center;
                  gap: 16px;
                }

                .user-homePage-content-right-article-card-content {
                  display: flex;
                  justify-content: center;
                  align-items: flex-start;
                  gap: 8px;
                  align-self: stretch;
                }

                .user-homePage-content-right-article-card-viewsLike {
                  display: flex;
                  align-items: center;
                  gap: 20px;
                  align-self: stretch;
                }

                .user-homePage-content-right-article-card-kind-bookmark {
                  display: flex;
                  padding-right: 8px;
                  justify-content: space-between;
                  align-items: center;
                  align-self: stretch;
                }
              }
            }
          }
        }
      `}</style>
    </>
  )
}
