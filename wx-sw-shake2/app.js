//app.js
var code = null;
var user = null;
var post_user = null;


App({
  globalData: {
    userInfo: null,
    main_data: null,
    id: '',
  },
  onLaunch: function () {
    // this.userInfo = this.globalData.userInfo
    // //调用API从本地缓存中获取数据
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  getScreenInfo: function (cb) {
    var that = this
    if (this.globalData.window) {
      typeof cb == "function" && cb(this.globalData.window)
    } else {
      //调用登录接口
      var res = wx.getSystemInfoSync()
      that.globalData.window = {
        width: res.windowWidth,
        height: res.windowHeight
      }
      typeof cb == "function" && cb(that.globalData.window)
    }
  },

  Login: function (cb) {
    var that = this;
    wx.showLoading({
      title: 'loading...',
    });
    code = null;
    wx.login({
      success: function (r1) {
        // console.log('login:', r1);
        if (!r1.code) {
          wx.showModal({
            title: '系统错误：未获取到 code',
            content: JSON.stringify(r1),
          });
          return;
        }
        code = r1.code;
        wx.getUserInfo({
          lang: 'zh_CN',
          withCredentials: true,
          success: function (r2) {
            // console.log('getUserInfo', r2);
            that.globalData.user = r2.userInfo;
            that.globalData.userInfo = r2.userInfo;

            user = JSON.parse(r2.rawData);
            var userInfo = {
              Nickname: user.nickName,
              Gender: user.gender,
              City: user.city,
              Country: user.country,
              Province: user.province,
              Language: user.language,
              HeadImgUrl: user.avatarUrl,
            }
            post_user = JSON.stringify(userInfo)

            wx.request({
              url: 'https://sum.kdcer.com/api/OpenShop/CodeToSession',
              data: {
                code: r1.code,
                userJson: JSON.stringify(userInfo),
                appidStr: 'wxdef1d6fbcabb2b9c',
                appsercetStr: 'e8978957586474f713222dc4d57a370b',
              },
              success: function (r3) {
                // console.log('/onLogin/', r3.data);
                that.globalData.id = r3.data.Unionid;
                typeof cb == "function" && cb(r3.data, user);
              }
            });
          }
        });
      }
    });
  },

  // 字符串寻找键值对
  QueryString: function (name, str) {
    var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(&|$)');
    var r = str.match(reg);
    return r != null ? decodeURIComponent(r[2]) : null;
  },

  // 判断类型
  Type: function (obj) {
    var typeStr = Object.prototype.toString.call(obj).split(" ")[1];
    return typeStr.substr(0, typeStr.length - 1).toLowerCase();
  },

  // 时间字符串转时间
  convertTime: function (d) {
    return new Date(parseInt(d.replace("/Date(", "").replace(")/", ""), 10));
  }
})
