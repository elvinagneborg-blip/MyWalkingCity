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
      path: '/problem/',
      name: 'ProblemView',
      component: () => import('../views/ProblemView.vue')
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
      path: '/login/',
      name: 'LogIn',
      component: () => import('../views/LogIn.vue')
    },

    {
      path: '/signup/',
      name: 'SignUp',
      component: () => import('../views/SignUp.vue')
    },

      { 
        path: '/feedback/',
        name: 'FeedbackView',
        component: () => import('../views/FeedbackView.vue')
      },
    
      {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../views/ResetPasswordView.vue')
      }
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            el: to.hash,
            behavior: 'smooth'
          })
        }, 100)
      })
    }
  
    return { top: 0 }
  }
})


export default router