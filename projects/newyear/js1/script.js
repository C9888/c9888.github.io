$(document).ready(function() {

    var envelope = $('#envelope');
    var btn_open = $("#open");
    var btn_reset = $("#reset");

    // 定义一个变量存储定时器ID
    var timerId;

    // 点击信封或打开按钮时触发的函数
    function open() {
        envelope.addClass("open")
            .removeClass("close");

        // 开始计时，5秒钟后跳转页面
        timerId = setTimeout(function() {
            window.location.href = "羊.html";
        }, 5000);
    }

    // 点击重置按钮时触发的函数
    function close() {
        envelope.addClass("close")
            .removeClass("open");

        // 清除定时器
        clearTimeout(timerId);

        // 延迟1秒后跳转页面
        setTimeout(function() {
            window.location.href = "爱心打字.html";
        }, 1000);
    }

    envelope.click(open);
    btn_open.click(open);
    btn_reset.click(close);

});