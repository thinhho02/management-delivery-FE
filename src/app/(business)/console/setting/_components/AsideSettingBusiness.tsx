'use client'

import LinkCustom from '@/components/ui/LinkCustom'
import { Box, VStack } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import React from 'react'

const AsideSettingBusiness = () => {
  const pathname = usePathname()
  const sidebarItems = [
    { label: "Hồ sơ", href: "/console/setting" },
    { label: "Thay đổi mật khẩu", href: "/console/setting/change-password" },
  ];
  return (
    <Box
      as="nav"
      w={{ base: "180px", md: "220px" }}
      pr={4}
    >
      <VStack align="start">
        {sidebarItems.map((item) => {
          const lastPathname = pathname.split("/").filter(Boolean).at(-1) as string;
          const lastItemHref = item.href.split("/").filter(Boolean).at(-1) as string
          const isActive = lastPathname === lastItemHref
          return (
            <LinkCustom
              key={item.href}
              href={item.href}
              fontWeight="medium"
              textDecoration={'none'}
              _light={{
                color: isActive ? "orange.600" : "black"
              }}
              _dark={{
                color: isActive ? "orange.600" : "white"
              }}
              _hover={{
                color: "orange.600"
              }}
              outline={'none'}
            >

              {item.label}
            </LinkCustom>
          )
        })}
      </VStack>
    </Box>
  )
}

export default AsideSettingBusiness