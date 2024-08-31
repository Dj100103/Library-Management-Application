import SectionsBooks from "./SectionsBooks.js"
import EditSection from "./EditSections.js"

export default {
    template: `<div>
    <br>
    <br>
    <h2 v-if="error">{{ error }}  <button @click="create_section" v-if="role=='Librarian'" class="btn btn-outline-success">Create One</button></h2>
    <h2 v-if="!error">Sections    <button @click="create_section" v-if="role=='Librarian'" class="btn btn-outline-success">Create One</button></h2> 
    <br>

<div class="row row-cols-1 row-cols-md-5 g-4">
  <div class="col" v-for="section in sections">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{{ section.name }}</h5>
        <h6 class="card-title">Total Books : {{ section.books.length || 0 }}</h6>
        <div class="btn-group" role="group" aria-label="Basic mixed styles example">
        <button class="btn btn-info" type="button" @click="openSectionModal(section)">Details</button>
        <button class="btn btn-warning" type="button" v-if="role=='Librarian'" @click="EditSection(section)">Edit</button>
        <button class="btn btn-danger" type="button" v-if="role=='Librarian'" @click="delete_section(section.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</div>





    <div class="modal fade" id="exampleModalSection" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Create New Section</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form>
            <div class="alert alert-danger" v-if="sectionerror">{{ sectionerror }}</div>
            <div class="mb-3">
                <label for="section-name" class="col-form-label">Section Name:</label>
                <input type="text" class="form-control" id="section-name" placeholder="Type Section Name" v-model="sectionName" required>
            </div>
            <div class="mb-3">
                <label>Books:</label>
                <div class="form-check" v-for="book in books" :key="book.id">
                <input class="form-check-input" type="checkbox" :value="book.id" v-model="selectedBooks">
                <label class="form-check-label" :for="'flexCheckDefault' + book.id">
                    {{ book.name }} | {{ book.author || "No Author" }}
                </label>
                </div>
            </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="sendsection">Create</button>
        </div>
        </div>
    </div>
    </div>

    <br>
    <SectionsBooks 
    :section=SelectedSection
    :user_id=user_id
    ref="SectionsBooks"
    />
    <EditSection
    :section=SelectedSection
    :books=books
    ref="EditSection"
    @update-section="update_section"
    />
    </div>`,
    components: { SectionsBooks, EditSection },
    data() {
        return {
        sections: [],
        error:null,
        books: [],
        selectedBooks:[],
        sectionName: '',
        sectionerror: null,
        token: localStorage.getItem("auth-token"),
        role: localStorage.getItem("user_role"),
        user_id:localStorage.getItem("user_id"),
        SelectedSection:{}
        }
    },
    async mounted() {
        this.sections=[]
        const res=await fetch("/sections", {
            headers:{"Authentication-Token":this.token},
            method: "GET"
            }
        )
        const data = await res.json().catch((e) => {})
        if(res.ok){
            this.sections=data.sections
            console.log(this.sections)
        }else{
            this.error= data.message
            console.log(this.error)
        }
    },


    methods: {
        async create_section() {
            const modal = new bootstrap.Modal(document.getElementById('exampleModalSection'));
            const res= await fetch("/all_books", {
                headers:{"Authentication-Token": this.token}
            })
            const data = await res.json().catch((e) => {})
            if(res.ok){
                this.books=data.books
            }
            modal.show()
        },
        async sendsection() {
            if(!this.sectionName){
                this.sectionerror="Name Not provided"
            }else{
            const res=await fetch("/sections", {
                headers: {"Content-Type": "application/json", "Authentication-Token":this.token},
                method:"POST",
                body:JSON.stringify({name: this.sectionName, books:this.selectedBooks})
            })
            const data=await res.json().catch((e) => {})
            if(res.ok){
                this.sections.push({'name':this.sectionName, 'books':this.selectedBooks, 'id':data.section_id})
                console.log(this.sections)
                this.error=null
                this.hideModal()    
            }
            }},
        hideModal() {
            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalSection'));
            if (modal) modal.hide();
        },
        async openSectionModal(section){
            console.log(section)
            this.SelectedSection=section
            this.$refs.SectionsBooks.show()
        },
        async EditSection(section) {
            const res= await fetch("/all_books", {
                headers:{"Authentication-Token": this.token}
            })
            const data = await res.json().catch((e) => {})
            if(res.ok){
                this.books=data.books
            }
            this.SelectedSection=section
            console.log(this.books)
            console.log(this.SelectedSection)
            this.$refs.EditSection.show()
        },
        async update_section(section_data) {
        console.log(section_data)
        const res=await fetch("/update_section", {
            method: "POST",
            headers:{"Content-Type": 'application/json', "Authentication-Token":this.token},
            body: JSON.stringify(section_data)
        })
          const data=await res.json().catch((e)=>{})
          if(res.ok){
            const index = this.sections.findIndex(section => section.id === section_data.id);
            if (index !== -1) {
              this.sections.splice(index, 1, section_data);
            }else{
              this.update_error="Unable to Update"
            }
          }
        },
        async delete_section(section_id) {
            const res=await fetch("/sections", {
                method: "DELETE",
                headers:{"Content-Type": 'application/json', "Authentication-Token":this.token},
                body: JSON.stringify({"section_id":section_id})
            })
            const data=await res.json().catch((e)=>{})
            if(res.ok){
                this.sections=this.sections.filter(section => section.id !== section_id)
                console.log('deleted Section successfully')
            }
        }
    }
}