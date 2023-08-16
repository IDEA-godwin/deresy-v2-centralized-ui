<template>
  <div class="form-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-form label-position="top">
          <h1>Create Review Form</h1>
          <FormQuestion
            v-for="(formQuestion, index) in formAccessibility.formQuestions"
            v-model="formAccessibility.formQuestions[index]"
            v-on:delete-question="deleteQuestion(index)"
            :key="index"
          />
        </el-form>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-button
          @click="addQuestion()"
          class="add-question-btn"
          type="primary"
        >
          Add Question
        </el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-button
          @click="sendBtn()"
          class="send-btn"
          type="success"
          size="large"
        >
          Send
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import FormQuestion from "@/components/create-review-form/form-question";
import { DERESY_CONTRACT_ADDRESS } from "@/constants/contractConstants";
import { createReviewForm } from "@/services/ContractService";
import { useStore } from "vuex";
import { reactive, onBeforeMount, computed } from "vue";
import { ElNotification } from "element-plus";
import { useVuelidate } from "@vuelidate/core";

export default {
  name: "CreateReviewForm",
  components: {
    FormQuestion,
  },
  setup() {
    const store = useStore();
    const {
      dispatch,
      state: { contractState, user },
    } = store;

    const web3 = computed(() => contractState.web3);
    const contract = computed(() => contractState.contract);
    const walletAddress = computed(() => user.walletAddress);
    const notificationTime = process.env.VUE_APP_NOTIFICATION_DURATION;

    const formAccessibility = reactive({
      formQuestions: [],
    });

    const v = useVuelidate();

    const addQuestion = () => {
      formAccessibility.formQuestions.push({
        question: "",
        type: "",
        choices: [],
      });
    };

    const deleteQuestion = (index) => {
      formAccessibility.formQuestions.splice(index, 1);
    };

    const sendBtn = async () => {
      v.value.$validate();
      if (!v.value.$error) {
        dispatch("setLoading", true);
        const payload = {
          questions: [],
          types: [],
          choices: [],
          contractAddress: DERESY_CONTRACT_ADDRESS,
          walletAddress: walletAddress.value,
        };

        formAccessibility.formQuestions.forEach((formQuestion) => {
          const choicesText = formQuestion.choices.map((choice) => {
            return choice.choiceText;
          });
          payload.questions.push(formQuestion.question);
          payload.types.push(formQuestion.type);
          payload.choices.push(choicesText);
        });

        try {
          await createReviewForm(web3.value, contract.value, payload);

          ElNotification({
            title: "Success",
            message: "Successful transaction.",
            type: "success",
            duration: notificationTime,
          });
        } catch (e) {
          if (e.code === 4001) {
            ElNotification({
              title: "Error",
              message: "Transaction cancelled.",
              type: "error",
              duration: notificationTime,
            });
          } else if (e.code === -32603) {
            ElNotification({
              title: "Error",
              message: "Error processing TX.",
              type: "error",
              duration: notificationTime,
            });
          } else {
            ElNotification({
              title: "Error",
              message: `Transaction failed: ${e.message}`,
              type: "error",
              duration: notificationTime,
            });
          }
        }
        dispatch("setLoading", false);
      }
    };

    onBeforeMount(async () => {
      formAccessibility.formQuestions.push({
        question: "",
        type: "",
        choices: [],
      });
    });

    return {
      formAccessibility,
      addQuestion,
      deleteQuestion,
      sendBtn,
    };
  },
};
</script>

<style scoped>
.form-container {
  padding: 2% 5%;
}

.add-question-btn {
  margin: 10px 0px;
  float: left;
}
.send-btn {
  margin: 10px 0px;
  float: left;
}
</style>
