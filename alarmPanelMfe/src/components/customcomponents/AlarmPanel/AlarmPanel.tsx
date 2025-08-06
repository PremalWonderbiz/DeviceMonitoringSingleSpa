// components/AlarmPanel.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as styles from "@/styles/scss/AlarmPanel.module.scss";
import Badge from '../Badge';
import Accordion from '../Accordion';
import { getAlarmPanelData, ignoreAlarm, investigateAlarm, resolveAlarm } from '@/services/alarmservice';
import { useDeviceAlertSocket } from '@/utils/customhooks/useDeviceAlertSocket';
import SelectDevicesComboBox from '@/components/customcomponents/SelectDevicesComboBox';
import { DateRangePicker } from 'rsuite';
import { Badge as ChakraBadge, CloseButton, Wrap } from "@chakra-ui/react";
import AlarmCard from './AlarmCard';
import { Tooltip } from '@/components/ui/tooltip';
import { ListX } from 'lucide-react';


const priorityMap: any = {
  Critical: 0,
  Warning: 1,
  Information: 2,
};

const AlarmPanel = ({ devicesNameMacList, selectedDevicePropertyPanel, setSelectedDevicePropertyPanel }: any) => {  
  console.log(selectedDevicePropertyPanel);
  
  const [unacknowledgedAlarms, setUnacknowledgedAlarms] = useState<any[]>([]);
  const [acknowledgedAlarms, setAcknowledgedAlarms] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [shouldConnectSignalR, setShouldConnectSignalR] = useState<boolean>(true);
  // const [alarmStates, setAlarmStates] = useState<any[]>([]);
  const [currentExpandedUnackAlarm, setCurrentExpandedUnackAlarm] = useState<string>("");
  const [currentExpandedAckAlarm, setCurrentExpandedAckAlarm] = useState<string>("");

  const handleAlertUpdates = useCallback((msg: string) => {
    const incomingUpdates = JSON.parse(msg);
    if (incomingUpdates) {
      filterAndSortAlarms(incomingUpdates);
    }
  }, []);

  // SignalR connection for alarm panel data  
  useDeviceAlertSocket("sampleDeviceId", handleAlertUpdates, "ReceiveAlarmPanelUpdates", shouldConnectSignalR);

  const severityColors: Record<string, { bg: string; color: string }> = {
    Critical: { bg: 'criticalAlarm', color: 'light' },
    Warning: { bg: 'warningAlarm', color: 'dark' },
    Information: { bg: 'infoAlarm', color: 'light' },
  };

  const fetchData = async (selectedDevices: any[], dateRange: any) => {
    const response = await getAlarmPanelData({ "devices": selectedDevices || [], "filterDateRange": dateRange || [] });
    if (!response)
      console.log("Network response was not ok");

    if (response && response.data) {
      filterAndSortAlarms(response.data);
    }
  };

  useEffect(() => {
    if (devicesNameMacList)
      setDevices(devicesNameMacList)
  }, []);

  // useEffect(() => {
  //   const fetchAlarmStates = async () => {
  //     const response = await getAlarmStates();
  //     if (!response)
  //       console.log("Network response was not ok");

  //     if (response && response.data) {
  //       setAlarmStates(response.data);
  //     }
  //   };

  //   fetchAlarmStates();
  // }, []);

  useEffect(() => {
    if (!selectedDevicePropertyPanel) {    
      fetchData(selectedDevices.map((s: any) => s.deviceMacId), dateRange);
      (selectedDevices.length == 0 && dateRange == null) ? setShouldConnectSignalR(true) : setShouldConnectSignalR(false);
    }
  }, [selectedDevices, dateRange]);

  useEffect(() => {
    if (selectedDevicePropertyPanel) {      
      setSelectedDevices([selectedDevicePropertyPanel]);
      const timer = setTimeout(() => setSelectedDevicePropertyPanel(null), 50);
      return () => clearTimeout(timer);
    }
  }, [selectedDevicePropertyPanel]);

  function filterAndSortAlarms(data: any) {
    const investigatingAlarms = sortAlarmsDataBySeverity(data.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Investigating"));
    const resolvedAlarms = sortAlarmsDataBySeverity(data.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Resolved"));
    setAcknowledgedAlarms([...investigatingAlarms, ...resolvedAlarms]);
    setUnacknowledgedAlarms(sortAlarmsDataBySeverity(data.filter((alarm: any) => !alarm.isAcknowledged)));
  }

  function sortAlarmsDataBySeverity(alarms: any) {
    return alarms.sort((a: any, b: any) => {
      const severityDiff = priorityMap[a.severity] - priorityMap[b.severity];
      if (severityDiff !== 0) return severityDiff;

      // If same severity, sort by date (newest first)
      return new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime();
    });
  }

  const investigateAlarmData = async (alarmId: any) => {
    const response = await investigateAlarm(alarmId);
    if (!response)
      console.log("Network response was not ok");

    if (response && response.data) {
      const ackAlarm = unacknowledgedAlarms.find((a: any) => a.id == alarmId);
      ackAlarm.alarmState = "Investigating";
      ackAlarm.isAcknowledged = true;
      ackAlarm.alarmComment = response.data.alarmComment;
      setUnacknowledgedAlarms((prev: any) => prev.filter((a: any) => a.id != alarmId));
      const ackAlarms = [ackAlarm, ...acknowledgedAlarms];
      const investigatingAlarms = sortAlarmsDataBySeverity(ackAlarms.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Investigating"));
      const resolvedAlarms = sortAlarmsDataBySeverity(ackAlarms.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Resolved"));
      setAcknowledgedAlarms([...investigatingAlarms, ...resolvedAlarms]);
    }
  }

  const resolveAlarmData = async (alarmId: any, input: any) => {
    const response = await resolveAlarm(alarmId, input);
    if (!response)
      console.log("Network response was not ok");

    if (response && response.data) {
      const ackAlarm = unacknowledgedAlarms.find((a: any) => a.id == alarmId);
      ackAlarm.alarmState = response.data.alarmState;
      ackAlarm.isAcknowledged = response.data.isAcknowledged;
      ackAlarm.alarmComment = response.data.alarmComment;
      ackAlarm.acknowledgedFrom = response.data.acknowledgedFrom;
      setUnacknowledgedAlarms((prev: any) => prev.filter((a: any) => a.id != alarmId));
      const ackAlarms = [ackAlarm, ...acknowledgedAlarms];
      const investigatingAlarms = sortAlarmsDataBySeverity(ackAlarms.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Investigating"));
      const resolvedAlarms = sortAlarmsDataBySeverity(ackAlarms.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Resolved"));
      setAcknowledgedAlarms([...investigatingAlarms, ...resolvedAlarms]);
    }
  }

  const resolveInvestigatedAlarmData = async (alarmId: any, input: any) => {
    const response = await resolveAlarm(alarmId, input);
    if (!response)
      console.log("Network response was not ok");

    if (response && response.data) {
      const updatedAlarm = {
        ...acknowledgedAlarms.find((a: any) => a.id == alarmId),
        alarmState: response.data.alarmState,
        isAcknowledged: response.data.isAcknowledged,
        alarmComment: response.data.alarmComment,
        acknowledgedFrom: response.data.acknowledgedFrom,
      };

      const newAckList = acknowledgedAlarms.map((a: any) =>
        a.id === alarmId ? updatedAlarm : a
      );

      const investigatingAlarms = sortAlarmsDataBySeverity(newAckList.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Investigating"));
      const resolvedAlarms = sortAlarmsDataBySeverity(newAckList.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Resolved"));
      setAcknowledgedAlarms([...investigatingAlarms, ...resolvedAlarms]);
    }
  }

  const removeunacknowledgedAlarm = async (alarmId: any, input:any) => {
    const response = await ignoreAlarm(alarmId,input);
    if (!response)
      console.log("Network response was not ok");

    if (response && response.data) {
      const newUnackList = unacknowledgedAlarms.filter((a: any) =>
        a.id != alarmId
      );

      const unAckalarms = sortAlarmsDataBySeverity(newUnackList);
      setUnacknowledgedAlarms(unAckalarms);
    }
  }

  const removeacknowledgedAlarm = async (alarmId: any, input:any) => {
    const response = await ignoreAlarm(alarmId,input);
    if (!response)
      console.log("Network response was not ok");

    if (response && response.data) {
      const newAckList = acknowledgedAlarms.filter((a: any) =>
        a.id != alarmId
      );

      const investigatingAlarms = sortAlarmsDataBySeverity(newAckList.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Investigating"));
      const resolvedAlarms = sortAlarmsDataBySeverity(newAckList.filter((alarm: any) => alarm.isAcknowledged && alarm.alarmState == "Resolved"));
      setAcknowledgedAlarms([...investigatingAlarms, ...resolvedAlarms]);
    }
  }

  const clearAlarmFilter = () => {
    setSelectedDevices([]);
    setDateRange(null);
  }

  return (
    <div className={styles.panel}>
      <div>
        <div className={styles.header}>
          <h2>Alarms
            <span className={styles.count}>
              <Badge label={(unacknowledgedAlarms.length + acknowledgedAlarms.length).toString()} bgColor="neutral" textColor="dark" />
            </span>
          </h2>
          {(selectedDevices.length > 0 || dateRange != null) && <Tooltip openDelay={100} closeDelay={150} content={<span className="p-2">Clear alarm filter</span>}>
            <ListX className={styles.clearAlarmFilterIcon} onClick={() => { clearAlarmFilter() }} strokeWidth={"2.5px"} size={23} cursor={"pointer"} />
          </Tooltip>}
        </div>

        <div className={styles.selectFilters}>
          <SelectDevicesComboBox devices={devices} selectedDevices={selectedDevices} setSelectedDevices={setSelectedDevices} />

          {dateRange && <Wrap gap="2">
            <ChakraBadge padding="0.25rem 0 0.25rem 0.4rem" display="flex" alignItems="center" gap="0.2rem" fontSize={"0.7rem"}>
              {`${dateRange[0].toLocaleDateString()} ~ ${dateRange[1].toLocaleDateString()}`}
              <CloseButton size={"sm"} boxSize="0.1em" cursor="pointer" onClick={(e) => { e.stopPropagation(); setDateRange(null) }} />
            </ChakraBadge>
          </Wrap>}
          <DateRangePicker value={dateRange} onChange={(value) => { setDateRange(value) }} placeholder="Select Date Range" placement="bottomStart" />
        </div>
      </div>

      <div className={`${styles.downContainer}`}>
        <div className={`${styles.section}`}>
          <Accordion
            title={<h3 className={styles.alarmPanelTitles}>Unacknowledged <span className={styles.sectionCount}>
              <Badge label={unacknowledgedAlarms.length.toString()} bgColor="neutral" textColor="dark" />
            </span></h3>} defaultOpen={true} bgColor='white'>

            <div className={`${styles.alarmsAccordionSection}`}>
              {unacknowledgedAlarms.map(alarm => {
                return (
                  <div className={`${styles.alarmCard}`} key={alarm.id} >
                    <AlarmCard key={alarm.id} removeunacknowledgedAlarm={removeunacknowledgedAlarm} setCurrentExpandedUnackAlarm={setCurrentExpandedUnackAlarm} currentExpandedUnackAlarm={currentExpandedUnackAlarm} alarm={alarm} investigateAlarm={investigateAlarmData} resolveAlarm={resolveAlarmData} />
                  </div>
                );
              })}
            </div>
          </Accordion>
        </div>

        <div className={styles.section}>
          <Accordion
            title={<h3 className={styles.alarmPanelTitles}>Acknowledged <span className={styles.sectionCount}>
              <Badge label={acknowledgedAlarms.length.toString()} bgColor="neutral" textColor="dark" />
            </span></h3>} defaultOpen={true} bgColor='white'
          >
            <div className={`${styles.alarmsAccordionSection}`}>
              {acknowledgedAlarms.map(alarm => {
                return (
                  <div className={`${styles.alarmCard}`} key={alarm.id}>
                    <AlarmCard removeacknowledgedAlarm={removeacknowledgedAlarm} setCurrentExpandedAckAlarm={setCurrentExpandedAckAlarm} currentExpandedAckAlarm={currentExpandedAckAlarm} key={alarm.id} alarm={alarm} investigateAlarm={investigateAlarmData} resolveAlarm={resolveAlarmData} resolveInvestigatedAlarmData={resolveInvestigatedAlarmData} />
                  </div>
                );
              })}
            </div>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default AlarmPanel;