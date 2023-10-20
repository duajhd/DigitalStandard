<template >
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-input v-model="input" placeholder="输入标准号或者专家名"></el-input>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="search">搜索</el-button>
      </el-col>
      <el-col :span="1">
        <SelectFile @finished="finished"></SelectFile>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-radio-group v-model="radio">
          <el-radio :label="3">标准</el-radio>
          <el-radio :label="6">专家信息</el-radio>
          <el-radio :label="9">起草文件</el-radio>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-table
      :data="tableData"
      border
      v-show="radio === 3"
      style="width: 100%"
      height="500"
      checkbox
    >
      <el-table-column prop="标准中文名称" label="标准中文名称">
      </el-table-column>
      <el-table-column prop="标准英文名称" label="标准英文名">
      </el-table-column>
      <el-table-column prop="简介" label="简介"> </el-table-column>
      <el-table-column prop="主要起草人" label="主要起草人"></el-table-column>
      <el-table-column prop="标准号" label="标准号"> </el-table-column>
      <el-table-column prop="发布日期" label="发布日期"> </el-table-column>
      <el-table-column prop="实施日期" label="实施日期"> </el-table-column>
      <el-table-column prop="中国标准分类号" label="中国标准">
      </el-table-column>
      <el-table-column prop="国际标准分类号" label="国际标准">
      </el-table-column>
      <el-table-column prop="归口单位" label="归口单位"> </el-table-column>
      <el-table-column prop="执行单位" label="执行单位"> </el-table-column>
      <el-table-column prop="主管部门" label="主管部门"> </el-table-column>
      <el-table-column prop="全部替代标准" label="全部替代标准">
      </el-table-column>
      <el-table-column prop="标准状态" label="标准状态">
        <template slot-scope="scope">
          <el-tag
            :type="
              scope.row.标准状态 === '现行'
                ? 'success'
                : scope.row.标准状态 === '即将实施'
                ? 'primary'
                : scope.row.标准状态 === '被代替'
                ? 'info'
                : 'danger'
            "
            disable-transitions
            >{{ scope.row.标准状态 }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="标准属性" label="标准属性"> </el-table-column>
    </el-table>
    <el-table :data="tableData_prof" border v-show="radio === 6" style="width: 100%">
      <el-table-column prop="专家id" label="专家id" width="180">
      </el-table-column>
      <el-table-column prop="专家名" label="专家名" width="180">
      </el-table-column>
      <el-table-column prop="委员会" label="委员会"> </el-table-column>
      <el-table-column prop="专业领域" label="专业领域"> </el-table-column>
    </el-table>
    <el-table :data="table_file" border v-show="radio === 9" style="width: 100%">
      <el-table-column prop="专家id" label="专家id" > </el-table-column>
      <el-table-column prop="专家名" label="专家名" > </el-table-column>
      <el-table-column prop="专业范围" label="专业范围"> </el-table-column>
      <el-table-column prop="擅长领域" label="擅长领域"> </el-table-column>
      <el-table-column prop="委员会名称" label="委员会名称"> </el-table-column>
      <el-table-column prop="委员会职务" label="委员会职务"> </el-table-column>
      <el-table-column prop="加入时间" label="加入时间"> </el-table-column>
      <!-- <el-table-column prop="" label=""> </el-table-column>
      <el-table-column prop="" label=""> </el-table-column>
      <el-table-column prop="" label=""> </el-table-column>
      <el-table-column prop="" label=""> </el-table-column> -->
    </el-table>
  </div>
</template>
<script>
import SelectFile from "./SelectFile.vue";
import XLSX from "../../node_modules/xlsx/xlsx.js";
export default {
  data() {
    return {
      input: "",
      radio: "",
      tableData: [],
      tableData_prof:[],
      table_file:[]
    };
  },
  methods: {
    finished(file) {
      const that = this;
      var reader = new FileReader();
      let data = [];
      let houzui_arr = file.name.split(".");
      console.log(houzui_arr)
      let houzui = houzui_arr[houzui_arr.length - 1];
      new Promise((resolve) => {
        reader.onload = (event) => {
          const { result } = event.target;
          if (houzui === "xlsx") {
            const workbook = XLSX.read(result, { type: "binary" });
            for (let sheet in workbook.Sheets) {
              if (
                Object.prototype.hasOwnProperty.call(workbook.Sheets, sheet)
              ) {
                data = data.concat(
                  XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
                );
              }
            }
          }else{
            data = JSON.parse(result)
          }

          resolve(data);
        };
      }).then((res) => {
       
        that.data = res;
        if(that.radio===9){
          that.$set(that.table_file,0,res[0])
        }
        if(that.radio===6){
          that.$set(that.tableData_prof,0,res[0])
        }
        
        if(that.radio===3){
           console.log(that.radio)
          that.$set(that.tableData,0,res[0])
        }
      });
      if(houzui === "xlsx"){
        reader.readAsBinaryString(file)
      }else{
         reader.readAsText(file)
      }
      
    },
    search() {
      //console.log(this.tableData[0])
      let result = [];
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].标准号 === this.input) {
          result.push(this.data[i]);
        }
      }
      if (result.length === 0) {
        this.$message("2");
      } else {
        for (let i = 0; i < result.length; i++) {
          this.$set(this.tableData, i, result[i]);
        }
      }
    },
  },
  components: {
    SelectFile,
  },
};
</script>
<style lang="scss">
</style>