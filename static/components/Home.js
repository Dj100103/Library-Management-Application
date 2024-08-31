import GeneralUser from "./GeneralUser.js";
import Librarian from "./Librarian.js"

export default {
    template: `
    <div>
        <Librarian v-if="user_role=='Librarian'" />
        <GeneralUser v-if="user_role=='User'" />
    </div>
    `,
    data() {
        return {
            user_role : localStorage.getItem('user_role')
        };
    },
    components: {
        Librarian,
        GeneralUser
    }
}