"use client";

import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Dialog,
  Portal,
  CloseButton,
  Field,
  Fieldset,
  Input,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { LuPlus } from "react-icons/lu";

export default function ChatBoxBusiness() {
  // chọn bài đăng hoặc bưu cục đang chat
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // List chat mock
  const chatList = [
    { id: "p1", name: "Bưu cục Quận 1", lastMessage: "Hàng đã đến chưa?" },
    { id: "p2", name: "Bưu cục Thủ Đức", lastMessage: "Dự kiến chiều nay" },
  ];

  // Tin nhắn mock
  const [messages, setMessages] = useState([
    { id: 1, content: "Xin chào bạn!", me: false },
    { id: 2, content: "Tôi cần hỗ trợ đơn hàng", me: true },
    { id: 3, content: "Vâng bạn cần hỗ trợ gì?", me: false },
  ]);

  const [messageInput, setMessageInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), content: messageInput, me: true }]);
    setMessageInput("");
  };

  return (
    <HStack h="85vh">
      {/* =============== SIDEBAR LỊCH SỬ CHAT =============== */}
      <VStack
        align="stretch"
        w="30%"
        h="100%"
        p={4}
        gap={4}
      >
        <HStack justify="space-between">
          <Heading size={'md'} fontWeight="medium">
            Trò chuyện hoặc khiếu nại
          </Heading>
          <Button
            size="xs"
            bg="orange.600"
            _hover={{ bg: "orange.500" }}
            onClick={() => setOpenDialog(true)}
          >
            <LuPlus /> Thêm
          </Button>
        </HStack>

        {/* LIST CHATS */}
        <VStack align="stretch" gap={2} overflowY="auto" flex="1" h={'1000px'}>
          {chatList.map((c) => (
            <Box
              key={c.id}
              p={3}
              borderRadius="md"
              _light={{
                bg: selectedChat === c.id ? "gray.400" : "gray.200",
                _hover: { bg: "gray.400" }
              }}
              _dark={{
                bg: selectedChat === c.id ? "gray.900" : "gray.700",
                _hover: { bg: "gray.800" }
              }}
              // bg={selectedChat === c.id ? "gray.700" : "gray.emphasized"}
              cursor="pointer"
              onClick={() => setSelectedChat(c.id)}
            >
              <Text fontWeight="500">{c.name}</Text>
              <Text fontSize="sm" color={{_light: "gray.600", _dark: "gray.400"}}>
                {c.lastMessage}
              </Text>
            </Box>
          ))}
        </VStack>
      </VStack>

      {/* =============== KHUNG CHAT =============== */}
      <VStack align="stretch" w="70%" h="100%" p={4} gap={4}>
        {!selectedChat ? (
          <HStack justify="center" h="full" bg="#222" rounded={'xl'}>
            <Text fontSize="lg" color="gray.400">
              Chọn cuộc trò chuyện để bắt đầu
            </Text>
          </HStack>
        ) : (
          <>
            {/* Danh sách tin nhắn */}
            <VStack
              align="stretch"
              gap={3}
              bg="#222"
              rounded={'xl'}
              p={4}
              flex="1"
              overflowY="auto"
            >
              {messages.map((m) => (
                <Box
                  key={m.id}
                  alignSelf={m.me ? "flex-end" : "flex-start"}
                  bg={m.me ? "blue.600" : "gray.700"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  maxW="70%"
                >
                  {m.content}
                </Box>
              ))}

              <div ref={bottomRef} />
            </VStack>

            {/* Ô nhập tin nhắn */}
            <HStack>
              <Input
                placeholder="Nhập tin nhắn..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                bg="gray.800"
                border="none"
                color="white"
              />
              <Button
                bg="blue.600"
                _hover={{ bg: "blue.500" }}
                onClick={handleSend}
              >
                Gửi
              </Button>
            </HStack>
          </>
        )}
      </VStack>

      {/* =============== DIALOG CHỌN BƯU CỤC =============== */}
      <Dialog.Root open={openDialog} onOpenChange={(e) => setOpenDialog(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="400px" p={4}>
              <Dialog.Header>
                <Dialog.Title>Chọn bưu cục</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Fieldset.Root>
                  <Fieldset.Content>
                    <Field.Root>
                      <Field.Label>Bưu cục</Field.Label>
                      <Input placeholder="Nhập tên bưu cục để tìm..." />
                    </Field.Root>
                  </Fieldset.Content>
                </Fieldset.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => setOpenDialog(false)} mr={2}>
                  Huỷ
                </Button>
                <Button bg="orange.600" _hover={{ bg: "orange.500" }}>
                  Tạo cuộc trò chuyện
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </HStack>
  );
}
