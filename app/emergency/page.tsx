'use client'

import { useState, useEffect } from 'react'

const defaultContacts = [
  {
    name: "National Emergency Number",
    description: "General emergency support (police, ambulance, fire)",
    phone: "112",
    icon: "🚨"
  },
  {
    name: "Suicide Prevention Lifeline (US)",
    description: "24/7 free and confidential support",
    phone: "1-800-273-8255",
    icon: "💚"
  },
  {
    name: "National Domestic Violence Hotline (US)",
    description: "Support for domestic violence survivors",
    phone: "1-800-799-7233",
    icon: "📞"
  },
  {
    name: "Crisis Text Line (US)",
    description: "Text HOME to 741741 for free crisis support",
    phone: "741741",
    icon: "📱"
  }
]

export default function EmergencyPage() {
  const [contacts, setContacts] = useState(defaultContacts)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    description: '',
    phone: '',
    icon: '📞'
  })

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContact.name || !newContact.phone) return

    setContacts([...contacts, { ...newContact }])
    setNewContact({ name: '', description: '', phone: '', icon: '📞' })
    setShowAddForm(false)
  }

  const handleRemoveContact = (index: number) => {
    if (window.confirm('Remove this contact?')) {
      setContacts(contacts.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold mb-4 text-center text-gray-900 dark:text-white">
          Emergency Contacts
        </h1>
        <p className="mb-8 text-center text-gray-600 dark:text-gray-300">
          Quickly reach out to someone you trust or get professional help.
        </p>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 transition"
          >
            + Add New Contact
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Add New Contact
            </h3>
            <form onSubmit={handleAddContact} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newContact.description}
                onChange={(e) => setNewContact({...newContact, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                value={newContact.icon}
                onChange={(e) => setNewContact({...newContact, icon: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                maxLength={2}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-400 text-white rounded shadow hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {contacts.map((contact, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex items-center transition-transform transform hover:scale-[1.025] duration-200"
            >
              <span className="text-4xl mr-4">{contact.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg truncate text-gray-900 dark:text-white">
                  {contact.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300 truncate">
                  {contact.description}
                </div>
                <a
                  href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                  className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
                >
                  Call {contact.phone}
                </a>
              </div>
              {idx >= defaultContacts.length && (
                <button
                  className="ml-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                  onClick={() => handleRemoveContact(idx)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}