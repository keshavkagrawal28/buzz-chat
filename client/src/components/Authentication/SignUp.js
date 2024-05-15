import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { VStack } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useToasterMessage from '../../hooks/useToasterMessage';

function SignUp({ setTabIndex }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showErrorToast, showSuccessToast, showWarningToast } =
    useToasterMessage();

  const navigate = useNavigate();

  const handlePasswordVisibility = () => {
    setShowPassword((state) => !state);
  };
  const handleCPasswordVisibility = () => {
    setShowCPassword((state) => !state);
  };

  const uploadImage = (pic) => {
    setLoading(true);
    if (pic === undefined) {
      showWarningToast('Please select an image!');
      setLoading(false);
      return;
    }

    if (pic.type === 'image/jpeg' || pic.type === 'image/png') {
      const formData = new FormData();
      const cloudName = 'keshavkagrawal';
      formData.append('file', pic);
      formData.append('upload_preset', 'mern-chat-app');
      formData.append('cloud', cloudName);
      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          setProfilePic(data.url.toString());
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      showWarningToast('Please select an image!');
      setLoading(false);
      return;
    }
  };

  const submitForm = async () => {
    setLoading(true);
    if (!name || !email | !password || !confirmPassword) {
      showWarningToast('Please fill all the fields!');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showWarningToast('Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      const data = await axios.post(
        '/api/user',
        { name, email, password, profilePic },
        config
      );
      showSuccessToast('Registration successful!');
      localStorage.setItem('userInfo', JSON.stringify(data.data));
      navigate('/chats');
    } catch (err) {
      if (err?.response?.status === 409) {
        showWarningToast('User already exists!');
        setTabIndex(0);
      } else {
        console.error(err);
        showErrorToast(err?.response?.data?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing='5px' color='black'>
      <FormControl id='name' isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder='Enter your name'
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </FormControl>
      <FormControl id='email' isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder='Enter your email'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </FormControl>
      <FormControl id='password' isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder='Enter your password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <InputRightElement width='4.5rem'>
            <Button
              h='1.75rem'
              size='sm'
              onClick={() => handlePasswordVisibility()}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id='confirm-password' isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={showCPassword ? 'text' : 'password'}
            placeholder='Re-Enter your password'
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          />
          <InputRightElement width='4.5rem'>
            <Button
              h='1.75rem'
              size='sm'
              onClick={() => handleCPasswordVisibility()}
            >
              {showCPassword ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id='profile-pic'>
        <FormLabel>Upload your picture</FormLabel>
        <Input
          type='file'
          p={1.5}
          accept='image/*'
          onChange={(e) => {
            uploadImage(e.target.files[0]);
          }}
        />
      </FormControl>
      <Button
        colorScheme='blue'
        width='100%'
        style={{ marginTop: 15 }}
        onClick={() => submitForm()}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
}

export default SignUp;
