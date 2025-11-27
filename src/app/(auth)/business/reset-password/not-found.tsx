import React from 'react'

import image404 from '/public/images/404.jpg'
import { Box } from '@chakra-ui/react'
import ImageCustom from '@/components/ui/ImageCustom'

const NotFound = () => {
    console.log(image404)
    return (
        <Box rounded={'xl'} position={'relative'}>
            <ImageCustom src={image404.src} alt='fff' rounded={'xl'} width='500' height='300' objectFit={'cover'} />
        </Box>
    )
}

export default NotFound