export default {
    template: `
        <div>
            <h1 v-if="user_role=='User'">Your Stats</h1>
            <h1 v-else>App Stats</h1>

        <div class="card-group" v-if="user_role=='User'">
            <div class="card">
                <img :src="userRequestsVsIssuedBooksUrl" alt="Requests vs Issued Books">
                <div class="card-body">
                <h5 class="card-title">User Requests V/s Issued Books</h5>
                </div>
            </div>
            <div class="card">
                <img :src="userBooksIssuedOverTimeUrl" alt="Books Issued Over Time">
                <div class="card-body">
                <h5 class="card-title">Books Issued Over Time</h5>
                </div>
            </div>
            <div class="card">
                <img :src="topBooksUrl" alt="Top 5 Books">
                <div class="card-body">
                <h5 class="card-title">Top Books</h5>
                </div>
            </div>
            <div class="card">
                <img :src="userBooksIssuedOverTimeUrl" alt="Books Issued Over Time">
                <div class="card-body">
                <h5 class="card-title">Books Issued Over Time</h5>
                </div>
            </div>
        </div>

        <div v-else>
        <div class="card-group">
            <div class="card">
                <img :src="totalRequestsOverTimeUrl" alt="Total Requests Over Time">
                <div class="card-body">
                <h5 class="card-title">Total Requests Over Time</h5>
                </div>
            </div>
            <div class="card">
                <img :src="totalBooksIssuedOverTimeUrl" alt="Total Books Issued Over Time">
                <div class="card-body">
                <h5 class="card-title">Total Books Issued Over Time</h5>
                </div>
            </div>
        </div>
        <br>
        <div class="card-group">
            <div class="card">
                <img :src="totalUserRegistrationsOverTimeUrl" alt="Total User Registrations Over Time">
                <div class="card-body">
                <h5 class="card-title">Total User Registrations Over Time</h5>
                </div>
            </div>
            <div class="card">
                <img :src="totalRequestAcceptedRejected" alt="Total Requests Accepted Rejected">
                <div class="card-body">
                <h5 class="card-title">Requests Accepted v/s Rejected</h5>
                </div>
            </div>
        </div>
        </div>
    </div>


    `,
    data() {
        return {
            user_role: localStorage.getItem('user_role'),
            token: localStorage.getItem('auth-token'),
            user_id: localStorage.getItem('user_id'),

            // URLs for the images
            userRequestsVsIssuedBooksUrl: '',
            userBooksIssuedOverTimeUrl: '',
            userStatsTableUrl: '',

            librarianStatsTableUrl: '',
            totalRequestsOverTimeUrl: '',
            totalBooksIssuedOverTimeUrl: '',
            totalUserRegistrationsOverTimeUrl: '',
            totalRequestAcceptedRejected :'',
            topBooksUrl:'',
        }
    },
    async mounted() {
        if (this.user_role === 'User') {
            // Fetch user-specific data
            try {
                const headers = { 'Authorization': `Bearer ${this.token}` };

                this.userRequestsVsIssuedBooksUrl = await this.fetchImage(`/api/user_requests_vs_issued_books/${this.user_id}`, headers);
                this.userBooksIssuedOverTimeUrl = await this.fetchImage(`/api/user_books_issued_over_time/${this.user_id}`, headers);
                this.userStatsTableUrl = await this.fetchImage(`/api/user_stats/${this.user_id}`, headers);
                this.topBooksUrl=await this.fetchImage('/api/topbooks', headers);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        } else if (this.user_role === 'Librarian') {
            // Fetch librarian-specific data
            try {
                const headers = { 'Authorization': `Bearer ${this.token}` };

                this.librarianStatsTableUrl = await this.fetchImage(`/api/librarian_stats_table`, headers);
                this.totalRequestsOverTimeUrl = await this.fetchImage(`/api/total_requests_over_time`, headers);
                this.totalBooksIssuedOverTimeUrl = await this.fetchImage(`/api/total_books_issued_over_time`, headers);
                this.totalUserRegistrationsOverTimeUrl = await this.fetchImage(`/api/total_user_registrations_over_time`, headers);
                this.totalRequestAcceptedRejected = await this.fetchImage('/api/total_requests_ar', headers)
            } catch (error) {
                console.error('Error fetching librarian data:', error);
            }
        }
    },
    methods: {
        async fetchImage(url, headers) {
            const response = await fetch(url, { headers });
            if (response.ok) {
                // Convert the response into a URL that can be used in the src attribute of an img tag
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } else {
                throw new Error(`Failed to fetch image from ${url}`);
            }
        }
    }
}
