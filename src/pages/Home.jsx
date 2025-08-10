import React, { useState, useContext, createContext, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';

// Step 1: Create Context for managing all our contacts
const ContactContext = createContext();

// Step 2: Contact Provider Component (like a big storage box for all contacts)
const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [currentView, setCurrentView] = useState('contacts'); // 'contacts' or 'add'
  const [editingContact, setEditingContact] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const API_URL = 'https://playground.4geeks.com/contact';

  // Function to get all contacts from the API
  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/agendas/demo/contacts`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      } else {
        // If agenda doesn't exist, create it
        await fetch(`${API_URL}/agendas/demo`, { method: 'POST' });
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    }
  };

  // Function to add a new contact
  const addContact = async (contactData) => {
    try {
      const response = await fetch(`${API_URL}/agendas/demo/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      if (response.ok) {
        await fetchContacts(); // Refresh the list
        return true;
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
    return false;
  };

  // Function to update a contact
  const updateContact = async (id, contactData) => {
    try {
      const response = await fetch(`${API_URL}/agendas/demo/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      if (response.ok) {
        await fetchContacts(); // Refresh the list
        return true;
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
    return false;
  };

  // Function to delete a contact
  const deleteContact = async (id) => {
    try {
      const response = await fetch(`${API_URL}/agendas/demo/contacts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchContacts(); // Refresh the list
        return true;
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
    return false;
  };

  // Load contacts when the app starts
  useEffect(() => {
    fetchContacts();
  }, []);

  const contextValue = {
    contacts,
    currentView,
    setCurrentView,
    editingContact,
    setEditingContact,
    showDeleteModal,
    setShowDeleteModal,
    contactToDelete,
    setContactToDelete,
    addContact,
    updateContact,
    deleteContact,
    fetchContacts,
  };

  return (
    <ContactContext.Provider value={contextValue}>
      {children}
    </ContactContext.Provider>
  );
};

// Step 3: ContactCard Component (like a business card for each person)
const ContactCard = ({ contact }) => {
  const {
    setCurrentView,
    setEditingContact,
    setShowDeleteModal,
    setContactToDelete,
  } = useContext(ContactContext);

  const handleEdit = () => {
    setEditingContact(contact);
    setCurrentView('add');
  };

  const handleDelete = () => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Profile Picture */}
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          <User className="w-8 h-8 text-gray-600" />
        </div>
        
        {/* Contact Information */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{contact.name}</h3>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{contact.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{contact.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{contact.email}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 4: Contacts View (the main list of all contacts)
const ContactsView = () => {
  const { contacts, setCurrentView } = useContext(ContactContext);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <button
          onClick={() => setCurrentView('add')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add new contact</span>
        </button>
      </div>

      {/* Contacts List */}
      <div>
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No contacts yet. Add your first contact!</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))
        )}
      </div>
    </div>
  );
};

// Step 5: AddContact View (the form to add or edit contacts)
const AddContactView = () => {
  const {
    setCurrentView,
    editingContact,
    setEditingContact,
    addContact,
    updateContact,
  } = useContext(ContactContext);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  // If we're editing, fill the form with existing data
  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact.name || '',
        phone: editingContact.phone || '',
        email: editingContact.email || '',
        address: editingContact.address || '',
      });
    } else {
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
  }, [editingContact]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    let success;
    if (editingContact) {
      success = await updateContact(editingContact.id, formData);
    } else {
      success = await addContact(formData);
    }

    if (success) {
      setCurrentView('contacts');
      setEditingContact(null);
    } else {
      alert('Error saving contact. Please try again.');
    }
  };

  const handleCancel = () => {
    setCurrentView('contacts');
    setEditingContact(null);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleCancel}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {editingContact ? 'Edit Contact' : 'Add Contact'}
        </h1>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {editingContact ? 'Update Contact' : 'Save Contact'}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 6: Delete Confirmation Modal
const DeleteModal = () => {
  const {
    showDeleteModal,
    setShowDeleteModal,
    contactToDelete,
    setContactToDelete,
    deleteContact,
  } = useContext(ContactContext);

  if (!showDeleteModal || !contactToDelete) return null;

  const handleConfirmDelete = async () => {
    const success = await deleteContact(contactToDelete.id);
    if (success) {
      setShowDeleteModal(false);
      setContactToDelete(null);
    } else {
      alert('Error deleting contact. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Delete Contact
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete {contactToDelete.name}? This action cannot be undone.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={handleConfirmDelete}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 7: Main App Component (puts everything together)
const App = () => {
  return (
    <ContactProvider>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
        <DeleteModal />
      </div>
    </ContactProvider>
  );
};

// App Content Component (decides which view to show)
const AppContent = () => {
  const { currentView } = useContext(ContactContext);

  return (
    <>
      {currentView === 'contacts' ? <ContactsView /> : <AddContactView />}
    </>
  );
};

export default App;