<template>
       <el-container>
      <el-aside class="aside" width="200px">
        <el-menu
          router
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#409EFF"
        >
          <el-menu-item index="topicextraction">
            <i class="el-icon-view"></i>
            <span slot="title">指标提取</span>
          </el-menu-item>

          <el-menu-item index="tablerebuild">
            <i class="el-icon-s-grid"></i>
            <span slot="title">表格结构重建</span>
          </el-menu-item>
          <el-menu-item index="standpair">
            <i class="el-icon-document"></i>
            <span slot="title">文件引用分析</span>
          </el-menu-item>
          <el-menu-item index="4">
            <i class="el-icon-document"></i>
            <span slot="title">通用文字识别</span>
          </el-menu-item>
          <el-menu-item index="satndclasscification">
            <i class="el-icon-search"></i>
            <span slot="title">指标领域匹配</span>
          </el-menu-item>
          <el-menu-item index="uploader">
            <i class="el-icon-upload"></i>
            <span slot="title">文件上传</span>
          </el-menu-item>
           <!-- <el-submenu index="informationsearch">
          <template slot="title">
           <i class="el-icon-upload"></i>
            <span slot="title">信息检索</span>
            </template>
           <el-menu-item index="Informationsearch">
            <i class="el-icon-search"></i>
            <span slot="title">标准检索</span>
          </el-menu-item>
          <el-menu-item index="Informationsearch">
            <i class="el-icon-search"></i>
            <span slot="title">专家检索</span>
          </el-menu-item>
          <el-menu-item index="Informationsearch">
            <i class="el-icon-search"></i>
            <span slot="title">起草文件检索</span>
          </el-menu-item>
        </el-submenu> -->
         <el-menu-item index="Informationsearch">
            <i class="el-icon-search"></i>
            <span slot="title">信息检索</span>
          </el-menu-item>
           <el-menu-item index="grenerateTree">
            <i class="el-icon-upload"></i>
            <span slot="title">树形数据生成</span>
          </el-menu-item>
          <el-menu-item index="parserLaTex">
            <i class="el-icon-upload"></i>
            <span slot="title">解析LaTex</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        
        <el-main> 
      
        </el-main>
      </el-container>
    </el-container>
</template>



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
    