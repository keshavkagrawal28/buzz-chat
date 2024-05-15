import ChatBox from '../components/chat/ChatBox';
import MyChats from '../components/chat/MyChats';
import Header from '../components/pagelayout/Header';
import SideDrawer from '../components/pagelayout/SideDrawer';
import { ChatState } from '../context/ChatProvider';
import { Box, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';

function Chat() {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div style={{ width: '100%' }}>
      {user && (
        <>
          <Header searchHandler={onOpen} />
          <SideDrawer isOpen={isOpen} onClose={onClose} />
        </>
      )}
      <Box
        display='flex'
        justifyContent='space-between'
        w='100%'
        h='91.5vh'
        p='10px'
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
}

export default Chat;
