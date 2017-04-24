requirejs.config({
    baseUrl: 'static/js/libs',
    paths: {
        jquery: 'jquery/jquery-3.1.1',
        vis: 'vis/vis.min'
    }
});

requirejs.onError = function (err) {
    'use strict';
    console.error(err);
};

require(['require',
    'jquery'
], function (require, $) {
    'use strict';
    var $element = $(document);
    var $submit = $element.find('input[type="submit"]');
    var $textarea = $element.find('textarea[name="sql"]');
    $submit.on('click', function () {
        $.ajax({
            method: "POST",
            url: "/copy",
            data: {
                data: JSON.stringify({
                    sql: $textarea.val()
                })
            }
        });
    });
});
