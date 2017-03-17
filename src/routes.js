import Login from './pages/Login.vue'
import NotFound from './pages/404.vue'
import Home from './pages/Home.vue'
import User from './pages/User.vue'
import Honor from './pages/Honor.vue'
import Scholarship from './pages/Scholarship.vue'
import AdminUser from './pages/admin/AdminUser.vue'
import AdminHonor from './pages/admin/AdminHonor.vue'
import AdminScholarship from './pages/admin/AdminScholarship.vue'


let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-id-card-o',
        leaf: true,
        children: [
            { path: '/user', component: User, name: '用户信息' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-trophy',
        leaf: true,
        children: [
            { path: '/honor', component: Honor, name: '荣誉' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-trophy',
        leaf: true,
        children: [
            { path: '/scholarship', component: Scholarship, name: '奖学金' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '管理',
        iconCls: 'el-icon-setting',
        children: [
            { path: '/admin/user', component: AdminUser, name: '用户管理' },
            { path: '/admin/honor', component: AdminHonor, name: '荣誉管理' },
            { path: '/admin/scholarship', component: AdminScholarship, name: '奖学金管理' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;