import { ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  Input,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { ChatState } from '../../context/ChatProvider';
import { useState } from 'react';
import UserBadgeItem from '../user/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../user/UserListItem';
import useToasterMessage from '../../hooks/useToasterMessage';

function UpdateGroupChatModal({ fetchAgain, setFetchAgain, fetchMessages }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [groupChatName, setGroupChatName] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { showErrorToast, showWarningToast } = useToasterMessage();

  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/chat/group/rename',
        { chatId: selectedChat._id, chatName: groupChatName },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (err) {
      console.error(err);
      showErrorToast('Unable to rename chat');
    } finally {
      setRenameLoading(false);
      setGroupChatName('');
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearch('');
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
      showErrorToast('Error in fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      showWarningToast('User already present in group!');
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      showWarningToast('Only admins can add users!');
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/chat/group/addUser',
        { chatId: selectedChat._id, userId: userToAdd._id },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setSearch('');
    } catch (err) {
      console.error(err);
      showErrorToast('Error in adding new user');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove) => {
    if (
      selectedChat.groupAdmin._id !== user._id &&
      userToRemove._id !== user._id
    ) {
      showWarningToast('Only admins can remve users!');
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/chat/group/removeUser',
        { chatId: selectedChat._id, userId: userToRemove._id },
        config
      );

      userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch (err) {
      console.error(err);
      showErrorToast('Error in adding new user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        display={{ base: 'flex' }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize='35px'
            fontFamily='Work sans'
            display='flex'
            justifyContent='center'
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display='flex' flexDir='column' alignItems='center'>
            <Box w='100%' display='flex' flexWrap='wrap'>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>

            <FormControl display='flex'>
              <Input
                placeholder='Chat Name'
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant='solid'
                colorScheme='teal'
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>

            <FormControl>
              <Input
                placeholder='Add user to group'
                mb={1}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size='lg' />
            ) : (
              searchResults
                ?.slice(0, 4)
                .map((searchedUser) => (
                  <UserListItem
                    key={searchedUser._id}
                    user={searchedUser}
                    handleFunction={() => handleAddUser(searchedUser)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme='red'>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default UpdateGroupChatModal;
