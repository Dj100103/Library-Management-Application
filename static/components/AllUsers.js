import UserModal from './UserModal.js';

export default {
  components: { UserModal },
  template: `
    <div class="container mt-4">
      <div class="row">
        <!-- Display User Cards -->
        <div class="col-md-12 mb-3" v-for="user in users" :key="user.user_id">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <!-- User Details Section -->
                <div>
                  <h5 class="card-title">{{ user.user_email }}</h5>
                  <p class="card-subtitle text-muted">{{ user.username }}</p>
                  <p class="card-text">Total Books Issued till date: {{ user.issued_books }}</p>
                </div>

                <!-- Conditional Buttons for User Status -->
                <div>
                  <button 
                    v-if="user.user_status"
                    class="btn btn-danger ms-2"
                    @click="deactivate_user(user)"
                  >
                    Deactivate User
                  </button>
                  <button 
                    v-else
                    class="btn btn-success ms-2"
                    @click="activate_user(user)"
                  >
                    Activate User
                  </button>
                </div>
              </div>

              <!-- User Email Button -->
              <button class="btn btn-primary mt-3" @click="openModal(user)">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Modal Component -->
      <UserModal
        :selectedUser="selectedUser"
        :user_books="user_books"
        :user_books_error="user_books_error"
        ref="userModal"
      />
    </div>
  `,
  data() {
    return {
      users: [],
      user_error: null,
      selectedUser: {},
      user_books: [],
      user_books_error: null,
      token: localStorage.getItem("auth-token")
    };
  },
  async mounted() {
    const res = await fetch('/all_users', {
      headers: { "Authentication-Token": this.token }
    });
    const data = await res.json().catch(() => {});
    if (res.ok) {
      this.users = data.data;
    } else {
      this.user_error = data.message;
    }
  },
  methods: {
    async openModal(user) {
      this.selectedUser = user;
      this.user_books = [];
      const res = await fetch(`/user_books/${user.user_id}`, {
        headers: { "Authentication-Token": this.token }
      });
      const data = await res.json().catch(() => {});
      if (res.ok) {
        this.user_books = data.issued_books;
      } else {
        this.user_books_error = 'No Books Issued';
      }
      this.$refs.userModal.show();
    },
    async activate_user(user) {
      const res=await fetch(`/activate_user/${user.user_id}`, {
        headers: { "Authentication-Token": this.token }
      })
      const data=await res.json().catch((e)=>{})
      if(res.ok){
        this.users = this.users.map(u =>
          u.user_id === user.user_id ? { ...u, user_status: true } : u
        );
      }
    },
    async deactivate_user(user) {
      const res=await fetch(`/deactivate_user/${user.user_id}`, {
        headers: { "Authentication-Token": this.token }
      })
      const data=await res.json().catch((e)=>{})
      if(res.ok){
        this.users = this.users.map(u =>
          u.user_id === user.user_id ? { ...u, user_status: false } : u
        );
      }
    }
  }
};
