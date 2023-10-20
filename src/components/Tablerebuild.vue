<template>
    <div>
        <SelectFile @finished="finishrecogniton"></SelectFile>
    </div>
</template>
<script>
import SelectFile from "@/components/SelectFile.vue";
import { getExcelFromImage } from '@/api/util/request.js'
export default{
    data(){
        return {

        }
    },
    methods:{
    finishrecogniton(file) {
     
      getExcelFromImage(file)
    },
    },
    components:{
        SelectFile
    }
}
</script>
<style lang="scss" scoped>

</style>

