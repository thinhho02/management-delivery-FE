import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import API from "./httpConfig";


export type APIResponse<T> = {
    success: true;
    result: T;
    status?: number
} | {
    success: false;
    error: string;
    status?: number
}


export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    try {
        const res: AxiosResponse<T> = await API.get<T>(url, config);
        return { success: true, result: res.data, status: 200 };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.log(error)
            return { success: false, error: error.response?.data.message || "Request failed", status: error.status };
        }
        return { success: false, error: "Unexpected error occurred", status: 500 };
    }
};



export const create = async <T>(url: string, data: FormData | Record<string, any>, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    try {
        const res: AxiosResponse<T> = await API.post<T>(url, data, config);
        console.log(res)
        return { success: true, result: res.data };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.log(error)
            return { success: false, error: error.response?.data.message || "Request failed", status: error.status };
        }
        return { success: false, error: "Unexpected error occurred", status: 500 };
    }
};


export const update = async <T>(url: string, data: FormData | Record<string, any>, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    try {
        const res: AxiosResponse<T> = await API.put<T>(url, data, config);
        return { success: true, result: res.data };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.log(error)
            return { success: false, error: error.response?.data.message || "Request failed", status: error.status };
        }
        return { success: false, error: "Unexpected error occurred", status: 500 };
    }
};



export const deleted = async <T>(url: string, id: string | number, config?: AxiosRequestConfig): Promise<APIResponse<T>> => {
    try {
        const res: AxiosResponse<T> = await API.delete<T>(`${url}/${id}`, config);
        return { success: true, result: res.data };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.log(error)
            return { success: false, error: error.response?.data.message || "Request failed", status: error.status };
        }
        return { success: false, error: "Unexpected error occurred", status: 500 };
    }
};