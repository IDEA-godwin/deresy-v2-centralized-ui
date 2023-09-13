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
        placeholder="Search Grant"
        :fetch-suggestions="handleSearchGrants"
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
        gitcoin grants are performing and using their funds.
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
    <div class="table-grant">
      <h1>Available Grants</h1>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" sortable label="Grant" min-width="200">
          <template #default="scope">
            <a
              :href="`/grants/${scope.row.id}`"
              target="_blank"
              class="grant-link"
            >
              <div class="grant-name-table-item">
                <div class="table-grant-icon">
                  <el-avatar :src="scope.row.image" :size="40" :round="true" />
                </div>
                <div class="table-grant-name">
                  {{ scope.row.name }}
                </div>
              </div>
            </a>
          </template>
        </el-table-column>
        <el-table-column
          prop="funds"
          sortable
          label="Funds raised"
          :formatter="amountFormatter"
          min-width="130"
        />
        <el-table-column
          prop="reviews"
          sortable
          label="Total reviews"
          min-width="100"
        />
        <el-table-column
          v-if="false"
          prop="score"
          sortable
          label="Score"
          min-width="100"
        />
        <el-table-column
          prop="region"
          sortable
          label="Region"
          min-width="100"
        />
        <el-table-column
          prop="lastUpdated"
          sortable
          label="Last updated"
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
import { useRouter } from "vue-router";

import { getAllGrants } from "@/services/GrantService";
import { getAllReviews } from "@/services/ReviewService";
import { getAllReviewRequests } from "@/services/ReviewRequestService";

import { debounce } from "lodash";

import { useStore } from "vuex";

export default {
  name: "Home",
  components: {},
  setup() {
    const router = useRouter();

    const grantsData = ref([]);
    const inputSearch = ref("");
    const loading = ref(true);
    const reviews = ref([]);
    const reviewRequests = ref([]);
    const tableData = ref([]);

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    const fetchData = async () => {
      const grantsResponse = await getAllGrants();
      grantsData.value = grantsResponse.response;

      const reviewsResponse = await getAllReviews();
      reviews.value = reviewsResponse.response;

      const reviewRequestsResponse = await getAllReviewRequests();
      reviewRequests.value = reviewRequestsResponse.response;
    };

    const amountFormatter = (grant) => {
      return formatter.format(grant.funds);
    };

    const formattingGrands = () => {
      grantsData.value.forEach((grant) => {
        const reviewObj = reviews.value.find(
          (r) => r.requestName === grant.request_name
        );

        const grantObj = {
          id: grant.id,
          image: grant.logo_url,
          name: grant.title,
          lastUpdated: grant.last_update_natural,
          region: grant.region.label,
          funds: parseFloat(grant.amount_received),
          reviews: reviewObj
            ? reviewObj.reviews.filter(
                (r) => r.hypercertID == grant.hypercertID
              ).length
            : 0,
          score: grant.score.toFixed(1),
        };
        tableData.value.push(grantObj);
      });
    };

    const handleSearchGrants = debounce((text, callback) => {
      const reduced = grantsData.value.reduce((filtered, grant) => {
        if (grant.title.toLowerCase().includes(text.toLowerCase())) {
          filtered.push({ id: grant.id, value: grant.title });
        }
        return filtered;
      }, []);

      callback(reduced);
    }, 500);

    const handleSelectSuggestion = (grant) => {
      router.push(`/grants/${grant.id}`);
    };

    onBeforeMount(async () => {
      const store = useStore();
      const { dispatch } = store;

      dispatch("showVersionNotification");

      await fetchData();

      grantsData.value.sort((a, b) =>
        parseFloat(a.amount_received) < parseFloat(b.amount_received) ? 1 : -1
      );

      formattingGrands();

      loading.value = false;
    });

    return {
      loading,
      grantsData,
      inputSearch,
      tableData,
      handleSearchGrants,
      handleSelectSuggestion,
      amountFormatter,
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
.grant-card {
  margin: 5%;
  width: 100% !important;
  height: 97% !important;
}
.grant-link {
  width: 100% !important;
  text-decoration: none;
  height: 97% !important;
}
.grant-img {
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

.table-grant {
  width: 100%;
  padding: 0 10px;
}
.grant-name-table-item {
  display: flex;
  align-items: center;
}
.table-grant-name {
  margin: 10px;
  color: #545454;
}

@media screen and (max-width: 768px) {
  .grant-name-table-item {
    display: block;
  }
  .table-grant-icon {
    display: flex;
    justify-content: center;
  }
  .table-grant-name {
    display: flex;
    text-align: center;
    justify-content: center;
  }
}
</style>
