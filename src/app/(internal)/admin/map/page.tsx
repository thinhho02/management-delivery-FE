'use client'

import { create, get } from '@/apis/apiCore';
import ImportMap from '@/components/ImportMap'
import { Box, Button, createOverlay, Dialog, Field, Fieldset, For, Heading, HStack, Input, NativeSelect, Portal, Spinner, Text, Timeline, useFileUpload, VStack } from '@chakra-ui/react'
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { toaster } from '@/components/ui/toaster';
import { zones } from '@/types/constantsNameZone';
import { LuCheck, LuX } from 'react-icons/lu';

const formSchema = z.object({
    zone: z.string().min(1, { message: "Chọn khu vực là bắt buộc" }),
    file: z.file().array().refine((f) => f.length > 0, "Vui lòng chọn file JSON/GeoJSON")
})

type FormValues = z.infer<typeof formSchema>

const MAX_BYTES = 5000000; // 5MB
const ACCEPTED_EXT = [".json", ".geojson"];

const PageMap = () => {
    const {
        reset,
        setValue,
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
    });

    const fileUpload = useFileUpload({
        maxFiles: 1,
        maxFileSize: MAX_BYTES,
        accept: ACCEPTED_EXT,
        onFileReject: (f) => {
            (f.files.length > 0) && toaster.create({
                id: `file-rj-${Date.now()}`,
                title: "File bị từ chối",
                description: f.files[0]?.errors,
                type: "error",
            })
        },
        onFileChange: (f) => {
            console.log(f)
            if (f.acceptedFiles.length > 0) {
                setValue('file', f.acceptedFiles)
            }
        }
    })

    // check status function
    const checkJobStatus = useCallback(async (jobId: string, tileset: string) => {
        const responseStatus = await get<{ stage: string; errors: Record<string, any>[] }>(`/mapbox/job/${tileset}/status/${jobId}`)

        if (responseStatus.success) {
            const status = responseStatus.result?.stage
            console.log("job status: ", status)
            if (status === 'success') {

                dialog.update(jobId, {
                    status: 'success',
                    description: (
                        <HStack align={'center'} gap={2}>
                            <Text>
                                Cập nhật tileset thành công
                            </Text>
                        </HStack>
                    )
                })
                setTimeout(() => dialog.close(jobId), 3000)
            } else if (status === 'failed') {

                dialog.update(jobId, {
                    status: 'fail',
                    description: (
                        <HStack align={'center'} gap={2}>
                            <Text>
                                Đã xảy ra lỗi: {responseStatus.result.errors.join("; ")}
                            </Text>
                        </HStack>
                    )
                })
                setTimeout(() => dialog.close(jobId), 3000)
            }
        }
    }, [])


    // submit form
    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData()
        console.log(data)
        formData.append("fileUpload", data.file[0])
        formData.append("zone", data.zone)
        const response = await create<{ jobId: string; tileset: string; message: string }>(`/mapbox/${data.zone}/import`, formData)
        if (response.success) {
            toaster.create({
                id: `tileset-create-su-${Date.now()}`,
                title: "Tileset tạo thành công",
                type: 'success',
            })
            // dialog.open(response.result.jobId, {
            //     status: 'processing',
            //     placement: 'center',
            //     description: (
            //         <HStack align={'center'} gap={2}>
            //             <Text>
            //                 Đang xử lý
            //             </Text>
            //             <Spinner size="sm" color={'teal.500'} />
            //         </HStack>
            //     )
            // })
            // await checkJobStatus(response.result.jobId, response.result.tileset)
            console.log("job success")
        } else {
            toaster.create({
                id: `tileset-create-er-${Date.now()}`,
                title: "Tileset tạo không thành công",
                description: response.error,
                type: 'error',
            })
        }
        reset({ zone: "", file: [] })
        fileUpload.clearFiles()
    })


    return (
        <>
            <Box ml={5} mt={5}>
                <form onSubmit={onSubmit}>
                    <Heading size={'2xl'} fontWeight={'bold'}>
                        Thêm mới bản đồ
                    </Heading>
                    <Box mt={10} divideY={'1px'}>
                        <Box mb={5}>
                            <VStack align="start">
                                <Fieldset.Root>
                                    <Fieldset.Content>
                                        <Field.Root invalid={!!errors.zone}>
                                            <Field.Label>Chọn 1 trong các khu vực</Field.Label>
                                            <NativeSelect.Root variant={'outline'}>
                                                <NativeSelect.Field {...register("zone")} placeholder='Chọn 1 khu vực'>
                                                    <For each={zones}>
                                                        {(item) => (
                                                            <option key={item.name} value={item.name}>
                                                                {item.label}
                                                            </option>
                                                        )}
                                                    </For>
                                                </NativeSelect.Field>
                                                <NativeSelect.Indicator />
                                            </NativeSelect.Root>
                                            <Field.ErrorText>{errors.zone?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </Fieldset.Content>
                                </Fieldset.Root>
                            </VStack>
                        </Box>
                        <Box mt={5}>
                            <Field.Root invalid={!!errors.file}>
                                <Field.Label fontWeight="bold" fontSize="lg" my={3}>
                                    📤 Import file JSON / GeoJSON (≤ 5MB)
                                </Field.Label>

                                <Field.ErrorText>{errors.file?.message}</Field.ErrorText>
                                <ImportMap fileUpload={fileUpload} />
                            </Field.Root>
                        </Box>
                        <Button
                            type='submit'
                            mt={4}
                            colorScheme="blue"
                            borderRadius="full"
                            loading={isSubmitting}
                        >
                            Thêm mới
                        </Button>
                    </Box>
                </form>
            </Box>
            <dialog.Viewport />
        </>
    )
}


interface DialogProps {
    placement?: "center" | "top" | "bottom" | undefined,
    description?: React.ReactNode;
    status?: "success" | "fail" | "processing"
}

const dialog = createOverlay<DialogProps>((props) => {
    const { status, description, ...rest } = props
    return (
        <Dialog.Root {...rest} lazyMount closeOnInteractOutside={false}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content p={4}>
                        <Dialog.Body>
                            <Heading size={'sm'} color={'red'}>*Không được thoát và tắt trang trước khi thêm thành công</Heading>
                            <Timeline.Root size={'md'} mt={5}>
                                <Timeline.Item>
                                    <Timeline.Connector>
                                        <Timeline.Separator />
                                        <Timeline.Indicator bg={"blue"}>
                                            <LuCheck />
                                        </Timeline.Indicator>
                                    </Timeline.Connector>
                                    <Timeline.Content>
                                        <Timeline.Title>
                                            Import file GeoJon
                                        </Timeline.Title>
                                        <Timeline.Description>
                                            Đã thêm bản đồ thành công
                                        </Timeline.Description>
                                    </Timeline.Content>
                                </Timeline.Item>
                                <Timeline.Item>
                                    <Timeline.Connector>
                                        <Timeline.Separator />
                                        <Timeline.Indicator bg={status === "success" ? "blue" : status === 'fail' ? "red" : ""}>
                                            {status === "success" ? <LuCheck /> : status === 'fail' ? <LuX /> : ""}
                                        </Timeline.Indicator>
                                        {/* </Timeline.Indicator> */}
                                    </Timeline.Connector>
                                    <Timeline.Content>
                                        <Timeline.Title>
                                            Publish file tileset on cloud 
                                        </Timeline.Title>
                                        <Timeline.Description>
                                            {description}
                                        </Timeline.Description>
                                    </Timeline.Content>
                                </Timeline.Item>
                            </Timeline.Root>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
})

export default PageMap