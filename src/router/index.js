import { createRouter, createWebHistory } from 'vue-router'
import StartMWC from '../views/StartMWC.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home', 
      component: StartMWC 
    },
    {
      path: '/startmwc/',
      name: 'StartMWC',
      component: () => import('../views/StartMWC.vue')
    },
    {
      path: '/report/',
      name: 'ReportView',
      component: () => import('../views/ReportView.vue')
    },
    {
      path: '/highlight/',
      name: 'HighlightView',
      component: () => import('../views/HighlightView.vue')
    }, 
    {
      path: '/option/',
      name: 'OptionView',
      component: () => import('../views/OptionView.vue')
    }, 
    {
      path: '/profile/',
      name: 'ProfileView',
      component: () => import('../views/ProfileView.vue')
    }, 
    {
      path: '/allreports/',
      name: 'AllReportsView',
      component: () => import('../views/AllReportsView.vue')
    }, 
    {
      path: '/report-login/',
      name: 'ReportLogIn',
      component: () => import('../views/ReportLogIn.vue')
    }
  ]
})

export default router