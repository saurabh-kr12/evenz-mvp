// import React, { useState } from 'react';
// import { FaAddressCard, FaMapMarkerAlt, FaEllipsisV, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

// const AddressManager = () => {
//   const [addresses, setAddresses] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [currentAddress, setCurrentAddress] = useState({
//     name: '',
//     mobile: '',
//     pincode: '',
//     locality: '',
//     address: '',
//     city: '',
//     state: '',
//     landmark: '',
//     alternatePhone: '',
//     // addressType: 'Home'
//   });
//   const [editingIndex, setEditingIndex] = useState(-1);
//   const [activeMenu, setActiveMenu] = useState(-1);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentAddress(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddressTypeChange = (type) => {
//     setCurrentAddress(prev => ({ ...prev, addressType: type }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (editingIndex >= 0) {
//       // Update existing address
//       const updatedAddresses = [...addresses];
//       updatedAddresses[editingIndex] = currentAddress;
//       setAddresses(updatedAddresses);
//       setEditingIndex(-1);
//     } else {
//       // Add new address
//       setAddresses(prev => [...prev, currentAddress]);
//     }
    
//     resetForm();
//   };

//   const handleEdit = (index) => {
//     setCurrentAddress(addresses[index]);
//     setEditingIndex(index);
//     setShowForm(true);
//     setActiveMenu(-1);
//   };

//   const handleDelete = (index) => {
//     const updatedAddresses = addresses.filter((_, i) => i !== index);
//     setAddresses(updatedAddresses);
//     setActiveMenu(-1);
//   };

//   const resetForm = () => {
//     setCurrentAddress({
//       name: '',
//       mobile: '',
//       pincode: '',
//       locality: '',
//       address: '',
//       city: '',
//       state: '',
//       landmark: '',
//       alternatePhone: '',
//       addressType: 'Home'
//     });
//     setShowForm(false);
//   };

//   const toggleMenu = (index) => {
//     setActiveMenu(activeMenu === index ? -1 : index);
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm p-6 text-gray-800">
//       <h1 className="text-2xl font-semibold mb-6">Manage Addresses</h1>
      
//       {!showForm && (
//         <div className="border border-gray-200 rounded-lg p-4 mb-6">
//           <button 
//             onClick={() => setShowForm(true)} 
//             className="flex items-center text-blue-500 font-medium cursor-pointer"
//           >
//             <span className="text-xl mr-2">+</span>
//             ADD A NEW ADDRESS
//           </button>
//         </div>
//       )}

//       {showForm && (
//         <div className="border border-gray-200 rounded-lg p-4 mb-6">
//           <h2 className="text-lg font-medium mb-4">ADD A NEW ADDRESS</h2>
          
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Name"
//                 value={currentAddress.name}
//                 onChange={handleChange}
//                 className="border border-gray-300 rounded-lg p-2"
//                 required
//               />
//               <input
//                 type="tel"
//                 name="mobile"
//                 placeholder="10-digit mobile number"
//                 value={currentAddress.mobile}
//                 onChange={handleChange}
//                 className="border border-gray-300 rounded-lg p-2"
//                 required
//               />
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <input
//                 type="text"
//                 name="pincode"
//                 placeholder="Pincode"
//                 value={currentAddress.pincode}
//                 onChange={handleChange}
//                 className="border border-gray-300 rounded-lg p-2"
//                 required
//               />
//               <input
//                 type="text"
//                 name="locality"
//                 placeholder="Locality"
//                 value={currentAddress.locality}
//                 onChange={handleChange}
//                 className="border border-gray-300 rounded-lg p-2"
//                 required
//               />
//             </div>
            
//             <div className="mb-4">
//               <textarea
//                 name="address"
//                 placeholder="Address (Area and Street)"
//                 value={currentAddress.address}
//                 onChange={handleChange}
//                 className="border border-gray-300 rounded-lg p-2 w-full"
//                 rows="3"
//                 required
//               />
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <input
//                 type="text"
//                 name="city"
//                 placeholder="City/District/Town"
//                 value={currentAddress.city}
//                 onChange={handleChange}
//                 className="border border-gray-300 rounded-lg p-2"
//                 required
//               />
//               <select
//                 name="state"
//                 value={currentAddress.state}
//                 onChange={handleChange}
//                 className="border border-gray-300 rounded-lg p-2"
//                 required
//               >
//                 <option value="">--Select State--</option>
//                 <option value="Andhra Pradesh">Andhra Pradesh</option>
//                 <option value="Delhi">Delhi</option>
//                 <option value="Karnataka">Karnataka</option>
//                 <option value="Kerala">Kerala</option>
//                 <option value="Maharashtra">Maharashtra</option>
//                 <option value="Tamil Nadu">Tamil Nadu</option>
//                 <option value="Telangana">Telangana</option>
//                 <option value="Uttar Pradesh">Uttar Pradesh</option>
//                 {/* Add more states as needed */}
//               </select>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <input
//                 type="text"
//                 name="landmark"
//                 placeholder="Landmark (Optional)"
//                 value={currentAddress.landmark}
//                 onChange={handleChange}
//                 className="border border-gray-300 rounded-lg p-2"
//               />
//               <input
//                 type="tel"
//                 name="alternatePhone"
//                 placeholder="Alternate Phone (Optional)"
//                 value={currentAddress.alternatePhone}
//                 onChange={handleChange}
//                 className="border border-gray-300 rounded-lg p-2"
//               />
//             </div>
            
//             <div className="flex items-center">
//               <button 
//                 type="submit" 
//                 className="bg-blue-500 text-white font-medium py-2 px-6 rounded-lg mr-4 cursor-pointer"
//               >
//                 SAVE
//               </button>
//               <button 
//                 type="button" 
//                 onClick={resetForm}
//                 className="text-blue-500 cursor-pointer"
//               >
//                 CANCEL
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {addresses.length > 0 && (
//         <div className="mt-6">
//           <h2 className="text-lg font-medium mb-4">Saved Addresses</h2>
//           <div className="space-y-4">
//             {addresses.map((address, index) => (
//               <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
//                 <div className="absolute top-4 right-4">
//                   <div className="relative">
//                     <button 
//                       onClick={() => toggleMenu(index)}
//                       className="text-gray-600 hover:text-gray-800 cursor-pointer"
//                     >
//                       <FaEllipsisV />
//                     </button>
                    
//                     {activeMenu === index && (
//                       <div className="absolute right-0 bg-white shadow-lg rounded-lg py-2 w-32 z-10">
//                         <button 
//                           onClick={() => handleEdit(index)}
//                           className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left cursor-pointer"
//                         >
//                           <FaPencilAlt className="mr-2" /> Edit
//                         </button>
//                         <button 
//                           onClick={() => handleDelete(index)}
//                           className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500 cursor-pointer"
//                         >
//                           <FaTrashAlt className="mr-2" /> Delete
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="flex items-center mb-2">
//                   <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm mr-2">
//                     {address.addressType}
//                   </span>
//                   <span className="font-medium">{address.name}</span>
//                 </div>
                
//                 <p className="text-gray-700 mb-1">{address.address}</p>
//                 <p className="text-gray-700 mb-1">{address.locality}, {address.city}, {address.state} - {address.pincode}</p>
//                 {address.landmark && <p className="text-gray-700 mb-1">Landmark: {address.landmark}</p>}
//                 <p className="text-gray-700">Mobile: {address.mobile}</p>
//                 {address.alternatePhone && <p className="text-gray-700">Alt Phone: {address.alternatePhone}</p>}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddressManager;

import React, { useState, useEffect } from 'react';
import { FaAddressCard, FaMapMarkerAlt, FaEllipsisV, FaPencilAlt, FaTrashAlt, FaStar } from 'react-icons/fa';
import api from '@/services/api';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    name: '',
    mobile: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    alternatePhone: '',
    isDefault: false
  });
  const [editingIndex, setEditingIndex] = useState(-1);
  const [activeMenu, setActiveMenu] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/user/addresses');
      setAddresses(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load addresses. Please try again.');
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCurrentAddress(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingIndex >= 0) {
        // Update existing address
        const addressId = addresses[editingIndex]._id;
        await api.put(`/api/user/addresses/${addressId}`, currentAddress);
      } else {
        // Add new address
        await api.post('/api/user/addresses', currentAddress);
      }
      
      // Refresh the addresses list
      fetchAddresses();
      resetForm();
    } catch (err) {
      setError('Failed to save address. Please try again.');
      console.error('Error saving address:', err);
    }
  };

  const handleEdit = (index) => {
    const addressToEdit = addresses[index];
    setCurrentAddress({
      name: addressToEdit.name,
      mobile: addressToEdit.mobile,
      pincode: addressToEdit.pincode,
      locality: addressToEdit.locality,
      address: addressToEdit.address,
      city: addressToEdit.city,
      state: addressToEdit.state,
      landmark: addressToEdit.landmark || '',
      alternatePhone: addressToEdit.alternatePhone || '',
      isDefault: addressToEdit.isDefault
    });
    setEditingIndex(index);
    setShowForm(true);
    setActiveMenu(-1);
  };

  const handleDelete = async (index) => {
    try {
      const addressId = addresses[index]._id;
      await api.delete(`/api/user/addresses/${addressId}`);
      
      // Refresh the addresses list
      fetchAddresses();
      setActiveMenu(-1);
    } catch (err) {
      setError('Failed to delete address. Please try again.');
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefault = async (index) => {
    try {
      const addressId = addresses[index]._id;
      await api.put(`/api/user/addresses/${addressId}/default`);
      
      // Refresh the addresses list
      fetchAddresses();
      setActiveMenu(-1);
    } catch (err) {
      setError('Failed to set default address. Please try again.');
      console.error('Error setting default address:', err);
    }
  };

  const resetForm = () => {
    setCurrentAddress({
      name: '',
      mobile: '',
      pincode: '',
      locality: '',
      address: '',
      city: '',
      state: '',
      landmark: '',
      alternatePhone: '',
      isDefault: false
    });
    setShowForm(false);
    setEditingIndex(-1);
  };

  const toggleMenu = (index) => {
    setActiveMenu(activeMenu === index ? -1 : index);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-gray-800">
      <h1 className="text-2xl font-semibold mb-6">Manage Addresses</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!showForm && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center text-blue-500 font-medium cursor-pointer"
          >
            <span className="text-xl mr-2">+</span>
            ADD A NEW ADDRESS
          </button>
        </div>
      )}

      {showForm && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">
            {editingIndex >= 0 ? 'EDIT ADDRESS' : 'ADD A NEW ADDRESS'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={currentAddress.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2"
                required
              />
              <input
                type="tel"
                name="mobile"
                placeholder="10-digit mobile number"
                value={currentAddress.mobile}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={currentAddress.pincode}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2"
                required
              />
              <input
                type="text"
                name="locality"
                placeholder="Locality"
                value={currentAddress.locality}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            
            <div className="mb-4">
              <textarea
                name="address"
                placeholder="Address (Area and Street)"
                value={currentAddress.address}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
                rows="3"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="city"
                placeholder="City/District/Town"
                value={currentAddress.city}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2"
                required
              />
              <select
                name="state"
                value={currentAddress.state}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2"
                required
              >
                <option value="">--Select State--</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Delhi">Delhi</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                {/* Add more states as needed */}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="landmark"
                placeholder="Landmark (Optional)"
                value={currentAddress.landmark}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2"
              />
              <input
                type="tel"
                name="alternatePhone"
                placeholder="Alternate Phone (Optional)"
                value={currentAddress.alternatePhone}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={currentAddress.isDefault}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                Make this my default address
              </label>
            </div>
            
            <div className="flex items-center">
              <button 
                type="submit" 
                className="bg-blue-500 text-white font-medium py-2 px-6 rounded-lg mr-4 cursor-pointer"
              >
                SAVE
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="text-blue-500 cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : addresses.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-4">Saved Addresses</h2>
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <div key={address._id} className="border border-gray-200 rounded-lg p-4 relative">
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <button 
                      onClick={() => toggleMenu(index)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      <FaEllipsisV />
                    </button>
                    
                    {activeMenu === index && (
                      <div className="absolute right-0 bg-white shadow-lg rounded-lg py-2 w-40 z-10">
                        <button 
                          onClick={() => handleEdit(index)}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left cursor-pointer"
                        >
                          <FaPencilAlt className="mr-2" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(index)}
                          className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500 cursor-pointer"
                        >
                          <FaTrashAlt className="mr-2" /> Delete
                        </button>
                        {!address.isDefault && (
                          <button 
                            onClick={() => handleSetDefault(index)}
                            className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left cursor-pointer"
                          >
                            <FaStar className="mr-2" /> Set as Default
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center mb-2">
                  {address.isDefault && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2">
                      DEFAULT
                    </span>
                  )}
                  <span className="font-medium">{address.name}</span>
                </div>
                
                <p className="text-gray-700 mb-1">{address.address}</p>
                <p className="text-gray-700 mb-1">{address.locality}, {address.city}, {address.state} - {address.pincode}</p>
                {address.landmark && <p className="text-gray-700 mb-1">Landmark: {address.landmark}</p>}
                <p className="text-gray-700">Mobile: {address.mobile}</p>
                {address.alternatePhone && <p className="text-gray-700">Alt Phone: {address.alternatePhone}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No addresses saved yet.</p>
        </div>
      )}
    </div>
  );
};

export default AddressManager;