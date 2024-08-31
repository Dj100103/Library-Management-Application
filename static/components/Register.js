export default {
    template: `
    <form>
    <div class="alert alert-danger" v-if="error!=null">{{ error }}</div>

    <div class="mb-3">
        <label for="user-name" class="form-label">Username</label>
        <input type="password" class="form-control" id="user-name" v-model="cred.username">
    </div>
    <div class="mb-3">
        <label for="user-email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="user-email" aria-describedby="emailHelp" v-model="cred.email" required>
        <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
    </div>
    <div class="mb-3">
        <label for="user-password" class="form-label">Create Password</label>
        <input type="password" class="form-control" id="user-password" v-model="cred.password" required>
    </div>
    <button type="submit" class="btn btn-primary" @click="register">Submit</button>
    </form>
    `,

    data() {
        return {
            cred: {
                'email': null,
                'password': null,
                'username': null
            },
            error: null
        }
    },
    methods : {
        async register() {

            console.log(this.cred)
            const res = await fetch('http://127.0.0.1:5000/register', {
                method : "POST",
                headers : {"Content-Type": "application/json", "Accept": "*/*"},
                body: JSON.stringify(this.cred)
            
            })
            const data= await res.json()
            if(res.ok){
                console.log(data)
                this.$router.push({path:'/login'})
                // console.log(data);
            }
            else{
                this.error= data.message
            }
        }
    }
}