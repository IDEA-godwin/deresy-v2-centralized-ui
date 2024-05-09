<template>
  <div v-loading="isFormLoading" class="form-container">
    <el-row>
      <el-col :span="24">
        <el-form label-position="top">
          <h1>Create Review Form Template</h1>

          <el-row class="form-section">
            <el-col :span="24">
              <el-form-item label="Form Name">
                <el-input
                  v-model="formAccessibility.formName"
                  placeholder="Enter form name"
                ></el-input>
                <span class="vuelidation-error" v-if="v$.formName.$error">{{
                  v$.formName.$errors[0].$message
                }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="22">
              <FormQuestion
                v-for="(formQuestion, index) in formAccessibility.formQuestions"
                v-model="formAccessibility.formQuestions[index]"
                v-on:delete-question="deleteQuestion(index)"
                :key="index"
              />
            </el-col>
          </el-row>

          <el-row class="form-section">
            <el-col :span="24">
              <el-button @click="addQuestion()" class="add-btn" type="primary">
                Add Question
              </el-button>
            </el-col>
          </el-row>
          <hr class="submit-separator" />
          <el-row class="form-section">
            <el-col :span="24">
              <el-tooltip
                class="box-item"
                effect="dark"
                placement="top"
                :content="submitMessage()"
                :disabled="!disableSubmit()"
              >
                <el-button
                  @click="sendBtn()"
                  class="send-btn"
                  type="success"
                  size="large"
                  :disabled="disableSubmit()"
                >
                  Submit
                </el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import FormQuestion from "@/components/create-review-form/form-question";
import { DERESY_CONTRACT_ADDRESS } from "@/constants/contractConstants";
import { createReviewForm } from "@/services/ContractService";
import { useStore } from "vuex";
import { reactive, onBeforeMount, computed, ref } from "vue";
import { ElNotification } from "element-plus";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { useRouter } from "vue-router";
import { HOME_ROUTE } from "@/constants/routes";
import { NETWORK_IDS, NETWORK_NAMES } from "@/constants/walletConstants";

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
    const isFormLoading = ref(false);
    const router = useRouter();

    const formAccessibility = reactive({
      formQuestions: [],
      formName: null,
    });

    const rules = computed(() => {
      return {
        formName: { required },
      };
    });

    const v$ = useVuelidate(rules, formAccessibility);

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

    const disableSubmit = () => {
      return (
        !user.networkId || NETWORK_IDS[process.env.NODE_ENV] !== user.networkId
      );
    };

    const submitMessage = () => {
      if (!user.networkId) {
        return "Please connect your wallet";
      } else if (NETWORK_IDS[process.env.NODE_ENV] !== user.networkId) {
        return `Please connect your wallet to the ${
          NETWORK_NAMES[NETWORK_IDS[process.env.NODE_ENV]]
        } network`;
      } else {
        return "";
      }
    };

    const sendBtn = async () => {
      isFormLoading.value = true;
      v$.value.$validate();
      if (!v$.value.$error) {
        dispatch("setLoading", true);
        const payload = {
          formName: formAccessibility.formName,
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
          router.push({
            path: HOME_ROUTE,
            query: { formSuccess: "true" },
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
      isFormLoading.value = false;
    };

    onBeforeMount(async () => {
      formAccessibility.formQuestions.push({
        question: "",
        type: "",
        choices: [],
      });
    });

    return {
      isFormLoading,
      formAccessibility,
      disableSubmit,
      submitMessage,
      addQuestion,
      deleteQuestion,
      sendBtn,
      v$,
    };
  },
};
</script>

<style scoped>
.form-container {
  text-align: left;
  padding: 2% 10%;
}

.add-question-btn {
  margin: 10px 0px;
  float: left;
}
.send-btn {
  margin: 10px 0px;
  float: left;
}
.submit-separator {
  margin: 30px 0px 20px 0px;
  border-top: 1px solid rgb(235, 233, 233);
}
.vuelidation-error {
  color: #dd0c0c;
  font-size: 12px;
  font-weight: bolder;
  text-align: left;
  margin-top: 5px;
}
</style>
