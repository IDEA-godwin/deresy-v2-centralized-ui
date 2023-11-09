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
        :to="`/hypercerts/${hypercert.id}`"
      >
        <el-card
          class="hypercert-card"
          :body-style="{ padding: '10px' }"
          shadow="hover"
        >
          <el-image
            :src="hypercert.image"
            class="image hypercert-img"
            fit="contain"
          />
          <div style="padding: 14px">
            <span style="font-size: 18px; font-weight: bolder">{{
              hypercert.name
            }}</span>
          </div>
          <div style="padding: 0 0 14px 0">
            <span
              >{{ hypercert.reviews
              }}{{ hypercert.reviews == 1 ? " review" : " reviews" }}</span
            >
          </div>
        </el-card>
      </router-link>
    </el-col>
  </el-row>
</template>

<script>
import { onBeforeMount, reactive, ref } from "vue";
import { getProcessedHypercerts } from "@/services/HypercertService";
import { getAllReviews } from "@/services/ReviewService";
export default {
  name: "Home",
  components: {},
  setup() {
    const hypercertsData = ref([]);
    const reviews = ref([]);
    const loading = ref(true);
    const state = reactive({
      hypercertsData: [],
    });

    onBeforeMount(async () => {
      hypercertsData.value = (await getProcessedHypercerts()).response;
      reviews.value = (await getAllReviews()).response;
      hypercertsData.value.sort((a, b) => b.creation - a.creation);

      hypercertsData.value.forEach((hypercert) => {
        const matchingReviews = [];
        for (const review of reviews.value) {
          review.reviews.find((reviewItem) => {
            if (reviewItem.hypercertID == hypercert.tokenID) {
              matchingReviews.push(reviewItem);
            }
          });
        }
        const hypercertObj = {
          id: hypercert.tokenID,
          image: hypercert.metadata?.image || "",
          name: hypercert.name,
          reviews: matchingReviews.length,
        };
        state.hypercertsData.push(hypercertObj);
      });

      state.hypercertsData.sort((a, b) => b.reviews - a.reviews);
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
