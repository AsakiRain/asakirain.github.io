document.onreadystatechange = function () {
    if (document.readyState === 'interactive') {
        //测试用例开始
        document.getElementById('btnGetCode').onclick = function (){
            document.getElementById('textCode').value = '160206';
        }
        document.getElementById('mainTitle').onclick = function (){
            document.getElementById('accountName').value = 'Alex';
            document.getElementById('email').value = 'email123@exmaple.com'
            // document.getElementById('textCode').value
            document.getElementById('phoneNumber').value = '13712345678';
            document.getElementById('password').value = '@nlyY0uK0owTh1s';
            document.getElementById('retypePassword').value = '@nlyY0uK0owTh1s';
        }
        //测试用例结束
        //基础功能开始
        function addClass(obj, cls){
            let obj_class = obj.className;//获取 class 内容.
            obj_class += (obj_class !== '') ? ' ' : '';//判断获取到的 class 是否为空, 如果不为空在前面加个'空格'.
            if(obj_class.indexOf(cls) === -1){
                obj.className = obj_class + cls;//组合原来的 class 和需要添加的 class并替换原来的 class.
            }

        }
        function removeClass(obj, cls){
            let obj_class = ' '+obj.className+' ';//获取 class 内容, 并在首尾各加一个空格. ex) 'abc    bcd' -> ' abc    bcd '
            obj_class = obj_class.replace(/(\s+)/gi, ' ');//将多余的空字符替换成一个空格. ex) ' abc    bcd ' -> ' abc bcd '
            let removed = obj_class.replace(new RegExp(' ' + cls + ' ', 'g'), ' ');//在原来的 class 替换掉首尾加了空格的 class. ex) ' abc bcd ' -> 'bcd '
            removed = removed.replace(/(^\s+)|(\s+$)/g, '');//去掉首尾空格. ex) 'bcd ' -> 'bcd'
            obj.className = removed;//替换原来的 class.
        }
        function hasClass(obj, cls){
            let obj_class = obj.className;//获取 class 内容.
            let obj_class_lst = obj_class.split(/\s+/);//通过split空字符将cls转换成数组.
            let x = 0;
            for(x in obj_class_lst) {
                if(obj_class_lst[x] === cls) {//循环数组, 判断是否包含cls
                    return true;
                }
            }
            return false;
        }
        //基础功能结束

        document.getElementById('btnSubmit').onclick = function (){
            let input = {
                accountName: document.getElementById('accountName').value,
                email: document.getElementById('email').value,
                textCode: document.getElementById('textCode').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                password: document.getElementById('password').value,
                retypePassword: document.getElementById('retypePassword').value,
            }
            let result = checkInput(input);
            if(result[0]){
                showNotification('Success', result[1]);
            }
            else{
                showNotification('Fail', result[1]);
            }
        }

        let nCount = 0;
        function showNotification(status,detail){
            let ID = 'n' + (++nCount).toString();
            document.getElementById('nWrapper').innerHTML
                += `<div id="${ID}" class="nCommon nInactive n${status}">${detail}</div>`;
            setTimeout(function (){
                removeClass(document.getElementById(ID), 'nInactive');
                addClass(document.getElementById(ID), 'nActive');
            },0)
            setTimeout(function() {
                removeClass(document.getElementById(ID), 'nActive');
                addClass(document.getElementById(ID), 'nInactive');
            }, 3000);
            setTimeout(function() {
                document.getElementById(ID).remove();
            }, 3600);

        }

        function highlight(key){
            addClass(document.getElementById(key),'inputInvalid');
            document.getElementById(key).onfocus = function (){
                removeClass(document.getElementById(key), 'inputInvalid')
            }
        }

        function checkInput(input){
            let isEmpty = 0;
            for(let key in input){
                // console.log(key + "：" + document.getElementById(key).value);
                if(input[key].length === 0){
                    isEmpty += 1;
                    highlight(key);
                }
            }
            if(isEmpty){
                return [false,'还有未填写的字段'];
            }
            else{
                let errDetail = '';
                let invalid = 0;
                if(!/^[a-zA-Z0-9_]{3,16}$/.test(input['accountName'])){
                    errDetail += `<div>账号只能由3-16位字母、数字、下划线组成</div>`;
                    invalid++;
                }
                if(!/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(input['email'].toLowerCase())){
                    errDetail += `<div>请输入合法的邮箱</div>`;
                    invalid++;
                }
                if(!/^\d{6}$/.test(input['textCode'])){
                    errDetail += `<div>请输入合法的验证码</div>`;
                    invalid++;
                }
                if(!/^[1][3,4,5,7,8,9][0-9]{9}$/.test(input['phoneNumber'])){
                    errDetail += `<div>请输入正确的手机号</div>`
                    invalid++;
                }
                if(input['password'].length > 16 || input['password'].length < 8){
                    errDetail += `<div>密码长度应为8-16位</div>`
                    invalid++;
                }
                else{
                    if(input['password'] !== input['retypePassword']){
                        errDetail += `<div>两次输入密码不一致</div>`;
                        invalid++;
                    }
                    else{
                        if(!/(?!^(\d+|[a-zA-Z]+|[~!@#$%^&*?]+)$)^[\w~!@#$%^&*?]{6,16}$/.test(input['password'])){
                            errDetail += `<div>密码应至少包含字母、数字、字符中的两种</div>`;
                            invalid++;
                        }
                    }
                }
                if(invalid){
                    return [false, errDetail];
                }
                else{
                    return [true, 'Go ahead signup.'];
                }

            }
        }
    }
}