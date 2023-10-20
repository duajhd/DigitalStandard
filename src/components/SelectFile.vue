<template>
  <span>
    <input
      class="choosefile"
      ref="choosefile"
      type="file"
      @change="onChange()"
    />
    <el-button type="primary" @click="open">选择文件</el-button>
  </span>
</template>
<script>
//import { getTextFromImage } from '@/api/util/request.js'
//import { nornmalizeData } from '@/api/util/utils.js'

export default {
  data() {
    return {
      file: null,
    };
  },
  methods: {
    open() {
      this.file.click();
    },
    onChange() {
      let selectFiles = this.file.files[0];
      if (selectFiles) {
        this.$emit("finished", selectFiles);
      } else {
        
        this.$message('do not select any file' )
        return
      }
    },
  },
  mounted() {
    this.file = this.$refs.choosefile;
  },
};
</script>
<style lang="scss" scoped>
.choosefile {
  display: none;
}
</style>