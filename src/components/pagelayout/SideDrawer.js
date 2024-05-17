import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import axios from 'axios';
import ChatLoading from '../loader/ChatLoading';
import UserListItem from '../user/UserListItem';
import useToasterMessage from '../../hooks/useToasterMessage';

function SideDrawer({ isOpen, onClose }) {
  const { user, setSelectedChat, chats, setChats } = ChatState();
  const { showErrorToast, showWarningToast } = useToasterMessage();

  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const closeSideDrawer = () => {
    setSearch('');
    setSearchResult([]);
    onClose();
  };

  const handleSearch = async () => {
    if (!search) {
      showWarningToast('Search bar cannot be empty!');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load search results');
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post('/api/chat', { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load chat');
    } finally {
      setLoadingChat(false);
      closeSideDrawer();
    }
  };

  return (
    <>
      <Drawer placement='left' onClose={closeSideDrawer} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'>Search Users</DrawerHeader>

          <DrawerBody>
            <Box display='flex' pb={2}>
              <Input
                placeholder='Search by name or email'
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((searchuser) => (
                <UserListItem
                  key={searchuser._id}
                  user={searchuser}
                  handleFunction={() => accessChat(searchuser._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml='auto' d='flex' />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
