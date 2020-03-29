/*
* 功能说明：
*   1.点击向右（左）的图标，平滑的切换到下（上）一页
*   2.无限循环切换：第一页的上一页未最后一页，最后一页的下一页是第一页
*   3.每隔3秒钟自动滑到下一页
*   4.当鼠标进入图片区域时候，自动停止切换，当前鼠标离开后，有开始自动切换
*   5.切换页面时，下面的原点也同步更新
*   6.点击圆点图标切换到对应的页
*
*   bug：快速点击数下，翻页不正常
* */
$(function(){
    var $container = $('#container'); //移入图片停止切换需要使用
    var $list = $('#list'); //图片移动，其实是移动list
    var $points = $('#pointsDiv>span'); //原点点击和自动移动
    var $prev = $('#prev'); //向左移动的箭头
    var $next = $('#next'); //向右移动的箭头
    var PAGE_WIDTH = 600;  //一页的宽度
    var TIME = 400; //翻页的持续时间
    var ITEM_TIME = 20; // 单元持续的时间
    var imgCount = $points.length; // 一共有几张照片
    var index = 0; //当前的下标，用来记录第几张照片，同时也是第一个圆点
    var moving = false; //标识是否则正在翻页（默认 没有）

    //1.点击向右（左）的图标，平滑的切换到下（上）一页
    $next.click(function(){
        //平滑翻到下一页
        nextPage(true);
    });
    $prev.click(function(){
        //平滑翻到上一页
        nextPage(false);
    });

    //3.每隔3秒自动滑动到下一页
    var intervalid = setInterval(function(){
        nextPage(true);
    }, 3000);

    //4.当鼠标进入图片区域时候，自动停止切换，当前鼠标离开后，有开始自动切换
    $container.hover(function(){
        clearInterval(intervalid);
    }, function(){
        //重新启动定时器
        intervalid = setInterval(function(){
            nextPage(true);
        }, 3000);
    });

    //点击圆点图标切切换到对应的页
    $points.click(function(){
        //目标页的下标，点击的圆点在兄弟中的下标
        var targetIndex  = $(this).index();
        //只有当点击的不是当前页的圆点时才翻页
        if (targetIndex != index){
            nextPage(targetIndex);
        }
    });

    /*
    * 平滑翻页
    * @param next
    * true : 下一页
    * false ：上一页
    * 数值：指定下标页
    * */
    function nextPage(next) {
        /*
         * 总事件 TIME=400
         * 单元移动的间隔时间 ITEM_TIME = 20
         * 总偏移量：offset
         * 单元移动的偏移量 itemoffset = offset / (TIME/ITEM_TIME)
         * 启动循环定时器不断更新list的left的值，到达目标出停止定时器
         * */

        //如果正在翻页，直接结束
        if (moving){ //已经正在翻页中，不允许继续翻页
            return;
        }

        moving = true;  //标识正在翻页
        var offset = 0;//总的偏移量
        //计算offset
        if (typeof(next) === 'boolean') {
            offset = next ? -PAGE_WIDTH : PAGE_WIDTH;
        } else {
            offset = -(next - index) * PAGE_WIDTH;
        }

        //计算单元移动的偏移量 itemoffset
        var itemoffset = offset / (TIME / ITEM_TIME);

        //获取当前的 left 值
        var currLeft = $list.position().left;
        //计算出目标处的 left 的值
        var targetleft = currLeft + offset;
        //启动循环定时器不断更新list的left的值，到达目标出停止定时器
        var intervalId = setInterval(function () {
            //计算出最新的 left
            currLeft += itemoffset;
            if (currLeft == targetleft) {
                //到达目标位置
                //清除定时器
                clearInterval(intervalId);

                //标识翻页停止
                moving = false;

                //如果到达了最右边的有一张图片（1.jpg），需要跳转到第二张照片（1.jpg）
                //如果到达了第一张照片（5.jpg），需要跳转到倒数第二张（5.jpg）
                //console.log(currLeft, -(imgCount + 1) * PAGE_WIDTH);
                //异常，currLeft在获取的时候是一个浮点数，和整形进行比较的时候会出现异常，也就是无法相等
                if (parseInt(currLeft) === parseInt(-(imgCount + 1) * PAGE_WIDTH)) {
                    currLeft = -PAGE_WIDTH;
                } else if (parseInt(currLeft) === 0) {
                    currLeft = -imgCount * PAGE_WIDTH
                }
            }
            $list.css('left', currLeft);
        }, ITEM_TIME);
        // 更新圆点
        updatePoints(next);
    };

    /*
    * 更新圆点
    * */
    function updatePoints(next){
        //计算出当前目标圆点下标 targetindex
        var targetindex = 0;
        if (typeof(next) == 'boolean'){
            if (next){
                targetindex = index + 1; //[1, imgCount - 1]
                if (targetindex === imgCount){ //此时看到的是第1张照片，第一个圆点
                    targetindex = 0;
                }
            } else {
                targetindex = index - 1;
                if (targetindex === -1){ //此时看到的是第5章照片，第5个圆点
                    targetindex = imgCount - 1;
                }
            }
        } else {
            targetindex = next;
        }

        //将当前 index 的 <span> 的 class 移除
        $points.eq(index).removeClass('on');
        //$points[index].className = '';
        //给目标圆点添加 class='on'
        $points.eq(targetindex).addClass('on');
        //$points[targetindex].className = 'on';
        //将 index 更新为 targetindex
        index = targetindex;
    }

});