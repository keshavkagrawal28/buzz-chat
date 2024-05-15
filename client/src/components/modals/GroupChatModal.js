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
} from '@chakra-ui/react';
import { useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import UserListItem from '../user/UserListItem';
import axios from 'axios';
import UserBadgeItem from '../user/UserBadgeItem';
import useToasterMessage from '../../hooks/useToasterMessage';

function GroupChatModal({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const { user, chats, setChats, setSelectedChat } = ChatState();
  const { showErrorToast, showWarningToast, showSuccessToast } =
    useToasterMessage();

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

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes((u) => u._id === userToAdd._id)) {
      showWarningToast('User is already present!');
      return;
    }

    setSelectedUsers((users) => [...users, userToAdd]);
    setSearch('');
    setSearchResults([]);
  };

  const handleDelete = (userToRemove) => {
    if (!selectedUsers.find((u) => u._id === userToRemove._id)) {
      showWarningToast('User is not present in group!');
      return;
    }

    setSelectedUsers((users) =>
      users.filter((u) => u._id !== userToRemove._id)
    );
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers || selectedUsers.length === 0) {
      showWarningToast('Please fill all the fields!');
      return;
    }

    if (selectedUsers.length < 2) {
      showWarningToast('Group can not be created with a single user!');
    }

    try {
      setCreatingGroup(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        '/api/chat/group',
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([...chats, data]);
      setSelectedChat(data);
      showSuccessToast('New Group Created');
    } catch (err) {
      console.error(err);
      showErrorToast('Error while creating group chat');
    } finally {
      setCreatingGroup(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearch('');
    setGroupChatName('');
    setSelectedUsers([]);
    setSearchResults([]);
    onClose();
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize='35px'
            fontFamily='Work sans'
            display='flex'
            justifyContent='center'
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display='flex' flexDir='column' alignItems='center'>
            <FormControl>
              <Input
                placeholder='Chat Name'
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder='Add users eg: Keshav, John'
                mb={1}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w='100%' display='flex' flexWrap='wrap'>
              {selectedUsers.map((selectedUser) => (
                <UserBadgeItem
                  key={selectedUser._id}
                  user={selectedUser}
                  handleFunction={() => handleDelete(selectedUser)}
                />
              ))}
            </Box>
            {loading ? (
              <Spinner ml='auto' d='flex' />
            ) : (
              searchResults
                ?.slice(0, 4)
                .map((searchedUser) => (
                  <UserListItem
                    key={searchedUser._id}
                    user={searchedUser}
                    handleFunction={() => handleGroup(searchedUser)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme='blue'
              onClick={handleSubmit}
              isLoading={creatingGroup}
            >
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default GroupChatModal;
