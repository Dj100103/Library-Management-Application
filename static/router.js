import Account from "./components/Account.js";
import AllUsers from "./components/AllUsers.js";
import Home from "./components/Home.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import Stats from "./components/Stats.js";


const routes = [{
    path:'/', component: Home, name: 'Home'
},
{
    path:'/login', component: Login, name:'Login'
},
{
    path:'/all_users', component: AllUsers, name:'AllUsers'
},
{
    path:'/stats', component: Stats, name:'Stats'
},
{
    path:'/user_account', component: Account, name:'Account'
},
{
    path:'/register_user', component: Register, name:'Register'
}
]

export default new VueRouter({
    routes,
})