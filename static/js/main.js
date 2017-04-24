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
        },
        // layout: {
        //     improvedLayout:false
        // },
        // physics: {
        //     stabilization: false,
        //     barnesHut: {
        //         gravitationalConstant: -80000,
        //         springConstant: 0.1,
        //         springLength: 200
        //     }
        // },
        // interaction: {
        //     tooltipDelay: 200,
        //     hideEdgesOnDrag: true
        // }
    };
    var network;
    var allNodes;
    var nodesDataset;
    var highlightActive = false;
    function neighbourhoodHighlight(params) {
        // if something is selected:
        if (params.nodes.length > 0) {
          highlightActive = true;
          var i,j;
          var selectedNode = params.nodes[0];
          var degrees = 2;

          // mark all nodes as hard to read.
          for (var nodeId in allNodes) {
            allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
            if (allNodes[nodeId].hiddenLabel === undefined) {
              allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
              allNodes[nodeId].label = undefined;
            }
          }
          var connectedNodes = network.getConnectedNodes(selectedNode);
          var allConnectedNodes = [];

          // get the second degree nodes
          for (i = 1; i < degrees; i++) {
            for (j = 0; j < connectedNodes.length; j++) {
              allConnectedNodes = allConnectedNodes.concat(network.getConnectedNodes(connectedNodes[j]));
            }
          }

          // all second degree nodes get a different color and their label back
          for (i = 0; i < allConnectedNodes.length; i++) {
            allNodes[allConnectedNodes[i]].color = 'rgba(150,150,150,0.75)';
            if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
              allNodes[allConnectedNodes[i]].label = allNodes[allConnectedNodes[i]].hiddenLabel;
              allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
            }
          }

          // all first degree nodes get their own color and their label back
          for (i = 0; i < connectedNodes.length; i++) {
            allNodes[connectedNodes[i]].color = null;
            if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
              allNodes[connectedNodes[i]].label = allNodes[connectedNodes[i]].hiddenLabel;
              allNodes[connectedNodes[i]].hiddenLabel = undefined;
            }
          }

          // the main node gets its own color and its label back.
          allNodes[selectedNode].color = null;
          if (allNodes[selectedNode].hiddenLabel !== undefined) {
            allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
            allNodes[selectedNode].hiddenLabel = undefined;
          }
        }
        else if (highlightActive === true) {
            // reset all nodes
            for (var nodeId in allNodes) {
                allNodes[nodeId].color = null;
                if (allNodes[nodeId].hiddenLabel !== undefined) {
                  allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
                  allNodes[nodeId].hiddenLabel = undefined;
                }
            }
          highlightActive = false
        }

        // transform the object into an array
        var updateArray = [];
        for (var nodeId in allNodes) {
          if (allNodes.hasOwnProperty(nodeId)) {
            updateArray.push(allNodes[nodeId]);
          }
        }
        nodesDataset.update(updateArray);
      }
    function renderVis(res) {
        var nodes = new vis.DataSet(res.nodes);
        nodesDataset = nodes;
        var edges = new vis.DataSet(res.edges);
        var data = {
            nodes: nodes,
            edges: edges
        };
        network = new vis.Network($nlp[0], data, options);
        window.network = network;
        allNodes = nodesDataset.get({returnType:"Object"});
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
        network.on("click",neighbourhoodHighlight);
    }

    var $element = $(document);
    var $nlp = $element.find('#pythonnlp');
    // var $submit = $element.find('input[type="submit"]');
    var $copysubmit = $element.find('input[value="copy"]');
    var $clear = $element.find('input[value="clear"]');
    var $input = $element.find('input[name="words"]');
    var $textarea = $element.find('textarea[name="sql"]');
    var $trans = $element.find('input[name="trans"]');
    $clear.on('click', function () {
        $.ajax({
            url: "/clear"
        }).then(function (res) {
            renderVis(res);
        });
    });
    // $submit.on('click', function () {
    //     $.ajax({
    //         method: "POST",
    //         url: "/new",
    //         data: {
    //             data: JSON.stringify({
    //                 name: $input.val(),
    //                 trans: $trans.val()
    //             })
    //         }
    //     });
    // });
    $copysubmit.on('click', function () {
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

    //load data
    $.ajax({
        'url': '/load'
    }).then(function (res) {
        renderVis(res);
    });
});
