
import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    component:() => import('@/components/login.vue')
  },
  {
    path:'/topicextraction',
    component:() => import('@/components/Topicextraction.vue') 
  },
  {
    path:'/tablerebuild',
    component:() => import('@/components/Tablerebuild.vue') 
  },
  {
    path:'/satndclasscification',
    component:() => import('@/components/satndclasscification.vue')

  },
  {
    path:'/standpair',
    component:() => import('@/components/standardpair.vue')
  },
  {
    path:'/Informationsearch',
    component:() => import('@/components/Informationsearch.vue')

  },
  {
    path:'/grenerateTree',
    component:() => import('@/components/generateTree.vue')
  },
  {
    path:'/parserLaTex',
    component:()=> import('@/components/paserLateX.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
