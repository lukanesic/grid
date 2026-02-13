import React, { createContext, ReactNode, useContext, useState } from "react";
import { CHATS as INITIAL_CHATS, SUGGESTED_USERS } from "../constants/data";

export interface Chat {
  id: number;
  name: string;
  message: string;
  time: string;
  avatar: string;
  unreadCount?: number;
  isOnline: boolean;
  isRead?: boolean;
  isGroup?: boolean;
  members?: number[];
  groupAvatars?: string[];
}

interface ChatContextType {
  chats: Chat[];
  addChat: (chat: Omit<Chat, "id">) => void;
  updateGroupMembers: (chatId: number, newMemberIds: number[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS as Chat[]);

  const addChat = (newChat: Omit<Chat, "id">) => {
    const id = Math.max(...chats.map((c) => c.id), 0) + 1;
    const chatWithId = { ...newChat, id };
    setChats([chatWithId, ...chats]);
  };

  const updateGroupMembers = (chatId: number, newMemberIds: number[]) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId && chat.isGroup) {
          const updatedMembers = [...(chat.members || []), ...newMemberIds];

          // Update group avatars with first two members
          const firstTwoMembers = updatedMembers.slice(0, 2);
          const updatedAvatars = firstTwoMembers
            .map((memberId) => {
              const user = SUGGESTED_USERS.find((u) => u.id === memberId);
              return user?.avatar;
            })
            .filter((avatar): avatar is string => !!avatar);

          return {
            ...chat,
            members: updatedMembers,
            groupAvatars:
              updatedAvatars.length > 0 ? updatedAvatars : chat.groupAvatars,
          };
        }
        return chat;
      }),
    );
  };

  return (
    <ChatContext.Provider value={{ chats, addChat, updateGroupMembers }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChats() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChats must be used within ChatProvider");
  }
  return context;
}
