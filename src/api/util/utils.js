import XLSX from '../../../node_modules/xlsx/xlsx.js'
function arr2str(arr) {
    let str = ''
    if (!Array.isArray(arr)) {
        return arr
    } else {
        for (let i = 0; i < arr.length; i++) {
            str += arr[i]
        }
    }
    return str
}

//  function getTextFromImage(image_path){//返回对象型数组
//      const url =  'https://api.textin.com/robot/v1.0/api/text_recognize_3d1'
//      var image = fs.readFileSync(image_path)
//      let reslut = []
//      const appId = '76510b92e944ca60ebdfa402962526fc'
//      const secretCode = '1ea0268c460a9affd2b24c42dff71585'
//      request({
//         url: url,
//         method: 'POST',
//         headers: {
//             'x-ti-app-id': appId,
//             'x-ti-secret-code': secretCode
//         },
//         body: image
//     }, function(error, response, body,reslut) {
//         if (!error && response.statusCode === 200) {
//             // 请求成功的处理逻辑

//             ret = JSON.parse(body)
//             ret = ret.result||{}
//             // ret.lines.forEach(element => {
//             //     console.log(element.text)
//             // });

//             nornmalizeData(ret.lines)

//         }
//     })
//    return reslut
//  }
function isIncludingStartText(str, model, isWIithName) {//匹配返回非空;model:1.2.3or3.3；isWIithName为true表示标题与术语名在同一个位置
    //const reg = /(\d+(\.)?){2,}/g//注1:、注2:也被算作开头的愿因:原正则表达式匹配到了"1"，将"1"当作了1.x.x(术语开头)
    let reg//只匹配3.3.1
    if (model === '三级标题') {
        reg = /\d+\.\d+\.\d+\.*/
    }//没有汉字时
    if (model === '二级标题') {
        reg = /\d{1,2}\.\d{1,2}/
        if (isWIithName) {
            //  reg = /\d+\.\d+\s*\d*[\u4e00-\u9fa5]+/g//匹配3.1 汉字
            reg = /\d{1,2}\.\d{1,2}/
        }

    }//[\u4e00-\u9fa5]匹配汉字
    //const chinese_reg = /(([\u4e00-\u9fa5]+)-*)+(\([\u4e00-\u9fa5]+\))*/g
    const chinese_reg = /([\u4e00-\u9fa5]+)-*/g
    const GB_reg = /GB\/T\s*\d{1,7}\.?\d*(-\d{1,})?/
    let result, chinese_result//新判断方法，如果匹配/(\d+(\.)?)+(\s){1}/g那就比较这行文本总长度是否等于/(\d+(\.)?)+(\s){1}/g匹配结果
    let result_str = ''//匹配结果字符
    let GB_result
    let chinese_result_text = ''
    result = str.match(reg) === null ? [] : str.match(reg)//match返回一个数组;reg表达式匹配1.3.2
    // console.log(result)
    GB_result = str.match(GB_reg) === null ? [] : str.match(GB_reg)
    chinese_result = str.match(chinese_reg) === null ? [] : str.match(chinese_reg)
    chinese_result_text = arr2text(chinese_result)
    result_str = result.length > 0 ? result[0] : '' //reulst[0]表示不管匹配多少个，选第一个做比较
    if (!isWIithName) return result_str.length === str.length
    return result_str.length === str.length || (result.length && chinese_result.length && !GB_result.length && (chinese_result_text.length <= 9))//result&&chinese_result表示既有中文文本长度小于10又有1.2.3且不包含GB/T(这样武断地判断汉字个数小于9即认为是标题难免会导致识别错误,但这也是没有办法精确地匹配术语开头的无奈之举)
}
export function dataPreProcess(str){
    let text
    text = str.replace(/（/g, '(')
    text = text.replace(/）/g, ')')
    text = text.replace(/／/g, '/')
    text = text.replace(/—/g, '-')
    return text
}
export function nornmalizeData(ocr_results, model, isWIithName) {//ocr_results对象型数组
    let results = []//返回结果数组，二维结构
    let item_arr = []//单个术语数组
    let reg = /(([\u4e00-\u9fa5]+)-*)+(\s*\([\u4e00-\u9fa5]+\))*/g
    //let reg = /(([\u4e00-\u9fa5]+)-*)+(\\([\u4e00-\u9fa5]+\\))*/g//[\u4e00-\u9fa5]匹配汉字
    //let eng_reg = /([a-z]+(-|\s)?)+(\s*[a-z]+)*(\s*[\(()][^\))]+[\))])*/g
    // let eng_reg = /([a-z]+(-|\s)?)+(\s*[a-z]+)*(\s*\([a-z]+(-|\s)?)+(\s*[a-z]+\))*/g//估计是正则错误
    var integration_result = intergrationWithSamePosition(ocr_results)
    let eng_reg = /([a-z]+(-|\s)?)+(\s*[a-z]+)*/g
    
    const arr2obj = (item_arr) => {
        let i = 0
        let details = ''
        //let chinese_character_arr
        let start_str
        // let GB_str
        var obj = Object.create(null)
        var start_reg = model === '三级标题' ? /\d+\.\d+\.\d+\.*/g : isWIithName ? /\d+\.\d+\s{0,7}[\u4e00-\u9fa5]+/g : /\d{1,2}\.\d{1,2}/g//为什么{2,}(2或无穷次)?因为有时候没有空格如3.3.3
        var GB_reg = /GB\/T\s*\d+\.?(\d)+(-\d+)*/g
        for (i; i < item_arr.length; i++) {
            if (!item_arr[i].length) break
            //chinese_character_arr = item_arr[i].match(reg)===null?[]:item_arr[i].match(reg)
            start_str = item_arr[i].match(start_reg) === null ? [] : item_arr[i].match(start_reg)
            // GB_str = item_arr[i].match(GB_reg)===null?[]:item_arr[i].match(GB_reg)
            if (start_str.length && start_str[0].length === item_arr[i].length) {//不包含汉字则跳过一行全是1.2.4处理分支；为什么要这样写?不这样写可能会遇到3.3.3在句子中被匹配到
                if (model === '三级标题') {
                    obj.topic = start_str.length > 0 ? start_str[0] : ''
                    obj.chinese_term = item_arr[i + 1].match(reg).length > 1 ? item_arr[i + 1].match(reg)[0] + item_arr[i + 1].match(reg)[1] : item_arr[i + 1].match(reg)[0]
                    obj.english_term = arr2str(item_arr[i + 1].match(eng_reg))
                    // console.log(item_arr[i+1].match(eng_reg))//单词识别错误还是ocr返回不在同一行上
                    i += 2//将循环变量加一，防止break时变量不增加
                    break
                } else {
                    if (!isWIithName) {
                        obj.topic = start_str.length > 0 ? start_str[0] : ''
                        obj.chinese_term = item_arr[i + 1].match(reg).length > 1 ? item_arr[i + 1].match(reg)[0] + item_arr[i + 1].match(reg)[1] : item_arr[i + 1].match(reg)[0]
                        obj.english_term = arr2str(item_arr[i + 1].match(eng_reg))
                        i += 2//将循环变量加二，防止break时变量不增加
                        break
                    }
                    obj.topic = start_str.length > 0 ? start_str[0] : ''
                    obj.chinese_term = item_arr[i].match(reg).length > 1 ? item_arr[i].match(reg)[0] + item_arr[i].match(reg)[1] : item_arr[i].match(reg)[0]
                    obj.english_term = arr2str(item_arr[i].match(eng_reg))
                    i += 1//将循环变量加一，防止break时变量不增加
                    break
                }

            }
            if (item_arr[i].match(start_reg) && item_arr[i].match(reg) && !item_arr[i].match(GB_reg) && model === '三级标题') {//同时包括1.1.2和汉字
                obj.topic = start_str.length > 0 ? start_str[0] : ''
                obj.chinese_term = item_arr[i].match(reg).length > 1 ? item_arr[i].match(reg)[0] + item_arr[i].match(reg)[1] : item_arr[i].match(reg)[0]
                obj.english_term = arr2str(item_arr[i].match(eng_reg))
                i++//将循环变量加一，防止break时变量不增加
                break
            }
            if (item_arr[i].match(start_reg) && !item_arr[i].match(GB_reg) && model === '二级标题') {//同时包括1.1.2和汉字
                obj.topic = start_str.length > 0 ? start_str[0] : ''
                obj.chinese_term = item_arr[i].match(reg).length > 1 ? item_arr[i].match(reg)[0] + item_arr[i].match(reg)[1] : item_arr[i].match(reg)[0]
                obj.english_term = arr2str(item_arr[i].match(eng_reg))
                i++//将循环变量加一，防止break时变量不增加
                break
            }

        }

        for (i; i < item_arr.length; i++) {
            details += item_arr[i]

        }
        obj.details = details
        console.log(obj)
        return obj
    }
    for (let i = 0; i < integration_result.length; i++) {
        let element = integration_result[i]

        if (isIncludingStartText(dataPreProcess(element.text), model, isWIithName)) {//非空数组；说明又遇到新的一个数组成员开头；判断开头也是正确的
            if (item_arr.length > 0) {//不是非首术语开头；大于零说明之前有数据了
             //   console.log(item_arr)
                results.push(arr2obj(item_arr))
                item_arr.splice(0, item_arr.length);//没有成功清空数组?yes
            }
            if (item_arr.length === 0) {//当再遇到开头且results长度为0，说明第一个术语；再遇到开头时没有压入item_arr中
                //item_arr.push(element.text)//为什么只压入第一个?
                Array.prototype.push.call(item_arr, dataPreProcess(element.text))//为什么遇到新开头时没有push进
                //为什么这个分支只执行一次?
            }

        }
        else {//说明是不含1.2.3等类型
            item_arr.push(dataPreProcess(element.text)) //术语尾；这里的压入没错
        }
    }

    if (item_arr.length > 0) {
        results.push(arr2obj(item_arr))
    }

    return results
}
function arr2text(arr) {
    var text = ''
    if (!Array.isArray(arr)) {
        console.error('arr is not a array')
        return
    } else {
        for (let i = 0; i < arr.length; i++) {
            text += arr[i]
        }
    }
    return text

}
export function exportExcel(excel_name, excel_data) {
    var sheet = XLSX.utils.json_to_sheet(excel_data)
    var blob = sheet2blob(sheet)
    createDownload(blob, excel_name)
}
function createDownload(url, file_name) {
    if (typeof url == 'object' && url instanceof Blob) {
        url = window.URL.createObjectURL(url)
    }
    var aLink = document.createElement('a')
    aLink.href = url
    aLink.download = file_name || ''
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
    window.URL.revokeObjectURL(url);
}
function sheet2blob(sheet, sheetName) {
    sheetName = sheetName || 'sheet1';
    var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
    };
    workbook.Sheets[sheetName] = sheet;
    // 生成excel的配置项
    var wopts = {
        bookType: 'xlsx', // 要生成的文件类型
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary'
    };
    var wbout = XLSX.write(workbook, wopts);
    var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    // 字符串转ArrayBuffer
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    return blob;
}
export function intergrationWithSamePosition(input_arr) {
    let results = []
    let obj = {}
    const isSameLine = (line1, line2) => {//line1,line2都是对象
        let first_y1 = line1.position[3]
        let first_y2 = line1.position[5]
        let sencond_y1 = line2.position[3]
        let sencond_y2 = line2.position[5]
        return (Math.abs(first_y1 - sencond_y1)) <= 5 && (Math.abs(first_y2 - sencond_y2)) < 5
    }
    if (!Array.isArray(input_arr)) {
        console.error('input_arr is not a arrary')
        return
    }
    obj.text = input_arr[0].text

    for (let i = 1; i < input_arr.length; i++) {
        if (isSameLine(input_arr[i - 1], input_arr[i])) {
            obj.text += input_arr[i].text
            //console.log(obj.text)//只输出文本是因为obj.text本身就是一个文本
        }
        if (!isSameLine(input_arr[i - 1], input_arr[i])) {//当前检测文本与前一文本不在同一行时，将整合后的文本压入栈中
            results.push(obj)
            obj = {}//清空对象
            obj.text = input_arr[i].text
        }
    }
    results.push(obj)//之前bug是少了一行，原因是最后一行未处理(压入栈中)
    //   console.log(results)
    return results
}
export function textIntegration(ocr_results) {//ocr_results文本数组
    let results = []
    let item_arr = []
    results = intergrationWithSamePosition(ocr_results)
    var start_reg = /\d+\.\d+\.\d+/g
    for (let i = 0; i < results.length; i++) {
        if (isStartText(results[i].text, start_reg)) {
            if (item_arr.length > 0) {
                results.push(item_arr)
            }
            if (item_arr.length === 0) {
                item_arr.push(results[i].text)
            }
        } else {
            item_arr.push(results[i].text)
        }
    }
    return results

}
function isStartText(text, reg) {
    let reg_result = text.match(reg)
    reg_result === null ? [] : reg_result
    return reg_result.length
}
// function isIncludingStartText(str, model, isWIithName){
//     var topic_reg = //g
// }
export function readExcelFile(file) {
    var reader = new FileReader()
    reader.onload = (event) => {
        const { result } = event.target

        const workbook = XLSX.read(result, { type: 'binary' })

        let data = []
        for (let sheet in workbook.Sheets) {
            if (Object.prototype.hasOwnProperty.call(workbook.Sheets, sheet)) {
                data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]))

                for (let i = 0; i < data.length; i++) {
                    delete data[i].省份
                    delete data[i].起草单位排序
                }
                let result_arr = arrayUnique(data)
                exportExcel('process.xlsx', result_arr)

            }
        }
    }
    reader.readAsBinaryString(file);
}
// function isSameObject(obj1,obj2){
//    let result = true
//    for(let key in obj1){
//        if(obj1[key]!=obj2[key]){
//         result = false
//         break
//        }
//    }
//    return result
// }
function arrayUnique(arr) {
    // let current_obj = {}
    // let number_epoch = 20
    // let j = 0
    let resul_arr = []
    for (let i = 0; i < arr.length - 20; i++) {//依然需要两层循环
        // current_obj = arr[i]
        // for(j;j < number_epoch;j++){//问题在j=i+1,j会大于number_epoch

        //     if(isSameObject(current_obj,arr[i+j+1])){
        //         console.log(arr[j])
        //         arr.splice(i+j+1,1)//删除元素
        //     }
        // }
        // j = 0
        // if(JSON.stringify(arr[i])===JSON.stringify(arr[i+1])){
        //     continue
        // }else{
        //     resul_arr.push(arr[i])
        // }
        if (arr[i].标准号 === arr[i + 1].标准号 && arr[i].标准名称 === arr[i + 1].标准名称) {
            continue
        } else {
            resul_arr.push(arr[i])
        }

    }
    return resul_arr
}
export function readJson(file) {
    if(!file){
        console.error('file is a effective value')
        return 
    }
    let reader = new FileReader()
    reader.onload = (e) => {
        const result = e.target.result
        let json_result = JSON.parse(result)
        exportExcel('result.xlsx',json_result)

    }
    reader.readAsText(file)
}
export function integrationTextRow(reg=/GB\/T\s*\d{1,7}\.?\d*(-\d{1,})?/g,text_arr){//文本行合并成数组
    let i = 0
    let str_start_index = -1//字符串开始位置
    let reg_text = ''//匹配内容文本
    let item_arr = []
    let reg_result_arr = []
    if(!Array.isArray(text_arr)) return
    for(i;i<text_arr.length;i++){
        str_start_index = -1//初始化
        reg_result_arr = text_arr[i].match(reg)===null?[]:text_arr[i].match(reg)
        reg_text = reg_result_arr[0]
        str_start_index = text_arr[i].indexOf(reg_text)
        if(reg_result_arr.length&&str_start_index===0){//存在GB/T且GB/T处于开头
            if(item_arr.length){//说明新段开始了
                console.log(item_arr)
                item_arr.splice(0, item_arr.length)
            }
            if(!item_arr.length){
                Array.prototype.push.call(item_arr,text_arr[i])
            }
        }else{
             if(!item_arr.length) continue
            Array.prototype.push.call(item_arr,text_arr[i])
        }

    }
   console.log(item_arr)
}
export function readXLSX(file_name){//var reader = new FileReader();reader.onload = (event)=>{const {result} = this.target const workbook = XLSX.read(result,{binary:""}) }
    var reader = new FileReader()
    let data = []
    new Promise((resolve)=>{
        reader.onload = (event) => {
            const { result } = event.target
            const workbook = XLSX.read(result, { type: 'binary' })
            //console.log(workbook)
            for (let sheet in workbook.Sheets) {
                if (Object.prototype.hasOwnProperty.call(workbook.Sheets, sheet)) {
                    data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]))
                }
            }
            
            resolve(data)
        }
    }).then((res)=>{
        console.log(res)
        return res
    })
  
    reader.readAsBinaryString(file_name)
}