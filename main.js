Vue.use(Vuex);

// Store the state to control the display of the components
var store = new Vuex.Store({
    state: {
        usernameFounded: false,
        readmeMDFounded: false,
    },
    mutations: {
        setUsernameFounded (state){
            state.usernameFounded = true;
        },
        unsetUsernameFounded (state){
            state.usernameFounded = false;
        },
        setReadmeMDFounded (state){
            state.readmeMDFounded = true;
        },
        unsetReadmeMDFounded (state){
            state.readmeMDFounded = false;
        },
    },
})

var selectUsernameComponent = {
    delimiters: ["{{", "}}"],
    template: "#select-username-template",
    data: function(){
        return{
            usernameChoice: "",
            inputDone: false,
            errCode: null,
        }
    },
    methods: {
        checkForm: function(e){
            if (this.usernameChoice.length != 0){
                let profileURL = "https://api.github.com/users/" + this.usernameChoice + "/repos?per_page=100";
                axios.get(profileURL)
                .then((resp) => {
                    console.log(resp);
                    console.log(resp.status);
                    let allRepoName = [];
                    resp.data.forEach((ele) => {
                        allRepoName.push(ele.name);
                    })
                    let obj = {
                        username: this.usernameChoice,
                        allRepoName: allRepoName,
                    }
                    this.$store.commit("setUsernameFounded");
                    this.$emit("send-to-parent", obj);
                    this.inputDone = true;
                }).catch((err) => {
                    console.log(err);
                    this.errCode = err.response.status;
                }).then(() => {
                    console.log("API call complete");
                })
            }
        },
        disableInputDone: function(){
            this.inputDone = false;
            this.usernameChoice = "";
            this.errCode = null;
            this.$store.commit("unsetUsernameFounded");
            this.$store.commit("unsetReadmeMDFounded");
            this.$emit("reset-data");
        }
    },
    computed: {

    },
    watch: {

    }
}

var viewUserComponent = {
    delimiters: ["{{", "}}"],
    template: "#view-user-template",
    data: function (){
        return {
            usernameChoice: this.$props.allRepoApiCallData.username,
            repoNameChoice: null,
            readmeNotFounded: false,
        }
    },
    props: ["allRepoApiCallData"],
    methods: {
        checkForm: function (e){
            this.$store.commit("unsetReadmeMDFounded");
            this.readmeNotFounded = false
            if (this.usernameChoice != null && this.repoNameChoice != null){
                let repoURL = "https://api.github.com/repos/" + this.usernameChoice + "/" + this.repoNameChoice + "/readme";
                axios.get(repoURL, {
                    headers: {
                        Accept: "applcation/vnd.github.V3.html"
                    }
                })
                .then((resp) => {
                    let readmeData = resp.data;
                    this.$emit("send-to-parent", readmeData);
                    this.$store.commit("setReadmeMDFounded");
                    document.getElementById('readme-content').innerHTML = marked(readmeData);
                }).catch((err) => {
                    console.log(err);
                    this.readmeNotFounded = true;
                }).then((err) => {
                    console.log("Query repo readme complete.");
                })
            }
        },
        unsetRepoInputDone: function (e){
            this.repoNameInputDone = false;
            this.repoNameChoice = null;
            this.readmeNotFounded = false;
        }
    },
    computed: {
        
    },
    watch: {

    },
}

// Main app
var app = new Vue({
    delimiters: ["{{", "}}"],
    el: "#app",
    data: function(){
        return {
            allRepoAPICallData: null,
            readmeData: null,
        }
    },
    store: store,
    computed: {
        ...Vuex.mapState({
            usernameFounded: state => state.usernameFounded,
            repoFounded: state => state.repoFounded,
            readmeMDFounded: state => state.readmeMDFounded,
        })
    },
    methods: {
        assignAllRepoAPICallData: function (data){
            this.allRepoAPICallData = data;
        },
        assignReadmeData: function( data){
            this.readmeData = data;
        },
        resetData: function (){
            this.allRepoAPICallData = null;
            this.repoAPICallData = null;
            document.getElementById("readme-content").innerHTML = "";
        }
    },
    watch: {
        
    },
    components: {
        "select-username-component": selectUsernameComponent,
        "view-user-component": viewUserComponent,
    },
})