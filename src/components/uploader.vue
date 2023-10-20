<template>
  <div>
   
  </div>
</template>
<script>
export default {
  data() {
    return {
      options: {
        target: "/file/fdfs/multipart-upload/chunkUpload", //即分片上传的URL
        chunkSize: 10 * 1024 * 1024, //分片大小
        simultaneousUploads: 3, //并发上传数，默认 3
        testChunks: true, //是否开启服务器分片校验
        checkChunkUploadedByResponse: function (chunk, res) {
          // 服务器分片校验函数，秒传及断点续传基础
          //需后台给出对应的查询分片的接口进行分片文件验证
          let objMessage = JSON.parse(res); //skipUpload、uploaded 需自己跟后台商量好参数名称
          if (objMessage.skipUpload) {
            return true;
          }
          return (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0;
        },
        maxChunkRetries: 2, //最大自动失败重试上传次数
        headers: {
          //在header中添加token验证，Authorization请根据实际业务来
          getUploadHeaders() {},
        },
        processParams(params) {
          //自定义每一次分片传给后台的参数，params是该方法返回的形参，包含分片信息,
          //若不自定义则默认会把文件所有参数传给后台，自己可以通过接口查看插件本身传递的参数
          return {
            //返回一个对象，会添加到每一个分片的请求参数里面
            totalChunks: params.totalChunks,
            identifier: params.identifier,
            chunkNumber: params.chunkNumber,
            chunkSize: 10 * 1024 * 1024,
            //  这是我跟后台约定好的参数，可根据自己项目实际情况改变
          };
        },
      },
    };
  },
  methods: {
    onFileAdded(file, fileList) {
      file.pause();
      if (file.getType() != "zip") {
        EventBus.$emit("alert.show", {
          type: "warning",
          msg: `只能上传.zip格式的文件`,
        });
        file.ignored = true; //文件校验，不符规则的文件过滤掉
        // file.cancel()
        // return false;
      } else if (file.size <= 800 * 1024 * 1024) {
        EventBus.$emit("alert.show", {
          type: "warning",
          msg: `请上传800M以上的文件`,
        });
        file.ignored = true; //文件过滤
      } else if (this.fileList.length >= 10) {
        EventBus.$emit("alert.show", {
          type: "warning",
          msg: `最多上传10份文件`,
        });
        file.ignored = true; //文件过滤
      } else {
        // 新增文件的时候触发，计算MD5
        this.myMD5(file);
      }
    },
    onFileSuccess(rootFile, file, response, chunk) {
      //文件成功的时候触发
      let index = this.findFileById(file.uniqueIdentifier);
      let res = JSON.parse(response);
      if (res.result === "上传成功") {
        this.uploadingFileStr(res.path, getUploadHeaders()).then((ress) => {
          if (ress.data.msgCode === 1) {
            if (index > -1) {
              this.fileList[index].id = ress.data.data.id;
              this.fileList[index].resName = file.name.replace(/\.\w+$/g, "");
              this.fileList[index].name = file.name;
              this.fileList[index].filePath = null;
              this.fileList[index].coverPath = null;
              this.fileList[index].progress = 100;
              this.fileList[index].status = "success";
              this.fileList[index].state = 1;
              this.fileList[index].isPlayOrPause = false;
              this.fileList[index].showPP = false;
              this.expandCollapse(file.uniqueIdentifier);
            }
          } else {
            EventBus.$emit("alert.show", { type: "error", msg: res.result });
            if (index > -1) {
              this.fileList[index].status = "fail";
              this.fileList[index].state = 2;
              this.fileList[index].isPlayOrPause = false;
              this.fileList[index].showPP = false;
            }
          }
        });
      }
    },
    onFileError(rootFile, file, response, chunk) {
      let res = JSON.parse(response);
      EventBus.$emit("alert.show", { type: "error", msg: res.result });
      let index = this.findFileById(file.uniqueIdentifier);
      if (index > -1) {
        this.fileList[index].status = "fail";
        this.fileList[index].state = 2;
        this.fileList[index].isPlayOrPause = false;
        this.fileList[index].showPP = false;
      }
    },
    onFileProgress(rootFile, file, chunk) {
      let index = this.findFileById(file.uniqueIdentifier),
        p = Math.round(file.progress() * 100);
      if (index > -1) {
        if (p < 100) {
          this.fileList[index].progress = p;
        }
        this.fileList[index].status = file.status;
      }
    },
    myMD5(file) {
      //这里主要是使用MD5对文件做一个上传的查重
      let md5 = "";
      md5 = SparkMD5.hash(file.name); //业务需求以文件名作为加密
      let index = this.findFileById(md5);
      if (index == -1) {
        file.uniqueIdentifier = md5;
        this.fileList.push({
          id: null,
          uid: file.uniqueIdentifier,
          filePath: "",
          coverPath: "",
          name: file.name,
          resName: "",
          progress: 0,
          state: 0,
          status: "",
          isPlayOrPause: true,
          showPP: true,
          elMD5: md5, //多余的参数可注释
        });
        //继续上传文件
        file.resume();
      } else {
        EventBus.$emit("alert.show", {
          type: "warning",
          msg: `该文件已上传至列表，请勿重复上传`,
        });
        file.ignored = true; //文件过滤
      }
    },
    playFile(e, f) {
      e.stopPropagation();
      f.isPlayOrPause = true;
      const uploaderInstance = this.$refs.uploader.uploader;
      let index = uploaderInstance.fileList.findIndex(
        (e) => e.uniqueIdentifier === f.uid
      ); //兼容点击上传按钮
      uploaderInstance.fileList[index].resume();
    },
    pauseFile(e, f) {
      e.stopPropagation();
      f.isPlayOrPause = false;
      const uploaderInstance = this.$refs.uploader.uploader;
      let index = uploaderInstance.fileList.findIndex(
        (e) => e.uniqueIdentifier === f.uid
      );
      uploaderInstance.fileList[index].pause();
    },
  },
};
</script>
