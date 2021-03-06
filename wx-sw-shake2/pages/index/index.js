//index.js
var app = getApp();

// 各种标量
var baseUrl = 'https://cdn.kdcer.com/test/img/shake/';
var ctx = null;
var winW = 0, winH = 0;
var imgTotal = 0;
// var imgBaseUrl = 'https://cdn.kdcer.com/test/sw_shake/';
// var imgs = [[26, '.jpg'], [26, '.jpg'], [26, '.jpg'], [26, '.jpg'], [11, '.png']];
// var imgBaseUrl = 'https://cdn.kdcer.com/test/sw_shake3/';
// var imgs = [[13, '.jpg'], [13, '.jpg'], [13, '.jpg'], [13, '.jpg'], [6, '.png']];
var imgBaseUrl = 'https://cdn.kdcer.com/test/sw_shake4/';
var imgs = [[7, '.jpg'], [7, '.jpg'], [7, '.jpg'], [7, '.jpg'], [6, '.png']];
var resource = [];
var startDate = new Date(2017, 8, 9, 20, 0, 0);
var id = 'ozlgTuNQqLo1xe2QaUdvZt81tsgA';
var main_start = null;
var left = 0;

var audio = null;

// 兼容 requestAnimationFrame
if (typeof requestAnimationFrame == 'undefined') {
  var lastTime = 0;
  var requestAnimationFrame = function (callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}
if (typeof cancelAnimationFrame == 'undefined') {
  var cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}

// 能否点击加速
var canClick = false;

var page = Page({
  data: {
    page: {
      load: true,
      timecount: false,
      welcome: false,
      rule: false,
      start: false,
      train: false,
      finish: false,
      justify: false,
      prize: false,
      good: false,
      good2: false,
      bad: false,
      result: false,
      tip: false,
      bg: false,
      shake2: false,
    },
    canStart: false,
    doorOpen: false,
    timecount: [0, 0, 0, 0, 0, 0],
    beforeShake: false,
    beforeShake2: false,
    code_question: '',
    code_answers: {},
    judge_error: '',
    prizeOpen: false,
    baseUrl: baseUrl,
    imgBaseUrl: imgBaseUrl,
    imgLoadProgress: 0,
    imgs: [],
    left: 0,
  },
  onShareAppMessage: function () {
    return {
      title: '哦哟！2017上海购物节摇一摇超级福利来哉！',
      path: 'pages/index/index',
    }
  },
  onLoad: function () {
    // 获取屏幕宽高
    app.getScreenInfo(function (window) {
      winW = window.width;
      winH = window.height;
    });

    // 改变标题名称
    wx.setNavigationBarTitle({
      title: '全城摇一摇'
    });

    // 音频初始化
    if (!audio) {
      audio = {
        bgm: wx.createAudioContext('bgm'),
        train: wx.createAudioContext('train'),
        ready: wx.createAudioContext('ready'),
        shake: wx.createAudioContext('shake'),
        good: wx.createAudioContext('good'),
        bad: wx.createAudioContext('bad'),
        clock: wx.createAudioContext('clock'),
        result: wx.createAudioContext('result'),
        finish: wx.createAudioContext('finish'),
      };
    }
  },
  error: function(err) {
    console.log(err)
  },
  reset: function () {
    imgTotal = 0;
    speed = 0; item = 0;
    shakeMax = 5;
    shakeTimer = null;
    shakeTimer2 = null;
    canClick = false;
    tick && tick.stop();
    for (var i in imgs) {
      imgTotal += imgs[i][0];
    }
  },
  onShow: function () {
    var that = this;
    this.reset();

    this.setData({
      page: {
        load: true,
        timecount: false,
        welcome: false,
        rule: false,
        start: false,
        train: false,
        finish: false,
        justify: false,
        prize: false,
        good: false,
        good2: false,
        bad: false,
        result: false,
        tip: false,
        bg: false,
        shake2: false,
      },
      canStart: false,
      doorOpen: false,
      timecount: [0, 0, 0, 0, 0, 0],
      beforeShake: false,
      beforeShake2: false,
      code_question: '',
      code_answers: {},
      judge_error: '',
      prizeOpen: false,
      baseUrl: baseUrl,
      imgBaseUrl: imgBaseUrl,
      imgLoadProgress: 0,
      imgs: [],
      reload: false,
      left: 0,
    });

    app.Login(function (r1, user) {
      console.log('入口判断', r1);
      wx.hideLoading();
      id = r1.Unionid;
      // console.log(resource);
      var direct = false;
      left = r1.HistoryState;
      if (r1.HourState) {  // 当天倒计时
        direct = true;
        // this.page_welcome();
        var now = app.convertTime(r1.Time);
        this.time(startDate, now);
      }
      if (r1.BonusState) { // 已中奖
        this.data.page.welcome = true;
        this.data.page.good2 = true;
        this.setData({
          page: this.data.page,
        });
        return;
      }
      if (r1.HistoryState < 1) { // 已抽未中奖
        this.page_welcome();
        this.page_bad();
        return;
      }
      if (r1.State) { // 可开始
        if (r1.HourState) {
          wx.showToast({
            title: 'debug 状态中',
          });
          direct = false;
        }
        var total = 0;
        for (var i in resource) {
          total += resource[i].length;
        }
        console.log(total, imgTotal)
        if (total >= imgTotal) {
          this.page_welcome();
        } else {
          this.needImage2();
          main_start = this.page_welcome;
        }
        this.setData({
          canStart: true,
          left: left,
        });
      } else {
        wx.showToast({
          title: '不在活动时间内',
          duration: 999999,
        });
        this.data.page.laod = false;
        this.setData({
          page: this.data.page,
        });
      }
      direct && this.page_welcome();
      audio.bgm.play();
    }.bind(this));
  },
  reload: function() {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
  showRule: function () {
    this.data.page.rule = true;
    this.setData({ page: this.data.page });
  },
  closeRule: function () {
    this.data.page.rule = false;
    this.setData({ page: this.data.page });
  },
  time: function (EndTime, nowTime) {
    // console.log(EndTime, nowTime);
    var offset = EndTime - nowTime;
    if (offset > 0) {
      var d = new Date(offset);
      d = new Date(d.setHours(d.getHours() - 8));
      // console.log(d);
      var r = [];
      var that = this;
      var T = setInterval(function () {
        d = new Date(d.setSeconds(d.getSeconds() - 1));
        // console.log(d);
        r[0] = parseInt(d.getHours() / 10, 10);
        r[1] = parseInt(d.getHours() % 10, 10);
        r[2] = parseInt(d.getMinutes() / 10, 10);
        r[3] = parseInt(d.getMinutes() % 10, 10);
        r[4] = parseInt(d.getSeconds() / 10, 10);
        r[5] = parseInt(d.getSeconds() % 10, 10);
        // if (d.getTime() > 0) {
        that.setData({
          timecount: r
        });
        // } else {
        // clearInterval(T);
        // wx.reLaunch({
        //   url: '/pages/shake/index/index',
        // })
        // }
      }, 1000);
    }
  },
  start: function () {
    this.setData({
      doorOpen: true,
    });
    setTimeout(function () {
      this.page_start();
    }.bind(this), 1000);
  },
  answer: function (e) {
    var mine = e.target.dataset.item;
    var index = e.target.dataset.index;
    this.myAnswer = mine;
    var a = this.data.code_answers;
    console.log(this.myAnswer, this.rightAnswer)
    for (var i in a) {
      if (i == index) a[i].active = true;
      else a[i].active = false;
    }
    this.setData({
      code_answers: a,
    });
  },
  justify: function (e) {
    if (typeof this.myAnswer == 'undefined') {
      return wx.showModal({
        content: '选个答案再确定吧',
      });
    }
    var that = this;
    if (this.myAnswer == this.rightAnswer) { // 答对
      this.page_prize();
    } else {  // 答错
      this.getImgCode();
      wx.showModal({
        title: '回答错误',
        content: '再重新答一次吧',
      });
    }
  },
  getPrize: function (e) {
    var that = this;
    wx.showLoading({
      title: '礼品准备中...',
      mask: true,
    });
    wx.request({
      url: 'https://sum.kdcer.com/api/OpenShop/GetLotteryBehavior',
      data: {
        Unionid: id,
        formId: e.detail.formId,
      },
      success: function (r) {
        console.log('抽奖', r);
        wx.hideLoading();
        if (r.data.State) {  // 中奖
          that.setData({
            prize: r.data.Bonuses[0],
          });
          that.page_good();
        } else {
          var tip = '';
          switch (r.data.ErrorMessage) {
            case 903: tip = '没有了抽奖机会'; break;
            case 902: tip = '奖品发完了'; break;
            case 901: tip = '您抽过了'; break;
            case 899: tip = '您的身份丢失，重新再来'; break;
            case 898: tip = '系统错误'; break;
            case 999: that.page_bad('reload'); return;
            case 904: tip = '您已中奖'; that.page_result(); return;
            case 900: tip = '您已中奖'; that.page_result(); return;
          };
          wx.showToast({
            title: tip,
            duration: 999999,
            mask: true,
          });
          // wx.showModal({
          //   content: tip + '\n刷新页面？',
          //   success: function () {
          //     wx.reLaunch({
          //       url: '/pages/shake/index/index',
          //     });
          //   }
          // });
        }
      },
      error: function () {
        wx.hideLoading();
        wx.showToast({
          title: '接口出错咯',
          icon: 'cancel',
        });
      },
    });
  },

  // --------------------------------- 图片加载 No.2
  needImage2: function () {
    resource = [[], [], [], [], []];
    this.load(0, 0);
  },
  load: function (i, j) {
    if (!imgs[i]) return;
    this.count = this.count ? ++this.count : 1;
    if (j < imgs[i][0]) {
      var url = imgBaseUrl;
      wx.downloadFile({
        url: url + i + '/' + j + imgs[i][1],
        success: function (res) {
          resource[i][j] = res.tempFilePath;
          var progress = parseInt(this.count / imgTotal * 100, 10)
          this.setData({
            imgLoadProgress: Math.min(progress, 100),
          });
          if (this.count >= imgTotal) {
            this.imgLoaded();
          }
          this.load(i, ++j);
        }.bind(this),
      });
    } else {
      this.load(++i, 0);
    }
  },

  // ---------------------------------- 图片加载 No.1
  needImage: function (cb) {
    this.setData({ imgs: imgs });
    let count = 0, that = this;
    for (let i = 0, l = imgs.length; i < l; i++) {
      let one = imgs[i];
      imgTotal += one[0];
      resource[i] = [];
      for (let j = 0; j < one[0]; j++) {
        resource[i][j] = imgBaseUrl + i + '/' + j + one[1];
      }
    }
  },
  imgLoad: function () {
    this.count = this.count ? ++this.count : 1;
    var progress = parseInt(this.count / imgTotal * 100, 10)
    this.setData({
      imgLoadProgress: Math.min(progress, 100),
    });
    if (this.count >= imgTotal) {
      this.imgLoaded();
    }
  },
  imgLoaded: function () {
    main_start && main_start();
  },

  // ---------------------------------- 显示页面
  page_welcome: function () {
    this.data.page.load = false;
    this.data.page.welcome = true;
    this.setData({
      page: this.data.page,
    });
  },
  page_start: function () {
    this.data.page.welcome = false;
    this.data.page.start = true;
    audio.clock.pause();
    audio.bgm.pause();
    audio.ready.play();
    this.setData({
      beforeShake: true,
      page: this.data.page
    });
    setTimeout(function () {
      this.setData({ beforeShake2: true })
    }.bind(this), 1400);
    setTimeout(function () {
      // audio.ready.pause();
      // this.page_train();
      canClick = true;
      this.startShake();
      this.setData({
        beforeShake: false,
        beforeShake2: false,
      });
    }.bind(this), 2000);
  },
  page_train: function () {
    this.data.page.start = false;
    this.data.page.train = true;
    this.setData({
      beforeShake: false,
      page: this.data.page,
    });
    ctx = wx.createCanvasContext('imgs');
    speed = 0;
    item = 0;
    shakeMax = 5;
    tick = smooth(run, 100, true);
    audio.bgm.pause();
    audio.train.play();
  },
  page_finish: function () {
    audio.finish.play();
    this.getImgCode();
    this.data.page.load = false;
    this.data.page.finish = true;
    this.setData({
      page: this.data.page,
    });
    setTimeout(function () {
      this.data.page.train = false;
      this.data.page.justify = true;
      this.setData({
        page: this.data.page,
      });
    }.bind(this), 1800);
  },
  page_prize: function () {
    audio.finish.pause();
    audio.result.play();
    this.data.page.justify = false;
    this.data.page.prize = true;
    this.setData({
      page: this.data.page,
    });
  },
  page_result: function () {
    audio.bad.pause();
    audio.good.pause();
    audio.result.play();
    this.data.page.prize = false;
    this.data.page.result = true;
    this.setData({
      page: this.data.page,
    });
  },
  page_good: function () {
    audio.result.pause();
    audio.good.play();
    this.data.page.prize = false;
    this.data.page.good = true;
    this.setData({
      page: this.data.page,
    });
  },
  page_bad: function (re) {
    audio.result.pause();
    audio.bad.play();
    this.data.page.prize = false;
    this.data.page.bad = true;
    this.setData({
      left: Math.max(--this.data.left, 0),
      page: this.data.page,
      reload: re ? true : false,
    });
  },
  result_ok: function() {
    wx.showModal({
      title: '每位用户只能中奖一次哟',
      content: '请在领奖时间内前往领奖地点凭此二维码领取精美礼品。',
    });
  },


  // 图形验证码
  getImgCode: function () {
    var that = this;
    wx.request({
      url: 'https://sum.kdcer.com/api/OpenShop/GetRndCode',
      data: {
        Unionid: id,
      },
      success: function (r) {
        console.log(r)
        var answer = that.outOrder(r.data.answerPic);
        that.rightAnswer = r.data.Right;
        that.setData({
          code_question: r.data.quest,
          code_answers: answer,
        });
      },
      error: function (err) {
        wx.showToast({
          title: '接口报错' + JSON.stringify(err),
        })
      }
    });
  },
  // 答案改为乱序
  outOrder: function (data) {
    var result = [], keys = [];
    for (var i in data) keys.push(i);
    keys = keys.sort(function () { return Math.random() > 0.5 });
    for (var i in keys) {
      result.push({
        name: keys[i],
        url: data[keys[i]],
        active: false,
      });
    }
    return result;
  },
  // 开启摇一摇
  shakeTest: function () {
    if (!canClick) return;
    this.one();
  },
  startShake: function () {
    this.shake = Shake(function () {
      if (!canClick) return;
      this.one();
    }.bind(this), 50, 200);
  },
  stopShake: function () {
    this.shake && this.shake.stop();
    wx.stopAccelerometer();
  },

  // 摇地铁效果
  one: function () {
    if (!this.data.page.train) {
      this.page_train(); return;
    }
    shakeMax--;
    audio.shake.pause();
    audio.shake.seek(0);
    audio.shake.play();
    // shakeTimerFlag = false;
    if (shakeMax > 0) {
      // audio.bgm.volume = 1;
      speed = Math.min(2, ++speed);
      tick.stop();
      tick = smooth(run, (2 - speed) * 50, true);
    } else if (shakeMax == 0) {
      tick.stop();
      tick = smooth(this.end1, 50, true);
    }
    clearInterval(shakeTimer);
    shakeTimer = setInterval(function () {
      // if (!shakeTimerFlag) return;
      // shakeTimerFlag = true;
      speed = Math.max(0, --speed);
      // audio.bgm.volume = 0.3;
    }, 500);

    clearTimeout(shakeTimer2);
    this.data.page.shake2 = false;
    this.setData({ page: this.data.page });
    shakeTimer2 = setTimeout(function () {
      if (speed < 1) {
        this.data.page.shake2 = true;
        this.setData({ page: this.data.page });
        console.log(this.data.page, shake2)
      }
    }.bind(this), 2000);
    console.log(this.data.page.shake2)
  },
  end1: function () {
    this.stopShake();
    clearInterval(shakeTimer);
    canClick = false;
    if (item < imgs[speed][0]) {
      if (++item <= imgs[speed][0] - 1) {
        Draw(resource[speed][item]);
      } else {
        speed = 3;
        item = 0;
        tick.stop();
        tick = smooth(run, 50, imgs[speed][0] - 1, this.finish);
      }
    }
  },
  finish: function () {
    canClick = false;
    // audio.bgm.volume = 0;
    audio.train.pause();
    speed = 4;
    item = 0;
    tick = smooth(function () {
      speed = 4;
      run('fire')
    }, 200, true);
    this.page_finish();
  },
});

// 节流函数
var tId = null;
function throttle(method, context) {
  tId && clearTimeout(tId);
  tId = setTimeout(function () {
    method.call(context);
  }, 200);
}

// 每摇一次的交互
var shakeMax = 5;
var shakeTimer = null;
var shakeTimerFlag = false;
var shakeTimer2 = null; // 不摇显示继续摇

// 每个动画帧的运算
var speed = 0, item = 0;
var tick = null;
function run(e) {
  if (speed < 0) { Draw(resource[0][0]); return; }
  if (++item > imgs[speed][0] - 1) item = 0;
  Draw(resource[speed][item], typeof e === 'string');
}

// 绘制一张图片
function Draw(img, specail) {
  // console.log(img, ctx)
  if (!img) return;
  if (!ctx) return;
  ctx.clearRect(0, 0, winW, winH);
  if (!specail) {
    ctx.drawImage(img, 0, 0, winW, winH);
  } else {
    // console.log(ctx, img);
    ctx.drawImage(img, 0, -100, winW, winH);
  }
  ctx.draw();
  // console.log(img, ctx)
  // ctx.actions = [];
}

function Shake(fn, sensitive, timeGap) {
  var lastTime = new Date();
  var lastX = null, lastY = null, lastZ = null;
  var sensitive = sensitive || 80;
  var timeGap = timeGap || 200;
  var isActive = true;
  wx.onAccelerometerChange(function (res) {
    if (!isActive) return;
    // res = res.accelerationIncludingGravity;
    var currentTime;
    var timeDifference;
    var deltaX = 0, deltaY = 0, deltaZ = 0;
    if ((lastX === null) && (lastY === null) && (lastZ === null)) {
      lastX = res.x; lastY = res.y; lastZ = res.z; return;
    }
    deltaX = Math.abs(lastX - res.x) * 100;
    deltaY = Math.abs(lastY - res.y) * 100;
    deltaZ = Math.abs(lastZ - res.z) * 100;
    if (((deltaX > sensitive) && (deltaY > sensitive)) ||
      ((deltaX > sensitive) && (deltaZ > sensitive)) ||
      ((deltaY > sensitive) && (deltaZ > sensitive))) {
      currentTime = new Date();
      timeDifference = currentTime.getTime() - lastTime.getTime();

      if (timeDifference > timeGap) {
        fn && fn(timeDifference);
        lastTime = new Date();
      }
    }
    lastX = res.x; lastY = res.y; lastZ = res.z;
  });
  return {
    stop: function () {
      isActive = false;
    }
  }
}

// 区间内持续时间的变化
function smooth(fn, duration, option, finish) {
  var type, per, now = Date.now(), Timer, count = 0, playing = true;

  var _optionType = app.Type(option);
  if (_optionType === 'boolean') { // 循环模式
    type = 'infinite';
    duration = duration || 25;
  } else if (_optionType === 'number') { // 限定次数
    type = 'remain';
    duration = duration || 25;
    var remain = option;
  } else {    // 运行一次，但 duration 期间按设备性能持续运行 fn
    type = 'animate';
    duration = duration || 1000;
    if (option) finish = option;
  }

  _run();
  function _run() {
    if (!playing) { cancelAnimationFrame(Timer); return; }
    per = Math.min(1, (Date.now() - now) / duration);
    if (per < 1) {
      if (type === 'animate') fn(per, ++count);
      Timer = requestAnimationFrame(_run);
    } else {
      if (type === 'animate' && finish) finish();
      if (type === 'infinite' || count < remain) {
        now = Date.now();
        fn(++count);
        if (count === remain && finish) finish()
        Timer = requestAnimationFrame(_run);
      } else {
        cancelAnimationFrame(Timer);
      }
    }
  }

  return {
    stop: function () {
      playing = false;
      cancelAnimationFrame(Timer);
    }
  }
}