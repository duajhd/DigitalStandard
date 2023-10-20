<template>
  <div>
    <SelectFile @finished="finished"></SelectFile>
    <el-tree :data="data"></el-tree>
  </div>
</template>
<script>
import SelectFile from "./SelectFile.vue";
import x2js from "x2js";
import {latexParser} from "latex-parser";
// const generateGraphicData = (obj,parentNodeName="")=>{
//   let nodes = []
//   let links = []
//   for(const key in obj){
//       if(key === ''){
//         continue
//       }
//       if(Object.prototype.toString.call(obj[key]) === "[object Object]"){
//           nodes.push({name:`${key}`,symbolSize: 50,category: '对象'})
//           links.push({source:`${key}`,target:`${parentNodeName}`,name:obj[key],des:''})
//       }else{
//         nodes.push({name:`${key}`,symbolSize: 50,category: '属性',des:''})
//       }
      
//   }
// }
export default {
  data() {
    return {
      data: [],
    };
  },
  methods: {
    finished(file) {
      const tokens = latexParser.parse("hello \\author[opt]{name}");
      console.log(tokens)
      var _that = this;
      var reader = new FileReader();
      reader.onload = (event) => {
        let resultObj = {};
        const { result } = event.target;
        const x2jsone = new x2js(); //实例
        //str是接口返回的数据
        const xml = x2jsone.xml2js(result); //解析
        _that.createTree(xml.root.element, resultObj, "");
        console.log(resultObj);
        console.log(xml); //打印
        _that.data = resultObj.children;
      };
      reader.readAsText(file);
    },
    createTree(json_obj, parentNode, level) {
      //1,2,3...,1-1;直接往后加数字
      if (JSON.stringify(json_obj) === "{}") return;
      parentNode.children = new Array(); //子节点变成children;为传进来的父节点创建子节点
      let index = 1;
      for (const key in json_obj) {
        //现在还差id;传进去加-;直接在后边加1
        if (key === "__text") {
          parentNode.text = json_obj[key];
          continue;
        }
        if (key === "toString") {
          parentNode.text = json_obj[key];
          continue;
        }
        let child = {}; //作为父节点
        child.label = key; //根据有没有children显示不同图标组件
        child.id = `${level}${index}`;
        parentNode.children.push(child); //插入到父节点的
        if (
          Object.prototype.toString.call(json_obj[key]) === "[object Object]"
        ) {
          this.createTree(json_obj[key], child, `${child.id}-`); //递归
        }
        index++;
      }
    },
    generateKeyValue(obj, obj_name) {
      //英文名:中文对应
      let results = [];
      if (JSON.stringify(obj) === "{}") return;
      for (const key in obj) {
        if (key === "__text") {
          let keyValue = {};
          keyValue.key = obj_name;
          keyValue.value = obj[key];
          results.push(keyValue);
        } else {
          if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
            console.log();
            results.push(...this.generateKeyValue(obj[key], `${key}`)); //递归
          }
        }
      }
      return results;
    },
    tree2JSON(tree,parentNode = {}){//树转json
    let children = tree.children//每个chilren都是对象
            for(let i = 0;i<children;i++){
                  let obj = {}
                  if(children[i].text){
                     obj.__text = children[i].text   
                  }
                  parentNode[children[i].label] = obj
                  if(children[i].children){
                        this.tree2JSON(children[i],obj)//
                  }
            }
    },
    generateXML(obj){//let xml = x2js.js2xml(groupdata);
      console.log(obj)
    }
  },
  components: {
    SelectFile,
  },
};
</script>
<style scoped>
</style>