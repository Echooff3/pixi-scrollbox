'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PIXI = require('pixi.js');
var Viewport = require('pixi-viewport');
var Ease = require('pixi-ease');

var defaults = require('./defaults');
var DEFAULTS = require('./defaults.json');

var FADE_SCROLLBAR_TIME = 1000;

/**
 * pixi.js scrollbox: a masked content box that can scroll vertically or horizontally with scrollbars
 */

var Scrollbox = function (_PIXI$Container) {
    _inherits(Scrollbox, _PIXI$Container);

    /**
     * create a scrollbox
     * @param {object} options
     * @param {boolean} [options.dragScroll=true] user may drag the content area to scroll content
     * @param {string} [options.overflowX=auto] (none, scroll, hidden, auto) this changes whether the scrollbar is shown
     * @param {string} [options.overflowY=auto] (none, scroll, hidden, auto) this changes whether the scrollbar is shown
     * @param {string} [options.overflow] (none, scroll, hidden, auto) sets overflowX and overflowY to this value
     * @param {number} [options.boxWidth=100] width of scrollbox including scrollbar (in pixels)
     * @param {number} [options.boxHeight=100] height of scrollbox including scrollbar (in pixels)
     * @param {number} [options.scrollbarSize=10] size of scrollbar (in pixels)
     * @param {number} [options.scrollbarOffsetHorizontal=0] offset of horizontal scrollbar (in pixels)
     * @param {number} [options.scrollbarOffsetVertical=0] offset of vertical scrollbar (in pixels)
     * @param {boolean} [options.stopPropagation=true] call stopPropagation on any events that impact scrollbox
     * @param {number} [options.scrollbarBackground=0xdddddd] background color of scrollbar
     * @param {number} [options.scrollbarBackgroundAlpha=1] alpha of background of scrollbar
     * @param {number} [options.scrollbarForeground=0x888888] foreground color of scrollbar
     * @param {number} [options.scrollbarForegroundAlpha=1] alpha of foreground of scrollbar
     * @param {string} [options.underflow=top-left] what to do when content underflows the scrollbox size: none: do nothing; (left/right/center AND top/bottom/center); OR center (e.g., 'top-left', 'center', 'none', 'bottomright')
     * @param {(boolean|number)} [options.fade] fade the scrollbar when not in use (true = 1000ms)
     * @param {number} [options.fadeWait=3000] time to wait before fading the scrollbar if options.fade is set
     * @param {(string|function)} [options.fadeEase=easeInOutSine] easing function to use for fading
     * @param {HTMLElement} [options.divWheel=document.body] div to attach the wheel event
     */
    function Scrollbox(options) {
        _classCallCheck(this, Scrollbox);

        var _this = _possibleConstructorReturn(this, (Scrollbox.__proto__ || Object.getPrototypeOf(Scrollbox)).call(this));

        _this.options = defaults(options, DEFAULTS);
        _this.options.divWheel = _this.options.divWheel || document.body;
        _this.ease = new Ease.list();

        /**
         * content in placed in here
         * you can use any function from pixi-viewport on content to manually move the content (see https://davidfig.github.io/pixi-viewport/jsdoc/)
         * @type {PIXI.extras.Viewport}
         */
        _this.content = _this.addChild(new Viewport({ passiveWheel: _this.options.stopPropagation, stopPropagation: _this.options.stopPropagation, screenWidth: _this.options.boxWidth, screenHeight: _this.options.boxHeight, divWheel: _this.options.divWheel }));
        _this.content.decelerate().on('moved', function () {
            return _this._drawScrollbars();
        });

        /**
         * graphics element for drawing the scrollbars
         * @type {PIXI.Graphics}
         */
        _this.scrollbar = _this.addChild(new PIXI.Graphics());
        _this.scrollbar.interactive = true;
        _this.scrollbar.on('pointerdown', _this.scrollbarDown, _this);
        _this.interactive = true;
        _this.on('pointermove', _this.scrollbarMove, _this);
        _this.on('pointerup', _this.scrollbarUp, _this);
        _this.on('pointercancel', _this.scrollbarUp, _this);
        _this.on('pointerupoutside', _this.scrollbarUp, _this);
        _this._maskContent = _this.addChild(new PIXI.Graphics());
        _this.update();
        return _this;
    }

    /**
     * offset of horizontal scrollbar (in pixels)
     * @type {number}
     */


    _createClass(Scrollbox, [{
        key: '_drawScrollbars',


        /**
         * draws scrollbars
         * @private
         */
        value: function _drawScrollbars() {
            this._isScrollbarHorizontal = this.overflowX === 'scroll' ? true : ['hidden', 'none'].indexOf(this.overflowX) !== -1 ? false : this.scrollWidth > this.options.boxWidth;
            this._isScrollbarVertical = this.overflowY === 'scroll' ? true : ['hidden', 'none'].indexOf(this.overflowY) !== -1 ? false : this.scrollHeight > this.options.boxHeight;
            this.scrollbar.clear();
            var options = {};
            options.left = 0;
            options.right = this.scrollWidth + (this._isScrollbarVertical ? this.options.scrollbarSize : 0);
            options.top = 0;
            options.bottom = this.scrollHeight + (this.isScrollbarHorizontal ? this.options.scrollbarSize : 0);
            var width = this.scrollWidth + (this.isScrollbarVertical ? this.options.scrollbarSize : 0);
            var height = this.scrollHeight + (this.isScrollbarHorizontal ? this.options.scrollbarSize : 0);
            this.scrollbarTop = this.content.top / height * this.boxHeight;
            this.scrollbarTop = this.scrollbarTop < 0 ? 0 : this.scrollbarTop;
            this.scrollbarHeight = this.boxHeight / height * this.boxHeight;
            this.scrollbarHeight = this.scrollbarTop + this.scrollbarHeight > this.boxHeight ? this.boxHeight - this.scrollbarTop : this.scrollbarHeight;
            this.scrollbarLeft = this.content.left / width * this.boxWidth;
            this.scrollbarLeft = this.scrollbarLeft < 0 ? 0 : this.scrollbarLeft;
            this.scrollbarWidth = this.boxWidth / width * this.boxWidth;
            this.scrollbarWidth = this.scrollbarWidth + this.scrollbarLeft > this.boxWidth ? this.boxWidth - this.scrollbarLeft : this.scrollbarWidth;
            if (this.isScrollbarVertical) {
                this.scrollbar.beginFill(this.options.scrollbarBackground, this.options.scrollbarBackgroundAlpha).drawRect(this.boxWidth - this.scrollbarSize + this.options.scrollbarOffsetVertical, 0, this.scrollbarSize, this.boxHeight).endFill();
            }
            if (this.isScrollbarHorizontal) {
                this.scrollbar.beginFill(this.options.scrollbarBackground, this.options.scrollbarBackgroundAlpha).drawRect(0, this.boxHeight - this.scrollbarSize + this.options.scrollbarOffsetHorizontal, this.boxWidth, this.scrollbarSize).endFill();
            }
            if (this.isScrollbarVertical) {
                this.scrollbar.beginFill(this.options.scrollbarForeground, this.options.scrollbarForegroundAlpha).drawRect(this.boxWidth - this.scrollbarSize + this.options.scrollbarOffsetVertical, this.scrollbarTop, this.scrollbarSize, this.scrollbarHeight).endFill();
            }
            if (this.isScrollbarHorizontal) {
                this.scrollbar.beginFill(this.options.scrollbarForeground, this.options.scrollbarForegroundAlpha).drawRect(this.scrollbarLeft, this.boxHeight - this.scrollbarSize + this.options.scrollbarOffsetHorizontal, this.scrollbarWidth, this.scrollbarSize).endFill();
            }
            // this.content.forceHitArea = new PIXI.Rectangle(0, 0 , this.boxWidth, this.boxHeight)
            this.activateFade();
        }

        /**
         * draws mask layer
         * @private
         */

    }, {
        key: '_drawMask',
        value: function _drawMask() {
            this._maskContent.beginFill(0).drawRect(0, 0, this.boxWidth, this.boxHeight).endFill();
            this.content.mask = this._maskContent;
        }

        /**
         * call when scrollbox content changes
         */

    }, {
        key: 'update',
        value: function update() {
            this.content.mask = null;
            this._maskContent.clear();
            if (!this._disabled) {
                this._drawScrollbars();
                this._drawMask();
                if (this.options.dragScroll) {
                    var direction = this.isScrollbarHorizontal && this.isScrollbarVertical ? 'all' : this.isScrollbarHorizontal ? 'x' : 'y';
                    if (direction !== null) {
                        this.content.drag({ clampWheel: true, direction: direction }).clamp({ direction: direction, underflow: this.options.underflow });
                    }
                }
            }
        }

        /**
         * show the scrollbar and restart the timer for fade if options.fade is set
         */

    }, {
        key: 'activateFade',
        value: function activateFade() {
            var _this2 = this;

            if (this.options.fade) {
                if (this.fade) {
                    this.ease.remove(this.fade);
                }
                this.scrollbar.alpha = 1;
                var time = this.options.fade === true ? FADE_SCROLLBAR_TIME : this.options.fade;
                this.fade = this.ease.to(this.scrollbar, { alpha: 0 }, time, { wait: this.options.fadeWait, ease: this.options.fadeEase });
                this.fade.on('each', function () {
                    return _this2.content.dirty = true;
                });
            }
        }

        /**
         * handle pointer down on scrollbar
         * @param {PIXI.interaction.InteractionEvent} e
         * @private
         */

    }, {
        key: 'scrollbarDown',
        value: function scrollbarDown(e) {
            var local = this.toLocal(e.data.global);
            if (this.isScrollbarHorizontal) {
                if (local.y > this.boxHeight - this.scrollbarSize) {
                    if (local.x >= this.scrollbarLeft && local.x <= this.scrollbarLeft + this.scrollbarWidth) {
                        this.pointerDown = { type: 'horizontal', last: local };
                    } else {
                        if (local.x > this.scrollbarLeft) {
                            this.content.left += this.content.worldScreenWidth;
                            this.update();
                        } else {
                            this.content.left -= this.content.worldScreenWidth;
                            this.update();
                        }
                    }
                    if (this.options.stopPropagation) {
                        e.stopPropagation();
                    }
                    return;
                }
            }
            if (this.isScrollbarVertical) {
                if (local.x > this.boxWidth - this.scrollbarSize) {
                    if (local.y >= this.scrollbarTop && local.y <= this.scrollbarTop + this.scrollbarWidth) {
                        this.pointerDown = { type: 'vertical', last: local };
                    } else {
                        if (local.y > this.scrollbarTop) {
                            this.content.top += this.content.worldScreenHeight;
                            this.update();
                        } else {
                            this.content.top -= this.content.worldScreenHeight;
                            this.update();
                        }
                    }
                    if (this.options.stopPropagation) {
                        e.stopPropagation();
                    }
                    return;
                }
            }
        }

        /**
         * handle pointer move on scrollbar
         * @param {PIXI.interaction.InteractionEvent} e
         * @private
         */

    }, {
        key: 'scrollbarMove',
        value: function scrollbarMove(e) {
            if (this.pointerDown) {
                if (this.pointerDown.type === 'horizontal') {
                    var local = this.toLocal(e.data.global);
                    this.content.left += local.x - this.pointerDown.last.x;
                    this.pointerDown.last = local;
                    this.update();
                } else if (this.pointerDown.type === 'vertical') {
                    var _local = this.toLocal(e.data.global);
                    this.content.top += _local.y - this.pointerDown.last.y;
                    this.pointerDown.last = _local;
                    this.update();
                }
                if (this.options.stopPropagation) {
                    e.stopPropagation();
                }
            }
        }

        /**
         * handle pointer down on scrollbar
         * @private
         */

    }, {
        key: 'scrollbarUp',
        value: function scrollbarUp() {
            this.pointerDown = null;
        }

        /**
         * resize the mask for the container
         * @param {object} options
         * @param {number} [options.boxWidth] width of scrollbox including scrollbar (in pixels)
         * @param {number} [options.boxHeight] height of scrollbox including scrollbar (in pixels)
         * @param {number} [options.scrollWidth] set the width of the inside of the scrollbox (leave null to use content.width)
         * @param {number} [options.scrollHeight] set the height of the inside of the scrollbox (leave null to use content.height)
         */

    }, {
        key: 'resize',
        value: function resize(options) {
            this.options.boxWidth = typeof options.boxWidth !== 'undefined' ? options.boxWidth : this.options.boxWidth;
            this.options.boxHeight = typeof options.boxHeight !== 'undefined' ? options.boxHeight : this.options.boxHeight;
            if (options.scrollWidth) {
                this.scrollWidth = options.scrollWidth;
            }
            if (options.scrollHeight) {
                this.scrollHeight = options.scrollHeight;
            }
            this.content.resize(this.options.boxWidth, this.options.boxHeight, this.scrollWidth, this.scrollHeight);
            this.update();
        }

        /**
         * ensure that the bounding box is visible
         * @param {number} x - relative to content's coordinate system
         * @param {number} y
         * @param {number} width
         * @param {number} height
         */

    }, {
        key: 'ensureVisible',
        value: function ensureVisible(x, y, width, height) {
            this.content.ensureVisible(x, y, width, height);
            this._drawScrollbars();
        }
    }, {
        key: 'scrollbarOffsetHorizontal',
        get: function get() {
            return this.options.scrollbarOffsetHorizontal;
        },
        set: function set(value) {
            this.options.scrollbarOffsetHorizontal = value;
        }

        /**
         * offset of vertical scrollbar (in pixels)
         * @type {number}
         */

    }, {
        key: 'scrollbarOffsetVertical',
        get: function get() {
            return this.options.scrollbarOffsetVertical;
        },
        set: function set(value) {
            this.options.scrollbarOffsetVertical = value;
        }

        /**
         * disable the scrollbox (if set to true this will also remove the mask)
         * @type {boolean}
         */

    }, {
        key: 'disable',
        get: function get() {
            return this._disabled;
        },
        set: function set(value) {
            if (this._disabled !== value) {
                this._disabled = value;
                this.update();
            }
        }

        /**
         * call stopPropagation on any events that impact scrollbox
         * @type {boolean}
         */

    }, {
        key: 'stopPropagation',
        get: function get() {
            return this.options.stopPropagation;
        },
        set: function set(value) {
            this.options.stopPropagation = value;
        }

        /**
         * user may drag the content area to scroll content
         * @type {boolean}
         */

    }, {
        key: 'dragScroll',
        get: function get() {
            return this.options.dragScroll;
        },
        set: function set(value) {
            this.options.dragScroll = value;
            if (value) {
                this.content.drag();
            } else {
                this.content.removePlugin('drag');
            }
            this.update();
        }

        /**
         * width of scrollbox including the scrollbar (if visible)- this changes the size and not the scale of the box
         * @type {number}
         */

    }, {
        key: 'boxWidth',
        get: function get() {
            return this.options.boxWidth;
        },
        set: function set(value) {
            this.options.boxWidth = value;
            this.content.screenWidth = value;
            this.update();
        }

        /**
         * sets overflowX and overflowY to (scroll, hidden, auto) changing whether the scrollbar is shown
         * scroll = always show scrollbar
         * hidden = hide overflow and do not show scrollbar
         * auto = if content is larger than box size, then show scrollbar
         * @type {string}
         */

    }, {
        key: 'overflow',
        get: function get() {
            return this.options.overflow;
        },
        set: function set(value) {
            this.options.overflow = value;
            this.options.overflowX = value;
            this.options.overflowY = value;
            this.update();
        }

        /**
         * sets overflowX to (scroll, hidden, auto) changing whether the scrollbar is shown
         * scroll = always show scrollbar
         * hidden = hide overflow and do not show scrollbar
         * auto = if content is larger than box size, then show scrollbar
         * @type {string}
         */

    }, {
        key: 'overflowX',
        get: function get() {
            return this.options.overflowX;
        },
        set: function set(value) {
            this.options.overflowX = value;
            this.update();
        }

        /**
         * sets overflowY to (scroll, hidden, auto) changing whether the scrollbar is shown
         * scroll = always show scrollbar
         * hidden = hide overflow and do not show scrollbar
         * auto = if content is larger than box size, then show scrollbar
         * @type {string}
         */

    }, {
        key: 'overflowY',
        get: function get() {
            return this.options.overflowY;
        },
        set: function set(value) {
            this.options.overflowY = value;
            this.update();
        }

        /**
         * height of scrollbox including the scrollbar (if visible) - this changes the size and not the scale of the box
         * @type {number}
         */

    }, {
        key: 'boxHeight',
        get: function get() {
            return this.options.boxHeight;
        },
        set: function set(value) {
            this.options.boxHeight = value;
            this.content.screenHeight = value;
            this.update();
        }

        /**
         * scrollbar size in pixels
         * @type {number}
         */

    }, {
        key: 'scrollbarSize',
        get: function get() {
            return this.options.scrollbarSize;
        },
        set: function set(value) {
            this.options.scrollbarSize = value;
        }

        /**
         * width of scrollbox less the scrollbar (if visible)
         * @type {number}
         * @readonly
         */

    }, {
        key: 'contentWidth',
        get: function get() {
            return this.options.boxWidth - (this.isScrollbarVertical ? this.options.scrollbarSize : 0);
        }

        /**
         * height of scrollbox less the scrollbar (if visible)
         * @type {number}
         * @readonly
         */

    }, {
        key: 'contentHeight',
        get: function get() {
            return this.options.boxHeight - (this.isScrollbarHorizontal ? this.options.scrollbarSize : 0);
        }

        /**
         * is the vertical scrollbar visible
         * @type {boolean}
         * @readonly
         */

    }, {
        key: 'isScrollbarVertical',
        get: function get() {
            return this._isScrollbarVertical;
        }

        /**
         * is the horizontal scrollbar visible
         * @type {boolean}
         * @readonly
         */

    }, {
        key: 'isScrollbarHorizontal',
        get: function get() {
            return this._isScrollbarHorizontal;
        }

        /**
         * top coordinate of scrollbar
         */

    }, {
        key: 'scrollTop',
        get: function get() {
            return this.content.top;
        }

        /**
         * left coordinate of scrollbar
         */

    }, {
        key: 'scrollLeft',
        get: function get() {
            return this.content.left;
        }

        /**
         * width of content area
         * if not set then it uses content.width to calculate width
         */

    }, {
        key: 'scrollWidth',
        get: function get() {
            return this._scrollWidth || this.content.width;
        },
        set: function set(value) {
            this._scrollWidth = value;
        }

        /**
         * height of content area
         * if not set then it uses content.height to calculate height
         */

    }, {
        key: 'scrollHeight',
        get: function get() {
            return this._scrollHeight || this.content.height;
        },
        set: function set(value) {
            this._scrollHeight = value;
        }
    }]);

    return Scrollbox;
}(PIXI.Container);

if (PIXI && PIXI.extras) {
    PIXI.extras.Scrollbox = Scrollbox;
}

module.exports = Scrollbox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JvbGxib3guanMiXSwibmFtZXMiOlsiUElYSSIsInJlcXVpcmUiLCJWaWV3cG9ydCIsIkVhc2UiLCJkZWZhdWx0cyIsIkRFRkFVTFRTIiwiRkFERV9TQ1JPTExCQVJfVElNRSIsIlNjcm9sbGJveCIsIm9wdGlvbnMiLCJkaXZXaGVlbCIsImRvY3VtZW50IiwiYm9keSIsImVhc2UiLCJsaXN0IiwiY29udGVudCIsImFkZENoaWxkIiwicGFzc2l2ZVdoZWVsIiwic3RvcFByb3BhZ2F0aW9uIiwic2NyZWVuV2lkdGgiLCJib3hXaWR0aCIsInNjcmVlbkhlaWdodCIsImJveEhlaWdodCIsImRlY2VsZXJhdGUiLCJvbiIsIl9kcmF3U2Nyb2xsYmFycyIsInNjcm9sbGJhciIsIkdyYXBoaWNzIiwiaW50ZXJhY3RpdmUiLCJzY3JvbGxiYXJEb3duIiwic2Nyb2xsYmFyTW92ZSIsInNjcm9sbGJhclVwIiwiX21hc2tDb250ZW50IiwidXBkYXRlIiwiX2lzU2Nyb2xsYmFySG9yaXpvbnRhbCIsIm92ZXJmbG93WCIsImluZGV4T2YiLCJzY3JvbGxXaWR0aCIsIl9pc1Njcm9sbGJhclZlcnRpY2FsIiwib3ZlcmZsb3dZIiwic2Nyb2xsSGVpZ2h0IiwiY2xlYXIiLCJsZWZ0IiwicmlnaHQiLCJzY3JvbGxiYXJTaXplIiwidG9wIiwiYm90dG9tIiwiaXNTY3JvbGxiYXJIb3Jpem9udGFsIiwid2lkdGgiLCJpc1Njcm9sbGJhclZlcnRpY2FsIiwiaGVpZ2h0Iiwic2Nyb2xsYmFyVG9wIiwic2Nyb2xsYmFySGVpZ2h0Iiwic2Nyb2xsYmFyTGVmdCIsInNjcm9sbGJhcldpZHRoIiwiYmVnaW5GaWxsIiwic2Nyb2xsYmFyQmFja2dyb3VuZCIsInNjcm9sbGJhckJhY2tncm91bmRBbHBoYSIsImRyYXdSZWN0Iiwic2Nyb2xsYmFyT2Zmc2V0VmVydGljYWwiLCJlbmRGaWxsIiwic2Nyb2xsYmFyT2Zmc2V0SG9yaXpvbnRhbCIsInNjcm9sbGJhckZvcmVncm91bmQiLCJzY3JvbGxiYXJGb3JlZ3JvdW5kQWxwaGEiLCJhY3RpdmF0ZUZhZGUiLCJtYXNrIiwiX2Rpc2FibGVkIiwiX2RyYXdNYXNrIiwiZHJhZ1Njcm9sbCIsImRpcmVjdGlvbiIsImRyYWciLCJjbGFtcFdoZWVsIiwiY2xhbXAiLCJ1bmRlcmZsb3ciLCJmYWRlIiwicmVtb3ZlIiwiYWxwaGEiLCJ0aW1lIiwidG8iLCJ3YWl0IiwiZmFkZVdhaXQiLCJmYWRlRWFzZSIsImRpcnR5IiwiZSIsImxvY2FsIiwidG9Mb2NhbCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwieCIsInBvaW50ZXJEb3duIiwidHlwZSIsImxhc3QiLCJ3b3JsZFNjcmVlbldpZHRoIiwid29ybGRTY3JlZW5IZWlnaHQiLCJyZXNpemUiLCJlbnN1cmVWaXNpYmxlIiwidmFsdWUiLCJyZW1vdmVQbHVnaW4iLCJvdmVyZmxvdyIsIl9zY3JvbGxXaWR0aCIsIl9zY3JvbGxIZWlnaHQiLCJDb250YWluZXIiLCJleHRyYXMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsT0FBT0MsUUFBUSxTQUFSLENBQWI7QUFDQSxJQUFNQyxXQUFXRCxRQUFRLGVBQVIsQ0FBakI7QUFDQSxJQUFNRSxPQUFPRixRQUFRLFdBQVIsQ0FBYjs7QUFFQSxJQUFNRyxXQUFXSCxRQUFRLFlBQVIsQ0FBakI7QUFDQSxJQUFNSSxXQUFXSixRQUFRLGlCQUFSLENBQWpCOztBQUVBLElBQU1LLHNCQUFzQixJQUE1Qjs7QUFFQTs7OztJQUdNQyxTOzs7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1QkEsdUJBQVlDLE9BQVosRUFDQTtBQUFBOztBQUFBOztBQUVJLGNBQUtBLE9BQUwsR0FBZUosU0FBU0ksT0FBVCxFQUFrQkgsUUFBbEIsQ0FBZjtBQUNBLGNBQUtHLE9BQUwsQ0FBYUMsUUFBYixHQUF3QixNQUFLRCxPQUFMLENBQWFDLFFBQWIsSUFBeUJDLFNBQVNDLElBQTFEO0FBQ0EsY0FBS0MsSUFBTCxHQUFZLElBQUlU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Q2VpRCxLLEVBQ2hCO0FBQ0ksaUJBQUtHLFlBQUwsR0FBb0JILEtBQXBCO0FBQ0g7O0FBRUQ7Ozs7Ozs7NEJBS0E7QUFDSSxtQkFBTyxLQUFLSSxhQUFMLElBQXNCLEtBQUt0RixPQUFMLENBQWFtQyxNQUExQztBQUNILFM7MEJBQ2dCK0MsSyxFQUNqQjtBQUNJLGlCQUFLSSxhQUFMLEdBQXFCSixLQUFyQjtBQUNIOzs7O0VBeFRtQmhHLEtBQUtxRyxTOztBQXdqQjdCLElBQUlyRyxRQUFRQSxLQUFLc0csTUFBakIsRUFDQTtBQUNJdEcsU0FBS3NHLE1BQUwsQ0FBWS9GLFNBQVosR0FBd0JBLFNBQXhCO0FBQ0g7O0FBRURnRyxPQUFPQyxPQUFQLEdBQWlCakcsU0FBakIiLCJmaWxlIjoic2Nyb2xsYm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKVxuY29uc3QgVmlld3BvcnQgPSByZXF1aXJlKCdwaXhpLXZpZXdwb3J0JylcbmNvbnN0IEVhc2UgPSByZXF1aXJlKCdwaXhpLWVhc2UnKVxuXG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKVxuY29uc3QgREVGQVVMVFMgPSByZXF1aXJlKCcuL2RlZmF1bHRzLmpzb24nKVxuXG5jb25zdCBGQURFX1NDUk9MTEJBUl9USU1FID0gMTAwMFxuXG4vKipcbiAqIHBpeGkuanMgc2Nyb2xsYm94OiBhIG1hc2tlZCBjb250ZW50IGJveCB0aGF0IGNhbiBzY3JvbGwgdmVydGljYWxseSBvciBob3Jpem9udGFsbHkgd2l0aCBzY3JvbGxiYXJzXG4gKi9cbmNsYXNzIFNjcm9sbGJveCBleHRlbmRzIFBJWEkuQ29udGFpbmVyXG57XG4gICAgLyoqXG4gICAgICogY3JlYXRlIGEgc2Nyb2xsYm94XG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRyYWdTY3JvbGw9dHJ1ZV0gdXNlciBtYXkgZHJhZyB0aGUgY29udGVudCBhcmVhIHRvIHNjcm9sbCBjb250ZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm92ZXJmbG93WD1hdXRvXSAobm9uZSwgc2Nyb2xsLCBoaWRkZW4sIGF1dG8pIHRoaXMgY2hhbmdlcyB3aGV0aGVyIHRoZSBzY3JvbGxiYXIgaXMgc2hvd25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3ZlcmZsb3dZPWF1dG9dIChub25lLCBzY3JvbGwsIGhpZGRlbiwgYXV0bykgdGhpcyBjaGFuZ2VzIHdoZXRoZXIgdGhlIHNjcm9sbGJhciBpcyBzaG93blxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vdmVyZmxvd10gKG5vbmUsIHNjcm9sbCwgaGlkZGVuLCBhdXRvKSBzZXRzIG92ZXJmbG93WCBhbmQgb3ZlcmZsb3dZIHRvIHRoaXMgdmFsdWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm94V2lkdGg9MTAwXSB3aWR0aCBvZiBzY3JvbGxib3ggaW5jbHVkaW5nIHNjcm9sbGJhciAoaW4gcGl4ZWxzKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3hIZWlnaHQ9MTAwXSBoZWlnaHQgb2Ygc2Nyb2xsYm94IGluY2x1ZGluZyBzY3JvbGxiYXIgKGluIHBpeGVscylcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc2Nyb2xsYmFyU2l6ZT0xMF0gc2l6ZSBvZiBzY3JvbGxiYXIgKGluIHBpeGVscylcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc2Nyb2xsYmFyT2Zmc2V0SG9yaXpvbnRhbD0wXSBvZmZzZXQgb2YgaG9yaXpvbnRhbCBzY3JvbGxiYXIgKGluIHBpeGVscylcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc2Nyb2xsYmFyT2Zmc2V0VmVydGljYWw9MF0gb2Zmc2V0IG9mIHZlcnRpY2FsIHNjcm9sbGJhciAoaW4gcGl4ZWxzKVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuc3RvcFByb3BhZ2F0aW9uPXRydWVdIGNhbGwgc3RvcFByb3BhZ2F0aW9uIG9uIGFueSBldmVudHMgdGhhdCBpbXBhY3Qgc2Nyb2xsYm94XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcm9sbGJhckJhY2tncm91bmQ9MHhkZGRkZGRdIGJhY2tncm91bmQgY29sb3Igb2Ygc2Nyb2xsYmFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcm9sbGJhckJhY2tncm91bmRBbHBoYT0xXSBhbHBoYSBvZiBiYWNrZ3JvdW5kIG9mIHNjcm9sbGJhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JvbGxiYXJGb3JlZ3JvdW5kPTB4ODg4ODg4XSBmb3JlZ3JvdW5kIGNvbG9yIG9mIHNjcm9sbGJhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JvbGxiYXJGb3JlZ3JvdW5kQWxwaGE9MV0gYWxwaGEgb2YgZm9yZWdyb3VuZCBvZiBzY3JvbGxiYXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PXRvcC1sZWZ0XSB3aGF0IHRvIGRvIHdoZW4gY29udGVudCB1bmRlcmZsb3dzIHRoZSBzY3JvbGxib3ggc2l6ZTogbm9uZTogZG8gbm90aGluZzsgKGxlZnQvcmlnaHQvY2VudGVyIEFORCB0b3AvYm90dG9tL2NlbnRlcik7IE9SIGNlbnRlciAoZS5nLiwgJ3RvcC1sZWZ0JywgJ2NlbnRlcicsICdub25lJywgJ2JvdHRvbXJpZ2h0JylcbiAgICAgKiBAcGFyYW0geyhib29sZWFufG51bWJlcil9IFtvcHRpb25zLmZhZGVdIGZhZGUgdGhlIHNjcm9sbGJhciB3aGVuIG5vdCBpbiB1c2UgKHRydWUgPSAxMDAwbXMpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZhZGVXYWl0PTMwMDBdIHRpbWUgdG8gd2FpdCBiZWZvcmUgZmFkaW5nIHRoZSBzY3JvbGxiYXIgaWYgb3B0aW9ucy5mYWRlIGlzIHNldFxuICAgICAqIEBwYXJhbSB7KHN0cmluZ3xmdW5jdGlvbil9IFtvcHRpb25zLmZhZGVFYXNlPWVhc2VJbk91dFNpbmVdIGVhc2luZyBmdW5jdGlvbiB0byB1c2UgZm9yIGZhZGluZ1xuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLmRpdldoZWVsPWRvY3VtZW50LmJvZHldIGRpdiB0byBhdHRhY2ggdGhlIHdoZWVsIGV2ZW50XG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucylcbiAgICB7XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgdGhpcy5vcHRpb25zID0gZGVmYXVsdHMob3B0aW9ucywgREVGQVVMVFMpXG4gICAgICAgIHRoaXMub3B0aW9ucy5kaXZXaGVlbCA9IHRoaXMub3B0aW9ucy5kaXZXaGVlbCB8fCBkb2N1bWVudC5ib2R5XG4gICAgICAgIHRoaXMuZWFzZSA9IG5ldyBFYXNlLmxpc3QoKVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjb250ZW50IGluIHBsYWNlZCBpbiBoZXJlXG4gICAgICAgICAqIHlvdSBjYW4gdXNlIGFueSBmdW5jdGlvbiBmcm9tIHBpeGktdmlld3BvcnQgb24gY29udGVudCB0byBtYW51YWxseSBtb3ZlIHRoZSBjb250ZW50IChzZWUgaHR0cHM6Ly9kYXZpZGZpZy5naXRodWIuaW8vcGl4aS12aWV3cG9ydC9qc2RvYy8pXG4gICAgICAgICAqIEB0eXBlIHtQSVhJLmV4dHJhcy5WaWV3cG9ydH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY29udGVudCA9IHRoaXMuYWRkQ2hpbGQobmV3IFZpZXdwb3J0KHsgcGFzc2l2ZVdoZWVsOiB0aGlzLm9wdGlvbnMuc3RvcFByb3BhZ2F0aW9uLCBzdG9wUHJvcGFnYXRpb246IHRoaXMub3B0aW9ucy5zdG9wUHJvcGFnYXRpb24sIHNjcmVlbldpZHRoOiB0aGlzLm9wdGlvbnMuYm94V2lkdGgsIHNjcmVlbkhlaWdodDogdGhpcy5vcHRpb25zLmJveEhlaWdodCwgZGl2V2hlZWw6IHRoaXMub3B0aW9ucy5kaXZXaGVlbCB9KSlcbiAgICAgICAgdGhpcy5jb250ZW50XG4gICAgICAgICAgICAuZGVjZWxlcmF0ZSgpXG4gICAgICAgICAgICAub24oJ21vdmVkJywgKCkgPT4gdGhpcy5fZHJhd1Njcm9sbGJhcnMoKSlcblxuICAgICAgICAvKipcbiAgICAgICAgICogZ3JhcGhpY3MgZWxlbWVudCBmb3IgZHJhd2luZyB0aGUgc2Nyb2xsYmFyc1xuICAgICAgICAgKiBAdHlwZSB7UElYSS5HcmFwaGljc31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2Nyb2xsYmFyID0gdGhpcy5hZGRDaGlsZChuZXcgUElYSS5HcmFwaGljcygpKVxuICAgICAgICB0aGlzLnNjcm9sbGJhci5pbnRlcmFjdGl2ZSA9IHRydWVcbiAgICAgICAgdGhpcy5zY3JvbGxiYXIub24oJ3BvaW50ZXJkb3duJywgdGhpcy5zY3JvbGxiYXJEb3duLCB0aGlzKVxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxuICAgICAgICB0aGlzLm9uKCdwb2ludGVybW92ZScsIHRoaXMuc2Nyb2xsYmFyTW92ZSwgdGhpcylcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwJywgdGhpcy5zY3JvbGxiYXJVcCwgdGhpcylcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmNhbmNlbCcsIHRoaXMuc2Nyb2xsYmFyVXAsIHRoaXMpXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cG91dHNpZGUnLCB0aGlzLnNjcm9sbGJhclVwLCB0aGlzKVxuICAgICAgICB0aGlzLl9tYXNrQ29udGVudCA9IHRoaXMuYWRkQ2hpbGQobmV3IFBJWEkuR3JhcGhpY3MoKSlcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIG9mZnNldCBvZiBob3Jpem9udGFsIHNjcm9sbGJhciAoaW4gcGl4ZWxzKVxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0IHNjcm9sbGJhck9mZnNldEhvcml6b250YWwoKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5zY3JvbGxiYXJPZmZzZXRIb3Jpem9udGFsXG4gICAgfVxuICAgIHNldCBzY3JvbGxiYXJPZmZzZXRIb3Jpem9udGFsKHZhbHVlKVxuICAgIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLnNjcm9sbGJhck9mZnNldEhvcml6b250YWwgPSB2YWx1ZVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIG9mZnNldCBvZiB2ZXJ0aWNhbCBzY3JvbGxiYXIgKGluIHBpeGVscylcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIGdldCBzY3JvbGxiYXJPZmZzZXRWZXJ0aWNhbCgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNjcm9sbGJhck9mZnNldFZlcnRpY2FsXG4gICAgfVxuICAgIHNldCBzY3JvbGxiYXJPZmZzZXRWZXJ0aWNhbCh2YWx1ZSlcbiAgICB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5zY3JvbGxiYXJPZmZzZXRWZXJ0aWNhbCA9IHZhbHVlXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZGlzYWJsZSB0aGUgc2Nyb2xsYm94IChpZiBzZXQgdG8gdHJ1ZSB0aGlzIHdpbGwgYWxzbyByZW1vdmUgdGhlIG1hc2spXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgZ2V0IGRpc2FibGUoKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkXG4gICAgfVxuICAgIHNldCBkaXNhYmxlKHZhbHVlKVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuX2Rpc2FibGVkICE9PSB2YWx1ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZVxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2FsbCBzdG9wUHJvcGFnYXRpb24gb24gYW55IGV2ZW50cyB0aGF0IGltcGFjdCBzY3JvbGxib3hcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBnZXQgc3RvcFByb3BhZ2F0aW9uKClcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuc3RvcFByb3BhZ2F0aW9uXG4gICAgfVxuICAgIHNldCBzdG9wUHJvcGFnYXRpb24odmFsdWUpXG4gICAge1xuICAgICAgICB0aGlzLm9wdGlvbnMuc3RvcFByb3BhZ2F0aW9uID0gdmFsdWVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB1c2VyIG1heSBkcmFnIHRoZSBjb250ZW50IGFyZWEgdG8gc2Nyb2xsIGNvbnRlbnRcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBnZXQgZHJhZ1Njcm9sbCgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmRyYWdTY3JvbGxcbiAgICB9XG4gICAgc2V0IGRyYWdTY3JvbGwodmFsdWUpXG4gICAge1xuICAgICAgICB0aGlzLm9wdGlvbnMuZHJhZ1Njcm9sbCA9IHZhbHVlXG4gICAgICAgIGlmICh2YWx1ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LmRyYWcoKVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnJlbW92ZVBsdWdpbignZHJhZycpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHdpZHRoIG9mIHNjcm9sbGJveCBpbmNsdWRpbmcgdGhlIHNjcm9sbGJhciAoaWYgdmlzaWJsZSktIHRoaXMgY2hhbmdlcyB0aGUgc2l6ZSBhbmQgbm90IHRoZSBzY2FsZSBvZiB0aGUgYm94XG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBnZXQgYm94V2lkdGgoKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5ib3hXaWR0aFxuICAgIH1cbiAgICBzZXQgYm94V2lkdGgodmFsdWUpXG4gICAge1xuICAgICAgICB0aGlzLm9wdGlvbnMuYm94V2lkdGggPSB2YWx1ZVxuICAgICAgICB0aGlzLmNvbnRlbnQuc2NyZWVuV2lkdGggPSB2YWx1ZVxuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2V0cyBvdmVyZmxvd1ggYW5kIG92ZXJmbG93WSB0byAoc2Nyb2xsLCBoaWRkZW4sIGF1dG8pIGNoYW5naW5nIHdoZXRoZXIgdGhlIHNjcm9sbGJhciBpcyBzaG93blxuICAgICAqIHNjcm9sbCA9IGFsd2F5cyBzaG93IHNjcm9sbGJhclxuICAgICAqIGhpZGRlbiA9IGhpZGUgb3ZlcmZsb3cgYW5kIGRvIG5vdCBzaG93IHNjcm9sbGJhclxuICAgICAqIGF1dG8gPSBpZiBjb250ZW50IGlzIGxhcmdlciB0aGFuIGJveCBzaXplLCB0aGVuIHNob3cgc2Nyb2xsYmFyXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgb3ZlcmZsb3coKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5vdmVyZmxvd1xuICAgIH1cbiAgICBzZXQgb3ZlcmZsb3codmFsdWUpXG4gICAge1xuICAgICAgICB0aGlzLm9wdGlvbnMub3ZlcmZsb3cgPSB2YWx1ZVxuICAgICAgICB0aGlzLm9wdGlvbnMub3ZlcmZsb3dYID0gdmFsdWVcbiAgICAgICAgdGhpcy5vcHRpb25zLm92ZXJmbG93WSA9IHZhbHVlXG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZXRzIG92ZXJmbG93WCB0byAoc2Nyb2xsLCBoaWRkZW4sIGF1dG8pIGNoYW5naW5nIHdoZXRoZXIgdGhlIHNjcm9sbGJhciBpcyBzaG93blxuICAgICAqIHNjcm9sbCA9IGFsd2F5cyBzaG93IHNjcm9sbGJhclxuICAgICAqIGhpZGRlbiA9IGhpZGUgb3ZlcmZsb3cgYW5kIGRvIG5vdCBzaG93IHNjcm9sbGJhclxuICAgICAqIGF1dG8gPSBpZiBjb250ZW50IGlzIGxhcmdlciB0aGFuIGJveCBzaXplLCB0aGVuIHNob3cgc2Nyb2xsYmFyXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgb3ZlcmZsb3dYKClcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMub3ZlcmZsb3dYXG4gICAgfVxuICAgIHNldCBvdmVyZmxvd1godmFsdWUpXG4gICAge1xuICAgICAgICB0aGlzLm9wdGlvbnMub3ZlcmZsb3dYID0gdmFsdWVcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNldHMgb3ZlcmZsb3dZIHRvIChzY3JvbGwsIGhpZGRlbiwgYXV0bykgY2hhbmdpbmcgd2hldGhlciB0aGUgc2Nyb2xsYmFyIGlzIHNob3duXG4gICAgICogc2Nyb2xsID0gYWx3YXlzIHNob3cgc2Nyb2xsYmFyXG4gICAgICogaGlkZGVuID0gaGlkZSBvdmVyZmxvdyBhbmQgZG8gbm90IHNob3cgc2Nyb2xsYmFyXG4gICAgICogYXV0byA9IGlmIGNvbnRlbnQgaXMgbGFyZ2VyIHRoYW4gYm94IHNpemUsIHRoZW4gc2hvdyBzY3JvbGxiYXJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIGdldCBvdmVyZmxvd1koKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5vdmVyZmxvd1lcbiAgICB9XG4gICAgc2V0IG92ZXJmbG93WSh2YWx1ZSlcbiAgICB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5vdmVyZmxvd1kgPSB2YWx1ZVxuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGVpZ2h0IG9mIHNjcm9sbGJveCBpbmNsdWRpbmcgdGhlIHNjcm9sbGJhciAoaWYgdmlzaWJsZSkgLSB0aGlzIGNoYW5nZXMgdGhlIHNpemUgYW5kIG5vdCB0aGUgc2NhbGUgb2YgdGhlIGJveFxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0IGJveEhlaWdodCgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJveEhlaWdodFxuICAgIH1cbiAgICBzZXQgYm94SGVpZ2h0KHZhbHVlKVxuICAgIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLmJveEhlaWdodCA9IHZhbHVlXG4gICAgICAgIHRoaXMuY29udGVudC5zY3JlZW5IZWlnaHQgPSB2YWx1ZVxuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2Nyb2xsYmFyIHNpemUgaW4gcGl4ZWxzXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICBnZXQgc2Nyb2xsYmFyU2l6ZSgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNjcm9sbGJhclNpemVcbiAgICB9XG4gICAgc2V0IHNjcm9sbGJhclNpemUodmFsdWUpXG4gICAge1xuICAgICAgICB0aGlzLm9wdGlvbnMuc2Nyb2xsYmFyU2l6ZSA9IHZhbHVlXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogd2lkdGggb2Ygc2Nyb2xsYm94IGxlc3MgdGhlIHNjcm9sbGJhciAoaWYgdmlzaWJsZSlcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIGdldCBjb250ZW50V2lkdGgoKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5ib3hXaWR0aCAtICh0aGlzLmlzU2Nyb2xsYmFyVmVydGljYWwgPyB0aGlzLm9wdGlvbnMuc2Nyb2xsYmFyU2l6ZSA6IDApXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGVpZ2h0IG9mIHNjcm9sbGJveCBsZXNzIHRoZSBzY3JvbGxiYXIgKGlmIHZpc2libGUpXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAcmVhZG9ubHlcbiAgICAgKi9cbiAgICBnZXQgY29udGVudEhlaWdodCgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJveEhlaWdodCAtICh0aGlzLmlzU2Nyb2xsYmFySG9yaXpvbnRhbCA/IHRoaXMub3B0aW9ucy5zY3JvbGxiYXJTaXplIDogMClcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpcyB0aGUgdmVydGljYWwgc2Nyb2xsYmFyIHZpc2libGVcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAcmVhZG9ubHlcbiAgICAgKi9cbiAgICBnZXQgaXNTY3JvbGxiYXJWZXJ0aWNhbCgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNTY3JvbGxiYXJWZXJ0aWNhbFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGlzIHRoZSBob3Jpem9udGFsIHNjcm9sbGJhciB2aXNpYmxlXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQHJlYWRvbmx5XG4gICAgICovXG4gICAgZ2V0IGlzU2Nyb2xsYmFySG9yaXpvbnRhbCgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNTY3JvbGxiYXJIb3Jpem9udGFsXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdG9wIGNvb3JkaW5hdGUgb2Ygc2Nyb2xsYmFyXG4gICAgICovXG4gICAgZ2V0IHNjcm9sbFRvcCgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50LnRvcFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGxlZnQgY29vcmRpbmF0ZSBvZiBzY3JvbGxiYXJcbiAgICAgKi9cbiAgICBnZXQgc2Nyb2xsTGVmdCgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50LmxlZnRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB3aWR0aCBvZiBjb250ZW50IGFyZWFcbiAgICAgKiBpZiBub3Qgc2V0IHRoZW4gaXQgdXNlcyBjb250ZW50LndpZHRoIHRvIGNhbGN1bGF0ZSB3aWR0aFxuICAgICAqL1xuICAgIGdldCBzY3JvbGxXaWR0aCgpXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsV2lkdGggfHwgdGhpcy5jb250ZW50LndpZHRoXG4gICAgfVxuICAgIHNldCBzY3JvbGxXaWR0aCh2YWx1ZSlcbiAgICB7XG4gICAgICAgIHRoaXMuX3Njcm9sbFdpZHRoID0gdmFsdWVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBoZWlnaHQgb2YgY29udGVudCBhcmVhXG4gICAgICogaWYgbm90IHNldCB0aGVuIGl0IHVzZXMgY29udGVudC5oZWlnaHQgdG8gY2FsY3VsYXRlIGhlaWdodFxuICAgICAqL1xuICAgIGdldCBzY3JvbGxIZWlnaHQoKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Njcm9sbEhlaWdodCB8fCB0aGlzLmNvbnRlbnQuaGVpZ2h0XG4gICAgfVxuICAgIHNldCBzY3JvbGxIZWlnaHQodmFsdWUpXG4gICAge1xuICAgICAgICB0aGlzLl9zY3JvbGxIZWlnaHQgPSB2YWx1ZVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGRyYXdzIHNjcm9sbGJhcnNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kcmF3U2Nyb2xsYmFycygpXG4gICAge1xuICAgICAgICB0aGlzLl9pc1Njcm9sbGJhckhvcml6b250YWwgPSB0aGlzLm92ZXJmbG93WCA9PT0gJ3Njcm9sbCcgPyB0cnVlIDogWydoaWRkZW4nLCAnbm9uZSddLmluZGV4T2YodGhpcy5vdmVyZmxvd1gpICE9PSAtMSA/IGZhbHNlIDogdGhpcy5zY3JvbGxXaWR0aCA+IHRoaXMub3B0aW9ucy5ib3hXaWR0aFxuICAgICAgICB0aGlzLl9pc1Njcm9sbGJhclZlcnRpY2FsID0gdGhpcy5vdmVyZmxvd1kgPT09ICdzY3JvbGwnID8gdHJ1ZSA6IFsnaGlkZGVuJywgJ25vbmUnXS5pbmRleE9mKHRoaXMub3ZlcmZsb3dZKSAhPT0gLTEgPyBmYWxzZSA6IHRoaXMuc2Nyb2xsSGVpZ2h0ID4gdGhpcy5vcHRpb25zLmJveEhlaWdodFxuICAgICAgICB0aGlzLnNjcm9sbGJhci5jbGVhcigpXG4gICAgICAgIGxldCBvcHRpb25zID0ge31cbiAgICAgICAgb3B0aW9ucy5sZWZ0ID0gMFxuICAgICAgICBvcHRpb25zLnJpZ2h0ID0gdGhpcy5zY3JvbGxXaWR0aCArICh0aGlzLl9pc1Njcm9sbGJhclZlcnRpY2FsID8gdGhpcy5vcHRpb25zLnNjcm9sbGJhclNpemUgOiAwKVxuICAgICAgICBvcHRpb25zLnRvcCA9IDBcbiAgICAgICAgb3B0aW9ucy5ib3R0b20gPSB0aGlzLnNjcm9sbEhlaWdodCArICh0aGlzLmlzU2Nyb2xsYmFySG9yaXpvbnRhbCA/IHRoaXMub3B0aW9ucy5zY3JvbGxiYXJTaXplIDogMClcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLnNjcm9sbFdpZHRoICsgKHRoaXMuaXNTY3JvbGxiYXJWZXJ0aWNhbCA/IHRoaXMub3B0aW9ucy5zY3JvbGxiYXJTaXplIDogMClcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5zY3JvbGxIZWlnaHQgKyAodGhpcy5pc1Njcm9sbGJhckhvcml6b250YWwgPyB0aGlzLm9wdGlvbnMuc2Nyb2xsYmFyU2l6ZSA6IDApXG4gICAgICAgIHRoaXMuc2Nyb2xsYmFyVG9wID0gKHRoaXMuY29udGVudC50b3AgLyBoZWlnaHQpICogdGhpcy5ib3hIZWlnaHRcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJUb3AgPSB0aGlzLnNjcm9sbGJhclRvcCA8IDAgPyAwIDogdGhpcy5zY3JvbGxiYXJUb3BcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJIZWlnaHQgPSAodGhpcy5ib3hIZWlnaHQgLyBoZWlnaHQpICogdGhpcy5ib3hIZWlnaHRcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJIZWlnaHQgPSB0aGlzLnNjcm9sbGJhclRvcCArIHRoaXMuc2Nyb2xsYmFySGVpZ2h0ID4gdGhpcy5ib3hIZWlnaHQgPyB0aGlzLmJveEhlaWdodCAtIHRoaXMuc2Nyb2xsYmFyVG9wIDogdGhpcy5zY3JvbGxiYXJIZWlnaHRcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJMZWZ0ID0gKHRoaXMuY29udGVudC5sZWZ0IC8gd2lkdGgpICogdGhpcy5ib3hXaWR0aFxuICAgICAgICB0aGlzLnNjcm9sbGJhckxlZnQgPSB0aGlzLnNjcm9sbGJhckxlZnQgPCAwID8gMCA6IHRoaXMuc2Nyb2xsYmFyTGVmdFxuICAgICAgICB0aGlzLnNjcm9sbGJhcldpZHRoID0gKHRoaXMuYm94V2lkdGggLyB3aWR0aCkgKiB0aGlzLmJveFdpZHRoXG4gICAgICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggPSB0aGlzLnNjcm9sbGJhcldpZHRoICsgdGhpcy5zY3JvbGxiYXJMZWZ0ID4gdGhpcy5ib3hXaWR0aCA/IHRoaXMuYm94V2lkdGggLSB0aGlzLnNjcm9sbGJhckxlZnQgOiB0aGlzLnNjcm9sbGJhcldpZHRoXG4gICAgICAgIGlmICh0aGlzLmlzU2Nyb2xsYmFyVmVydGljYWwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsYmFyXG4gICAgICAgICAgICAgICAgLmJlZ2luRmlsbCh0aGlzLm9wdGlvbnMuc2Nyb2xsYmFyQmFja2dyb3VuZCwgdGhpcy5vcHRpb25zLnNjcm9sbGJhckJhY2tncm91bmRBbHBoYSlcbiAgICAgICAgICAgICAgICAuZHJhd1JlY3QodGhpcy5ib3hXaWR0aCAtIHRoaXMuc2Nyb2xsYmFyU2l6ZSArIHRoaXMub3B0aW9ucy5zY3JvbGxiYXJPZmZzZXRWZXJ0aWNhbCwgMCwgdGhpcy5zY3JvbGxiYXJTaXplLCB0aGlzLmJveEhlaWdodClcbiAgICAgICAgICAgICAgICAuZW5kRmlsbCgpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNTY3JvbGxiYXJIb3Jpem9udGFsKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbGJhclxuICAgICAgICAgICAgICAgIC5iZWdpbkZpbGwodGhpcy5vcHRpb25zLnNjcm9sbGJhckJhY2tncm91bmQsIHRoaXMub3B0aW9ucy5zY3JvbGxiYXJCYWNrZ3JvdW5kQWxwaGEpXG4gICAgICAgICAgICAgICAgLmRyYXdSZWN0KDAsIHRoaXMuYm94SGVpZ2h0IC0gdGhpcy5zY3JvbGxiYXJTaXplICsgdGhpcy5vcHRpb25zLnNjcm9sbGJhck9mZnNldEhvcml6b250YWwsIHRoaXMuYm94V2lkdGgsIHRoaXMuc2Nyb2xsYmFyU2l6ZSlcbiAgICAgICAgICAgICAgICAuZW5kRmlsbCgpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNTY3JvbGxiYXJWZXJ0aWNhbClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxiYXJcbiAgICAgICAgICAgICAgICAuYmVnaW5GaWxsKHRoaXMub3B0aW9ucy5zY3JvbGxiYXJGb3JlZ3JvdW5kLCB0aGlzLm9wdGlvbnMuc2Nyb2xsYmFyRm9yZWdyb3VuZEFscGhhKVxuICAgICAgICAgICAgICAgIC5kcmF3UmVjdCh0aGlzLmJveFdpZHRoIC0gdGhpcy5zY3JvbGxiYXJTaXplICsgdGhpcy5vcHRpb25zLnNjcm9sbGJhck9mZnNldFZlcnRpY2FsLCB0aGlzLnNjcm9sbGJhclRvcCwgdGhpcy5zY3JvbGxiYXJTaXplLCB0aGlzLnNjcm9sbGJhckhlaWdodClcbiAgICAgICAgICAgICAgICAuZW5kRmlsbCgpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNTY3JvbGxiYXJIb3Jpem9udGFsKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbGJhclxuICAgICAgICAgICAgICAgIC5iZWdpbkZpbGwodGhpcy5vcHRpb25zLnNjcm9sbGJhckZvcmVncm91bmQsIHRoaXMub3B0aW9ucy5zY3JvbGxiYXJGb3JlZ3JvdW5kQWxwaGEpXG4gICAgICAgICAgICAgICAgLmRyYXdSZWN0KHRoaXMuc2Nyb2xsYmFyTGVmdCwgdGhpcy5ib3hIZWlnaHQgLSB0aGlzLnNjcm9sbGJhclNpemUgKyB0aGlzLm9wdGlvbnMuc2Nyb2xsYmFyT2Zmc2V0SG9yaXpvbnRhbCwgdGhpcy5zY3JvbGxiYXJXaWR0aCwgdGhpcy5zY3JvbGxiYXJTaXplKVxuICAgICAgICAgICAgICAgIC5lbmRGaWxsKClcbiAgICAgICAgfVxuICAgICAgICAvLyB0aGlzLmNvbnRlbnQuZm9yY2VIaXRBcmVhID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAgLCB0aGlzLmJveFdpZHRoLCB0aGlzLmJveEhlaWdodClcbiAgICAgICAgdGhpcy5hY3RpdmF0ZUZhZGUoKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGRyYXdzIG1hc2sgbGF5ZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9kcmF3TWFzaygpXG4gICAge1xuICAgICAgICB0aGlzLl9tYXNrQ29udGVudFxuICAgICAgICAgICAgLmJlZ2luRmlsbCgwKVxuICAgICAgICAgICAgLmRyYXdSZWN0KDAsIDAsIHRoaXMuYm94V2lkdGgsIHRoaXMuYm94SGVpZ2h0KVxuICAgICAgICAgICAgLmVuZEZpbGwoKVxuICAgICAgICB0aGlzLmNvbnRlbnQubWFzayA9IHRoaXMuX21hc2tDb250ZW50XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2FsbCB3aGVuIHNjcm9sbGJveCBjb250ZW50IGNoYW5nZXNcbiAgICAgKi9cbiAgICB1cGRhdGUoKVxuICAgIHtcbiAgICAgICAgdGhpcy5jb250ZW50Lm1hc2sgPSBudWxsXG4gICAgICAgIHRoaXMuX21hc2tDb250ZW50LmNsZWFyKClcbiAgICAgICAgaWYgKCF0aGlzLl9kaXNhYmxlZClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5fZHJhd1Njcm9sbGJhcnMoKVxuICAgICAgICAgICAgdGhpcy5fZHJhd01hc2soKVxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnU2Nyb2xsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuaXNTY3JvbGxiYXJIb3Jpem9udGFsICYmIHRoaXMuaXNTY3JvbGxiYXJWZXJ0aWNhbCA/ICdhbGwnIDogdGhpcy5pc1Njcm9sbGJhckhvcml6b250YWwgPyAneCcgOiAneSdcbiAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uICE9PSBudWxsKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAuZHJhZyh7IGNsYW1wV2hlZWw6IHRydWUsIGRpcmVjdGlvbiB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNsYW1wKHsgZGlyZWN0aW9uLCB1bmRlcmZsb3c6IHRoaXMub3B0aW9ucy51bmRlcmZsb3cgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzaG93IHRoZSBzY3JvbGxiYXIgYW5kIHJlc3RhcnQgdGhlIHRpbWVyIGZvciBmYWRlIGlmIG9wdGlvbnMuZmFkZSBpcyBzZXRcbiAgICAgKi9cbiAgICBhY3RpdmF0ZUZhZGUoKVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mYWRlKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAodGhpcy5mYWRlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuZWFzZS5yZW1vdmUodGhpcy5mYWRlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zY3JvbGxiYXIuYWxwaGEgPSAxXG4gICAgICAgICAgICBjb25zdCB0aW1lID0gdGhpcy5vcHRpb25zLmZhZGUgPT09IHRydWUgPyBGQURFX1NDUk9MTEJBUl9USU1FIDogdGhpcy5vcHRpb25zLmZhZGVcbiAgICAgICAgICAgIHRoaXMuZmFkZSA9IHRoaXMuZWFzZS50byh0aGlzLnNjcm9sbGJhciwgeyBhbHBoYTogMCB9LCB0aW1lLCB7IHdhaXQ6IHRoaXMub3B0aW9ucy5mYWRlV2FpdCwgZWFzZTogdGhpcy5vcHRpb25zLmZhZGVFYXNlIH0pXG4gICAgICAgICAgICB0aGlzLmZhZGUub24oJ2VhY2gnLCAoKSA9PiB0aGlzLmNvbnRlbnQuZGlydHkgPSB0cnVlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGFuZGxlIHBvaW50ZXIgZG93biBvbiBzY3JvbGxiYXJcbiAgICAgKiBAcGFyYW0ge1BJWEkuaW50ZXJhY3Rpb24uSW50ZXJhY3Rpb25FdmVudH0gZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2Nyb2xsYmFyRG93bihlKVxuICAgIHtcbiAgICAgICAgY29uc3QgbG9jYWwgPSB0aGlzLnRvTG9jYWwoZS5kYXRhLmdsb2JhbClcbiAgICAgICAgaWYgKHRoaXMuaXNTY3JvbGxiYXJIb3Jpem9udGFsKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAobG9jYWwueSA+IHRoaXMuYm94SGVpZ2h0IC0gdGhpcy5zY3JvbGxiYXJTaXplKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbC54ID49IHRoaXMuc2Nyb2xsYmFyTGVmdCAmJiBsb2NhbC54IDw9IHRoaXMuc2Nyb2xsYmFyTGVmdCArIHRoaXMuc2Nyb2xsYmFyV2lkdGgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvaW50ZXJEb3duID0geyB0eXBlOiAnaG9yaXpvbnRhbCcsIGxhc3Q6IGxvY2FsIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsLnggPiB0aGlzLnNjcm9sbGJhckxlZnQpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudC5sZWZ0ICs9IHRoaXMuY29udGVudC53b3JsZFNjcmVlbldpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnQubGVmdCAtPSB0aGlzLmNvbnRlbnQud29ybGRTY3JlZW5XaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc1Njcm9sbGJhclZlcnRpY2FsKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAobG9jYWwueCA+IHRoaXMuYm94V2lkdGggLSB0aGlzLnNjcm9sbGJhclNpemUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsLnkgPj0gdGhpcy5zY3JvbGxiYXJUb3AgJiYgbG9jYWwueSA8PSB0aGlzLnNjcm9sbGJhclRvcCArIHRoaXMuc2Nyb2xsYmFyV2lkdGgpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvaW50ZXJEb3duID0geyB0eXBlOiAndmVydGljYWwnLCBsYXN0OiBsb2NhbCB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbC55ID4gdGhpcy5zY3JvbGxiYXJUb3ApXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudC50b3AgKz0gdGhpcy5jb250ZW50LndvcmxkU2NyZWVuSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnQudG9wIC09IHRoaXMuY29udGVudC53b3JsZFNjcmVlbkhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGhhbmRsZSBwb2ludGVyIG1vdmUgb24gc2Nyb2xsYmFyXG4gICAgICogQHBhcmFtIHtQSVhJLmludGVyYWN0aW9uLkludGVyYWN0aW9uRXZlbnR9IGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNjcm9sbGJhck1vdmUoZSlcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXJEb3duKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAodGhpcy5wb2ludGVyRG93bi50eXBlID09PSAnaG9yaXpvbnRhbCcpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWwgPSB0aGlzLnRvTG9jYWwoZS5kYXRhLmdsb2JhbClcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnQubGVmdCArPSBsb2NhbC54IC0gdGhpcy5wb2ludGVyRG93bi5sYXN0LnhcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50ZXJEb3duLmxhc3QgPSBsb2NhbFxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMucG9pbnRlckRvd24udHlwZSA9PT0gJ3ZlcnRpY2FsJylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbCA9IHRoaXMudG9Mb2NhbChlLmRhdGEuZ2xvYmFsKVxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudC50b3AgKz0gbG9jYWwueSAtIHRoaXMucG9pbnRlckRvd24ubGFzdC55XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludGVyRG93bi5sYXN0ID0gbG9jYWxcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBoYW5kbGUgcG9pbnRlciBkb3duIG9uIHNjcm9sbGJhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2Nyb2xsYmFyVXAoKVxuICAgIHtcbiAgICAgICAgdGhpcy5wb2ludGVyRG93biA9IG51bGxcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXNpemUgdGhlIG1hc2sgZm9yIHRoZSBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3hXaWR0aF0gd2lkdGggb2Ygc2Nyb2xsYm94IGluY2x1ZGluZyBzY3JvbGxiYXIgKGluIHBpeGVscylcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm94SGVpZ2h0XSBoZWlnaHQgb2Ygc2Nyb2xsYm94IGluY2x1ZGluZyBzY3JvbGxiYXIgKGluIHBpeGVscylcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc2Nyb2xsV2lkdGhdIHNldCB0aGUgd2lkdGggb2YgdGhlIGluc2lkZSBvZiB0aGUgc2Nyb2xsYm94IChsZWF2ZSBudWxsIHRvIHVzZSBjb250ZW50LndpZHRoKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JvbGxIZWlnaHRdIHNldCB0aGUgaGVpZ2h0IG9mIHRoZSBpbnNpZGUgb2YgdGhlIHNjcm9sbGJveCAobGVhdmUgbnVsbCB0byB1c2UgY29udGVudC5oZWlnaHQpXG4gICAgICovXG4gICAgcmVzaXplKG9wdGlvbnMpXG4gICAge1xuICAgICAgICB0aGlzLm9wdGlvbnMuYm94V2lkdGggPSB0eXBlb2Ygb3B0aW9ucy5ib3hXaWR0aCAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25zLmJveFdpZHRoIDogdGhpcy5vcHRpb25zLmJveFdpZHRoXG4gICAgICAgIHRoaXMub3B0aW9ucy5ib3hIZWlnaHQgPSB0eXBlb2Ygb3B0aW9ucy5ib3hIZWlnaHQgIT09ICd1bmRlZmluZWQnID8gb3B0aW9ucy5ib3hIZWlnaHQgOiB0aGlzLm9wdGlvbnMuYm94SGVpZ2h0XG4gICAgICAgIGlmIChvcHRpb25zLnNjcm9sbFdpZHRoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFdpZHRoID0gb3B0aW9ucy5zY3JvbGxXaWR0aFxuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnNjcm9sbEhlaWdodClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxIZWlnaHQgPSBvcHRpb25zLnNjcm9sbEhlaWdodFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udGVudC5yZXNpemUodGhpcy5vcHRpb25zLmJveFdpZHRoLCB0aGlzLm9wdGlvbnMuYm94SGVpZ2h0LCB0aGlzLnNjcm9sbFdpZHRoLCB0aGlzLnNjcm9sbEhlaWdodClcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGVuc3VyZSB0aGF0IHRoZSBib3VuZGluZyBib3ggaXMgdmlzaWJsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gcmVsYXRpdmUgdG8gY29udGVudCdzIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gICAgICovXG4gICAgZW5zdXJlVmlzaWJsZSh4LCB5LCB3aWR0aCwgaGVpZ2h0KVxuICAgIHtcbiAgICAgICAgdGhpcy5jb250ZW50LmVuc3VyZVZpc2libGUoeCwgeSwgd2lkdGgsIGhlaWdodClcbiAgICAgICAgdGhpcy5fZHJhd1Njcm9sbGJhcnMoKVxuICAgIH1cbn1cblxuaWYgKFBJWEkgJiYgUElYSS5leHRyYXMpXG57XG4gICAgUElYSS5leHRyYXMuU2Nyb2xsYm94ID0gU2Nyb2xsYm94XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsYm94Il19