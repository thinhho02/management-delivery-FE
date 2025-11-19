import LinkCustom from '@/components/ui/LinkCustom'
import { Box, Button, Field, Fieldset, Flex, Heading, Input, VStack } from '@chakra-ui/react'
import React from 'react'

const PageChangePassWord = () => {
  return (
    <Box>
      <Heading size="xl" fontWeight={'bold'} mb={6}>
        Thay đổi mật khẩu
      </Heading>
      <Box mt={10} divideY={'1px'}>
        <Box mb={5}>
          <VStack align="start">
            <Fieldset.Root>
              <Fieldset.Content>
                <Field.Root invalid={false} required>
                  <Field.Label>
                    Mật khẩu hiện tại
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input name="current_password" />
                  <Field.ErrorText>This is an error text</Field.ErrorText>
                </Field.Root>
                <Field.Root invalid={false} required>
                  <Field.Label>
                    Mật khẩu mới
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input name="new_password" />
                  <Field.ErrorText>This is an error text</Field.ErrorText>
                </Field.Root>
                <Field.Root invalid={false} required>
                  <Field.Label>
                    Nhập lại mật khẩu mới
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input name="confirm_password" />
                  <Field.ErrorText>This is an error text</Field.ErrorText>
                </Field.Root>
              </Fieldset.Content>
            </Fieldset.Root>
            <Flex align={'center'} justify={'space-between'} w={'full'} mt={4}>
              <Button
                colorScheme="blue"
                borderRadius="full"
                loading={false}
              >
                Save new password
              </Button>
              <LinkCustom
                href={'#'}
                fontWeight="medium"
                textDecoration={'none'}
                color={'orange.600'}
                _hover={{
                  color: "orange.300"
                }}
                asChild
              >
                Quên mật khẩu?
              </LinkCustom>
            </Flex>
          </VStack>
        </Box>
      </Box>
    </Box>
  )
}

export default PageChangePassWord