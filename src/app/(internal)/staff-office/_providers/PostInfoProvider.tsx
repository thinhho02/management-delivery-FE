'use client'

import { createContext, useContext, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useUserInternal } from "../../_providers/UserProviderInternal";
import { get } from "@/apis/apiCore";
import { notFound } from "next/navigation";
import { useSocketInternal } from "../../_providers/SocketProviderInternal";

export interface IZoneInfo {
    _id: string;
    name: string;
    code: string;
}

export interface IParentPost {
    _id: string;
    name: string;
    code: string;
    address: string;
    type: "sorting_center" | "distribution_hub" | "delivery_office";
}

export interface IPostOffice {
    _id: string;
    name: string;
    code: string;
    type: "sorting_center" | "distribution_hub" | "delivery_office" | null;
    address: string;
    status: boolean;
    regionId?: IZoneInfo | null;
    provinceId?: IZoneInfo | null;
    wardId?: IZoneInfo | null;
    parentId: IParentPost | null
}

const PostOfficePending: IPostOffice = {
    _id: "",
    name: "Đang tải bưu cục...",
    code: "",
    type: null,
    address: "",
    status: false,
    regionId: null,
    provinceId: null,
    wardId: null,
    parentId: null
};

export interface PostOfficeContextType {
    post: IPostOffice;
}

const PostInfoContext = createContext<PostOfficeContextType>({
    post: PostOfficePending,
});

const PostInfo = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUserInternal()
    const { isConnected, emitEvent } = useSocketInternal()


    const post: IPostOffice = user.account.officeId

    useEffect(() => {
        if (!post || !isConnected) return;

        emitEvent("join:post_join", { postId: post._id })

        return () => {
            emitEvent("leave:post_join", { postId: post._id })
        }
    }, [post, isConnected])



    return (
        <PostInfoContext.Provider value={{post}}>
            {children}
        </PostInfoContext.Provider>
    )
}

export function usePostInfo() {
    const u = useContext(PostInfoContext)
    if (!u) {
        throw new Error("UserContext must be used inside <UserProviderInternal>");
    }
    return u;
}

export default PostInfo
