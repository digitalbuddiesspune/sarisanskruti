import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getMyAddress, saveMyAddress, deleteAddressById, createPayUTxn, verifyPayment, createCODOrder } from '../services/api';
import { api } from '../utils/api';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
].sort();

export default function AddressForm() {
  const navigate = useNavigate();
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredStates, setFilteredStates] = useState([...indianStates]);
  const [searchTerm, setSearchTerm] = useState('');
  const stateDropdownRef = useRef(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [addressId, setAddressId] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredStates(
        indianStates.filter(state =>
          state.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredStates([...indianStates]);
    }
  }, [searchTerm]);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    pincode: '110034',
    locality: 'Netaji Subhash Place',
    address: '365, 3rd Floor, H9, Vardhman Corporate Plaza',
    city: 'Pitampura',
    state: 'Delhi',
    landmark: '',
    alternatePhone: '',
    addressType: 'home'
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payu'); // 'payu' or 'cod'
  const [processingOrder, setProcessingOrder] = useState(false);
  const { cart, cartTotal: total, loadCart } = useCart();

  // Calculate price details
  const calculatePriceDetails = () => {
    const subtotal = total || 0;
    const shippingCharge = subtotal < 5000 ? 99 : 0;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const totalPayable = subtotal + shippingCharge + tax;
    const savings = Math.round(subtotal * 0.35); // Assuming 35% savings
    const supercoins = Math.min(30, Math.floor(subtotal / 1000) * 10); // 10 supercoins per 1000 spent, max 30

    return {
      subtotal,
      shippingCharge,
      tax,
      total: totalPayable,
      savings,
      supercoins,
      items: cart?.length || 0,
      cartItems: cart || []
    };
  };

  const priceDetails = calculatePriceDetails();

  const handlePayment = async () => {
    if (!hasSavedAddress) {
      alert('Please save your delivery address first.');
      return;
    }
    
    // Validate required fields
    if (!formData.name || !formData.mobile) {
      alert('Please ensure your name and mobile number are saved in the address.');
      return;
    }
    
    if (paymentMethod === 'payu' && !userEmail) {
      alert('Unable to fetch your email. Please refresh the page and try again.');
      return;
    }
    
    try {
      setProcessingOrder(true);

      if (paymentMethod === 'cod') {
        // Handle COD order
        try {
          const result = await createCODOrder();
          console.log('COD Order successful:', result);
          // Reload cart to reflect empty cart
          if (loadCart) {
            await loadCart();
          }
          // Navigate to success page
          navigate('/payment-success?type=cod');
          return; // Exit early to prevent further execution
        } catch (codError) {
          console.error('COD Order error:', codError);
          throw codError; // Re-throw to be caught by outer catch
        }
      } else {
        // Handle PayU payment
        const amount = priceDetails.total;
        if (!amount || amount <= 0) {
          alert('Invalid order amount. Please check your cart.');
          return;
        }
        
        console.log('Creating PayU transaction with:', {
          amount,
          name: formData.name.trim(),
          email: userEmail.trim(),
          phone: formData.mobile.trim()
        });
        
        const payuData = await createPayUTxn(
          amount,
          formData.name.trim(),
          userEmail.trim(),
          formData.mobile.trim()
        );

        console.log('PayU transaction created:', payuData);

        // Create a form and auto-submit to PayU
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://test.payu.in/_payment'; // PayU test URL
        form.id = 'payuForm';

        // Add ALL required PayU fields in EXACT order and naming
        const addField = (name, value) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value || '';
          form.appendChild(input);
        };

        // Required fields (must match backend hash calculation order)
        addField('key', payuData.key);
        addField('txnid', payuData.txnid);
        addField('amount', payuData.amount);
        addField('productinfo', payuData.productinfo);
        addField('firstname', payuData.firstname);
        addField('email', payuData.email);
        
        // UDF fields (required even if empty - must be present for hash to match)
        addField('udf1', '');
        addField('udf2', '');
        addField('udf3', '');
        addField('udf4', '');
        addField('udf5', '');
        
        // Additional required fields
        addField('phone', payuData.phone);
        addField('surl', payuData.surl);
        addField('furl', payuData.furl);
        addField('hash', payuData.hash);

        document.body.appendChild(form);
        
        // Auto-submit the form
        form.submit();
      }
    } catch (e) {
      console.error('Payment error:', e);
      const errorMessage = e.message || 'Unable to process order. Please try again.';
      alert(errorMessage);
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      addressType: type
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await resp.json();
        const addr = data.address || {};
        const pincode = addr.postcode || '';
        const city = addr.city || addr.town || addr.village || addr.district || '';
        const state = addr.state || '';
        const locality = addr.suburb || addr.neighbourhood || addr.quarter || '';
        const road = addr.road || addr.residential || '';
        const house = addr.house_number ? `${addr.house_number}, ` : '';
        const composed = `${house}${road}`.trim();
        setFormData((prev) => ({
          ...prev,
          pincode,
          city,
          state,
          locality: locality || prev.locality,
          address: composed || prev.address,
        }));
      } catch (e) {
        console.error('Reverse geocoding failed', e);
        alert('Could not fetch address from location');
      }
    }, (err) => {
      alert('Unable to get your location');
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const validateForm = () => {
    const errors = [];
    
    // Required fields validation
    if (!formData.name.trim()) errors.push('Name is required');
    if (!formData.mobile.trim()) errors.push('Mobile number is required');
    if (!formData.pincode.trim()) errors.push('Pincode is required');
    if (!formData.locality.trim()) errors.push('Locality is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.city.trim()) errors.push('City is required');
    if (!formData.state.trim()) errors.push('State is required');
    
    // Format validations
    if (formData.mobile.trim() && !/^\d{10}$/.test(formData.mobile.trim())) {
      errors.push('Mobile number must be 10 digits');
    }
    
    if (formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      errors.push('Pincode must be 6 digits');
    }
    
    if (formData.alternatePhone.trim() && !/^\d{10}$/.test(formData.alternatePhone.trim())) {
      errors.push('Alternate phone must be 10 digits if provided');
    }
    
    return errors;
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }
    const payload = {
      fullName: formData.name.trim(),
      mobileNumber: formData.mobile.trim(),
      pincode: formData.pincode.trim(),
      locality: formData.locality.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      landmark: formData.landmark.trim(),
      alternatePhone: formData.alternatePhone.trim(),
      addressType: formData.addressType === 'work' ? 'Work' : 'Home',
    };
    try {
      setSaving(true);
      const saved = await saveMyAddress(payload);
      setHasSavedAddress(true);
      setShowSuccess(true);
      setEditMode(false);
      setShowForm(false); // Hide the form after successful save
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save address. Please sign in and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
  };

  // Load existing address and user email on mount
  useEffect(() => {
    const load = async () => {
      try {
        // Check if form was already submitted (prevent duplicate on page reload)
        const formWasSubmitted = sessionStorage.getItem('payuFormSubmitted');
        if (formWasSubmitted === 'true') {
          console.warn('Payment form was already submitted, clearing state after delay');
          // Clear after 10 seconds to allow retry
          setTimeout(() => {
            sessionStorage.removeItem('payuFormSubmitted');
            sessionStorage.removeItem('payuTxnId');
          }, 10000);
        }
        
        setLoadingAddress(true);
        // Fetch user email
        try {
          const userData = await api.me();
          setUserEmail(userData.user?.email || '');
        } catch (e) {
          console.error('Failed to fetch user email:', e);
        }
        
        const doc = await getMyAddress();
        if (doc && doc._id) {
          setAddressId(doc._id);
          setHasSavedAddress(true);
          setShowForm(false); // Hide form if address exists
          setEditMode(false);
          setFormData({
            name: doc.fullName || '',
            mobile: doc.mobileNumber || '',
            pincode: doc.pincode || '',
            locality: doc.locality || '',
            address: doc.address || '',
            city: doc.city || '',
            state: doc.state || '',
            landmark: doc.landmark || '',
            alternatePhone: doc.alternatePhone || '',
            addressType: (doc.addressType || 'Home').toLowerCase(),
          });
        } else {
          setShowForm(true); // Show form if no address exists
        }
      } catch (e) {
        // no-op if unauthenticated
        setShowForm(true); // Show form if there's an error
      } finally {
        setLoadingAddress(false);
      }
    };
    load();
  }, []);

  const handleEditAddress = () => {
    setShowForm(true);
    setEditMode(true);
  };

  const handleDeleteAddress = async () => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      setLoadingAddress(true);
      await deleteAddressById(addressId);
      // Reset form and show empty form
      setFormData({
        name: '',
        mobile: '',
        pincode: '110034',
        locality: 'Netaji Subhash Place',
        address: '365, 3rd Floor, H9, Vardhman Corporate Plaza',
        city: 'Pitampura',
        state: 'Delhi',
        landmark: '',
        alternatePhone: '',
        addressType: 'home'
      });
      setAddressId(null);
      setHasSavedAddress(false);
      setShowForm(true);
      setEditMode(true);
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {showForm ? (
            <form onSubmit={handleSaveAddress} className="bg-white shadow-sm rounded">
            <div className="bg-black text-white p-4 flex items-center gap-3">
              <span>1</span>
              <span className="font-medium">DELIVERY ADDRESS</span>
            </div>

            <div className="p-6">
              {loadingAddress && (
                <div className="mb-4 text-sm text-gray-600">Loading your saved address…</div>
              )}
              {hasSavedAddress && !editMode && (
                <div className="mb-6 border rounded p-4 bg-gray-50">
                  <div className="font-medium text-gray-900">{formData.name}</div>
                  <div className="text-sm text-gray-700">{formData.address}</div>
                  <div className="text-sm text-gray-700">{formData.locality}, {formData.city} - {formData.pincode}</div>
                  <div className="text-sm text-gray-700">{formData.state}</div>
                  <div className="text-sm text-gray-700">Mobile: {formData.mobile}</div>
                  {formData.landmark && <div className="text-sm text-gray-700">Landmark: {formData.landmark}</div>}
                  {formData.alternatePhone && <div className="text-sm text-gray-700">Alt: {formData.alternatePhone}</div>}
                  <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => setEditMode(true)} className="px-4 py-2 border rounded text-black border-black hover:bg-gray-50 cursor-pointer">Edit Address</button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this address?')) {
                          try {
                            await deleteAddressById(addressId);
                            setHasSavedAddress(false);
                            setEditMode(true);
                            setFormData({
                              name: '',
                              mobile: '',
                              pincode: '110034',
                              locality: 'Netaji Subhash Place',
                              address: '365, 3rd Floor, H9, Vardhman Corporate Plaza',
                              city: 'Pitampura',
                              state: 'Delhi',
                              landmark: '',
                              alternatePhone: '',
                              addressType: 'home'
                            });
                            setAddressId(null);
                            alert('Address deleted successfully');
                          } catch (error) {
                            console.error('Error deleting address:', error);
                            alert(error.message || 'Failed to delete address. Please try again.');
                          }
                        }
                      }}
                      className="px-4 py-2 border rounded text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Delete Address
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="mb-6 bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Use my current location
              </button>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">10-digit mobile number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    placeholder="Enter 6-digit pincode"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Locality</label>
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    placeholder="Enter your locality"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className={`${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <label className="block text-xs text-gray-600 mb-1">Address (Area and Street)</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter your complete address"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">City/District/Town</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="relative" ref={stateDropdownRef}>
                  <label className="block text-xs text-gray-600 mb-1">State</label>
                  <div 
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                    onClick={() => setShowStateDropdown(!showStateDropdown)}
                  >
                    {formData.state || 'Select State'}
                  </div>
                  
                  {showStateDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search state..."
                          className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredStates.length > 0 ? (
                          filteredStates.map((state) => (
                            <div
                              key={state}
                              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                                formData.state === state ? 'bg-gray-100 text-black' : ''
                              }`}
                              onClick={() => {
                                setFormData({ ...formData, state });
                                setShowStateDropdown(false);
                                setSearchTerm('');
                              }}
                            >
                              {state}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No states found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="E.g., Near Central Mall"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Alternate Phone (Optional)</label>
                  <input
                    type="text"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="Alternate phone (Optional)"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className={`${hasSavedAddress && !editMode ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                <label className="block text-xs text-gray-600 mb-2">Address Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="addressType"
                      checked={formData.addressType === 'home'}
                      onChange={() => handleAddressTypeChange('home')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Home (All day delivery)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="addressType"
                      checked={formData.addressType === 'work'}
                      onChange={() => handleAddressTypeChange('work')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Work (Delivery between 10 AM - 5 PM)</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full">
                <button
                  type="submit"
                  disabled={saving}
                  className={`bg-black hover:bg-gray-800 text-white px-8 py-3 rounded font-medium transition-colors cursor-pointer w-full sm:w-auto text-center ${saving ? 'opacity-70' : ''}`}
                >
                  SAVE AND DELIVER HERE
                </button>
                <button
                  onClick={handleCancel}
                  className="text-black hover:text-gray-800 px-6 py-3 rounded font-medium transition cursor-pointer w-full sm:w-auto text-center border border-black hover:bg-gray-50"
                >
                  CANCEL
                </button>
              </div>

              {showSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Address saved successfully!
                </div>
              )}
            </div>
            </form>
          ) : (
            <div className="bg-white shadow-sm rounded">
              <div className="bg-black text-white p-4 flex items-center gap-3">
                <span>1</span>
                <span className="font-medium">DELIVERY ADDRESS</span>
              </div>
              <div className="p-6">
                <div className="mb-4 p-4 border border-green-200 bg-green-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{formData.name}</h3>
                      <p className="text-gray-700">
                        {formData.address}, {formData.locality},<br />
                        {formData.city}, {formData.state} - {formData.pincode}
                      </p>
                      <p className="mt-2">
                        <span className="font-medium">Mobile:</span> {formData.mobile}
                        {formData.alternatePhone && `, ${formData.alternatePhone}`}
                      </p>
                      {formData.landmark && (
                        <p><span className="font-medium">Landmark:</span> {formData.landmark}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleEditAddress}
                          className="text-black hover:text-gray-800 text-sm font-medium"
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteAddress}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          DELETE
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formData.addressType.toUpperCase()} ADDRESS
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded p-4 sticky top-4">
            <h3 className="text-gray-500 text-sm font-medium mb-4">PRICE DETAILS</h3>

            <div className="space-y-3 mb-4 pb-4 border-b">
              <div className="flex justify-between text-sm">
                <span>Price ({priceDetails.items} {priceDetails.items === 1 ? 'item' : 'items'})</span>
                <span>₹{priceDetails.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className={priceDetails.shippingCharge > 0 ? 'text-gray-600' : 'text-green-600'}>
                  {priceDetails.shippingCharge > 0 ? `₹${priceDetails.shippingCharge.toLocaleString()}` : 'Free'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (5%)</span>
                <span>₹{priceDetails.tax.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between font-medium text-base mb-4 pb-4 border-b">
              <span>Total Payable</span>
              <span>₹{priceDetails.total.toLocaleString()}</span>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4 pb-4 border-b">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="payu"
                    checked={paymentMethod === 'payu'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-black focus:ring-black"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Online Payment (PayU)</div>
                    <div className="text-xs text-gray-500">Pay securely with debit/credit card, UPI, netbanking</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-black focus:ring-black"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Cash on Delivery (COD)</div>
                    <div className="text-xs text-gray-500">Pay cash when your order is delivered</div>
                  </div>
                </label>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={!hasSavedAddress || processingOrder}
              className={`w-full mt-4 py-3 px-4 rounded-md transition-colors font-medium cursor-pointer ${hasSavedAddress && !processingOrder ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
            >
              {processingOrder ? 'Processing...' : paymentMethod === 'cod' ? 'PLACE ORDER (COD)' : 'PROCEED TO PAYMENT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}