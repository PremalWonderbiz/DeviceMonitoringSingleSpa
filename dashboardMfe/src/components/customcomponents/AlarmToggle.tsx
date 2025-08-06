import { useEffect, useState } from "react";
import * as styles from '@/styles/scss/AlarmToggle.module.scss'
import { getAlarmToggleValue, setAlarmToggleValue } from "@/services/deviceservice";
import { Switch } from "@chakra-ui/react"
import { HiCheck, HiX } from "react-icons/hi"

export default function AlarmToggle() {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const fetchAlarmToggleStatus = async () => {
            const response = await getAlarmToggleValue();
            if (!response)
                console.log("Network response was not ok");

            if (response && response.data) {
                console.log(response.data, typeof response.data);

                setEnabled(response.data.alarmEnabled);
            }
        };
        fetchAlarmToggleStatus();
    }, []);

    const toggleAlarm = () => {
        const setAlarmToggleStatus = async () => {
            const response = await setAlarmToggleValue(!enabled);
            if (!response)
                console.log("Network response was not ok");

            if (response && response.data) {
                setEnabled(response.data.alarmEnabled);
            }
        };
        setAlarmToggleStatus();
    };

    return (
        <Switch.Root checked={enabled} colorPalette={"green"} size="lg">
            <Switch.HiddenInput />
            <Switch.Control onClick={toggleAlarm}>
                <Switch.Thumb>
                    <Switch.ThumbIndicator fallback={<HiX color="black" />}>
                        <HiCheck />
                    </Switch.ThumbIndicator>
                </Switch.Thumb>
            </Switch.Control>
            <Switch.Label>Alarms {enabled ? "On" : "Off"}</Switch.Label>
        </Switch.Root>
    );
}
