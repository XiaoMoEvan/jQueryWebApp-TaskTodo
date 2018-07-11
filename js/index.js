;
(function() {
    'user strict';

    var ipAddress,
        $ipAddress = $(".ipAddress"),
        $task_add_submit = $(".task-addBtn"),
        $task_delete = $(".task-delete"),
        $task_list = $(".task-list-body"),
        $task_content = $("#taskContent"),
        $task_remindTime_selectBtn = $(".task-remindTime-select"),
        $task_remindTime = $("#taskRemindTime"),
        $taskCount = $(".taskCount"),
        $task_list_paginationArea = $(".task-list-paginationArea"),
        $task_list_pagination = $(".task_list_pagination"),
        task_list = {},
        $task_list_pagination = $(".task-list-pagination"),
        $number_of_visits = $(".number_of_visits"),
        count_of_visits = 0;

    function getCountOfVisits() {
        count_of_visits = store.get("count_of_visits");
        count_of_visits += 1;
        store.set("count_of_visits", count_of_visits);
        $number_of_visits.text(count_of_visits);
    }

    function getIpAddress() {
        $.get('https://api.ipify.org?format=json')
            .done(function(data) {
                ipAddress = data.ip;
                $ipAddress.html(ipAddress);
            })
    }

    $task_add_submit.on("click", function(e) {
        e.preventDefault();
        add_task_func();
    })
    $task_content.on("keyup", function(e) {
        e.preventDefault();
        var theEvent = e || window.event;
        //浏览器兼容
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code === 13) {
            add_task_func();
        }
    })

    function add_task_func() {
        var $new_task = {};
        $new_task.content = filterXSS($task_content.val());
        $new_task.time = getCurrDate();
        $new_task.remindTime = $task_remindTime.val();
        if (!$new_task.content) {
            layer.msg('您还没有输入任务内容呢~', function() {
                $task_content.focus();
            });
            return;
        };
        $task_content.val(null);
        $task_remindTime.val(getCurrDate());
        add_task($new_task);
    }

    //获取当前时间
    function getCurrDate() {
        var _date = new Date();
        var _newDate =
            _date.getFullYear() + "/" +
            fullNumber((_date.getMonth() + 1)) + "/" +
            fullNumber(_date.getDate()) + " " +
            fullNumber(_date.getHours()) + ":" +
            fullNumber(_date.getMinutes());
        return _newDate;
    }
    //不足10补0
    function fullNumber(parm) {
        var result = parm < 10 ? "0" + parm : parm;
        return result;
    }

    //添加新任务
    function add_task(new_task) {
        task_list.push(new_task);
        store.set("task_list", task_list);
        refresh_task_list();
        toastr.success("新任务添加成功，请记得查看哦~");
    }

    //删除一个任务
    function delete_task(index) {
        if (index === undefined || !task_list[index]) return;
        delete task_list[index];
        refresh_task_list();
    }

    function listen_task_delete() {
        $task_delete.off("click").on("click", function(e) {
            e.preventDefault();
            var $this = $(this);
            var _index = $this.parent().parent().parent().data("index");

            //询问框
            layer.confirm('您确定要删除吗？', {
                btn: ['确定', '取消']
            }, function() {
                delete_task(_index);
                layer.msg('删除成功！', { icon: 1 });
            });
        })
    }

    //刷新任务列表
    function refresh_task_list() {
        store.set("task_list", task_list);
        render_task_list();
    }

    //列表渲染
    function render_task_list() {
        $task_list.html("");
        $.each(task_list, function(index, ele) {
            var $task = render_task_item(ele, index);
            $task_list.append($task);
        })
        if (has_task()) {
            //对表单进行编号
            $(".task-item-index").each(function(index, ele) {
                $(this).text(index + 1);
            });
            task_pagination();
        } else { render_no_task(); }
        $taskCount.text(task_count() + "项");
        $task_delete = $(".task-item-delete");
        listen_task_delete();
    }

    function task_count() {
        var $taskItems = $(".task-list-item");
        return $taskItems.length;
    }

    //判断是否存在任务
    function has_task() {
        var b = false;
        for (var i = 0; i < task_list.length; i++) {
            if (task_list[i]) {
                b = true;
                break;
            }
        }
        return b;
    }

    function render_no_task() {
        $task_list_paginationArea.fadeOut();
        var _no_task_template =
            '<div class="row noTask">' +
            '   <div class="col-md-12">' +
            '       <h3>当前没有任何任务</h3>' +
            '   </div>' +
            '</div>';
        $task_list.html(_no_task_template);
    }
    //渲染单条task
    function render_task_item(task_item, index) {
        if (!task_item || index === undefined) return;
        var _task_item_template = '<div class="row task-list-item"  data-index="' + index + '">' +
            '<div class="col-md-1">' +
            '    <input type="checkbox" name="taskCheck" class="task-item-check">' +
            '</div>' +
            '<div class="col-md-1">' +
            '    <span class="task-item-index"></span>' +
            '</div>' +
            '<div class="col-md-4">' +
            '    <span class="task-item-content">' + task_item.content + '</span>' +
            '</div>' +
            '<div class="col-md-2">' +
            '    <span class="task-item-addTime">' + task_item.time + '</span>' +
            '</div>' +
            '<div class="col-md-2">' +
            '    <span class="task-item-remindTime">' + task_item.remindTime + '</span>' +
            '</div>' +
            '<div class="col-md-2">' +
            '    <span class="task-item-actions">' +
            '        <span class="task-item-action task-item-delete" title="删除">删除</span>' +
            '        <span class="task-item-action task-item-detail" title="详细">详细</span>' +
            '    </span>' +
            '</div>' +
            '</div>';
        return $(_task_item_template);
    }

    //任务列表分页
    function task_pagination() {
        $task_list_paginationArea.fadeIn();
        $task_list_pagination.pagination({
            // totalData: task_count(),
            // showData: 5,
            pageCount: 5,
            jump: true,
            coping: true,
            homePage: '首页',
            endPage: '末页',
            prevContent: '上页',
            nextContent: '下页',
            callback: function(api) {
                //console.log(api.getCurrent());
                //TODO
            }
        });
    }

    //初始化时间选择插件
    $.datetimepicker.setLocale('zh');

    function datetimepickerInit() {
        $task_remindTime.val(getCurrDate());
        $task_remindTime.datetimepicker();
    }
    $task_remindTime_selectBtn.on("click", function(e) {
        e.preventDefault();
        $task_remindTime.datetimepicker("show");
    })

    //初始化网站公告
    function taskNoticeInit() {
        layer.open({
            type: 1,
            title: "网站公告",
            area: '420px;',
            shade: 0.8,
            id: 'Cloud_taskNotice', //设定一个id，防止重复弹出
            resize: false,
            btn: ['去瞧瞧', '算了吧'],
            btnAlign: 'c',
            moveType: 1, //拖拽模式，0或者1
            content: '<div style="padding:30px 40px; line-height: 22px; background-color: #393D49; color: #fff; font-weight: 300;text-align:center;">这是一个简单的管理日常待办事项的jQuery网页应用<br>本人目前正在学习前端，有什么意见或者建议，本人非常乐意和诚恳的接受。<hr>要不...去看看源码？</div>',
            success: function(layero) {
                var btn = layero.find('.layui-layer-btn');
                btn.find('.layui-layer-btn0').attr({
                    href: 'https://github.com/tzxiaomo/jQueryWebApp-TaskTodo/',
                    target: '_blank'
                });
            }
        });
    }

    function consolelogInt() {
        console.log('%c 前端小白者（Me）:UI框架王、插件王、复制粘贴王...', 'color:#009688');
        console.log('%c 哦嚯，完蛋！也许最后前端生涯亡。', 'color:#FF5722');
        console.log('%c =========================================', 'color:#FFB800');
        console.log('%c 二颜（一只徘徊在学习边沿的菜鸡）', 'color:#01AAED');
    }
    //初始化
    function init() {
        getCountOfVisits();
        consolelogInt();
        getIpAddress();
        datetimepickerInit();
        taskNoticeInit();
        toastr.options.positionClass = 'toast-bottom-right';
        //store.clear();
        //获取数据
        task_list = store.get("task_list") || [];
        if (task_list.length)
            refresh_task_list();
        listen_task_delete();
    }
    init();
})();