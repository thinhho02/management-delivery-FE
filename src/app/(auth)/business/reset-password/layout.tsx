import { Box, Center, Container } from '@chakra-ui/react';
import React from 'react'

const LayoutResetTokenPassword = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <Container>
            <Center>
                <Box>
                    {children}
                </Box>
            </Center>
        </Container>
    )
}

export default LayoutResetTokenPassword