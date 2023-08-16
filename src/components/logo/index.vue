<template>
  <router-link to="/" class="logo" :class="modifier">
    <img :src="logo" alt="" />
  </router-link>
</template>

<script>
export default {
  name: "Logo",
  props: {
    logo: String,
    modifier: String,
  },
};
</script>

<style scoped>
.logo img {
  width: 60px;
  vertical-align: middle;
}
</style>
