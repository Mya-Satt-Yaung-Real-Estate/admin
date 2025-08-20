import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { UserPointTransaction } from '../../types/user';
import { formatDate } from '../../constants/dateFormats';

interface UserPointTransactionsProps {
  transactions: UserPointTransaction[];
}

const UserPointTransactions: React.FC<UserPointTransactionsProps> = ({ transactions }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getTransactionIcon = (type: 'DEBIT' | 'CREDIT') => {
    return type === 'CREDIT' ? <TrendingUpIcon /> : <TrendingDownIcon />;
  };

  const getTransactionColor = (type: 'DEBIT' | 'CREDIT') => {
    return type === 'CREDIT' ? 'success' : 'error';
  };

  const getReferenceTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'property_upload': 'Property Upload',
      'featured_property': 'Featured Property',
      'point_purchase': 'Point Purchase',
      'point_refund': 'Point Refund',
      'admin_adjustment': 'Admin Adjustment',
    };
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isMobile) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon color="primary" />
            Recent Transactions ({transactions.length})
          </Typography>

          {transactions.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
              No transactions found
            </Typography>
          ) : (
            <Box>
              {transactions.map((transaction) => (
                <Box
                  key={transaction.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTransactionIcon(transaction.transaction_type)}
                      <Typography variant="subtitle2" fontWeight="600">
                        {transaction.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${transaction.transaction_type === 'CREDIT' ? '+' : '-'}${transaction.points_amount}`}
                      color={getTransactionColor(transaction.transaction_type)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {getReferenceTypeLabel(transaction.reference_type)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(transaction.created_at, 'display')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BalanceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="textSecondary">
                        Balance: {transaction.balance_after.toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      ID: #{transaction.reference_id}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon color="primary" />
          Recent Transactions ({transactions.length})
        </Typography>

        {transactions.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
            No transactions found
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTransactionIcon(transaction.transaction_type)}
                        <Chip
                          label={transaction.transaction_type}
                          color={getTransactionColor(transaction.transaction_type)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {transaction.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {getReferenceTypeLabel(transaction.reference_type)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color={getTransactionColor(transaction.transaction_type)}
                      >
                        {transaction.transaction_type === 'CREDIT' ? '+' : '-'}
                        {transaction.points_amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="textSecondary">
                        {transaction.balance_after.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        #{transaction.reference_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(transaction.created_at, 'display')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPointTransactions;
