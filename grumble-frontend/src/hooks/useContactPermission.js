import { useState } from 'react';

export default function useContactPermission() {
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [contacts, setContacts] = useState([]);

  const requestContactPermission = async () => {
    try {
      // Check if the Contacts API is supported
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        
        const selectedContacts = await navigator.contacts.select(props, opts);
        setContacts(selectedContacts);
        setPermissionStatus('granted');
        return selectedContacts;
      } else {
        // Fallback: show message that contact import isn't supported
        alert('Contact import is not supported on this browser. You can add friends manually later.');
        setPermissionStatus('not-supported');
        return null;
      }
    } catch (error) {
      console.error('Contact permission error:', error);
      setPermissionStatus('denied');
      return null;
    }
  };

  return {
    permissionStatus,
    contacts,
    requestContactPermission
  };
}