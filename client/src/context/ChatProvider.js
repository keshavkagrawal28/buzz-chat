import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setUser(userInfo);

    if (!userInfo) {
      navigate('/');
    }
  }, [navigate]);

  const manageNotifications = (data) => {
    let notifs = [];
    data.forEach((chat) => {
      const { latestMessage, ...chatData } = chat;
      if (
        latestMessage &&
        latestMessage.sender._id !== user._id &&
        !latestMessage.readBy.find((id) => id === user._id) &&
        (!selectedChat || selectedChat._id !== chat._id)
      ) {
        notifs.push({ latestMessage, chat: chatData });
      }
    });
    setNotifications(notifs);
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notifications,
        manageNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
