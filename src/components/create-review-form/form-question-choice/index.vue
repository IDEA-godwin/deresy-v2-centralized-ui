<template>
  <el-col style="margin-top: 5px" :span="18">
    <el-input
      v-model="choiceObject.choiceText"
      placeholder="Enter a question choice"
    />
  </el-col>
  <el-col style="margin-top: 5px" :span="1">
    <el-button
      v-if="allowRemove()"
      type="danger"
      :icon="CloseBold"
      size="small"
      @click="removeChoice()"
      circle
    ></el-button>
  </el-col>
</template>

<script>
import { getCurrentInstance, computed } from "vue";
import { CloseBold } from "@element-plus/icons";

export default {
  name: "FormQuestionChoice",
  emits: ["deleteChoice", "update:modelValue"],
  props: {
    modelValue: {
      type: Object,
      default: () => ({ choiceText: "" }),
    },
  },
  setup(props, { emit }) {
    const instance = getCurrentInstance();

    const choiceObject = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const allowRemove = () => {
      return instance.vnode.key > 1;
    };

    const removeChoice = () => {
      emit("deleteChoice");
    };

    return {
      choiceObject,
      CloseBold,
      removeChoice,
      allowRemove,
    };
  },
};
</script>
