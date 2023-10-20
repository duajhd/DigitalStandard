<template>
    <div>
        <SelectFile  @finished="finishrecogniton"></SelectFile>
       
    </div>
</template>
<script>
import SelectFile from "@/components/SelectFile.vue";
import { requestData } from '../api/util/request.js'
import { dataPreProcess } from '../api/util/utils.js'
import { intergrationWithSamePosition } from '../api/util/utils.js'
import { integrationTextRow } from '../api/util/utils.js'
export default {
    data(){
        return{
            text:[]
        }
    },
    methods:{
        getText(){

        },
      finishrecogniton(file){
            let reader = new FileReader()
            reader.readAsArrayBuffer(file)
            const that = this
            reader.onload = async (e)=>{
                const { result } = e.target
                let lines = []
                let processed_data = []
                let ocr_result = {}
                ocr_result = await requestData('https://api.textin.com/robot/v1.0/api/text_recognize_3d1','POST',result)
                lines = ocr_result.data.result.lines
              
                lines = intergrationWithSamePosition(lines)
                for(let i = 0;i<lines.length;i++){
                    processed_data.push(dataPreProcess(lines[i].text))
                }
               that.text = processed_data
               integrationTextRow(/GB\/T\s*\d{1,7}\.?\d*(-\d{1,})?/g,processed_data)
            }

        }
    },
    components:{
        SelectFile
    }
}
</script>