import { useEffect } from 'react';
import { ChatState } from '../../context/ChatProvider';
import { Box, Button, Stack, Text } from '@chakra-ui/react';
import axios from 'axios';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from '../loader/ChatLoading';
import { getSender } from '../../config/chatLogics';
import GroupChatModal from '../modals/GroupChatModal';
import useToasterMessage from '../../hooks/useToasterMessage';

function MyChats({ fetchAgain }) {
  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    manageNotifications,
  } = ChatState();
  const { showErrorToast } = useToasterMessage();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get('/api/chat', config);
      setChats(data);
      manageNotifications(data);
    } catch (err) {
      showErrorToast('Failed to load chats');
    } finally {
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  const handleChatClick = (chat) => {
    if (chat._id !== selectedChat?._id) {
      setSelectedChat(chat);
    }
  };

  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir='column'
      alignItems='center'
      p={3}
      bg='white'
      w={{ base: '100%', md: '31%' }}
      borderRadius='lg'
      borderWidth='1px'
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: '28px', md: '30px' }}
        fontFamily='Work sans'
        display='flex'
        w='100%'
        justifyContent='space-between'
        alignItems='center'
      >
        My Chats
        <GroupChatModal>
          <Button
            display='flex'
            fontSize={{ base: '17px', md: '10px', lg: '17px' }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display='flex'
        flexDir='column'
        p={3}
        bg='#F8F8F8'
        w='100%'
        h='100%'
        borderRadius='lg'
        overflowY='hidden'
      >
        {chats ? (
          <Stack overflowY='scroll'>
            {chats.map((chat) => (
              <Box
                onClick={() => handleChatClick(chat)}
                cursor='pointer'
                bg={selectedChat?._id === chat._id ? '#38B2AC' : '#E8E8E8'}
                color={selectedChat?._id === chat._id ? 'white' : 'black'}
                px={3}
                py={2}
                borderRadius='lg'
                key={chat._id}
              >
                {/* A profile pic can also be shown at this point. We can also add supprt to include a group pic */}
                <Text>
                  {!chat.isGroupChat
                    ? getSender(user, chat.users)
                    : chat.chatName}
                </Text>
                {/* TODO */}
                {/* below this text we will have one more thing, the sender of latest message and the latest message */}
                {/* if latest message is not read by current user, we will also mark that conversation with a red dot */}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
}

export default MyChats;
