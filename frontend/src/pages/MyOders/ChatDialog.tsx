import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  Paper,
  Chip
} from '@mui/material';
import {
  Support as SupportIcon,
  Phone as PhoneIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { Order, Message } from './types/order';

interface ChatDialogProps {
  open: boolean;
  order: Order | null;
  chatType: 'customer_service' | 'delivery_staff';
  messages: Message[];
  newMessage: string;
  onClose: () => void;
  onSendMessage: () => void;
  onMessageChange: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatDialog: React.FC<ChatDialogProps> = ({
  open,
  order,
  chatType,
  messages,
  newMessage,
  onClose,
  onSendMessage,
  onMessageChange,
  messagesEndRef
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {chatType === 'customer_service' ? (
              <SupportIcon color="primary" />
            ) : (
              <PhoneIcon color="primary" />
            )}
            <Typography variant="h6">
              {chatType === 'customer_service' ? 'Customer Service' : 'Delivery Staff'}
            </Typography>
          </Box>
          {order && (
            <Chip 
              label={`Order: ${order.id}`} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Order Info */}
        {order && (
          <Alert severity="info" sx={{ m: 2, mb: 1 }}>
            <Typography variant="body2">
              <strong>Restaurant:</strong> {order.restaurantName}
            </Typography>
            <Typography variant="body2">
              <strong>Total:</strong> ${order.totalPrice.toFixed(2)}
            </Typography>
            {order.estimatedDeliveryTime && (
              <Typography variant="body2">
                <strong>Estimated Delivery:</strong> {
                  typeof order.estimatedDeliveryTime === 'string'
                    ? order.estimatedDeliveryTime
                    : `${order.estimatedDeliveryTime.start} - ${order.estimatedDeliveryTime.end}`
                }
              </Typography>
            )}
          </Alert>
        )}

        {/* Delivery Staff Info (only for delivery staff chat) */}
        {chatType === 'delivery_staff' && order?.deliveryStaff && (
          <Box sx={{ 
            m: 2, 
            p: 2, 
            bgcolor: 'primary.main', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="primary.contrastText" fontWeight="bold">
                {order.deliveryStaff.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="primary.contrastText"
                sx={{ mt: 0.5 }}
              >
                {order.deliveryStaff.phone}
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                window.location.href = `tel:${order.deliveryStaff?.phone}`;
              }}
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              aria-label="Call delivery staff"
            >
              <PhoneIcon />
            </IconButton>
          </Box>
        )}
        
        {/* Messages Area */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1,
          bgcolor: 'background.default'
        }}>
          {messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="body2" color="text.secondary">
                {chatType === 'customer_service' 
                  ? 'Start a conversation with customer service'
                  : 'Start a conversation with delivery staff'}
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                      color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                      border: message.sender === 'staff' ? 1 : 0,
                      borderColor: message.sender === 'staff' ? 'divider' : 'transparent'
                    }}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.5,
                        opacity: 0.7
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              onClick={onSendMessage}
              disabled={!newMessage.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;