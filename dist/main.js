(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Canvas = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var microevent = function () {
	function microevent() {
		classCallCheck(this, microevent);
	}

	createClass(microevent, [{
		key: "bind",
		value: function bind(event, fct) {
			this._events = this._events || {};
			this._events[event] = this._events[event] || [];
			this._events[event].push(fct);
		}
	}, {
		key: "unbind",
		value: function unbind(event, fct) {
			this._events = this._events || {};
			if (event in this._events === false) return;
			this._events[event].splice(this._events[event].indexOf(fct), 1);
		}
	}, {
		key: "trigger",
		value: function trigger(event /* , args... */) {
			this._events = this._events || {};
			if (event in this._events === false) return;
			for (var i = 0; i < this._events[event].length; i++) {
				this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	}]);
	return microevent;
}();

function realSize(size, zoom) {
    return Math.max(Math.floor(size / zoom), 0);
}

function fixSize(size, zoom) {
    return Math.max(size / zoom, 1);
}

var uniqueId = function () {
    var types = {};
    return function (type) {
        if (typeof types[type] == "undefined") {
            types[type] = 0;
        }
        types[type] += 1;
        return types[type];
    };
}();

var util = {
    uniqueId: uniqueId,
    realSize: realSize,
    fixSize: fixSize
};

var Plugin = function (_Event) {
    inherits(Plugin, _Event);

    function Plugin(parent, options) {
        classCallCheck(this, Plugin);

        var _this = possibleConstructorReturn(this, (Plugin.__proto__ || Object.getPrototypeOf(Plugin)).call(this));

        _this.parent = parent;
        _this.canvas = parent;
        _this.layers = _this.canvas.layers;

        _this.options = $.extend(true, {}, options || {});

        _this.container = _this.canvas.main[0];

        _this.initProps();

        _this.bindEvent();

        return _this;
    }

    createClass(Plugin, [{
        key: "initProps",
        value: function initProps() {}
    }, {
        key: "bindEvent",
        value: function bindEvent() {}
    }, {
        key: "addShape",
        value: function addShape(type, points) {
            this.parent.add({
                type: type,
                points: points
            });
        }
    }, {
        key: "getZoomSize",
        value: function getZoomSize(size) {
            var zoom = this.canvas.size.zoom || 1;
            return util.realSize(size, zoom);
        }
    }, {
        key: "getFixSize",
        value: function getFixSize(size) {
            var zoom = this.canvas.size.zoom || 1;
            return util.fixSize(size, zoom);
        }
    }, {
        key: "getRealOffset",
        value: function getRealOffset(e) {
            // 最外层的位置
            var mainOffset = $(this.canvas.main).offset();
            // 鼠标点击在页面上的位置
            var pageSet = {
                x: e.pageX,
                y: e.pageY
            };
            // // canvas svg的位置，padding
            // var canvasOffset = $(this.canvas.main).position();
            // // canvas的滚动位置，scrollLeft, scrollTop
            // var canvas2Offset = $(this.canvas.canvas).position();

            // var offsetX = pageSet.x - mainOffset.left - canvasOffset.left - canvas2Offset.left;
            // var offsetY = pageSet.y - mainOffset.top - canvasOffset.top - canvas2Offset.top;

            var offsetX = pageSet.x - mainOffset.left;
            var offsetY = pageSet.y - mainOffset.top;

            // console.log(mainOffset, pageSet, canvasOffset,canvas2Offset,  offsetX, offsetY)
            if (offsetX < 0) {
                offsetX = Math.min(0, offsetX);
            }

            if (offsetY < 0) {
                offsetY = Math.min(0, offsetY);
            }

            return {
                offsetX: offsetX,
                offsetY: offsetY
            };
        }
    }, {
        key: "endDraw",
        value: function endDraw() {}
    }, {
        key: "destroy",
        value: function destroy() {}
    }]);
    return Plugin;
}(microevent);

function getPath(x1, y1, x2, y2) {
    return "M" + x1 + " " + y1 + " L" + x2 + " " + y2;
}

function IsPolygonSelfIntersect(pts, isLast) {
    if (pts.length <= 3) {
        return false;
    }
    var max = pts.length;
    if (isLast) {
        max += 1;
    }
    for (var i = 3; i < max; i++) {
        for (var j = 1; j < i - 1; j++) {
            if (i == pts.length && j == 1) continue;
            if (IsSegmentIntersect(pts[i - 1], pts[i % pts.length], pts[j - 1], pts[j])) {
                return true;
            }
        }
    }
    return false;
}

function IsSegmentIntersect(pa, pb, pc, pd) {
    var vca = [pa.x - pc.x, pa.y - pc.y];
    var vcd = [pd.x - pc.x, pd.y - pc.y];
    var vcb = [pb.x - pc.x, pb.y - pc.y];

    var vac = [pc.x - pa.x, pc.y - pa.y];
    var vab = [pb.x - pa.x, pb.y - pa.y];
    var vad = [pd.x - pa.x, pd.y - pa.y];

    return Cross2dVectors(vca, vcd) * Cross2dVectors(vcb, vcd) <= 0 && Cross2dVectors(vac, vab) * Cross2dVectors(vad, vab) <= 0;
}

function Cross2dVectors(vec1, vec2) {
    return vec1[0] * vec2[1] - vec2[0] * vec1[1];
}

var pointRadius = 5;
var pathWidth = 1;
var Polygon = function (_Plugin) {
    inherits(Polygon, _Plugin);

    function Polygon(parent, options) {
        classCallCheck(this, Polygon);
        return possibleConstructorReturn(this, (Polygon.__proto__ || Object.getPrototypeOf(Polygon)).call(this, parent, options));
    }

    createClass(Polygon, [{
        key: "clear",
        value: function clear() {
            this.initProps();
            this.el && this.el.remove();
        }
    }, {
        key: "initProps",
        value: function initProps() {
            // 开始状态
            this.isStart = false;
            // 点的长度
            this.count = 0;

            // 点开始的位置
            this.startX = 0;
            this.startY = 0;

            this.x = 0;
            this.y = 0;

            this.firstX = 0;
            this.firstY = 0;

            this.points = [];
        }
    }, {
        key: "bindEvent",
        value: function bindEvent() {
            $(this.canvas.main).on('mousedown.Polygon', ".svg-mask", this.mousedown.bind(this));

            $("body").on("mousemove.Polygon", this.mousemove.bind(this));
        }
    }, {
        key: "mousedown",
        value: function mousedown(e) {
            e.preventDefault();
            if (e.button != 0 || this.parent.isDisabled) return false;

            var offset = this.getRealOffset(e);
            this.x = this.getZoomSize(offset.offsetX);
            this.y = this.getZoomSize(offset.offsetY);

            var pointInCanvas = this.checkPointInCanvas(this.x, this.y);

            if (!pointInCanvas) {
                console.warn("point is not in canvas");
                return false;
            }

            this.startX = e.pageX;
            this.startY = e.pageY;
            this.count++;

            if (!this.isStart) {

                this.parent.trigger('polygon:beforestart', this.points);
                this.firstX = this.x;
                this.firstY = this.y;

                this.drawPoint(this.x, this.y);

                this.isStart = true;
                this.parent.trigger('polygon:start', this.points);
            } else {
                var isEnd = this.isEnd(this.x, this.y);
                if (isEnd) {
                    if (this.count <= 3) {
                        this.count--;
                        this.parent.trigger('polygon:pointerror', {
                            x: x,
                            y: y
                        });
                    } else {
                        this.drawEnd(this.firstX, this.firstY);
                    }
                }

                // else if (this.count == 10){
                //     let s = this.drawLine(this.x, this.y);
                //     if(!s){
                //         return false;
                //     }
                //     this.drawEnd(this.firstX, this.firstY);
                // }

                else {
                        this.drawLine(this.x, this.y);
                    }
            }
        }
    }, {
        key: "checkPointInCanvas",
        value: function checkPointInCanvas(x, y) {
            var size = this.parent.size;
            return x > 0 && x <= size.width && y > 0 && y <= size.height;
        }
    }, {
        key: "mousemove",
        value: function mousemove(e) {
            if (!this.isStart) {
                return false;
            }

            var offset = this.getRealOffset(e);
            var x2 = this.getZoomSize(offset.offsetX);
            var y2 = this.getZoomSize(offset.offsetY);
            this.updatePath(x2, y2);
        }
    }, {
        key: "drawPoint",
        value: function drawPoint(x, y) {
            var canvas = this.canvas;
            var set$$1 = this.layers.add([{

                "type": "path",
                "path": getPath(x, y, x, y),
                "fill": "transparent",
                "stroke-width": this.getFixSize(pathWidth),
                "stroke": this.parent.get("foreground")

            }]);

            var p = this._drawCircle(x, y);

            set$$1.push(p);

            this.el = set$$1;

            this.points = [{
                x: x,
                y: y
            }];
        }
    }, {
        key: "drawLine",
        value: function drawLine(x, y) {
            var points = this.points.slice(0);
            points.push({
                x: x,
                y: y
            });
            if (IsPolygonSelfIntersect(points)) {
                this.count--;
                this.parent.trigger('polygon:pointerror', "不能是相交的线", this.points);
                return false;
            }
            var el = this.el[0];
            var path = el.attr('path');
            path.push(["L", x, y]);
            el.attr('path', path);

            var p = this._drawCircle(x, y);

            this.el.push(p);

            this.points.push({
                x: x,
                y: y
            });

            return true;
        }
    }, {
        key: "_drawCircle",
        value: function _drawCircle(x, y) {
            var r = this.getFixSize(pointRadius);
            // draw point
            var p = this.layers.add([{
                type: "circle",
                r: r,
                cx: x,
                cy: y,
                "fill": this.parent.get("background"),
                "stroke-width": 1,
                "stroke": this.parent.get("foreground")
            }]);
            return p;
        }
    }, {
        key: "drawEnd",
        value: function drawEnd(x, y) {
            var el = this.el[0];
            var path = el.attr('path');
            path[path.length - 1] = ["Z"];
            el.attr('path', path);

            var invalid = IsPolygonSelfIntersect(this.points, true);

            if (invalid) {
                $(this.parent).trigger('c:patherror', "不能存在相交的线", this.points);
                return false;
            }

            this.count = 0;
            this.isStart = false;
            this.el.remove();

            this.addShape("polygon", this.points.splice(0));
        }
    }, {
        key: "isEnd",
        value: function isEnd(x, y) {
            var step = Math.max(this.getZoomSize(5), 5);
            return this.firstX - step < x && this.firstX + step > x && this.firstY - step < y && this.firstY + step > y;
        }
    }, {
        key: "updatePath",
        value: function updatePath(x, y) {
            var el = this.el[0];
            var path = el.attr('path');
            var last = path[path.length - 1];
            last[1] = x;
            last[2] = y;
            el.attr('path', path);
        }
    }], [{
        key: "draw",
        value: function draw(paper, points, attr) {
            var path = points.map(function (item, index) {
                // return (index == 0 ?"M": "L") + item.x+ " "+ item.y
                return [index == 0 ? "M" : "L", item.x, item.y];
            });
            path.push("Z");

            attr = $.extend({

                "type": "path",
                "path": path.join(""),
                "stroke-width": 1,
                "stroke": "#000"

            }, attr || {});

            return paper.path().attr(attr);
        }
    }]);
    return Polygon;
}(Plugin);

// dependencies: jquery, raphael

var Canvas$1 = function (_Event) {
  inherits(Canvas, _Event);

  function Canvas(container) {
    classCallCheck(this, Canvas);

    var _this = possibleConstructorReturn(this, (Canvas.__proto__ || Object.getPrototypeOf(Canvas)).call(this));

    _this.container = $(container);

    // 画布区域
    _this.main = _this.canvas = $('<div class="canvas">').appendTo(container);
    // 背景图层
    // this.bgOuter = $('<div class="bg-container">').appendTo(this.canvas);
    // 形状图层
    _this.layersOuter = $('<div class="layers-container">').appendTo(_this.canvas);
    // 遮挡图层
    _this.mask = $('<div class="svg-mask">').appendTo(_this.canvas);

    _this.initProps();
    _this.createSVG();
    return _this;
  }

  createClass(Canvas, [{
    key: "initProps",
    value: function initProps() {
      this.set('foreground', '#000');
      this.set('background', '#fff');

      this.isDisabled = false;
      this.size = {
        width: this.container.outerWidth(),
        height: this.container.outerHeight(),
        zoom: 1
      };
      this.list = [];
    }
  }, {
    key: "createSVG",
    value: function createSVG() {
      var width = this.size.width;
      var height = this.size.height;

      // raphael添加svg, 向前添加
      this.paper = Raphael(this.layersOuter.get(0), width, height);

      // 添加画布
      this.layers = this.paper;

      this.resize(width, height);
    }
  }, {
    key: "clear",
    value: function clear() {
      this.paper.clear();
      this.list = [];
    }
  }, {
    key: "resize",
    value: function resize(width, height) {
      var size = {
        width: width,
        height: height
      };
      $.extend(this.size, size);
      this.paper.setSize(width, height).setViewBox(0, 0, width, height);
      this.mask.css(size);
    }
  }, {
    key: "set",
    value: function set$$1(name, value) {
      this[name] = value;
      if (name == "isDisabled" && this.plugin) {
        this.plugin.clear();
      }
      this.trigger('propschange', name, value);
      // eve('canvas.' + name, this, value);
    }
  }, {
    key: "get",
    value: function get$$1(name) {
      return name.substr(0, 1) != "_" ? this[name] : "";
    }
  }, {
    key: "switch",
    value: function _switch(name) {
      var plugin = this.plugin;
      if (plugin) {
        plugin.destroy();
      }
      var ClassPlugin = Canvas.getPlugin(name);
      this.plugin = new ClassPlugin(this);
    }
  }, {
    key: "zoomOut",
    value: function zoomOut() {}
  }, {
    key: "zoomIn",
    value: function zoomIn() {}
  }, {
    key: "add",
    value: function add(shape) {
      var type = shape.type;
      var plugin = Canvas.getPlugin(type);
      var element = plugin.draw(this.layers, shape.points, shape.attr);
      this.trigger('shapes', shape);
      this.list.push(element);
    }
  }], [{
    key: "getPlugin",
    value: function getPlugin(name) {
      if (Canvas._plugins) {
        return Canvas._plugins[name];
      }
      return null;
    }
  }, {
    key: "register",
    value: function register(name, pluginClass) {
      if (!Canvas._plugins) {
        Canvas._plugins = {};
      }
      Canvas._plugins[name] = pluginClass;
    }
  }]);
  return Canvas;
}(microevent);

Canvas$1.register("polygon", Polygon);

return Canvas$1;

})));
