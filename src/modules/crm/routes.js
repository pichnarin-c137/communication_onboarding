export default [
  {
    path: '/crm',
    name: 'CrmPipeline',
    component: () => import('./views/PipelineView.vue'),
    meta: { layout: 'sales', title: 'CRM Pipeline', role: 'sale' }
  },
  {
    path: '/crm/contacts',
    name: 'CrmContacts',
    component: () => import('./views/ContactsView.vue'),
    meta: { layout: 'sales', title: 'Contacts', role: 'sale' }
  },
  {
    path: '/crm/contacts/:id',
    name: 'CrmContactDetail',
    component: () => import('./views/ContactDetailView.vue'),
    meta: { layout: 'sales', title: 'Contact Detail', role: 'sale' }
  }
]
