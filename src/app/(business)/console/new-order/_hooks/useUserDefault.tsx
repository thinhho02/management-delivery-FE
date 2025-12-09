'use client'

import { get } from "@/apis/apiCore";
import { Geometry } from "geojson";
import React, { createContext, useContext } from "react";
import useSWR from "swr";


interface IZoneInfo {
    _id: string;
    name: string;
    code: string;
}

export interface IUserDefault {
    _id: string;
    name: string;
    numberPhone: string;
    email: string;
    type: "seller";
    address: string;
    business: string;
    default?: boolean;
    provinceId?: IZoneInfo;
    wardId?: IZoneInfo;
    location?: Geometry;
}

const UserDefaultPending: IUserDefault = {
    _id: "",
    name: "",
    email: "",
    numberPhone: "",
    type: "seller",
    address: "",
    business: ""
};

export interface UserDefaultContextType {
    data: IUserDefault;
    isLoading: boolean;
    onMutate: () => void
}

const UserDefaultContext = createContext<UserDefaultContextType>({
    data: UserDefaultPending,
    isLoading: true,
    onMutate: () => {}
});


const UserDefaultProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: user, isLoading, isValidating, mutate } = useSWR(`/user/default`, get<IUserDefault>, { revalidateOnFocus: false })
    const finalValue: UserDefaultContextType = {
        data: user && user.success ? user.result : UserDefaultPending,
        isLoading: isLoading || isValidating || !user,
        onMutate: () => mutate()
    };
    return (
        <UserDefaultContext.Provider value={finalValue}>
            {children}
        </UserDefaultContext.Provider>
    )
}

export function useUserDefault() {
    const u = useContext(UserDefaultContext)
    if (!u) {
        throw new Error("UserContext must be used inside <UserProviderInternal>");
    }
    return u;
}

export default UserDefaultProvider