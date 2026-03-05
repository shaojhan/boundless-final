export default function LessonCouponDropdowns({
  lessonCoupons,
  handleLessonSelector,
}: {
  lessonCoupons: { id: number; discount: number; name: string }[]
  handleLessonSelector: (raw: string) => void
}) {
  const coupons = lessonCoupons.map((v) => {
    return (
      <option key={v.id} value={JSON.stringify({ discount: v.discount, cuid: v.id })}>
        {v.name}
      </option>
    )
  })

  const select = () => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('LessonCouponRaw')
      return stored ?? 'Default'
    }
    return 'Default'
  }

  return (
    <>
      <select
        id="lessonCoupons"
        className="form-select"
        aria-label="Default select example"
        value={select()}
        onChange={(e) => {
          handleLessonSelector(e.target.value)
        }}
      >
        <option value={'Default'} disabled>
          請選擇折價券
        </option>
        {coupons}
      </select>
    </>
  )
}
