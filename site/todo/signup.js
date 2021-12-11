document.onreadystatechange = function () {
    if (document.readyState === 'interactive') {
        //测试用例开始
        //测试用例结束

        function watchDog() {
            let watchDog = setInterval(function () {
                let coolDownTime = getCoolDownTime();
                if (coolDownTime === 0) {
                    document.getElementById('btnGetCode').innerText = '获取验证码';
                    clearInterval(watchDog);
                } else {
                    document.getElementById('btnGetCode').innerText = `重新获取(${coolDownTime}s)`;
                }
            }, 1000)
        }

        function getCoolDownTime() {
            let last = getLS('last_get_time');
            if (last === null) {
                return 0;
            } else {
                let now = Math.floor((new Date().getTime()) / 1000);
                return (now - last < 180) ? 180 - (now - last) : 0
            }
        }

        function setCoolDownTime() {
            let now = Math.floor((new Date().getTime()) / 1000);
            setLS('last_get_time', now);
        }

        watchDog();
        document.getElementById("btnGetCode").onclick = function () {
            let phoneNumber = document.getElementById('phoneNumber').value;
            if (getCoolDownTime() !== 0) {
            } else if (phoneNumber.length === 0) {
                showNotification('Fail', "请填写手机号");
            } else if (!/^[1][345789][0-9]{9}$/.test(phoneNumber)) {
                showNotification('Fail', "请填写合法的手机号");
            } else {
                getData(`http://todoapi.mjclouds.com/v1/user/register/code/${phoneNumber}`)
                    .then(json => {
                        if (json['code'] === 2000) {
                            showNotification('Success', '验证码将发送到您的手机，请查收');
                            setCoolDownTime();
                            watchDog();
                        } else {
                            showNotification('Fail', json['message']);
                        }
                    });
            }

        }

        document.getElementById('btnSubmit').onclick = function () {
            let input = {
                accountName: document.getElementById('accountName').value,
                email: document.getElementById('email').value,
                textCode: document.getElementById('textCode').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                password: document.getElementById('password').value,
                retypePassword: document.getElementById('retypePassword').value,
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
                if (!/^[a-zA-Z0-9_]{3,16}$/.test(input['accountName'])) {
                    errDetail += `<div>账号只能由3-16位字母、数字、下划线组成</div>`;
                    invalid++;
                }
                if (!/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(input['email'].toLowerCase())) {
                    errDetail += `<div>请输入合法的邮箱</div>`;
                    invalid++;
                }
                if (!/^\d{6}$/.test(input['textCode'])) {
                    errDetail += `<div>请输入合法的验证码</div>`;
                    invalid++;
                }
                if (!/^[1][345789][0-9]{9}$/.test(input['phoneNumber'])) {
                    errDetail += `<div>请输入正确的手机号</div>`
                    invalid++;
                }
                if (input['password'].length > 16 || input['password'].length < 8) {
                    errDetail += `<div>密码长度应为8-16位</div>`
                    invalid++;
                } else {
                    if (input['password'] !== input['retypePassword']) {
                        errDetail += `<div>两次输入密码不一致</div>`;
                        invalid++;
                    } else {
                        if (!/(?!^(\d+|[a-zA-Z]+|[~!@#$%^&*?]+)$)^[\w~!@#$%^&*?]{6,16}$/.test(input['password'])) {
                            errDetail += `<div>密码应至少包含字母、数字、字符中的两种</div>`;
                            invalid++;
                        }
                    }
                }
                if (invalid) {
                    showNotification('Fail', errDetail);
                } else {
                    getData(`http://todoapi.mjclouds.com/v1/user/check/email/${input['email']}`)
                        .then(json => {
                            if (json['code'] !== 2000) {
                                showNotification('Fail', json['message']);
                            } else {
                                doRegister(input['accountName'], input["password"], input['email'], input['phoneNumber'], input['textCode'])
                                    .then(json => {
                                        if (json['code'] === 2000) {
                                            showNotification('Success', '注册成功，将自动登录');
                                            doLogin(input["phoneNumber"], input['password']).then(json => {
                                                setLS('token', json['data'][0]['token']);
                                                console.log(json['data'][0]['token']);
                                                location.href = 'app.html';
                                            })
                                        } else {
                                            showNotification('Fail', json['message']);
                                        }
                                    })
                            }
                        });
                }

            }
        }

        async function doRegister(user_name, password, email, phone, code) {
            return fetch("https://todoapi.mjclouds.com/v1/user/register", {
                method: 'POST',
                body: JSON.stringify({
                    user_name,
                    password,
                    email,
                    phone,
                    code
                }),
                redirect: 'follow'
            })
                .then(response => {
                    if (!response.ok) {
                        showNotification('Fail', '返回了不正常的http状态码');
                        throw new Error('Network response was not OK');
                    } else {
                        return response.json();
                    }
                }).catch(e => {
                    showNotification('Fail', e);
                    throw new Error(e)
                })
        }
    }
}