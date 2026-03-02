import ReactPaginate from 'react-paginate'
import { FaChevronRight } from 'react-icons/fa6'
import { FaChevronLeft } from 'react-icons/fa6'

interface BS5PaginationProps {
  forcePage: number
  onPageChange: (_selectedItem: { selected: number }) => void
  pageCount: number
}

export default function BS5Pagination({
  forcePage,
  onPageChange,
  pageCount,
}: BS5PaginationProps) {
  return (
    <ReactPaginate
      forcePage={forcePage}
      nextLabel={<FaChevronRight />}
      onPageChange={onPageChange}
      pageRangeDisplayed={3}
      marginPagesDisplayed={2}
      pageCount={pageCount}
      previousLabel={<FaChevronLeft />}
      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      nextClassName="page-item"
      nextLinkClassName="page-link"
      breakLabel="..."
      breakClassName="page-item"
      breakLinkClassName="page-link"
      containerClassName="pagination"
      activeClassName="active"
      renderOnZeroPageCount={null}
    />
  )
}
