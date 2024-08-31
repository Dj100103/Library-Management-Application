import { globalState } from "./globalState.js"  

export default {
    template: `
<div>
<nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link active" aria-current="page" to="/">Home</router-link>
          </li>
          <li class="nav-item" v-if="!user_role">
            <router-link class="nav-link" to="/register_user">Register</router-link>
          </li>

          <li class="nav-item" v-if="user_role">
            <router-link class="nav-link" to="/stats">Stats</router-link>
          </li>
          <li class="nav-item" v-if="user_role=='Librarian'">
            <router-link class="nav-link" to="/all_users">Users</router-link>
          </li>
          <li class="nav-item" v-if="user_role=='User'">
            <router-link class="nav-link" to="/user_account">Account</router-link>
          </li>
        </ul>
        <form class="d-flex" role="search" v-if="user_role=='User'">
          <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" v-model="search" required>
          <button class="btn btn-outline-success" type="submit" @click="submit_search()">Search  </button>
        </form>  
        <br>

        <li class="nav-item d-flex" v-if="user_role=='Librarian'">
        <ul class="navbar-nav">
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Downloads
          </button>
          <ul class="dropdown-menu">
            <li><button class="btn btn-outline-success" @click="get_user_data()">User Data</button></li>
            <li><button class="dropdown-item" @click="get_books_issued_data()">Books Data</button></li>
          </ul>
        </div>
        </ul>
        </li>
        <li class="nav-item d-flex" v-if="user_role">
            <button class="nav-link" @click="logout">Logout</button>
        </li>
      </div>
    </div>
  </nav>
  
</div>`,

data() {
  return {
    user_role: localStorage.getItem('user_role') || "",
    search: ''
  }
},

methods : {
  async logout() {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_id')
      this.user_role=""
      globalState.requests=[]
      this.$router.push({path: '/login'})

      console.log('logout')
  },
  async submit_search() {
    console.log(this.search)
    globalState.search=this.search
    this.search=''
  },
  async get_user_data() {
      const res = await fetch('/download-user-data')
      const data = await res.json()
      if (res.ok) {
        const taskId = data['task-id']
        const intv = setInterval(async () => {
          const csv_res = await fetch(`/get-csv/${taskId}`)
          if (csv_res.ok) {
            this.isWaiting = false
            clearInterval(intv)
            window.location.href = `/get-csv/${taskId}`
          }
        }, 1000)
      }
    },
    async get_books_issued_data() {
      const res = await fetch('/download-issued-books-csv')
      const data = await res.json()
      if (res.ok) {
        const taskId = data['task-id']
        const intv = setInterval(async () => {
          const csv_res = await fetch(`/get-csv/${taskId}`)
          if (csv_res.ok) {
            this.isWaiting = false
            clearInterval(intv)
            window.location.href = `/get-csv/${taskId}`
          }
        }, 1000)
      }
    },
  }
}