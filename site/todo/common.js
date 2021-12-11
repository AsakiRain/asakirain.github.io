//基础功能开始
function addClass(obj, cls) {
    let obj_class = obj.className;//获取 class 内容.
    obj_class += (obj_class !== '') ? ' ' : '';//判断获取到的 class 是否为空, 如果不为空在前面加个'空格'.
    if (obj_class.indexOf(cls) === -1) {
        obj.className = obj_class + cls;//组合原来的 class 和需要添加的 class并替换原来的 class.
    }

}

function removeClass(obj, cls) {
    let obj_class = ' ' + obj.className + ' ';//获取 class 内容, 并在首尾各加一个空格. ex) 'abc    bcd' -> ' abc    bcd '
    obj_class = obj_class.replace(/(\s+)/gi, ' ');//将多余的空字符替换成一个空格. ex) ' abc    bcd ' -> ' abc bcd '
    let removed = obj_class.replace(new RegExp(' ' + cls + ' ', 'g'), ' ');//在原来的 class 替换掉首尾加了空格的 class. ex) ' abc bcd ' -> 'bcd '
    removed = removed.replace(/(^\s+)|(\s+$)/g, '');//去掉首尾空格. ex) 'bcd ' -> 'bcd'
    obj.className = removed;//替换原来的 class.
}

function hasClass(obj, cls) {
    let obj_class = obj.className;//获取 class 内容.
    let obj_class_lst = obj_class.split(/\s+/);//通过split空字符将cls转换成数组.
    let x = 0;
    for (x in obj_class_lst) {
        if (obj_class_lst[x] === cls) {//循环数组, 判断是否包含cls
            return true;
        }
    }
    return false;
}

const setLS = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
    }
}

const removeLS = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (e) {
    }
}

const getLS = (k) => {
    try {
        return localStorage.getItem(k);
    } catch (e) {
        return null // 与 localStorage 中没有找到对应 key 的行为一致
    }
}
//基础功能结束

let nCount = 0;

function showNotification(status, detail) {
    let ID = 'n' + (++nCount).toString();
    document.getElementById('nWrapper').innerHTML
        += `<div id="${ID}" class="nCommon nInactive n${status}">${detail}</div>`;
    setTimeout(function () {
        removeClass(document.getElementById(ID), 'nInactive');
        addClass(document.getElementById(ID), 'nActive');
    }, 0)
    setTimeout(function () {
        removeClass(document.getElementById(ID), 'nActive');
        addClass(document.getElementById(ID), 'nInactive');
    }, 3000);
    setTimeout(function () {
        document.getElementById(ID).remove();
    }, 3600);

}

function highlight(key) {
    addClass(document.getElementById(key), 'inputInvalid');
    document.getElementById(key).onfocus = function () {
        removeClass(document.getElementById(key), 'inputInvalid')
    }
}

async function getData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                showNotification('Fail', `返回了不正常的http状态码：${response.status}`);
                throw new Error('Network response was not OK');
            } else {
                return response.json();
            }
        }).catch(e => {
            showNotification('Fail', e);
            throw new Error(e);
        });
}

async function doLogin(user_name, passwd) {
    return fetch("http://todoapi.mjclouds.com/v1/user/login", {
        method: 'POST',
        body: JSON.stringify({
            user_name,
            passwd,
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