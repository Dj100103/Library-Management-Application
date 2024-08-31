import Books from "./Books.js";
import Requests from "./Requests.js";
import Sections from "./Sections.js";


export default {
    template: `<div>
    <Books />
    <br>
    <Sections />
    <br>
    <Requests />
    </div>`,
    components:{
        Books,
        Sections,
        Requests
    }    
}