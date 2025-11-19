import React from 'react'

import { Box, Heading } from '@chakra-ui/react'
import { zones } from '@/types/constantsNameZone'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
const MainPageSourceLayer = dynamic(() => import('./_components/MainPageSourceLayer'))



export default async function PageSlugTileset({ params }: { params: Promise<{ sourceLayer: string }> }) {
  const { sourceLayer } = await params
  const getNameZone = zones.find((zone) => zone.name === sourceLayer)
  if(!getNameZone){
    notFound()
  }
  console.log(getNameZone)
  return (
    <Box>
      <Heading size={'xl'} fontWeight={'bold'}>
        Danh sách khu vực {getNameZone?.label}
      </Heading>
      <Box mt={5}>
        <MainPageSourceLayer sourceLayer={sourceLayer} getNameZone={getNameZone} />
      </Box>
    </Box >
  )
}
