import axios from "axios";

//vue These dependencies were not found: * core-js/modules/es.array.iterator in 安装core-js@3
//axios设置请求头:import进的axios对象接收一个对象作为参数可在{method:设置方法url}
export async function requestData(url='https://api.textin.com/robot/v1.0/api/text_recognize_3d1',method='POST',requestBody){//默认为文字识别
    let appId = '76510b92e944ca60ebdfa402962526fc'
    let secretCode = '1ea0268c460a9affd2b24c42dff71585'
    let result
    if(method==='POST'){
        result = await axios.post(url,
            requestBody,
            {
                headers: {
                    'x-ti-app-id': appId,
                    'x-ti-secret-code': secretCode,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': "application/json, text/plain, */*"
                }
            })
        return result
    }
    else{
        result = await axios.get(url,
            requestBody,
            {
                headers: {
                    'x-ti-app-id': appId,
                    'x-ti-secret-code': secretCode,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': "application/json, text/plain, */*"
                }
            })
        return result
    }
    

}
export function getExcelFromImage(file) {//返回对象型数组
    var reader = new FileReader()
    reader.readAsArrayBuffer(file) // 读取成二进制
    reader.onload = function () {
        var fileData = this.result
        var appId = '76510b92e944ca60ebdfa402962526fc'
        var secretCode = '1ea0268c460a9affd2b24c42dff71585'
        var tableurl = 'https://api.textin.com/ai/service/v2/recognize/table'
        axios({
            method: 'POST',
            url: tableurl,
            params: {//设置参数
                excel: 1//excel为1表示输出为excel
            },
            data: fileData,
            headers: {
                'x-ti-app-id': appId,
                'x-ti-secret-code': secretCode
            }
        }).then((res) => {
            var raw = window.atob(res.data.result.excel);//写入的原理是什么?
            var uInt8Array = new Uint8Array(raw.length);
            for (var i = 0; i < raw.length; i++) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            const link = document.createElement("a");
            const blob = new Blob([uInt8Array], {
                type: 'application/vnd.ms-excel'
            })
            link.style.display = 'none';
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', '识别结果_' + '.xlsx');
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        })

    }
}
//    axios({
//     method: 'POST',
//     url: url,
//     data: fileData,
//     headers: {
//         'x-ti-app-id': appId,
//         'x-ti-secret-code': secretCode
//     }
// })
export function getTextFromImage(file, callback) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(file) // 读取成二进制
    reader.onload = async function () {
        var fileData = this.result
        var appId = '76510b92e944ca60ebdfa402962526fc'
        var secretCode = '1ea0268c460a9affd2b24c42dff71585'
        var url = 'https://api.textin.com/robot/v1.0/api/text_recognize_3d1'

        //         axios({
        //     method: 'POST',
        //     url: url,
        //     data: fileData,
        //     headers: {
        //         'x-ti-app-id': appId,
        //         'x-ti-secret-code': secretCode
        //     }
        // }).then(res=>{
        //     console.log(res)
        // })
        //axios.post/get返回的才是promise
        let result = await axios.post(url,
            fileData,
            {
                headers: {
                    'x-ti-app-id': appId,
                    'x-ti-secret-code': secretCode,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': "application/json, text/plain, */*"
                }
            })
     
        callback(result)
    }

}
export async function getClassifier(standard = 'GB/T 1775-2009') {
    let result
    let url = `/api?searchText=GB%2FT%20${standard}&ics=&state=&ISSUE_DATE=&sortOrder=asc&pageSize=15&pageNumber=1&_=1649420313784`
    result = await axios.get(url)
    console.log(result)
}
export async function getInterClassficationNum(standard = '71F772D7CB91D3A7E05397BE0A0AB82A') {
    let result
    let url = `http://std.samr.gov.cn/gb/search/gbDetailed?id=${standard}`
    // let url =  'http://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D7CB91D3A7E05397BE0A0AB82A'
    result = await axios.get(url)
    console.log(result)

}