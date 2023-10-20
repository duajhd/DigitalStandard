<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script>


export default {
  data() {
    return {
      collapse: false,

      
    };
  },
  methods: {
    onCollapse() {
      this.collapse = !this.collapse;
    },

    
  },
  components: {
   
  },
};
</script>
<style lang="scss">
.aside {
  height: 100vh;
  .el-menu-vertical-demo {
    height: 100%;
  }
}
.header {
  display: flex;
  padding: 0;
  .collapse {
    width: 40px;
    height: 40px;
  }
  .logo {
    display: inline-block;
    height: 100%;
    flex-basis: 80px;
    background-color: red;
  }
  .roject-name {
    display: inline-block;
  }
  .el_export {
    width: 80px;
    height: 40px;
    text-align: center;
    font-size: 14px;
  }
}
</style>
