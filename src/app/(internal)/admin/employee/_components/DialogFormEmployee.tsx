import { Box, Button, CloseButton, Dialog, Portal, Tabs } from '@chakra-ui/react'
import React, { useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import AddNewEmployee from './AddNewFormEmployee'
import AddNewShipper from './AddNewShipper'

const DialogFormEmployee = () => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog.Root
            lazyMount
            open={open}
            onOpenChange={(e) => setOpen(e.open)}
            size={'lg'}
            scrollBehavior="outside">
            <Dialog.Trigger asChild>
                <Button
                    bgColor={'orange.600'}
                    _hover={{
                        bgColor: "orange.500"
                    }}
                    color={'fg'}
                >
                    <LuPlus /> Thêm
                </Button>
            </Dialog.Trigger>
            <Portal key={'dialog'}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Thêm mới nhân viên</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Tabs.Root
                                defaultValue="staff"
                                variant="plain"
                                css={{
                                    "--tabs-indicator-bg": "colors.red.fg",
                                    "--tabs-indicator-shadow": "shadows.xs",
                                    "--tabs-trigger-radius": "radii.full",
                                }}
                            >
                                <Tabs.List bg="bg.muted" rounded="l3" p="1">
                                    <Tabs.Trigger value="staff">Nhân viên bưu cục</Tabs.Trigger>
                                    <Tabs.Trigger value="shipper">Nhân viên giao hàng</Tabs.Trigger>
                                    <Tabs.Indicator rounded="l2" />
                                </Tabs.List>
                                <Tabs.Content
                                    value="staff"
                                >
                                    <AddNewEmployee setOpen={setOpen} />
                                </Tabs.Content>

                                <Tabs.Content
                                    value="shipper"

                                >
                                    <AddNewShipper setOpen={setOpen} />
                                </Tabs.Content>
                            </Tabs.Root>
                        </Dialog.Body>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default DialogFormEmployee