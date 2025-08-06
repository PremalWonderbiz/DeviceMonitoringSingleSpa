import { handleAxiosError } from "@/utils/helperfunctions";
import { baseURL } from "@/utils/helpervariables";
import axios from "axios";

//get property panel data for a device
export const getPropertyPanelData = async (currentDeviceFileName: any) => {
  try {
    const response = await axios.get(`${baseURL}/api/Devices/getPropertyPanelData/${currentDeviceFileName}`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const getSearchedDeviceMetadataPaginated = async (pageNo : any, pageSize : any, input : any, sortingState : any) => {
  try {
    const requestObject = {pageNumber : pageNo, pageSize : pageSize, sorting : sortingState };
    const response = await axios.post(`${baseURL}/api/Devices/search/metadata/${input}`, requestObject);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const getDeviceMetadataPaginatedandSorted = async (pageNo : any, pageSize : any, sortingState : any) => {
  try {
    const requestObject = {pageNumber : pageNo, pageSize : pageSize, sorting : sortingState };
    const response = await axios.post(`${baseURL}/api/Devices/metadata`,requestObject);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const getAllDataRefereshedFromCache = async (pageNo : any, pageSize : any, sortingState : any, input : any) => {
  try {
    (input == null || input == undefined || input == "") ? input = "undefined" : input = input;
    const requestObject = {pageNumber : pageNo, pageSize : pageSize, sorting : sortingState };
    const response = await axios.post(`${baseURL}/api/Devices/refreshCache/${input}`,requestObject);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const uploadFile = async (file : File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${baseURL}/api/Devices/uploadFile`,formData);
    return response;
  } catch (error : any) {
     return error;
  }
};


export const getDevicesTopLevelData = async (pageNo : any, pageSize : any) => {
  try {
    const response = await axios.get(`${baseURL}/api/Devices/metadata/${pageNo}/${pageSize}`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const getDevicesNameMacIdList = async () => {
  try {
    const response = await axios.get(`${baseURL}/api/Devices/getDevicesNameMacIdList`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};

export const getMacIdToFileNameMap = async () => {
  try {
    const response = await axios.get(`${baseURL}/api/Devices/getMacIdToFileNameMap`);
    return response;
  } catch (error : any) {
     handleAxiosError(error);
  }
};