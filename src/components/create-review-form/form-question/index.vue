<template>
  <div>
    <el-row>
      <el-row :gutter="20" style="width: 100%">
        <el-col :span="10">
          <el-form-item label="Question">
            <el-input
              v-model="questionObject.question"
              label="Question"
              type="text"
              placeholder="Enter a question"
            />
            <el-col :span="24" v-if="v$.question.$error">
              <span class="vuelidation-error">
                {{ v$.question.$errors[0].$message }}
              </span>
            </el-col>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Type">
            <el-select
              v-model="questionObject.type"
              class="m-2"
              placeholder="Select a question type"
              @change="onTypeSelection()"
            >
              <el-option
                v-for="type in questionTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
            <el-col :span="24" v-if="v$.type.$error">
              <span class="vuelidation-error">
                {{ v$.type.$errors[0].$message }}
              </span>
            </el-col>
          </el-form-item>
        </el-col>
        <el-col style="margin-top: 35px" :span="1">
          <el-button
            v-if="allowRemove()"
            type="danger"
            :icon="CloseBold"
            size="small"
            @click="removeQuestion()"
            circle
          ></el-button>
        </el-col>
      </el-row>
      <el-row
        v-for="(choice, index) in questionObject.choices"
        :key="index"
        :gutter="20"
        style="width: 100%"
      >
        <FormQuestionChoice
          :key="index"
          v-model="questionObject.choices[index]"
          v-on:delete-choice="deleteChoice(index)"
        />
        <el-col :span="24" v-if="v$.choices.$error" style="margin-top: 5px">
          <span class="vuelidation-error">
            {{ v$.choices.$errors[0].$message[index][0] }}
          </span>
        </el-col>
      </el-row>
    </el-row>
    <el-row>
      <el-col :span="20">
        <el-button
          v-if="isSingleChoice"
          class="add-choice-btn"
          type="warning"
          @click="addChoice()"
        >
          Add Choice
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { CloseBold } from "@element-plus/icons";
import FormQuestionChoice from "@/components/create-review-form/form-question-choice";
import { ref, computed, getCurrentInstance } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";

export default {
  name: "FormQuestion",
  components: {
    FormQuestionChoice,
  },
  emits: ["deleteQuestion", "update:modelValue"],
  props: {
    modelValue: {
      type: Object,
      default: () => ({ question: "", type: "", choices: [] }),
    },
  },
  setup(props, { emit }) {
    const questionObject = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const rules = computed(() => {
      return {
        question: { required },
        type: { required },
        choices: {
          $each: helpers.forEach({
            choiceText: {
              required,
            },
          }),
        },
      };
    });
    const v$ = useVuelidate(rules, questionObject);

    const isSingleChoice = ref(false);
    const instance = getCurrentInstance();

    const questionTypes = [
      {
        value: "0",
        label: "Text",
      },
      {
        value: "1",
        label: "Checkbox",
      },
      {
        value: "2",
        label: "Single Choice",
      },
    ];

    const onTypeSelection = () => {
      if (questionObject.value.type == 2) {
        isSingleChoice.value = true;
        questionObject.value.choices.push({ choiceText: "" });
        questionObject.value.choices.push({ choiceText: "" });
      } else {
        isSingleChoice.value = false;
        questionObject.value.choices = [];
      }
    };

    const addChoice = () => {
      questionObject.value.choices.push({ choiceText: "" });
    };

    const deleteChoice = (index) => {
      questionObject.value.choices.splice(index, 1);
    };

    const allowRemove = () => {
      return instance.vnode.key > 0;
    };

    const removeQuestion = () => {
      emit("deleteQuestion");
    };

    return {
      CloseBold,
      questionObject,
      questionTypes,
      isSingleChoice,
      onTypeSelection,
      addChoice,
      deleteChoice,
      allowRemove,
      removeQuestion,
      v$,
    };
  },
};
</script>
<style scoped>
.add-choice-btn {
  margin: 10px 0px;
  float: right;
}
.vuelidation-error {
  color: #dd0c0c;
  font-size: 12px;
  font-weight: bolder;
  float: left;
  margin-bottom: 5px;
}
</style>
