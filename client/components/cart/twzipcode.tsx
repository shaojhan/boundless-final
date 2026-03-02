import { useEffect, useState } from 'react'
import TWZipcode from '@/pages/cart/twzipcode.module.scss'
import { countries, townships, postcodes } from '@/data/cart/twzipcode-data'

export default function Twzipcode({
  initPostcode = '',
  onPostcodeChange = (_country, _township, _postcode) => {},
}) {
  const [countryIndex, setCountryIndex] = useState(-1)
  const [townshipIndex, setTownshipIndex] = useState(-1)

  const [postcode, setPostcode] = useState('')

  useEffect(() => {
    if (initPostcode) {
      setPostcode(initPostcode)

      for (let i = 0; i < postcodes.length; i++) {
        for (let j = 0; j < postcodes[i].length; j++) {
          if (postcodes[i][j] === initPostcode) {
            setCountryIndex(i)
            setTownshipIndex(j)
            return // 跳出巢狀for迴圈
          }
        }
      }
    }
  }, [initPostcode])

  // 當countryIndex, townshipIndex均有值時，設定postcode值
  useEffect(() => {
    if (countryIndex > -1 && townshipIndex > -1) {
      setPostcode(postcodes[countryIndex][townshipIndex])
      localStorage.setItem('Postcode', postcode)
    }
  }, [countryIndex, townshipIndex])

  useEffect(() => {
    if (postcode && postcode !== initPostcode) {
      onPostcodeChange(
        countries[countryIndex],
        townships[countryIndex][townshipIndex],
        postcode,
      )
      localStorage.setItem('Postcode', postcode)
      let newCountry = countries[countryIndex]
      localStorage.setItem('Country', newCountry)
      let newTownship = townships[countryIndex][townshipIndex]
      localStorage.setItem('Township', newTownship)
    }
  }, [postcode])

  return (
    <>
      <div className="sm:w-1/4 px-6">
        <label htmlFor="country" className={`${TWZipcode.form_label}`}>
          縣/市
        </label>
        <select
          className="form-select w-1/4 px-6"
          name="country"
          id="country"
          value={countryIndex}
          onChange={(e) => {
            setCountryIndex(Number(e.target.value))
          }}
        >
          <option value={-1}>請選擇縣市</option>
          {countries.map((v, i) => {
            return (
              <option key={i} value={i}>
                {v}
              </option>
            )
          })}
        </select>
      </div>
      <div className="sm:w-1/4 px-6">
        <label htmlFor="district" className={`${TWZipcode.form_label}`}>
          區/鎮/鄉
        </label>
        <select
          className="form-select"
          name="district"
          id="district"
          value={townshipIndex}
          onChange={(e) => {
            setTownshipIndex(Number(e.target.value))
          }}
        >
          <option value={-1}>請選擇鄉鎮區</option>
          {countryIndex > -1 &&
            townships[countryIndex].map((value, index) => (
              <option key={index} value={index}>
                {value}
              </option>
            ))}
        </select>
      </div>
      <div className={`${TWZipcode.postcode} w-auto px-6`}>
        <label htmlFor="postcode" className={`${TWZipcode.form_label}`}>
          郵遞區號
        </label>
        {/* @ts-expect-error -- non-standard HTML attribute */}
        <div id="postcode" name="postcode">
          {postcode}
        </div>
      </div>
    </>
  )
}
