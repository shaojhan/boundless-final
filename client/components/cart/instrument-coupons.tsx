export default function InstrumentCouponDropdowns({
  instrumentCoupons,
  handleInstrumentSelector,
  handleInstrumentCUIDSelector,
}) {
  const coupons = instrumentCoupons.map((v) => {
    return (
      // @ts-expect-error -- non-standard HTML attribute
      <option key={v.id} value={v.discount} name={v.name} cuid={v.id}>
        {v.name}
      </option>
    )
  })

  let select = () => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('InstrumentCoupon')
    } else {
      return ''
    }
  }

  return (
    <>
      <select
        className="form-select"
        aria-label="Default select example"
        defaultValue={0}
        value={select()}
        onChange={(e) => {
          handleInstrumentSelector(e.target.value)
          //目前抓不到
          let cuid = e.target.getAttribute('cuid')
          handleInstrumentCUIDSelector(cuid)
        }}
      >
        <option value={0} disabled>
          請選擇折價券
        </option>
        {coupons}
      </select>
    </>
  )
}
