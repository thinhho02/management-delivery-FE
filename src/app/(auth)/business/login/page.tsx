import ErrorAPI from '@/components/ui/500/ErrorAPI'
import { Box, Center, Container, Flex } from '@chakra-ui/react'
import React from 'react'
import LoginForm from './_components/LoginForm'

const PageLoginBusiness = () => {
  return (
    <Container>
        <Center>
            <Box>
              <LoginForm />
            </Box>
        </Center>
    </Container>
  )
}

export default PageLoginBusiness