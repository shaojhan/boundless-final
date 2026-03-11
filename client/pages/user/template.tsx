import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'

export default function Test() {
  return (
    <>
      <Navbar menuMbToggle={() => {}} />
      <div className="container mx-auto px-6">
        {/* 頁面內容 */}
        <main className="main">
          主要內容
        </main>
      </div>
      <Footer />

      <style jsx>{`
        .main {
          min-height: 100svh;
          background-color: rgb(195, 195, 195);
        }
      `}</style>
    </>
  )
}
