import { useToast } from '@chakra-ui/react';

const useToasterMessage = () => {
  const toast = useToast();

  const showErrorToast = (message) => {
    toast({
      title: 'Error Occured!',
      description: message,
      status: 'error',
      duration: 3000,
      isClosable: true,
      position: 'bottom',
    });
  };

  const showSuccessToast = (message) => {
    toast({
      title: message,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'bottom',
    });
  };

  const showWarningToast = (message) => {
    toast({
      title: message,
      status: 'warning',
      duration: 3000,
      isClosable: true,
      position: 'bottom',
    });
  };

  return { showErrorToast, showSuccessToast, showWarningToast };
};

export default useToasterMessage;
