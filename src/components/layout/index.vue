<template>
  <div>
    <div>
      <el-container>
        <el-header class="header">
          <div class="logo-container">
            <Logo :logo="require('../../assets/images/logo-deresy.png')" />
          </div>
          <div class="menu-container">
            <div class="desktop">
              <el-menu
                :default-active="activeIndex"
                mode="horizontal"
                @open="handleOpen"
                @close="handleClose"
                @select="handleSelect"
              >
                <el-menu-item index="/grants" @click="goToPath('/grants')">
                  Grants
                </el-menu-item>
              </el-menu>
              <div class="wallet-container">
                <Wallet />
              </div>
            </div>
            <div class="mobile">
              <el-icon class="fold-icon">
                <fold @click="drawer = true" />
              </el-icon>
            </div>
          </div>
        </el-header>
        <el-main class="main" id="main">
          <NetworkAlert />
          <notifications width="400px" :duration="300000" />
          <slot />
        </el-main>
        <el-footer class="footer">
          <el-row>
            <el-col class="s1-social-links">
              <el-link
                href="https://gitcoin.co/discord"
                target="_blank"
                :underline="false"
              >
                <img src="../../assets/icons/discord-icon.svg" />
              </el-link>
              <el-link
                href="https://gitcoin.co/twitter"
                target="_blank"
                :underline="false"
              >
                <img src="../../assets/icons/twitter-icon.svg" />
              </el-link>
            </el-col>
            <el-col style="margin-bottom: 10px">
              ©{{ new Date().getFullYear() }} — Deresy, LLC
            </el-col>
          </el-row>
        </el-footer>
      </el-container>
    </div>
    <el-drawer
      v-model="drawer"
      direction="rtl"
      size="60%"
      :before-close="handleClose"
      :with-header="false"
    >
      <el-menu
        :default-active="activeIndex"
        :default-openeds="['1']"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        @select="handleSelect"
      >
        <el-menu-item index="/grants" @click="goToPath('/grants')">
          Grants
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Fold } from "@element-plus/icons";

import Logo from "../logo";
import NetworkAlert from "../network-alert";
import Wallet from "../wallet";
import { useStore } from "vuex";

export default defineComponent({
  name: "Layout",
  components: {
    Logo,
    Fold,
    NetworkAlert,
    Wallet,
  },

  setup() {
    const route = useRoute();
    const router = useRouter();

    const drawer = ref(false);
    const activeIndex = ref(window.location.pathname);

    const goToPath = (path) => {
      if (route.path !== path) {
        router.push({ path });
      }
    };
    const store = useStore();
    const {
      state: { root },
    } = store;

    const projectsData = computed(() => root.projects);

    const handleClose = (done) => {
      if (typeof done === "function") {
        done();
      }
    };

    const handleOpen = () => {};

    const handleSelect = (index) => {
      if (index === "4") {
        drawer.value = true;
      } else {
        drawer.value = false;
      }
    };

    return {
      drawer,
      activeIndex,
      projectsData,
      goToPath,
      handleClose,
      handleOpen,
      handleSelect,
    };
  },
});
</script>

<style>
body,
html {
  margin: 0;
  overflow: hidden;
  --el-menu-active-color: #6610f2;
  --el-color-primary: #6610f2;
  --el-color-primary-light-3: #813cef;
  --el-color-primary-light-5: #b48cf5;
  --el-color-primary-dark-2: #3d0497;
}
a {
  text-decoration: none;
  font-weight: bold;
}
a:link {
  color: var(--el-color-primary);
}
a:visited {
  color: var(--el-color-primary);
}
a:hover {
  color: var(--el-color-primary);
}
a:active {
  color: var(--el-color-primary);
}

.el-drawer__body {
  padding: 0 !important;
  text-align: left;
}

.el-drawer__body .el-menu-item.dock-right {
  padding: 0 !important;
  text-align: center;
}
</style>
<style scoped>
.header {
  height: 64px;
  padding: 0;
  border-bottom: 1px solid #e6e6e6;
}

.main {
  height: calc(100vh - 180px);
  padding: 0;
}

.footer {
  padding-top: 30px;
  background: #efefef;
  height: 100%;
  font-size: 0.75em;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 900;
}

.logo-container {
  width: 200px;
  justify-content: center;
  align-items: center;
  height: 60px;
  line-height: 56px;
  margin: 0;
  padding: 0 20px;
  list-style: none;
  cursor: pointer;
  box-sizing: border-box;
  white-space: nowrap;
  float: left;
}

.logo-container * {
  vertical-align: middle;
}

.menu-container {
  width: calc(100% - 210px);
  height: 100%;
  float: right;
  display: flex;
}

.menu-container .el-menu {
  width: 100%;
  justify-content: right;
}

.menu-container .el-menu--horizontal {
  border-bottom: 0;
}

.fold-icon {
  width: 2em;
  height: 2em;
  vertical-align: middle;
}

.fold-icon svg {
  width: 2em;
  height: 2em;
}

.desktop {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: right;
}

.mobile {
  float: right;
  display: none;
}

.wallet-container {
  margin: 0 40px;
}

.wallet-mobile-container {
  width: 100%;
}

.s1-social-links img {
  width: 25px;
  height: auto;
}

.s1-social-links a {
  margin: 10px 5px 10px 15px;
}

.s1-social-links {
  margin-top: 10px;
}

.mobile-menu-item {
  font-weight: bold;
}

/* Specific styles for Mobile Devices */
@media screen and (max-width: 575px) {
  .logo-container {
    width: 80px;
  }

  .menu-container {
    width: 45px;
  }

  .main {
    padding: 6px;
  }

  .desktop {
    display: none;
  }

  .mobile {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
