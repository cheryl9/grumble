/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

const ChatUnreadContext = createContext(null);

export const useChatUnread = () => {
  const ctx = useContext(ChatUnreadContext);
  if (!ctx) {
    throw new Error("useChatUnread must be used within a ChatUnreadContext.Provider");
  }
  return ctx;
};

export default ChatUnreadContext;
