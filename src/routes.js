import Login from './pages/Login.vue'
import NotFound from './pages/404.vue'
import Home from './pages/Home.vue'
import User from './pages/User.vue'
import Honor from './pages/Honor.vue'
import Scholarship from './pages/Scholarship.vue'
import AdminUser from './pages/admin/AdminUser.vue'
import AdminForm from './pages/admin/AdminForm.vue'
import AdminHonor from './pages/admin/AdminHonor.vue'
import AdminScholarship from './pages/admin/AdminScholarship.vue'


let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true,
        permission: [null]
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true,
        permission: [null]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-id-card-o',
        leaf: true,
        children: [
            { path: '/user', component: User, name: '用户信息'},
        ],
        permission: ["login"]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-trophy',
        leaf: true,
        children: [
            { path: '/honor', component: Honor, name: '荣誉' }
        ],
        permission: ["apply"]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-trophy',
        leaf: true,
        children: [
            { path: '/scholarship', component: Scholarship, name: '奖学金' }
        ],
        permission: ["apply"]
    },
    {
        path: '/',
        component: Home,
        name: '管理',
        iconCls: 'el-icon-setting',
        children: [
            { path: '/admin/user', component: AdminUser, name: '用户管理', permission: ["user"] },
            { path: '/admin/form', component: AdminForm, name: '表单管理', permission: ["form"] },
            { path: '/admin/honor', component: AdminHonor, name: '荣誉管理', permission: ["honor"] },
            { path: '/admin/scholarship', component: AdminScholarship, name: '奖学金管理', permission: ["scholar"] }
        ],
        permission: ["user", "form", "honor", "scholar"]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' },
        permission: [null]
    }
];

export default routes;