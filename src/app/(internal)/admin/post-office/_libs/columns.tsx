"use client";

import LinkCustom from "@/components/ui/LinkCustom";
import { Tooltip } from "@/components/ui/tooltip";
import { Box, Button, CloseButton, createOverlay, Dialog, Heading, HStack, Portal, Span, Status } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export interface IZoneInfo {
  _id: string;
  name: string;
  code: string;
}

export interface IPostOfficeRow {
  _id: string;
  name: string;
  code: string;
  type: "sorting_center" | "distribution_hub" | "delivery_office";
  address: string;
  status: boolean;
  regionId?: IZoneInfo | null;
  provinceId?: IZoneInfo | null;
  wardId?: IZoneInfo | null;

}

const columnHelper = createColumnHelper<IPostOfficeRow>();

export const zoneFieldMap = {
  sorting_center: "regionId",
  distribution_hub: "provinceId",
  delivery_office: "wardId",
} as const;


export const columns = [
  columnHelper.display({
    id: "name",
    header: "Tên bưu cục",
    cell: ({ row }) => {
      const data = row.original;

      const tooltipContent = data.status ? "Đang hoạt động" : "Không hoạt động"

      return (
        <Tooltip
          showArrow
          content={tooltipContent}
          positioning={{ placement: "left" }}
          contentProps={{
            css: {
              "--tooltip-bg": data.status ? 'green' : 'colors.bg.error',
              "color": "white"
            }
          }}
        >
          <Status.Root colorPalette={data.status ? "green" : "red"} >
            <Status.Indicator />
            <LinkCustom href={`/admin/post-office/${data._id}`} color={'bg.inverted'} _hover={{ textDecoration: "underline" }}>
              {data.name}
            </LinkCustom>
          </Status.Root>
        </Tooltip>);
    }
  }),
  // columnHelper.accessor("name", {
  //   header: "Tên bưu cục",
  //   cell: (info) => info.getValue(),
  // }),

  columnHelper.accessor("code", {
    header: "Mã",
  }),

  columnHelper.accessor("type", {
    header: "Loại",
    cell: (info) => {
      const value = info.getValue();
      return value === "sorting_center"
        ? "Trung tâm phân loại"
        : value === "distribution_hub"
          ? "Kho trung chuyển"
          : "Bưu cục giao hàng";
    },
  }),

  columnHelper.accessor("address", {
    header: "Địa chỉ",
    minSize: 300,
    meta: {
      maxWidth: "250px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  }),
  columnHelper.display({
    id: "zone",
    header: "Khu vực",
    cell: ({ row }) => {
      const data = row.original;

      const zoneField = zoneFieldMap[data.type];
      const zone = data[zoneField];

      if (!zone) return "—"; // fallback nếu chưa có zone

      return `${zone.name} (${zone.code})`;
    }
  }),

  // 🎯 ACTION COLUMN
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      const onDelete = (item: any) => {
        console.log(item)
      }
      return (
        <>
          <HStack>
            <LinkCustom href={`/admin/post-office/${item._id}`} _hover={{ bg: "teal" }} rounded={'sm'} py={'5px'} px={'10px'}>
              Sửa
            </LinkCustom>
            <Button size="xs" colorPalette="red" onClick={() => onDelete(item)}>
              Xóa
            </Button>
          </HStack>
        </>
      );
    },
  }),
];



