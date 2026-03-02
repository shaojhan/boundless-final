import { useEffect, useState } from 'react';
import Navbar from '@/components/common/navbar';
import NavbarMb from '@/components/common/navbar-mb';
import Footer from '@/components/common/footer';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import jamHero from '@/assets/jam-hero.png';
// icons
import { IoHome } from 'react-icons/io5';
import { FaChevronRight } from 'react-icons/fa6';
import { IoIosSearch } from 'react-icons/io';
import { FaFilter } from 'react-icons/fa6';
import { FaSortAmountDown } from 'react-icons/fa';
import { ImExit } from 'react-icons/im';
import { IoClose } from 'react-icons/io5';
import { FaPlus } from 'react-icons/fa';
import { FaMinus } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa6';
import { FiMinus } from 'react-icons/fi';

export default function Test() {
  // ----------------------手機版本  ----------------------
  // 主選單
  const [showMenu, setShowMenu] = useState(false);
  const menuMbToggle = () => {
    setShowMenu(!showMenu);
  };

  // ----------------------假資料  ----------------------

  const [filterVisible, setFilterVisible] = useState(false);
  useEffect(() => {
    document.addEventListener('click', (e) => {
      setFilterVisible(false);
    });
  }, []);
  // 阻止事件冒泡造成篩選表單關閉
  const stopPropagation = (e) => {
    e.stopPropagation();
  };
  // 顯示表單
  const onshow = (e) => {
    stopPropagation(e);
    setFilterVisible(!filterVisible);
  };

  return (
    <>
      <Navbar menuMbToggle={menuMbToggle} />
      <div className="container position-relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb d-sm-none d-flex flex-column align-items-center ${
            showMenu ? 'menu-mb-show' : ''
          }`}
        >
          {/* 用戶資訊 */}
          <div className="menu-mb-user-info d-flex align-items-center flex-column mb-3">
            <div className="mb-photo-wrapper mb-2">
              <Image
                src="/jam/amazingshow.jpg"
                alt="user photo mb"
                fill
              ></Image>
            </div>
            <div>用戶名稱</div>
          </div>
          <Link
            className="mm-item"
            href="/user"
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
            <ImExit size={20} className="ms-2" />
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-sm-8">
            {/* 麵包屑 */}
            <div
              className="breadcrumb-wrapper"
              style={{ paddingBlock: '20px 30px' }}
            >
              <ul className="d-flex align-items-center p-0 m-0">
                <IoHome size={20} />
                <li style={{ marginLeft: '8px' }}>Let&apos;s JAM!</li>
                <FaChevronRight />
                <Link href="/jam/recruit-list">
                  <li style={{ marginLeft: '10px' }}>團員募集</li>
                </Link>

                <FaChevronRight />
                <li style={{ marginLeft: '10px' }}>JAM 資訊</li>
              </ul>
            </div>
            {/* 主內容 */}
            <main className="content"></main>
          </div>

          {/*   ----------------------頁面內容  ---------------------- */}
          <h2>測試 return 範例</h2>
          <form action="/return" method="post">
            <input type="hidden" name="CustomField1" value="" />
            <input type="hidden" name="CustomField2" value="" />
            <input type="hidden" name="CustomField3" value="" />
            <input type="hidden" name="CustomField4" value="" />
            <input type="hidden" name="MerchantID" value="2000132" />
            <input
              type="hidden"
              name="MerchantTradeNo"
              value="test1684501999793"
            />
            <input
              type="hidden"
              name="PaymentDate"
              value="2023/05/19 21:13:40"
            />
            <input type="hidden" name="PaymentType" value="WebATM_TAISHIN" />
            <input type="hidden" name="PaymentTypeChargeFee" value="10" />
            <input type="hidden" name="RtnCode" value="1" />
            <input type="hidden" name="RtnMsg" value="交易成功" />
            <input type="hidden" name="SimulatePaid" value="0" />
            <input type="hidden" name="StoreID" value="" />
            <input type="hidden" name="TradeAmt" value="100" />
            <input type="hidden" name="TradeDate" value="2023/05/19 21:13:20" />
            <input type="hidden" name="TradeNo" value="2305192113200629" />
            <input
              type="hidden"
              name="CheckMacValue"
              value="46300C00739FCBBAEF33EE1CF7EF26212ED94C6DE82E8B6769E163AA2571D2D8"
            />

            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
      <Footer />

      <style jsx>{``}</style>
    </>
  );
}
