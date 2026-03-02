//react icons
import { FaPlus } from 'react-icons/fa'
import { FaMinus } from 'react-icons/fa'

export default function PlusMinusBtn({
  Instrument,
  v,
  items,
  increment,
  decrement,
  remove,
}) {
  return (
    <div className="input-group">
      <button
        className={`${Instrument.quantity_left_minus} btn btn-light`}
        onClick={() => {
          if (v.qty === 1) {
            remove(items, v.id)
          } else {
            decrement(items, v.id)
          }
        }}
      >
        <FaMinus />
      </button>
      <input
        type="text"
        className={`${Instrument.input_number} form-control`}
        id="quantity"
        name="quantity"
        defaultValue={v.qty}
        min={1}
        max={100}
      />
      <button
        className={`${Instrument.quantity_right_plus} btn btn-primary`}
        onClick={() => {
          increment(items, v.id)
        }}
      >
        <FaPlus />
      </button>
    </div>
  )
}
