<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>服务集成演示</title>
</head>
<body>

<h2>上传文件</h2>
<div>
    <input type="file" id="file">
</div>

<script>
    document.querySelector('#file').addEventListener('change', function(e) {
        var file = e.target.files[0] // 上传文件的 File 对象
        var reader = new FileReader()

        reader.readAsArrayBuffer(file) // 读取成二进制
        reader.onload = function (e) {
            var fileData = this.result

            var xhr = new XMLHttpRequest()
            // --------------------------------------------------------------------
            // 特别注意
            // --------------------------------------------------------------------
            // 在客户端/浏览器端储存 appId 和 secretCode 是一件风险极大的事情
            // 极易造成 appKey 和 appSecret 的泄露。
            // 非特殊情况，请勿在客户端/浏览器存储 appKey 和 appSecret。本示例代码仅供演示参考，请勿直接用于生产环境。

            // 请登录后前往 “工作台-账号设置-开发者信息” 查看 x-ti-app-id
            // 示例代码中 x-ti-app-id 非真实数据
            var appId = 'c81f*************************e9ff'
            // 请登录后前往 “工作台-账号设置-开发者信息” 查看 x-ti-secret-code
            // 示例代码中 x-ti-secret-code 非真实数据
            var secretCode = '5508***********************1c17'
            // 通用文字识别 服务URL
            var url = 'https://api.textin.com/robot/v1.0/api/text_recognize_3d1'

            xhr.open('POST', url)
            xhr.setRequestHeader('x-ti-app-id', appId)
            xhr.setRequestHeader('x-ti-secret-code', secretCode)

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    xhr.onreadystatechange = null
                    var response = xhr.response
                    var obj = {}
                    try {
                        obj = JSON.parse(response) // 转化为对象
                    } catch (e) {

                    }

                    if (!obj.result) return
                    var list = obj.result.item_list
                    if (!list || !list.length) return

                    console.log(list)
                }
            }
            xhr.send(fileData)
        }
    })

</script>
</body>
</html>
{/* var reader = new FileReader();
        reader.onload = function () {
            var byts = new Uint8Array(this.result);
            var bytarr = [];
            for (var i = 0; i < byts.length; i++) {
            bytarr.push(byts[i])
            }
          console.log(getTextFromImage(bytarr))
        };
        reader.readAsArrayBuffer(this.selectFile)//读取字节码 */}