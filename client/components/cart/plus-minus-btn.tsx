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
    <div className="flex">
      <button
        className={`${Instrument.quantity_left_minus} inline-flex items-center justify-center rounded cursor-pointer bg-gray-100 text-dark hover:bg-gray-200`}
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
        className={`${Instrument.input_number} w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
        id="quantity"
        name="quantity"
        defaultValue={v.qty}
        min={1}
        max={100}
      />
      <button
        className={`${Instrument.quantity_right_plus} inline-flex items-center justify-center rounded cursor-pointer bg-primary text-white hover:bg-deep-primary`}
        onClick={() => {
          increment(items, v.id)
        }}
      >
        <FaPlus />
      </button>
    </div>
  )
}
