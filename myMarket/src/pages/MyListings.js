import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import ItemSlider from '../components/ItemSlider';
import Table from '../components/OrderTable';
import MyListingItemSlider from '../components/myListingItemSlider';
import OrderTable from '../components/OrderTable';
import './MyListings.css';

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newListing, setNewListing] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Electronics',
        condition: 'New',
        image: null
    });
    const navigate = useNavigate();

    const categoryOptions = [
        'Electronics',
        'Clothing',
        'Books',
        'Home',
        'Sports',
        'Other'
    ];

    const conditionOptions = [
        'New',
        'Like New',
        'Good',
        'Fair',
        'Poor'
    ];

    useEffect(() => {
        fetchMyListings();
        fetchUserProfile();
        fetchOrders();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found. Please log in.');
                return;
            }
            
            const response = await axios.get('http://localhost:8000/api/user-profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data) {
                setUserProfile(response.data);
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };
    
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found. Please log in.');
                return;
            }
            
            const response = await axios.get('http://localhost:8000/api/orders/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data) {
                setOrders(response.data);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const fetchMyListings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found. Please log in.');
                setError('Please log in to view your listings');
                setLoading(false);
                return;
            }
            
            const response = await axios.get('http://localhost:8000/api/listings/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    filter: 'my_listings'
                }
            });
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setListings(response.data);
                } else if (response.data.results) {
                    setListings(response.data.results);
                } else {
                    setListings([]);
                }
            } else {
                setListings([]);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            
            if (err.response?.status === 401) {
                setError('Please log in to view your listings');
            } else if (err.response?.status === 404) {
                setError('API endpoint not found. Please check if the server is running.');
            } else {
                setError(`Failed to fetch listings: ${err.message}`);
            }
            
            setLoading(false);
            setListings([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewListing(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setNewListing(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            // Convert price to a valid decimal number
            const price = parseFloat(newListing.price);
            if (isNaN(price)) {
                setError('Please enter a valid price');
                return;
            }
            
            // Add all fields to formData
            formData.append('title', newListing.title);
            formData.append('description', newListing.description);
            formData.append('price', price);
            formData.append('category', newListing.category);
            formData.append('condition', newListing.condition);
            if (newListing.image) {
                formData.append('image', newListing.image);
            }

            const response = await axios.post('http://localhost:8000/api/listings/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Listing created:', response.data);
            await fetchMyListings();
            setNewListing({
                title: '',
                description: '',
                price: '',
                category: 'Electronics',
                condition: 'New',
                image: null
            });
            setShowCreateForm(false);
        } catch (err) {
            console.error('Error creating listing:', err.response?.data || err.message);
            if (err.response?.data) {
                const errors = Object.entries(err.response.data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                setError(`Failed to create listing: ${errors}`);
            } else {
                setError(`Failed to create listing: ${err.message}`);
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/listings/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchMyListings();
        } catch (err) {
            setError('Failed to delete listing');
        }
    };

    const handleTrackingSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrder || !trackingNumber) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8000/api/orders/${selectedOrder.id}/tracking/`, {
                tracking_number: trackingNumber
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setTrackingNumber('');
            setSelectedOrder(null);
            // Refresh orders or show success message
        } catch (err) {
            setError('Failed to update tracking number');
        }
    };


    if (loading) return (
        <div>
            <Navigation />
            <div className="loading">Loading listings...</div>
        </div>
    );
    if (error) return (
        <div>
            <Navigation />
            <div className="error">{error}</div>
        </div>
    );

    return (
        <div>
            <Navigation />
            {/* User Profile Section */}
            <div className="user-profile-section">
                    <div className="profile-header">
                        <div className="profile-image">
                            {userProfile?.profile_picture ? (
                                <img src={userProfile.profile_picture} alt="Profile" />
                            ) : (
                                <div className="default-profile-image">
                                    {userProfile?.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="profile-info">
                            <h2>{userProfile?.username}</h2>
                            <p>{userProfile?.email}</p>
                        </div>
                    </div>
                    <div className="sales-stats">
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Total Sales: ${orders.reduce((total, order) => total + order.total_price, 0)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Active Listings: {listings.filter(l => l.is_active).length}</span>
                            </div>
                        </div>
                    </div>
                </div> 
{/* 
                Order Tracking Section */}
                {/* <div className="order-tracking-section">
                    <h3>Order Tracking</h3>
                    <div className="tracking-form">
                        <select 
                            value={selectedOrder?.id || ''}
                            onChange={(e) => {
                                const order = listings.find(l => l.id === parseInt(e.target.value));
                                setSelectedOrder(order);
                            }}
                        >
                            <option value="">Select an order</option>
                            {listings.map(listing => (
                                <option key={listing.id} value={listing.id}>
                                    {listing.title} - ${listing.price}
                                </option>
                            ))}
                        </select>
                        <form onSubmit={handleTrackingSubmit}>
                            <input
                                type="text"
                                placeholder="Enter tracking number"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                            <button type="submit">Update Tracking</button>
                        </form>
                    </div>
                </div>  */}

            <div className="orders-section">
                <h2>Order History</h2>
                <OrderTable />
            </div>
            
            <div className="my-listings-container">
                {/* Existing Listings Section */}
                <div className="listings-header">
                    <h2>My Listings</h2>
                    <button 
                        className="create-listing-button"
                        onClick={() => setShowCreateForm(true)}
                    >
                        Create New Listing
                    </button>
                </div>
                
                {showCreateForm && (
                    <div className="modal-overlay">
                        <div className="create-listing-modal">
                            <div className="modal-header">
                                <h2>Create New Listing</h2>
                                <button 
                                    className="close-button"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newListing.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={newListing.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={newListing.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        name="category"
                                        value={newListing.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {categoryOptions.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Condition</label>
                                    <select
                                        name="condition"
                                        value={newListing.condition}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {conditionOptions.map(condition => (
                                            <option key={condition} value={condition}>
                                                {condition}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                
                                <button type="submit">Create Listing</button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="featured-listings">
                    {loading ? (
                        <p className="loading">Loading listings...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : listings.length > 0 ? (
                        <MyListingItemSlider 
                            items={listings.map(listing => ({
                                id: listing.id,
                                content: listing.title,
                                price: listing.price,
                                image: listing.image,
                                category: listing.category,
                                condition: listing.condition,
                                seller: listing.owner?.username || 'Unknown'
                            }))}
                        />
                    ) : (
                        <p className="no-listings">No listings available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyListings; 