import { handleAxiosError } from "@/utils/helperfunctions";
import { alarmServiceBaseURL } from "@/utils/helpervariables";
import axios from "axios";

export const getAlarmPanelData = async (alarmsFilters: any) => {  
  try {    
    const response = await axios.post(`${alarmServiceBaseURL}/api/Alarms/getAlarms`, alarmsFilters);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const getLatestAlarms = async () => {
  try {
    const response = await axios.get(`${alarmServiceBaseURL}/api/Alarms/getLatestAlarms`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const getLatestAlarmForDevice = async (deviceMacId : any) => {
  try {
    const response = await axios.get(`${alarmServiceBaseURL}/api/Alarms/getLatestAlarmForDevice/${deviceMacId}`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const investigateAlarm = async (alarmId: any) => {
  try {
    const response = await axios.put(`${alarmServiceBaseURL}/api/Alarms/investigateAlarm/${alarmId}`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const resolveAlarm = async (alarmId: any, input : string) => {
  const value = (input && input.length > 0) ? input :  "manual";
  try {
    const response = await axios.put(`${alarmServiceBaseURL}/api/Alarms/resolveAlarm/${alarmId}/${value}`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const ignoreAlarm = async (alarmId: any, input : string) => {
  const value = (input && input.length > 0) ? input :  "manual";
  try {
    const response = await axios.delete(`${alarmServiceBaseURL}/api/Alarms/ignoreAlarm/${alarmId}/${value}`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

//alarm states
export const getAlarmStates = async () => {
  try {
    const response = await axios.get(`${alarmServiceBaseURL}/api/Alarms/getAlarmStates`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

