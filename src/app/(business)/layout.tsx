import SWRProvider from "@/providers/SWRProvider";
import UserProviderBusiness from "@/app/(business)/_providers/UserProviderBusiness";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra cứu đơn hàng",
  description: "Danh sách thông tin đơn hàng đã đặt",
};

const RootLayoutBusiness = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    <SWRProvider ns="business-cache">
      <UserProviderBusiness>
        {children}
      </UserProviderBusiness>
    </SWRProvider>
  )
}

export default RootLayoutBusiness