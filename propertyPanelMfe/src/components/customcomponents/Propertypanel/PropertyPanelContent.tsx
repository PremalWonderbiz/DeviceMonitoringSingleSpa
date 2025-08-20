import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as styles from "@/styles/scss/PropertyPanel.module.scss";
import { getLatestAlarmForDevice } from "@/services/alarmservice";
import { formatRelativeTime, getCollapsedAncestorsToHighlight } from "@/utils/helperfunctions";
import { useDeviceAlertSocket } from "@/utils/customhooks/useDeviceAlertSocket";
import { useAccordionState } from "@/components/customcomponents/Propertypanel/AccordionVisibilityContext";
import { renderKeyValueSection, renderObject } from "@/utils/propertypanelfunctions";
import Badge from "@/components/customcomponents/Badge";
import { Alarm, AlarmUpdateMessage } from "@/models/propertyPanelInterfaces";

export const StaticTabContent = React.memo(({ staticProps }: { staticProps: any }) => {
  return (
    <div className={`${styles.propertyPanelTabContent}`}>
      {Object.entries(staticProps).map(([key, value]: any) => {
        if (typeof value === "object" && value !== null)
          return renderObject(key, value, 1, "", [], new Set());
        else
          return (
            <div className={styles.keyValueSection} key={key}>
              {renderKeyValueSection(key, value, 0, "", [])}
            </div>
          );
      })}
    </div>
  );
});

export const HealthTabContent = React.memo(
  ({
    highlightedPaths,
    deviceName,
    setIsAlarmPanelOpen,
    setSelectedDevicePropertyPanel,
    deviceMacId,
    dynamicProps,
  }: any) => {
    const [alarm, setAlarm] = useState<Alarm | null>(null);
    const [totalAlarmsForDevice, setTotalAlarmsForDevice] = useState<number>(0);
    const accordionContext = useAccordionState();

    const collapsedTitlesToHighlight = useMemo(() => {
      return getCollapsedAncestorsToHighlight(highlightedPaths, accordionContext?.state || {});
    }, [highlightedPaths, accordionContext?.state]);

    const handleAlertUpdates = (msg: string) => {
      if (msg == "") {
        setAlarm(null);
        setTotalAlarmsForDevice(0);
      }
      const incomingUpdates: AlarmUpdateMessage = JSON.parse(msg);
      if (incomingUpdates) {
        setAlarm(incomingUpdates.alarm);
        setTotalAlarmsForDevice(incomingUpdates.totalAlarms);
      } else {
        setAlarm(null);
        setTotalAlarmsForDevice(0);
      }
    };

    useDeviceAlertSocket(deviceMacId, handleAlertUpdates, "ReceivePropertyPanelAlarmUpdates");

    useEffect(() => {
      const fetchLatestAlarmData = async () => {
        const response = await getLatestAlarmForDevice(deviceMacId);
        if (response?.data) {
          setAlarm(response.data.alarm);
          setTotalAlarmsForDevice(response.data.totalAlarms);
        } else {
          setAlarm(null);
          setTotalAlarmsForDevice(0);
        }
      };

      fetchLatestAlarmData();
    }, [deviceMacId]);

    return (
      <div className={styles.propertyPanelTabContent}>
        {alarm && (
          <div className={styles.alarmCard}>
            <div>
              <p className={styles.message}>{alarm.message}</p>
              <span className={styles.time}>{formatRelativeTime(alarm.raisedAt)}</span>
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAlarmPanelOpen(true);
                    setSelectedDevicePropertyPanel({ deviceMacId, deviceName });
                  }}
                  className={styles.viewBtn}
                >
                  View related alarms
                  <span className="ml-2">
                    <Badge label={totalAlarmsForDevice.toString()} bgColor="neutral" textColor="dark" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {Object.entries(dynamicProps).map(([key, value]: any) => {
          if (typeof value === "object" && value !== null)
            return renderObject(key, value, 1, "", highlightedPaths, collapsedTitlesToHighlight);
          else
            return (
              <div className={styles.keyValueSection} key={key}>
                {renderKeyValueSection(key, value, 0, "", highlightedPaths)}
              </div>
            );
        })}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.deviceMacId === nextProps.deviceMacId &&
      JSON.stringify(prevProps.highlightedPaths) === JSON.stringify(nextProps.highlightedPaths)
    );

  }
);