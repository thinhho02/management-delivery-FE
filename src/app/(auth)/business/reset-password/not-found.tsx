import React from 'react'

import { Box } from '@chakra-ui/react'
import ImageCustom from '@/components/ui/ImageCustom'

const NotFound = () => {
    return (
        <Box rounded={'xl'} position={'relative'}>
            <ImageCustom src={'/images/404.jpg'} alt='fff' rounded={'xl'} width='500' height='300' objectFit={'cover'} />
        </Box>
    )
}

export default NotFound