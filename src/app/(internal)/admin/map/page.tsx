'use client'

import { create, get } from '@/apis/apiCore';
import ImportMap from '@/components/ImportMap'
import { Box, Button, Dialog, Field, Fieldset, For, Heading, HStack, Input, NativeSelect, Portal, Spinner, Text, Timeline, useFileUpload, VStack } from '@chakra-ui/react'
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { toaster } from '@/components/ui/toaster';
import { zones } from '@/types/constantsNameZone';

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
                title: "Tạo khu vực thành công",
                type: 'success',
            })
    
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
                                    📤 Thêm file JSON / GeoJSON (≤ 5MB)
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
        </>
    )
}




export default PageMap