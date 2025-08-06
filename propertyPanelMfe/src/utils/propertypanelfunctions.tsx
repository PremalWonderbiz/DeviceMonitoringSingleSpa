import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as styles from "@/styles/scss/PropertyPanel.module.scss";
import KeyValueField from "@/components/customcomponents/Propertypanel/KeyValueField";
import Accordion from "@/components/customcomponents/Accordion";

export const renderKeyValueSection = (
  key: string,
  value: any,
  depth: number,
  parentPath: string,
  highlightedPaths: string[]
) => {
  const fullPath = parentPath ? `${parentPath}.${key}` : key;
  return (
    <KeyValueField
      key={fullPath}
      keyName={key}
      value={value}
      depth={depth}
      fullPath={fullPath}
      highlightedPaths={highlightedPaths}
    />
  );
};

export const renderObject = (
  key: string,
  data: any,
  depth = 1,
  parentPath = "",
  highlightedPaths: string[],
  collapsedTitlesToHighlight: Set<string>,
) => {
  const fullPath = parentPath ? `${parentPath}.${key}` : key;
  const shouldHighlightTitle = collapsedTitlesToHighlight.has(fullPath);

  if (!data || typeof data !== "object") return null;

  if (Array.isArray(data)) {
    return renderArray(key, data, depth, parentPath, highlightedPaths, collapsedTitlesToHighlight);
  }

  return (
    <Accordion
      keyPath={fullPath}
      key={fullPath}
      title={
        <span className={`${styles.propertyPanelTitles} ${styles[`depth-${depth}`]} ${shouldHighlightTitle ? styles.highlightedTitle : ""}`}>
          {key}
        </span>
      }
      defaultOpen={true}
      bgColor="white"
    >
      <div className={styles.keyValueSection}>
        {Object.entries(data).map(([childKey, childVal]) => {
          const childPath = `${fullPath}.${childKey}`;
          if (Array.isArray(childVal)) {
            return renderArray(childKey, childVal, depth + 1, fullPath, highlightedPaths, collapsedTitlesToHighlight);
          } else if (typeof childVal === "object" && childVal !== null) {
            return renderObject(childKey, childVal, depth + 1, fullPath, highlightedPaths, collapsedTitlesToHighlight);
          } else {
            return renderKeyValueSection(childKey, childVal, depth + 1, fullPath, highlightedPaths);
          }
        })}
      </div>
    </Accordion>
  );
};

export const renderArray = (
  key: string,
  data: any[],
  depth: number,
  parentPath = "",
  highlightedPaths: string[],
  collapsedTitlesToHighlight: Set<string>
) => {
  if (!data || data.length === 0) return null;

  const fullPath = parentPath ? `${parentPath}.${key}` : key;
  const shouldHighlightTitle = collapsedTitlesToHighlight.has(fullPath);

  return (
    <Accordion
      keyPath={fullPath}
      key={fullPath}
      title={
        <span className={`${styles.propertyPanelTitles} ${styles[`depth-${depth}`]} ${shouldHighlightTitle ? styles.highlightedTitle : ""}`}>
          {key}
        </span>
      }
      defaultOpen={true}
      bgColor="white"
    >
      <div className={styles.keyValueSection}>
        {data.map((item, idx) => {
          const itemPath = `${fullPath}`;

          const displayLabel = `${key} ${idx}`;

          if (typeof item === "object" && item !== null) {
            return renderObject(displayLabel, item, depth + 1, itemPath, highlightedPaths, collapsedTitlesToHighlight);
          } else {
            return renderKeyValueSection(displayLabel, item, depth + 1, itemPath, highlightedPaths);
          }
        })}
      </div>
    </Accordion>
  );
};

export function deepMerge(target: any, source: any): any {
  if (Array.isArray(target) && Array.isArray(source)) {
    // Merge arrays element-wise
    return target.map((item, index) => deepMerge(item, source[index] ?? item));
  }

  if (typeof target === "object" && typeof source === "object") {
    const result: any = { ...target };
    for (const key of Object.keys(source)) {
      if (key in target) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  return source; // For primitives and fallback
}




