<template>
  <div class="popup">
    <div class="popup__background js-popup" @click="onClick"></div>
    <div class="popup__inner">
      <slot />

      <a href="#" class="popup__close js-popup" @click="onClick">X</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "Popup",
  props: {
    TogglePopup: Function,
  },
  methods: {
    onClick: function (event) {
      event.preventDefault();

      this.TogglePopup(event);
    },
  },
};
</script>

<style scoped>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.popup .popup__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000000;
  opacity: 0.6;
}

.popup .popup__inner {
  width: 17rem;
  padding: 2rem 2rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  color: #000000;
  text-align: center;
  z-index: 1;
}

.popup .popup__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  text-decoration: none;
}
</style>
