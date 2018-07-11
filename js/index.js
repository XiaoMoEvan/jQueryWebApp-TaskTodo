;
(function() {
    'user strict';

    var ipAddress,
        $ipAddress = $(".ipAddress"),
        $task_add_submit = $(".task-addBtn"),
        $task_delete = $(".task-delete"),
        $task_list = $(".task-list-body"),
        $task_content = $("#taskContent"),
        $taskCount = $(".taskCount"),
        $task_list_paginationArea = $(".task-list-paginationArea"),
        $task_list_pagination = $(".task_list_pagination"),
        task_list = {}
    $task_list_pagination = $(".task-list-pagination");

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
        $new_task.ip = ipAddress;
        if (!$new_task.content) return;
        $task_content.val(null);
        add_task($new_task);
    }

    //获取当前时间
    function getCurrDate() {
        var _date = new Date();
        var _newDate =
            _date.getFullYear() + "-" +
            fullNumber((_date.getMonth() + 1)) + "-" +
            fullNumber(_date.getDate()) + " " +
            fullNumber(_date.getHours()) + ":" +
            fullNumber(_date.getMinutes()) + ":" +
            fullNumber(_date.getSeconds());
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
            $(".task-index").each(function(index, ele) {
                $(this).text(index + 1);
            });
            task_pagination();
        } else { render_no_task(); }
        $taskCount.text(task_count() + "项");
        $task_delete = $(".task-delete");
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
            '    <input type="checkbox" name="taskCheck">' +
            '</div>' +
            '<div class="col-md-1">' +
            '    <span class="task-index"></span>' +
            '</div>' +
            '<div class="col-md-4">' +
            '    <span class="task-content">' + task_item.content + '</span>' +
            '</div>' +
            '<div class="col-md-2">' +
            '    <span class="task-addTime">' + task_item.time + '</span>' +
            '</div>' +
            '<div class="col-md-2">' +
            '    <span class="task-ipAddress">' + task_item.ip + '</span>' +
            '</div>' +
            '<div class="col-md-2">' +
            '    <span class="task-actions">' +
            '        <span class="task-action task-delete" title="删除">删除</span>' +
            '        <span class="task-action task-detail" title="详细">详细</span>' +
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
                console.log(api.getCurrent())
            }
        });
    }
    //初始化
    function init() {
        getIpAddress();
        //store.clear();
        //获取数据
        task_list = store.get("task_list") || [];
        if (task_list.length)
            refresh_task_list();
        listen_task_delete();
    }
    init();
})();