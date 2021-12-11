document.onreadystatechange = function () {
    if (document.readyState === 'interactive') {

        //测试用例开始
        //测试用例结束

        document.getElementById('btnSubmit').onclick = function () {
            let input = {
                account: document.getElementById('account').value,
                password: document.getElementById('password').value,
            }
            let isEmpty = 0;
            for (let key in input) {
                if (input[key].length === 0) {
                    isEmpty += 1;
                    highlight(key);
                }
            }
            if (isEmpty) {
                showNotification('Fail', '还有未填写的字段');
            } else {
                let errDetail = '';
                let invalid = 0;
                if (/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(input['account'].toLowerCase())) {
                } else if (/^[1][345789][0-9]{9}$/.test(input['account'])) {
                } else if (/^[a-zA-Z0-9_]{3,16}$/.test(input['account'])) {
                } else {
                    errDetail += `<div>请输入合法的账号</div>`;
                    invalid++;
                }
                if (input['password'].length > 16 || input['password'].length < 8) {
                    errDetail += `<div>密码长度应为8-16位</div>`;
                    invalid++;
                }
                if (invalid) {
                    showNotification('Fail', errDetail);
                } else {
                    doLogin(input['account'], input['password']).then(json => {
                        setLS('token', json['data'][0]['token']);
                        console.log(json['data'][0]['token']);
                        location.href = 'app.html';
                    })
                }

            }
        }
    }
}