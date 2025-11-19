import { getSession } from "@/action/getSession";
import SWRProvider from "@/providers/SWRProvider";
import UserProviderBusiness from "@/providers/UserProvider";
import type { Metadata } from "next";
import { redirect } from "next/navigation";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const RootLayoutBusiness = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await getSession()
  if (!session.success || !session.result || session.result.roleName !== "business") {
    redirect("/business/login")
  }
  return (
    <SWRProvider ns="business-cache">
      <UserProviderBusiness session={session.result}>
       {children}
      </UserProviderBusiness>
    </SWRProvider>
  )
}

export default RootLayoutBusiness