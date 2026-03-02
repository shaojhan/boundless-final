import React from 'react'

interface FilterSettings {
  page: number
  [key: string]: unknown
}

interface PaginationProps {
  totalPages: number
  setFilterSettings: React.Dispatch<React.SetStateAction<FilterSettings>>
  page: number
}

export default function Pagination({
  totalPages,
  setFilterSettings,
  page,
}: PaginationProps) {
  const handlePageChange = (pageNumber: number) => {
    setFilterSettings((c) => ({ ...c, page: pageNumber }))
  }

  return (
    <>
      <div className="container-1200 pagepagination-container">
        <nav aria-label="Page navigation example mx-auto">
          <ul className="pagination">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <a
                className="page-link"
                href="?=page"
                aria-label="Previous"
                onClick={() => handlePageChange(page - 1)}
              >
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index}
                className={`page-item ${page === index + 1 ? 'active' : ''}`}
              >
                <a
                  className="page-link"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </a>
              </li>
            ))}
            <li
              className={`page-item ${page === totalPages ? 'disabled' : ''}`}
            >
              <a
                className="page-link"
                aria-label="Next"
                onClick={() => handlePageChange(page + 1)}
              >
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <style jsx>
        {`
          .container-1200 {
            max-width: 1200px;
            margin: 0 auto;
            padding: 25px;
          }
          @media screen and (max-width: 576px) {
            .width-1200 {
              width: 380px;
            }
          }
          .pagination-container {
            display: flex;
            justify-content: center;
          }
          .page-item {
            cursor: pointer;
          }
          .page-item.disabled {
            pointer-events: none;
            opacity: 0.5;
          }
          .page-item.active .page-link {
            background-color: #265475;
            color: #fff;
            border-color: #265475;
          }
        `}
      </style>
    </>
  )
}
