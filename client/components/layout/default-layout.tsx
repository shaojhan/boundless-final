import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'

export default function DefaultLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
