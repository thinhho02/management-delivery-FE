// app/(console)/post-office/usePostOffice.ts
"use client";

import useSWR from "swr";
import { get } from "@/apis/apiCore"; // hàm bạn đang dùng

export const POST_OFFICE_KEY = (type: string, page: number) =>
  `/post-office?type=${type}&page=${page}`;

export const usePostOffice = ({ type, page }: { type: string, page: number }) => {
  

  const query = `/post-office?type=${type}&page=${page}`;

  const { data, error, isLoading, mutate } = useSWR(query, get<any>, {
    revalidateOnFocus: false,
  });

  return {
    data: data?.success ? data?.result.post ?? [] : [],
    pagination: data?.success && data.result.pagination,
    loading: isLoading,
    error,
    mutate,
  };
};
