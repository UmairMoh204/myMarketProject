import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';
import api from '../utils/auth';
import './OrderTable.css';

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/');
        if (response.data) {
          setOrders(response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>{error}</div>;
  if (orders.length === 0) return <div>No orders found</div>;

  return (
    <TableContainer component={Paper} className="order-table-container">
      <Table sx={{ minWidth: 650 }} aria-label="order table">
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell component="th" scope="row">
                #{order.id}
              </TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <img 
                        src={item.listing_image} 
                        alt={item.listing_title} 
                        className="order-item-image"
                      />
                      <div className="order-item-details">
                        <div className="order-item-title">{item.listing_title}</div>
                        <div className="order-item-quantity">Qty: {item.quantity}</div>
                        <div className="order-item-price">${item.price}</div>
                        {item.seller_username && (
                          <div className="order-item-seller">Seller: {item.seller_username}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>${order.total_price}</TableCell>
              <TableCell>
                <span className={`order-status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </TableCell>
              <TableCell>
                {order.items.some(item => item.seller_username === order.user_username) ? 'Seller' : 'Buyer'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}