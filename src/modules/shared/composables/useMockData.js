import { ref, computed } from 'vue'

//  Status Config 
export const statusConfig = {
  pending: {
    label: 'Pending Assignment',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    dotColor: 'bg-blue-500'
  },
  assigned: {
    label: 'Assigned',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-500'
  },
  in_progress: {
    label: 'In Progress',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500'
  },
  completed: {
    label: 'Completed',
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    dotColor: 'bg-emerald-500'
  },
  delayed: {
    label: 'Delayed',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500'
  }
}

export const availabilityConfig = {
  available: { label: 'Available', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', dotColor: 'bg-emerald-500' },
  busy: { label: 'Busy', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', dotColor: 'bg-yellow-500' },
  overloaded: { label: 'Overloaded', bgColor: 'bg-red-100', textColor: 'text-red-800', dotColor: 'bg-red-500' }
}

//  Mock Users 
export const mockSalesUser = {
  id: 1,
  name: 'John Sales',
  email: 'john@checkinme.com',
  role: 'sales',
  photo: 'https://i.pravatar.cc/150?img=12'
}

export const mockTrainerUser = {
  id: 1,
  name: 'Sokha Chea',
  email: 'sokha@checkinme.com',
  role: 'trainer',
  photo: 'https://i.pravatar.cc/150?img=33'
}

export const mockTrainers = [
  {
    id: 1,
    name: 'Sokha Chea',
    email: 'sokha@checkinme.com',
    phone: '+855 12 111 222',
    photo: 'https://i.pravatar.cc/150?img=33',
    specializations: ['HR Suite', 'Attendance'],
    languages: ['English', 'Khmer'],
    activeAssignments: 3,
    availabilityStatus: 'available'
  },
  {
    id: 2,
    name: 'Dara Kim',
    email: 'dara@checkinme.com',
    phone: '+855 12 333 444',
    photo: 'https://i.pravatar.cc/150?img=45',
    specializations: ['Payroll', 'HR Suite'],
    languages: ['English', 'Khmer'],
    activeAssignments: 5,
    availabilityStatus: 'busy'
  },
  {
    id: 3,
    name: 'Pisey Lim',
    email: 'pisey@checkinme.com',
    phone: '+855 12 555 666',
    photo: 'https://i.pravatar.cc/150?img=23',
    specializations: ['Attendance', 'Reports'],
    languages: ['Khmer'],
    activeAssignments: 7,
    availabilityStatus: 'overloaded'
  }
]

export const mockOnboardings = [
  {
    id: 1,
    customer: {
      name: 'ABC Corporation',
      contact: 'Phalla Sok',
      email: 'phalla@abccorp.com',
      phone: '+855 12 345 678'
    },
    product: 'HR Management Suite',
    trainer: mockTrainers[0],
    status: 'in_progress',
    progressPercentage: 60,
    sessionsCompleted: 3,
    sessionsTotal: 5,
    deadline: '2025-02-28',
    createdAt: '2025-01-15'
  },
  {
    id: 2,
    customer: {
      name: 'XYZ Company Ltd',
      contact: 'Veasna Meas',
      email: 'veasna@xyzcompany.com',
      phone: '+855 98 765 432'
    },
    product: 'Attendance System',
    trainer: mockTrainers[1],
    status: 'assigned',
    progressPercentage: 20,
    sessionsCompleted: 1,
    sessionsTotal: 5,
    deadline: '2025-03-15',
    createdAt: '2025-02-01'
  },
  {
    id: 3,
    customer: {
      name: 'Tech Innovations',
      contact: 'Sokun Rath',
      email: 'sokun@techinnovations.com',
      phone: '+855 11 222 333'
    },
    product: 'Payroll Module',
    trainer: mockTrainers[0],
    status: 'delayed',
    progressPercentage: 40,
    sessionsCompleted: 2,
    sessionsTotal: 5,
    deadline: '2025-02-05',
    createdAt: '2025-01-10'
  },
  {
    id: 4,
    customer: {
      name: 'Global Services Co',
      contact: 'Channary Pov',
      email: 'channary@globalservices.com',
      phone: '+855 77 888 999'
    },
    product: 'HR Management Suite',
    trainer: null,
    status: 'pending',
    progressPercentage: 0,
    sessionsCompleted: 0,
    sessionsTotal: 0,
    deadline: '2025-03-30',
    createdAt: '2025-02-05'
  },
  {
    id: 5,
    customer: {
      name: 'Bright Future Ltd',
      contact: 'Bopha Chan',
      email: 'bopha@brightfuture.com',
      phone: '+855 99 111 222'
    },
    product: 'Full Platform',
    trainer: mockTrainers[1],
    status: 'completed',
    progressPercentage: 100,
    sessionsCompleted: 7,
    sessionsTotal: 7,
    deadline: '2025-01-31',
    createdAt: '2024-12-15',
    completedAt: '2025-01-28'
  },
  {
    id: 6,
    customer: {
      name: 'Mekong Digital',
      contact: 'Samnang Hor',
      email: 'samnang@mekongdigital.com',
      phone: '+855 88 444 555'
    },
    product: 'Attendance System',
    trainer: mockTrainers[2],
    status: 'in_progress',
    progressPercentage: 80,
    sessionsCompleted: 4,
    sessionsTotal: 5,
    deadline: '2025-02-20',
    createdAt: '2025-01-05'
  }
]

export const mockSessions = [
  {
    id: 1,
    onboardingId: 1,
    topic: 'System Overview & Navigation',
    scheduledDate: '2025-01-20',
    scheduledTime: '14:00',
    duration: 120,
    format: 'virtual',
    meetingLink: 'https://zoom.us/j/123456789',
    status: 'completed',
    completedAt: '2025-01-20T16:00:00Z',
    trainerNotes: 'Customer grasped basic concepts quickly. Very engaged.',
    topicsCovered: 'Dashboard navigation, user management basics, system settings',
    engagementRating: 5
  },
  {
    id: 2,
    onboardingId: 1,
    topic: 'User Management',
    scheduledDate: '2025-01-25',
    scheduledTime: '10:00',
    duration: 90,
    format: 'virtual',
    status: 'completed',
    completedAt: '2025-01-25T11:30:00Z',
    trainerNotes: 'Covered bulk import feature. Customer requested documentation.',
    topicsCovered: 'Creating users, roles & permissions, bulk import',
    engagementRating: 4
  },
  {
    id: 3,
    onboardingId: 1,
    topic: 'Attendance Tracking',
    scheduledDate: '2025-02-01',
    scheduledTime: '14:00',
    duration: 90,
    format: 'in_person',
    location: 'ABC Corporation Office',
    status: 'completed',
    completedAt: '2025-02-01T15:30:00Z',
    trainerNotes: 'Hands-on session. Customer very satisfied with attendance features.',
    topicsCovered: 'Clock in/out, geofencing, attendance reports',
    engagementRating: 5
  },
  {
    id: 4,
    onboardingId: 1,
    topic: 'Report Generation',
    scheduledDate: '2025-02-15',
    scheduledTime: '10:00',
    duration: 120,
    format: 'virtual',
    meetingLink: 'https://zoom.us/j/987654321',
    status: 'scheduled'
  },
  {
    id: 5,
    onboardingId: 1,
    topic: 'Advanced Features & Q&A',
    scheduledDate: '2025-02-25',
    scheduledTime: '14:00',
    duration: 90,
    format: 'virtual',
    status: 'scheduled'
  },
  {
    id: 6,
    onboardingId: 2,
    topic: 'System Overview',
    scheduledDate: '2025-02-05',
    scheduledTime: '09:00',
    duration: 120,
    format: 'virtual',
    status: 'completed',
    completedAt: '2025-02-05T11:00:00Z',
    trainerNotes: 'Good first session.',
    topicsCovered: 'System overview, basic navigation',
    engagementRating: 4
  },
  {
    id: 7,
    onboardingId: 2,
    topic: 'Attendance Configuration',
    scheduledDate: '2025-02-12',
    scheduledTime: '09:00',
    duration: 90,
    format: 'virtual',
    status: 'scheduled'
  },
  {
    id: 8,
    onboardingId: 3,
    topic: 'Payroll Setup',
    scheduledDate: '2025-01-20',
    scheduledTime: '14:00',
    duration: 120,
    format: 'in_person',
    location: 'Tech Innovations Office',
    status: 'completed',
    completedAt: '2025-01-20T16:00:00Z',
    trainerNotes: 'Customer needs follow-up on tax configuration.',
    topicsCovered: 'Payroll basics, salary structures',
    engagementRating: 3
  },
  {
    id: 9,
    onboardingId: 3,
    topic: 'Tax Configuration',
    scheduledDate: '2025-01-28',
    scheduledTime: '10:00',
    duration: 90,
    format: 'virtual',
    status: 'completed',
    completedAt: '2025-01-28T11:30:00Z',
    trainerNotes: 'Resolved tax questions. Customer satisfied.',
    topicsCovered: 'Tax setup, deductions, compliance',
    engagementRating: 4
  },
  {
    id: 10,
    onboardingId: 6,
    topic: 'Attendance Advanced Features',
    scheduledDate: '2025-02-10',
    scheduledTime: '13:00',
    duration: 90,
    format: 'virtual',
    status: 'scheduled'
  }
]

//  Mock Calendar Events (Demos) 
export const mockCalendarEvents = [
  {
    id: 1001,
    title: 'Product Demo — ABC Corporation',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 60,
    format: 'virtual',
    meetingLink: 'https://zoom.us/j/demo1',
    clientName: 'ABC Corporation',
    trainerId: 1,
    trainerName: 'Sokha Chea',
    status: 'scheduled'
  },
  {
    id: 1002,
    title: 'Product Demo — ABC Corporation',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    duration: 60,
    format: 'virtual',
    meetingLink: 'https://zoom.us/j/demo1',
    clientName: 'ABC Corporation',
    trainerId: 1,
    trainerName: 'Sokha Chea',
    status: 'scheduled'
  },
  {
    id: 1003,
    title: 'Product Demo — ABC Corporation',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    duration: 60,
    format: 'virtual',
    meetingLink: 'https://zoom.us/j/demo1',
    clientName: 'ABC Corporation',
    trainerId: 1,
    trainerName: 'Sokha Chea',
    status: 'scheduled'
  },
  {
    id: 1004,
    title: 'Product Demo — ABC Corporation',
    date: new Date().toISOString().split('T')[0],
    time: '13:00',
    duration: 60,
    format: 'virtual',
    meetingLink: 'https://zoom.us/j/demo1',
    clientName: 'ABC Corporation',
    trainerId: 1,
    trainerName: 'Sokha Chea',
    status: 'scheduled'
  },
  {
    id: 1005,
    title: 'Product Demo — Mekong Digital',
    date: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0] })(),
    time: '14:00',
    duration: 90,
    format: 'in_person',
    location: 'Mekong Digital Office',
    clientName: 'Mekong Digital',
    trainerId: 2,
    trainerName: 'Dara Kim',
    status: 'scheduled'
  }
]

//  Products 
export const products = [
  'HR Management Suite',
  'Attendance System',
  'Payroll Module',
  'Full Platform',
  'Reports & Analytics'
]

export const sessionTopics = [
  'System Overview & Navigation',
  'User Management',
  'Attendance Tracking',
  'Payroll Setup',
  'Tax Configuration',
  'Report Generation',
  'Advanced Features & Q&A',
  'Data Migration',
  'Admin Configuration',
  'Custom Topic'
]

//  Composable 
export function useMockData() {
  const loading = ref(false)
  const onboardings = ref([...mockOnboardings])
  const sessions = ref([...mockSessions])
  const trainers = ref([...mockTrainers])

  // Load from localStorage if available
  const saved = localStorage.getItem('coms_onboardings')
  if (saved) {
    try { onboardings.value = JSON.parse(saved) } catch (e) { /* ignore */ }
  }
  const savedSessions = localStorage.getItem('coms_sessions')
  if (savedSessions) {
    try { sessions.value = JSON.parse(savedSessions) } catch (e) { /* ignore */ }
  }

  function saveToStorage() {
    localStorage.setItem('coms_onboardings', JSON.stringify(onboardings.value))
    localStorage.setItem('coms_sessions', JSON.stringify(sessions.value))
  }

  async function simulateDelay(ms = 500) {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, ms))
    loading.value = false
  }

  // Dashboard stats
  const dashboardStats = computed(() => {
    const active = onboardings.value.filter(o => ['in_progress', 'assigned'].includes(o.status)).length
    const completedThisMonth = onboardings.value.filter(o => o.status === 'completed').length
    const delayed = onboardings.value.filter(o => o.status === 'delayed').length
    const avgCompletion = Math.round(
      onboardings.value.filter(o => o.progressPercentage > 0).reduce((sum, o) => sum + o.progressPercentage, 0) /
      Math.max(onboardings.value.filter(o => o.progressPercentage > 0).length, 1)
    )
    return { active, completedThisMonth, delayed, avgCompletion }
  })

  // Trainer stats
  function trainerStats(trainerId) {
    const assigned = onboardings.value.filter(o => o.trainer?.id === trainerId && o.status !== 'completed')
    const sessionsThisWeek = sessions.value.filter(s => {
      const ob = onboardings.value.find(o => o.id === s.onboardingId)
      return ob?.trainer?.id === trainerId && s.status === 'scheduled'
    })
    const completedCount = onboardings.value.filter(o => o.trainer?.id === trainerId && o.status === 'completed').length
    return {
      activeAssignments: assigned.length,
      sessionsThisWeek: sessionsThisWeek.length,
      completedThisMonth: completedCount
    }
  }

  // Get sessions for an onboarding
  function getSessionsForOnboarding(onboardingId) {
    return sessions.value.filter(s => s.onboardingId === onboardingId)
  }

  // Get sessions for a trainer
  function getSessionsForTrainer(trainerId) {
    return sessions.value.filter(s => {
      const ob = onboardings.value.find(o => o.id === s.onboardingId)
      return ob?.trainer?.id === trainerId
    })
  }

  // Get onboardings for a trainer
  function getOnboardingsForTrainer(trainerId) {
    return onboardings.value.filter(o => o.trainer?.id === trainerId)
  }

  // Create onboarding
  async function createOnboarding(data) {
    await simulateDelay(800)
    const newOnboarding = {
      id: Math.max(...onboardings.value.map(o => o.id)) + 1,
      customer: data.customer,
      product: data.product,
      trainer: null,
      status: 'pending',
      progressPercentage: 0,
      sessionsCompleted: 0,
      sessionsTotal: 0,
      deadline: data.deadline,
      createdAt: new Date().toISOString().split('T')[0],
      specialRequirements: data.specialRequirements,
      numUsers: data.numUsers,
      language: data.language
    }
    onboardings.value.unshift(newOnboarding)
    saveToStorage()
    return newOnboarding
  }

  // Assign trainer
  async function assignTrainer(onboardingId, trainerId) {
    await simulateDelay(600)
    const ob = onboardings.value.find(o => o.id === onboardingId)
    const trainer = trainers.value.find(t => t.id === trainerId)
    if (ob && trainer) {
      ob.trainer = trainer
      ob.status = 'assigned'
      ob.sessionsTotal = 5
      saveToStorage()
    }
    return ob
  }

  // Schedule session
  async function scheduleSession(data) {
    await simulateDelay(600)
    const newSession = {
      id: Math.max(...sessions.value.map(s => s.id)) + 1,
      onboardingId: data.onboardingId,
      topic: data.topic,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      duration: data.duration,
      format: data.format,
      meetingLink: data.meetingLink || null,
      location: data.location || null,
      status: 'scheduled',
      notes: data.notes || ''
    }
    sessions.value.push(newSession)
    saveToStorage()
    return newSession
  }

  // Complete session
  async function completeSession(sessionId, data) {
    await simulateDelay(600)
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      session.status = 'completed'
      session.completedAt = new Date().toISOString()
      session.trainerNotes = data.trainerNotes
      session.topicsCovered = data.topicsCovered
      session.engagementRating = data.engagementRating

      // Update onboarding progress
      const ob = onboardings.value.find(o => o.id === session.onboardingId)
      if (ob) {
        const obSessions = getSessionsForOnboarding(ob.id)
        const completedSessions = obSessions.filter(s => s.status === 'completed').length
        ob.sessionsCompleted = completedSessions
        ob.sessionsTotal = Math.max(ob.sessionsTotal, obSessions.length)
        ob.progressPercentage = Math.round((completedSessions / ob.sessionsTotal) * 100)
        if (ob.progressPercentage >= 100) {
          ob.status = 'completed'
          ob.completedAt = new Date().toISOString().split('T')[0]
        } else if (ob.status === 'assigned') {
          ob.status = 'in_progress'
        }
      }
      saveToStorage()
    }
    return session
  }

  // Reset data
  function resetData() {
    localStorage.removeItem('coms_onboardings')
    localStorage.removeItem('coms_sessions')
    onboardings.value = [...mockOnboardings]
    sessions.value = [...mockSessions]
  }

  return {
    loading,
    onboardings,
    sessions,
    trainers,
    dashboardStats,
    trainerStats,
    getSessionsForOnboarding,
    getSessionsForTrainer,
    getOnboardingsForTrainer,
    createOnboarding,
    assignTrainer,
    scheduleSession,
    completeSession,
    simulateDelay,
    resetData
  }
}
