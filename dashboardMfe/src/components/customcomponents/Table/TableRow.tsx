import React, { useEffect, useState } from "react";
import * as styles from "@/styles/scss/Table.module.scss";
import { flexRender, Row } from "@tanstack/react-table";

type Props = {
  row: Row<any>;
  setIsPropertyPanelOpen: (id: string) => void;
  updatedFieldsMap: { [macId: string]: string[] } | null;
  refreshDeviceDataKey?: any;
  currentDeviceId : any;
};

const TableRow = React.memo(
  ({ currentDeviceId, refreshDeviceDataKey = undefined, updatedFieldsMap, row, setIsPropertyPanelOpen }: Props) => {
    const rowData = row.original;
    const macId = rowData.macId;

    const [localUpdatedFields, setLocalUpdatedFields] = useState<any[]>([]);

    useEffect(() => {
      const updatedFields = updatedFieldsMap?.[macId];
      
      if (updatedFields && updatedFields.length > 0) {
        setLocalUpdatedFields(updatedFields);

        const timer = setTimeout(() => {
          setLocalUpdatedFields([]);
        }, 3000);

        return () => clearTimeout(timer);
      }else{
        setLocalUpdatedFields([])
      }
    }, [updatedFieldsMap?.[macId]]);

    useEffect(() => {  
      if (refreshDeviceDataKey)    
        setLocalUpdatedFields([]);
    }, [refreshDeviceDataKey]);

    return (
      <tr
        className={`${localUpdatedFields.length > 0 ? styles.highlightedRow : ""} ${styles.row} ${currentDeviceId && currentDeviceId == macId ? styles.rowSelected : ""}`}
        key={macId}
        onClick={() => setIsPropertyPanelOpen(macId)}
      >
        {row.getVisibleCells().map((cell: any) => {
          const columnId = cell.column.id;
          const isUpdated = localUpdatedFields.includes(columnId);
          
          return (
            <td
              key={cell.id}
              className={`${styles.cell} ${isUpdated ? styles.highlightedCell : ""}`} >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
      </tr>
    );
  },
  areEqual
);

export function areEqual(prevProps: Props, nextProps: Props) {
  const prevRow = prevProps.row.original;
  const nextRow = nextProps.row.original;

  if (prevProps.refreshDeviceDataKey !== nextProps.refreshDeviceDataKey) {
    return false; // re-render on refresh
  }

  if (prevProps.currentDeviceId !== nextProps.currentDeviceId) {
    return false;
  }

  if (
    prevRow.macId !== nextRow.macId ||
    prevRow.status !== nextRow.status ||
    prevRow.connectivity !== nextRow.connectivity
  ) {
    return false;
  }

  // Compare updatedFieldsMap contents
  const prevFields = prevProps.updatedFieldsMap?.[prevRow.macId] ?? [];
  const nextFields = nextProps.updatedFieldsMap?.[nextRow.macId] ?? [];

  if (prevFields.length !== nextFields.length) return false;
  for (let i = 0; i < prevFields.length; i++) {
    if (prevFields[i] !== nextFields[i]) return false;
  }

  return true;
}

export default TableRow;
