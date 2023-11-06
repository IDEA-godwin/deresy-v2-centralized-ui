<template>
  <el-row class="header-row">
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <span class="home-title">Hypercerts</span><br />
      <span class="home-subtitle">Explore public goods projects for web3</span>
    </el-col>
  </el-row>
  <hr />
  <el-row style="padding: 5% 0" v-loading="loading">
    <el-col
      v-for="(hypercert, index) in state.hypercertsData"
      :key="index"
      :xs="24"
      :sm="12"
      :md="12"
      :lg="8"
      :xl="8"
    >
      <router-link
        class="el-link el-link--default hypercert-link"
        :to="`/hypercerts/${hypercert.tokenID}`"
      >
        <el-card
          class="hypercert-card"
          :body-style="{ padding: '10px' }"
          shadow="hover"
        >
          <el-image
            :src="hypercert.metadata.image"
            class="image hypercert-img"
            fit="contain"
          />
          <div style="padding: 14px">
            <span>{{ hypercert.name }}</span>
          </div>
        </el-card>
      </router-link>
    </el-col>
  </el-row>
</template>

<script>
import { getProcessedHypercerts } from "@/services/HypercertService";
import { onBeforeMount, reactive, ref } from "vue";
export default {
  name: "Home",
  components: {},
  setup() {
    const loading = ref(true);
    const state = reactive({
      hypercertsData: {},
    });

    onBeforeMount(async () => {
      state.hypercertsData = (await getProcessedHypercerts()).response.sort(
        (a, b) => b.creation - a.creation
      );
      loading.value = false;
    });

    return {
      loading,
      state,
    };
  },
};
</script>

<style scoped>
.header-row {
  padding: 7%;
  background-color: #f4f1fa;
  margin: 0;
}
.header-row::before {
  content: "";
  background-image: url("../assets/images/gitcoin-bg.svg");
  background-position: 70% 30%;
  background-size: contain;
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  opacity: 0.15;
}
.hypercert-card {
  margin: 5%;
  width: 100% !important;
  height: 97% !important;
}
.hypercert-link {
  width: 100% !important;
  text-decoration: none;
  height: 97% !important;
}
.hypercert-img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
}
.home-title {
  font-weight: bolder;
  font-size: 40px;
  text-align: center;
  margin: 3% 0;
  color: #6610f2;
  position: relative;
  text-shadow: 1px 1px #6f6d6d60;
}
.home-subtitle {
  font-size: 24px;
  text-align: center;
  margin: 1% 0;
  color: #545454;
  position: relative;
  font-weight: bolder;
}
hr {
  border-top: 5px solid #6610f2;
  margin: 0;
}
</style>
