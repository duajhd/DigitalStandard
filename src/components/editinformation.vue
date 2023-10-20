<template>
  <el-form ref="form" :model="form" label-width="80px">
     <el-form-item label="标题">
      <el-input v-model="form.topic"></el-input>
    </el-form-item>
    <el-form-item label="术语中文名">
      <el-input v-model="form.chinese_term"></el-input>
    </el-form-item>
    <el-form-item label="术语英文名">
      <el-input v-model="form.english_term"></el-input>
    </el-form-item>
    <el-input
      type="textarea"
      :rows="10"
      placeholder="请输入内容"
      v-model="form.details"
    >
    </el-input>
    <el-row>
  <el-button @click="cancelEdit">取消</el-button>
  <el-button type="primary" @click="saveChange">保存</el-button>
  
</el-row>

  </el-form>
</template>
<script>
export default {
  props: {
    propsrow: {
      required: true,
      type: Object,
      default: () => {
        return {};
      },
    },
    
  },
  data() {
    return {
      row: {},
      
      form: {
        index:0,
        topic:'',
        chinese_term: "",
        english_term: "",
        details:""
      },
    };
  },
  methods:{
    saveChange(){
      
      this.$emit('dataChange',this.form)
    },
    cancelEdit(){
      this.$emit('cancelEdit')
    }
  },
  mounted() {
    this.row = this.propsrow;
    this.form.topic = this.row.topic;
    this.form.index = this.row.index;
    this.form.details = this.row.details;
    this.form.chinese_term = this.row.chinese_term;
    this.form.english_term = this.row.english_term;
  },
  watch: {
    propsrow: {
      handler(val) {
        this.row = val;
        this.form.topic = this.row.topic;
        this.form.details = this.row.details;
        this.form.chinese_term = this.row.chinese_term;
        this.form.english_term = this.row.english_term;
      },
    },
    
  },
};
</script>
