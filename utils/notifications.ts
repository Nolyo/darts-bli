import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export const showNotification = (
  type: ToastType,
  title: string,
  message?: string,
  duration = 3000
) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: duration,
    topOffset: 60,
  });
};

export const showSuccess = (title: string, message?: string) => 
  showNotification('success', title, message);

export const showError = (title: string, message?: string) => 
  showNotification('error', title, message);

export const showInfo = (title: string, message?: string) => 
  showNotification('info', title, message);

export const showWarning = (title: string, message?: string) => 
  showNotification('warning', title, message);