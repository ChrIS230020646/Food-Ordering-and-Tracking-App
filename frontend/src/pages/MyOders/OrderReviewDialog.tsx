import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Rating
} from '@mui/material';
import { Order } from './types/order';
import { OrderReview } from '../../services/api';

interface OrderReviewDialogProps {
  open: boolean;
  order: Order | null;
  initialReview?: OrderReview | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: { restRating: number; deliveryRating: number; comment?: string }) => Promise<void>;
}

const OrderReviewDialog: React.FC<OrderReviewDialogProps> = ({
  open,
  order,
  initialReview,
  loading = false,
  onClose,
  onSubmit
}) => {
  const [restRating, setRestRating] = useState<number | null>(null);
  const [deliveryRating, setDeliveryRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialReview) {
      setRestRating(initialReview.restRating);
      setDeliveryRating(initialReview.deliveryRating);
      setComment(initialReview.comment || '');
    } else {
      setRestRating(null);
      setDeliveryRating(null);
      setComment('');
    }
  }, [initialReview, open]);

  const handleSubmit = async () => {
    if (!restRating || !deliveryRating) {
      alert('請先為餐廳與外賣員都選擇星等。');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        restRating,
        deliveryRating,
        comment: comment.trim() || undefined
      });
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || loading;

  return (
    <Dialog open={open} onClose={disabled ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        評價訂單 {order?.orderid ? `#${order.orderid}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            餐廳評分（食物整體體驗）
          </Typography>
          <Rating
            name="rest-rating"
            value={restRating}
            onChange={(_, value) => setRestRating(value)}
            size="large"
            disabled={disabled}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            外賣員評分（送餐服務）
          </Typography>
          <Rating
            name="delivery-rating"
            value={deliveryRating}
            onChange={(_, value) => setDeliveryRating(value)}
            size="large"
            disabled={disabled}
          />
        </Box>

        <TextField
          label="留言（選填）"
          multiline
          minRows={3}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={disabled}
          placeholder="可以寫下對餐廳或外賣員的稱讚、建議等。"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={disabled}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || !restRating || !deliveryRating}
        >
          {submitting ? '送出中...' : initialReview ? '更新評價' : '送出評價'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderReviewDialog;


