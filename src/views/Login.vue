<template>
  <div>
    <el-row class="s1-section-1">
      <el-input
        placeholder="Password"
        v-model="loginPassword"
        show-password
      ></el-input>
      <br /><br />
      <el-button type="primary" size="medium" @click="submitLogin">
        Login
      </el-button>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "Login",
  components: {},
  created() {
    this.returnUrl = this.$route.query.returnUrl || "/";
  },
  setup() {},
  data() {
    return {
      loginPassword: "",
    };
  },
  methods: {
    submitLogin() {
      if (this.loginPassword == "logout") {
        localStorage.removeItem("user");
      }

      if (
        this.loginPassword != "" &&
        process.env.VUE_APP_LOGIN_PASSWORDS.includes(this.loginPassword)
      ) {
        localStorage.setItem("user", "LOGGED IN");
        this.$router.push(this.$route.query.returnUrl);
      } else {
        alert("Invalid Password");
      }
    },
  },
};
</script>

<style scoped>
.s1-section-1 {
  display: inline-block;
  vertical-align: top;
}
</style>
