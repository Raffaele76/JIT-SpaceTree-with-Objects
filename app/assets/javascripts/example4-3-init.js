/*
 * JavaScript to render a SpaceTree for the project tree
 */

var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text) {
    if (!this.elem)
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};

// get the updated JSON if user presses "enter" (key code of 13) on the keyboard after updating a name in the project folder view
// jQuery('#instant_textfield').live('keypress', function(event) {
  // if( event.keyCode == 13 )
  // {
    // var fsd_id = jQuery('.function_structure_diagram_li:first').attr('id').slice(0,-30);
    // jQuery.getJSON("/function_structure_diagrams/update/"+fsd_id+".json", function(fsdJSON) {
      // console.log( JSON.stringify(fsdJSON) );
    // });
    // console.log( jQuery(this).attr('value') );
    // init();
  // }
// });

function init() {

  //init data
  // get the JSON representation, starting with the object category (with ID of 1) as the root node, to be rendered in the JIT tree
  jQuery.getJSON("/object_categories/1.json", function(fsdJSON) {

    //init Spacetree
    //Create a new ST instance
    var st = new $jit.ST({
      //id of viz container element
      injectInto: 'infovis',
      //set duration for the animation
      duration: 800,
      //set animation transition type
      transition: $jit.Trans.Quart.easeInOut,
      //set distance between node and its children
      levelDistance: 50,
      //enable panning
      Navigation: {
        enable:true,
        panning:true
      },
      //set node and edge styles
      //set overridable=true for styling individual
      //nodes or edges
      Node: {
        height: 20,
        width: 60,
        type: 'rectangle',
        color: '#aaa',
        overridable: true
      },
      Edge: {
        type: 'bezier',
        overridable: true
      },
      //Add a request method for requesting on-demand json trees.
      //This method gets called when a node
      //is clicked and its subtree has a smaller depth
      //than the one specified by the levelsToShow parameter.
      //In that case a subtree is requested and is added to the dataset.
      //This method is asynchronous, so you can make an Ajax request for that
      //subtree and then handle it to the onComplete callback.
      //Here we just use a client-side tree generator (the getTree function).
      // request: function(nodeId, level, onComplete) {
        // var ans = getTree(nodeId, level);
        // onComplete.onComplete(nodeId, ans);

        // var data;
        // onComplete(nodeId, data);
      // },
      onBeforeCompute: function(node) {
        Log.write("loading " + node.name);
      },
      onAfterCompute: function() {
        Log.write("done");
      },
      //This method is called on DOM label creation.
      //Use this method to add event handlers and styles to
      //your node.
      onCreateLabel: function(label, node) {
        label.id = node.id;
        label.innerHTML = node.name;
        label.onclick = function() {
          if(normal.checked) {
            st.onClick(node.id);
          } else {
            st.setRoot(node.id, 'animate');
          }
        };
        //set label styles
        var style = label.style;
        style.width = 60 + 'px';
        style.height = 17 + 'px';
        style.cursor = 'pointer';
        style.color = '#333';
        style.fontSize = '0.8em';
        style.textAlign= 'center';
        style.paddingTop = '3px';
      },
      //This method is called right before plotting
      //a node. It's useful for changing an individual node
      //style properties before plotting it.
      //The data properties prefixed with a dollar
      //sign will override the global node style properties.
      onBeforePlotNode: function(node) {
        //add some color to the nodes in the path between the
        //root node and the selected node.
        if (node.selected) {
          node.data.$color = "#ff7";
        }
        else {
          delete node.data.$color;
          //if the node belongs to the last plotted level
          if(!node.anySubnode("exist")) {
            //count children number
            var count = 0;
            node.eachSubnode(function(n) { count++; });
            //assign a node color based on
            //how many children it has
            node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
          }
        }
      },
      //This method is called right before plotting
      //an edge. It's useful for changing an individual edge
      //style properties before plotting it.
      //Edge data proprties prefixed with a dollar sign will
      //override the Edge global style properties.
      onBeforePlotLine: function(adj) {
        if (adj.nodeFrom.selected && adj.nodeTo.selected) {
          adj.data.$color = "#eed";
          adj.data.$lineWidth = 3;
        }
        else {
          delete adj.data.$color;
          delete adj.data.$lineWidth;
        }
      },
      Events: {
        enable: true,
        onRightClick: function(node, eventInfo, e) {
          // if a node is right clicked
          if( node )
          {
            alert( node.name );
          }
        }
      }
    });

    //load json data
    st.loadJSON(fsdJSON);
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree
    st.geom.translate(new $jit.Complex(-200, 0), "current");
    //emulate a click on the root node.
    st.onClick(st.root);

    //Add event handlers to switch spacetree orientation.
    var top = $jit.id('r-top'),
        left = $jit.id('r-left'),
        bottom = $jit.id('r-bottom'),
        right = $jit.id('r-right'),
        normal = $jit.id('s-normal');
    function changeHandler() {
      if(this.checked) {
        top.disabled = bottom.disabled = right.disabled = left.disabled = true;
        st.switchPosition(this.value, "animate", {
          onComplete: function() {
            top.disabled = bottom.disabled = right.disabled = left.disabled = false;
          }
        });
      }
    };
    top.onchange = left.onchange = bottom.onchange = right.onchange = changeHandler;

  });

}
