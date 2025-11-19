import SWRProvider from "@/providers/SWRProvider";
import UserProviderBusiness from "@/providers/UserBusinessProvider";
import type { Metadata } from "next";



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