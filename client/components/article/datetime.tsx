import React from 'react'

const DateComponent = ({ published_time }) => {
  const createdYear = new Date(published_time).getFullYear()
  const createdMonth = new Date(published_time).getMonth() + 1
  const createdDate = new Date(published_time).getDate()
  const combineDate = `${createdYear}-${createdMonth}-${createdDate}`

  return (
    <>
      <span>{combineDate}</span>
    </>
  )
}

export default DateComponent
