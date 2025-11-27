import SWRProvider from "@/providers/SWRProvider";
import UserProviderBusiness from "@/app/(business)/_providers/UserProviderBusiness";
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