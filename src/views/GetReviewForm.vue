<template>
  <div class="form-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-form label-position="top">
          <h1>Get Review Form</h1>
          <el-row>
            <el-col :span="24">
              <el-form-item label="Review Form Index">
                <el-select
                  v-model="reviewFormIndex"
                  placeholder="Select a review form index"
                  size="large"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(o, index) in parseInt(reviewFormsTotal)"
                    :key="index"
                    :label="`Index ${index}`"
                    :value="index"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-button
          @click="sendBtn()"
          class="send-btn"
          type="success"
          size="large"
          :disabled="reviewFormIndex == null"
        >
          Send
        </el-button>
      </el-col>
    </el-row>
    <el-row v-if="tableData?.length > 0" style="margin: 5% 0%">
      <el-col :span="24">
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="question" label="Question" />
          <el-table-column prop="type" label="Type" />
          <el-table-column prop="choices" label="Choices" />
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getReviewForm, getReviewFormsTotal } from "@/services/ContractService";
import { useStore } from "vuex";
import { watch, computed, ref, onBeforeMount } from "vue";
import { ElNotification } from "element-plus";

export default {
  name: "CreateReviewForm",
  setup() {
    const store = useStore();
    const {
      dispatch,
      state: { contractState },
    } = store;

    const contract = computed(() => contractState.contract);
    const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;

    const reviewFormIndex = ref();
    const reviewForm = ref();
    const reviewFormsTotal = ref(0);
    const contractRef = ref(contract);
    const tableData = ref();

    const sendBtn = async () => {
      dispatch("setLoading", true);
      const payload = {
        reviewFormIndex: reviewFormIndex.value,
        contractMethods: contract.value.methods,
      };

      try {
        tableData.value = [];
        reviewForm.value = await getReviewForm(payload);
        reviewForm.value[0].forEach((question, index) => {
          let reviewFormHash = {
            question: "",
            type: "",
            choices: "",
          };

          reviewFormHash.question = reviewForm.value[0][index];
          reviewFormHash.type =
            reviewForm.value[1][index] == 0
              ? "Text"
              : reviewForm.value[1][index] == 1
              ? "Yes/No"
              : "Single Choice";
          reviewFormHash.choices = reviewForm.value[2][index].join("\n");

          tableData.value.push(reviewFormHash);
        });
      } catch (e) {
        ElNotification({
          title: "Error getting Review Form",
          message: `${e}`,
          type: "error",
          duration: notificationTime,
        });
      }
      dispatch("setLoading", false);
    };

    onBeforeMount(async () => {
      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        reviewFormsTotal.value = await getReviewFormsTotal(payload);
      }
    });

    watch([contractRef], async () => {
      if (contractRef.value) {
        const payload = {
          contractMethods: contract.value.methods,
        };
        reviewFormsTotal.value = await getReviewFormsTotal(payload);
      }
    });

    return {
      reviewFormsTotal,
      reviewFormIndex,
      tableData,
      sendBtn,
    };
  },
};
</script>

<style scoped>
.form-container {
  padding: 2% 5%;
}
.send-btn {
  margin: 10px 0px;
  float: left;
}
</style>
<style>
.el-table .cell {
  white-space: pre !important;
}
</style>
