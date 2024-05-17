import { ChatState } from '../../context/ChatProvider';
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getCompleteSenderInfo } from '../../config/chatLogics';
import ProfileModal from '../modals/ProfileModal';
import UpdateGroupChatModal from '../modals/UpdateGroupChatModal';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';
import Lottie from 'react-lottie';
import io from 'socket.io-client';
import animationData from '../../assets/typing.json';
import useToasterMessage from '../../hooks/useToasterMessage';

const ENDPOINT = 'http://localhost:8080';
let socket, selectedChatCompare;
const defaultOptions = {
  loop: true,
  autoPlay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

function SingleChat({ fetchAgain, setFetchAgain }) {
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { showErrorToast } = useToasterMessage();

  const fetchMessages = async () => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setFetchAgain(!fetchAgain);
      socket.emit('join chat', selectedChat._id);
    } catch (err) {
      console.error(err);
      showErrorToast('Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (msg) => {
    if (!msg) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(
        '/api/message/markAsRead',
        {
          messageId: msg._id,
        },
        config
      );
    } catch (err) {
      console.error('Error while marking message as read', msg._id, err);
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => {
      setSocketConnected(true);
    });

    socket.on('typing', () => {
      setIsTyping(true);
    });

    socket.on('stop typing', () => {
      setIsTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // This will be updated every single time
  useEffect(() => {
    socket.on('message received', (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        setFetchAgain(!fetchAgain);
      } else {
        setMessages([...messages, newMessageReceived]);
        markMessageAsRead(newMessageReceived);
        setFetchAgain(!fetchAgain);
      }
    });
  });

  const sendMessage = async (event) => {
    if (event.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id);
      try {
        const config = {
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage('');

        const { data } = await axios.post(
          '/api/message',
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit('new message', data);
        setMessages([...messages, data]);
        setFetchAgain(!fetchAgain);
      } catch (err) {
        console.error(err);
        showErrorToast('Error in sending messages');
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w='100%'
            fontFamily='Work sans'
            display='flex'
            justifyContent={{ base: 'space-between' }}
            alignItems='center'
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat()}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal
                  user={getCompleteSenderInfo(user, selectedChat.users)}
                />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display='flex'
            flexDir='column'
            justifyContent='flex-end'
            p={3}
            bg='#E8E8E8'
            w='100%'
            h='100%'
            borderRadius='lg'
            overflowY='hidden'
          >
            {loading ? (
              <Spinner
                size='xl'
                w={20}
                h={20}
                alignSelf='center'
                margin='auto'
              />
            ) : (
              <div className='messages'>
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width='70px'
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant='filled'
                bg='#E0E0E0'
                placeholder='Enter a message...'
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          h='100%'
        >
          <Text fontSize='3xl' pb={3} fontFamily='Work sans'>
            Click on a user to start Chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat;
