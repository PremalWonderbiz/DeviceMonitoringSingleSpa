import React, { useCallback, useEffect, useRef, useState } from "react";
import Accordion from "../Accordion";
import { useDeviceDetailSocket } from "@/utils/customhooks/useDeviceDetailSocket";
import TabList from "./TabList";
import { HealthTabContent, StaticTabContent } from "./PropertyPanelContent";
import { getPropertyPanelData } from "@/services/deviceservice";
import * as styles from "@/styles/scss/PropertyPanel.module.scss";
import { getChangedPaths } from "@/utils/deepDiff";
import { AccordionStateProvider } from "./AccordionVisibilityContext";
import { deepMerge } from "@/utils/propertypanelfunctions";
import SelectDevicesComboBox from "@/components/customcomponents/SelectDevicesComboBox";


const PropertyPanel = ({ setCurrentDeviceId, setCurrentDeviceFileName, deviceFileNames, devicesNameMacList, setIsAlarmPanelOpen, setSelectedDevicePropertyPanel, currentDeviceId, currentDeviceFileName, activeTab, setActiveTab }: any) => {
    const [PropertyPanelData, setPropertyPanelData] = useState<any>(null);
    const [highlightedPaths, setHighlightedPaths] = useState<string[]>([]);
    const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [shouldConnectSignalR, setShouldConnectSignalR] = useState<boolean>(true);
    const [selectedDevices, setSelectedDevices] = useState<any[]>([]);
    
    const handleUpdate = useCallback((msg: any) => {
        const incomingDevicesDetails = JSON.parse(msg);        

        setPropertyPanelData((prev: any) => {
            if (!prev) return prev;

            const merged = {
                ...prev,
                dynamicProperties: deepMerge(prev.dynamicProperties, incomingDevicesDetails)
            };

            const changed = getChangedPaths(prev.dynamicProperties, incomingDevicesDetails);
            setHighlightedPaths(changed);

            if (highlightTimeoutRef.current) {
                clearTimeout(highlightTimeoutRef.current);
            }

            highlightTimeoutRef.current = setTimeout(() => {
                setHighlightedPaths([]);
            }, 3000);

            return merged;
        });
    }, []);

    useEffect(() => {
        return () => {
            if (highlightTimeoutRef.current) {
                clearTimeout(highlightTimeoutRef.current);
            }
        };
    }, []);


    useEffect(() => {
        if (selectedDevices.length == 1) {
            const deviceId = selectedDevices[0].deviceMacId;
            setCurrentDeviceId(deviceId);
            setCurrentDeviceFileName(deviceFileNames[deviceId] || null)
        }
    }, [selectedDevices]);

    useDeviceDetailSocket(currentDeviceId, handleUpdate, shouldConnectSignalR);

    useEffect(() => {
        if (currentDeviceFileName && currentDeviceId) {
            const fetchData = async () => {
                const response = await getPropertyPanelData(currentDeviceFileName);
                if (!response)
                    console.log("Network response was not ok");

                if (response && response.data) {
                    setPropertyPanelData(response.data);
                }
            };
            fetchData();
        }
    }, [currentDeviceId]);

    const changeActiveTab = (tab: any) => {
        tab === "Static" ? setShouldConnectSignalR(false) : setShouldConnectSignalR(true);
        setActiveTab(tab);
    }

    function renderSelectDeviceDropdown() {
        return (
            <div className={styles.selectDeviceDropdown}>
                <span>Select device </span>
                <SelectDevicesComboBox
                    devices={devicesNameMacList}
                    selectedDevices={selectedDevices}
                    setSelectedDevices={setSelectedDevices}
                    multiple={false}
                />
            </div>
        )
    }

    function renderPropertyPanelData(data: any) {
        if (!data || Object.keys(data).length === 0)
            return renderSelectDeviceDropdown();

        return (
            <div className="pt-2">
                {/* <span className={`pl-2`}>{PropertyPanelData.name} : {PropertyPanelData.type}</span><br /> */}
                <div className={`pl-2 ${styles.propertyPanelHeadingContainer}`}>
                    <span className={styles.deviceTitle}>{PropertyPanelData.name}</span>
                    <span className={styles.deviceSubTitle}>{PropertyPanelData.type}</span>
                </div>
                <div className="mt-2">
                    <AccordionStateProvider>
                    <Accordion keyPath={activeTab} isTabList={true} title={<TabList highlightedPaths={highlightedPaths} activeTab={activeTab} setActiveTab={changeActiveTab} />} defaultOpen={true} bgColor=''>
                        {(activeTab === "Static" && PropertyPanelData.staticProperties) ?
                            <StaticTabContent staticProps={PropertyPanelData.staticProperties} />
                            : <HealthTabContent highlightedPaths={highlightedPaths} deviceName={PropertyPanelData.name} setSelectedDevicePropertyPanel={setSelectedDevicePropertyPanel} setIsAlarmPanelOpen={setIsAlarmPanelOpen} deviceMacId={PropertyPanelData.macId} dynamicProps={PropertyPanelData.dynamicProperties} />}
                    </Accordion>
                    </AccordionStateProvider>
                </div>
            </div>
        );
    }

    return (
        <div className=''>
            {renderPropertyPanelData(PropertyPanelData)}
        </div>
    );
};

export default PropertyPanel;