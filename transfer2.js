/*microsoft edge 专用转账脚本*/


let s_addr='0xAD94F4720927B2829666EF8Bae1e093eC6a90952'
let r_addrs=[
'0xAD94F4720927B2829666EF8Bae1e093eC6a90952',
"0x98840282a34956627FcD22E3AA139237EF8E9cBE",
"0x140d084f907973818382cFf6612A7313C928b6D4",
"0xa4EE513c0e60ED29BD8881b7e45B189CCD9cc22B",
"0x65bEa4361903AdB365c59b23d7F0FaC8472F7843",
"0xE1b291F1A5bDff53CdB75584C5bD6e5Cc6ACf4CC",
"0x14F4363d6EaC12BBCe8930dE78BBa41B29EEab88",
"0x575d4B1759c587D7b1FAC072704086e34b53e2CB",
"0x4E4498dcc77C6EDF4AF4bA7c3F3286bA3fdC3a65",
"0x3896a7f7c694511ebB86dD8295227F8a0aC01cBC",
]

/**
* 账户间转账选择器
*/
class EthAccountSelector{
    compress_str=(str)=>{
        let s = String(str)
        let s1 = s.substring(0, 6);
        let s2 = s.substring(s.length - 4, s.length)
        return s1 + '...' + s2
    }
    /**
    * 在节点列表里查找指定的eth地址索引
    * @return index
    */
    indexOf=(nodeList, address)=>{
        for(let index=0; index<=nodeList.length-1; index++){
            let temp=nodeList[index].textContent
            let s1=temp.toLocaleLowerCase()
            let adr=String(address)
            console.log("address", adr)
            let s2=this.compress_str(adr.toLocaleLowerCase())
            if (s1==s2){
                return index
            }
        }
        return -1

    }
}

class Utils {
    /**
    * 带回调的延迟函数
    sleep2(1000).then((resolve, reject)=>console.log("done"))
    */
    static sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
    * 等待某个选择器出现
    */
    static waitFor = (selector, loopCount) => {
        return new Promise((resolve, reject) => {
            var result = null;
            while (loopCount > 0) {
                ret = document.querySelector(selector);
                if (ret !== null)
                    break;
                sleep(100)
                console.log(selector + ' 没有找到，继续等待...')
                loopCount--
            }
            return ret
        })
    }
    /*
        获取随机数
    */
    static random=(minVal, maxVal)=>{
        return (Math.floor(Math.random()*maxVal*10)+minVal*10)/10;
    }
}

class Result{
    result=false
    message=""
    static succ(){
        let ret=new Result()
        ret.result=true
        return ret
    }
    static error(message){
        let ret=new Result()
        ret.result=false
        ret.message=message
        return ret
    }
    getMessage(){
        return this.message
    }
    isSucc(){
        return this.result
    }
    isError(){
        return !this.result
    }
}

function send_p() { //发送按钮
    return new Promise((resolve, reject)=>{
        let el = document.querySelectorAll('.icon-button__circle')[1];
        if (el===undefined || el===null){
            return reject(Result.error('没有找到发送按钮'))
        }
        el.click();//点击发送按钮
        return resolve(Result.succ());
    })
}

function transfer_in_account_p(){
    return new Promise((resolve, reject)=>{ //在我的账户间转账
        let el=document.querySelector('.button.btn-link.send__select-recipient-wrapper__list__link')
        if (el===null){
            return reject(Result.error("没有找到在我的账户间转账"))
        }
        el.click()
        return resolve(Result.succ())

    })
}


/*
 *   在我的账户中选择一个
 *   
 */

function account_list_p(to_addr){
    return new Promise((resolve, reject)=>{
        let nlist=document.querySelectorAll('.send__select-recipient-wrapper__group-item__subtitle')
        if (nlist===null || nlist.length===0){
            return reject(Result.error('没有找到选择账户'))
        }
        let selector=new EthAccountSelector()
        let index=selector.indexOf(nlist, to_addr)
        if (index===null || index<0){
            return reject(Result.error('没有找到选择账户中的索引'+index))
        }
        nlist[index].click()//点击符合条件的帐号
        return resolve(Result.succ())
    })
}

/*
    设置转账金额
*/
function set_amount_p(amount){
    return new Promise((resolve, reject)=>{
        let el = document.querySelector('.unit-input__input-container>input')//转账金额
        if (el===null){
            return reject(Result.error('转账金额没有找到'))
        }
        el.focus()
        el.value=amount
        return resolve(Result.succ())
    })
}

/*设置gas费*/
function set_gas_p(val){
    return new Promise((resolve, reject)=>{
        let el=document.querySelector('.advanced-gas-inputs__gas-edit-row__input[data-testid=gas-price]') //gas费
        if (el===null){
            return reject(Result.error('gas fee 没有找到'))
        }
        el.focus()
        el.value=val
        return resolve(Result.succ())
    })
}

/*设置gas限制*/
function set_gas_limit_p(val){
    return new Promise((resolve, reject)=>{
        let el=document.querySelector('.advanced-gas-inputs__gas-edit-row__input[data-testid=gas-limit]') //gas限制
        if (el===null){
            return reject(Result.error('gas limit 没有找到'))
        }
        el.focus()
        el.value=val
        return resolve(Result.succ())
    })
}


/*
    点击下一步
*/
function next_button_p(){
    return new Promise((resolve, reject)=>{
        let el=document.querySelector('.button.btn--rounded.btn-primary.page-container__footer-button:enabled')
        if (el===null){
            return reject(Result.error('可用的下一步按钮没有找到'))
        }
        el.click()//点击下一步
        return resolve(Result.succ())
    })
}

/* 确认按钮 */
function confirm_button_p(to_addr){
    return new Promise((resolve, reject)=>{
        let el=document.querySelector('.button.btn--rounded.btn-primary.page-container__footer-button')
        if (el==undefined || el===null){
            return reject(Result.error("未能找到确认按钮"))
        }
        el.click()
        return resolve(Result.succ())
    })
}

async function transferTo(to_addr, amount){
    let ret=null
    ret=await send_p()
    if (ret.isError()){
        console.error(ret.getMessage())
        return
    }
    console.log(ret)
    await Utils.sleep(300)
    ret=await transfer_in_account_p()
    if (ret.isError()){
        console.error(ret.getMessage())
        return
    }
    await Utils.sleep(300)
    ret=await account_list_p(to_addr)
    if (ret.isError()){
        console.error(ret.getMessage())
        return
    }
    await Utils.sleep(500)
    ret=await set_amount_p(amount)
    if (ret.isError()){
        console.error(ret.getMessage())
        return
    }
    await Utils.sleep(500)
    let gas=parseFloat(Utils.random(1.32, 36500.501)).toFixed(2)
    ret=await set_gas_p()
    if (ret.isError()){
        console.error(ret.getMessage())
        return
    }
    await Utils.sleep(500)
    ret=await set_gas_limit_p(21000)
    if (ret.isError()){
        console.error(ret.getMessage())
        return
    }
    await Utils.sleep(300)
    ret=await next_button_p()
    if (ret.isError()){
        console.error(ret.getMessage())
        return
    }
    await Utils.sleep(5000)
    ret=await confirm_button_p()
    if (!ret.ret){
        console.error(ret.getMessage())
        return
    }
    await Utils.sleep(15000)
}

transferTo(to_addr, 1)
