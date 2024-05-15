import {
  Avatar,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { ChatState } from '../../context/ChatProvider';
import ProfileModal from '../modals/ProfileModal';
import { useNavigate } from 'react-router-dom';
import { getSender } from '../../config/chatLogics';

function Header({ searchHandler }) {
  const { user, setSelectedChat, notifications } = ChatState();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      bg='white'
      w='100%'
      p='5px 10px 5px 10px'
      borderWidth='5px'
    >
      <Tooltip label='Search users to chat' hasArrow placement='bottom'>
        <Button variant='ghost' onClick={searchHandler}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <Text display={{ base: 'none', md: 'flex' }} px={4}>
            Search user
          </Text>
        </Button>
      </Tooltip>
      <Text fontSize='2xl' fontFamily='Work sans'>
        BuzzChat
      </Text>
      <div>
        <Menu>
          <MenuButton p={1}>
            <Box position='relative' display='inline-block'>
              <BellIcon fontSize='2xl' m={1} />
              {notifications.length > 0 && (
                <Box
                  position='absolute'
                  top='0'
                  right='0'
                  width='15px'
                  height='15px'
                  bg='red.500'
                  borderRadius='full'
                  alignItems='center'
                >
                  <Text color='white' fontFamily='Work sans' fontSize={10}>
                    {notifications.length}
                  </Text>
                </Box>
              )}
            </Box>
          </MenuButton>
          <MenuList pl={2}>
            {!notifications.length && 'No new Messages'}
            {notifications.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => {
                  setSelectedChat(notif.chat);
                }}
              >
                {notif.chat.isGroupChat
                  ? `New Message in ${notif.chat.chatName}`
                  : `New message from ${getSender(user, notif.chat.users)}`}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            <Avatar
              size='sm'
              cursor='pointer'
              name={user.name}
              src={user.profilePic}
            />
          </MenuButton>
          <MenuList>
            <ProfileModal user={user}>
              <MenuItem>My Profile</MenuItem>
            </ProfileModal>
            <MenuDivider />
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Box>
  );
}

export default Header;
