import LinkCustom from '@/components/ui/LinkCustom'
import { Box, Button, Field, Fieldset, Flex, Heading, Input, VStack } from '@chakra-ui/react'
import React from 'react'
import FormChangePassword from './_components/FormChangePassword'

const PageChangePassWord = () => {
  return (
    <Box>
      <Heading size="xl" fontWeight={'bold'} mb={6}>
        Thay đổi mật khẩu
      </Heading>
      <Box mt={10} divideY={'1px'}>
        <Box mb={5}>
          <FormChangePassword />
        </Box>
      </Box>
    </Box>
  )
}

export default PageChangePassWord