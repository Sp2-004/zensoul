'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const defaultContacts = [
  {
    name: "Emergency Services",
    description: "Police, Fire, Ambulance - Immediate emergency response",
    phone: "911",
    icon: "🚨",
    color: "from-red-500 to-red-600",
    urgent: true
  },
  {
    name: "National Suicide Prevention Lifeline",
    description: "24/7 free and confidential crisis support",
    phone: "988",
    icon: "💚",
    color: "from-green-500 to-emerald-600",
    urgent: true
  },
  {
    name: "Crisis Text Line",
    description: "Text HOME to 741741 for immediate crisis support",
    phone: "741741",
    icon: "📱",
    color: "from-blue-500 to-blue-600",
    urgent: true
  },
  {
    name: "National Domestic Violence Hotline",
    description: "24/7 confidential support for domestic violence survivors",
    phone: "1-800-799-7233",
    icon: "🛡️",
    color: "from-purple-500 to-purple-600",
    urgent: false
  },
  {
    name: "SAMHSA National Helpline",
    description: "Mental health and substance abuse treatment referrals",
    phone: "1-800-662-4357",
    icon: "🧠",
    color: "from-teal-500 to-cyan-600",
    urgent: false
  },
  {
    name: "National Child Abuse Hotline",
    description: "24/7 support for child abuse prevention and reporting",
    phone: "1-800-4-A-CHILD",
    icon: "👶",
    color: "from-orange-500 to-red-500",
    urgent: false
  }
]

const quickActions = [
  {
    title: "Breathing Exercise",
    description: "Quick 4-7-8 breathing technique",
    icon: "🫁",
    action: "breathing",
    color: "from-blue-400 to-blue-500"
  },
  {
    title: "Grounding Technique",
    description: "5-4-3-2-1 sensory grounding",
    icon: "🌱",
    action: "grounding",
    color: "from-green-400 to-green-500"
  },
  {
    title: "Safe Space Visualization",
    description: "Imagine your peaceful place",
    icon: "🏞️",
    action: "visualization",
    color: "from-purple-400 to-purple-500"
  }
]

export default function EmergencyPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState(defaultContacts)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null)
  const [newContact, setNewContact] = useState({
    name: '',
    description: '',
    phone: '',
    icon: '📞',
    color: 'from-gray-500 to-gray-600',
    urgent: false
  })

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContact.name || !newContact.phone) return

    setContacts([...contacts, { ...newContact }])
    setNewContact({ name: '', description: '', phone: '', icon: '📞', color: 'from-gray-500 to-gray-600', urgent: false })
    setShowAddForm(false)
  }

  const handleRemoveContact = (index: number) => {
    if (window.confirm('Remove this contact?')) {
      setContacts(contacts.filter((_, i) => i !== index))
    }
  }

  const handleQuickAction = (action: string) => {
    setActiveQuickAction(action)
    // Auto-hide after 30 seconds
    setTimeout(() => setActiveQuickAction(null), 30000)
  }

  const urgentContacts = contacts.filter(c => c.urgent)
  const supportContacts = contacts.filter(c => !c.urgent)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
      {/* Navigation */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <nav className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl px-8 py-4 shadow-2xl border border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-8">
            <div className="text-slate-800 dark:text-white font-bold text-xl">ZenSoul</div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                <span>Home</span>
              </button>
              <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-2 rounded-xl text-sm font-medium shadow-sm border border-red-200 dark:border-red-800">
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                Emergency Support
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="pt-32 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Emergency
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 mt-1">
                Support & Resources
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Immediate access to crisis support, emergency contacts, and quick coping techniques when you need help most.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-12 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4">
                ⚡
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quick Coping Techniques</h2>
                <p className="text-slate-600 dark:text-slate-300">Immediate techniques to help you feel grounded and calm</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleQuickAction(action.action)}
                  className={`p-6 bg-gradient-to-r ${action.color} text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl mb-3">{action.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{action.title}</h3>
                  <p className="text-white/90 text-sm">{action.description}</p>
                </motion.button>
              ))}
            </div>

            {/* Quick Action Content */}
            {activeQuickAction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {activeQuickAction === 'breathing' && 'Breathing Exercise'}
                    {activeQuickAction === 'grounding' && 'Grounding Technique'}
                    {activeQuickAction === 'visualization' && 'Safe Space Visualization'}
                  </h3>
                  <button
                    onClick={() => setActiveQuickAction(null)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                {activeQuickAction === 'breathing' && (
                  <div className="text-slate-700 dark:text-slate-300">
                    <p className="mb-4">Follow this 4-7-8 breathing pattern:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Inhale through your nose for 4 counts</li>
                      <li>Hold your breath for 7 counts</li>
                      <li>Exhale through your mouth for 8 counts</li>
                      <li>Repeat 3-4 times</li>
                    </ol>
                  </div>
                )}
                
                {activeQuickAction === 'grounding' && (
                  <div className="text-slate-700 dark:text-slate-300">
                    <p className="mb-4">Use your senses to ground yourself:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>5 things</strong> you can see around you</li>
                      <li><strong>4 things</strong> you can touch or feel</li>
                      <li><strong>3 things</strong> you can hear</li>
                      <li><strong>2 things</strong> you can smell</li>
                      <li><strong>1 thing</strong> you can taste</li>
                    </ul>
                  </div>
                )}
                
                {activeQuickAction === 'visualization' && (
                  <div className="text-slate-700 dark:text-slate-300">
                    <p className="mb-4">Close your eyes and imagine:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>A place where you feel completely safe and calm</li>
                      <li>Notice the colors, sounds, and feelings in this space</li>
                      <li>Take slow, deep breaths while you're there</li>
                      <li>Stay as long as you need to feel centered</li>
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Urgent Contacts */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 text-center">
              🚨 Immediate Crisis Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentContacts.map((contact, idx) => (
                <motion.div
                  key={idx}
                  className={`bg-gradient-to-r ${contact.color} text-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-3">{contact.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{contact.name}</h3>
                  <p className="text-white/90 mb-6 leading-relaxed">{contact.description}</p>
                  <a
                    href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                    className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    <span>Call {contact.phone}</span>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Support Contacts */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 text-center">
              💙 Additional Support Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportContacts.map((contact, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 dark:border-slate-700 transition-all duration-300 transform hover:scale-105"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${contact.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                      {contact.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{contact.name}</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{contact.description}</p>
                      <a
                        href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${contact.color} text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        <span>Call {contact.phone}</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Add Custom Contact */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4">
                  ➕
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Personal Emergency Contacts</h2>
                  <p className="text-slate-600 dark:text-slate-300">Add your trusted friends, family, or therapist</p>
                </div>
              </div>
              {!showAddForm && (
                <motion.button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Contact
                </motion.button>
              )}
            </div>

            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6 mb-6"
              >
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Add New Emergency Contact</h3>
                <form onSubmit={handleAddContact} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                      className="px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      className="px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description (e.g., Best friend, Therapist, Family member)"
                    value={newContact.description}
                    onChange={(e) => setNewContact({...newContact, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                  />
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="Icon (emoji)"
                      value={newContact.icon}
                      onChange={(e) => setNewContact({...newContact, icon: e.target.value})}
                      className="w-20 px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400 text-center"
                      maxLength={2}
                    />
                    <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={newContact.urgent}
                        onChange={(e) => setNewContact({...newContact, urgent: e.target.checked})}
                        className="w-4 h-4 text-red-600 bg-white border-slate-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span>Mark as urgent/crisis contact</span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add Contact
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Custom Contacts List */}
            {contacts.length > defaultContacts.length && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Your Personal Contacts</h3>
                {contacts.slice(defaultContacts.length).map((contact, idx) => (
                  <div
                    key={idx + defaultContacts.length}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{contact.icon}</div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white">{contact.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{contact.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <a
                        href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                      >
                        Call
                      </a>
                      <button
                        onClick={() => handleRemoveContact(idx + defaultContacts.length)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="mt-12 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-2xl font-bold mb-4">Important Notice</h3>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto">
              If you're experiencing a mental health emergency or having thoughts of self-harm, 
              please reach out immediately. You are not alone, and help is available 24/7. 
              Your life matters, and there are people who want to support you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}