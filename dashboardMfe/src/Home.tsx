import Badge from "@/components/customcomponents/Badge";
import TableComponent from "@/components/customcomponents/Table/TableComponent";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDevicesTopDataSocket } from "@/utils/customhooks/useDevicesTopDataSocket";
import { BellRing, FileUp, ListX, RefreshCw, Repeat, UserPen } from "lucide-react";
import { getAllDataRefereshedFromCache, getDeviceMetadataPaginatedandSorted, getDevicesNameMacIdList, getDevicesTopLevelData, getMacIdToFileNameMap, getSearchedDeviceMetadataPaginated } from "@/services/deviceservice";
import * as styles from "@/styles/scss/Home.module.scss";
import PopOver from "@/components/chakrauicomponents/PopOver";
import { getLatestAlarms } from "@/services/alarmservice";
import { useDeviceAlertSocket } from "@/utils/customhooks/useDeviceAlertSocket";
import { SortingState } from "@tanstack/react-table";
import FileUploader from "@/components/customcomponents/FileUploader";
import { ProfilePopUp } from "@/components/customcomponents/ProfilePopUp";
import { AlarmPopUp } from "@/components/customcomponents/AlarmPopUp";
import Sidebar from "@/components/customcomponents/SideBar";
import Parcel from 'single-spa-react/parcel';
import { Tooltip } from "@/components/ui/tooltip";
import AlarmToggle from "./components/customcomponents/AlarmToggle";

export default function Home({ mountParcel }) {
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [deviceFileNames, setDeviceFileNames] = useState<any>();
  const initialTabState = "Health"; // Default active tab
  const [activeTab, setActiveTab] = useState(initialTabState);
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState<boolean>(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [currentDeviceFileName, setCurrentDeviceFileName] = useState<string | null>(null);
  const [isAlarmPanelOpen, setIsAlarmPanelOpen] = useState<boolean>(false);
  const [isAlarmPopOverOpen, setIsAlarmPopOverOpen] = useState<boolean>(false);
  const [isProfilePopOverOpen, setIsProfilePopOverOpen] = useState<boolean>(false);
  const [latestAlarms, setLatestAlarms] = useState<any[]>([]);
  const [totalAlarms, setTotalAlarms] = useState<any>(0);
  const [selectedDevicePropertyPanel, setSelectedDevicePropertyPanel] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshDeviceDataKey, setRefreshDeviceDataKey] = useState(0);
  const [hardRefreshDeviceDataKey, setHardRefreshDeviceDataKey] = useState(0);
  const [searchInput, setSearchInput] = useState<any>(null);
  const [updatedFieldsMap, setUpdatedFieldsMap] = useState<{ [macId: string]: string[] } | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [devicesNameMacList, setDevicesNameMacList] = useState<any[] | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const justRefreshedRef = useRef(false);
  const pendingHighlightRef = useRef<{ [macId: string]: string[] } | null>(null);
  const searchInputTimeoutRef = useRef<any>(null);
  const [shouldRenderAlarmParcel, setShouldRenderAlarmParcel] = useState(false);
  const [shouldRenderPropertyParcel, setShouldRenderPropertyParcel] = useState(false);


  useEffect(() => {
    setTotalPages(Math.ceil(totalCount / pageSize));
    setCurrentPage(1);
  }, [pageSize, totalCount]);

  useEffect(() => {
    const fetchLatestAlarmData = async () => {
      const response = await getLatestAlarms();
      if (!response)
        console.log("Network response was not ok");

      if (response && response.data) {
        setLatestAlarms(response.data.alarms);
        setTotalAlarms(response.data.totalAlarms);
      }
    };

    fetchLatestAlarmData();
  }, []);

  // Handle incoming SignalR updates for devices top level data
  const handleUpdate = useCallback((msg: string) => {
    const rawDevices = JSON.parse(msg);
    console.log("WebSocket update received", rawDevices);

    const isDefaultSorting =
      sorting.length === 0;
    const isSortingOnStatusConnectivityOrLastUpdated =
      sorting.some((s: any) => s.id === "status" || s.id === "connectivity" || s.id === "lastUpdated");

    setDeviceData((prevDevices) => {
      let updatedMacIds: string[] = [];
      let updatedMap: { [macId: string]: string[] } = {};
      let hasChange = false;

      const updatedDevices = prevDevices.map((existingDevice) => {
        const incoming = rawDevices.find((d: any) => d.MacId === existingDevice.macId);
        if (!incoming) return existingDevice;

        const changedFields: string[] = [];
        const updatedDevice = { ...existingDevice };

        if ("Status" in incoming && incoming.Status !== existingDevice.status) {
          updatedDevice.status = incoming.Status;
          changedFields.push("status");
        }

        if ("Connectivity" in incoming && incoming.Connectivity !== existingDevice.connectivity) {
          updatedDevice.connectivity = incoming.Connectivity;
          changedFields.push("connectivity");
        }


        if ("LastUpdated" in incoming) {
          updatedDevice.lastUpdated = incoming.LastUpdated;
        }

        if (changedFields.length > 0) {
          hasChange = true;
          changedFields.push("lastUpdated");
          updatedMacIds.push(existingDevice.macId);
          updatedMap[existingDevice.macId] = changedFields;
          return updatedDevice;
        }

        return existingDevice;
      });

      if (hasChange) {
        console.log("Devices updated:", updatedMacIds);
        // If not on page 1, skip highlight and reordering
        if (currentPage !== 1) {
          setRefreshDeviceDataKey(prev => prev + 1);
          justRefreshedRef.current = true;
          return prevDevices;
        }

        if (justRefreshedRef.current) {
          setTimeout(() => {
            setUpdatedFieldsMap(updatedMap);
            highlightTimeoutRef.current = setTimeout(() => setUpdatedFieldsMap(null), 3000);
            justRefreshedRef.current = false;
          }, 100);
        } else {
          setUpdatedFieldsMap(updatedMap);
          if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = setTimeout(() => setUpdatedFieldsMap(null), 3000);
        }

        if (isDefaultSorting) {
          const updatedSet = new Set(updatedMacIds);
          const updatedRows = updatedDevices.filter((d) => updatedSet.has(d.macId));
          const restRows = updatedDevices.filter((d) => !updatedSet.has(d.macId));
          return [...updatedRows, ...restRows];
        }

        if (isSortingOnStatusConnectivityOrLastUpdated) {
          pendingHighlightRef.current = updatedMap;
          setRefreshDeviceDataKey(prev => prev + 1);
          justRefreshedRef.current = true;
        }

        return updatedDevices;
      }

      if (currentPage !== 1) {
        setRefreshDeviceDataKey(prev => prev + 1);
        justRefreshedRef.current = true;
        return prevDevices;
      }

      // Handle unseen updates (on page 1 with matching MacId not visible)
      const incomingMacs = new Set(rawDevices.map((d: any) => d.MacId));
      const currentMacs = new Set(prevDevices.map((d) => d.macId));
      const unseenUpdates = Array.from(incomingMacs).filter(mac => !currentMacs.has(mac));

      if (unseenUpdates.length > 0 && currentPage === 1 && (searchInput === "" || searchInput == null)) {
        const unseenMap: { [macId: string]: string[] } = {};
        rawDevices.forEach((d: any) => {
          if (!currentMacs.has(d.MacId)) {
            const fields: string[] = [];
            if ("Status" in d) fields.push("status");
            if ("Connectivity" in d) fields.push("connectivity");
            if ("Connectivity" in d || "Status" in d) fields.push("lastUpdated");
            unseenMap[d.MacId] = fields;
          }
        });

        pendingHighlightRef.current = unseenMap;
        setRefreshDeviceDataKey(prev => prev + 1);
        justRefreshedRef.current = true;
      }

      return prevDevices;
    });

  }, [sorting, currentPage, searchInput]);


  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleAlertUpdates = useCallback((msg: string) => {
    const incomingUpdates = JSON.parse(msg);

    setLatestAlarms(incomingUpdates.alarms);
    setTotalAlarms(incomingUpdates.totalAlarms);
  }, []);

  // SignalR connection for devices top level data
  useDevicesTopDataSocket(handleUpdate);

  //signalR for alarms data
  useDeviceAlertSocket("sampleDeviceId", handleAlertUpdates, "ReceiveMainPageUpdates");

  // Initial data fetch
  useEffect(() => {
    const fetchDevicesFileNames = async () => {
      const response = await getMacIdToFileNameMap();
      if (!response)
        console.log("Network response was not ok");

      if (response && response.data) {
        setDeviceFileNames(response.data);
      }
    };

    const fetchDevicesData = async () => {
      const response = await getDevicesNameMacIdList();
      if (!response)
        console.log("Network response was not ok");

      if (response && response.data) {
        setDevicesNameMacList(response.data);
      }
    };

    fetchDevicesData();
    fetchDevicesFileNames();
  }, [hardRefreshDeviceDataKey]);

  useEffect(() => {
    if (pendingHighlightRef.current && deviceData.length > 0) {
      const pendingMap = pendingHighlightRef.current;
      const macIdsInData = new Set(deviceData.map(d => d.macId));

      const validPendingMap: { [macId: string]: string[] } = {};
      Object.entries(pendingMap).forEach(([macId, fields]) => {
        if (macIdsInData.has(macId)) {
          validPendingMap[macId] = fields;
        }
      });

      if (Object.keys(validPendingMap).length > 0) {
        setUpdatedFieldsMap(validPendingMap);

        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }

        highlightTimeoutRef.current = setTimeout(() => {
          setUpdatedFieldsMap(null);
        }, 3000);
      }

      pendingHighlightRef.current = null;
    }
  }, [deviceData]);

  useEffect(() => {
    if (searchInput == "" || searchInput == null) {
      const fetchDevicesData = async () => {
        const response = await getDeviceMetadataPaginatedandSorted(currentPage, pageSize, sorting);
        if (!response)
          console.log("Network response was not ok");

        if (response && response.data) {
          setDeviceData(response.data.data);
          setTotalCount(response.data.totalCount);
        }
      };

      fetchDevicesData();
    }
  }, [pageSize, currentPage, refreshDeviceDataKey, sorting, searchInput]);

  useEffect(() => {
    if (searchInput == "" || searchInput == null) {
      return;
    }
    else if (searchInput != null) {
      const fetchSearchedDevicesData = async () => {
        const response = await getSearchedDeviceMetadataPaginated(currentPage, pageSize, searchInput, sorting);
        if (!response)
          console.log("Network response was not ok");

        if (response && response.data) {
          setDeviceData(response.data.data);
          setTotalCount(response.data.totalCount);
        }
      }
      fetchSearchedDevicesData();
    }
  }, [searchInput, sorting, pageSize, currentPage, refreshDeviceDataKey]);

  useEffect(() => {
    if (isAlarmPanelOpen) {
      const timer = setTimeout(() => setShouldRenderAlarmParcel(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderAlarmParcel(false);
    }

    if (isPropertyPanelOpen) {
      const timer = setTimeout(() => setShouldRenderPropertyParcel(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderPropertyParcel(false);
    }
  }, [isAlarmPanelOpen, isPropertyPanelOpen]);

  const changeSearchInput = (value: string) => {
    if (value == null || value == "")
      setSearchInput("");
    if (searchInputTimeoutRef.current)
      clearTimeout(searchInputTimeoutRef.current);

    searchInputTimeoutRef.current = setTimeout(() => {
      setSearchInput(value);
    }, 1000);
  }

  const openPropertypanel = (deviceId: string) => {
    setActiveTab(initialTabState); // Reset to default tab
    setIsPropertyPanelOpen(true);
    setCurrentDeviceFileName(deviceFileNames[deviceId] || null);
    setCurrentDeviceId(deviceId);
  }

  const closePropertyPanel = () => {
    setIsPropertyPanelOpen(false);
    setCurrentDeviceId(null);
    setSelectedDevicePropertyPanel(null);
    setCurrentDeviceFileName(null);
  }

  const getRefreshedData = async () => {
    const response = await getAllDataRefereshedFromCache(currentPage, pageSize, sorting, searchInput);
    if (!response)
      console.log("Network response was not ok");

    if (response && response.data) {
      setDeviceData(response.data.data);
      setTotalCount(response.data.totalCount);
      setHardRefreshDeviceDataKey(prev => prev + 1); // Trigger hard refresh when data refreshed in backend cache
    }
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden" }} >
      <div className={styles.upperNav}>
        <div onMouseEnter={() => setIsAlarmPopOverOpen(true)} onMouseLeave={() => setIsAlarmPopOverOpen(false)}>
          <PopOver shouldOpen={latestAlarms && latestAlarms.length > 0} isOpen={isAlarmPopOverOpen}
            triggerContent={
              <div className={styles.alarmIconContainer}>
                <BellRing cursor="pointer" size={25} fill="#fbc02d"
                  onClick={(event: any) => {
                    event.stopPropagation();
                    setIsAlarmPanelOpen((prev) => !prev);
                  }}
                />
                <div className={styles.badgeConainer}>
                  <Badge label={totalAlarms} bgColor="darkgrayColor" textColor="light" />
                </div>
              </div>
            }
          >
            {(latestAlarms && latestAlarms.length > 0) && (<AlarmPopUp latestAlarms={latestAlarms} totalAlarms={totalAlarms} setIsAlarmPanelOpen={setIsAlarmPanelOpen} />)}
          </PopOver>
        </div>
        <div onMouseEnter={() => setIsProfilePopOverOpen(true)} onMouseLeave={() => setIsProfilePopOverOpen(false)}>
          <PopOver isOpen={isProfilePopOverOpen}
            triggerContent={
              <div className={styles.alarmIconContainer}>
                <UserPen cursor="pointer" size={25} fill="#000" />
              </div>
            }
          >
            <ProfilePopUp />
          </PopOver>
        </div>
      </div>

      <div className='m-3'>
        {totalAlarms > 0 &&
          <Sidebar openIconMsg={"Open Alarm Panel"} closeIconMsg={"Close Alarm Panel"} position="left" isOpen={isAlarmPanelOpen} setIsOpen={setIsAlarmPanelOpen} >
            {(isAlarmPanelOpen && shouldRenderAlarmParcel) &&
              // <AlarmPanel devicesNameMacList={devicesNameMacList} setSelectedDevicePropertyPanel={setSelectedDevicePropertyPanel} selectedDevicePropertyPanel={selectedDevicePropertyPanel} />
              <Parcel
                config={() => import("http://localhost:8082/set-alarmPanelMfe.js").then((mod: any) => ({
                  bootstrap: mod.bootstrap,
                  mount: mod.mount,
                  unmount: mod.unmount,
                  update: mod.update
                }))}
                mountParcel={mountParcel}
                customProps={{
                  setSelectedDevicePropertyPanel: setSelectedDevicePropertyPanel,
                  selectedDevicePropertyPanel: selectedDevicePropertyPanel,
                  devicesNameMacList: devicesNameMacList,
                  name: "Alarm Panel"
                }}
              />
            }
          </Sidebar>}

        <div>
          <span className={`py-3 ${styles.mainPageTitle}`}>Welcome back, Premal Kadam</span>
          <div className={`py-2 pr-4 ${styles.subNav}`}>
            <input onChange={(event: any) => { changeSearchInput(event.target.value) }} className={styles.mainPageSearchInput} placeholder="Search..." />
            <div className={styles.mainPageIcons}>
              <div>
                <AlarmToggle />
              </div>
              <div className={""} >
                <FileUploader setHardRefreshDeviceDataKey={setHardRefreshDeviceDataKey} setRefreshDeviceDataKey={setRefreshDeviceDataKey} />
              </div>
              {(sorting && sorting.length > 0) &&
                <Tooltip openDelay={100} closeDelay={150} content={<span className="p-2">Clear sorting</span>}>
                  <ListX className={styles.deviceRefreshIcon} onClick={() => { setSorting([]) }} strokeWidth={"2.5px"} size={25} cursor={"pointer"} />
                </Tooltip>}
              {deviceData && deviceData.length > 0 &&
                <Tooltip openDelay={100} closeDelay={150} content={<span className="p-2">Refresh Device Cache</span>}>
                  <Repeat className={styles.deviceRefreshIcon} onClick={() => { getRefreshedData(); justRefreshedRef.current = true; }} strokeWidth={"2.5px"} size={25} cursor={"pointer"} />
                </Tooltip>}
            </div>
          </div>
        </div>

        <div className={styles.bodyContainer}>
          <div className={`${styles.pageWrapper} ${isPropertyPanelOpen ? styles.pushRight : ''}`}>
            <TableComponent currentDeviceId={currentDeviceId} sorting={sorting} setSorting={setSorting} refreshDeviceDataKey={refreshDeviceDataKey} updatedFieldsMap={updatedFieldsMap} totalPages={totalPages} pageSize={pageSize} setPageSize={setPageSize} setCurrentPage={setCurrentPage} currentPage={currentPage} data={deviceData} setIsPropertyPanelOpen={openPropertypanel} />
          </div>
          {(deviceData && deviceData.length > 0) &&
            <Sidebar openIconMsg={"Open Property Panel"} closeIconMsg={"Close Property Panel"} position="right" isOpen={isPropertyPanelOpen} setIsOpen={setIsPropertyPanelOpen} closeSidebar={closePropertyPanel}>
              {(isPropertyPanelOpen && shouldRenderPropertyParcel) &&
                // <PropertyPanel deviceFileNames={deviceFileNames} devicesNameMacList={devicesNameMacList} setCurrentDeviceId={setCurrentDeviceId} setCurrentDeviceFileName={setCurrentDeviceFileName} setIsAlarmPanelOpen={setIsAlarmPanelOpen} setSelectedDevicePropertyPanel={setSelectedDevicePropertyPanel} activeTab={activeTab} setActiveTab={setActiveTab} currentDeviceId={currentDeviceId} currentDeviceFileName={currentDeviceFileName} />
                <Parcel
                  // key={`${currentDeviceId}-${currentDeviceFileName}-${activeTab}`}
                  config={() => import("http://localhost:8081/set-propertyPanelMfe.js").then((mod: any) => ({
                    bootstrap: mod.bootstrap,
                    mount: mod.mount,
                    unmount: mod.unmount,
                    update: mod.update
                  }))}
                  mountParcel={mountParcel}
                  customProps={{
                    deviceFileNames: deviceFileNames,
                    devicesNameMacList: devicesNameMacList,
                    setCurrentDeviceId: setCurrentDeviceId,
                    setCurrentDeviceFileName: setCurrentDeviceFileName,
                    setIsAlarmPanelOpen: setIsAlarmPanelOpen,
                    setSelectedDevicePropertyPanel: setSelectedDevicePropertyPanel,
                    activeTab: activeTab,
                    setActiveTab: setActiveTab,
                    currentDeviceId: currentDeviceId,
                    currentDeviceFileName: currentDeviceFileName,
                    name: "Property Panel"
                  }}
                />
              }
            </Sidebar>}
        </div>
      </div>
    </div>
  );
};
