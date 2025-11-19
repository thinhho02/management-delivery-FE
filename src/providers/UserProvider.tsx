"use client";
import { ISessionResponse } from "@/action/getSession";
import { APIResponse, get } from "@/apis/apiCore";
import { AUTH_EVENT_STORAGE_KEY, broadcastAuthEvent, clearAccessToken, getAccessToken, setAccessToken } from "@/libs/tokenMemory";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";
import useSWR, { KeyedMutator } from "swr";


// Kiểu dữ liệu user session từ BE
interface IUserResponse {
  success: boolean;
  result: ISessionResponse
}

interface IUserProviderProps {
  children: React.ReactNode;
  session: IUserResponse['result'];
}


interface UserContextState{
  user: ISessionResponse;
  mutateUser: KeyedMutator<APIResponse<ISessionResponse>>
}

const UserContext = createContext<UserContextState | undefined>(undefined);

export default function UserProviderBusiness({ children, session }: IUserProviderProps) {
  const router = useRouter(); 
  /**
  * 1. Set accessToken vào memory ngay khi client mount
  */
  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken);
      broadcastAuthEvent("LOGIN");
    }
  }, [session]);



  /**
     * 2. Chỉ fetch lại /auth/get-session nếu đã có accessToken trong memory
     *    --> Đảm bảo SWR không gọi bậy khi reload tab
     */
  const shouldFetch = !!getAccessToken();

  const { data: swrData, error, mutate } = useSWR(
    shouldFetch ? "/auth/get-session" : null,
    get<IUserResponse['result']>,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );
  /**
   * 3. Nếu session SSR fail → redirect ngay từ server layout rồi
   *    Nhưng nếu SWR fail sau đó → logout client
   */
  useEffect(() => {
    if (!swrData?.success) return;

    // cập nhật accessToken mới từ SWR (BE refresh)
    setAccessToken(swrData.result.accessToken);
  }, [swrData]);

  /**
    * 4. Nếu SWR báo hết phiên → đẩy user về login
    */
  useEffect(() => {
    if (error) return;

    if (swrData && !swrData.success) {
      router.push("/business/login");
    }
  }, [swrData, error, router]);

  // Lắng nghe sự kiện storage để đồng bộ nhiều tab
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== AUTH_EVENT_STORAGE_KEY || !e.newValue) return;

      const event = JSON.parse(e.newValue) as {
        type: "LOGIN" | "LOGOUT" | "FORCE_LOGOUT";
        time: number;
      };

      if (event.type === "LOGOUT" || event.type === "FORCE_LOGOUT") {
        clearAccessToken();
        mutate(undefined, false);
        // redirect về /login
        router.replace("/business/login");
      }

    };

    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("storage", handler);
    };
  }, [mutate]);

  /**
     * 5. Kết hợp SSR session + SWR session
     *    SWR sẽ override SSR khi fetch xong
     */
  const finalUser = useMemo(() => {
    if (swrData?.success) return swrData.result;
    return session; // fallback từ SSR
  }, [swrData, session]);


  return (
    <UserContext.Provider value={{ user: finalUser, mutateUser: mutate }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserBusiness() {
  const u = useContext(UserContext)
  if(!u){
    throw new Error("UserContext must be used inside <UserProviderBusiness>");
  }
  return u;
}