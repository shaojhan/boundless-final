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
      return stored ?? 'none'
    }
    return 'none'
  }

  return (
    <>
      <select
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
        aria-label="Default select example"
        value={select()}
        onChange={(e) => {
          handleInstrumentSelector(e.target.value)
        }}
      >
        <option value="none">不使用折價券</option>
        {coupons}
      </select>
    </>
  )
}
