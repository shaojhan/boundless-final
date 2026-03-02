import { apiBaseUrl } from '@/configs'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDetailFetch } from '@/hooks/useDetailFetch'
import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'
import NavbarMb from '@/components/common/navbar-mb'
import Link from 'next/link'
import Head from 'next/head'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { FaHeart } from 'react-icons/fa'

import Card from '@/components/lesson/lesson-card'
import HoriCard from '@/components/lesson/lesson-card-rwd'
//右半部
import ProductCard from '@/components/lesson/lesson-productbrief-card'

// 購物車hook
import { useCart } from '@/hooks/use-cart'

//日期格式
import { format } from 'date-fns'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function LessonDetailPage() {
  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // ----------------------假資料  ----------------------

  useFilterToggle()

  //收藏按鍵的功能
  //會有兩個狀態 連結會員資料 已經按過讚的收回;沒按過的按讚
  const [colorChange, setcolorChange] = useState(false)
  const colorToggle = () => {
    //按按鍵切換狀態
    setcolorChange(!colorChange)
  }
  // ----------------------加入右上角購物車的功能  ----------------------

  const { addLessonItem, notifyBuy } = useCart()

  //-----------------------動態路由
  //  由router中獲得動態路由(屬性名稱pid，即檔案[pid].js)的值，router.query中會包含pid屬性
  // 1. 執行(呼叫)useRouter，會回傳一個路由器
  // 2. router.isReady(布林值)，true代表本元件已完成水合作用(hydration)，可以取得router.query的值
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [LessonDetail, setLessonDetail] = useState({} as any)
  const [reviews, setReviews] = useState([])
  const [youWillLike, setYouWillLike] = useState([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawData } = useDetailFetch<any>(
    router.isReady && router.query.luid
      ? `${apiBaseUrl}/lesson/${router.query.luid as string}`
      : null,
  )
  useEffect(() => {
    if (!rawData) return
    setLessonDetail(rawData.data[0])
    setReviews(rawData.product_review)
    setYouWillLike(rawData.youwilllike)
  }, [rawData])

  const toLocalePrice = formatPrice(LessonDetail.price)

  return (
    <>
      <Head>
        <title>{LessonDetail.name}</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      <div className="container mx-auto px-6 relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>
        <div className="flex flex-wrap -mx-3">
          {/* 麵包屑 */}
          <div
            className="breadcrumb-wrapper-ns"
            style={{ paddingBlock: '20px' }}
          >
            <ul className="flex items-center p-0 m-0 flex-wrap">
              <IoHome size={20} />
              <Link href="/lesson">
                <li style={{ marginLeft: '8px' }}>探索課程</li>
              </Link>
              <FaChevronRight />

              <li style={{ marginLeft: '10px' }}>
                {LessonDetail.lesson_category_name}
              </li>

              <FaChevronRight />

              <li style={{ marginLeft: '10px' }}>{LessonDetail.name}</li>
            </ul>
          </div>
          <div className="w-full px-6 sm:w-1/2 px-6 p-0">
            {/* 主內容 */}
            <main className="content">
              <div>
                <div className="Left">
                  {/* Product Briefing Area */}
                  <div className="prodBriefingArea flex">
                    <img
                      src={`/課程與師資/lesson_img/${LessonDetail.img}`}
                      className="prodImg"
                      alt="Lesson Preview"
                    />
                  </div>

                  {/* Mobile version product brief card */}
                  <div className="Right-mobile">
                    <div
                      className="prodBriefing sticky-top"
                      style={{ zIndex: '20' }}
                    >
                      <div className="prodMainName">{LessonDetail.name}</div>

                      <div className="Rating">
                        <div className="star">
                          <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/84522f0e347edba7963eb335fd5301feca031f8d880bba21dd9760a01286c3a5?"
                            className="starImg"
                            alt="Star Rating"
                          />
                          <div className="ratingNumber">
                            {Math.round(LessonDetail.average_rating)}
                          </div>
                          <div className="commentNumber">
                            ({reviews.length})
                          </div>
                        </div>
                        <div className="sales">
                          購買人數 {LessonDetail.sales}
                        </div>
                      </div>

                      <div className="productPrice">
                        <div className="price">NT$ {toLocalePrice}</div>
                        <div className="likesIcon icon-container">
                          <FaHeart
                            className="likesIcon"
                            size="32px"
                            style={{ color: `${colorChange ? 'red' : ''}` }}
                            onClick={colorToggle}
                          />
                        </div>
                      </div>

                      <div className="lengthHomeworkArea">
                        <div className="lengthhomework">
                          <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/81a1d10e78e821775737fe4938ae726e8de4a80804b01bdda9876d9f86f9b1bb?"
                            className="lengthIcon"
                            alt="Course Length"
                          />
                          <div className="lengthHomeworkWord">
                            {LessonDetail.length} 小時
                          </div>
                        </div>
                        <div className="lengthhomework">
                          <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/4552b4fc37047176a87577807414005cf8e8466b4ef23329066c1c39e5dad447?"
                            className="img-10"
                            alt="Homework"
                          />
                          <div className="lengthHomeworkWord">
                            {LessonDetail.homework} 份作業
                          </div>
                        </div>
                      </div>

                      <div className="lessonIntro">{LessonDetail.info}</div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="detail">
                    {/* Unit Overview */}
                    <div className="outline detail-wrapp mt40">
                      <div className="detail-title">單元一覽</div>
                      <div className="list" style={{ borderRadius: '5px' }}>
                        <ul>
                          {LessonDetail.outline &&
                            LessonDetail.outline
                              .split('\n')
                              .map((line, index) => (
                                <li key={index}>{line}</li>
                              ))}
                        </ul>
                      </div>
                    </div>

                    {/* Target Audience */}
                    <div className="suitable mt40">
                      <div className="detail-title">適合對象</div>
                      <div className="list" style={{ borderRadius: '5px' }}>
                        <ul>
                          {LessonDetail.suitable &&
                            LessonDetail.suitable
                              .split('\n')
                              .map((line, index) => (
                                <li key={index}>{line}</li>
                              ))}
                        </ul>
                      </div>
                    </div>

                    {/* What You Will Learn */}
                    <div className="achievement mt40">
                      <div className="detail-title">你將學到</div>
                      <div className="list" style={{ borderRadius: '5px' }}>
                        <ul className="p-0">
                          {LessonDetail.achievement &&
                            LessonDetail.achievement
                              .split('\n')
                              .map((line, index) => (
                                <li key={index}>{line}</li>
                              ))}
                        </ul>
                      </div>
                    </div>

                    {/* Student Feedback */}
                    <div className="reviews mt40">
                      <div className="detail-title">學員回饋</div>
                      <div className="list" style={{ borderRadius: '5px' }}>
                        {/* Comments */}
                        {reviews.map((review, index) => (
                          <div className="review" key={index}>
                            {/* Review Content */}
                            <div className="review-area">
                              <div className="review-title">
                                <img
                                  loading="lazy"
                                  src={`/新增資料夾/user/${review.img}`}
                                  className="review-avatar"
                                  alt="User"
                                />
                                <div className="review-user">
                                  <div className="review-Name">
                                    {review.name}
                                    <div className="review-Date">
                                      {format(
                                        new Date(review.created_time),
                                        'yyyy-MM-dd HH:mm:ss',
                                      )}
                                    </div>
                                  </div>
                                  <div className="review-Star">
                                    <img
                                      loading="lazy"
                                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/cb8fdbe9fe0ec2e2c0415ca248a5486136ce3b7792c4e42b9c5f42d0e78c89a5?"
                                      className="review-star-img"
                                    />
                                    <img
                                      loading="lazy"
                                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/cb8fdbe9fe0ec2e2c0415ca248a5486136ce3b7792c4e42b9c5f42d0e78c89a5?"
                                      className="review-star-img"
                                    />
                                    <img
                                      loading="lazy"
                                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/cb8fdbe9fe0ec2e2c0415ca248a5486136ce3b7792c4e42b9c5f42d0e78c89a5?"
                                      className="review-star-img"
                                    />
                                    <img
                                      loading="lazy"
                                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/cb8fdbe9fe0ec2e2c0415ca248a5486136ce3b7792c4e42b9c5f42d0e78c89a5?"
                                      className="review-star-img"
                                    />
                                    <img
                                      loading="lazy"
                                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/cb8fdbe9fe0ec2e2c0415ca248a5486136ce3b7792c4e42b9c5f42d0e78c89a5?"
                                      className="review-star-img"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="review-content">
                                {review.content}
                              </div>
                            </div>

                            <div className="comment-Like text-right">
                              <div className="comment-Like-Number">
                                {review.likes}
                                人覺得有幫助
                              </div>
                              {/* Like Icon */}
                              <div className="comment-Like-Icon">
                                <img
                                  loading="lazy"
                                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/b33573d1006caa2dd045129e591ff98dd975245bb9b1f9ad55c74a65c6a47d58?"
                                  className="comment-like-icon-img"
                                />
                                <div className="comment-Like-Word">有幫助</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* More Button */}
                      <div className="more-review">
                        <div className="more-review-word">更多回饋</div>
                        {/* Icon */}
                      </div>
                    </div>
                  </div>
                  {/* Instructor Information */}
                  <div className="teacher-info mt40">
                    <div className="detail-title">講師資訊</div>
                    <div className="teacher-info-area">
                      <div
                        className="teacher-img-con"
                        style={{ borderRadius: '5px', overflow: 'hidden' }}
                      >
                        <img
                          loading="lazy"
                          src="/課程與師資/teacher_img/teacher_001.jpeg"
                          className="teacherImg"
                          alt="Teacher"
                        />
                      </div>
                      <div className="teacher-info-word">
                        <div className="teacher-name">徐歡CheerHsu</div>
                        <div className="teacher-info-detail">
                          本身為全職的音樂工作者，也是Youtuber「倆倆」的音樂影片製作人，擁有近百支以上音樂的MV製作經驗，在2017曾創下台灣Youtube熱門創作者影片的第四名，本身頻道總點閱率也達到一千五百萬成績。對於這方面的學習從不間斷，且已將音樂融入為生活習慣。
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/*   ----------------------頁面內容 右半部---------------------- */}
          <div className="hidden sm:block sm:w-1/2 px-6 page-control">
            {LessonDetail && (
              <ProductCard
                className="Right-card"
                id={LessonDetail.id}
                average_rating={LessonDetail.average_rating}
                review_count={LessonDetail.review_count}
                img={LessonDetail.img}
                img_small={LessonDetail.img}
                type={LessonDetail.type}
                lesson_category_id={LessonDetail.lesson_category_id}
                name={LessonDetail.name}
                homework={LessonDetail.homework}
                sales={LessonDetail.sales}
                price={LessonDetail.price}
                discount={LessonDetail.discount}
                discount_state={LessonDetail.discount_state}
                length={LessonDetail.length}
                info={LessonDetail.info}
                onshelf_time={LessonDetail.onshelf_time}
                addLessonItem={addLessonItem}
                notifyBuy={notifyBuy}
              />
            )}
          </div>
        </div>
        {/* 猜你喜歡 */}
        <div className="you-will-like">
          <div className="detail-title ">猜你喜歡...</div>
          <div className="card-con">
            {youWillLike
              .sort((a, b) => b.sales - a.sales) // Sort courses based on sales volume
              .slice(0, 5) // Get top 5 courses
              .map((v, i) => (
                <Card
                  key={i}
                  id={v.id}
                  luid={v.puid}
                  name={v.name}
                  average_rating={Math.round(v.average_rating)}
                  review_count={v.review_count}
                  price={v.price}
                  teacher_name={v.teacher_name}
                  img={v.img}
                  length={v.length}
                  sales={v.sales}
                />
              ))}
          </div>
        </div>
        <div className="you-will-like-mobile">
          <div className="detail-title ">猜你喜歡...</div>
          {/* 手機版card-con */}
          <div className="card-con-mobile">
            {youWillLike
              .sort((a, b) => b.sales - a.sales) // Sort courses based on sales volume
              .slice(0, 3) // Get top 3 courses
              .map((v, i) => (
                <HoriCard
                  key={i}
                  id={v.id}
                  luid={v.puid}
                  name={v.name}
                  average_rating={Math.round(v.average_rating)}
                  review_count={v.review_count}
                  price={v.price}
                  teacher_name={v.teacher_name}
                  img={v.img}
                  length={v.length}
                  sales={v.sales}
                />
              ))}
          </div>
        </div>
      </div>
      <div
        className="shoppingBtn sticky-top"
        style={{ zIndex: '99' }}
        id="shoppingBtn"
      >
        <div
          className="cartBtn"
          onClick={() => {
            notifyBuy(LessonDetail.name)
            addLessonItem(LessonDetail)
          }}
        >
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c240e4bc8653fe6179383ea22f1eb80902c70eec255a944e9d8e0efbf823c4e3?"
            className="cartIcon"
          />
          <div className="cart">加入購物車</div>
        </div>

        <div className="buyBtn">
          <div
            className="buy"
            onClick={() => {
              addLessonItem(LessonDetail)
              router.push('/cart/check')
            }}
          >
            <div className="buy">立即購買</div>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        * {
          box-sizing: -box;
        }
        :root {
          --primary: #1581cc;
          --light-primary: #18a1ff;
          --deep-primary: #124365;
          --dark: #1d1d1d;
          --secondary: #5a5a5a;
          --body: #b9b9b9;
          --yellow: #faad14;
          --red: #ec3f3f;
        }

        body {
          font-family: 'Noto Sans TC', sans-serif;

          & ul {
            list-style: none;
            margin: 0;
          }

          & a {
            text-decoration: none;
          }
        }

        /* --------------- header & navbar --------------- */
        header {
          background-color: var(--primary);
          height: 60px;
          padding: 10px 35px;
          .logo {
            max-width: 180px;
          }
          .logo-mb {
            max-width: 30px;
          }

          @media screen and (max-width: 576px) {
            padding-inline: 20px;
          }
        }

        nav {
          flex: 1;
          max-width: 660px;
        }

        nav a {
          display: block;
          padding: 5px 12px;
          -radius: 10px;
          color: #fff;
          font-size: 20px;
          font-weight: 500;
          &:hover {
            color: var(--deep-primary);
            background-color: #fff;
          }
        }

        .navbar-mb {
          color: #fff;
        }

        /* --------------- container --------------- */
        .container {
          min-height: calc(100vh);
        }
        .content {
          @media screen and (max-width: 576px) {
            padding-top: 0px;
          }
        }
        .breadcrumb-wrapper {
          cursor: pointer;
          transition: 0.3s;
          &:hover {
            color: #1581cc;
          }
        }

        /* prodBriefingArea */
        .prodBriefingArea {
          width: 660px;
          height: 394px;
          padding: 0px;
          border-radius: 10px;
          overflow: hidden;
        }
        .prodImg {
          padding: 0px;

          background-color: #ff9595;
          border-radius: 10px;
        }

        .mt-60 {
          margin-top: 60px;
        }

        /* ------------------ */

        /* 課程細節 */
        .mt40 {
          margin-top: 40px;
        }

        /* detail共用 */
        .detail {
          max-width: 100%;
        }
        .detail-title {
          color: var(--primary-deep, #0d3652);
          font: 700 24px Noto Sans TC, sans-serif;
          margin-bottom: 16px;
        }

        .list {
          background-color: rgba(185, 185, 185, 0.3);
          padding: 8px 12px;
        }

        /*.outline {           
             height: 243px;
          width: 660px;           
        }*/
        .outline ul,
        .suitable ul {
          list-style-type: disc;
        }
        .review-user {
          margin-left: 10px;
        }
        .review-title {
          display: flex;
        }
        .review-avatar {
          aspect-ratio: 1;
          object-fit: auto;
          object-position: center;
          width: 44px;
          high: 44px;
          border: 1px solid black;
          border-radius: 44px;
        }
        .review-Name {
          display: flex;
          color: var(--primary-deep, #124365);
          font-family: 'Noto Sans TC';
          font-size: 16px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
          gap: 10px;
        }

        .comment-Like {
          display: flex;
          justify-content: end;
          gap: 5px;
        }
        .comment-Like-Icon {
          display: flex;
          border-radius: 3px;
          border: 1px solid #1581cc;
          gap: 4px;
        }

        .more-review {
          justify-content: end;
          display: flex;
          margin-right: 20px;
          margin-block: 10px;
          gap: 9px;
          font-size: 16px;
          color: var(--primary, #1581cc);
          font-weight: 700;
          padding: 4px 0 4px 80px;
        }
        .teacher-info {
          /* height: 217px;
          width: 660px; */
        }
        .teacher-info-area {
          display: flex;

          /* height: 166px;
          width: 660px; */
        }
        .teacher-img-con {
          width: 140px;
          height: 140px;
          margin: 8px 16px 8px 12px;
        }
        .teacherImg {
          width: 100%;
          height: auto;
          object-fit: cover;
          overflow: auto;
        }
        .teacher-info-word {
          width: 77%;
        }

        .page-control {
        }

        /* ------------- */

        .you-will-like {
          /* height: 508px; */

          width: 100%;
          margin-top: 30px;
        }
        .card-con {
          padding: 0;
          display: flex;
          justify-content: space-between;
        }
        .card-con-mobile {
          display: block;
        }
        .Right-mobile {
          display: none;
        }
        .you-will-like-mobile {
          display: none;
        }
        .shoppingBtn {
          display: none;
        }
        /* --------------- footer --------------- */

         {
          /* -----------RWD-------------*/
        }
        @media screen and (max-width: 576px) {
          .breadcrumb-wrapper {
            margin-bottom: 0px;
          }
          .Right {
            display: none;
          }

          /* 手機版productbrief-card */

          .prodBriefingArea {
            width: 390px;
            height: 100%;
            aspect-ratio: 1.68;
          }
          .prodImg {
            padding: 0px;
            width: 100%;
            background-color: #ff9595;
            border-radius: 10px;
          }

          .Right-mobile {
            display: block;
          }
          .prodBriefing {
            /* background-color: #ff9595; */

            /* margin-left: 110px; */

            margin-top: 20px;
          }
          .prodMainName {
            color: var(--dark, #1d1d1d);
            /* font: 700 40px Noto Sans TC, sans-serif; */
            font-weight: 700;
            font-size: 40px;
          }
          /*  */
          .font-family {
            font-family: Noto Sans TC, sans-serif;
          }
          /*  */

          .Rating {
            justify-content: space-between;
            display: flex;
            margin-top: 10px;
            width: 100%;
            gap: 20px;
            font-weight: 400;
          }

          .star {
            justify-content: center;
            align-items: center;
            display: flex;
            gap: 10px;
            white-space: nowrap;
          }

          .ratingNumber {
            color: var(--yellow, #faad14);
            align-self: stretch;
            font: 24px Noto Sans TC, sans-serif;
          }

          .commentNumber {
            color: var(--body, #b9b9b9);
            align-self: stretch;
            flex-grow: 1;
            margin: auto 0;
            font: 16px Noto Sans TC, sans-serif;
          }
          .sales {
            color: var(--secondary, #5a5a5a);
            margin: auto 0;
            font: 16px Noto Sans TC, sans-serif;
          }
          .productPrice {
            justify-content: space-between;
            align-items: center;
            display: flex;
            margin-top: 10px;
            gap: 20px;
          }
          .price {
            color: var(--dark, #1d1d1d);
            white-space: nowrap;
            padding: 9px 21px 2px 0;
            font: 700 28px Noto Sans TC, sans-serif;
          }
          .likesIcon {
            justify-content: center;
            align-items: center;
            border-radius: 5px;
            border: 1px solid var(--body, #b9b9b9);
            display: flex;
            aspect-ratio: 1;
            width: 34px;
            height: 34px;
            margin: auto 0;
            padding: 0 7px;
          }
          .likesIcon :hover {
            background-color: #ffc0cb;
          }
          .lengthHomeworkArea {
            display: flex;
          }
          .lengthhomework {
            justify-content: space-between;
            display: flex;
            gap: 5px;
          }

          .lengthHomeworkWord {
            font-family: Noto Sans TC, sans-serif;
            flex-grow: 1;
          }
          .lessonIntro {
          }

          .container {
            padding-bottom: 20px;
          }
          .shoppingBtn {
            display: flex;

            /* margin-top: 20px; */

            justify-content: space-evenly;
            gap: 12px;
            font-size: 16px;
            color: var(--white, #fff);
            font-weight: 700;

            bottom: 0;
            left: 0;
            width: 100%;
            background-color: white;
            padding-bottom: 5px;
            padding: 26px 0px 30px 0px;
            z-index: 1200;
          }

          .cartBtn {
            display: flex;
            justify-content: center;
            border-radius: 5px;
            background-color: var(--body, #b9b9b9);
            gap: 12px;
            padding: 8px;
            margin-left: 5px;
            width: 100%;
          }

          .buyBtn {
            display: flex;
            justify-content: center;
            border-radius: 5px;
            background-color: #18a1ff;
            gap: 12px;
            padding: 8px;
            margin-right: 5px;
            width: 100%;
          }

          /* detail-mobile */

          .detail {
            max-width: 100%;
          }
          .review-content {
            max-width: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .you-will-like {
            display: none;
          }
          .you-will-like-mobile {
            display: block;
          }
          .card-con-mobile {
            display: block;
          }
        }
      `}</style>
    </>
  )
}
