export default {
    template: `
        <div class="container mt-4">
            <div class="row">
                <!-- Side Navigation Bar -->
                <nav id="sidebar" class="col-md-3 mb-4">
                    <div class="list-group">
                        <button class="list-group-item list-group-item-action" @click="showEditForm">
                            Edit Profile Details
                        </button>
                        <button class="list-group-item list-group-item-action" @click="download">
                            Download Account Data
                        </button>
                    </div>
                </nav>
                
                <!-- Main Content -->
                <div class="col-md-9">
                    <div v-if="!isEditing" class="card">
                        <div class="card-header">
                            <h4>User Account</h4>
                        </div>
                        <div class="card-body">
                            <p><strong>Username:</strong> {{ username }}</p>
                            <p><strong>Email:</strong> {{ email }}</p>
                        </div>
                    </div>
                    
                    <div v-if="isEditing" class="card">
                        <div class="card-header">
                            <h4>Edit Profile</h4>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="updateProfile">
                                <div class="form-group">
                                    <label for="username">Username</label>
                                    <input type="text" id="username" v-model="username" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" id="email" v-model="email" class="form-control" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                                <button type="cancel" class="btn btn-primary" @click="cancelUpdate">Cancel</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            user_id: localStorage.getItem("user_id"),
            username: '',
            email: '',
            isEditing: false,
            token: localStorage.getItem('auth-token')
        }
    },
    async mounted() {
        this.isEditing=false
        await this.fetchUserDetails();
    },
    methods: {
        async fetchUserDetails() {
            const res = await fetch("/user_details", {
                headers: {"Content-Type": 'application/json', "Authentication-Token":this.token},
                method: "POST",
                body: JSON.stringify({"user_id": this.user_id})
            });
            const data = await res.json().catch((e) => {});
            if (res.ok) {
                this.username = data.username;
                this.email = data.email;
            }
        },
        showEditForm() {
            this.isEditing = true;
        },
        async updateProfile() {
            const res = await fetch("/update_profile", {
                headers: {"Content-Type": 'application/json', "Authentication-Token":this.token},
                method: "POST",
                body: JSON.stringify({
                    user_id: this.user_id,
                    username: this.username,
                    email: this.email
                })
            });
            if (res.ok) {
                alert('Profile updated successfully!');
                this.isEditing = false;
            } else {
                alert('Failed to update profile.');
            }
        },
        async cancelUpdate() {
            alert('No update');
            this.isEditing=false;
        },
        async download() {
            const res=await fetch("/download_user", {
                headers: {"Content-Type": 'application/json',"Authentication-Token":this.token},
                method: "POST",
                body: JSON.stringify({"user_id": this.user_id})
            })
            const data=await res.json().catch((e)=>{})
            if(res.ok){
                const taskId = data['task-id']
                const intv = setInterval(async () => {
                const csv_res = await fetch(`/get-csv/${taskId}`)
                if (csv_res.ok) {
                    clearInterval(intv)
                    window.location.href = `/get-csv/${taskId}`
                }
                }, 1000)
            }else {
                console.log("wait")
            }
        }
    }
}
