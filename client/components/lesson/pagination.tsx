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

  const linkBase =
    'block px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm cursor-pointer'
  const activeLink = 'bg-[#265475] text-white border-[#265475]'

  return (
    <div className="container-1200 pagepagination-container">
      <nav aria-label="Page navigation example mx-auto">
        <ul className="flex gap-1 items-center list-none p-0 m-0">
          <li
            className={`inline-block cursor-pointer ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            <a
              className={linkBase}
              href="?=page"
              aria-label="Previous"
              onClick={() => handlePageChange(page - 1)}
            >
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          {Array.from({ length: totalPages }, (_, index) => (
            <li key={index} className="inline-block cursor-pointer">
              <a
                className={`${linkBase} ${page === index + 1 ? activeLink : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => handlePageChange(index + 1)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handlePageChange(index + 1)
                }
              >
                {index + 1}
              </a>
            </li>
          ))}
          <li
            className={`inline-block cursor-pointer ${page === totalPages ? 'pointer-events-none opacity-50' : ''}`}
          >
            <a
              className={linkBase}
              aria-label="Next"
              role="button"
              tabIndex={0}
              onClick={() => handlePageChange(page + 1)}
              onKeyDown={(e) => e.key === 'Enter' && handlePageChange(page + 1)}
            >
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
