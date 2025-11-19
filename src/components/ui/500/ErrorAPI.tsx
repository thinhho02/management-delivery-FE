import React from 'react'

import ImageCustom from '../ImageCustom'
import errorSVG from '/public/card-error-icon.svg'
import { AbsoluteCenter, Box } from '@chakra-ui/react'


const ErrorAPI = () => {
    return (
        <Box w={'full'} position={'relative'}>
            <AbsoluteCenter>
                <Box>
                    <Box w={'200px'} h={'100px'}>
                        <ImageCustom src={errorSVG} alt='error' bgColor={'gray.emphasized'} fill />
                    </Box>
                </Box>
            </AbsoluteCenter>
        </Box>
    )
}

export default ErrorAPI