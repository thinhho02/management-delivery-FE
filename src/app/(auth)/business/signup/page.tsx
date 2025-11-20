import ErrorAPI from '@/components/ui/500/ErrorAPI'
import { AbsoluteCenter, Box, Container, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import RegisterForm from './_components/RegisterForm'

const PageSignUpBusiness = () => {
    return (
        <Container>
            <Flex>
                <Box maxW={'8/12'} flex={'1'} position={'relative'} display={{base: "none", md:"block"}}>
                    <AbsoluteCenter color="white" flexDirection={'column'}>
                        <Heading
                            fontSize="50px"
                            fontWeight="bold"
                            lineHeight="1.2"
                            mb={4}
                        >
                            Quản lý đơn hàng & vận chuyển cho doanh nghiệp
                        </Heading>

                        <Box
                            fontSize="18px"
                            color="whiteAlpha.800"
                            lineHeight="1.6"
                            fontWeight="medium"
                        >
                            Tự động hóa quy trình nhận – giao – đối soát.<br />
                            Theo dõi trạng thái đơn hàng theo thời gian thực.<br />
                            Kết nối kho – shipper – khách hàng trong một nền tảng duy nhất.<br />
                            Giảm sai sót, tăng tốc độ xử lý & tối ưu chi phí vận hành.
                        </Box>
                    </AbsoluteCenter>
                </Box>
                <Box w={{base: "full", md: "4/12"}}>
                    <RegisterForm />
                </Box>
            </Flex>
        </Container>
    )
}

export default PageSignUpBusiness