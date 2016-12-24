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
    'jquery',
    'vis'
], function (require, $, vis) {
    'use strict';
    var options = {
        nodes: {
            shape: 'dot',
            scaling:{
            label: {
                  min:8,
                  max:20
                }
            }
        },
        edges: {
            color: {
                highlight:'#d2811c',
                hover: '#d2189e'
            }
        }
    };

    function renderVis(res) {
        var nodes = new vis.DataSet(res.nodes);
        var edges = new vis.DataSet(res.edges);
        var data = {
            nodes: nodes,
            edges: edges
        };
        var network = new vis.Network($nlp[0], data, options);
        network.on("doubleClick", function (params) {
            var nodeId = params.nodes[0];
            if (nodeId) {
                $.ajax({
                    'url': '/delete',
                    'method': 'POST',
                    'data': {
                        data: nodeId
                    }
                }).then(function (res) {
                    renderVis(res);
                });
            }
        });
    }

    var $element = $(document);
    var $nlp = $element.find('#pythonnlp');
    var $submit = $element.find('input[type="submit"]');
    var $clear = $element.find('input[value="clear"]');
    var $input = $element.find('input[name="words"]');
    $clear.on('click', function () {
        $.ajax({
            url: "/clear"
        }).then(function (res) {
            renderVis(res);
        });
    });
    $submit.on('click', function () {
        $.ajax({
            method: "POST",
            url: "/add",
            data: {
                data: $input.val()
            }
        }).then(function (res) {
            renderVis(res);
        });
    });

    //load data
    $.ajax({
        'url': '/load'
    }).then(function (res) {
        renderVis(res);
    });
});
