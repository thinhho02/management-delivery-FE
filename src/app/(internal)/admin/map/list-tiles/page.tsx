import { Box, Grid, Heading } from '@chakra-ui/react'
import React from 'react'
import dynamic from 'next/dynamic'
const ListTiles = dynamic(() => import('./_components/ListTiles'))

const PageListTile = () => {
    return (
        <Box>
            <Heading size={'xl'} fontWeight={'bold'}>
                Danh sách khu vực
            </Heading>
            <Box mt={10}>
                <ListTiles />
            </Box>

        </Box>
    )
}

export default PageListTile