let token = getLS('token');
if (token === null) {
    location.href = './signin.html';
} else {
    getTodo();
}

document.getElementById('mainTitle').onclick = sw;

document.getElementById('btnLogout').onclick = function () {
    funcLogout();
}

document.getElementById('catTodo').onclick = function () {
    selectCat('Todo');
}

document.getElementById('catDoing').onclick = function () {
    selectCat('Doing');
}

document.getElementById('catDone').onclick = function () {
    selectCat('Done');
}

function sw() {
    window.open(`./app.html`,
        '', 'width=411,height=823');
}

function funcLogout() {
    document.getElementById('userTitle').innerHTML = `<span id="btnConfirmLogout">确定</span>&nbsp&nbsp<span id="btnCancel">取消</span>`;
    document.getElementById('btnConfirmLogout').onclick = function () {
        removeLS('token');
        location.href = './signin.html'
    }
    document.getElementById('btnCancel').onclick = function () {
        document.getElementById('userTitle').innerHTML = `<span id="btnLogout">登出</span>`;
        document.getElementById('btnLogout').onclick = function () {
            funcLogout();
        }
    }
}

let selected = 'Todo';

function selectCat(switchTo) {
    if (selected === switchTo) {
        return;
    }
    removeClass(document.getElementById('cat' + selected), 'catSelected');
    addClass(document.getElementById('scrollWrapper'), 'page' + switchTo);
    addClass(document.getElementById(switchTo.toLowerCase() + 'Wrapper'), 'activeSection');
    removeClass(document.getElementById('scrollWrapper'), 'page' + selected);
    removeClass(document.getElementById(selected.toLowerCase() + 'Wrapper'), 'activeSection');
    addClass(document.getElementById('cat' + switchTo), 'catSelected');
    selected = switchTo;
}

function getTodo() {
    fetch(`http://todoapi.mjclouds.com/v1/todo/list`, {
        headers: {
            'token': token,
        }
    })
        .then(response => {
            if (response.status >= 400 && response.status < 500) {
                location.href = './signin.html';
            } else {
                return response.json();
            }
        }).catch(e => {
        showNotification('Fail', e);
        throw new Error(e);
    }).then(json => {
        parseTodo(json['data']);
    })
}

function parseTodo(data) {
    document.getElementById('todoWrapper').innerHTML = '';
    document.getElementById('doingWrapper').innerHTML = '';
    document.getElementById('doneWrapper').innerHTML = '';
    for (let i in data) {
        switch (data[i]['status']) {
            case 0: {
                document.getElementById('todoWrapper').innerHTML += todoTemplate(data[i]);
                break;
            }
            case 1: {
                document.getElementById('doingWrapper').innerHTML += todoTemplate(data[i]);
                break;
            }
            case 2: {
                document.getElementById('doneWrapper').innerHTML += todoTemplate(data[i]);
                break;
            }
        }
    }
    funcShow(document.getElementById('scrollWrapper'), true);
}

function todoTemplate(data) {
    return `<div class="eachWrapper" id="todo-${data['ID']}">
                        <div class="todoWrapper">
                            <div class="todoTitle">${data['todo_name']}</div>
                            <div class="todoTime">${new Date(Date.parse(data['end_time'])).toLocaleString()}</div>
                            <div class="todoDesp">${data['description']}</div>
                        </div>
                        <div class="funcWrapper" todo-status="${data['status']}" todo-id="${data['ID']}" id="func-${data['ID']}">
                            <div class="todoFunc funcMove"><span>移动到</span></div>
                            <div class="todoFunc funcEdit"><span>编辑</span></div>
                            <div class="todoFunc funcDelete"><span>删除</span></div>
                        </div>
                    </div>`
}

function funcShow(parent, setAll = false) {
    if (setAll) {
        for (let i = 0; i < 3; i++) {
            let section = parent.children[i]
            for (let j = 0; j < section.children.length; j++) {
                let childFunc = section.children[j].children[1];
                childFunc.children[0].onclick = function () {
                    funcMove(this);
                }
                childFunc.children[1].onclick = function () {
                    funcEdit(this);
                }
                childFunc.children[2].onclick = function () {
                    funcDelete(this);
                }
                childFunc.children[0].innerHTML = '<span>移动到</span>';
                childFunc.children[1].innerHTML = '<span>编辑</span>';
                childFunc.children[2].innerHTML = '<span>删除</span>';
            }
        }
    } else {
        parent.children[0].onclick = function () {
            funcMove(this);
        }
        parent.children[1].onclick = function () {
            funcEdit(this);
        }
        parent.children[2].onclick = function () {
            funcDelete(this);
        }
        parent.children[0].innerHTML = '<span>移动到</span>';
        parent.children[1].innerHTML = '<span>编辑</span>';
        parent.children[2].innerHTML = '<span>删除</span>';
    }
}

let moveAlias = {
    0: '未开始',
    1: '进行中',
    2: '已完成',
}

function funcMove(ele) {
    let parent = ele.parentNode;
    let status = parent.getAttribute('todo-status');
    parent.children[0].innerHTML = '<span>返回</span>';
    parent.children[0].onclick = function () {
        funcShow(this.parentNode);
    }
    let pos = 1;
    for (let i in moveAlias) {
        if (i === status) {
        } else {
            let node = parent.children[pos];
            node.innerHTML = `<span>${moveAlias[i]}</span>`;
            node.setAttribute('move-to', i);
            node.onclick = function () {
                moveTodo(this)
            }
            pos++;
        }
    }
}

function funcEdit(ele) {
    showNotification('Success', '没有支持这个功能');
}

function funcDelete(ele) {
    let parent = ele.parentNode;
    parent.children[0].innerHTML = '<span>请确认</span>';
    parent.children[1].innerHTML = '<span>确认</span>';
    parent.children[2].innerHTML = '<span>取消</span>';
    parent.children[0].onclick = function () {
    };
    parent.children[1].onclick = function () {
        deleteTodo(this);
    }
    parent.children[2].onclick = function () {
        funcShow(this.parentNode);
    }
}

function deleteTodo(ele) {
    let parent = ele.parentNode;
    let todoID = parent.getAttribute('todo-id');
    fetch(`http://todoapi.mjclouds.com/v1/todo/del/${todoID}`, {
        headers: {
            'token': token,
        },
        method: 'DELETE',
    }).then(response => {
        if (!response.ok) {
            showNotification('Fail', `返回了不正常的http状态码：${response.status}`);
            throw new Error('Network response was not OK');
        } else {
            return response.json();
        }
    }).then(json => {
        if (json['code'] !== 2000) {
            showNotification('Fail', json['message']);
        } else {
            getTodo();
            showNotification('Success', '删除成功');
        }
    }).catch(e => {
        showNotification('Fail', e);
        throw new Error(e);
    });
}

let moveEng = {
    0: 'todo',
    1: 'doing',
    2: 'done',
}

function moveTodo(ele) {
    let parent = ele.parentNode;
    let moveTo = ele.getAttribute('move-to');
    let todoID = parent.getAttribute('todo-id');
    fetch(`http://todoapi.mjclouds.com/v1/todo/${moveEng[moveTo]}/${todoID}`, {
        headers: {
            'token': token,
        },
        method: 'PUT',
    }).then(response => {
        if (!response.ok) {
            showNotification('Fail', `返回了不正常的http状态码：${response.status}`);
            throw new Error('Network response was not OK');
        } else {
            return response.json();
        }
    }).then(json => {
        if (json['code'] !== 2000) {
            showNotification('Fail', json['message']);
        } else {
            getTodo();
            showNotification('Success', '移动成功');
        }
    }).catch(e => {
        showNotification('Fail', e);
        throw new Error(e);
    });
}

function getDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${('0' + date.getHours()).substr(-2)}:${('0' + date.getMinutes()).substr(-2)}`;
}

document.getElementById('btnAdd').onclick = function () {
    addClass(document.getElementById('addWrapper'), 'addWrapperActive');
    addClass(document.getElementById('wrapper'), 'wrapperInactive');
    document.getElementById('addTodoTime').value = getDate(new Date());
}

document.getElementById('addCtrlClose').onclick = function () {
    removeClass(document.getElementById('addWrapper'), 'addWrapperActive');
    removeClass(document.getElementById('wrapper'), 'wrapperInactive');
}

document.getElementById('addBtnSubmit').onclick = function () {
    funcAdd()
}

function funcAdd() {
    let todoName = document.getElementById('addTodoTitle').value;
    let description = document.getElementById('addTodoDescription').value;
    let endTime = document.getElementById('addTodoTime').value;
    if (todoName === '') {
        highlight('addTodoTitle');
        showNotification('Fail', '请输入标题');
    } else {
        fetch(`http://todoapi.mjclouds.com/v1/todo/add`, {
            headers: {
                'token': token,
            },
            body: JSON.stringify({
                "todo_name": todoName,
                "description": description === '' ? 'some desc' : description,
                "end_time": Math.round(new Date(Date.parse(endTime)) / 1000),
            }),
            redirect: 'follow',
            method: 'PUT',
        }).then(response => {
            if (!response.ok) {
                showNotification('Fail', `返回了不正常的http状态码：${response.status}`);
                throw new Error('Network response was not OK');
            } else {
                return response.json();
            }
        }).then(json => {
            if (json['code'] !== 2000) {
                showNotification('Fail', json['message']);
            } else {
                getTodo();
                showNotification('Success', '添加成功');
                removeClass(document.getElementById('addWrapper'), 'addWrapperActive');
                removeClass(document.getElementById('wrapper'), 'wrapperInactive');
                document.getElementById('addTodoTitle').value = '';
                document.getElementById('addTodoDescription').value = '';
                document.getElementById('addTodoTime').value = '';

            }
        }).catch(e => {
            showNotification('Fail', e);
            throw new Error(e);
        });
    }
}