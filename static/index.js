import Home from "./components/Home.js";
import Navbar from "./components/Navbar.js";
import router from "./router.js"

router.beforeEach((to, from, next) => {
    if ((to.name !== 'Login' && to.name !== 'Register') && !localStorage.getItem('auth-token')) {
        next({ name: 'Login' });
    } else {
        next();
    }
});

new Vue({
    el:"#app",
    template: `<div>
    <Navbar :key="has_changed"/>
    <router-view></router-view>
    </div>`,
    components: {
        Home,
        Navbar
    },
    router,
    data() {
        return {
            has_changed: true
        }
    },
    watch :{
        $route() {
            this.has_changed=!this.has_changed
        }
    }
})