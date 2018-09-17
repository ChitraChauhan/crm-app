import EventList from './crm-events/EventList'
import LeadList from './crm-leads/LeadList'
import OpportunityList from './crm-opportunity/OpportunityList'
import ContactList from './contacts'
import CustomerList from './customers/list'

const ROUTES = [
  { path: 'crm_events', component: EventList },
  { path: 'crm_leads', component: LeadList },
  { path: 'crm_opportunity', component: OpportunityList },
  { path: 'contacts', component: ContactList },
  { path: 'customers', component: CustomerList },
]

export default ROUTES
