import { Box, Heading } from '@chakra-ui/react'
import React from 'react'
import FormChangePasswordInternal from './_components/FormChangePasswordInternal'

const PageChangePassWordInternal = () => {
  return (
    <Box>
      <Heading size="xl" fontWeight={'bold'} mb={6}>
        Thay đổi mật khẩu
      </Heading>
      <Box mt={10} divideY={'1px'}>
        <Box mb={5}>
          <FormChangePasswordInternal />
        </Box>
      </Box>
    </Box>
  )
}

export default PageChangePassWordInternal