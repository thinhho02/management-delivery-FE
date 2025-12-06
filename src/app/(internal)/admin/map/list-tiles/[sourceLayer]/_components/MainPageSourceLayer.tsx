'use client'

import { get } from '@/apis/apiCore'
import { AbsoluteCenter, Box, Flex, For, Heading, HStack, ScrollArea, Spinner, VStack } from '@chakra-ui/react';
import React, {  useRef, useState } from 'react'
import useSWR from 'swr'
import { IZones } from '@/types/constantsNameZone';
import dynamic from 'next/dynamic';

import { ResponseTileSet } from '@/types/responseTileSet';
// import { mergeProvincesToRegion } from '@/utils/mergeRegion';

const AdminMap = dynamic(() => import('./AdminMap'));


const MainPageSourceLayer = ({ sourceLayer, getNameZone }: { sourceLayer: string, getNameZone: IZones }) => {
  const { data: tiles, isLoading, isValidating } = useSWR(`/mapbox/${sourceLayer}/list`, get<ResponseTileSet[]>, {
    revalidateOnFocus: false
  })
  const [activeTile, setActiveTile] = useState<string | null>(null)

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})


  const scrollToItem = (id: string) => {
    const target = itemRefs.current[id]
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }

  // if(tiles?.success){
  //   const r = mergeProvincesToRegion(tiles.result)
  //   console.log(r)
  // }

  if (isLoading || isValidating) {
    return (
      <Box h={'500px'} position={'relative'}>
        <AbsoluteCenter>
          <Spinner
            size="sm"
            color="purple.400" />
        </AbsoluteCenter>
      </Box>
    )
  }
  console.log(tiles)
  if (!tiles?.success) {
    return <Heading>{tiles?.error}</Heading>
  }
  return (
    <Flex gap={5}>
      <VStack gap={2} flex={1}>
        <ScrollArea.Root size={'sm'} maxH={'500px'} variant="always">
          <ScrollArea.Viewport>
            <ScrollArea.Content spaceY="4" pe="2">
              {tiles?.success && (
                <For each={tiles.result}>
                  {(tile) => (
                    <Box
                      key={tile._id}
                      ref={(el: HTMLDivElement | null) => el && (itemRefs.current[tile.code] = el)}
                      w={'full'}
                      rounded={'lg'}
                      cursor={'pointer'}
                      bgColor={tile.code === activeTile ? 'gray.muted/50' : undefined}
                      ml={2}
                      _hover={{
                        bgColor: 'gray.muted/50'
                      }}
                      onClick={() => {
                        setActiveTile(tile.code)
                      }}
                      p={2}
                    >
                      <HStack>

                        <Box flex={1}>
                          <Heading fontWeight="medium" color="fg" size={'sm'}>
                            {tile.name}
                          </Heading>
                          <Heading size={'sm'} color={'gray.focusRing'}>
                            Mã số vùng: {tile.code}
                          </Heading>
                        </Box>
                      </HStack>
                    </Box>
                  )}
                </For>
              )}
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar bg="gray.emphasized">
            <ScrollArea.Thumb bg="gray.focusRing" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </VStack>

      <AdminMap
        tiles={tiles.result}
        activeTile={activeTile}
        setActiveTile={setActiveTile}
        getNameZone={getNameZone}
        scrollToItem={scrollToItem}
      />
    </Flex>
  )
}

export default MainPageSourceLayer