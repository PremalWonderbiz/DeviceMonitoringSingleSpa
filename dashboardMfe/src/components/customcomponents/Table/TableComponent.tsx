import React, { useEffect, useMemo, useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, ColumnDef, SortingState, } from "@tanstack/react-table";
import * as styles from "@/styles/scss/Table.module.scss";
import TableRow from "@/components/customcomponents/Table/TableRow";
import { ArrowDown, ArrowUp } from "lucide-react";
import Pagination from "../Pagination";
import { capitalizeFirstLetter, formatDateTime } from "@/utils/helperfunctions";

const TableComponent = ({ currentDeviceId, sorting, setSorting, refreshDeviceDataKey, updatedFieldsMap, currentPage, setCurrentPage, totalPages, pageSize, setPageSize, data, setIsPropertyPanelOpen }: any) => {
  if (!data || data.length === 0)
    return <p className="px-2">No data available.</p>;

  // Columns definition
  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    // const excludedFields = ['lastUpdated'];

    return Object.keys(data[0])
      // .filter((key) => !excludedFields.includes(key))
      .map((key) => ({
        accessorKey: key,
        header: () => capitalizeFirstLetter(key),
        cell: (info) => {
          const val = info.getValue();
          return key === 'lastUpdated' ? formatDateTime(val) : val;
        },
        enableSorting: true,
      }));
  }, [data]);

  // Table instance
  const table = useReactTable({
    data,
    columns,
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className={styles.row}>
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortDir = header.column.getIsSorted(); // false | 'asc' | 'desc'
                    return (
                      <th key={header.id}
                        className={styles.header}
                        onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className={styles.sortIcon}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && (sortDir === "asc" ? (<ArrowUp size={16} />) : sortDir === "desc" ? (<ArrowDown size={16} />) : null)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
          </table>
        </div>
        <div className={styles.tableBody}>
          <table className={`${styles.table}`}>
            <tbody>
              {table.getRowModel().rows.map((row) => (<TableRow currentDeviceId={currentDeviceId} refreshDeviceDataKey={refreshDeviceDataKey} updatedFieldsMap={updatedFieldsMap} key={row.id} row={row} setIsPropertyPanelOpen={setIsPropertyPanelOpen} />))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination setPageSize={setPageSize} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} pageSize={pageSize} pageSizeOptions={[3, 5, 10]} />
    </>
  );
};

export default TableComponent;
