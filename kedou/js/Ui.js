var is_panel_showing = false;


$(function () {
    var checkbox = $('#checkbox'),
        path = $('#path'),
        bow = $('#bow'),
        male = $('#male');


    checkbox.on('change', function () {
        console.log(1)
        if ($(this).is(':checked')) {
            male.removeClass('ma');
            setTimeout(function () {
                path.addClass('fe');
                male.addClass('fe');
                bow.addClass('fe');
            }, 390);
        } else {
            male.addClass('ma');
            setTimeout(function () {
                path.removeClass('fe');
                male.removeClass('fe');
                bow.removeClass('fe');
            }, 390);
        }
    });


    /////////////////////////////////////////////////////////////////////
    // Variables
    var panel = $("#js-panel");

    // On load, init panel
    var init = function () {

        $("#idok").click(() => {
            hidePanel();

            app.setName($("#nickname").val());
            app.setGender($("#checkbox").is(":checked") ? 2 : 1);

            postSetting2Extension(app.getGender(), app.getName());

        });

        $("#idcancel").click(() => {
            hidePanel();

        });
        $("#js-setting").click(() => {
            showPanel();

        });

        function hidePanel() {
            panel.removeClass("is--open");
            is_panel_showing = false;
            $('#chat').focus();
        }

        function showPanel() {
            is_panel_showing = true;

            //赋值
            $("#nickname").attr("value", app.getName());
            $("#checkbox").attr("checked", 2 == app.getGender());
            checkbox.change();
            panel.addClass("is--open");

            //焦点在字符串末 $("#nickname").focus(); 
            var _val = $("#nickname").val();
            $("#nickname").val("").focus().val(_val);
        }
    }

    init();
});