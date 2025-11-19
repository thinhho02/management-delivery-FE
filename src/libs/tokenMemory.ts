export const accessTokenMemory = new Map()

const AUTH_EVENT_KEY = "auth-event";

export function setAccessToken(token: string | null) {
  accessTokenMemory.set("accessToken", token)
}

export function getAccessToken(): string | null {
  return accessTokenMemory.get("accessToken")
}

export function clearAccessToken() {
  accessTokenMemory.clear()
}

/**
 * Broadcast event cho các tab khác, KHÔNG gửi token, chỉ gửi type
 */
export function broadcastAuthEvent(type: "LOGIN_B" | "LOGIN_I" | "LOGOUT" | "FORCE_LOGOUT") {
  try {
    localStorage.setItem(
      AUTH_EVENT_KEY,
      JSON.stringify({
        type,
        time: Date.now()
      })
    );
    // xóa ngay để không lưu state lâu dài (chỉ cần trigger storageEvent)
    localStorage.removeItem(AUTH_EVENT_KEY);
  } catch {
    // ignore
  }
}

export const AUTH_EVENT_STORAGE_KEY = AUTH_EVENT_KEY;