<template>
  <div>
    <el-row>
      <el-col>
        <SelectFile @finished="finishrecogniton"></SelectFile>
        <el-radio v-model="radio" label="三级标题">三级标题</el-radio>
        <el-radio v-model="radio" label="二级标题">二级标题</el-radio>
        <el-checkbox v-model="checked">标题和术语名是否在同一行</el-checkbox>
        <el-tooltip
          class="item"
          effect="dark"
          content="新建行"
          placement="top-start"
        >
          <el-button
            circle
            icon="el-icon-circle-plus-outline"
            @click="createRow"
          ></el-button>
        </el-tooltip>
        <el-button type="success" @click="openEditDia">导出为excel</el-button>
      </el-col>
    </el-row>
    <el-table
      :cell-style="{ height: '40px' }"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      v-loading="loading"
      border
      height="455"
    >
      >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column prop="index" label="index" width="180">
      </el-table-column>
      <el-table-column prop="topic" label="topic" width="180">
      </el-table-column>
      <el-table-column prop="chinese_term" label="chinese_term" width="180">
      </el-table-column>
      <el-table-column prop="english_term" label="english_term">
      </el-table-column>
      <el-table-column prop="details" label="details" width="180">
      </el-table-column>

      <el-table-column prop="action" label="action">
        <template slot-scope="scope">
          <el-button
            @click="editData(scope.$index, scope.row)"
            type="primary"
            icon="el-icon-edit"
            circle
            >{{ scope.chinese_term }}
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            circle
            @click="deleteRow(scope.$index)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="提示" :visible.sync="dialogVisible" width="40%">
      <edit-information
        :propsrow="current_selected_row"
        @dataChange="diaDataChange"
        @cancelEdit="cancelEdit"
      ></edit-information>
    </el-dialog>
    <el-dialog title="编辑文件名" :visible.sync="file_name_edit" width="30%">
      <el-row>
        <span>输入文件名</span>
        <el-input v-model="excel_name" placeholder="请输入内容"></el-input>
      </el-row>

      <el-row class="dia_action">
        <el-button @click="closeNameDia">取消</el-button>
        <el-button type="primary" @click="exportToExcel">确定</el-button>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import SelectFile from "@/components/SelectFile.vue";
import editInformation from "@/components/editinformation.vue";
import { exportExcel } from "@/api/util/utils.js";
import { getTextFromImage } from "@/api/util/request.js";
import { nornmalizeData } from "@/api/util/utils.js";
export default {
  data() {
    return {
      tableData: [], //一打开新行，上一行就消失
      selectedRow: [], //表格选中的行
      radio: "三级标题",
      dialogVisible: false,
      current_selected_row: {},
      current_row_index: 0,
      checked: true,
      ocr_result: {},
      file_name_edit: false, //excel文件名编辑对话框
      excel_name: "",
      loading:false
    };
  },
  methods: {
    finishrecogniton(file) {
      this.loading = true
      const callback = (result) => {
        
        if (result.data.code === 40304) {
          this.$message("图片尺寸不符，图像宽高须介于 20 和 10000（像素）之间");
          return;
        }
        this.ocr_result = result;
        let nomal_result = nornmalizeData(
          this.ocr_result.data.result.lines,
          this.radio,
          this.checked
        );
        this.tableData = this.extractionTopic(nomal_result);
        this.loading = false
      };
      getTextFromImage(file, callback.bind(this));
    },
    editData(index, row) {
      //点击一个会修改上一个

      this.current_selected_row = row;
      this.current_row_index = index;
      this.dialogVisible = true; //锁定修改
    },
    exportToExcel() {
      if (!this.tableData.length) return;
      exportExcel(`${this.excel_name}.xlsx`, this.selectedRow);
      this.closeNameDia(); //关闭编辑文件名对话框
    },
    closeNameDia() {
      this.file_name_edit = false;
    },
    openEditDia() {
      //打开excel名编辑对话框
      if (!this.selectedRow.length) {
        this.$message("没有数据可以导出");
        return;
      }
      this.file_name_edit = true;
    },
    createRow() {
      var new_row = Object.create(null);
      new_row.index = this.tableData.length + 1;
      this.tableData.push(new_row);
    },
    extractionTopic(tableData) {
      //规范化表格
      var reg = /(\d+\.*)+/g;
      let i = 0;
      for (i; i < tableData.length; i++) {
        tableData[i].index = i + 1;
        if (tableData[i].topic) {
          tableData[i].topic =
            tableData[i].topic.match(reg).length > 0
              ? tableData[i].topic.match(reg)[0]
              : "";
        }
      }
      return tableData;
    },
    handleClose() {
      this.$children;
    },
    diaDataChange(newdata) {
      //上一行会空的原因，选中空行时current_selected_row会变为{}这时information组件会监控到数据改变从而派发出一个空对象

      console.log(this.current_row_index);
      this.tableData[this.current_row_index].topic = newdata.topic;
      this.tableData[this.current_row_index].details = newdata.details;
      this.tableData[this.current_row_index].chinese_term =
        newdata.chinese_term;
      this.tableData[this.current_row_index].english_term =
        newdata.english_term;
      this.closeDataChangeDia();
    },
    handleSelectionChange(val) {
      this.selectedRow = val;
    },
    closeDataChangeDia() {
      this.dialogVisible = false;
    },
    deleteRow(index) {
      //删除当前行
      this.current_row_index = index;
      this.tableData.splice(this.current_row_index, 1);
      this.updateIndex()
    },
    cancelEdit() {
      //编辑对话框取消按钮点击
      this.closeDataChangeDia();
    },
    updateIndex(){
       this.tableData.forEach((item,index)=>{
         item.index = index+1
       })
    }
  },
  components: {
    SelectFile,
    editInformation,
  },
};
</script>
<style lang="scss" scoped>
.choosefile {
  display: none;
}
.el-table {
  .cell {
    height: 30px;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: red;
  }
}
.dia_action {
  margin-top: 10px;
}
</style>