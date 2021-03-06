(() => {
  function DataGenerator () {
    // 状态的映射
    var STATES = {
      newborn: 'newborn', // 刚创建
      timing: 'timing', // 正在倒计时过期处理
      runing: 'runing', // 正在运行中的数据
      overdue: 'overdue' // 已经过期了
    }
    // 存储已配置的获取数据的信息
    var dataList = {}

    /**
     * 设置一个接口数据的获取
     * @param {String} key    一个简单的代号
     * @param {JSON} config   包涵接口路径 接收数据的回调 数据有效期 等等的一些参数
     */
    this.set = function (key, config) {
      dataList[key] = {
        url: config.url,
        callback: config.callback,
        state: STATES.newborn,
        period: config.period || 1000,
        data: null
      }
    }

    /**
     * 从某个接口获取数据
     * @param  {String} key 代号
     */
    this.get = function (key) {
      var dataItem = dataList[key]

      if (!dataItem) { return }

      // 说明数据该更新了
      if (dataItem.state === STATES.overdue || dataItem.state === STATES.newborn) {
        ajax(dataItem)
      } else {
        dataItem.callback(dataItem.data)
      }
    }

    /**
     * 发起ajax请求
     * @param  {JSON} dataItem 某个数据块的配置信息
     */
    function ajax (dataItem) {
      // 表示正在获取数据
      if (dataItem.lock === true) { return }

      // 加锁
      dataItem.lock = true

      // 此处省略ajax  使用setTimeout代替
      setTimeout(function () {
        // 假装数据已经过来了
        var data = new Date()
        // 先设置定时过期任务
        time(dataItem)
        // 存储当前数据
        dataItem.data = data
        // 调用回调
        dataItem.callback(data)
        // 解锁
        dataItem.lock = false
      }, 1)
    }

    /**
     * 设置某个数据过期
     * @param  {JSON} dataItem 某个数据块的配置信息
     */
    function time (dataItem) {
      // 如果当前状态是不是正在计时 就创建一个定时任务
      if (dataItem.state !== STATES.timing) {
        dataItem.state = STATES.timing
        setTimeout(function () {
          // 修改数据状态为已过期
          dataItem.state = STATES.overdue
        }, dataItem.period)
      }
    }
  }
  var dataGenerator = new DataGenerator()

  dataGenerator.set('now', {
    callback: function (date) {
      console.log('获取的时间:' + date.getSeconds() + 's\n实际当前时间:' + new Date().getSeconds() + 's')
    }
  })

  function getDate () {
    dataGenerator.get('now')
    setTimeout(getDate, 1000)
  }
  getDate()
})()
