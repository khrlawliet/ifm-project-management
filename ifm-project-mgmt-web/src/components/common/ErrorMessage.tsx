import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ title = 'Error', message, onRetry }: ErrorMessageProps) => {
  return (
    <Box my={2}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <button onClick={onRetry} style={{ cursor: 'pointer' }}>
              Retry
            </button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
