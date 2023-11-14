<template>
  <el-row class="header-row">
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <span class="home-title">GITCOIN REVIEWS</span><br />
      <span class="home-subtitle">Explore public goods projects for web3</span>
    </el-col>
    <el-col class="home-search">
      <el-autocomplete
        clearable
        v-model="inputSearch"
        :trigger-on-focus="false"
        placeholder="Search Hypercerts"
        :fetch-suggestions="handleSearchHypercerts"
        @select="handleSelectSuggestion"
      />
    </el-col>
  </el-row>
  <hr />
  <el-row
    style="
      padding: 5% 0;
      background-color: #8c66f7;
      color: white;
      margin-top: -1px;
    "
  >
    <el-col
      :xs="24"
      :sm="24"
      :md="12"
      :lg="12"
      :xl="12"
      style="padding: 0% 5% 0% 10%"
    >
      <h1>What is Gitcoinreviews.co?</h1>
      <p>
        Powered by Deresy, a <strong>DEcentralized REview SYstem</strong> on
        Optimism, gitcoinreviews aims to bring users full transparency on how
        hypercerts are performing and using their funds.
      </p>
    </el-col>
    <el-col
      :xs="24"
      :sm="24"
      :md="12"
      :lg="12"
      :xl="12"
      style="padding: 0% 10% 0% 5%"
    >
      <img src="../assets/images/rocket-gitcoin.svg" />
    </el-col>
  </el-row>
  <hr />
  <el-row style="padding: 5% 0">
    <div class="table-hypercert">
      <h1>Top Reviewed Hypercerts</h1>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" sortable label="Hypercert" min-width="200">
          <template #default="scope">
            <a :href="`/hypercerts/${scope.row.id}`" class="hypercert-link">
              <div class="hypercert-name-table-item">
                <div class="table-hypercert-icon">
                  <el-avatar :src="scope.row.image" :size="40" :round="true" />
                </div>
                <div class="table-hypercert-name">
                  {{ scope.row.name }}
                </div>
              </div>
            </a>
          </template>
        </el-table-column>
        <el-table-column
          prop="reviews"
          sortable
          label="Total reviews"
          min-width="100"
        />
        <el-table-column
          prop="createdAt"
          sortable
          label="Created at"
          min-width="100"
        >
        </el-table-column>
      </el-table>
    </div>
  </el-row>
  <hr />
</template>

<script>
import { onBeforeMount, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

import { getProcessedHypercerts } from "@/services/HypercertService";
import { getAllReviews } from "@/services/ReviewService";

import { debounce } from "lodash";

import { useStore } from "vuex";

export default {
  name: "Home",
  components: {},
  setup() {
    const router = useRouter();
    const route = useRoute();

    const hypercertsData = ref([]);
    const inputSearch = ref("");
    const loading = ref(true);
    const reviews = ref([]);
    const tableData = ref([]);

    const formatDate = (unixTimestamp) => {
      const date = new Date(unixTimestamp * 1000);

      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return date.toLocaleString("en-US", options);
    };

    const handleSearchHypercerts = debounce((text, callback) => {
      const reduced = hypercertsData.value.reduce((filtered, hypercert) => {
        if (hypercert.name.toLowerCase().includes(text.toLowerCase())) {
          filtered.push({ tokenID: hypercert.tokenID, value: hypercert.name });
        }
        return filtered;
      }, []);

      callback(reduced);
    }, 500);

    const handleSelectSuggestion = (hypercert) => {
      router.push(`/hypercerts/${hypercert.tokenID}`);
    };

    onBeforeMount(async () => {
      const store = useStore();
      const { dispatch } = store;

      if (route.query.formSuccess !== "true") {
        dispatch("showVersionNotification");
      }

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
          image: hypercert.metadata.image,
          name: hypercert.name,
          createdAt: formatDate(hypercert.creation),
          reviews: matchingReviews.length,
        };
        tableData.value.push(hypercertObj);
      });

      tableData.value = tableData.value.slice(0, 10);
      tableData.value.sort((a, b) => b.reviews - a.reviews);

      loading.value = false;
    });

    return {
      loading,
      hypercertsData,
      inputSearch,
      tableData,
      handleSearchHypercerts,
      handleSelectSuggestion,
    };
  },
};
</script>

<style>
.table-grant .el-table .cell {
  word-break: normal !important;
}
</style>

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
.home-search {
  margin: 20px 0;
}
hr {
  border-top: 5px solid #6610f2;
  margin: 0px 0px 0px 0px !important;
}

.table-hypercert {
  width: 100%;
  padding: 0 10px;
}
.hypercert-name-table-item {
  display: flex;
  align-items: center;
}
.table-hypercert-name {
  margin: 10px;
  color: #545454;
}

@media screen and (max-width: 768px) {
  .hypercert-name-table-item {
    display: block;
  }
  .table-hypercert-icon {
    display: flex;
    justify-content: center;
  }
  .table-hypercert-name {
    display: flex;
    text-align: center;
    justify-content: center;
  }
}
</style>
