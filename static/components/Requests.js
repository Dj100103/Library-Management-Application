export default {
    template:`
    <div>
    <h2>Requests</h2>
    <h2 v-if="error">{{ error }}</h2>
    <div class="row row-cols-1 row-cols-md-5 g-4">
    <div class="col" v-for="request in requests">
    <div class="card-group">
        <div class="card">
        <div class="card-body">
            <h5 class="card-title">Request Card</h5>
            <p class="card-text">Requested By : {{ request.user_email }}</p>
            <p class="card-text">Book : {{ request.book_name }}</p>
            <p class="card-text">Requested on : {{ request.on }}</p>
        </div>
        <div class="card-footer">
            <button type="button" class="btn btn-success" @click="approve(request.user_id, request.book_id)">Approve</button>
            <button type="button" class="btn btn-danger" @click="reject(request.user_id, request.book_id)">Reject</button>
        </div>
        </div>
    </div>
    </div>
    </div>
    </div>
    `,
    data() {
        return {
            requests:[],
            error: null,
            token: localStorage.getItem("auth-token")
        }
    },
    async mounted() {
        const res=await fetch("/all_requests", {headers:{
            "Authentication-Token": this.token
        }})
        const data=await res.json().catch((e)=>{})
        if(res.ok){
            this.requests=data.data
        }else{
            this.error="No Requests available"
        }
    },
    methods: {
        async approve(user_id, book_id) {
            const res=await fetch(`/approve/${user_id}/${book_id}`, {
                headers:{
                    "Authentication-Token": this.token
                }
            })
            const data=await res.json().catch((e)=>{})
            if(res.ok){
                this.requests = this.requests.filter(req => req.book_id !== book_id || req.user_id !== user_id);
            }else{
                console.log(data.message)
            }
        },

        async reject(user_id, book_id) {
            const res=await fetch(`/reject/${user_id}/${book_id}`, {
                headers:{
                    "Authentication-Token": this.token
                }
            })
            const data=await res.json().catch((e)=>{})
            if(res.ok){
                this.requests = this.requests.filter(req => req.book_id !== book_id || req.user_id !== user_id);
                if(!this.requests){
                    this.error="No pending requests"
                }
            }else{
                console.log(data.message)
            }
        }
    }
}