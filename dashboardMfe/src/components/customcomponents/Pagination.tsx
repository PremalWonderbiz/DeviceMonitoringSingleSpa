import React, { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import * as styles from "@/styles/scss/Pagination.module.scss";

const Pagination = ({ currentPage, totalPages, pageSize, pageSizeOptions, setCurrentPage, setPageSize, }: any) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const handlePageClick = (page: any) => setCurrentPage(page);
  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    selectRef.current?.blur();
  }

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(currentPage - 1, 2);
      const right = Math.min(currentPage + 1, totalPages - 1);
      pages.push(1);
      if (left > 2) pages.push("...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((page, i) =>
      page === "..." ? (
        <span key={`ellipsis-${i}`} >...</span>
      ) : (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`${styles.paginationButton} ${currentPage === page ? styles.activeButton : ""
            }`}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.middleSection}>
        <button data-testid="previous-button" onClick={handlePrev} disabled={currentPage === 1} className={styles.paginationButton}>
          <ChevronLeft size={16} />
        </button>

        {renderPageNumbers()}

        <button data-testid="next-button" onClick={handleNext} disabled={currentPage === totalPages} className={styles.paginationButton}>
          <ChevronRight size={16} />
        </button>

        <div className={styles.selectWrapper}>
          <select
            data-testid="page-size-selector"
            ref={selectRef}
            value={pageSize}
            onChange={handlePageSizeChange}
            className={styles.pageSizeSelector}
            onFocus={() => setIsSelectOpen(true)}
            onBlur={() => setIsSelectOpen(false)}
          >
            {pageSizeOptions.map((size: number) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>

          <span className={styles.selectIcon}>
            {isSelectOpen ? <ChevronUp data-testid="pageSize-chevronup" size={18} strokeWidth={"2.5px"} /> : <ChevronDown data-testid="pageSize-chevrondown" size={18} strokeWidth={"2.5px"} />}
          </span>
        </div>
      </div>

      <div className={styles.rightSection}>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
