import { Box, Center, Container } from '@chakra-ui/react'
import React from 'react'
import FormLoginInternal from './_components/FormLoginInternal'

const PageLoginInernal = () => {
  return (
    <Container>
        <Center>
            <Box>
              <FormLoginInternal />
            </Box>
        </Center>
    </Container>
  )
}

export default PageLoginInernal