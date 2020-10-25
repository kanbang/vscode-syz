

let vmLog = new Vue({
    el: '#ui',
    data: {
        messages: [],
        showMessages: true,
        users: null,
        onlineCount: 0,
        onlineUsers: [],
        dackCount: 0,
        dackUsers: [],
        showDackUsers: false,
        model: null,
        showOnlineUsers: true,
        followUser: null,
        followInterval: null,
        delUser: null,
        type: null,
        circleRadius: 100,
        // CancelDack: null,
    },
    filters: {
        parseInt: function (value) {
            return parseInt(value);
        }
    },
    watch: {
        messages() {
            this.$nextTick(() => {
                let container = this.$refs.messages;
                let scrollTop = container.scrollTop;
                let scrollHeight = container.scrollHeight;
                let clientHeight = container.clientHeight;
                if (clientHeight - scrollTop <= 220) {
                    container.scrollTop = scrollHeight
                }
                container.scrollTop = scrollHeight
            })
        },
        followUser(newUser, oldUser) {
            if (this.followInterval !== null) clearInterval(this.followInterval);
            if (newUser !== null) {
                this.followUser = newUser;
                if (this.type === 'follow') {
                    this.followInterval = setInterval(() => {
                        this.setTarget(this.followUser.user.x, this.followUser.user.y);
                    }, 100);
                } else if (this.type === 'around') {
                    let degree = 0;
                    this.followInterval = setInterval(() => {
                        let r = this.circleRadius;
                        let x0 = this.followUser.user.x;
                        let y0 = this.followUser.user.y;
                        degree += 10;
                        let hudu = 2 * Math.PI / 360 * degree;
                        let x1 = x0 + Math.sin(hudu) * r;
                        let y1 = y0 - Math.cos(hudu) * r;
                        this.setTarget(x1, y1);
                    }, 50)
                }
            }
        },
        delUser(user) {
            if (this.delUser !== null) {
                app.deleteUser(user.id);
                // console.log(app)
                this.dackUsers.push({
                    name: user.name
                });
                this.dackCount = this.dackUsers.length;
            }
        },
        onlineUsers(newOnlineUsers, oldOnlineUsers) {
            if (this.followUser !== null) {
                let index = newOnlineUsers.findIndex((user) => {
                    return this.followUser.id === user.id;
                });
                // console.log('update onlineUsers')
                if (index === -1) {
                    console.log("用户离开，跟随结束")
                    clearInterval(this.followInterval);
                    this.followUser = null;
                    this.followInterval = null;
                    this.freeTarget();
                }
            }
        }
    },
    computed: {
        showText() {
            return this.showMessages ? '隐藏' : '显示';
        },
        showOnlineUsersText() {
            return this.showOnlineUsers ? '隐藏' : '显示';
        },
        showDackUsersText() {
            return this.showDackUsers ? '隐藏' : '显示';
        }
    },
    methods: {
        addLog(log) {
            this.messages.push(log);
        },
        toggleMessages() {
            this.showMessages = !this.showMessages;
        },
        toggleOnlineUsers() {
            this.showOnlineUsers = !this.showOnlineUsers;
        },
        toggleDackUsers() {
            this.showDackUsers = !this.showDackUsers;
        },
        setTarget(x, y) {
            // console.log(x, y, app)
            app.setTarget(x, y);
        },
        freeTarget() {
            app.freeTarget();
        },
        toUserPos(user) {
            this.setTarget(user.x, user.y);
        },
        updateUsers(users) {
            this.users = users;
            this.onlineCount = this.users ? Object.keys(this.users).length : 0;

            //在线用户列表
            let userList = []
            for (let id in this.users) {
                userList.push({
                    id: id,
                    name: this.users[id].name,
                    user: this.users[id]
                })
            }
            this.onlineUsers = userList
        },
        updateModel(model) {
            this.model = model;
        },
        onClickFollowUser(user) {
            this.type = 'follow';
            this.followUser = user;
            // console.log(user)
        },
        onClickCancelFollow() {
            this.followUser = null;
            clearInterval(this.followInterval);
            this.freeTarget();
        },
        onClickDelUser(user) {
            this.delUser = user;
        },
        onClickCancelDack(user) {
            this.CancelUser(user);
        },
        CancelUser(user) {
            // delete this.dackUsers[user.name];
            this.delUser = null;
            this.dackUsers.pop(user.name);
            // console.log(this.dackUsers);
            app.deleteUser(user.id, true)
            this.dackCount = this.dackUsers.length;
        },
        onClickAroundUser(user) {
            this.type = 'around';
            this.followUser = user;
        },
        setCircleRadius(r) {
            this.circleRadius = r;
            console.log(r);
        },
    }
});