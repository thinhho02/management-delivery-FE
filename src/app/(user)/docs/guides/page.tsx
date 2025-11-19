import {
    Box,
    Clipboard,
    Code,
    Em,
    Heading,
    IconButton,
    Kbd,
    List,
    Separator,
    Text,
} from '@chakra-ui/react'

import { Tooltip } from '@/components/ui/tooltip';
import LinkCustom from '@/components/ui/LinkCustom';

const Page = () => {
    console.log("đây là page guides")
    return (
        <Box ml={5} overflowX={'auto'} w={'full'}>
            <Box>
                <Heading size={'4xl'} fontWeight={'bold'}>
                    Web Service APIs
                </Heading>
                <Separator my={2} borderColor={{ _light: 'blackAlpha.500', _dark: 'whiteAlpha.500' }} />

                <Box>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel voluptatem magni amet quas placeat! Numquam, maiores accusamus, id recusandae quaerat quod perferendis illo, delectus nulla facere sunt repudiandae atque nemo!
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, impedit hic reprehenderit, aspernatur reiciendis adipisci voluptatem aliquam officia ut consectetur praesentium! At assumenda beatae, iusto possimus aut eum dolorem sequi.
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, impedit hic reprehenderit, aspernatur reiciendis adipisci voluptatem aliquam officia ut consectetur praesentium! At assumenda beatae, iusto possimus aut eum dolorem sequi.
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, impedit hic reprehenderit, aspernatur reiciendis adipisci voluptatem aliquam officia ut consectetur praesentium! At assumenda beatae, iusto possimus aut eum dolorem sequi.
                </Box>
            </Box>
            <Separator my={5} borderColor={{ _light: 'blackAlpha.500', _dark: 'whiteAlpha.500' }} />

            <Box>
                <Heading size={'4xl'} fontWeight={'bold'}>
                    Reading this documentation
                </Heading>
                <Separator my={2} borderColor={{ _light: 'blackAlpha.500', _dark: 'whiteAlpha.500' }} />
                <Box>
                    <Text mb={2}>Mỗi endpoint API trong tài liệu này được mô tả bằng một số phần sau:</Text>
                    <List.Root ml={5}>
                        <List.Item>
                            <b>Phương thức HTTP (The HTTP method):</b> bao gồm <Kbd>GET</Kbd>, <Kbd>POST</Kbd>, <Kbd>PUT</Kbd>, <Kbd>DELETE</Kbd>
                        </List.Item>
                        <List.Item>
                            <b>Đường dẫn cơ sở (The base path):</b> Tất cả URL được tham chiếu trong tài liệu đều có đường dẫn cơ sở là <Kbd>{`https://server-domain.com`}</Kbd>.
                            Đường dẫn cơ sở này nằm <Em>trước</Em> đường dẫn endpoint.
                        </List.Item>
                        <List.Item>
                            <b>Đường dẫn endpoint (The endpoint path):</b> Ví dụ, <Kbd>{`/api/{order}`}</Kbd>.
                        </List.Item>
                        <List.Item>
                            <b>Các tham số bắt buộc (Required parameters):</b> Những tham số này phải được bao gồm trong yêu cầu. Trong ví dụ trên, <Kbd>{`profile`}</Kbd> và <Kbd>{`coordinates`}</Kbd> là các tham số bắt buộc. Khi gửi yêu cầu, bạn cần thay thế các placeholder này bằng giá trị thật.
                        </List.Item>
                        <List.Item>
                            <b>Các tham số tùy chọn (Optional parameters):</b> Những tham số này có thể được thêm vào để tùy chỉnh truy vấn. Các tham số truy vấn (query parameters) sẽ được nối vào cuối URL bằng query string encoding (ví dụ: <Kbd>{`?key=value&another=value`}</Kbd>).
                        </List.Item>
                        <List.Item>
                            <b>Phạm vi token (A token scope):</b> Nếu một endpoint API yêu cầu phạm vi token cụ thể mà access token mặc định không có, thì phạm vi đó sẽ được liệt kê trong tài liệu.
                        </List.Item>
                    </List.Root>
                </Box>
            </Box>
            <Separator my={5} borderColor={{ _light: 'blackAlpha.500', _dark: 'whiteAlpha.500' }} />
            <Box>
                <Heading size={'4xl'} fontWeight={'bold'}>
                    Access Token
                </Heading>
                <Separator my={2} borderColor={{ _light: 'blackAlpha.500', _dark: 'whiteAlpha.500' }} />
                <Code display={'flex'} justifyContent={'space-between'} mb={3} pl={7} py={3} w={'full'}>
                    {`https://api.mapbox.com/{endpoint}?access_token={your_access_token}`}
                    <Clipboard.Root value="https://api.mapbox.com/{endpoint}?access_token={your_access_token}">
                        <Clipboard.Trigger asChild>
                            <IconButton variant="ghost" size="xs">
                                <Tooltip content="Copy">
                                    <Clipboard.Indicator />
                                </Tooltip>
                            </IconButton>
                        </Clipboard.Trigger>
                    </Clipboard.Root>
                </Code>
                <Box>
                    <Text>Để truy cập các endpoint API, bạn cần có access token hợp lệ, token này sẽ liên kết các yêu cầu API với tài khoản của bạn. Bạn phải gửi access token hợp lệ bằng cách thêm tham số truy vấn <Kbd>access_token</Kbd> vào mọi yêu cầu.</Text>
                    <Text>Access token mặc định của bạn có sẵn ở góc phải trang <LinkCustom href={'/'} color={'blue'}>Developer Console homepage</LinkCustom>. Bạn cũng có thể tạo và quản lý thêm các token khác trong: <LinkCustom href={'#'} color={'blue'}>Access Token Page</LinkCustom></Text>
                </Box>

            </Box>
        </Box>
    )
}

export default Page