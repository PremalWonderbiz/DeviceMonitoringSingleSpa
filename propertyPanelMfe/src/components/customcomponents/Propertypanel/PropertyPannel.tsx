import React, { useCallback, useEffect, useRef, useState } from "react";
import Accordion from "../Accordion";
import { useDeviceDetailSocket } from "@/utils/customhooks/useDeviceDetailSocket";
import TabList from "./TabList";
import { HealthTabContent, StaticTabContent } from "./PropertyPanelContent";
import { getPropertyPanelData } from "@/services/deviceservice";
import * as styles from "@/styles/scss/PropertyPanel.module.scss";
import { getChangedPaths } from "@/utils/deepDiff";
import ComboBox from "@/components/customcomponents/SelectDevicesComboBox";
import { AccordionStateProvider } from "./AccordionVisibilityContext";
import { deepMerge } from "@/utils/propertypanelfunctions";
import { DeviceDetailUpdate, DeviceNameMac, PropertyPanelData } from "@/models/propertyPanelInterfaces";


const PropertyPanel = ({ setCurrentDeviceId, setCurrentDeviceFileName, deviceFileNames, devicesNameMacList, setIsAlarmPanelOpen, setSelectedDevicePropertyPanel, currentDeviceId, currentDeviceFileName, activeTab, setActiveTab }: any) => {
    const [propertyPanelData, setPropertyPanelData] = useState<PropertyPanelData | null>(null);
    const [highlightedPaths, setHighlightedPaths] = useState<string[]>([]);
    const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [shouldConnectSignalR, setShouldConnectSignalR] = useState<boolean>(true);
    const [selectedDevices, setSelectedDevices] = useState<DeviceNameMac[]>([]);

    const handleUpdate = useCallback((msg: any) => {
        const incomingDevicesDetails: DeviceDetailUpdate = JSON.parse(msg);

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
            setCurrentDeviceFileName(deviceFileNames[deviceId!] || null)
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
                <ComboBox
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
                    <span className={styles.deviceTitle}>{propertyPanelData?.name}</span>
                    <span className={styles.deviceSubTitle}>{propertyPanelData?.type}</span>
                </div>
                <div className="mt-2">
                    <AccordionStateProvider>
                        <Accordion keyPath={activeTab} isTabList={true} title={<TabList highlightedPaths={highlightedPaths} activeTab={activeTab} setActiveTab={changeActiveTab} />} defaultOpen={true} bgColor=''>
                            {(activeTab === "Static" && propertyPanelData?.staticProperties) ?
                                <StaticTabContent staticProps={propertyPanelData.staticProperties} />
                                : <HealthTabContent highlightedPaths={highlightedPaths} deviceName={propertyPanelData?.name} setSelectedDevicePropertyPanel={setSelectedDevicePropertyPanel} setIsAlarmPanelOpen={setIsAlarmPanelOpen} deviceMacId={propertyPanelData?.macId} dynamicProps={propertyPanelData?.dynamicProperties} />}
                        </Accordion>
                    </AccordionStateProvider>
                </div>
            </div>
        );
    }

    return (
        <div className=''>
            {renderPropertyPanelData(propertyPanelData)}
        </div>
    );
};

export default PropertyPanel;