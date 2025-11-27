import { Tooltip } from '@/components/ui/tooltip'
import { Box, Clipboard, Code, Heading, IconButton, Separator, Table, Text, Kbd, Blockquote } from '@chakra-ui/react'
import React from 'react'

const Page = () => {
  const items = [
    { id: 1, name: "seller", type: "Object", description: "Thông tin người bán (shop hoặc doanh nghiệp). Bao gồm các trường như <b>name</b>, <b>address</b>, <b>phone</b>, <b>location {lng, lat}</b>, dùng để xác định nơi lấy hàng." },
    { id: 2, name: "customer", type: "Object", description: "Thông tin người mua hoặc người nhận hàng, gồm <b>name</b>, <b>address</b>, <b>phone</b>, <b>location {lng, lat}</b>, giúp hệ thống giao hàng xác định điểm đến." },
    { id: 3, name: "orderRef", type: "String", description: "Mã tham chiếu đơn hàng từ hệ thống seller. Dùng để đối soát hoặc tra cứu giữa hai hệ thống (seller ↔ logistic)." },
    { id: 4, name: "products", type: "Array", description: "Danh sách sản phẩm trong đơn hàng. Mỗi phần tử chứa các thông tin: <b>sku</b>,  <b>name</b>, <b>quantity</b>" },
    { id: 5, name: "cod", type: "boolean", description: "Cho biết đơn hàng có hình thức thanh toán khi nhận hàng (Cash on Delivery) hay không. <b>true</b> = thu hộ, <b>false</b> = đã thanh toán online." },
    { id: 6, name: "totalWeight", type: "Number", description: "Tổng khối lượng của đơn hàng (tính bằng kilogram). Dùng để xác định chi phí vận chuyển." },
    { id: 7, name: "shipFee", type: "Number", description: "Phí vận chuyển mà hệ thống tính toán dựa trên khoảng cách, trọng lượng, khu vực giao hàng." },
    { id: 8, name: "totalAmount", type: "Number", description: "Tổng giá trị thanh toán cuối cùng của đơn hàng (bao gồm giá sản phẩm + phí ship)." },

  ]
  return (
    <Box ml={5}>
      <Box>
        <Heading size={'4xl'} fontWeight={'bold'}>
          Tạo đơn hàng
        </Heading>
        <Separator my={2} borderColor={{ _light: 'blackAlpha.500', _dark: 'whiteAlpha.500' }} />
        <Heading size={'xl'} fontWeight={'bold'} mb={5}>
          Request API
        </Heading>
        <Box maxW={'full'}>
          <Code mb={3} display={'flex'} w={'full'} alignItems={'center'} px={0} overflow={'auto'}>
            <Text flexShrink={0} as={'span'} px={4} py={2} h={'full'} textTransform={'uppercase'} bg={'teal.400/30'} fontWeight={'bold'}>post</Text>
            <Box
              flexGrow={1}
              px={4}
            >
              <Text as="span" fontSize="sm"
                dangerouslySetInnerHTML={{ __html: "https://server-domain.com/api/create/order?accessToken=<b>{your_access_token}</b>" }} />

            </Box>
            <Clipboard.Root flexShrink={0} pr={2} value="https://server-domain.com/api/create/order?accessToken={your_access_token}">
              <Clipboard.Trigger asChild>
                <IconButton variant="ghost" size="xs">
                  <Tooltip content="Copy">
                    <Clipboard.Indicator />
                  </Tooltip>
                </IconButton>
              </Clipboard.Trigger>
            </Clipboard.Root>
          </Code>
        </Box>
        <Box mb={3}>
          <Heading size={'lg'} fontWeight={'bold'}>
            Headers
          </Heading>
          <Blockquote.Root pr={0} >
            <Blockquote.Content w={'full'}>
              <Code w={'full'} dangerouslySetInnerHTML={{
                __html: `headers: {<br/>
                  'Content-Type' : 'application/json',<br/>
              }`}} />
            </Blockquote.Content>
          </Blockquote.Root>
          <Heading size={'lg'} fontWeight={'bold'} mt={3}>
            Body parameters
          </Heading>
        </Box>
        <Box mb={5}>
          <Table.ScrollArea borderWidth="1px" maxW="full" whiteSpace={'break-spaces'}>
            <Table.Root size={'md'} w={'full'} variant={'outline'} interactive showColumnBorder>

              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader minW={'200px'}>Required parameters</Table.ColumnHeader>
                  <Table.ColumnHeader minW={'100px'}>Type</Table.ColumnHeader>
                  <Table.ColumnHeader minW={'300px'}>Description</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {items.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell><Kbd>{item.name}</Kbd></Table.Cell>
                    <Table.Cell><Kbd>{item.type}</Kbd></Table.Cell>
                    <Table.Cell>
                      <Text as={'span'} dangerouslySetInnerHTML={{ __html: item.description }} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
        <Box>
          <Heading>
            Example request: Create an Order
          </Heading>
        </Box>
      </Box>
    </Box>
  )
}

export default Page