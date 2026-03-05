export default function InstrumentCouponDropdowns({
  instrumentCoupons,
  handleInstrumentSelector,
}: {
  instrumentCoupons: { id: number; discount: number; name: string }[]
  handleInstrumentSelector: (raw: string) => void
}) {
  const coupons = instrumentCoupons.map((v) => {
    return (
      <option key={v.id} value={JSON.stringify({ discount: v.discount, cuid: v.id })}>
        {v.name}
      </option>
    )
  })

  const select = () => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('InstrumentCouponRaw')
      return stored ?? 'Default'
    }
    return 'Default'
  }

  return (
    <>
      <select
        className="form-select"
        aria-label="Default select example"
        value={select()}
        onChange={(e) => {
          handleInstrumentSelector(e.target.value)
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
