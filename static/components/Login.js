

export default {
    template: `
    <form>
    <div class="alert alert-danger" v-if="error!=null">{{ error }}</div>

    <div class="mb-3">
        <label for="user-email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="user-email" aria-describedby="emailHelp" v-model="cred.email" required>
        <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
    </div>
    <div class="mb-3">
        <label for="user-password" class="form-label">Password</label>
        <input type="password" class="form-control" id="user-password" v-model="cred.password" required>
    </div>
    <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="exampleCheck1">
        <label class="form-check-label" for="exampleCheck1">Check me out</label>
    </div>
    <button type="submit" class="btn btn-primary" @click="login">Submit</button>
    </form>
    `,

    data() {
        return {
            cred: {
                'email': null,
                'password': null
            },
            error: null
        }
    },
    methods : {
        async login() {

            console.log(this.cred)
            const res = await fetch('http://127.0.0.1:5000/user_login', {
                method : "POST",
                headers : {"Content-Type": "application/json", "Accept": "*/*"},
                body: JSON.stringify(this.cred)
            
            })
            const data= await res.json()
            if(res.ok){
                console.log(data)
                localStorage.setItem('auth-token', data.auth_token)
                localStorage.setItem('user_role', data.role)
                localStorage.setItem('user_id', data.user_id)
                this.$router.push({path:'/'})
                // console.log(data);
            }
            else{
                this.error= data.message
            }
        }
    }
}