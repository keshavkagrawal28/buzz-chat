import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { VStack } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useToasterMessage from '../../hooks/useToasterMessage';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showErrorToast, showSuccessToast, showWarningToast } =
    useToasterMessage();

  const navigate = useNavigate();

  const handlePasswordVisibility = () => {
    setShowPassword((state) => !state);
  };

  const getGuestCreds = () => {
    setEmail('guest@example.com');
    setPassword('guest123456');
  };

  const submitForm = async () => {
    setLoading(true);
    if (!email || !password) {
      showWarningToast('Please fill all the fields');
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
        '/api/user/login',
        { email, password },
        config
      );
      showSuccessToast('Login Successful!');
      localStorage.setItem('userInfo', JSON.stringify(data.data));
      navigate('/chats');
    } catch (err) {
      console.error(err);
      showErrorToast(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing='5px' color='black'>
      <FormControl id='loginemail' isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder='Enter your email'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </FormControl>
      <FormControl id='loginpassword' isRequired>
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
      <Button
        colorScheme='blue'
        width='100%'
        style={{ marginTop: 15 }}
        onClick={() => submitForm()}
        isLoading={loading}
      >
        Login
      </Button>
      <Button
        variant='solid'
        colorScheme='red'
        width='100%'
        style={{ marginTop: 15 }}
        onClick={() => getGuestCreds()}
      >
        Get guest user credentials
      </Button>
    </VStack>
  );
}

export default Login;
