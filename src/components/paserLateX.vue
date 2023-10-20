<template>
  <div>
    <SelectFile @finished="finished"></SelectFile>
  </div>
</template>
<script>
import SelectFile from "./SelectFile.vue";
import { latexParser } from "latex-parser";
export default {
  data() {
    return {};
  },
  methods: {
    finished(file) {
     // var _that = this;
     
      var reader = new FileReader()
      reader.onload = (e)=>{
            const { result } = e.target
            console.log(result)
            const tokens = latexParser.parse(result);
            console.log(tokens)
      }
      reader.readAsText(file)
    },
  },
  components: {
    SelectFile,
  },
};
</script>
<style scoped>
</style>