//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    videoPlaying: false,
  },
  onShareAppMessage: function () {
    return {
      title: '优惠尽在吉买盛',
      path: '/pages/index/index',
      fail: function () {
        wx.showToast({
          title: '转发失败',
          icon: 'cancel',
          duration: 1000
        })
      }
    }
  },
  onReady: function() {
    this.video = wx.createVideoContext('indexVideo');
  },
  onLoad: function () {
    // console.log('onLoad')
    // var that = this
    // app.getUserInfo(function(userInfo){
    //   console.log(userInfo)
    //   that.setData({
    //     userInfo:userInfo
    //   })
    // })
  },

  // 播放视频
  videoPlay: function () {
    this.videoClick = true;
    if (!this.videoOnce) {
      this.video.play();
      this.videoOnce = true;
      this.setData({
        videoPlaying: true,
      });
    }
  },
  videoPlay2: function (e) {
    // if (!this.videoClick) return;
    // if (e.detail.currentTime > 0 && !this.data.videoPlaying) {
    //   this.setData({
    //     videoPlaying: true,
    //   });
    // }
  },
  videoEnd: function () {
    this.setData({
      videoPlaying: false,
    });
    this.video.pause();
    setTimeout(function () {
      wx.navigateTo({
        url: '../map/map',
        success: function (e) {
          console.log(e)
        }
      })
    }, 500);
  },
})
