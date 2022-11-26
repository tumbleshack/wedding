(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _zenscroll = _interopRequireDefault(require("./libs/zenscroll"));

var _waypoints = _interopRequireDefault(require("./libs/waypoints"));

var _photoswipe = _interopRequireDefault(require("./libs/photoswipe"));

var _photoswipeUiDefault = _interopRequireDefault(require("./libs/photoswipe-ui-default"));

var _primaryNav = _interopRequireDefault(require("./modules/primary-nav"));

var _timelineLoading = _interopRequireDefault(require("./modules/timeline-loading"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// libraries
// modules
(0, _primaryNav["default"])();
(0, _timelineLoading["default"])(); // Photoswipe

var initPhotoSwipeFromDOM = function initPhotoSwipeFromDOM(gallerySelector) {
  var parseThumbnailElements = function parseThumbnailElements(el) {
    var thumbElements = el.childNodes,
        numNodes = thumbElements.length,
        items = [],
        el,
        childElements,
        thumbnailEl,
        size,
        item;

    for (var i = 0; i < numNodes; i++) {
      el = thumbElements[i]; // include only element nodes

      if (el.nodeType !== 1) {
        continue;
      }

      childElements = el.children;
      size = el.getAttribute('data-size').split('x'); // create slide object

      item = {
        src: el.getAttribute('href'),
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10),
        author: el.getAttribute('data-author')
      };
      item.el = el; // save link to element for getThumbBoundsFn

      if (childElements.length > 0) {
        item.msrc = childElements[0].getAttribute('src'); // thumbnail url

        if (childElements.length > 1) {
          item.title = childElements[1].innerHTML; // caption (contents of figure)
        }
      }

      var mediumSrc = el.getAttribute('data-med');

      if (mediumSrc) {
        size = el.getAttribute('data-med-size').split('x'); // "medium-sized" image

        item.m = {
          src: mediumSrc,
          w: parseInt(size[0], 10),
          h: parseInt(size[1], 10)
        };
      } // original image


      item.o = {
        src: item.src,
        w: item.w,
        h: item.h
      };
      items.push(item);
    }

    return items;
  }; // find nearest parent element


  var closest = function closest(el, fn) {
    return el && (fn(el) ? el : closest(el.parentNode, fn));
  };

  var onThumbnailsClick = function onThumbnailsClick(e) {
    debugger;
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;
    var eTarget = e.target || e.srcElement;
    var clickedListItem = closest(eTarget, function (el) {
      return el.tagName === 'A';
    });

    if (!clickedListItem) {
      return;
    }

    var clickedGallery = clickedListItem.parentNode;
    var childNodes = clickedListItem.parentNode.childNodes,
        numChildNodes = childNodes.length,
        nodeIndex = 0,
        index;

    for (var i = 0; i < numChildNodes; i++) {
      if (childNodes[i].nodeType !== 1) {
        continue;
      }

      if (childNodes[i] === clickedListItem) {
        index = nodeIndex;
        break;
      }

      nodeIndex++;
    }

    if (index >= 0) {
      openPhotoSwipe(index, clickedGallery);
    }

    return false;
  };

  var photoswipeParseHash = function photoswipeParseHash() {
    var hash = window.location.hash.substring(1),
        params = {};

    if (hash.length < 5) {
      // pid=1
      return params;
    }

    var vars = hash.split('&');

    for (var i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue;
      }

      var pair = vars[i].split('=');

      if (pair.length < 2) {
        continue;
      }

      params[pair[0]] = pair[1];
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    return params;
  };

  var openPhotoSwipe = function openPhotoSwipe(index, galleryElement, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll('.pswp')[0],
        gallery,
        options,
        items;
    items = parseThumbnailElements(galleryElement); // define options (if needed)

    options = {
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),
      getThumbBoundsFn: function getThumbBoundsFn(index) {
        // See Options->getThumbBoundsFn section of docs for more info
        var thumbnail = items[index].el.children[0],
            pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
            rect = thumbnail.getBoundingClientRect();
        return {
          x: rect.left,
          y: rect.top + pageYScroll,
          w: rect.width
        };
      },
      addCaptionHTMLFn: function addCaptionHTMLFn(item, captionEl, isFake) {
        if (!item.title) {
          captionEl.children[0].innerText = '';
          return false;
        }

        captionEl.children[0].innerHTML = item.title + '<br/><small>Photo: ' + item.author + '</small>';
        return true;
      }
    };

    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (var j = 0; j < items.length; j++) {
          if (items[j].pid == index) {
            options.index = j;
            break;
          }
        }
      } else {
        options.index = parseInt(index, 10) - 1;
      }
    } else {
      options.index = parseInt(index, 10);
    } // exit if index not found


    if (isNaN(options.index)) {
      return;
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    } // Pass data to PhotoSwipe and initialize it


    gallery = new _photoswipe["default"](pswpElement, _photoswipeUiDefault["default"], items, options); // see: http://photoswipe.com/documentation/responsive-images.html

    var realViewportWidth,
        useLargeImages = false,
        firstResize = true,
        imageSrcWillChange;
    gallery.listen('beforeResize', function () {
      var dpiRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
      dpiRatio = Math.min(dpiRatio, 2.5);
      realViewportWidth = gallery.viewportSize.x * dpiRatio;

      if (realViewportWidth >= 1200 || !gallery.likelyTouchDevice && realViewportWidth > 800 || screen.width > 1200) {
        if (!useLargeImages) {
          useLargeImages = true;
          imageSrcWillChange = true;
        }
      } else {
        if (useLargeImages) {
          useLargeImages = false;
          imageSrcWillChange = true;
        }
      }

      if (imageSrcWillChange && !firstResize) {
        gallery.invalidateCurrItems();
      }

      if (firstResize) {
        firstResize = false;
      }

      imageSrcWillChange = false;
    });
    gallery.listen('gettingData', function (index, item) {
      if (useLargeImages) {
        item.src = item.o.src;
        item.w = item.o.w;
        item.h = item.o.h;
      } else {
        item.src = item.m.src;
        item.w = item.m.w;
        item.h = item.m.h;
      }
    });
    gallery.init();
  }; // select all gallery elements


  var galleryElements = document.querySelectorAll(gallerySelector);

  for (var i = 0, l = galleryElements.length; i < l; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i + 1);
    galleryElements[i].onclick = onThumbnailsClick;
  } // Parse URL and open gallery if it contains #&pid=3&gid=1


  var hashData = photoswipeParseHash();

  if (hashData.pid && hashData.gid) {
    openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
  }
};

initPhotoSwipeFromDOM('.gallery');

},{"./libs/photoswipe":3,"./libs/photoswipe-ui-default":2,"./libs/waypoints":4,"./libs/zenscroll":5,"./modules/primary-nav":6,"./modules/timeline-loading":7}],2:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

/*! PhotoSwipe Default UI - 4.1.1 - 2015-12-24
* http://photoswipe.com
* Copyright (c) 2015 Dmitry Semenov; */

/**
*
* UI on top of main sliding area (caption, arrows, close button, etc.).
* Built just using public methods/properties of PhotoSwipe.
*
*/
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
    module.exports = factory();
  } else {
    root.PhotoSwipeUI_Default = factory();
  }
})(void 0, function () {
  'use strict';

  var PhotoSwipeUI_Default = function PhotoSwipeUI_Default(pswp, framework) {
    var ui = this;

    var _overlayUIUpdated = false,
        _controlsVisible = true,
        _fullscrenAPI,
        _controls,
        _captionContainer,
        _fakeCaptionContainer,
        _indexIndicator,
        _shareButton,
        _shareModal,
        _shareModalHidden = true,
        _initalCloseOnScrollValue,
        _isIdle,
        _listen,
        _loadingIndicator,
        _loadingIndicatorHidden,
        _loadingIndicatorTimeout,
        _galleryHasOneSlide,
        _options,
        _defaultUIOptions = {
      barsSize: {
        top: 44,
        bottom: 'auto'
      },
      closeElClasses: ['item', 'caption', 'zoom-wrap', 'ui', 'top-bar'],
      timeToIdle: 4000,
      timeToIdleOutside: 1000,
      loadingIndicatorDelay: 1000,
      // 2s
      addCaptionHTMLFn: function addCaptionHTMLFn(item, captionEl
      /*, isFake */
      ) {
        if (!item.title) {
          captionEl.children[0].innerHTML = '';
          return false;
        }

        captionEl.children[0].innerHTML = item.title;
        return true;
      },
      closeEl: true,
      captionEl: true,
      fullscreenEl: true,
      zoomEl: true,
      shareEl: true,
      counterEl: true,
      arrowEl: true,
      preloaderEl: true,
      tapToClose: false,
      tapToToggleControls: true,
      clickToCloseNonZoomable: true,
      shareButtons: [{
        id: 'facebook',
        label: 'Share on Facebook',
        url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}'
      }, {
        id: 'twitter',
        label: 'Tweet',
        url: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'
      }, {
        id: 'download',
        label: 'Download image',
        url: '{{raw_image_url}}',
        download: true
      }],
      getImageURLForShare: function
        /* shareButtonData */
      getImageURLForShare() {
        return pswp.currItem.src || '';
      },
      getPageURLForShare: function
        /* shareButtonData */
      getPageURLForShare() {
        return window.location.href;
      },
      getTextForShare: function
        /* shareButtonData */
      getTextForShare() {
        return pswp.currItem.title || '';
      },
      indexIndicatorSep: ' / ',
      fitControlsWidth: 1200
    },
        _blockControlsTap,
        _blockControlsTapTimeout;

    var _onControlsTap = function _onControlsTap(e) {
      if (_blockControlsTap) {
        return true;
      }

      e = e || window.event;

      if (_options.timeToIdle && _options.mouseUsed && !_isIdle) {
        // reset idle timer
        _onIdleMouseMove();
      }

      var target = e.target || e.srcElement,
          uiElement,
          clickedClass = target.getAttribute('class') || '',
          found;

      for (var i = 0; i < _uiElements.length; i++) {
        uiElement = _uiElements[i];

        if (uiElement.onTap && clickedClass.indexOf('pswp__' + uiElement.name) > -1) {
          uiElement.onTap();
          found = true;
        }
      }

      if (found) {
        if (e.stopPropagation) {
          e.stopPropagation();
        }

        _blockControlsTap = true; // Some versions of Android don't prevent ghost click event
        // when preventDefault() was called on touchstart and/or touchend.
        //
        // This happens on v4.3, 4.2, 4.1,
        // older versions strangely work correctly,
        // but just in case we add delay on all of them)

        var tapDelay = framework.features.isOldAndroid ? 600 : 30;
        _blockControlsTapTimeout = setTimeout(function () {
          _blockControlsTap = false;
        }, tapDelay);
      }
    },
        _fitControlsInViewport = function _fitControlsInViewport() {
      return !pswp.likelyTouchDevice || _options.mouseUsed || screen.width > _options.fitControlsWidth;
    },
        _togglePswpClass = function _togglePswpClass(el, cName, add) {
      framework[(add ? 'add' : 'remove') + 'Class'](el, 'pswp__' + cName);
    },
        // add class when there is just one item in the gallery
    // (by default it hides left/right arrows and 1ofX counter)
    _countNumItems = function _countNumItems() {
      var hasOneSlide = _options.getNumItemsFn() === 1;

      if (hasOneSlide !== _galleryHasOneSlide) {
        _togglePswpClass(_controls, 'ui--one-slide', hasOneSlide);

        _galleryHasOneSlide = hasOneSlide;
      }
    },
        _toggleShareModalClass = function _toggleShareModalClass() {
      _togglePswpClass(_shareModal, 'share-modal--hidden', _shareModalHidden);
    },
        _toggleShareModal = function _toggleShareModal() {
      _shareModalHidden = !_shareModalHidden;

      if (!_shareModalHidden) {
        _toggleShareModalClass();

        setTimeout(function () {
          if (!_shareModalHidden) {
            framework.addClass(_shareModal, 'pswp__share-modal--fade-in');
          }
        }, 30);
      } else {
        framework.removeClass(_shareModal, 'pswp__share-modal--fade-in');
        setTimeout(function () {
          if (_shareModalHidden) {
            _toggleShareModalClass();
          }
        }, 300);
      }

      if (!_shareModalHidden) {
        _updateShareURLs();
      }

      return false;
    },
        _openWindowPopup = function _openWindowPopup(e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      pswp.shout('shareLinkClick', e, target);

      if (!target.href) {
        return false;
      }

      if (target.hasAttribute('download')) {
        return true;
      }

      window.open(target.href, 'pswp_share', 'scrollbars=yes,resizable=yes,toolbar=no,' + 'location=yes,width=550,height=420,top=100,left=' + (window.screen ? Math.round(screen.width / 2 - 275) : 100));

      if (!_shareModalHidden) {
        _toggleShareModal();
      }

      return false;
    },
        _updateShareURLs = function _updateShareURLs() {
      var shareButtonOut = '',
          shareButtonData,
          shareURL,
          image_url,
          page_url,
          share_text;

      for (var i = 0; i < _options.shareButtons.length; i++) {
        shareButtonData = _options.shareButtons[i];
        image_url = _options.getImageURLForShare(shareButtonData);
        page_url = _options.getPageURLForShare(shareButtonData);
        share_text = _options.getTextForShare(shareButtonData);
        shareURL = shareButtonData.url.replace('{{url}}', encodeURIComponent(page_url)).replace('{{image_url}}', encodeURIComponent(image_url)).replace('{{raw_image_url}}', image_url).replace('{{text}}', encodeURIComponent(share_text));
        shareButtonOut += '<a href="' + shareURL + '" target="_blank" ' + 'class="pswp__share--' + shareButtonData.id + '"' + (shareButtonData.download ? 'download' : '') + '>' + shareButtonData.label + '</a>';

        if (_options.parseShareButtonOut) {
          shareButtonOut = _options.parseShareButtonOut(shareButtonData, shareButtonOut);
        }
      }

      _shareModal.children[0].innerHTML = shareButtonOut;
      _shareModal.children[0].onclick = _openWindowPopup;
    },
        _hasCloseClass = function _hasCloseClass(target) {
      for (var i = 0; i < _options.closeElClasses.length; i++) {
        if (framework.hasClass(target, 'pswp__' + _options.closeElClasses[i])) {
          return true;
        }
      }
    },
        _idleInterval,
        _idleTimer,
        _idleIncrement = 0,
        _onIdleMouseMove = function _onIdleMouseMove() {
      clearTimeout(_idleTimer);
      _idleIncrement = 0;

      if (_isIdle) {
        ui.setIdle(false);
      }
    },
        _onMouseLeaveWindow = function _onMouseLeaveWindow(e) {
      e = e ? e : window.event;
      var from = e.relatedTarget || e.toElement;

      if (!from || from.nodeName === 'HTML') {
        clearTimeout(_idleTimer);
        _idleTimer = setTimeout(function () {
          ui.setIdle(true);
        }, _options.timeToIdleOutside);
      }
    },
        _setupFullscreenAPI = function _setupFullscreenAPI() {
      if (_options.fullscreenEl && !framework.features.isOldAndroid) {
        if (!_fullscrenAPI) {
          _fullscrenAPI = ui.getFullscreenAPI();
        }

        if (_fullscrenAPI) {
          framework.bind(document, _fullscrenAPI.eventK, ui.updateFullscreen);
          ui.updateFullscreen();
          framework.addClass(pswp.template, 'pswp--supports-fs');
        } else {
          framework.removeClass(pswp.template, 'pswp--supports-fs');
        }
      }
    },
        _setupLoadingIndicator = function _setupLoadingIndicator() {
      // Setup loading indicator
      if (_options.preloaderEl) {
        _toggleLoadingIndicator(true);

        _listen('beforeChange', function () {
          clearTimeout(_loadingIndicatorTimeout); // display loading indicator with delay

          _loadingIndicatorTimeout = setTimeout(function () {
            if (pswp.currItem && pswp.currItem.loading) {
              if (!pswp.allowProgressiveImg() || pswp.currItem.img && !pswp.currItem.img.naturalWidth) {
                // show preloader if progressive loading is not enabled,
                // or image width is not defined yet (because of slow connection)
                _toggleLoadingIndicator(false); // items-controller.js function allowProgressiveImg

              }
            } else {
              _toggleLoadingIndicator(true); // hide preloader

            }
          }, _options.loadingIndicatorDelay);
        });

        _listen('imageLoadComplete', function (index, item) {
          if (pswp.currItem === item) {
            _toggleLoadingIndicator(true);
          }
        });
      }
    },
        _toggleLoadingIndicator = function _toggleLoadingIndicator(hide) {
      if (_loadingIndicatorHidden !== hide) {
        _togglePswpClass(_loadingIndicator, 'preloader--active', !hide);

        _loadingIndicatorHidden = hide;
      }
    },
        _applyNavBarGaps = function _applyNavBarGaps(item) {
      var gap = item.vGap;

      if (_fitControlsInViewport()) {
        var bars = _options.barsSize;

        if (_options.captionEl && bars.bottom === 'auto') {
          if (!_fakeCaptionContainer) {
            _fakeCaptionContainer = framework.createEl('pswp__caption pswp__caption--fake');

            _fakeCaptionContainer.appendChild(framework.createEl('pswp__caption__center'));

            _controls.insertBefore(_fakeCaptionContainer, _captionContainer);

            framework.addClass(_controls, 'pswp__ui--fit');
          }

          if (_options.addCaptionHTMLFn(item, _fakeCaptionContainer, true)) {
            var captionSize = _fakeCaptionContainer.clientHeight;
            gap.bottom = parseInt(captionSize, 10) || 44;
          } else {
            gap.bottom = bars.top; // if no caption, set size of bottom gap to size of top
          }
        } else {
          gap.bottom = bars.bottom === 'auto' ? 0 : bars.bottom;
        } // height of top bar is static, no need to calculate it


        gap.top = bars.top;
      } else {
        gap.top = gap.bottom = 0;
      }
    },
        _setupIdle = function _setupIdle() {
      // Hide controls when mouse is used
      if (_options.timeToIdle) {
        _listen('mouseUsed', function () {
          framework.bind(document, 'mousemove', _onIdleMouseMove);
          framework.bind(document, 'mouseout', _onMouseLeaveWindow);
          _idleInterval = setInterval(function () {
            _idleIncrement++;

            if (_idleIncrement === 2) {
              ui.setIdle(true);
            }
          }, _options.timeToIdle / 2);
        });
      }
    },
        _setupHidingControlsDuringGestures = function _setupHidingControlsDuringGestures() {
      // Hide controls on vertical drag
      _listen('onVerticalDrag', function (now) {
        if (_controlsVisible && now < 0.95) {
          ui.hideControls();
        } else if (!_controlsVisible && now >= 0.95) {
          ui.showControls();
        }
      }); // Hide controls when pinching to close


      var pinchControlsHidden;

      _listen('onPinchClose', function (now) {
        if (_controlsVisible && now < 0.9) {
          ui.hideControls();
          pinchControlsHidden = true;
        } else if (pinchControlsHidden && !_controlsVisible && now > 0.9) {
          ui.showControls();
        }
      });

      _listen('zoomGestureEnded', function () {
        pinchControlsHidden = false;

        if (pinchControlsHidden && !_controlsVisible) {
          ui.showControls();
        }
      });
    };

    var _uiElements = [{
      name: 'caption',
      option: 'captionEl',
      onInit: function onInit(el) {
        _captionContainer = el;
      }
    }, {
      name: 'share-modal',
      option: 'shareEl',
      onInit: function onInit(el) {
        _shareModal = el;
      },
      onTap: function onTap() {
        _toggleShareModal();
      }
    }, {
      name: 'button--share',
      option: 'shareEl',
      onInit: function onInit(el) {
        _shareButton = el;
      },
      onTap: function onTap() {
        _toggleShareModal();
      }
    }, {
      name: 'button--zoom',
      option: 'zoomEl',
      onTap: pswp.toggleDesktopZoom
    }, {
      name: 'counter',
      option: 'counterEl',
      onInit: function onInit(el) {
        _indexIndicator = el;
      }
    }, {
      name: 'button--close',
      option: 'closeEl',
      onTap: pswp.close
    }, {
      name: 'button--arrow--left',
      option: 'arrowEl',
      onTap: pswp.prev
    }, {
      name: 'button--arrow--right',
      option: 'arrowEl',
      onTap: pswp.next
    }, {
      name: 'button--fs',
      option: 'fullscreenEl',
      onTap: function onTap() {
        if (_fullscrenAPI.isFullscreen()) {
          _fullscrenAPI.exit();
        } else {
          _fullscrenAPI.enter();
        }
      }
    }, {
      name: 'preloader',
      option: 'preloaderEl',
      onInit: function onInit(el) {
        _loadingIndicator = el;
      }
    }];

    var _setupUIElements = function _setupUIElements() {
      var item, classAttr, uiElement;

      var loopThroughChildElements = function loopThroughChildElements(sChildren) {
        if (!sChildren) {
          return;
        }

        var l = sChildren.length;

        for (var i = 0; i < l; i++) {
          item = sChildren[i];
          classAttr = item.className;

          for (var a = 0; a < _uiElements.length; a++) {
            uiElement = _uiElements[a];

            if (classAttr.indexOf('pswp__' + uiElement.name) > -1) {
              if (_options[uiElement.option]) {
                // if element is not disabled from options
                framework.removeClass(item, 'pswp__element--disabled');

                if (uiElement.onInit) {
                  uiElement.onInit(item);
                } //item.style.display = 'block';

              } else {
                framework.addClass(item, 'pswp__element--disabled'); //item.style.display = 'none';
              }
            }
          }
        }
      };

      loopThroughChildElements(_controls.children);
      var topBar = framework.getChildByClass(_controls, 'pswp__top-bar');

      if (topBar) {
        loopThroughChildElements(topBar.children);
      }
    };

    ui.init = function () {
      // extend options
      framework.extend(pswp.options, _defaultUIOptions, true); // create local link for fast access

      _options = pswp.options; // find pswp__ui element

      _controls = framework.getChildByClass(pswp.scrollWrap, 'pswp__ui'); // create local link

      _listen = pswp.listen;

      _setupHidingControlsDuringGestures(); // update controls when slides change


      _listen('beforeChange', ui.update); // toggle zoom on double-tap


      _listen('doubleTap', function (point) {
        var initialZoomLevel = pswp.currItem.initialZoomLevel;

        if (pswp.getZoomLevel() !== initialZoomLevel) {
          pswp.zoomTo(initialZoomLevel, point, 333);
        } else {
          pswp.zoomTo(_options.getDoubleTapZoom(false, pswp.currItem), point, 333);
        }
      }); // Allow text selection in caption


      _listen('preventDragEvent', function (e, isDown, preventObj) {
        var t = e.target || e.srcElement;

        if (t && t.getAttribute('class') && e.type.indexOf('mouse') > -1 && (t.getAttribute('class').indexOf('__caption') > 0 || /(SMALL|STRONG|EM)/i.test(t.tagName))) {
          preventObj.prevent = false;
        }
      }); // bind events for UI


      _listen('bindEvents', function () {
        framework.bind(_controls, 'pswpTap click', _onControlsTap);
        framework.bind(pswp.scrollWrap, 'pswpTap', ui.onGlobalTap);

        if (!pswp.likelyTouchDevice) {
          framework.bind(pswp.scrollWrap, 'mouseover', ui.onMouseOver);
        }
      }); // unbind events for UI


      _listen('unbindEvents', function () {
        if (!_shareModalHidden) {
          _toggleShareModal();
        }

        if (_idleInterval) {
          clearInterval(_idleInterval);
        }

        framework.unbind(document, 'mouseout', _onMouseLeaveWindow);
        framework.unbind(document, 'mousemove', _onIdleMouseMove);
        framework.unbind(_controls, 'pswpTap click', _onControlsTap);
        framework.unbind(pswp.scrollWrap, 'pswpTap', ui.onGlobalTap);
        framework.unbind(pswp.scrollWrap, 'mouseover', ui.onMouseOver);

        if (_fullscrenAPI) {
          framework.unbind(document, _fullscrenAPI.eventK, ui.updateFullscreen);

          if (_fullscrenAPI.isFullscreen()) {
            _options.hideAnimationDuration = 0;

            _fullscrenAPI.exit();
          }

          _fullscrenAPI = null;
        }
      }); // clean up things when gallery is destroyed


      _listen('destroy', function () {
        if (_options.captionEl) {
          if (_fakeCaptionContainer) {
            _controls.removeChild(_fakeCaptionContainer);
          }

          framework.removeClass(_captionContainer, 'pswp__caption--empty');
        }

        if (_shareModal) {
          _shareModal.children[0].onclick = null;
        }

        framework.removeClass(_controls, 'pswp__ui--over-close');
        framework.addClass(_controls, 'pswp__ui--hidden');
        ui.setIdle(false);
      });

      if (!_options.showAnimationDuration) {
        framework.removeClass(_controls, 'pswp__ui--hidden');
      }

      _listen('initialZoomIn', function () {
        if (_options.showAnimationDuration) {
          framework.removeClass(_controls, 'pswp__ui--hidden');
        }
      });

      _listen('initialZoomOut', function () {
        framework.addClass(_controls, 'pswp__ui--hidden');
      });

      _listen('parseVerticalMargin', _applyNavBarGaps);

      _setupUIElements();

      if (_options.shareEl && _shareButton && _shareModal) {
        _shareModalHidden = true;
      }

      _countNumItems();

      _setupIdle();

      _setupFullscreenAPI();

      _setupLoadingIndicator();
    };

    ui.setIdle = function (isIdle) {
      _isIdle = isIdle;

      _togglePswpClass(_controls, 'ui--idle', isIdle);
    };

    ui.update = function () {
      // Don't update UI if it's hidden
      if (_controlsVisible && pswp.currItem) {
        ui.updateIndexIndicator();

        if (_options.captionEl) {
          _options.addCaptionHTMLFn(pswp.currItem, _captionContainer);

          _togglePswpClass(_captionContainer, 'caption--empty', !pswp.currItem.title);
        }

        _overlayUIUpdated = true;
      } else {
        _overlayUIUpdated = false;
      }

      if (!_shareModalHidden) {
        _toggleShareModal();
      }

      _countNumItems();
    };

    ui.updateFullscreen = function (e) {
      if (e) {
        // some browsers change window scroll position during the fullscreen
        // so PhotoSwipe updates it just in case
        setTimeout(function () {
          pswp.setScrollOffset(0, framework.getScrollY());
        }, 50);
      } // toogle pswp--fs class on root element


      framework[(_fullscrenAPI.isFullscreen() ? 'add' : 'remove') + 'Class'](pswp.template, 'pswp--fs');
    };

    ui.updateIndexIndicator = function () {
      if (_options.counterEl) {
        _indexIndicator.innerHTML = pswp.getCurrentIndex() + 1 + _options.indexIndicatorSep + _options.getNumItemsFn();
      }
    };

    ui.onGlobalTap = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;

      if (_blockControlsTap) {
        return;
      }

      if (e.detail && e.detail.pointerType === 'mouse') {
        // close gallery if clicked outside of the image
        if (_hasCloseClass(target)) {
          pswp.close();
          return;
        }

        if (framework.hasClass(target, 'pswp__img')) {
          if (pswp.getZoomLevel() === 1 && pswp.getZoomLevel() <= pswp.currItem.fitRatio) {
            if (_options.clickToCloseNonZoomable) {
              pswp.close();
            }
          } else {
            pswp.toggleDesktopZoom(e.detail.releasePoint);
          }
        }
      } else {
        // tap anywhere (except buttons) to toggle visibility of controls
        if (_options.tapToToggleControls) {
          if (_controlsVisible) {
            ui.hideControls();
          } else {
            ui.showControls();
          }
        } // tap to close gallery


        if (_options.tapToClose && (framework.hasClass(target, 'pswp__img') || _hasCloseClass(target))) {
          pswp.close();
          return;
        }
      }
    };

    ui.onMouseOver = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement; // add class when mouse is over an element that should close the gallery

      _togglePswpClass(_controls, 'ui--over-close', _hasCloseClass(target));
    };

    ui.hideControls = function () {
      framework.addClass(_controls, 'pswp__ui--hidden');
      _controlsVisible = false;
    };

    ui.showControls = function () {
      _controlsVisible = true;

      if (!_overlayUIUpdated) {
        ui.update();
      }

      framework.removeClass(_controls, 'pswp__ui--hidden');
    };

    ui.supportsFullscreen = function () {
      var d = document;
      return !!(d.exitFullscreen || d.mozCancelFullScreen || d.webkitExitFullscreen || d.msExitFullscreen);
    };

    ui.getFullscreenAPI = function () {
      var dE = document.documentElement,
          api,
          tF = 'fullscreenchange';

      if (dE.requestFullscreen) {
        api = {
          enterK: 'requestFullscreen',
          exitK: 'exitFullscreen',
          elementK: 'fullscreenElement',
          eventK: tF
        };
      } else if (dE.mozRequestFullScreen) {
        api = {
          enterK: 'mozRequestFullScreen',
          exitK: 'mozCancelFullScreen',
          elementK: 'mozFullScreenElement',
          eventK: 'moz' + tF
        };
      } else if (dE.webkitRequestFullscreen) {
        api = {
          enterK: 'webkitRequestFullscreen',
          exitK: 'webkitExitFullscreen',
          elementK: 'webkitFullscreenElement',
          eventK: 'webkit' + tF
        };
      } else if (dE.msRequestFullscreen) {
        api = {
          enterK: 'msRequestFullscreen',
          exitK: 'msExitFullscreen',
          elementK: 'msFullscreenElement',
          eventK: 'MSFullscreenChange'
        };
      }

      if (api) {
        api.enter = function () {
          // disable close-on-scroll in fullscreen
          _initalCloseOnScrollValue = _options.closeOnScroll;
          _options.closeOnScroll = false;

          if (this.enterK === 'webkitRequestFullscreen') {
            pswp.template[this.enterK](Element.ALLOW_KEYBOARD_INPUT);
          } else {
            return pswp.template[this.enterK]();
          }
        };

        api.exit = function () {
          _options.closeOnScroll = _initalCloseOnScrollValue;
          return document[this.exitK]();
        };

        api.isFullscreen = function () {
          return document[this.elementK];
        };
      }

      return api;
    };
  };

  return PhotoSwipeUI_Default;
});

},{}],3:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

/*! PhotoSwipe - v4.1.1 - 2015-12-24
* http://photoswipe.com
* Copyright (c) 2015 Dmitry Semenov; */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
    module.exports = factory();
  } else {
    root.PhotoSwipe = factory();
  }
})(void 0, function () {
  'use strict';

  var PhotoSwipe = function PhotoSwipe(template, UiClass, items, options) {
    /*>>framework-bridge*/

    /**
     *
     * Set of generic functions used by gallery.
     * 
     * You're free to modify anything here as long as functionality is kept.
     * 
     */
    var framework = {
      features: null,
      bind: function bind(target, type, listener, unbind) {
        var methodName = (unbind ? 'remove' : 'add') + 'EventListener';
        type = type.split(' ');

        for (var i = 0; i < type.length; i++) {
          if (type[i]) {
            target[methodName](type[i], listener, false);
          }
        }
      },
      isArray: function isArray(obj) {
        return obj instanceof Array;
      },
      createEl: function createEl(classes, tag) {
        var el = document.createElement(tag || 'div');

        if (classes) {
          el.className = classes;
        }

        return el;
      },
      getScrollY: function getScrollY() {
        var yOffset = window.pageYOffset;
        return yOffset !== undefined ? yOffset : document.documentElement.scrollTop;
      },
      unbind: function unbind(target, type, listener) {
        framework.bind(target, type, listener, true);
      },
      removeClass: function removeClass(el, className) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      },
      addClass: function addClass(el, className) {
        if (!framework.hasClass(el, className)) {
          el.className += (el.className ? ' ' : '') + className;
        }
      },
      hasClass: function hasClass(el, className) {
        return el.className && new RegExp('(^|\\s)' + className + '(\\s|$)').test(el.className);
      },
      getChildByClass: function getChildByClass(parentEl, childClassName) {
        var node = parentEl.firstChild;

        while (node) {
          if (framework.hasClass(node, childClassName)) {
            return node;
          }

          node = node.nextSibling;
        }
      },
      arraySearch: function arraySearch(array, value, key) {
        var i = array.length;

        while (i--) {
          if (array[i][key] === value) {
            return i;
          }
        }

        return -1;
      },
      extend: function extend(o1, o2, preventOverwrite) {
        for (var prop in o2) {
          if (o2.hasOwnProperty(prop)) {
            if (preventOverwrite && o1.hasOwnProperty(prop)) {
              continue;
            }

            o1[prop] = o2[prop];
          }
        }
      },
      easing: {
        sine: {
          out: function out(k) {
            return Math.sin(k * (Math.PI / 2));
          },
          inOut: function inOut(k) {
            return -(Math.cos(Math.PI * k) - 1) / 2;
          }
        },
        cubic: {
          out: function out(k) {
            return --k * k * k + 1;
          }
        }
        /*
        	elastic: {
        		out: function ( k ) {
        				var s, a = 0.1, p = 0.4;
        			if ( k === 0 ) return 0;
        			if ( k === 1 ) return 1;
        			if ( !a || a < 1 ) { a = 1; s = p / 4; }
        			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
        			},
        	},
        	back: {
        		out: function ( k ) {
        			var s = 1.70158;
        			return --k * k * ( ( s + 1 ) * k + s ) + 1;
        		}
        	}
        */

      },

      /**
       * 
       * @return {object}
       * 
       * {
       *  raf : request animation frame function
       *  caf : cancel animation frame function
       *  transfrom : transform property key (with vendor), or null if not supported
       *  oldIE : IE8 or below
       * }
       * 
       */
      detectFeatures: function detectFeatures() {
        if (framework.features) {
          return framework.features;
        }

        var helperEl = framework.createEl(),
            helperStyle = helperEl.style,
            vendor = '',
            features = {}; // IE8 and below

        features.oldIE = document.all && !document.addEventListener;
        features.touch = 'ontouchstart' in window;

        if (window.requestAnimationFrame) {
          features.raf = window.requestAnimationFrame;
          features.caf = window.cancelAnimationFrame;
        }

        features.pointerEvent = navigator.pointerEnabled || navigator.msPointerEnabled; // fix false-positive detection of old Android in new IE
        // (IE11 ua string contains "Android 4.0")

        if (!features.pointerEvent) {
          var ua = navigator.userAgent; // Detect if device is iPhone or iPod and if it's older than iOS 8
          // http://stackoverflow.com/a/14223920
          // 
          // This detection is made because of buggy top/bottom toolbars
          // that don't trigger window.resize event.
          // For more info refer to _isFixedPosition variable in core.js

          if (/iP(hone|od)/.test(navigator.platform)) {
            var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);

            if (v && v.length > 0) {
              v = parseInt(v[1], 10);

              if (v >= 1 && v < 8) {
                features.isOldIOSPhone = true;
              }
            }
          } // Detect old Android (before KitKat)
          // due to bugs related to position:fixed
          // http://stackoverflow.com/questions/7184573/pick-up-the-android-version-in-the-browser-by-javascript


          var match = ua.match(/Android\s([0-9\.]*)/);
          var androidversion = match ? match[1] : 0;
          androidversion = parseFloat(androidversion);

          if (androidversion >= 1) {
            if (androidversion < 4.4) {
              features.isOldAndroid = true; // for fixed position bug & performance
            }

            features.androidVersion = androidversion; // for touchend bug
          }

          features.isMobileOpera = /opera mini|opera mobi/i.test(ua); // p.s. yes, yes, UA sniffing is bad, propose your solution for above bugs.
        }

        var styleChecks = ['transform', 'perspective', 'animationName'],
            vendors = ['', 'webkit', 'Moz', 'ms', 'O'],
            styleCheckItem,
            styleName;

        for (var i = 0; i < 4; i++) {
          vendor = vendors[i];

          for (var a = 0; a < 3; a++) {
            styleCheckItem = styleChecks[a]; // uppercase first letter of property name, if vendor is present

            styleName = vendor + (vendor ? styleCheckItem.charAt(0).toUpperCase() + styleCheckItem.slice(1) : styleCheckItem);

            if (!features[styleCheckItem] && styleName in helperStyle) {
              features[styleCheckItem] = styleName;
            }
          }

          if (vendor && !features.raf) {
            vendor = vendor.toLowerCase();
            features.raf = window[vendor + 'RequestAnimationFrame'];

            if (features.raf) {
              features.caf = window[vendor + 'CancelAnimationFrame'] || window[vendor + 'CancelRequestAnimationFrame'];
            }
          }
        }

        if (!features.raf) {
          var lastTime = 0;

          features.raf = function (fn) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
              fn(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
          };

          features.caf = function (id) {
            clearTimeout(id);
          };
        } // Detect SVG support


        features.svg = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
        framework.features = features;
        return features;
      }
    };
    framework.detectFeatures(); // Override addEventListener for old versions of IE

    if (framework.features.oldIE) {
      framework.bind = function (target, type, listener, unbind) {
        type = type.split(' ');

        var methodName = (unbind ? 'detach' : 'attach') + 'Event',
            evName,
            _handleEv = function _handleEv() {
          listener.handleEvent.call(listener);
        };

        for (var i = 0; i < type.length; i++) {
          evName = type[i];

          if (evName) {
            if (_typeof(listener) === 'object' && listener.handleEvent) {
              if (!unbind) {
                listener['oldIE' + evName] = _handleEv;
              } else {
                if (!listener['oldIE' + evName]) {
                  return false;
                }
              }

              target[methodName]('on' + evName, listener['oldIE' + evName]);
            } else {
              target[methodName]('on' + evName, listener);
            }
          }
        }
      };
    }
    /*>>framework-bridge*/

    /*>>core*/
    //function(template, UiClass, items, options)


    var self = this;
    /**
     * Static vars, don't change unless you know what you're doing.
     */

    var DOUBLE_TAP_RADIUS = 25,
        NUM_HOLDERS = 3;
    /**
     * Options
     */

    var _options = {
      allowPanToNext: true,
      spacing: 0.12,
      bgOpacity: 1,
      mouseUsed: false,
      loop: true,
      pinchToClose: true,
      closeOnScroll: true,
      closeOnVerticalDrag: true,
      verticalDragRange: 0.75,
      hideAnimationDuration: 333,
      showAnimationDuration: 333,
      showHideOpacity: false,
      focus: true,
      escKey: true,
      arrowKeys: true,
      mainScrollEndFriction: 0.35,
      panEndFriction: 0.35,
      isClickableElement: function isClickableElement(el) {
        return el.tagName === 'A';
      },
      getDoubleTapZoom: function getDoubleTapZoom(isMouseClick, item) {
        if (isMouseClick) {
          return 1;
        } else {
          return item.initialZoomLevel < 0.7 ? 1 : 1.33;
        }
      },
      maxSpreadZoom: 1.33,
      modal: true,
      // not fully implemented yet
      scaleMode: 'fit' // TODO

    };
    framework.extend(_options, options);
    /**
     * Private helper variables & functions
     */

    var _getEmptyPoint = function _getEmptyPoint() {
      return {
        x: 0,
        y: 0
      };
    };

    var _isOpen,
        _isDestroying,
        _closedByScroll,
        _currentItemIndex,
        _containerStyle,
        _containerShiftIndex,
        _currPanDist = _getEmptyPoint(),
        _startPanOffset = _getEmptyPoint(),
        _panOffset = _getEmptyPoint(),
        _upMoveEvents,
        // drag move, drag end & drag cancel events array
    _downEvents,
        // drag start events array
    _globalEventHandlers,
        _viewportSize = {},
        _currZoomLevel,
        _startZoomLevel,
        _translatePrefix,
        _translateSufix,
        _updateSizeInterval,
        _itemsNeedUpdate,
        _currPositionIndex = 0,
        _offset = {},
        _slideSize = _getEmptyPoint(),
        // size of slide area, including spacing
    _itemHolders,
        _prevItemIndex,
        _indexDiff = 0,
        // difference of indexes since last content update
    _dragStartEvent,
        _dragMoveEvent,
        _dragEndEvent,
        _dragCancelEvent,
        _transformKey,
        _pointerEventEnabled,
        _isFixedPosition = true,
        _likelyTouchDevice,
        _modules = [],
        _requestAF,
        _cancelAF,
        _initalClassName,
        _initalWindowScrollY,
        _oldIE,
        _currentWindowScrollY,
        _features,
        _windowVisibleSize = {},
        _renderMaxResolution = false,
        // Registers PhotoSWipe module (History, Controller ...)
    _registerModule = function _registerModule(name, module) {
      framework.extend(self, module.publicMethods);

      _modules.push(name);
    },
        _getLoopedId = function _getLoopedId(index) {
      var numSlides = _getNumItems();

      if (index > numSlides - 1) {
        return index - numSlides;
      } else if (index < 0) {
        return numSlides + index;
      }

      return index;
    },
        // Micro bind/trigger
    _listeners = {},
        _listen = function _listen(name, fn) {
      if (!_listeners[name]) {
        _listeners[name] = [];
      }

      return _listeners[name].push(fn);
    },
        _shout = function _shout(name) {
      var listeners = _listeners[name];

      if (listeners) {
        var args = Array.prototype.slice.call(arguments);
        args.shift();

        for (var i = 0; i < listeners.length; i++) {
          listeners[i].apply(self, args);
        }
      }
    },
        _getCurrentTime = function _getCurrentTime() {
      return new Date().getTime();
    },
        _applyBgOpacity = function _applyBgOpacity(opacity) {
      _bgOpacity = opacity;
      self.bg.style.opacity = opacity * _options.bgOpacity;
    },
        _applyZoomTransform = function _applyZoomTransform(styleObj, x, y, zoom, item) {
      if (!_renderMaxResolution || item && item !== self.currItem) {
        zoom = zoom / (item ? item.fitRatio : self.currItem.fitRatio);
      }

      styleObj[_transformKey] = _translatePrefix + x + 'px, ' + y + 'px' + _translateSufix + ' scale(' + zoom + ')';
    },
        _applyCurrentZoomPan = function _applyCurrentZoomPan(allowRenderResolution) {
      if (_currZoomElementStyle) {
        if (allowRenderResolution) {
          if (_currZoomLevel > self.currItem.fitRatio) {
            if (!_renderMaxResolution) {
              _setImageSize(self.currItem, false, true);

              _renderMaxResolution = true;
            }
          } else {
            if (_renderMaxResolution) {
              _setImageSize(self.currItem);

              _renderMaxResolution = false;
            }
          }
        }

        _applyZoomTransform(_currZoomElementStyle, _panOffset.x, _panOffset.y, _currZoomLevel);
      }
    },
        _applyZoomPanToItem = function _applyZoomPanToItem(item) {
      if (item.container) {
        _applyZoomTransform(item.container.style, item.initialPosition.x, item.initialPosition.y, item.initialZoomLevel, item);
      }
    },
        _setTranslateX = function _setTranslateX(x, elStyle) {
      elStyle[_transformKey] = _translatePrefix + x + 'px, 0px' + _translateSufix;
    },
        _moveMainScroll = function _moveMainScroll(x, dragging) {
      if (!_options.loop && dragging) {
        var newSlideIndexOffset = _currentItemIndex + (_slideSize.x * _currPositionIndex - x) / _slideSize.x,
            delta = Math.round(x - _mainScrollPos.x);

        if (newSlideIndexOffset < 0 && delta > 0 || newSlideIndexOffset >= _getNumItems() - 1 && delta < 0) {
          x = _mainScrollPos.x + delta * _options.mainScrollEndFriction;
        }
      }

      _mainScrollPos.x = x;

      _setTranslateX(x, _containerStyle);
    },
        _calculatePanOffset = function _calculatePanOffset(axis, zoomLevel) {
      var m = _midZoomPoint[axis] - _offset[axis];
      return _startPanOffset[axis] + _currPanDist[axis] + m - m * (zoomLevel / _startZoomLevel);
    },
        _equalizePoints = function _equalizePoints(p1, p2) {
      p1.x = p2.x;
      p1.y = p2.y;

      if (p2.id) {
        p1.id = p2.id;
      }
    },
        _roundPoint = function _roundPoint(p) {
      p.x = Math.round(p.x);
      p.y = Math.round(p.y);
    },
        _mouseMoveTimeout = null,
        _onFirstMouseMove = function _onFirstMouseMove() {
      // Wait until mouse move event is fired at least twice during 100ms
      // We do this, because some mobile browsers trigger it on touchstart
      if (_mouseMoveTimeout) {
        framework.unbind(document, 'mousemove', _onFirstMouseMove);
        framework.addClass(template, 'pswp--has_mouse');
        _options.mouseUsed = true;

        _shout('mouseUsed');
      }

      _mouseMoveTimeout = setTimeout(function () {
        _mouseMoveTimeout = null;
      }, 100);
    },
        _bindEvents = function _bindEvents() {
      framework.bind(document, 'keydown', self);

      if (_features.transform) {
        // don't bind click event in browsers that don't support transform (mostly IE8)
        framework.bind(self.scrollWrap, 'click', self);
      }

      if (!_options.mouseUsed) {
        framework.bind(document, 'mousemove', _onFirstMouseMove);
      }

      framework.bind(window, 'resize scroll', self);

      _shout('bindEvents');
    },
        _unbindEvents = function _unbindEvents() {
      framework.unbind(window, 'resize', self);
      framework.unbind(window, 'scroll', _globalEventHandlers.scroll);
      framework.unbind(document, 'keydown', self);
      framework.unbind(document, 'mousemove', _onFirstMouseMove);

      if (_features.transform) {
        framework.unbind(self.scrollWrap, 'click', self);
      }

      if (_isDragging) {
        framework.unbind(window, _upMoveEvents, self);
      }

      _shout('unbindEvents');
    },
        _calculatePanBounds = function _calculatePanBounds(zoomLevel, update) {
      var bounds = _calculateItemSize(self.currItem, _viewportSize, zoomLevel);

      if (update) {
        _currPanBounds = bounds;
      }

      return bounds;
    },
        _getMinZoomLevel = function _getMinZoomLevel(item) {
      if (!item) {
        item = self.currItem;
      }

      return item.initialZoomLevel;
    },
        _getMaxZoomLevel = function _getMaxZoomLevel(item) {
      if (!item) {
        item = self.currItem;
      }

      return item.w > 0 ? _options.maxSpreadZoom : 1;
    },
        // Return true if offset is out of the bounds
    _modifyDestPanOffset = function _modifyDestPanOffset(axis, destPanBounds, destPanOffset, destZoomLevel) {
      if (destZoomLevel === self.currItem.initialZoomLevel) {
        destPanOffset[axis] = self.currItem.initialPosition[axis];
        return true;
      } else {
        destPanOffset[axis] = _calculatePanOffset(axis, destZoomLevel);

        if (destPanOffset[axis] > destPanBounds.min[axis]) {
          destPanOffset[axis] = destPanBounds.min[axis];
          return true;
        } else if (destPanOffset[axis] < destPanBounds.max[axis]) {
          destPanOffset[axis] = destPanBounds.max[axis];
          return true;
        }
      }

      return false;
    },
        _setupTransforms = function _setupTransforms() {
      if (_transformKey) {
        // setup 3d transforms
        var allow3dTransform = _features.perspective && !_likelyTouchDevice;
        _translatePrefix = 'translate' + (allow3dTransform ? '3d(' : '(');
        _translateSufix = _features.perspective ? ', 0px)' : ')';
        return;
      } // Override zoom/pan/move functions in case old browser is used (most likely IE)
      // (so they use left/top/width/height, instead of CSS transform)


      _transformKey = 'left';
      framework.addClass(template, 'pswp--ie');

      _setTranslateX = function _setTranslateX(x, elStyle) {
        elStyle.left = x + 'px';
      };

      _applyZoomPanToItem = function _applyZoomPanToItem(item) {
        var zoomRatio = item.fitRatio > 1 ? 1 : item.fitRatio,
            s = item.container.style,
            w = zoomRatio * item.w,
            h = zoomRatio * item.h;
        s.width = w + 'px';
        s.height = h + 'px';
        s.left = item.initialPosition.x + 'px';
        s.top = item.initialPosition.y + 'px';
      };

      _applyCurrentZoomPan = function _applyCurrentZoomPan() {
        if (_currZoomElementStyle) {
          var s = _currZoomElementStyle,
              item = self.currItem,
              zoomRatio = item.fitRatio > 1 ? 1 : item.fitRatio,
              w = zoomRatio * item.w,
              h = zoomRatio * item.h;
          s.width = w + 'px';
          s.height = h + 'px';
          s.left = _panOffset.x + 'px';
          s.top = _panOffset.y + 'px';
        }
      };
    },
        _onKeyDown = function _onKeyDown(e) {
      var keydownAction = '';

      if (_options.escKey && e.keyCode === 27) {
        keydownAction = 'close';
      } else if (_options.arrowKeys) {
        if (e.keyCode === 37) {
          keydownAction = 'prev';
        } else if (e.keyCode === 39) {
          keydownAction = 'next';
        }
      }

      if (keydownAction) {
        // don't do anything if special key pressed to prevent from overriding default browser actions
        // e.g. in Chrome on Mac cmd+arrow-left returns to previous page
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
          if (e.preventDefault) {
            e.preventDefault();
          } else {
            e.returnValue = false;
          }

          self[keydownAction]();
        }
      }
    },
        _onGlobalClick = function _onGlobalClick(e) {
      if (!e) {
        return;
      } // don't allow click event to pass through when triggering after drag or some other gesture


      if (_moved || _zoomStarted || _mainScrollAnimating || _verticalDragInitiated) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
        _updatePageScrollOffset = function _updatePageScrollOffset() {
      self.setScrollOffset(0, framework.getScrollY());
    }; // Micro animation engine


    var _animations = {},
        _numAnimations = 0,
        _stopAnimation = function _stopAnimation(name) {
      if (_animations[name]) {
        if (_animations[name].raf) {
          _cancelAF(_animations[name].raf);
        }

        _numAnimations--;
        delete _animations[name];
      }
    },
        _registerStartAnimation = function _registerStartAnimation(name) {
      if (_animations[name]) {
        _stopAnimation(name);
      }

      if (!_animations[name]) {
        _numAnimations++;
        _animations[name] = {};
      }
    },
        _stopAllAnimations = function _stopAllAnimations() {
      for (var prop in _animations) {
        if (_animations.hasOwnProperty(prop)) {
          _stopAnimation(prop);
        }
      }
    },
        _animateProp = function _animateProp(name, b, endProp, d, easingFn, onUpdate, onComplete) {
      var startAnimTime = _getCurrentTime(),
          t;

      _registerStartAnimation(name);

      var animloop = function animloop() {
        if (_animations[name]) {
          t = _getCurrentTime() - startAnimTime; // time diff
          //b - beginning (start prop)
          //d - anim duration

          if (t >= d) {
            _stopAnimation(name);

            onUpdate(endProp);

            if (onComplete) {
              onComplete();
            }

            return;
          }

          onUpdate((endProp - b) * easingFn(t / d) + b);
          _animations[name].raf = _requestAF(animloop);
        }
      };

      animloop();
    };

    var publicMethods = {
      // make a few local variables and functions public
      shout: _shout,
      listen: _listen,
      viewportSize: _viewportSize,
      options: _options,
      isMainScrollAnimating: function isMainScrollAnimating() {
        return _mainScrollAnimating;
      },
      getZoomLevel: function getZoomLevel() {
        return _currZoomLevel;
      },
      getCurrentIndex: function getCurrentIndex() {
        return _currentItemIndex;
      },
      isDragging: function isDragging() {
        return _isDragging;
      },
      isZooming: function isZooming() {
        return _isZooming;
      },
      setScrollOffset: function setScrollOffset(x, y) {
        _offset.x = x;
        _currentWindowScrollY = _offset.y = y;

        _shout('updateScrollOffset', _offset);
      },
      applyZoomPan: function applyZoomPan(zoomLevel, panX, panY, allowRenderResolution) {
        _panOffset.x = panX;
        _panOffset.y = panY;
        _currZoomLevel = zoomLevel;

        _applyCurrentZoomPan(allowRenderResolution);
      },
      init: function init() {
        if (_isOpen || _isDestroying) {
          return;
        }

        var i;
        self.framework = framework; // basic functionality

        self.template = template; // root DOM element of PhotoSwipe

        self.bg = framework.getChildByClass(template, 'pswp__bg');
        _initalClassName = template.className;
        _isOpen = true;
        _features = framework.detectFeatures();
        _requestAF = _features.raf;
        _cancelAF = _features.caf;
        _transformKey = _features.transform;
        _oldIE = _features.oldIE;
        self.scrollWrap = framework.getChildByClass(template, 'pswp__scroll-wrap');
        self.container = framework.getChildByClass(self.scrollWrap, 'pswp__container');
        _containerStyle = self.container.style; // for fast access
        // Objects that hold slides (there are only 3 in DOM)

        self.itemHolders = _itemHolders = [{
          el: self.container.children[0],
          wrap: 0,
          index: -1
        }, {
          el: self.container.children[1],
          wrap: 0,
          index: -1
        }, {
          el: self.container.children[2],
          wrap: 0,
          index: -1
        }]; // hide nearby item holders until initial zoom animation finishes (to avoid extra Paints)

        _itemHolders[0].el.style.display = _itemHolders[2].el.style.display = 'none';

        _setupTransforms(); // Setup global events


        _globalEventHandlers = {
          resize: self.updateSize,
          scroll: _updatePageScrollOffset,
          keydown: _onKeyDown,
          click: _onGlobalClick
        }; // disable show/hide effects on old browsers that don't support CSS animations or transforms, 
        // old IOS, Android and Opera mobile. Blackberry seems to work fine, even older models.

        var oldPhone = _features.isOldIOSPhone || _features.isOldAndroid || _features.isMobileOpera;

        if (!_features.animationName || !_features.transform || oldPhone) {
          _options.showAnimationDuration = _options.hideAnimationDuration = 0;
        } // init modules


        for (i = 0; i < _modules.length; i++) {
          self['init' + _modules[i]]();
        } // init


        if (UiClass) {
          var ui = self.ui = new UiClass(self, framework);
          ui.init();
        }

        _shout('firstUpdate');

        _currentItemIndex = _currentItemIndex || _options.index || 0; // validate index

        if (isNaN(_currentItemIndex) || _currentItemIndex < 0 || _currentItemIndex >= _getNumItems()) {
          _currentItemIndex = 0;
        }

        self.currItem = _getItemAt(_currentItemIndex);

        if (_features.isOldIOSPhone || _features.isOldAndroid) {
          _isFixedPosition = false;
        }

        template.setAttribute('aria-hidden', 'false');

        if (_options.modal) {
          if (!_isFixedPosition) {
            template.style.position = 'absolute';
            template.style.top = framework.getScrollY() + 'px';
          } else {
            template.style.position = 'fixed';
          }
        }

        if (_currentWindowScrollY === undefined) {
          _shout('initialLayout');

          _currentWindowScrollY = _initalWindowScrollY = framework.getScrollY();
        } // add classes to root element of PhotoSwipe


        var rootClasses = 'pswp--open ';

        if (_options.mainClass) {
          rootClasses += _options.mainClass + ' ';
        }

        if (_options.showHideOpacity) {
          rootClasses += 'pswp--animate_opacity ';
        }

        rootClasses += _likelyTouchDevice ? 'pswp--touch' : 'pswp--notouch';
        rootClasses += _features.animationName ? ' pswp--css_animation' : '';
        rootClasses += _features.svg ? ' pswp--svg' : '';
        framework.addClass(template, rootClasses);
        self.updateSize(); // initial update

        _containerShiftIndex = -1;
        _indexDiff = null;

        for (i = 0; i < NUM_HOLDERS; i++) {
          _setTranslateX((i + _containerShiftIndex) * _slideSize.x, _itemHolders[i].el.style);
        }

        if (!_oldIE) {
          framework.bind(self.scrollWrap, _downEvents, self); // no dragging for old IE
        }

        _listen('initialZoomInEnd', function () {
          self.setContent(_itemHolders[0], _currentItemIndex - 1);
          self.setContent(_itemHolders[2], _currentItemIndex + 1);
          _itemHolders[0].el.style.display = _itemHolders[2].el.style.display = 'block';

          if (_options.focus) {
            // focus causes layout, 
            // which causes lag during the animation, 
            // that's why we delay it untill the initial zoom transition ends
            template.focus();
          }

          _bindEvents();
        }); // set content for center slide (first time)


        self.setContent(_itemHolders[1], _currentItemIndex);
        self.updateCurrItem();

        _shout('afterInit');

        if (!_isFixedPosition) {
          // On all versions of iOS lower than 8.0, we check size of viewport every second.
          // 
          // This is done to detect when Safari top & bottom bars appear, 
          // as this action doesn't trigger any events (like resize). 
          // 
          // On iOS8 they fixed this.
          // 
          // 10 Nov 2014: iOS 7 usage ~40%. iOS 8 usage 56%.
          _updateSizeInterval = setInterval(function () {
            if (!_numAnimations && !_isDragging && !_isZooming && _currZoomLevel === self.currItem.initialZoomLevel) {
              self.updateSize();
            }
          }, 1000);
        }

        framework.addClass(template, 'pswp--visible');
      },
      // Close the gallery, then destroy it
      close: function close() {
        if (!_isOpen) {
          return;
        }

        _isOpen = false;
        _isDestroying = true;

        _shout('close');

        _unbindEvents();

        _showOrHide(self.currItem, null, true, self.destroy);
      },
      // destroys the gallery (unbinds events, cleans up intervals and timeouts to avoid memory leaks)
      destroy: function destroy() {
        _shout('destroy');

        if (_showOrHideTimeout) {
          clearTimeout(_showOrHideTimeout);
        }

        template.setAttribute('aria-hidden', 'true');
        template.className = _initalClassName;

        if (_updateSizeInterval) {
          clearInterval(_updateSizeInterval);
        }

        framework.unbind(self.scrollWrap, _downEvents, self); // we unbind scroll event at the end, as closing animation may depend on it

        framework.unbind(window, 'scroll', self);

        _stopDragUpdateLoop();

        _stopAllAnimations();

        _listeners = null;
      },

      /**
       * Pan image to position
       * @param {Number} x     
       * @param {Number} y     
       * @param {Boolean} force Will ignore bounds if set to true.
       */
      panTo: function panTo(x, y, force) {
        if (!force) {
          if (x > _currPanBounds.min.x) {
            x = _currPanBounds.min.x;
          } else if (x < _currPanBounds.max.x) {
            x = _currPanBounds.max.x;
          }

          if (y > _currPanBounds.min.y) {
            y = _currPanBounds.min.y;
          } else if (y < _currPanBounds.max.y) {
            y = _currPanBounds.max.y;
          }
        }

        _panOffset.x = x;
        _panOffset.y = y;

        _applyCurrentZoomPan();
      },
      handleEvent: function handleEvent(e) {
        e = e || window.event;

        if (_globalEventHandlers[e.type]) {
          _globalEventHandlers[e.type](e);
        }
      },
      goTo: function goTo(index) {
        index = _getLoopedId(index);
        var diff = index - _currentItemIndex;
        _indexDiff = diff;
        _currentItemIndex = index;
        self.currItem = _getItemAt(_currentItemIndex);
        _currPositionIndex -= diff;

        _moveMainScroll(_slideSize.x * _currPositionIndex);

        _stopAllAnimations();

        _mainScrollAnimating = false;
        self.updateCurrItem();
      },
      next: function next() {
        self.goTo(_currentItemIndex + 1);
      },
      prev: function prev() {
        self.goTo(_currentItemIndex - 1);
      },
      // update current zoom/pan objects
      updateCurrZoomItem: function updateCurrZoomItem(emulateSetContent) {
        if (emulateSetContent) {
          _shout('beforeChange', 0);
        } // itemHolder[1] is middle (current) item


        if (_itemHolders[1].el.children.length) {
          var zoomElement = _itemHolders[1].el.children[0];

          if (framework.hasClass(zoomElement, 'pswp__zoom-wrap')) {
            _currZoomElementStyle = zoomElement.style;
          } else {
            _currZoomElementStyle = null;
          }
        } else {
          _currZoomElementStyle = null;
        }

        _currPanBounds = self.currItem.bounds;
        _startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel;
        _panOffset.x = _currPanBounds.center.x;
        _panOffset.y = _currPanBounds.center.y;

        if (emulateSetContent) {
          _shout('afterChange');
        }
      },
      invalidateCurrItems: function invalidateCurrItems() {
        _itemsNeedUpdate = true;

        for (var i = 0; i < NUM_HOLDERS; i++) {
          if (_itemHolders[i].item) {
            _itemHolders[i].item.needsUpdate = true;
          }
        }
      },
      updateCurrItem: function updateCurrItem(beforeAnimation) {
        if (_indexDiff === 0) {
          return;
        }

        var diffAbs = Math.abs(_indexDiff),
            tempHolder;

        if (beforeAnimation && diffAbs < 2) {
          return;
        }

        self.currItem = _getItemAt(_currentItemIndex);
        _renderMaxResolution = false;

        _shout('beforeChange', _indexDiff);

        if (diffAbs >= NUM_HOLDERS) {
          _containerShiftIndex += _indexDiff + (_indexDiff > 0 ? -NUM_HOLDERS : NUM_HOLDERS);
          diffAbs = NUM_HOLDERS;
        }

        for (var i = 0; i < diffAbs; i++) {
          if (_indexDiff > 0) {
            tempHolder = _itemHolders.shift();
            _itemHolders[NUM_HOLDERS - 1] = tempHolder; // move first to last

            _containerShiftIndex++;

            _setTranslateX((_containerShiftIndex + 2) * _slideSize.x, tempHolder.el.style);

            self.setContent(tempHolder, _currentItemIndex - diffAbs + i + 1 + 1);
          } else {
            tempHolder = _itemHolders.pop();

            _itemHolders.unshift(tempHolder); // move last to first


            _containerShiftIndex--;

            _setTranslateX(_containerShiftIndex * _slideSize.x, tempHolder.el.style);

            self.setContent(tempHolder, _currentItemIndex + diffAbs - i - 1 - 1);
          }
        } // reset zoom/pan on previous item


        if (_currZoomElementStyle && Math.abs(_indexDiff) === 1) {
          var prevItem = _getItemAt(_prevItemIndex);

          if (prevItem.initialZoomLevel !== _currZoomLevel) {
            _calculateItemSize(prevItem, _viewportSize);

            _setImageSize(prevItem);

            _applyZoomPanToItem(prevItem);
          }
        } // reset diff after update


        _indexDiff = 0;
        self.updateCurrZoomItem();
        _prevItemIndex = _currentItemIndex;

        _shout('afterChange');
      },
      updateSize: function updateSize(force) {
        if (!_isFixedPosition && _options.modal) {
          var windowScrollY = framework.getScrollY();

          if (_currentWindowScrollY !== windowScrollY) {
            template.style.top = windowScrollY + 'px';
            _currentWindowScrollY = windowScrollY;
          }

          if (!force && _windowVisibleSize.x === window.innerWidth && _windowVisibleSize.y === window.innerHeight) {
            return;
          }

          _windowVisibleSize.x = window.innerWidth;
          _windowVisibleSize.y = window.innerHeight; //template.style.width = _windowVisibleSize.x + 'px';

          template.style.height = _windowVisibleSize.y + 'px';
        }

        _viewportSize.x = self.scrollWrap.clientWidth;
        _viewportSize.y = self.scrollWrap.clientHeight;

        _updatePageScrollOffset();

        _slideSize.x = _viewportSize.x + Math.round(_viewportSize.x * _options.spacing);
        _slideSize.y = _viewportSize.y;

        _moveMainScroll(_slideSize.x * _currPositionIndex);

        _shout('beforeResize'); // even may be used for example to switch image sources
        // don't re-calculate size on inital size update


        if (_containerShiftIndex !== undefined) {
          var holder, item, hIndex;

          for (var i = 0; i < NUM_HOLDERS; i++) {
            holder = _itemHolders[i];

            _setTranslateX((i + _containerShiftIndex) * _slideSize.x, holder.el.style);

            hIndex = _currentItemIndex + i - 1;

            if (_options.loop && _getNumItems() > 2) {
              hIndex = _getLoopedId(hIndex);
            } // update zoom level on items and refresh source (if needsUpdate)


            item = _getItemAt(hIndex); // re-render gallery item if `needsUpdate`,
            // or doesn't have `bounds` (entirely new slide object)

            if (item && (_itemsNeedUpdate || item.needsUpdate || !item.bounds)) {
              self.cleanSlide(item);
              self.setContent(holder, hIndex); // if "center" slide

              if (i === 1) {
                self.currItem = item;
                self.updateCurrZoomItem(true);
              }

              item.needsUpdate = false;
            } else if (holder.index === -1 && hIndex >= 0) {
              // add content first time
              self.setContent(holder, hIndex);
            }

            if (item && item.container) {
              _calculateItemSize(item, _viewportSize);

              _setImageSize(item);

              _applyZoomPanToItem(item);
            }
          }

          _itemsNeedUpdate = false;
        }

        _startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel;
        _currPanBounds = self.currItem.bounds;

        if (_currPanBounds) {
          _panOffset.x = _currPanBounds.center.x;
          _panOffset.y = _currPanBounds.center.y;

          _applyCurrentZoomPan(true);
        }

        _shout('resize');
      },
      // Zoom current item to
      zoomTo: function zoomTo(destZoomLevel, centerPoint, speed, easingFn, updateFn) {
        /*
        	if(destZoomLevel === 'fit') {
        		destZoomLevel = self.currItem.fitRatio;
        	} else if(destZoomLevel === 'fill') {
        		destZoomLevel = self.currItem.fillRatio;
        	}
        */
        if (centerPoint) {
          _startZoomLevel = _currZoomLevel;
          _midZoomPoint.x = Math.abs(centerPoint.x) - _panOffset.x;
          _midZoomPoint.y = Math.abs(centerPoint.y) - _panOffset.y;

          _equalizePoints(_startPanOffset, _panOffset);
        }

        var destPanBounds = _calculatePanBounds(destZoomLevel, false),
            destPanOffset = {};

        _modifyDestPanOffset('x', destPanBounds, destPanOffset, destZoomLevel);

        _modifyDestPanOffset('y', destPanBounds, destPanOffset, destZoomLevel);

        var initialZoomLevel = _currZoomLevel;
        var initialPanOffset = {
          x: _panOffset.x,
          y: _panOffset.y
        };

        _roundPoint(destPanOffset);

        var onUpdate = function onUpdate(now) {
          if (now === 1) {
            _currZoomLevel = destZoomLevel;
            _panOffset.x = destPanOffset.x;
            _panOffset.y = destPanOffset.y;
          } else {
            _currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel;
            _panOffset.x = (destPanOffset.x - initialPanOffset.x) * now + initialPanOffset.x;
            _panOffset.y = (destPanOffset.y - initialPanOffset.y) * now + initialPanOffset.y;
          }

          if (updateFn) {
            updateFn(now);
          }

          _applyCurrentZoomPan(now === 1);
        };

        if (speed) {
          _animateProp('customZoomTo', 0, 1, speed, easingFn || framework.easing.sine.inOut, onUpdate);
        } else {
          onUpdate(1);
        }
      }
    };
    /*>>core*/

    /*>>gestures*/

    /**
     * Mouse/touch/pointer event handlers.
     * 
     * separated from @core.js for readability
     */

    var MIN_SWIPE_DISTANCE = 30,
        DIRECTION_CHECK_OFFSET = 10; // amount of pixels to drag to determine direction of swipe

    var _gestureStartTime,
        _gestureCheckSpeedTime,
        // pool of objects that are used during dragging of zooming
    p = {},
        // first point
    p2 = {},
        // second point (for zoom gesture)
    delta = {},
        _currPoint = {},
        _startPoint = {},
        _currPointers = [],
        _startMainScrollPos = {},
        _releaseAnimData,
        _posPoints = [],
        // array of points during dragging, used to determine type of gesture
    _tempPoint = {},
        _isZoomingIn,
        _verticalDragInitiated,
        _oldAndroidTouchEndTimeout,
        _currZoomedItemIndex = 0,
        _centerPoint = _getEmptyPoint(),
        _lastReleaseTime = 0,
        _isDragging,
        // at least one pointer is down
    _isMultitouch,
        // at least two _pointers are down
    _zoomStarted,
        // zoom level changed during zoom gesture
    _moved,
        _dragAnimFrame,
        _mainScrollShifted,
        _currentPoints,
        // array of current touch points
    _isZooming,
        _currPointsDistance,
        _startPointsDistance,
        _currPanBounds,
        _mainScrollPos = _getEmptyPoint(),
        _currZoomElementStyle,
        _mainScrollAnimating,
        // true, if animation after swipe gesture is running
    _midZoomPoint = _getEmptyPoint(),
        _currCenterPoint = _getEmptyPoint(),
        _direction,
        _isFirstMove,
        _opacityChanged,
        _bgOpacity,
        _wasOverInitialZoom,
        _isEqualPoints = function _isEqualPoints(p1, p2) {
      return p1.x === p2.x && p1.y === p2.y;
    },
        _isNearbyPoints = function _isNearbyPoints(touch0, touch1) {
      return Math.abs(touch0.x - touch1.x) < DOUBLE_TAP_RADIUS && Math.abs(touch0.y - touch1.y) < DOUBLE_TAP_RADIUS;
    },
        _calculatePointsDistance = function _calculatePointsDistance(p1, p2) {
      _tempPoint.x = Math.abs(p1.x - p2.x);
      _tempPoint.y = Math.abs(p1.y - p2.y);
      return Math.sqrt(_tempPoint.x * _tempPoint.x + _tempPoint.y * _tempPoint.y);
    },
        _stopDragUpdateLoop = function _stopDragUpdateLoop() {
      if (_dragAnimFrame) {
        _cancelAF(_dragAnimFrame);

        _dragAnimFrame = null;
      }
    },
        _dragUpdateLoop = function _dragUpdateLoop() {
      if (_isDragging) {
        _dragAnimFrame = _requestAF(_dragUpdateLoop);

        _renderMovement();
      }
    },
        _canPan = function _canPan() {
      return !(_options.scaleMode === 'fit' && _currZoomLevel === self.currItem.initialZoomLevel);
    },
        // find the closest parent DOM element
    _closestElement = function _closestElement(el, fn) {
      if (!el || el === document) {
        return false;
      } // don't search elements above pswp__scroll-wrap


      if (el.getAttribute('class') && el.getAttribute('class').indexOf('pswp__scroll-wrap') > -1) {
        return false;
      }

      if (fn(el)) {
        return el;
      }

      return _closestElement(el.parentNode, fn);
    },
        _preventObj = {},
        _preventDefaultEventBehaviour = function _preventDefaultEventBehaviour(e, isDown) {
      _preventObj.prevent = !_closestElement(e.target, _options.isClickableElement);

      _shout('preventDragEvent', e, isDown, _preventObj);

      return _preventObj.prevent;
    },
        _convertTouchToPoint = function _convertTouchToPoint(touch, p) {
      p.x = touch.pageX;
      p.y = touch.pageY;
      p.id = touch.identifier;
      return p;
    },
        _findCenterOfPoints = function _findCenterOfPoints(p1, p2, pCenter) {
      pCenter.x = (p1.x + p2.x) * 0.5;
      pCenter.y = (p1.y + p2.y) * 0.5;
    },
        _pushPosPoint = function _pushPosPoint(time, x, y) {
      if (time - _gestureCheckSpeedTime > 50) {
        var o = _posPoints.length > 2 ? _posPoints.shift() : {};
        o.x = x;
        o.y = y;

        _posPoints.push(o);

        _gestureCheckSpeedTime = time;
      }
    },
        _calculateVerticalDragOpacityRatio = function _calculateVerticalDragOpacityRatio() {
      var yOffset = _panOffset.y - self.currItem.initialPosition.y; // difference between initial and current position

      return 1 - Math.abs(yOffset / (_viewportSize.y / 2));
    },
        // points pool, reused during touch events
    _ePoint1 = {},
        _ePoint2 = {},
        _tempPointsArr = [],
        _tempCounter,
        _getTouchPoints = function _getTouchPoints(e) {
      // clean up previous points, without recreating array
      while (_tempPointsArr.length > 0) {
        _tempPointsArr.pop();
      }

      if (!_pointerEventEnabled) {
        if (e.type.indexOf('touch') > -1) {
          if (e.touches && e.touches.length > 0) {
            _tempPointsArr[0] = _convertTouchToPoint(e.touches[0], _ePoint1);

            if (e.touches.length > 1) {
              _tempPointsArr[1] = _convertTouchToPoint(e.touches[1], _ePoint2);
            }
          }
        } else {
          _ePoint1.x = e.pageX;
          _ePoint1.y = e.pageY;
          _ePoint1.id = '';
          _tempPointsArr[0] = _ePoint1; //_ePoint1;
        }
      } else {
        _tempCounter = 0; // we can use forEach, as pointer events are supported only in modern browsers

        _currPointers.forEach(function (p) {
          if (_tempCounter === 0) {
            _tempPointsArr[0] = p;
          } else if (_tempCounter === 1) {
            _tempPointsArr[1] = p;
          }

          _tempCounter++;
        });
      }

      return _tempPointsArr;
    },
        _panOrMoveMainScroll = function _panOrMoveMainScroll(axis, delta) {
      var panFriction,
          overDiff = 0,
          newOffset = _panOffset[axis] + delta[axis],
          startOverDiff,
          dir = delta[axis] > 0,
          newMainScrollPosition = _mainScrollPos.x + delta.x,
          mainScrollDiff = _mainScrollPos.x - _startMainScrollPos.x,
          newPanPos,
          newMainScrollPos; // calculate fdistance over the bounds and friction

      if (newOffset > _currPanBounds.min[axis] || newOffset < _currPanBounds.max[axis]) {
        panFriction = _options.panEndFriction; // Linear increasing of friction, so at 1/4 of viewport it's at max value. 
        // Looks not as nice as was expected. Left for history.
        // panFriction = (1 - (_panOffset[axis] + delta[axis] + panBounds.min[axis]) / (_viewportSize[axis] / 4) );
      } else {
        panFriction = 1;
      }

      newOffset = _panOffset[axis] + delta[axis] * panFriction; // move main scroll or start panning

      if (_options.allowPanToNext || _currZoomLevel === self.currItem.initialZoomLevel) {
        if (!_currZoomElementStyle) {
          newMainScrollPos = newMainScrollPosition;
        } else if (_direction === 'h' && axis === 'x' && !_zoomStarted) {
          if (dir) {
            if (newOffset > _currPanBounds.min[axis]) {
              panFriction = _options.panEndFriction;
              overDiff = _currPanBounds.min[axis] - newOffset;
              startOverDiff = _currPanBounds.min[axis] - _startPanOffset[axis];
            } // drag right


            if ((startOverDiff <= 0 || mainScrollDiff < 0) && _getNumItems() > 1) {
              newMainScrollPos = newMainScrollPosition;

              if (mainScrollDiff < 0 && newMainScrollPosition > _startMainScrollPos.x) {
                newMainScrollPos = _startMainScrollPos.x;
              }
            } else {
              if (_currPanBounds.min.x !== _currPanBounds.max.x) {
                newPanPos = newOffset;
              }
            }
          } else {
            if (newOffset < _currPanBounds.max[axis]) {
              panFriction = _options.panEndFriction;
              overDiff = newOffset - _currPanBounds.max[axis];
              startOverDiff = _startPanOffset[axis] - _currPanBounds.max[axis];
            }

            if ((startOverDiff <= 0 || mainScrollDiff > 0) && _getNumItems() > 1) {
              newMainScrollPos = newMainScrollPosition;

              if (mainScrollDiff > 0 && newMainScrollPosition < _startMainScrollPos.x) {
                newMainScrollPos = _startMainScrollPos.x;
              }
            } else {
              if (_currPanBounds.min.x !== _currPanBounds.max.x) {
                newPanPos = newOffset;
              }
            }
          } //

        }

        if (axis === 'x') {
          if (newMainScrollPos !== undefined) {
            _moveMainScroll(newMainScrollPos, true);

            if (newMainScrollPos === _startMainScrollPos.x) {
              _mainScrollShifted = false;
            } else {
              _mainScrollShifted = true;
            }
          }

          if (_currPanBounds.min.x !== _currPanBounds.max.x) {
            if (newPanPos !== undefined) {
              _panOffset.x = newPanPos;
            } else if (!_mainScrollShifted) {
              _panOffset.x += delta.x * panFriction;
            }
          }

          return newMainScrollPos !== undefined;
        }
      }

      if (!_mainScrollAnimating) {
        if (!_mainScrollShifted) {
          if (_currZoomLevel > self.currItem.fitRatio) {
            _panOffset[axis] += delta[axis] * panFriction;
          }
        }
      }
    },
        // Pointerdown/touchstart/mousedown handler
    _onDragStart = function _onDragStart(e) {
      // Allow dragging only via left mouse button.
      // As this handler is not added in IE8 - we ignore e.which
      // 
      // http://www.quirksmode.org/js/events_properties.html
      // https://developer.mozilla.org/en-US/docs/Web/API/event.button
      if (e.type === 'mousedown' && e.button > 0) {
        return;
      }

      if (_initialZoomRunning) {
        e.preventDefault();
        return;
      }

      if (_oldAndroidTouchEndTimeout && e.type === 'mousedown') {
        return;
      }

      if (_preventDefaultEventBehaviour(e, true)) {
        e.preventDefault();
      }

      _shout('pointerDown');

      if (_pointerEventEnabled) {
        var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, 'id');

        if (pointerIndex < 0) {
          pointerIndex = _currPointers.length;
        }

        _currPointers[pointerIndex] = {
          x: e.pageX,
          y: e.pageY,
          id: e.pointerId
        };
      }

      var startPointsList = _getTouchPoints(e),
          numPoints = startPointsList.length;

      _currentPoints = null;

      _stopAllAnimations(); // init drag


      if (!_isDragging || numPoints === 1) {
        _isDragging = _isFirstMove = true;
        framework.bind(window, _upMoveEvents, self);
        _isZoomingIn = _wasOverInitialZoom = _opacityChanged = _verticalDragInitiated = _mainScrollShifted = _moved = _isMultitouch = _zoomStarted = false;
        _direction = null;

        _shout('firstTouchStart', startPointsList);

        _equalizePoints(_startPanOffset, _panOffset);

        _currPanDist.x = _currPanDist.y = 0;

        _equalizePoints(_currPoint, startPointsList[0]);

        _equalizePoints(_startPoint, _currPoint); //_equalizePoints(_startMainScrollPos, _mainScrollPos);


        _startMainScrollPos.x = _slideSize.x * _currPositionIndex;
        _posPoints = [{
          x: _currPoint.x,
          y: _currPoint.y
        }];
        _gestureCheckSpeedTime = _gestureStartTime = _getCurrentTime(); //_mainScrollAnimationEnd(true);

        _calculatePanBounds(_currZoomLevel, true); // Start rendering


        _stopDragUpdateLoop();

        _dragUpdateLoop();
      } // init zoom


      if (!_isZooming && numPoints > 1 && !_mainScrollAnimating && !_mainScrollShifted) {
        _startZoomLevel = _currZoomLevel;
        _zoomStarted = false; // true if zoom changed at least once

        _isZooming = _isMultitouch = true;
        _currPanDist.y = _currPanDist.x = 0;

        _equalizePoints(_startPanOffset, _panOffset);

        _equalizePoints(p, startPointsList[0]);

        _equalizePoints(p2, startPointsList[1]);

        _findCenterOfPoints(p, p2, _currCenterPoint);

        _midZoomPoint.x = Math.abs(_currCenterPoint.x) - _panOffset.x;
        _midZoomPoint.y = Math.abs(_currCenterPoint.y) - _panOffset.y;
        _currPointsDistance = _startPointsDistance = _calculatePointsDistance(p, p2);
      }
    },
        // Pointermove/touchmove/mousemove handler
    _onDragMove = function _onDragMove(e) {
      e.preventDefault();

      if (_pointerEventEnabled) {
        var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, 'id');

        if (pointerIndex > -1) {
          var p = _currPointers[pointerIndex];
          p.x = e.pageX;
          p.y = e.pageY;
        }
      }

      if (_isDragging) {
        var touchesList = _getTouchPoints(e);

        if (!_direction && !_moved && !_isZooming) {
          if (_mainScrollPos.x !== _slideSize.x * _currPositionIndex) {
            // if main scroll position is shifted – direction is always horizontal
            _direction = 'h';
          } else {
            var diff = Math.abs(touchesList[0].x - _currPoint.x) - Math.abs(touchesList[0].y - _currPoint.y); // check the direction of movement

            if (Math.abs(diff) >= DIRECTION_CHECK_OFFSET) {
              _direction = diff > 0 ? 'h' : 'v';
              _currentPoints = touchesList;
            }
          }
        } else {
          _currentPoints = touchesList;
        }
      }
    },
        // 
    _renderMovement = function _renderMovement() {
      if (!_currentPoints) {
        return;
      }

      var numPoints = _currentPoints.length;

      if (numPoints === 0) {
        return;
      }

      _equalizePoints(p, _currentPoints[0]);

      delta.x = p.x - _currPoint.x;
      delta.y = p.y - _currPoint.y;

      if (_isZooming && numPoints > 1) {
        // Handle behaviour for more than 1 point
        _currPoint.x = p.x;
        _currPoint.y = p.y; // check if one of two points changed

        if (!delta.x && !delta.y && _isEqualPoints(_currentPoints[1], p2)) {
          return;
        }

        _equalizePoints(p2, _currentPoints[1]);

        if (!_zoomStarted) {
          _zoomStarted = true;

          _shout('zoomGestureStarted');
        } // Distance between two points


        var pointsDistance = _calculatePointsDistance(p, p2);

        var zoomLevel = _calculateZoomLevel(pointsDistance); // slightly over the of initial zoom level


        if (zoomLevel > self.currItem.initialZoomLevel + self.currItem.initialZoomLevel / 15) {
          _wasOverInitialZoom = true;
        } // Apply the friction if zoom level is out of the bounds


        var zoomFriction = 1,
            minZoomLevel = _getMinZoomLevel(),
            maxZoomLevel = _getMaxZoomLevel();

        if (zoomLevel < minZoomLevel) {
          if (_options.pinchToClose && !_wasOverInitialZoom && _startZoomLevel <= self.currItem.initialZoomLevel) {
            // fade out background if zooming out
            var minusDiff = minZoomLevel - zoomLevel;
            var percent = 1 - minusDiff / (minZoomLevel / 1.2);

            _applyBgOpacity(percent);

            _shout('onPinchClose', percent);

            _opacityChanged = true;
          } else {
            zoomFriction = (minZoomLevel - zoomLevel) / minZoomLevel;

            if (zoomFriction > 1) {
              zoomFriction = 1;
            }

            zoomLevel = minZoomLevel - zoomFriction * (minZoomLevel / 3);
          }
        } else if (zoomLevel > maxZoomLevel) {
          // 1.5 - extra zoom level above the max. E.g. if max is x6, real max 6 + 1.5 = 7.5
          zoomFriction = (zoomLevel - maxZoomLevel) / (minZoomLevel * 6);

          if (zoomFriction > 1) {
            zoomFriction = 1;
          }

          zoomLevel = maxZoomLevel + zoomFriction * minZoomLevel;
        }

        if (zoomFriction < 0) {
          zoomFriction = 0;
        } // distance between touch points after friction is applied


        _currPointsDistance = pointsDistance; // _centerPoint - The point in the middle of two pointers

        _findCenterOfPoints(p, p2, _centerPoint); // paning with two pointers pressed


        _currPanDist.x += _centerPoint.x - _currCenterPoint.x;
        _currPanDist.y += _centerPoint.y - _currCenterPoint.y;

        _equalizePoints(_currCenterPoint, _centerPoint);

        _panOffset.x = _calculatePanOffset('x', zoomLevel);
        _panOffset.y = _calculatePanOffset('y', zoomLevel);
        _isZoomingIn = zoomLevel > _currZoomLevel;
        _currZoomLevel = zoomLevel;

        _applyCurrentZoomPan();
      } else {
        // handle behaviour for one point (dragging or panning)
        if (!_direction) {
          return;
        }

        if (_isFirstMove) {
          _isFirstMove = false; // subtract drag distance that was used during the detection direction  

          if (Math.abs(delta.x) >= DIRECTION_CHECK_OFFSET) {
            delta.x -= _currentPoints[0].x - _startPoint.x;
          }

          if (Math.abs(delta.y) >= DIRECTION_CHECK_OFFSET) {
            delta.y -= _currentPoints[0].y - _startPoint.y;
          }
        }

        _currPoint.x = p.x;
        _currPoint.y = p.y; // do nothing if pointers position hasn't changed

        if (delta.x === 0 && delta.y === 0) {
          return;
        }

        if (_direction === 'v' && _options.closeOnVerticalDrag) {
          if (!_canPan()) {
            _currPanDist.y += delta.y;
            _panOffset.y += delta.y;

            var opacityRatio = _calculateVerticalDragOpacityRatio();

            _verticalDragInitiated = true;

            _shout('onVerticalDrag', opacityRatio);

            _applyBgOpacity(opacityRatio);

            _applyCurrentZoomPan();

            return;
          }
        }

        _pushPosPoint(_getCurrentTime(), p.x, p.y);

        _moved = true;
        _currPanBounds = self.currItem.bounds;

        var mainScrollChanged = _panOrMoveMainScroll('x', delta);

        if (!mainScrollChanged) {
          _panOrMoveMainScroll('y', delta);

          _roundPoint(_panOffset);

          _applyCurrentZoomPan();
        }
      }
    },
        // Pointerup/pointercancel/touchend/touchcancel/mouseup event handler
    _onDragRelease = function _onDragRelease(e) {
      if (_features.isOldAndroid) {
        if (_oldAndroidTouchEndTimeout && e.type === 'mouseup') {
          return;
        } // on Android (v4.1, 4.2, 4.3 & possibly older) 
        // ghost mousedown/up event isn't preventable via e.preventDefault,
        // which causes fake mousedown event
        // so we block mousedown/up for 600ms


        if (e.type.indexOf('touch') > -1) {
          clearTimeout(_oldAndroidTouchEndTimeout);
          _oldAndroidTouchEndTimeout = setTimeout(function () {
            _oldAndroidTouchEndTimeout = 0;
          }, 600);
        }
      }

      _shout('pointerUp');

      if (_preventDefaultEventBehaviour(e, false)) {
        e.preventDefault();
      }

      var releasePoint;

      if (_pointerEventEnabled) {
        var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, 'id');

        if (pointerIndex > -1) {
          releasePoint = _currPointers.splice(pointerIndex, 1)[0];

          if (navigator.pointerEnabled) {
            releasePoint.type = e.pointerType || 'mouse';
          } else {
            var MSPOINTER_TYPES = {
              4: 'mouse',
              // event.MSPOINTER_TYPE_MOUSE
              2: 'touch',
              // event.MSPOINTER_TYPE_TOUCH 
              3: 'pen' // event.MSPOINTER_TYPE_PEN

            };
            releasePoint.type = MSPOINTER_TYPES[e.pointerType];

            if (!releasePoint.type) {
              releasePoint.type = e.pointerType || 'mouse';
            }
          }
        }
      }

      var touchList = _getTouchPoints(e),
          gestureType,
          numPoints = touchList.length;

      if (e.type === 'mouseup') {
        numPoints = 0;
      } // Do nothing if there were 3 touch points or more


      if (numPoints === 2) {
        _currentPoints = null;
        return true;
      } // if second pointer released


      if (numPoints === 1) {
        _equalizePoints(_startPoint, touchList[0]);
      } // pointer hasn't moved, send "tap release" point


      if (numPoints === 0 && !_direction && !_mainScrollAnimating) {
        if (!releasePoint) {
          if (e.type === 'mouseup') {
            releasePoint = {
              x: e.pageX,
              y: e.pageY,
              type: 'mouse'
            };
          } else if (e.changedTouches && e.changedTouches[0]) {
            releasePoint = {
              x: e.changedTouches[0].pageX,
              y: e.changedTouches[0].pageY,
              type: 'touch'
            };
          }
        }

        _shout('touchRelease', e, releasePoint);
      } // Difference in time between releasing of two last touch points (zoom gesture)


      var releaseTimeDiff = -1; // Gesture completed, no pointers left

      if (numPoints === 0) {
        _isDragging = false;
        framework.unbind(window, _upMoveEvents, self);

        _stopDragUpdateLoop();

        if (_isZooming) {
          // Two points released at the same time
          releaseTimeDiff = 0;
        } else if (_lastReleaseTime !== -1) {
          releaseTimeDiff = _getCurrentTime() - _lastReleaseTime;
        }
      }

      _lastReleaseTime = numPoints === 1 ? _getCurrentTime() : -1;

      if (releaseTimeDiff !== -1 && releaseTimeDiff < 150) {
        gestureType = 'zoom';
      } else {
        gestureType = 'swipe';
      }

      if (_isZooming && numPoints < 2) {
        _isZooming = false; // Only second point released

        if (numPoints === 1) {
          gestureType = 'zoomPointerUp';
        }

        _shout('zoomGestureEnded');
      }

      _currentPoints = null;

      if (!_moved && !_zoomStarted && !_mainScrollAnimating && !_verticalDragInitiated) {
        // nothing to animate
        return;
      }

      _stopAllAnimations();

      if (!_releaseAnimData) {
        _releaseAnimData = _initDragReleaseAnimationData();
      }

      _releaseAnimData.calculateSwipeSpeed('x');

      if (_verticalDragInitiated) {
        var opacityRatio = _calculateVerticalDragOpacityRatio();

        if (opacityRatio < _options.verticalDragRange) {
          self.close();
        } else {
          var initalPanY = _panOffset.y,
              initialBgOpacity = _bgOpacity;

          _animateProp('verticalDrag', 0, 1, 300, framework.easing.cubic.out, function (now) {
            _panOffset.y = (self.currItem.initialPosition.y - initalPanY) * now + initalPanY;

            _applyBgOpacity((1 - initialBgOpacity) * now + initialBgOpacity);

            _applyCurrentZoomPan();
          });

          _shout('onVerticalDrag', 1);
        }

        return;
      } // main scroll 


      if ((_mainScrollShifted || _mainScrollAnimating) && numPoints === 0) {
        var itemChanged = _finishSwipeMainScrollGesture(gestureType, _releaseAnimData);

        if (itemChanged) {
          return;
        }

        gestureType = 'zoomPointerUp';
      } // prevent zoom/pan animation when main scroll animation runs


      if (_mainScrollAnimating) {
        return;
      } // Complete simple zoom gesture (reset zoom level if it's out of the bounds)  


      if (gestureType !== 'swipe') {
        _completeZoomGesture();

        return;
      } // Complete pan gesture if main scroll is not shifted, and it's possible to pan current image


      if (!_mainScrollShifted && _currZoomLevel > self.currItem.fitRatio) {
        _completePanGesture(_releaseAnimData);
      }
    },
        // Returns object with data about gesture
    // It's created only once and then reused
    _initDragReleaseAnimationData = function _initDragReleaseAnimationData() {
      // temp local vars
      var lastFlickDuration, tempReleasePos; // s = this

      var s = {
        lastFlickOffset: {},
        lastFlickDist: {},
        lastFlickSpeed: {},
        slowDownRatio: {},
        slowDownRatioReverse: {},
        speedDecelerationRatio: {},
        speedDecelerationRatioAbs: {},
        distanceOffset: {},
        backAnimDestination: {},
        backAnimStarted: {},
        calculateSwipeSpeed: function calculateSwipeSpeed(axis) {
          if (_posPoints.length > 1) {
            lastFlickDuration = _getCurrentTime() - _gestureCheckSpeedTime + 50;
            tempReleasePos = _posPoints[_posPoints.length - 2][axis];
          } else {
            lastFlickDuration = _getCurrentTime() - _gestureStartTime; // total gesture duration

            tempReleasePos = _startPoint[axis];
          }

          s.lastFlickOffset[axis] = _currPoint[axis] - tempReleasePos;
          s.lastFlickDist[axis] = Math.abs(s.lastFlickOffset[axis]);

          if (s.lastFlickDist[axis] > 20) {
            s.lastFlickSpeed[axis] = s.lastFlickOffset[axis] / lastFlickDuration;
          } else {
            s.lastFlickSpeed[axis] = 0;
          }

          if (Math.abs(s.lastFlickSpeed[axis]) < 0.1) {
            s.lastFlickSpeed[axis] = 0;
          }

          s.slowDownRatio[axis] = 0.95;
          s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis];
          s.speedDecelerationRatio[axis] = 1;
        },
        calculateOverBoundsAnimOffset: function calculateOverBoundsAnimOffset(axis, speed) {
          if (!s.backAnimStarted[axis]) {
            if (_panOffset[axis] > _currPanBounds.min[axis]) {
              s.backAnimDestination[axis] = _currPanBounds.min[axis];
            } else if (_panOffset[axis] < _currPanBounds.max[axis]) {
              s.backAnimDestination[axis] = _currPanBounds.max[axis];
            }

            if (s.backAnimDestination[axis] !== undefined) {
              s.slowDownRatio[axis] = 0.7;
              s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis];

              if (s.speedDecelerationRatioAbs[axis] < 0.05) {
                s.lastFlickSpeed[axis] = 0;
                s.backAnimStarted[axis] = true;

                _animateProp('bounceZoomPan' + axis, _panOffset[axis], s.backAnimDestination[axis], speed || 300, framework.easing.sine.out, function (pos) {
                  _panOffset[axis] = pos;

                  _applyCurrentZoomPan();
                });
              }
            }
          }
        },
        // Reduces the speed by slowDownRatio (per 10ms)
        calculateAnimOffset: function calculateAnimOffset(axis) {
          if (!s.backAnimStarted[axis]) {
            s.speedDecelerationRatio[axis] = s.speedDecelerationRatio[axis] * (s.slowDownRatio[axis] + s.slowDownRatioReverse[axis] - s.slowDownRatioReverse[axis] * s.timeDiff / 10);
            s.speedDecelerationRatioAbs[axis] = Math.abs(s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis]);
            s.distanceOffset[axis] = s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis] * s.timeDiff;
            _panOffset[axis] += s.distanceOffset[axis];
          }
        },
        panAnimLoop: function panAnimLoop() {
          if (_animations.zoomPan) {
            _animations.zoomPan.raf = _requestAF(s.panAnimLoop);
            s.now = _getCurrentTime();
            s.timeDiff = s.now - s.lastNow;
            s.lastNow = s.now;
            s.calculateAnimOffset('x');
            s.calculateAnimOffset('y');

            _applyCurrentZoomPan();

            s.calculateOverBoundsAnimOffset('x');
            s.calculateOverBoundsAnimOffset('y');

            if (s.speedDecelerationRatioAbs.x < 0.05 && s.speedDecelerationRatioAbs.y < 0.05) {
              // round pan position
              _panOffset.x = Math.round(_panOffset.x);
              _panOffset.y = Math.round(_panOffset.y);

              _applyCurrentZoomPan();

              _stopAnimation('zoomPan');

              return;
            }
          }
        }
      };
      return s;
    },
        _completePanGesture = function _completePanGesture(animData) {
      // calculate swipe speed for Y axis (paanning)
      animData.calculateSwipeSpeed('y');
      _currPanBounds = self.currItem.bounds;
      animData.backAnimDestination = {};
      animData.backAnimStarted = {}; // Avoid acceleration animation if speed is too low

      if (Math.abs(animData.lastFlickSpeed.x) <= 0.05 && Math.abs(animData.lastFlickSpeed.y) <= 0.05) {
        animData.speedDecelerationRatioAbs.x = animData.speedDecelerationRatioAbs.y = 0; // Run pan drag release animation. E.g. if you drag image and release finger without momentum.

        animData.calculateOverBoundsAnimOffset('x');
        animData.calculateOverBoundsAnimOffset('y');
        return true;
      } // Animation loop that controls the acceleration after pan gesture ends


      _registerStartAnimation('zoomPan');

      animData.lastNow = _getCurrentTime();
      animData.panAnimLoop();
    },
        _finishSwipeMainScrollGesture = function _finishSwipeMainScrollGesture(gestureType, _releaseAnimData) {
      var itemChanged;

      if (!_mainScrollAnimating) {
        _currZoomedItemIndex = _currentItemIndex;
      }

      var itemsDiff;

      if (gestureType === 'swipe') {
        var totalShiftDist = _currPoint.x - _startPoint.x,
            isFastLastFlick = _releaseAnimData.lastFlickDist.x < 10; // if container is shifted for more than MIN_SWIPE_DISTANCE, 
        // and last flick gesture was in right direction

        if (totalShiftDist > MIN_SWIPE_DISTANCE && (isFastLastFlick || _releaseAnimData.lastFlickOffset.x > 20)) {
          // go to prev item
          itemsDiff = -1;
        } else if (totalShiftDist < -MIN_SWIPE_DISTANCE && (isFastLastFlick || _releaseAnimData.lastFlickOffset.x < -20)) {
          // go to next item
          itemsDiff = 1;
        }
      }

      var nextCircle;

      if (itemsDiff) {
        _currentItemIndex += itemsDiff;

        if (_currentItemIndex < 0) {
          _currentItemIndex = _options.loop ? _getNumItems() - 1 : 0;
          nextCircle = true;
        } else if (_currentItemIndex >= _getNumItems()) {
          _currentItemIndex = _options.loop ? 0 : _getNumItems() - 1;
          nextCircle = true;
        }

        if (!nextCircle || _options.loop) {
          _indexDiff += itemsDiff;
          _currPositionIndex -= itemsDiff;
          itemChanged = true;
        }
      }

      var animateToX = _slideSize.x * _currPositionIndex;
      var animateToDist = Math.abs(animateToX - _mainScrollPos.x);
      var finishAnimDuration;

      if (!itemChanged && animateToX > _mainScrollPos.x !== _releaseAnimData.lastFlickSpeed.x > 0) {
        // "return to current" duration, e.g. when dragging from slide 0 to -1
        finishAnimDuration = 333;
      } else {
        finishAnimDuration = Math.abs(_releaseAnimData.lastFlickSpeed.x) > 0 ? animateToDist / Math.abs(_releaseAnimData.lastFlickSpeed.x) : 333;
        finishAnimDuration = Math.min(finishAnimDuration, 400);
        finishAnimDuration = Math.max(finishAnimDuration, 250);
      }

      if (_currZoomedItemIndex === _currentItemIndex) {
        itemChanged = false;
      }

      _mainScrollAnimating = true;

      _shout('mainScrollAnimStart');

      _animateProp('mainScroll', _mainScrollPos.x, animateToX, finishAnimDuration, framework.easing.cubic.out, _moveMainScroll, function () {
        _stopAllAnimations();

        _mainScrollAnimating = false;
        _currZoomedItemIndex = -1;

        if (itemChanged || _currZoomedItemIndex !== _currentItemIndex) {
          self.updateCurrItem();
        }

        _shout('mainScrollAnimComplete');
      });

      if (itemChanged) {
        self.updateCurrItem(true);
      }

      return itemChanged;
    },
        _calculateZoomLevel = function _calculateZoomLevel(touchesDistance) {
      return 1 / _startPointsDistance * touchesDistance * _startZoomLevel;
    },
        // Resets zoom if it's out of bounds
    _completeZoomGesture = function _completeZoomGesture() {
      var destZoomLevel = _currZoomLevel,
          minZoomLevel = _getMinZoomLevel(),
          maxZoomLevel = _getMaxZoomLevel();

      if (_currZoomLevel < minZoomLevel) {
        destZoomLevel = minZoomLevel;
      } else if (_currZoomLevel > maxZoomLevel) {
        destZoomLevel = maxZoomLevel;
      }

      var destOpacity = 1,
          onUpdate,
          initialOpacity = _bgOpacity;

      if (_opacityChanged && !_isZoomingIn && !_wasOverInitialZoom && _currZoomLevel < minZoomLevel) {
        //_closedByScroll = true;
        self.close();
        return true;
      }

      if (_opacityChanged) {
        onUpdate = function onUpdate(now) {
          _applyBgOpacity((destOpacity - initialOpacity) * now + initialOpacity);
        };
      }

      self.zoomTo(destZoomLevel, 0, 200, framework.easing.cubic.out, onUpdate);
      return true;
    };

    _registerModule('Gestures', {
      publicMethods: {
        initGestures: function initGestures() {
          // helper function that builds touch/pointer/mouse events
          var addEventNames = function addEventNames(pref, down, move, up, cancel) {
            _dragStartEvent = pref + down;
            _dragMoveEvent = pref + move;
            _dragEndEvent = pref + up;

            if (cancel) {
              _dragCancelEvent = pref + cancel;
            } else {
              _dragCancelEvent = '';
            }
          };

          _pointerEventEnabled = _features.pointerEvent;

          if (_pointerEventEnabled && _features.touch) {
            // we don't need touch events, if browser supports pointer events
            _features.touch = false;
          }

          if (_pointerEventEnabled) {
            if (navigator.pointerEnabled) {
              addEventNames('pointer', 'down', 'move', 'up', 'cancel');
            } else {
              // IE10 pointer events are case-sensitive
              addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
            }
          } else if (_features.touch) {
            addEventNames('touch', 'start', 'move', 'end', 'cancel');
            _likelyTouchDevice = true;
          } else {
            addEventNames('mouse', 'down', 'move', 'up');
          }

          _upMoveEvents = _dragMoveEvent + ' ' + _dragEndEvent + ' ' + _dragCancelEvent;
          _downEvents = _dragStartEvent;

          if (_pointerEventEnabled && !_likelyTouchDevice) {
            _likelyTouchDevice = navigator.maxTouchPoints > 1 || navigator.msMaxTouchPoints > 1;
          } // make variable public


          self.likelyTouchDevice = _likelyTouchDevice;
          _globalEventHandlers[_dragStartEvent] = _onDragStart;
          _globalEventHandlers[_dragMoveEvent] = _onDragMove;
          _globalEventHandlers[_dragEndEvent] = _onDragRelease; // the Kraken

          if (_dragCancelEvent) {
            _globalEventHandlers[_dragCancelEvent] = _globalEventHandlers[_dragEndEvent];
          } // Bind mouse events on device with detected hardware touch support, in case it supports multiple types of input.


          if (_features.touch) {
            _downEvents += ' mousedown';
            _upMoveEvents += ' mousemove mouseup';
            _globalEventHandlers.mousedown = _globalEventHandlers[_dragStartEvent];
            _globalEventHandlers.mousemove = _globalEventHandlers[_dragMoveEvent];
            _globalEventHandlers.mouseup = _globalEventHandlers[_dragEndEvent];
          }

          if (!_likelyTouchDevice) {
            // don't allow pan to next slide from zoomed state on Desktop
            _options.allowPanToNext = false;
          }
        }
      }
    });
    /*>>gestures*/

    /*>>show-hide-transition*/

    /**
     * show-hide-transition.js:
     *
     * Manages initial opening or closing transition.
     *
     * If you're not planning to use transition for gallery at all,
     * you may set options hideAnimationDuration and showAnimationDuration to 0,
     * and just delete startAnimation function.
     * 
     */


    var _showOrHideTimeout,
        _showOrHide = function _showOrHide(item, img, out, completeFn) {
      if (_showOrHideTimeout) {
        clearTimeout(_showOrHideTimeout);
      }

      _initialZoomRunning = true;
      _initialContentSet = true; // dimensions of small thumbnail {x:,y:,w:}.
      // Height is optional, as calculated based on large image.

      var thumbBounds;

      if (item.initialLayout) {
        thumbBounds = item.initialLayout;
        item.initialLayout = null;
      } else {
        thumbBounds = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex);
      }

      var duration = out ? _options.hideAnimationDuration : _options.showAnimationDuration;

      var onComplete = function onComplete() {
        _stopAnimation('initialZoom');

        if (!out) {
          _applyBgOpacity(1);

          if (img) {
            img.style.display = 'block';
          }

          framework.addClass(template, 'pswp--animated-in');

          _shout('initialZoom' + (out ? 'OutEnd' : 'InEnd'));
        } else {
          self.template.removeAttribute('style');
          self.bg.removeAttribute('style');
        }

        if (completeFn) {
          completeFn();
        }

        _initialZoomRunning = false;
      }; // if bounds aren't provided, just open gallery without animation


      if (!duration || !thumbBounds || thumbBounds.x === undefined) {
        _shout('initialZoom' + (out ? 'Out' : 'In'));

        _currZoomLevel = item.initialZoomLevel;

        _equalizePoints(_panOffset, item.initialPosition);

        _applyCurrentZoomPan();

        template.style.opacity = out ? 0 : 1;

        _applyBgOpacity(1);

        if (duration) {
          setTimeout(function () {
            onComplete();
          }, duration);
        } else {
          onComplete();
        }

        return;
      }

      var startAnimation = function startAnimation() {
        var closeWithRaf = _closedByScroll,
            fadeEverything = !self.currItem.src || self.currItem.loadError || _options.showHideOpacity; // apply hw-acceleration to image

        if (item.miniImg) {
          item.miniImg.style.webkitBackfaceVisibility = 'hidden';
        }

        if (!out) {
          _currZoomLevel = thumbBounds.w / item.w;
          _panOffset.x = thumbBounds.x;
          _panOffset.y = thumbBounds.y - _initalWindowScrollY;
          self[fadeEverything ? 'template' : 'bg'].style.opacity = 0.001;

          _applyCurrentZoomPan();
        }

        _registerStartAnimation('initialZoom');

        if (out && !closeWithRaf) {
          framework.removeClass(template, 'pswp--animated-in');
        }

        if (fadeEverything) {
          if (out) {
            framework[(closeWithRaf ? 'remove' : 'add') + 'Class'](template, 'pswp--animate_opacity');
          } else {
            setTimeout(function () {
              framework.addClass(template, 'pswp--animate_opacity');
            }, 30);
          }
        }

        _showOrHideTimeout = setTimeout(function () {
          _shout('initialZoom' + (out ? 'Out' : 'In'));

          if (!out) {
            // "in" animation always uses CSS transitions (instead of rAF).
            // CSS transition work faster here, 
            // as developer may also want to animate other things, 
            // like ui on top of sliding area, which can be animated just via CSS
            _currZoomLevel = item.initialZoomLevel;

            _equalizePoints(_panOffset, item.initialPosition);

            _applyCurrentZoomPan();

            _applyBgOpacity(1);

            if (fadeEverything) {
              template.style.opacity = 1;
            } else {
              _applyBgOpacity(1);
            }

            _showOrHideTimeout = setTimeout(onComplete, duration + 20);
          } else {
            // "out" animation uses rAF only when PhotoSwipe is closed by browser scroll, to recalculate position
            var destZoomLevel = thumbBounds.w / item.w,
                initialPanOffset = {
              x: _panOffset.x,
              y: _panOffset.y
            },
                initialZoomLevel = _currZoomLevel,
                initalBgOpacity = _bgOpacity,
                onUpdate = function onUpdate(now) {
              if (now === 1) {
                _currZoomLevel = destZoomLevel;
                _panOffset.x = thumbBounds.x;
                _panOffset.y = thumbBounds.y - _currentWindowScrollY;
              } else {
                _currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel;
                _panOffset.x = (thumbBounds.x - initialPanOffset.x) * now + initialPanOffset.x;
                _panOffset.y = (thumbBounds.y - _currentWindowScrollY - initialPanOffset.y) * now + initialPanOffset.y;
              }

              _applyCurrentZoomPan();

              if (fadeEverything) {
                template.style.opacity = 1 - now;
              } else {
                _applyBgOpacity(initalBgOpacity - now * initalBgOpacity);
              }
            };

            if (closeWithRaf) {
              _animateProp('initialZoom', 0, 1, duration, framework.easing.cubic.out, onUpdate, onComplete);
            } else {
              onUpdate(1);
              _showOrHideTimeout = setTimeout(onComplete, duration + 20);
            }
          }
        }, out ? 25 : 90); // Main purpose of this delay is to give browser time to paint and
        // create composite layers of PhotoSwipe UI parts (background, controls, caption, arrows).
        // Which avoids lag at the beginning of scale transition.
      };

      startAnimation();
    };
    /*>>show-hide-transition*/

    /*>>items-controller*/

    /**
    *
    * Controller manages gallery items, their dimensions, and their content.
    * 
    */


    var _items,
        _tempPanAreaSize = {},
        _imagesToAppendPool = [],
        _initialContentSet,
        _initialZoomRunning,
        _controllerDefaultOptions = {
      index: 0,
      errorMsg: '<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',
      forceProgressiveLoading: false,
      // TODO
      preload: [1, 1],
      getNumItemsFn: function getNumItemsFn() {
        return _items.length;
      }
    };

    var _getItemAt,
        _getNumItems,
        _initialIsLoop,
        _getZeroBounds = function _getZeroBounds() {
      return {
        center: {
          x: 0,
          y: 0
        },
        max: {
          x: 0,
          y: 0
        },
        min: {
          x: 0,
          y: 0
        }
      };
    },
        _calculateSingleItemPanBounds = function _calculateSingleItemPanBounds(item, realPanElementW, realPanElementH) {
      var bounds = item.bounds; // position of element when it's centered

      bounds.center.x = Math.round((_tempPanAreaSize.x - realPanElementW) / 2);
      bounds.center.y = Math.round((_tempPanAreaSize.y - realPanElementH) / 2) + item.vGap.top; // maximum pan position

      bounds.max.x = realPanElementW > _tempPanAreaSize.x ? Math.round(_tempPanAreaSize.x - realPanElementW) : bounds.center.x;
      bounds.max.y = realPanElementH > _tempPanAreaSize.y ? Math.round(_tempPanAreaSize.y - realPanElementH) + item.vGap.top : bounds.center.y; // minimum pan position

      bounds.min.x = realPanElementW > _tempPanAreaSize.x ? 0 : bounds.center.x;
      bounds.min.y = realPanElementH > _tempPanAreaSize.y ? item.vGap.top : bounds.center.y;
    },
        _calculateItemSize = function _calculateItemSize(item, viewportSize, zoomLevel) {
      if (item.src && !item.loadError) {
        var isInitial = !zoomLevel;

        if (isInitial) {
          if (!item.vGap) {
            item.vGap = {
              top: 0,
              bottom: 0
            };
          } // allows overriding vertical margin for individual items


          _shout('parseVerticalMargin', item);
        }

        _tempPanAreaSize.x = viewportSize.x;
        _tempPanAreaSize.y = viewportSize.y - item.vGap.top - item.vGap.bottom;

        if (isInitial) {
          var hRatio = _tempPanAreaSize.x / item.w;
          var vRatio = _tempPanAreaSize.y / item.h;
          item.fitRatio = hRatio < vRatio ? hRatio : vRatio; //item.fillRatio = hRatio > vRatio ? hRatio : vRatio;

          var scaleMode = _options.scaleMode;

          if (scaleMode === 'orig') {
            zoomLevel = 1;
          } else if (scaleMode === 'fit') {
            zoomLevel = item.fitRatio;
          }

          if (zoomLevel > 1) {
            zoomLevel = 1;
          }

          item.initialZoomLevel = zoomLevel;

          if (!item.bounds) {
            // reuse bounds object
            item.bounds = _getZeroBounds();
          }
        }

        if (!zoomLevel) {
          return;
        }

        _calculateSingleItemPanBounds(item, item.w * zoomLevel, item.h * zoomLevel);

        if (isInitial && zoomLevel === item.initialZoomLevel) {
          item.initialPosition = item.bounds.center;
        }

        return item.bounds;
      } else {
        item.w = item.h = 0;
        item.initialZoomLevel = item.fitRatio = 1;
        item.bounds = _getZeroBounds();
        item.initialPosition = item.bounds.center; // if it's not image, we return zero bounds (content is not zoomable)

        return item.bounds;
      }
    },
        _appendImage = function _appendImage(index, item, baseDiv, img, preventAnimation, keepPlaceholder) {
      if (item.loadError) {
        return;
      }

      if (img) {
        item.imageAppended = true;

        _setImageSize(item, img, item === self.currItem && _renderMaxResolution);

        baseDiv.appendChild(img);

        if (keepPlaceholder) {
          setTimeout(function () {
            if (item && item.loaded && item.placeholder) {
              item.placeholder.style.display = 'none';
              item.placeholder = null;
            }
          }, 500);
        }
      }
    },
        _preloadImage = function _preloadImage(item) {
      item.loading = true;
      item.loaded = false;
      var img = item.img = framework.createEl('pswp__img', 'img');

      var onComplete = function onComplete() {
        item.loading = false;
        item.loaded = true;

        if (item.loadComplete) {
          item.loadComplete(item);
        } else {
          item.img = null; // no need to store image object
        }

        img.onload = img.onerror = null;
        img = null;
      };

      img.onload = onComplete;

      img.onerror = function () {
        item.loadError = true;
        onComplete();
      };

      img.src = item.src; // + '?a=' + Math.random();

      return img;
    },
        _checkForError = function _checkForError(item, cleanUp) {
      if (item.src && item.loadError && item.container) {
        if (cleanUp) {
          item.container.innerHTML = '';
        }

        item.container.innerHTML = _options.errorMsg.replace('%url%', item.src);
        return true;
      }
    },
        _setImageSize = function _setImageSize(item, img, maxRes) {
      if (!item.src) {
        return;
      }

      if (!img) {
        img = item.container.lastChild;
      }

      var w = maxRes ? item.w : Math.round(item.w * item.fitRatio),
          h = maxRes ? item.h : Math.round(item.h * item.fitRatio);

      if (item.placeholder && !item.loaded) {
        item.placeholder.style.width = w + 'px';
        item.placeholder.style.height = h + 'px';
      }

      img.style.width = w + 'px';
      img.style.height = h + 'px';
    },
        _appendImagesPool = function _appendImagesPool() {
      if (_imagesToAppendPool.length) {
        var poolItem;

        for (var i = 0; i < _imagesToAppendPool.length; i++) {
          poolItem = _imagesToAppendPool[i];

          if (poolItem.holder.index === poolItem.index) {
            _appendImage(poolItem.index, poolItem.item, poolItem.baseDiv, poolItem.img, false, poolItem.clearPlaceholder);
          }
        }

        _imagesToAppendPool = [];
      }
    };

    _registerModule('Controller', {
      publicMethods: {
        lazyLoadItem: function lazyLoadItem(index) {
          index = _getLoopedId(index);

          var item = _getItemAt(index);

          if (!item || (item.loaded || item.loading) && !_itemsNeedUpdate) {
            return;
          }

          _shout('gettingData', index, item);

          if (!item.src) {
            return;
          }

          _preloadImage(item);
        },
        initController: function initController() {
          framework.extend(_options, _controllerDefaultOptions, true);
          self.items = _items = items;
          _getItemAt = self.getItemAt;
          _getNumItems = _options.getNumItemsFn; //self.getNumItems;

          _initialIsLoop = _options.loop;

          if (_getNumItems() < 3) {
            _options.loop = false; // disable loop if less then 3 items
          }

          _listen('beforeChange', function (diff) {
            var p = _options.preload,
                isNext = diff === null ? true : diff >= 0,
                preloadBefore = Math.min(p[0], _getNumItems()),
                preloadAfter = Math.min(p[1], _getNumItems()),
                i;

            for (i = 1; i <= (isNext ? preloadAfter : preloadBefore); i++) {
              self.lazyLoadItem(_currentItemIndex + i);
            }

            for (i = 1; i <= (isNext ? preloadBefore : preloadAfter); i++) {
              self.lazyLoadItem(_currentItemIndex - i);
            }
          });

          _listen('initialLayout', function () {
            self.currItem.initialLayout = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex);
          });

          _listen('mainScrollAnimComplete', _appendImagesPool);

          _listen('initialZoomInEnd', _appendImagesPool);

          _listen('destroy', function () {
            var item;

            for (var i = 0; i < _items.length; i++) {
              item = _items[i]; // remove reference to DOM elements, for GC

              if (item.container) {
                item.container = null;
              }

              if (item.placeholder) {
                item.placeholder = null;
              }

              if (item.img) {
                item.img = null;
              }

              if (item.preloader) {
                item.preloader = null;
              }

              if (item.loadError) {
                item.loaded = item.loadError = false;
              }
            }

            _imagesToAppendPool = null;
          });
        },
        getItemAt: function getItemAt(index) {
          if (index >= 0) {
            return _items[index] !== undefined ? _items[index] : false;
          }

          return false;
        },
        allowProgressiveImg: function allowProgressiveImg() {
          // 1. Progressive image loading isn't working on webkit/blink 
          //    when hw-acceleration (e.g. translateZ) is applied to IMG element.
          //    That's why in PhotoSwipe parent element gets zoom transform, not image itself.
          //    
          // 2. Progressive image loading sometimes blinks in webkit/blink when applying animation to parent element.
          //    That's why it's disabled on touch devices (mainly because of swipe transition)
          //    
          // 3. Progressive image loading sometimes doesn't work in IE (up to 11).
          // Don't allow progressive loading on non-large touch devices
          return _options.forceProgressiveLoading || !_likelyTouchDevice || _options.mouseUsed || screen.width > 1200; // 1200 - to eliminate touch devices with large screen (like Chromebook Pixel)
        },
        setContent: function setContent(holder, index) {
          if (_options.loop) {
            index = _getLoopedId(index);
          }

          var prevItem = self.getItemAt(holder.index);

          if (prevItem) {
            prevItem.container = null;
          }

          var item = self.getItemAt(index),
              img;

          if (!item) {
            holder.el.innerHTML = '';
            return;
          } // allow to override data


          _shout('gettingData', index, item);

          holder.index = index;
          holder.item = item; // base container DIV is created only once for each of 3 holders

          var baseDiv = item.container = framework.createEl('pswp__zoom-wrap');

          if (!item.src && item.html) {
            if (item.html.tagName) {
              baseDiv.appendChild(item.html);
            } else {
              baseDiv.innerHTML = item.html;
            }
          }

          _checkForError(item);

          _calculateItemSize(item, _viewportSize);

          if (item.src && !item.loadError && !item.loaded) {
            item.loadComplete = function (item) {
              // gallery closed before image finished loading
              if (!_isOpen) {
                return;
              } // check if holder hasn't changed while image was loading


              if (holder && holder.index === index) {
                if (_checkForError(item, true)) {
                  item.loadComplete = item.img = null;

                  _calculateItemSize(item, _viewportSize);

                  _applyZoomPanToItem(item);

                  if (holder.index === _currentItemIndex) {
                    // recalculate dimensions
                    self.updateCurrZoomItem();
                  }

                  return;
                }

                if (!item.imageAppended) {
                  if (_features.transform && (_mainScrollAnimating || _initialZoomRunning)) {
                    _imagesToAppendPool.push({
                      item: item,
                      baseDiv: baseDiv,
                      img: item.img,
                      index: index,
                      holder: holder,
                      clearPlaceholder: true
                    });
                  } else {
                    _appendImage(index, item, baseDiv, item.img, _mainScrollAnimating || _initialZoomRunning, true);
                  }
                } else {
                  // remove preloader & mini-img
                  if (!_initialZoomRunning && item.placeholder) {
                    item.placeholder.style.display = 'none';
                    item.placeholder = null;
                  }
                }
              }

              item.loadComplete = null;
              item.img = null; // no need to store image element after it's added

              _shout('imageLoadComplete', index, item);
            };

            if (framework.features.transform) {
              var placeholderClassName = 'pswp__img pswp__img--placeholder';
              placeholderClassName += item.msrc ? '' : ' pswp__img--placeholder--blank';
              var placeholder = framework.createEl(placeholderClassName, item.msrc ? 'img' : '');

              if (item.msrc) {
                placeholder.src = item.msrc;
              }

              _setImageSize(item, placeholder);

              baseDiv.appendChild(placeholder);
              item.placeholder = placeholder;
            }

            if (!item.loading) {
              _preloadImage(item);
            }

            if (self.allowProgressiveImg()) {
              // just append image
              if (!_initialContentSet && _features.transform) {
                _imagesToAppendPool.push({
                  item: item,
                  baseDiv: baseDiv,
                  img: item.img,
                  index: index,
                  holder: holder
                });
              } else {
                _appendImage(index, item, baseDiv, item.img, true, true);
              }
            }
          } else if (item.src && !item.loadError) {
            // image object is created every time, due to bugs of image loading & delay when switching images
            img = framework.createEl('pswp__img', 'img');
            img.style.opacity = 1;
            img.src = item.src;

            _setImageSize(item, img);

            _appendImage(index, item, baseDiv, img, true);
          }

          if (!_initialContentSet && index === _currentItemIndex) {
            _currZoomElementStyle = baseDiv.style;

            _showOrHide(item, img || item.img);
          } else {
            _applyZoomPanToItem(item);
          }

          holder.el.innerHTML = '';
          holder.el.appendChild(baseDiv);
        },
        cleanSlide: function cleanSlide(item) {
          if (item.img) {
            item.img.onload = item.img.onerror = null;
          }

          item.loaded = item.loading = item.img = item.imageAppended = false;
        }
      }
    });
    /*>>items-controller*/

    /*>>tap*/

    /**
     * tap.js:
     *
     * Displatches tap and double-tap events.
     * 
     */


    var tapTimer,
        tapReleasePoint = {},
        _dispatchTapEvent = function _dispatchTapEvent(origEvent, releasePoint, pointerType) {
      var e = document.createEvent('CustomEvent'),
          eDetail = {
        origEvent: origEvent,
        target: origEvent.target,
        releasePoint: releasePoint,
        pointerType: pointerType || 'touch'
      };
      e.initCustomEvent('pswpTap', true, true, eDetail);
      origEvent.target.dispatchEvent(e);
    };

    _registerModule('Tap', {
      publicMethods: {
        initTap: function initTap() {
          _listen('firstTouchStart', self.onTapStart);

          _listen('touchRelease', self.onTapRelease);

          _listen('destroy', function () {
            tapReleasePoint = {};
            tapTimer = null;
          });
        },
        onTapStart: function onTapStart(touchList) {
          if (touchList.length > 1) {
            clearTimeout(tapTimer);
            tapTimer = null;
          }
        },
        onTapRelease: function onTapRelease(e, releasePoint) {
          if (!releasePoint) {
            return;
          }

          if (!_moved && !_isMultitouch && !_numAnimations) {
            var p0 = releasePoint;

            if (tapTimer) {
              clearTimeout(tapTimer);
              tapTimer = null; // Check if taped on the same place

              if (_isNearbyPoints(p0, tapReleasePoint)) {
                _shout('doubleTap', p0);

                return;
              }
            }

            if (releasePoint.type === 'mouse') {
              _dispatchTapEvent(e, releasePoint, 'mouse');

              return;
            }

            var clickedTagName = e.target.tagName.toUpperCase(); // avoid double tap delay on buttons and elements that have class pswp__single-tap

            if (clickedTagName === 'BUTTON' || framework.hasClass(e.target, 'pswp__single-tap')) {
              _dispatchTapEvent(e, releasePoint);

              return;
            }

            _equalizePoints(tapReleasePoint, p0);

            tapTimer = setTimeout(function () {
              _dispatchTapEvent(e, releasePoint);

              tapTimer = null;
            }, 300);
          }
        }
      }
    });
    /*>>tap*/

    /*>>desktop-zoom*/

    /**
     *
     * desktop-zoom.js:
     *
     * - Binds mousewheel event for paning zoomed image.
     * - Manages "dragging", "zoomed-in", "zoom-out" classes.
     *   (which are used for cursors and zoom icon)
     * - Adds toggleDesktopZoom function.
     * 
     */


    var _wheelDelta;

    _registerModule('DesktopZoom', {
      publicMethods: {
        initDesktopZoom: function initDesktopZoom() {
          if (_oldIE) {
            // no zoom for old IE (<=8)
            return;
          }

          if (_likelyTouchDevice) {
            // if detected hardware touch support, we wait until mouse is used,
            // and only then apply desktop-zoom features
            _listen('mouseUsed', function () {
              self.setupDesktopZoom();
            });
          } else {
            self.setupDesktopZoom(true);
          }
        },
        setupDesktopZoom: function setupDesktopZoom(onInit) {
          _wheelDelta = {};
          var events = 'wheel mousewheel DOMMouseScroll';

          _listen('bindEvents', function () {
            framework.bind(template, events, self.handleMouseWheel);
          });

          _listen('unbindEvents', function () {
            if (_wheelDelta) {
              framework.unbind(template, events, self.handleMouseWheel);
            }
          });

          self.mouseZoomedIn = false;

          var hasDraggingClass,
              updateZoomable = function updateZoomable() {
            if (self.mouseZoomedIn) {
              framework.removeClass(template, 'pswp--zoomed-in');
              self.mouseZoomedIn = false;
            }

            if (_currZoomLevel < 1) {
              framework.addClass(template, 'pswp--zoom-allowed');
            } else {
              framework.removeClass(template, 'pswp--zoom-allowed');
            }

            removeDraggingClass();
          },
              removeDraggingClass = function removeDraggingClass() {
            if (hasDraggingClass) {
              framework.removeClass(template, 'pswp--dragging');
              hasDraggingClass = false;
            }
          };

          _listen('resize', updateZoomable);

          _listen('afterChange', updateZoomable);

          _listen('pointerDown', function () {
            if (self.mouseZoomedIn) {
              hasDraggingClass = true;
              framework.addClass(template, 'pswp--dragging');
            }
          });

          _listen('pointerUp', removeDraggingClass);

          if (!onInit) {
            updateZoomable();
          }
        },
        handleMouseWheel: function handleMouseWheel(e) {
          if (_currZoomLevel <= self.currItem.fitRatio) {
            if (_options.modal) {
              if (!_options.closeOnScroll || _numAnimations || _isDragging) {
                e.preventDefault();
              } else if (_transformKey && Math.abs(e.deltaY) > 2) {
                // close PhotoSwipe
                // if browser supports transforms & scroll changed enough
                _closedByScroll = true;
                self.close();
              }
            }

            return true;
          } // allow just one event to fire


          e.stopPropagation(); // https://developer.mozilla.org/en-US/docs/Web/Events/wheel

          _wheelDelta.x = 0;

          if ('deltaX' in e) {
            if (e.deltaMode === 1
            /* DOM_DELTA_LINE */
            ) {
              // 18 - average line height
              _wheelDelta.x = e.deltaX * 18;
              _wheelDelta.y = e.deltaY * 18;
            } else {
              _wheelDelta.x = e.deltaX;
              _wheelDelta.y = e.deltaY;
            }
          } else if ('wheelDelta' in e) {
            if (e.wheelDeltaX) {
              _wheelDelta.x = -0.16 * e.wheelDeltaX;
            }

            if (e.wheelDeltaY) {
              _wheelDelta.y = -0.16 * e.wheelDeltaY;
            } else {
              _wheelDelta.y = -0.16 * e.wheelDelta;
            }
          } else if ('detail' in e) {
            _wheelDelta.y = e.detail;
          } else {
            return;
          }

          _calculatePanBounds(_currZoomLevel, true);

          var newPanX = _panOffset.x - _wheelDelta.x,
              newPanY = _panOffset.y - _wheelDelta.y; // only prevent scrolling in nonmodal mode when not at edges

          if (_options.modal || newPanX <= _currPanBounds.min.x && newPanX >= _currPanBounds.max.x && newPanY <= _currPanBounds.min.y && newPanY >= _currPanBounds.max.y) {
            e.preventDefault();
          } // TODO: use rAF instead of mousewheel?


          self.panTo(newPanX, newPanY);
        },
        toggleDesktopZoom: function toggleDesktopZoom(centerPoint) {
          centerPoint = centerPoint || {
            x: _viewportSize.x / 2 + _offset.x,
            y: _viewportSize.y / 2 + _offset.y
          };

          var doubleTapZoomLevel = _options.getDoubleTapZoom(true, self.currItem);

          var zoomOut = _currZoomLevel === doubleTapZoomLevel;
          self.mouseZoomedIn = !zoomOut;
          self.zoomTo(zoomOut ? self.currItem.initialZoomLevel : doubleTapZoomLevel, centerPoint, 333);
          framework[(!zoomOut ? 'add' : 'remove') + 'Class'](template, 'pswp--zoomed-in');
        }
      }
    });
    /*>>desktop-zoom*/

    /*>>history*/

    /**
     *
     * history.js:
     *
     * - Back button to close gallery.
     * 
     * - Unique URL for each slide: example.com/&pid=1&gid=3
     *   (where PID is picture index, and GID and gallery index)
     *   
     * - Switch URL when slides change.
     * 
     */


    var _historyDefaultOptions = {
      history: true,
      galleryUID: 1
    };

    var _historyUpdateTimeout,
        _hashChangeTimeout,
        _hashAnimCheckTimeout,
        _hashChangedByScript,
        _hashChangedByHistory,
        _hashReseted,
        _initialHash,
        _historyChanged,
        _closedFromURL,
        _urlChangedOnce,
        _windowLoc,
        _supportsPushState,
        _getHash = function _getHash() {
      return _windowLoc.hash.substring(1);
    },
        _cleanHistoryTimeouts = function _cleanHistoryTimeouts() {
      if (_historyUpdateTimeout) {
        clearTimeout(_historyUpdateTimeout);
      }

      if (_hashAnimCheckTimeout) {
        clearTimeout(_hashAnimCheckTimeout);
      }
    },
        // pid - Picture index
    // gid - Gallery index
    _parseItemIndexFromURL = function _parseItemIndexFromURL() {
      var hash = _getHash(),
          params = {};

      if (hash.length < 5) {
        // pid=1
        return params;
      }

      var i,
          vars = hash.split('&');

      for (i = 0; i < vars.length; i++) {
        if (!vars[i]) {
          continue;
        }

        var pair = vars[i].split('=');

        if (pair.length < 2) {
          continue;
        }

        params[pair[0]] = pair[1];
      }

      if (_options.galleryPIDs) {
        // detect custom pid in hash and search for it among the items collection
        var searchfor = params.pid;
        params.pid = 0; // if custom pid cannot be found, fallback to the first item

        for (i = 0; i < _items.length; i++) {
          if (_items[i].pid === searchfor) {
            params.pid = i;
            break;
          }
        }
      } else {
        params.pid = parseInt(params.pid, 10) - 1;
      }

      if (params.pid < 0) {
        params.pid = 0;
      }

      return params;
    },
        _updateHash = function _updateHash() {
      if (_hashAnimCheckTimeout) {
        clearTimeout(_hashAnimCheckTimeout);
      }

      if (_numAnimations || _isDragging) {
        // changing browser URL forces layout/paint in some browsers, which causes noticable lag during animation
        // that's why we update hash only when no animations running
        _hashAnimCheckTimeout = setTimeout(_updateHash, 500);
        return;
      }

      if (_hashChangedByScript) {
        clearTimeout(_hashChangeTimeout);
      } else {
        _hashChangedByScript = true;
      }

      var pid = _currentItemIndex + 1;

      var item = _getItemAt(_currentItemIndex);

      if (item.hasOwnProperty('pid')) {
        // carry forward any custom pid assigned to the item
        pid = item.pid;
      }

      var newHash = _initialHash + '&' + 'gid=' + _options.galleryUID + '&' + 'pid=' + pid;

      if (!_historyChanged) {
        if (_windowLoc.hash.indexOf(newHash) === -1) {
          _urlChangedOnce = true;
        } // first time - add new hisory record, then just replace

      }

      var newURL = _windowLoc.href.split('#')[0] + '#' + newHash;

      if (_supportsPushState) {
        if ('#' + newHash !== window.location.hash) {
          history[_historyChanged ? 'replaceState' : 'pushState']('', document.title, newURL);
        }
      } else {
        if (_historyChanged) {
          _windowLoc.replace(newURL);
        } else {
          _windowLoc.hash = newHash;
        }
      }

      _historyChanged = true;
      _hashChangeTimeout = setTimeout(function () {
        _hashChangedByScript = false;
      }, 60);
    };

    _registerModule('History', {
      publicMethods: {
        initHistory: function initHistory() {
          framework.extend(_options, _historyDefaultOptions, true);

          if (!_options.history) {
            return;
          }

          _windowLoc = window.location;
          _urlChangedOnce = false;
          _closedFromURL = false;
          _historyChanged = false;
          _initialHash = _getHash();
          _supportsPushState = 'pushState' in history;

          if (_initialHash.indexOf('gid=') > -1) {
            _initialHash = _initialHash.split('&gid=')[0];
            _initialHash = _initialHash.split('?gid=')[0];
          }

          _listen('afterChange', self.updateURL);

          _listen('unbindEvents', function () {
            framework.unbind(window, 'hashchange', self.onHashChange);
          });

          var returnToOriginal = function returnToOriginal() {
            _hashReseted = true;

            if (!_closedFromURL) {
              if (_urlChangedOnce) {
                history.back();
              } else {
                if (_initialHash) {
                  _windowLoc.hash = _initialHash;
                } else {
                  if (_supportsPushState) {
                    // remove hash from url without refreshing it or scrolling to top
                    history.pushState('', document.title, _windowLoc.pathname + _windowLoc.search);
                  } else {
                    _windowLoc.hash = '';
                  }
                }
              }
            }

            _cleanHistoryTimeouts();
          };

          _listen('unbindEvents', function () {
            if (_closedByScroll) {
              // if PhotoSwipe is closed by scroll, we go "back" before the closing animation starts
              // this is done to keep the scroll position
              returnToOriginal();
            }
          });

          _listen('destroy', function () {
            if (!_hashReseted) {
              returnToOriginal();
            }
          });

          _listen('firstUpdate', function () {
            _currentItemIndex = _parseItemIndexFromURL().pid;
          });

          var index = _initialHash.indexOf('pid=');

          if (index > -1) {
            _initialHash = _initialHash.substring(0, index);

            if (_initialHash.slice(-1) === '&') {
              _initialHash = _initialHash.slice(0, -1);
            }
          }

          setTimeout(function () {
            if (_isOpen) {
              // hasn't destroyed yet
              framework.bind(window, 'hashchange', self.onHashChange);
            }
          }, 40);
        },
        onHashChange: function onHashChange() {
          if (_getHash() === _initialHash) {
            _closedFromURL = true;
            self.close();
            return;
          }

          if (!_hashChangedByScript) {
            _hashChangedByHistory = true;
            self.goTo(_parseItemIndexFromURL().pid);
            _hashChangedByHistory = false;
          }
        },
        updateURL: function updateURL() {
          // Delay the update of URL, to avoid lag during transition, 
          // and to not to trigger actions like "refresh page sound" or "blinking favicon" to often
          _cleanHistoryTimeouts();

          if (_hashChangedByHistory) {
            return;
          }

          if (!_historyChanged) {
            _updateHash(); // first time

          } else {
            _historyUpdateTimeout = setTimeout(_updateHash, 800);
          }
        }
      }
    });
    /*>>history*/


    framework.extend(self, publicMethods);
  };

  return PhotoSwipe;
});

},{}],4:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

/*!
Waypoints - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
(function () {
  'use strict';

  var keyCounter = 0;
  var allWaypoints = {};
  /* http://imakewebthings.com/waypoints/api/waypoint */

  function Waypoint(options) {
    if (!options) {
      throw new Error('No options passed to Waypoint constructor');
    }

    if (!options.element) {
      throw new Error('No element option passed to Waypoint constructor');
    }

    if (!options.handler) {
      throw new Error('No handler option passed to Waypoint constructor');
    }

    this.key = 'waypoint-' + keyCounter;
    this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options);
    this.element = this.options.element;
    this.adapter = new Waypoint.Adapter(this.element);
    this.callback = options.handler;
    this.axis = this.options.horizontal ? 'horizontal' : 'vertical';
    this.enabled = this.options.enabled;
    this.triggerPoint = null;
    this.group = Waypoint.Group.findOrCreate({
      name: this.options.group,
      axis: this.axis
    });
    this.context = Waypoint.Context.findOrCreateByElement(this.options.context);

    if (Waypoint.offsetAliases[this.options.offset]) {
      this.options.offset = Waypoint.offsetAliases[this.options.offset];
    }

    this.group.add(this);
    this.context.add(this);
    allWaypoints[this.key] = this;
    keyCounter += 1;
  }
  /* Private */


  Waypoint.prototype.queueTrigger = function (direction) {
    this.group.queueTrigger(this, direction);
  };
  /* Private */


  Waypoint.prototype.trigger = function (args) {
    if (!this.enabled) {
      return;
    }

    if (this.callback) {
      this.callback.apply(this, args);
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/destroy */


  Waypoint.prototype.destroy = function () {
    this.context.remove(this);
    this.group.remove(this);
    delete allWaypoints[this.key];
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/disable */


  Waypoint.prototype.disable = function () {
    this.enabled = false;
    return this;
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/enable */


  Waypoint.prototype.enable = function () {
    this.context.refresh();
    this.enabled = true;
    return this;
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/next */


  Waypoint.prototype.next = function () {
    return this.group.next(this);
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/previous */


  Waypoint.prototype.previous = function () {
    return this.group.previous(this);
  };
  /* Private */


  Waypoint.invokeAll = function (method) {
    var allWaypointsArray = [];

    for (var waypointKey in allWaypoints) {
      allWaypointsArray.push(allWaypoints[waypointKey]);
    }

    for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
      allWaypointsArray[i][method]();
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/destroy-all */


  Waypoint.destroyAll = function () {
    Waypoint.invokeAll('destroy');
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/disable-all */


  Waypoint.disableAll = function () {
    Waypoint.invokeAll('disable');
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/enable-all */


  Waypoint.enableAll = function () {
    Waypoint.invokeAll('enable');
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/refresh-all */


  Waypoint.refreshAll = function () {
    Waypoint.Context.refreshAll();
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/viewport-height */


  Waypoint.viewportHeight = function () {
    return window.innerHeight || document.documentElement.clientHeight;
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/viewport-width */


  Waypoint.viewportWidth = function () {
    return document.documentElement.clientWidth;
  };

  Waypoint.adapters = [];
  Waypoint.defaults = {
    context: window,
    continuous: true,
    enabled: true,
    group: 'default',
    horizontal: false,
    offset: 0
  };
  Waypoint.offsetAliases = {
    'bottom-in-view': function bottomInView() {
      return this.context.innerHeight() - this.adapter.outerHeight();
    },
    'right-in-view': function rightInView() {
      return this.context.innerWidth() - this.adapter.outerWidth();
    }
  };
  window.Waypoint = Waypoint;
})();

(function () {
  'use strict';

  function requestAnimationFrameShim(callback) {
    window.setTimeout(callback, 1000 / 60);
  }

  var keyCounter = 0;
  var contexts = {};
  var Waypoint = window.Waypoint;
  var oldWindowLoad = window.onload;
  /* http://imakewebthings.com/waypoints/api/context */

  function Context(element) {
    this.element = element;
    this.Adapter = Waypoint.Adapter;
    this.adapter = new this.Adapter(element);
    this.key = 'waypoint-context-' + keyCounter;
    this.didScroll = false;
    this.didResize = false;
    this.oldScroll = {
      x: this.adapter.scrollLeft(),
      y: this.adapter.scrollTop()
    };
    this.waypoints = {
      vertical: {},
      horizontal: {}
    };
    element.waypointContextKey = this.key;
    contexts[element.waypointContextKey] = this;
    keyCounter += 1;
    this.createThrottledScrollHandler();
    this.createThrottledResizeHandler();
  }
  /* Private */


  Context.prototype.add = function (waypoint) {
    var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical';
    this.waypoints[axis][waypoint.key] = waypoint;
    this.refresh();
  };
  /* Private */


  Context.prototype.checkEmpty = function () {
    var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal);
    var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical);

    if (horizontalEmpty && verticalEmpty) {
      this.adapter.off('.waypoints');
      delete contexts[this.key];
    }
  };
  /* Private */


  Context.prototype.createThrottledResizeHandler = function () {
    var self = this;

    function resizeHandler() {
      self.handleResize();
      self.didResize = false;
    }

    this.adapter.on('resize.waypoints', function () {
      if (!self.didResize) {
        self.didResize = true;
        Waypoint.requestAnimationFrame(resizeHandler);
      }
    });
  };
  /* Private */


  Context.prototype.createThrottledScrollHandler = function () {
    var self = this;

    function scrollHandler() {
      self.handleScroll();
      self.didScroll = false;
    }

    this.adapter.on('scroll.waypoints', function () {
      if (!self.didScroll || Waypoint.isTouch) {
        self.didScroll = true;
        Waypoint.requestAnimationFrame(scrollHandler);
      }
    });
  };
  /* Private */


  Context.prototype.handleResize = function () {
    Waypoint.Context.refreshAll();
  };
  /* Private */


  Context.prototype.handleScroll = function () {
    var triggeredGroups = {};
    var axes = {
      horizontal: {
        newScroll: this.adapter.scrollLeft(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left'
      },
      vertical: {
        newScroll: this.adapter.scrollTop(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up'
      }
    };

    for (var axisKey in axes) {
      var axis = axes[axisKey];
      var isForward = axis.newScroll > axis.oldScroll;
      var direction = isForward ? axis.forward : axis.backward;

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey];
        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint;
        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint;
        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint;
        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint;

        if (crossedForward || crossedBackward) {
          waypoint.queueTrigger(direction);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers();
    }

    this.oldScroll = {
      x: axes.horizontal.newScroll,
      y: axes.vertical.newScroll
    };
  };
  /* Private */


  Context.prototype.innerHeight = function () {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportHeight();
    }
    /*eslint-enable eqeqeq */


    return this.adapter.innerHeight();
  };
  /* Private */


  Context.prototype.remove = function (waypoint) {
    delete this.waypoints[waypoint.axis][waypoint.key];
    this.checkEmpty();
  };
  /* Private */


  Context.prototype.innerWidth = function () {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportWidth();
    }
    /*eslint-enable eqeqeq */


    return this.adapter.innerWidth();
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/context-destroy */


  Context.prototype.destroy = function () {
    var allWaypoints = [];

    for (var axis in this.waypoints) {
      for (var waypointKey in this.waypoints[axis]) {
        allWaypoints.push(this.waypoints[axis][waypointKey]);
      }
    }

    for (var i = 0, end = allWaypoints.length; i < end; i++) {
      allWaypoints[i].destroy();
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/context-refresh */


  Context.prototype.refresh = function () {
    /*eslint-disable eqeqeq */
    var isWindow = this.element == this.element.window;
    /*eslint-enable eqeqeq */

    var contextOffset = isWindow ? undefined : this.adapter.offset();
    var triggeredGroups = {};
    var axes;
    this.handleScroll();
    axes = {
      horizontal: {
        contextOffset: isWindow ? 0 : contextOffset.left,
        contextScroll: isWindow ? 0 : this.oldScroll.x,
        contextDimension: this.innerWidth(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left',
        offsetProp: 'left'
      },
      vertical: {
        contextOffset: isWindow ? 0 : contextOffset.top,
        contextScroll: isWindow ? 0 : this.oldScroll.y,
        contextDimension: this.innerHeight(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up',
        offsetProp: 'top'
      }
    };

    for (var axisKey in axes) {
      var axis = axes[axisKey];

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey];
        var adjustment = waypoint.options.offset;
        var oldTriggerPoint = waypoint.triggerPoint;
        var elementOffset = 0;
        var freshWaypoint = oldTriggerPoint == null;
        var contextModifier, wasBeforeScroll, nowAfterScroll;
        var triggeredBackward, triggeredForward;

        if (waypoint.element !== waypoint.element.window) {
          elementOffset = waypoint.adapter.offset()[axis.offsetProp];
        }

        if (typeof adjustment === 'function') {
          adjustment = adjustment.apply(waypoint);
        } else if (typeof adjustment === 'string') {
          adjustment = parseFloat(adjustment);

          if (waypoint.options.offset.indexOf('%') > -1) {
            adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
          }
        }

        contextModifier = axis.contextScroll - axis.contextOffset;
        waypoint.triggerPoint = elementOffset + contextModifier - adjustment;
        wasBeforeScroll = oldTriggerPoint < axis.oldScroll;
        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll;
        triggeredBackward = wasBeforeScroll && nowAfterScroll;
        triggeredForward = !wasBeforeScroll && !nowAfterScroll;

        if (!freshWaypoint && triggeredBackward) {
          waypoint.queueTrigger(axis.backward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        } else if (!freshWaypoint && triggeredForward) {
          waypoint.queueTrigger(axis.forward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        } else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
          waypoint.queueTrigger(axis.forward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        }
      }
    }

    Waypoint.requestAnimationFrame(function () {
      for (var groupKey in triggeredGroups) {
        triggeredGroups[groupKey].flushTriggers();
      }
    });
    return this;
  };
  /* Private */


  Context.findOrCreateByElement = function (element) {
    return Context.findByElement(element) || new Context(element);
  };
  /* Private */


  Context.refreshAll = function () {
    for (var contextId in contexts) {
      contexts[contextId].refresh();
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/context-find-by-element */


  Context.findByElement = function (element) {
    return contexts[element.waypointContextKey];
  };

  window.onload = function () {
    if (oldWindowLoad) {
      oldWindowLoad();
    }

    Context.refreshAll();
  };

  Waypoint.requestAnimationFrame = function (callback) {
    var requestFn = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || requestAnimationFrameShim;
    requestFn.call(window, callback);
  };

  Waypoint.Context = Context;
})();

(function () {
  'use strict';

  function byTriggerPoint(a, b) {
    return a.triggerPoint - b.triggerPoint;
  }

  function byReverseTriggerPoint(a, b) {
    return b.triggerPoint - a.triggerPoint;
  }

  var groups = {
    vertical: {},
    horizontal: {}
  };
  var Waypoint = window.Waypoint;
  /* http://imakewebthings.com/waypoints/api/group */

  function Group(options) {
    this.name = options.name;
    this.axis = options.axis;
    this.id = this.name + '-' + this.axis;
    this.waypoints = [];
    this.clearTriggerQueues();
    groups[this.axis][this.name] = this;
  }
  /* Private */


  Group.prototype.add = function (waypoint) {
    this.waypoints.push(waypoint);
  };
  /* Private */


  Group.prototype.clearTriggerQueues = function () {
    this.triggerQueues = {
      up: [],
      down: [],
      left: [],
      right: []
    };
  };
  /* Private */


  Group.prototype.flushTriggers = function () {
    for (var direction in this.triggerQueues) {
      var waypoints = this.triggerQueues[direction];
      var reverse = direction === 'up' || direction === 'left';
      waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint);

      for (var i = 0, end = waypoints.length; i < end; i += 1) {
        var waypoint = waypoints[i];

        if (waypoint.options.continuous || i === waypoints.length - 1) {
          waypoint.trigger([direction]);
        }
      }
    }

    this.clearTriggerQueues();
  };
  /* Private */


  Group.prototype.next = function (waypoint) {
    this.waypoints.sort(byTriggerPoint);
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    var isLast = index === this.waypoints.length - 1;
    return isLast ? null : this.waypoints[index + 1];
  };
  /* Private */


  Group.prototype.previous = function (waypoint) {
    this.waypoints.sort(byTriggerPoint);
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    return index ? this.waypoints[index - 1] : null;
  };
  /* Private */


  Group.prototype.queueTrigger = function (waypoint, direction) {
    this.triggerQueues[direction].push(waypoint);
  };
  /* Private */


  Group.prototype.remove = function (waypoint) {
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);

    if (index > -1) {
      this.waypoints.splice(index, 1);
    }
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/first */


  Group.prototype.first = function () {
    return this.waypoints[0];
  };
  /* Public */

  /* http://imakewebthings.com/waypoints/api/last */


  Group.prototype.last = function () {
    return this.waypoints[this.waypoints.length - 1];
  };
  /* Private */


  Group.findOrCreate = function (options) {
    return groups[options.axis][options.name] || new Group(options);
  };

  Waypoint.Group = Group;
})();

(function () {
  'use strict';

  var Waypoint = window.Waypoint;

  function isWindow(element) {
    return element === element.window;
  }

  function getWindow(element) {
    if (isWindow(element)) {
      return element;
    }

    return element.defaultView;
  }

  function NoFrameworkAdapter(element) {
    this.element = element;
    this.handlers = {};
  }

  NoFrameworkAdapter.prototype.innerHeight = function () {
    var isWin = isWindow(this.element);
    return isWin ? this.element.innerHeight : this.element.clientHeight;
  };

  NoFrameworkAdapter.prototype.innerWidth = function () {
    var isWin = isWindow(this.element);
    return isWin ? this.element.innerWidth : this.element.clientWidth;
  };

  NoFrameworkAdapter.prototype.off = function (event, handler) {
    function removeListeners(element, listeners, handler) {
      for (var i = 0, end = listeners.length - 1; i < end; i++) {
        var listener = listeners[i];

        if (!handler || handler === listener) {
          element.removeEventListener(listener);
        }
      }
    }

    var eventParts = event.split('.');
    var eventType = eventParts[0];
    var namespace = eventParts[1];
    var element = this.element;

    if (namespace && this.handlers[namespace] && eventType) {
      removeListeners(element, this.handlers[namespace][eventType], handler);
      this.handlers[namespace][eventType] = [];
    } else if (eventType) {
      for (var ns in this.handlers) {
        removeListeners(element, this.handlers[ns][eventType] || [], handler);
        this.handlers[ns][eventType] = [];
      }
    } else if (namespace && this.handlers[namespace]) {
      for (var type in this.handlers[namespace]) {
        removeListeners(element, this.handlers[namespace][type], handler);
      }

      this.handlers[namespace] = {};
    }
  };
  /* Adapted from jQuery 1.x offset() */


  NoFrameworkAdapter.prototype.offset = function () {
    if (!this.element.ownerDocument) {
      return null;
    }

    var documentElement = this.element.ownerDocument.documentElement;
    var win = getWindow(this.element.ownerDocument);
    var rect = {
      top: 0,
      left: 0
    };

    if (this.element.getBoundingClientRect) {
      rect = this.element.getBoundingClientRect();
    }

    return {
      top: rect.top + win.pageYOffset - documentElement.clientTop,
      left: rect.left + win.pageXOffset - documentElement.clientLeft
    };
  };

  NoFrameworkAdapter.prototype.on = function (event, handler) {
    var eventParts = event.split('.');
    var eventType = eventParts[0];
    var namespace = eventParts[1] || '__default';
    var nsHandlers = this.handlers[namespace] = this.handlers[namespace] || {};
    var nsTypeList = nsHandlers[eventType] = nsHandlers[eventType] || [];
    nsTypeList.push(handler);
    this.element.addEventListener(eventType, handler);
  };

  NoFrameworkAdapter.prototype.outerHeight = function (includeMargin) {
    var height = this.innerHeight();
    var computedStyle;

    if (includeMargin && !isWindow(this.element)) {
      computedStyle = window.getComputedStyle(this.element);
      height += parseInt(computedStyle.marginTop, 10);
      height += parseInt(computedStyle.marginBottom, 10);
    }

    return height;
  };

  NoFrameworkAdapter.prototype.outerWidth = function (includeMargin) {
    var width = this.innerWidth();
    var computedStyle;

    if (includeMargin && !isWindow(this.element)) {
      computedStyle = window.getComputedStyle(this.element);
      width += parseInt(computedStyle.marginLeft, 10);
      width += parseInt(computedStyle.marginRight, 10);
    }

    return width;
  };

  NoFrameworkAdapter.prototype.scrollLeft = function () {
    var win = getWindow(this.element);
    return win ? win.pageXOffset : this.element.scrollLeft;
  };

  NoFrameworkAdapter.prototype.scrollTop = function () {
    var win = getWindow(this.element);
    return win ? win.pageYOffset : this.element.scrollTop;
  };

  NoFrameworkAdapter.extend = function () {
    var args = Array.prototype.slice.call(arguments);

    function merge(target, obj) {
      if (_typeof(target) === 'object' && _typeof(obj) === 'object') {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            target[key] = obj[key];
          }
        }
      }

      return target;
    }

    for (var i = 1, end = args.length; i < end; i++) {
      merge(args[0], args[i]);
    }

    return args[0];
  };

  NoFrameworkAdapter.inArray = function (element, array, i) {
    return array == null ? -1 : array.indexOf(element, i);
  };

  NoFrameworkAdapter.isEmptyObject = function (obj) {
    /* eslint no-unused-vars: 0 */
    for (var name in obj) {
      return false;
    }

    return true;
  };

  Waypoint.adapters.push({
    name: 'noframework',
    Adapter: NoFrameworkAdapter
  });
  Waypoint.Adapter = NoFrameworkAdapter;
})();
/*!
Waypoints Inview Shortcut - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/


(function () {
  'use strict';

  function noop() {}

  var Waypoint = window.Waypoint;
  /* http://imakewebthings.com/waypoints/shortcuts/inview */

  function Inview(options) {
    this.options = Waypoint.Adapter.extend({}, Inview.defaults, options);
    this.axis = this.options.horizontal ? 'horizontal' : 'vertical';
    this.waypoints = [];
    this.element = this.options.element;
    this.createWaypoints();
  }
  /* Private */


  Inview.prototype.createWaypoints = function () {
    var configs = {
      vertical: [{
        down: 'enter',
        up: 'exited',
        offset: '100%'
      }, {
        down: 'entered',
        up: 'exit',
        offset: 'bottom-in-view'
      }, {
        down: 'exit',
        up: 'entered',
        offset: 0
      }, {
        down: 'exited',
        up: 'enter',
        offset: function offset() {
          return -this.adapter.outerHeight();
        }
      }],
      horizontal: [{
        right: 'enter',
        left: 'exited',
        offset: '100%'
      }, {
        right: 'entered',
        left: 'exit',
        offset: 'right-in-view'
      }, {
        right: 'exit',
        left: 'entered',
        offset: 0
      }, {
        right: 'exited',
        left: 'enter',
        offset: function offset() {
          return -this.adapter.outerWidth();
        }
      }]
    };

    for (var i = 0, end = configs[this.axis].length; i < end; i++) {
      var config = configs[this.axis][i];
      this.createWaypoint(config);
    }
  };
  /* Private */


  Inview.prototype.createWaypoint = function (config) {
    var self = this;
    this.waypoints.push(new Waypoint({
      context: this.options.context,
      element: this.options.element,
      enabled: this.options.enabled,
      handler: function (config) {
        return function (direction) {
          self.options[config[direction]].call(self, direction);
        };
      }(config),
      offset: config.offset,
      horizontal: this.options.horizontal
    }));
  };
  /* Public */


  Inview.prototype.destroy = function () {
    for (var i = 0, end = this.waypoints.length; i < end; i++) {
      this.waypoints[i].destroy();
    }

    this.waypoints = [];
  };

  Inview.prototype.disable = function () {
    for (var i = 0, end = this.waypoints.length; i < end; i++) {
      this.waypoints[i].disable();
    }
  };

  Inview.prototype.enable = function () {
    for (var i = 0, end = this.waypoints.length; i < end; i++) {
      this.waypoints[i].enable();
    }
  };

  Inview.defaults = {
    context: window,
    enabled: true,
    enter: noop,
    entered: noop,
    exit: noop,
    exited: noop
  };
  Waypoint.Inview = Inview;
})();

},{}],5:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

/**
 * Zenscroll 3.0.1
 * https://github.com/zengabor/zenscroll/
 *
 * Copyright 2015–2016 Gabor Lenard
 *
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org>
 *
 */

/*jshint devel:true, asi:true */

/*global define, module */
(function (root, zenscroll) {
  if (typeof define === "function" && define.amd) {
    define([], zenscroll());
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && module.exports) {
    module.exports = zenscroll();
  } else {
    root.zenscroll = zenscroll();
  }
})(void 0, function () {
  "use strict";

  var createScroller = function createScroller(scrollContainer, defaultDuration, edgeOffset) {
    defaultDuration = defaultDuration || 999; //ms

    if (!edgeOffset || edgeOffset !== 0) {
      // When scrolling, this amount of distance is kept from the edges of the scrollContainer:
      edgeOffset = 9; //px
    }

    var scrollTimeoutId;
    var docElem = document.documentElement; // Detect if the browser already supports native smooth scrolling (e.g., Firefox 36+ and Chrome 49+) and it is enabled:

    var nativeSmoothScrollEnabled = function nativeSmoothScrollEnabled() {
      return "getComputedStyle" in window && window.getComputedStyle(scrollContainer ? scrollContainer : document.body)["scroll-behavior"] === "smooth";
    };

    var getScrollTop = function getScrollTop() {
      return scrollContainer ? scrollContainer.scrollTop : window.scrollY || docElem.scrollTop;
    };

    var getViewHeight = function getViewHeight() {
      return scrollContainer ? Math.min(scrollContainer.offsetHeight, window.innerHeight) : window.innerHeight || docElem.clientHeight;
    };

    var getRelativeTopOf = function getRelativeTopOf(elem) {
      if (scrollContainer) {
        return elem.offsetTop - scrollContainer.offsetTop;
      } else {
        return elem.getBoundingClientRect().top + getScrollTop() - docElem.offsetTop;
      }
    };
    /**
     * Immediately stops the current smooth scroll operation
     */


    var stopScroll = function stopScroll() {
      clearTimeout(scrollTimeoutId);
      scrollTimeoutId = 0;
    };
    /**
     * Scrolls to a specific vertical position in the document.
     *
     * @param {endY} The vertical position within the document.
     * @param {duration} Optionally the duration of the scroll operation.
     *        If 0 or not provided it is automatically calculated based on the
     *        distance and the default duration.
     */


    var scrollToY = function scrollToY(endY, duration) {
      stopScroll();

      if (nativeSmoothScrollEnabled()) {
        (scrollContainer || window).scrollTo(0, endY);
      } else {
        var startY = getScrollTop();
        var distance = Math.max(endY, 0) - startY;
        duration = duration || Math.min(Math.abs(distance), defaultDuration);
        var startTime = new Date().getTime();

        (function loopScroll() {
          scrollTimeoutId = setTimeout(function () {
            var p = Math.min((new Date().getTime() - startTime) / duration, 1); // percentage

            var y = Math.max(Math.floor(startY + distance * (p < 0.5 ? 2 * p * p : p * (4 - p * 2) - 1)), 0);

            if (scrollContainer) {
              scrollContainer.scrollTop = y;
            } else {
              window.scrollTo(0, y);
            }

            if (p < 1 && getViewHeight() + y < (scrollContainer || docElem).scrollHeight) {
              loopScroll();
            } else {
              setTimeout(stopScroll, 99); // with cooldown time
            }
          }, 9);
        })();
      }
    };
    /**
     * Scrolls to the top of a specific element.
     *
     * @param {elem} The element.
     * @param {duration} Optionally the duration of the scroll operation.
     *        A value of 0 is ignored.
     */


    var scrollToElem = function scrollToElem(elem, duration) {
      scrollToY(getRelativeTopOf(elem) - edgeOffset, duration);
    };
    /**
     * Scrolls an element into view if necessary.
     *
     * @param {elem} The element.
     * @param {duration} Optionally the duration of the scroll operation.
     *        A value of 0 is ignored.
     */


    var scrollIntoView = function scrollIntoView(elem, duration) {
      var elemScrollHeight = elem.getBoundingClientRect().height + 2 * edgeOffset;
      var vHeight = getViewHeight();
      var elemTop = getRelativeTopOf(elem);
      var elemBottom = elemTop + elemScrollHeight;
      var scrollTop = getScrollTop();

      if (elemTop - scrollTop < edgeOffset || elemScrollHeight > vHeight) {
        // Element is clipped at top or is higher than screen.
        scrollToElem(elem, duration);
      } else if (scrollTop + vHeight - elemBottom < edgeOffset) {
        // Element is clipped at the bottom.
        scrollToY(elemBottom - vHeight, duration);
      }
    };
    /**
     * Scrolls to the center of an element.
     *
     * @param {elem} The element.
     * @param {duration} Optionally the duration of the scroll operation.
     * @param {offset} Optionally the offset of the top of the element from the center of the screen.
     *        A value of 0 is ignored.
     */


    var scrollToCenterOf = function scrollToCenterOf(elem, duration, offset) {
      scrollToY(Math.max(getRelativeTopOf(elem) - getViewHeight() / 2 + (offset || elem.getBoundingClientRect().height / 2), 0), duration);
    };
    /**
     * Changes default settings for this scroller.
     *
     * @param {newDefaultDuration} New value for default duration, used for each scroll method by default.
     *        Ignored if 0 or falsy.
     * @param {newEdgeOffset} New value for the edge offset, used by each scroll method by default.
     */


    var setup = function setup(newDefaultDuration, newEdgeOffset) {
      if (newDefaultDuration) {
        defaultDuration = newDefaultDuration;
      }

      if (newEdgeOffset === 0 || newEdgeOffset) {
        edgeOffset = newEdgeOffset;
      }
    };

    return {
      setup: setup,
      to: scrollToElem,
      toY: scrollToY,
      intoView: scrollIntoView,
      center: scrollToCenterOf,
      stop: stopScroll,
      moving: function moving() {
        return !!scrollTimeoutId;
      }
    };
  }; // Create a scroller for the browser window, omitting parameters:


  var defaultScroller = createScroller(); // Create listeners for the documentElement only & exclude IE8-

  if ("addEventListener" in window && document.body.style.scrollBehavior !== "smooth" && !window.noZensmooth) {
    var replaceUrl = function replaceUrl(hash) {
      try {
        history.replaceState({}, "", window.location.href.split("#")[0] + hash);
      } catch (e) {// To avoid the Security exception in Chrome when the page was opened via the file protocol, e.g., file://index.html
      }
    };

    window.addEventListener("click", function (event) {
      var anchor = event.target;

      while (anchor && anchor.tagName !== "A") {
        anchor = anchor.parentNode;
      }

      if (!anchor || event.which !== 1 || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      var href = anchor.getAttribute("href") || "";

      if (href.indexOf("#") === 0) {
        if (href === "#") {
          event.preventDefault(); // Prevent the browser from handling the activation of the link

          defaultScroller.toY(0);
          replaceUrl("");
        } else {
          var targetId = anchor.hash.substring(1);
          var targetElem = document.getElementById(targetId);

          if (targetElem) {
            event.preventDefault(); // Prevent the browser from handling the activation of the link

            defaultScroller.to(targetElem);
            replaceUrl("#" + targetId);
          }
        }
      }
    }, false);
  }

  return {
    // Expose the "constructor" that can create a new scroller:
    createScroller: createScroller,
    // Surface the methods of the default scroller:
    setup: defaultScroller.setup,
    to: defaultScroller.to,
    toY: defaultScroller.toY,
    intoView: defaultScroller.intoView,
    center: defaultScroller.center,
    stop: defaultScroller.stop,
    moving: defaultScroller.moving
  };
});

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = PrimaryNav;

function PrimaryNav() {
  // cache dom elements
  var body = document.body,
      navTrigger = document.querySelector(".js-nav-trigger"),
      container = document.querySelector(".container"),
      primaryNav = document.querySelector(".js-primary-nav"),
      primaryNavLinks = document.querySelectorAll(".js-primary-nav a"); // Flag that JS has loaded

  body.classList.remove("no-js");
  body.classList.add("js"); // Hamburger menu

  navTrigger.addEventListener("click", function () {
    // toggle active class on the nav trigger
    this.classList.toggle("open"); // toggle the active class on site container

    container.classList.toggle("js-nav-active");
  }); // In-menu link click

  for (var i = 0; i < primaryNavLinks.length; i++) {
    var primaryNavLink = primaryNavLinks[i];

    primaryNavLink.onclick = function () {
      // toggle active class on the nav trigger
      navTrigger.classList.toggle("open"); // immediately hide the nav

      primaryNav.style.opacity = "0"; // once drawer has had time to pull up, restore opacity

      setTimeout(function () {
        primaryNav.style.opacity = "1";
      }, 1000); // toggle the active class on site container

      container.classList.toggle("js-nav-active");
    };
  }
}

;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = TimelineLoading;

function TimelineLoading() {
  var timelineBlocks = document.querySelectorAll(".cd-timeline-block, .cgd-timeline-block");
  Array.prototype.forEach.call(timelineBlocks, function (el, i) {
    var waypoint = new Waypoint({
      element: el,
      handler: function handler() {
        el.classList.add('fadeInUp');
      },
      offset: '75%'
    });
  });
}

;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfanMtZXM2L2FwcC5qcyIsIl9qcy1lczYvbGlicy9waG90b3N3aXBlLXVpLWRlZmF1bHQuanMiLCJfanMtZXM2L2xpYnMvcGhvdG9zd2lwZS5qcyIsIl9qcy1lczYvbGlicy93YXlwb2ludHMuanMiLCJfanMtZXM2L2xpYnMvemVuc2Nyb2xsLmpzIiwiX2pzLWVzNi9tb2R1bGVzL3ByaW1hcnktbmF2LmpzIiwiX2pzLWVzNi9tb2R1bGVzL3RpbWVsaW5lLWxvYWRpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUdBOzs7O0FBVkE7QUFNQTtBQUVBLElBQUEsc0JBQUE7QUFHQSxJQUFBLDJCQUFBLEksQ0FFQTs7QUFDRSxJQUFJLHFCQUFxQixHQUFHLFNBQXhCLHFCQUF3QixDQUFTLGVBQVQsRUFBMEI7RUFFbEQsSUFBSSxzQkFBc0IsR0FBRyxTQUF6QixzQkFBeUIsQ0FBUyxFQUFULEVBQWE7SUFDdEMsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDLFVBQXZCO0lBQUEsSUFDSSxRQUFRLEdBQUcsYUFBYSxDQUFDLE1BRDdCO0lBQUEsSUFFSSxLQUFLLEdBQUcsRUFGWjtJQUFBLElBR0ksRUFISjtJQUFBLElBSUksYUFKSjtJQUFBLElBS0ksV0FMSjtJQUFBLElBTUksSUFOSjtJQUFBLElBT0ksSUFQSjs7SUFTQSxLQUFJLElBQUksQ0FBQyxHQUFHLENBQVosRUFBZSxDQUFDLEdBQUcsUUFBbkIsRUFBNkIsQ0FBQyxFQUE5QixFQUFrQztNQUM5QixFQUFFLEdBQUcsYUFBYSxDQUFDLENBQUQsQ0FBbEIsQ0FEOEIsQ0FHOUI7O01BQ0EsSUFBRyxFQUFFLENBQUMsUUFBSCxLQUFnQixDQUFuQixFQUFzQjtRQUNwQjtNQUNEOztNQUVELGFBQWEsR0FBRyxFQUFFLENBQUMsUUFBbkI7TUFFQSxJQUFJLEdBQUcsRUFB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K0IsQ0FHL0I7O01BQ0EsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsT0FBakIsR0FBMEIsR0FBMUIsQ0FKK0IsQ0FLL0I7O01BQ0EsVUFBVSxDQUFDLFlBQVc7UUFBRSxVQUFVLENBQUMsS0FBWCxDQUFpQixPQUFqQixHQUEwQixHQUExQjtNQUFnQyxDQUE5QyxFQUFnRCxJQUFoRCxDQUFWLENBTitCLENBTy9COztNQUNBLFNBQVMsQ0FBQyxTQUFWLENBQW9CLE1BQXBCLENBQTJCLGVBQTNCO0lBQ0gsQ0FURDtFQVVIO0FBRUo7O0FBQUE7Ozs7Ozs7Ozs7QUNwQ2MsU0FBUyxlQUFULEdBQTJCO0VBRXhDLElBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQix5Q0FBMUIsQ0FBckI7RUFFQSxLQUFLLENBQUMsU0FBTixDQUFnQixPQUFoQixDQUF3QixJQUF4QixDQUE2QixjQUE3QixFQUE2QyxVQUFTLEVBQVQsRUFBYSxDQUFiLEVBQWU7SUFFMUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxRQUFKLENBQWE7TUFDMUIsT0FBTyxFQUFFLEVBRGlCO01BRTFCLE9BQU8sRUFBRSxtQkFBVztRQUNsQixFQUFFLENBQUMsU0FBSCxDQUFhLEdBQWIsQ0FBaUIsVUFBakI7TUFDRCxDQUp5QjtNQUsxQixNQUFNLEVBQUU7SUFMa0IsQ0FBYixDQUFmO0VBUUQsQ0FWRDtBQVdEOztBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gbGlicmFyaWVzXG5pbXBvcnQgWmVuU2Nyb2xsIGZyb20gJy4vbGlicy96ZW5zY3JvbGwnO1xuaW1wb3J0IFdheVBvaW50cyBmcm9tICcuL2xpYnMvd2F5cG9pbnRzJztcbmltcG9ydCBQaG90b1N3aXBlIGZyb20gJy4vbGlicy9waG90b3N3aXBlJztcbmltcG9ydCBQaG90b1N3aXBlVUlfRGVmYXVsdCBmcm9tICcuL2xpYnMvcGhvdG9zd2lwZS11aS1kZWZhdWx0JztcblxuLy8gbW9kdWxlc1xuaW1wb3J0IFByaW1hcnlOYXYgZnJvbSAnLi9tb2R1bGVzL3ByaW1hcnktbmF2JztcblByaW1hcnlOYXYoKTtcblxuaW1wb3J0IFRpbWVsaW5lTG9hZGluZyBmcm9tICcuL21vZHVsZXMvdGltZWxpbmUtbG9hZGluZyc7XG5UaW1lbGluZUxvYWRpbmcoKTtcblxuLy8gUGhvdG9zd2lwZVxuICB2YXIgaW5pdFBob3RvU3dpcGVGcm9tRE9NID0gZnVuY3Rpb24oZ2FsbGVyeVNlbGVjdG9yKSB7XG5cbiAgICAgIHZhciBwYXJzZVRodW1ibmFpbEVsZW1lbnRzID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICB2YXIgdGh1bWJFbGVtZW50cyA9IGVsLmNoaWxkTm9kZXMsXG4gICAgICAgICAgICAgIG51bU5vZGVzID0gdGh1bWJFbGVtZW50cy5sZW5ndGgsXG4gICAgICAgICAgICAgIGl0ZW1zID0gW10sXG4gICAgICAgICAgICAgIGVsLFxuICAgICAgICAgICAgICBjaGlsZEVsZW1lbnRzLFxuICAgICAgICAgICAgICB0aHVtYm5haWxFbCxcbiAgICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgICAgICAgaXRlbTtcblxuICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBudW1Ob2RlczsgaSsrKSB7XG4gICAgICAgICAgICAgIGVsID0gdGh1bWJFbGVtZW50c1tpXTtcblxuICAgICAgICAgICAgICAvLyBpbmNsdWRlIG9ubHkgZWxlbWVudCBub2Rlc1xuICAgICAgICAgICAgICBpZihlbC5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2hpbGRFbGVtZW50cyA9IGVsLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICAgIHNpemUgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2l6ZScpLnNwbGl0KCd4Jyk7XG5cbiAgICAgICAgICAgICAgLy8gY3JlYXRlIHNsaWRlIG9iamVjdFxuICAgICAgICAgICAgICBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgc3JjOiBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSxcbiAgICAgICAgICAgICAgICAgIHc6IHBhcnNlSW50KHNpemVbMF0sIDEwKSxcbiAgICAgICAgICAgICAgICAgIGg6IHBhcnNlSW50KHNpemVbMV0sIDEwKSxcbiAgICAgICAgICAgICAgICAgIGF1dGhvcjogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWF1dGhvcicpXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgaXRlbS5lbCA9IGVsOyAvLyBzYXZlIGxpbmsgdG8gZWxlbWVudCBmb3IgZ2V0VGh1bWJCb3VuZHNGblxuXG4gICAgICAgICAgICAgIGlmKGNoaWxkRWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGl0ZW0ubXNyYyA9IGNoaWxkRWxlbWVudHNbMF0uZ2V0QXR0cmlidXRlKCdzcmMnKTsgLy8gdGh1bWJuYWlsIHVybFxuICAgICAgICAgICAgICAgIGlmKGNoaWxkRWxlbWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnRpdGxlID0gY2hpbGRFbGVtZW50c1sxXS5pbm5lckhUTUw7IC8vIGNhcHRpb24gKGNvbnRlbnRzIG9mIGZpZ3VyZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgIHZhciBtZWRpdW1TcmMgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWVkJyk7XG4gICAgICAgICAgICAgICAgaWYobWVkaXVtU3JjKSB7XG4gICAgICAgICAgICAgICAgICBzaXplID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW1lZC1zaXplJykuc3BsaXQoJ3gnKTtcbiAgICAgICAgICAgICAgICAgIC8vIFwibWVkaXVtLXNpemVkXCIgaW1hZ2VcbiAgICAgICAgICAgICAgICAgIGl0ZW0ubSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogbWVkaXVtU3JjLFxuICAgICAgICAgICAgICAgICAgICAgICAgdzogcGFyc2VJbnQoc2l6ZVswXSwgMTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgaDogcGFyc2VJbnQoc2l6ZVsxXSwgMTApXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBvcmlnaW5hbCBpbWFnZVxuICAgICAgICAgICAgICAgIGl0ZW0ubyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBpdGVtLnNyYyxcbiAgICAgICAgICAgICAgICAgICAgdzogaXRlbS53LFxuICAgICAgICAgICAgICAgICAgICBoOiBpdGVtLmhcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgfTtcblxuICAgICAgLy8gZmluZCBuZWFyZXN0IHBhcmVudCBlbGVtZW50XG4gICAgICB2YXIgY2xvc2VzdCA9IGZ1bmN0aW9uIGNsb3Nlc3QoZWwsIGZuKSB7XG4gICAgICAgICAgcmV0dXJuIGVsICYmICggZm4oZWwpID8gZWwgOiBjbG9zZXN0KGVsLnBhcmVudE5vZGUsIGZuKSApO1xuICAgICAgfTtcblxuICAgICAgdmFyIG9uVGh1bWJuYWlsc0NsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0ID8gZS5wcmV2ZW50RGVmYXVsdCgpIDogZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgdmFyIGVUYXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG5cbiAgICAgICAgICB2YXIgY2xpY2tlZExpc3RJdGVtID0gY2xvc2VzdChlVGFyZ2V0LCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ0EnO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYoIWNsaWNrZWRMaXN0SXRlbSkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGNsaWNrZWRHYWxsZXJ5ID0gY2xpY2tlZExpc3RJdGVtLnBhcmVudE5vZGU7XG5cbiAgICAgICAgICB2YXIgY2hpbGROb2RlcyA9IGNsaWNrZWRMaXN0SXRlbS5wYXJlbnROb2RlLmNoaWxkTm9kZXMsXG4gICAgICAgICAgICAgIG51bUNoaWxkTm9kZXMgPSBjaGlsZE5vZGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgbm9kZUluZGV4ID0gMCxcbiAgICAgICAgICAgICAgaW5kZXg7XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUNoaWxkTm9kZXM7IGkrKykge1xuICAgICAgICAgICAgICBpZihjaGlsZE5vZGVzW2ldLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmKGNoaWxkTm9kZXNbaV0gPT09IGNsaWNrZWRMaXN0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgaW5kZXggPSBub2RlSW5kZXg7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBub2RlSW5kZXgrKztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihpbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgIG9wZW5QaG90b1N3aXBlKCBpbmRleCwgY2xpY2tlZEdhbGxlcnkgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcblxuICAgICAgdmFyIHBob3Rvc3dpcGVQYXJzZUhhc2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSxcbiAgICAgICAgICBwYXJhbXMgPSB7fTtcblxuICAgICAgICAgIGlmKGhhc2gubGVuZ3RoIDwgNSkgeyAvLyBwaWQ9MVxuICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciB2YXJzID0gaGFzaC5zcGxpdCgnJicpO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBpZighdmFyc1tpXSkge1xuICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFyIHBhaXIgPSB2YXJzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICAgIGlmKHBhaXIubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGFyYW1zW3BhaXJbMF1dID0gcGFpclsxXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihwYXJhbXMuZ2lkKSB7XG4gICAgICAgICAgICAgIHBhcmFtcy5naWQgPSBwYXJzZUludChwYXJhbXMuZ2lkLCAxMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICAgIH07XG5cbiAgICAgIHZhciBvcGVuUGhvdG9Td2lwZSA9IGZ1bmN0aW9uKGluZGV4LCBnYWxsZXJ5RWxlbWVudCwgZGlzYWJsZUFuaW1hdGlvbiwgZnJvbVVSTCkge1xuICAgICAgICAgIHZhciBwc3dwRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wc3dwJylbMF0sXG4gICAgICAgICAgICAgIGdhbGxlcnksXG4gICAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICAgIGl0ZW1zO1xuXG4gICAgICAgICAgaXRlbXMgPSBwYXJzZVRodW1ibmFpbEVsZW1lbnRzKGdhbGxlcnlFbGVtZW50KTtcblxuICAgICAgICAgIC8vIGRlZmluZSBvcHRpb25zIChpZiBuZWVkZWQpXG4gICAgICAgICAgb3B0aW9ucyA9IHtcblxuICAgICAgICAgICAgICBnYWxsZXJ5VUlEOiBnYWxsZXJ5RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHN3cC11aWQnKSxcblxuICAgICAgICAgICAgICBnZXRUaHVtYkJvdW5kc0ZuOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgICAgICAgLy8gU2VlIE9wdGlvbnMtPmdldFRodW1iQm91bmRzRm4gc2VjdGlvbiBvZiBkb2NzIGZvciBtb3JlIGluZm9cbiAgICAgICAgICAgICAgICAgIHZhciB0aHVtYm5haWwgPSBpdGVtc1tpbmRleF0uZWwuY2hpbGRyZW5bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgcGFnZVlTY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCxcbiAgICAgICAgICAgICAgICAgICAgICByZWN0ID0gdGh1bWJuYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgICByZXR1cm4ge3g6cmVjdC5sZWZ0LCB5OnJlY3QudG9wICsgcGFnZVlTY3JvbGwsIHc6cmVjdC53aWR0aH07XG4gICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgYWRkQ2FwdGlvbkhUTUxGbjogZnVuY3Rpb24oaXRlbSwgY2FwdGlvbkVsLCBpc0Zha2UpIHtcbiAgICAgICAgICAgICAgICAgIGlmKCFpdGVtLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FwdGlvbkVsLmNoaWxkcmVuWzBdLmlubmVyVGV4dCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGNhcHRpb25FbC5jaGlsZHJlblswXS5pbm5lckhUTUwgPSBpdGVtLnRpdGxlICsgICc8YnIvPjxzbWFsbD5QaG90bzogJyArIGl0ZW0uYXV0aG9yICsgJzwvc21hbGw+JztcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICB9O1xuXG5cbiAgICAgICAgICBpZihmcm9tVVJMKSB7XG4gICAgICAgICAgICAgIGlmKG9wdGlvbnMuZ2FsbGVyeVBJRHMpIHtcbiAgICAgICAgICAgICAgICAgIC8vIHBhcnNlIHJlYWwgaW5kZXggd2hlbiBjdXN0b20gUElEcyBhcmUgdXNlZFxuICAgICAgICAgICAgICAgICAgLy8gaHR0cDovL3Bob3Rvc3dpcGUuY29tL2RvY3VtZW50YXRpb24vZmFxLmh0bWwjY3VzdG9tLXBpZC1pbi11cmxcbiAgICAgICAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBpdGVtcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgIGlmKGl0ZW1zW2pdLnBpZCA9PSBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmluZGV4ID0gajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgb3B0aW9ucy5pbmRleCA9IHBhcnNlSW50KGluZGV4LCAxMCkgLSAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb3B0aW9ucy5pbmRleCA9IHBhcnNlSW50KGluZGV4LCAxMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZXhpdCBpZiBpbmRleCBub3QgZm91bmRcbiAgICAgICAgICBpZiggaXNOYU4ob3B0aW9ucy5pbmRleCkgKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihkaXNhYmxlQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICAgIG9wdGlvbnMuc2hvd0FuaW1hdGlvbkR1cmF0aW9uID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQYXNzIGRhdGEgdG8gUGhvdG9Td2lwZSBhbmQgaW5pdGlhbGl6ZSBpdFxuICAgICAgICAgIGdhbGxlcnkgPSBuZXcgUGhvdG9Td2lwZSggcHN3cEVsZW1lbnQsIFBob3RvU3dpcGVVSV9EZWZhdWx0LCBpdGVtcywgb3B0aW9ucyk7XG5cbiAgICAgICAgICAvLyBzZWU6IGh0dHA6Ly9waG90b3N3aXBlLmNvbS9kb2N1bWVudGF0aW9uL3Jlc3BvbnNpdmUtaW1hZ2VzLmh0bWxcbiAgICAgICAgICB2YXIgcmVhbFZpZXdwb3J0V2lkdGgsXG4gICAgICAgICAgICAgIHVzZUxhcmdlSW1hZ2VzID0gZmFsc2UsXG4gICAgICAgICAgICAgIGZpcnN0UmVzaXplID0gdHJ1ZSxcbiAgICAgICAgICAgICAgaW1hZ2VTcmNXaWxsQ2hhbmdlO1xuXG4gICAgICAgICAgZ2FsbGVyeS5saXN0ZW4oJ2JlZm9yZVJlc2l6ZScsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgIHZhciBkcGlSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID8gd2luZG93LmRldmljZVBpeGVsUmF0aW8gOiAxO1xuICAgICAgICAgICAgICBkcGlSYXRpbyA9IE1hdGgubWluKGRwaVJhdGlvLCAyLjUpO1xuICAgICAgICAgICAgICByZWFsVmlld3BvcnRXaWR0aCA9IGdhbGxlcnkudmlld3BvcnRTaXplLnggKiBkcGlSYXRpbztcblxuXG4gICAgICAgICAgICAgIGlmKHJlYWxWaWV3cG9ydFdpZHRoID49IDEyMDAgfHwgKCFnYWxsZXJ5Lmxpa2VseVRvdWNoRGV2aWNlICYmIHJlYWxWaWV3cG9ydFdpZHRoID4gODAwKSB8fCBzY3JlZW4ud2lkdGggPiAxMjAwICkge1xuICAgICAgICAgICAgICAgICAgaWYoIXVzZUxhcmdlSW1hZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdXNlTGFyZ2VJbWFnZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgIGltYWdlU3JjV2lsbENoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmKHVzZUxhcmdlSW1hZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdXNlTGFyZ2VJbWFnZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICBpbWFnZVNyY1dpbGxDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYoaW1hZ2VTcmNXaWxsQ2hhbmdlICYmICFmaXJzdFJlc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgZ2FsbGVyeS5pbnZhbGlkYXRlQ3Vyckl0ZW1zKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZihmaXJzdFJlc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgZmlyc3RSZXNpemUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGltYWdlU3JjV2lsbENoYW5nZSA9IGZhbHNlO1xuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBnYWxsZXJ5Lmxpc3RlbignZ2V0dGluZ0RhdGEnLCBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgICBpZiggdXNlTGFyZ2VJbWFnZXMgKSB7XG4gICAgICAgICAgICAgICAgICBpdGVtLnNyYyA9IGl0ZW0uby5zcmM7XG4gICAgICAgICAgICAgICAgICBpdGVtLncgPSBpdGVtLm8udztcbiAgICAgICAgICAgICAgICAgIGl0ZW0uaCA9IGl0ZW0uby5oO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaXRlbS5zcmMgPSBpdGVtLm0uc3JjO1xuICAgICAgICAgICAgICAgICAgaXRlbS53ID0gaXRlbS5tLnc7XG4gICAgICAgICAgICAgICAgICBpdGVtLmggPSBpdGVtLm0uaDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgZ2FsbGVyeS5pbml0KCk7XG4gICAgICB9O1xuXG4gICAgICAvLyBzZWxlY3QgYWxsIGdhbGxlcnkgZWxlbWVudHNcbiAgICAgIHZhciBnYWxsZXJ5RWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBnYWxsZXJ5U2VsZWN0b3IgKTtcbiAgICAgIGZvcih2YXIgaSA9IDAsIGwgPSBnYWxsZXJ5RWxlbWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgZ2FsbGVyeUVsZW1lbnRzW2ldLnNldEF0dHJpYnV0ZSgnZGF0YS1wc3dwLXVpZCcsIGkrMSk7XG4gICAgICAgICAgZ2FsbGVyeUVsZW1lbnRzW2ldLm9uY2xpY2sgPSBvblRodW1ibmFpbHNDbGljaztcbiAgICAgIH1cblxuICAgICAgLy8gUGFyc2UgVVJMIGFuZCBvcGVuIGdhbGxlcnkgaWYgaXQgY29udGFpbnMgIyZwaWQ9MyZnaWQ9MVxuICAgICAgdmFyIGhhc2hEYXRhID0gcGhvdG9zd2lwZVBhcnNlSGFzaCgpO1xuICAgICAgaWYoaGFzaERhdGEucGlkICYmIGhhc2hEYXRhLmdpZCkge1xuICAgICAgICAgIG9wZW5QaG90b1N3aXBlKCBoYXNoRGF0YS5waWQsICBnYWxsZXJ5RWxlbWVudHNbIGhhc2hEYXRhLmdpZCAtIDEgXSwgdHJ1ZSwgdHJ1ZSApO1xuICAgICAgfVxuICB9O1xuXG4gIGluaXRQaG90b1N3aXBlRnJvbURPTSgnLmdhbGxlcnknKTtcbiIsIi8qISBQaG90b1N3aXBlIERlZmF1bHQgVUkgLSA0LjEuMSAtIDIwMTUtMTItMjRcbiogaHR0cDovL3Bob3Rvc3dpcGUuY29tXG4qIENvcHlyaWdodCAoYykgMjAxNSBEbWl0cnkgU2VtZW5vdjsgKi9cbi8qKlxuKlxuKiBVSSBvbiB0b3Agb2YgbWFpbiBzbGlkaW5nIGFyZWEgKGNhcHRpb24sIGFycm93cywgY2xvc2UgYnV0dG9uLCBldGMuKS5cbiogQnVpbHQganVzdCB1c2luZyBwdWJsaWMgbWV0aG9kcy9wcm9wZXJ0aWVzIG9mIFBob3RvU3dpcGUuXG4qXG4qL1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5QaG90b1N3aXBlVUlfRGVmYXVsdCA9IGZhY3RvcnkoKTtcbiAgfVxufSkodGhpcywgZnVuY3Rpb24gKCkge1xuXG4gICd1c2Ugc3RyaWN0JztcblxuXG5cbnZhciBQaG90b1N3aXBlVUlfRGVmYXVsdCA9XG4gZnVuY3Rpb24ocHN3cCwgZnJhbWV3b3JrKSB7XG5cbiAgdmFyIHVpID0gdGhpcztcbiAgdmFyIF9vdmVybGF5VUlVcGRhdGVkID0gZmFsc2UsXG4gICAgX2NvbnRyb2xzVmlzaWJsZSA9IHRydWUsXG4gICAgX2Z1bGxzY3JlbkFQSSxcbiAgICBfY29udHJvbHMsXG4gICAgX2NhcHRpb25Db250YWluZXIsXG4gICAgX2Zha2VDYXB0aW9uQ29udGFpbmVyLFxuICAgIF9pbmRleEluZGljYXRvcixcbiAgICBfc2hhcmVCdXR0b24sXG4gICAgX3NoYXJlTW9kYWwsXG4gICAgX3NoYXJlTW9kYWxIaWRkZW4gPSB0cnVlLFxuICAgIF9pbml0YWxDbG9zZU9uU2Nyb2xsVmFsdWUsXG4gICAgX2lzSWRsZSxcbiAgICBfbGlzdGVuLFxuXG4gICAgX2xvYWRpbmdJbmRpY2F0b3IsXG4gICAgX2xvYWRpbmdJbmRpY2F0b3JIaWRkZW4sXG4gICAgX2xvYWRpbmdJbmRpY2F0b3JUaW1lb3V0LFxuXG4gICAgX2dhbGxlcnlIYXNPbmVTbGlkZSxcblxuICAgIF9vcHRpb25zLFxuICAgIF9kZWZhdWx0VUlPcHRpb25zID0ge1xuICAgICAgYmFyc1NpemU6IHt0b3A6NDQsIGJvdHRvbTonYXV0byd9LFxuICAgICAgY2xvc2VFbENsYXNzZXM6IFsnaXRlbScsICdjYXB0aW9uJywgJ3pvb20td3JhcCcsICd1aScsICd0b3AtYmFyJ10sXG4gICAgICB0aW1lVG9JZGxlOiA0MDAwLFxuICAgICAgdGltZVRvSWRsZU91dHNpZGU6IDEwMDAsXG4gICAgICBsb2FkaW5nSW5kaWNhdG9yRGVsYXk6IDEwMDAsIC8vIDJzXG5cbiAgICAgIGFkZENhcHRpb25IVE1MRm46IGZ1bmN0aW9uKGl0ZW0sIGNhcHRpb25FbCAvKiwgaXNGYWtlICovKSB7XG4gICAgICAgIGlmKCFpdGVtLnRpdGxlKSB7XG4gICAgICAgICAgY2FwdGlvbkVsLmNoaWxkcmVuWzBdLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjYXB0aW9uRWwuY2hpbGRyZW5bMF0uaW5uZXJIVE1MID0gaXRlbS50aXRsZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuXG4gICAgICBjbG9zZUVsOnRydWUsXG4gICAgICBjYXB0aW9uRWw6IHRydWUsXG4gICAgICBmdWxsc2NyZWVuRWw6IHRydWUsXG4gICAgICB6b29tRWw6IHRydWUsXG4gICAgICBzaGFyZUVsOiB0cnVlLFxuICAgICAgY291bnRlckVsOiB0cnVlLFxuICAgICAgYXJyb3dFbDogdHJ1ZSxcbiAgICAgIHByZWxvYWRlckVsOiB0cnVlLFxuXG4gICAgICB0YXBUb0Nsb3NlOiBmYWxzZSxcbiAgICAgIHRhcFRvVG9nZ2xlQ29udHJvbHM6IHRydWUsXG5cbiAgICAgIGNsaWNrVG9DbG9zZU5vblpvb21hYmxlOiB0cnVlLFxuXG4gICAgICBzaGFyZUJ1dHRvbnM6IFtcbiAgICAgICAge2lkOidmYWNlYm9vaycsIGxhYmVsOidTaGFyZSBvbiBGYWNlYm9vaycsIHVybDonaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9e3t1cmx9fSd9LFxuICAgICAgICB7aWQ6J3R3aXR0ZXInLCBsYWJlbDonVHdlZXQnLCB1cmw6J2h0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9e3t0ZXh0fX0mdXJsPXt7dXJsfX0nfSxcbiAgICAgICAge2lkOidkb3dubG9hZCcsIGxhYmVsOidEb3dubG9hZCBpbWFnZScsIHVybDone3tyYXdfaW1hZ2VfdXJsfX0nLCBkb3dubG9hZDp0cnVlfVxuICAgICAgXSxcbiAgICAgIGdldEltYWdlVVJMRm9yU2hhcmU6IGZ1bmN0aW9uKCAvKiBzaGFyZUJ1dHRvbkRhdGEgKi8gKSB7XG4gICAgICAgIHJldHVybiBwc3dwLmN1cnJJdGVtLnNyYyB8fCAnJztcbiAgICAgIH0sXG4gICAgICBnZXRQYWdlVVJMRm9yU2hhcmU6IGZ1bmN0aW9uKCAvKiBzaGFyZUJ1dHRvbkRhdGEgKi8gKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgIH0sXG4gICAgICBnZXRUZXh0Rm9yU2hhcmU6IGZ1bmN0aW9uKCAvKiBzaGFyZUJ1dHRvbkRhdGEgKi8gKSB7XG4gICAgICAgIHJldHVybiBwc3dwLmN1cnJJdGVtLnRpdGxlIHx8ICcnO1xuICAgICAgfSxcblxuICAgICAgaW5kZXhJbmRpY2F0b3JTZXA6ICcgLyAnLFxuICAgICAgZml0Q29udHJvbHNXaWR0aDogMTIwMFxuXG4gICAgfSxcbiAgICBfYmxvY2tDb250cm9sc1RhcCxcbiAgICBfYmxvY2tDb250cm9sc1RhcFRpbWVvdXQ7XG5cblxuXG4gIHZhciBfb25Db250cm9sc1RhcCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmKF9ibG9ja0NvbnRyb2xzVGFwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG5cbiAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblxuICAgICAgaWYoX29wdGlvbnMudGltZVRvSWRsZSAmJiBfb3B0aW9ucy5tb3VzZVVzZWQgJiYgIV9pc0lkbGUpIHtcbiAgICAgICAgLy8gcmVzZXQgaWRsZSB0aW1lclxuICAgICAgICBfb25JZGxlTW91c2VNb3ZlKCk7XG4gICAgICB9XG5cblxuICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgdWlFbGVtZW50LFxuICAgICAgICBjbGlja2VkQ2xhc3MgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdjbGFzcycpIHx8ICcnLFxuICAgICAgICBmb3VuZDtcblxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IF91aUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHVpRWxlbWVudCA9IF91aUVsZW1lbnRzW2ldO1xuICAgICAgICBpZih1aUVsZW1lbnQub25UYXAgJiYgY2xpY2tlZENsYXNzLmluZGV4T2YoJ3Bzd3BfXycgKyB1aUVsZW1lbnQubmFtZSApID4gLTEgKSB7XG4gICAgICAgICAgdWlFbGVtZW50Lm9uVGFwKCk7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoZm91bmQpIHtcbiAgICAgICAgaWYoZS5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIF9ibG9ja0NvbnRyb2xzVGFwID0gdHJ1ZTtcblxuICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEFuZHJvaWQgZG9uJ3QgcHJldmVudCBnaG9zdCBjbGljayBldmVudFxuICAgICAgICAvLyB3aGVuIHByZXZlbnREZWZhdWx0KCkgd2FzIGNhbGxlZCBvbiB0b3VjaHN0YXJ0IGFuZC9vciB0b3VjaGVuZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhpcyBoYXBwZW5zIG9uIHY0LjMsIDQuMiwgNC4xLFxuICAgICAgICAvLyBvbGRlciB2ZXJzaW9ucyBzdHJhbmdlbHkgd29yayBjb3JyZWN0bHksXG4gICAgICAgIC8vIGJ1dCBqdXN0IGluIGNhc2Ugd2UgYWRkIGRlbGF5IG9uIGFsbCBvZiB0aGVtKVxuICAgICAgICB2YXIgdGFwRGVsYXkgPSBmcmFtZXdvcmsuZmVhdHVyZXMuaXNPbGRBbmRyb2lkID8gNjAwIDogMzA7XG4gICAgICAgIF9ibG9ja0NvbnRyb2xzVGFwVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX2Jsb2NrQ29udHJvbHNUYXAgPSBmYWxzZTtcbiAgICAgICAgfSwgdGFwRGVsYXkpO1xuICAgICAgfVxuXG4gICAgfSxcbiAgICBfZml0Q29udHJvbHNJblZpZXdwb3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXBzd3AubGlrZWx5VG91Y2hEZXZpY2UgfHwgX29wdGlvbnMubW91c2VVc2VkIHx8IHNjcmVlbi53aWR0aCA+IF9vcHRpb25zLmZpdENvbnRyb2xzV2lkdGg7XG4gICAgfSxcbiAgICBfdG9nZ2xlUHN3cENsYXNzID0gZnVuY3Rpb24oZWwsIGNOYW1lLCBhZGQpIHtcbiAgICAgIGZyYW1ld29ya1sgKGFkZCA/ICdhZGQnIDogJ3JlbW92ZScpICsgJ0NsYXNzJyBdKGVsLCAncHN3cF9fJyArIGNOYW1lKTtcbiAgICB9LFxuXG4gICAgLy8gYWRkIGNsYXNzIHdoZW4gdGhlcmUgaXMganVzdCBvbmUgaXRlbSBpbiB0aGUgZ2FsbGVyeVxuICAgIC8vIChieSBkZWZhdWx0IGl0IGhpZGVzIGxlZnQvcmlnaHQgYXJyb3dzIGFuZCAxb2ZYIGNvdW50ZXIpXG4gICAgX2NvdW50TnVtSXRlbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoYXNPbmVTbGlkZSA9IChfb3B0aW9ucy5nZXROdW1JdGVtc0ZuKCkgPT09IDEpO1xuXG4gICAgICBpZihoYXNPbmVTbGlkZSAhPT0gX2dhbGxlcnlIYXNPbmVTbGlkZSkge1xuICAgICAgICBfdG9nZ2xlUHN3cENsYXNzKF9jb250cm9scywgJ3VpLS1vbmUtc2xpZGUnLCBoYXNPbmVTbGlkZSk7XG4gICAgICAgIF9nYWxsZXJ5SGFzT25lU2xpZGUgPSBoYXNPbmVTbGlkZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF90b2dnbGVTaGFyZU1vZGFsQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgIF90b2dnbGVQc3dwQ2xhc3MoX3NoYXJlTW9kYWwsICdzaGFyZS1tb2RhbC0taGlkZGVuJywgX3NoYXJlTW9kYWxIaWRkZW4pO1xuICAgIH0sXG4gICAgX3RvZ2dsZVNoYXJlTW9kYWwgPSBmdW5jdGlvbigpIHtcblxuICAgICAgX3NoYXJlTW9kYWxIaWRkZW4gPSAhX3NoYXJlTW9kYWxIaWRkZW47XG5cblxuICAgICAgaWYoIV9zaGFyZU1vZGFsSGlkZGVuKSB7XG4gICAgICAgIF90b2dnbGVTaGFyZU1vZGFsQ2xhc3MoKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZighX3NoYXJlTW9kYWxIaWRkZW4pIHtcbiAgICAgICAgICAgIGZyYW1ld29yay5hZGRDbGFzcyhfc2hhcmVNb2RhbCwgJ3Bzd3BfX3NoYXJlLW1vZGFsLS1mYWRlLWluJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAzMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcmFtZXdvcmsucmVtb3ZlQ2xhc3MoX3NoYXJlTW9kYWwsICdwc3dwX19zaGFyZS1tb2RhbC0tZmFkZS1pbicpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmKF9zaGFyZU1vZGFsSGlkZGVuKSB7XG4gICAgICAgICAgICBfdG9nZ2xlU2hhcmVNb2RhbENsYXNzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAzMDApO1xuICAgICAgfVxuXG4gICAgICBpZighX3NoYXJlTW9kYWxIaWRkZW4pIHtcbiAgICAgICAgX3VwZGF0ZVNoYXJlVVJMcygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBfb3BlbldpbmRvd1BvcHVwID0gZnVuY3Rpb24oZSkge1xuICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcblxuICAgICAgcHN3cC5zaG91dCgnc2hhcmVMaW5rQ2xpY2snLCBlLCB0YXJnZXQpO1xuXG4gICAgICBpZighdGFyZ2V0LmhyZWYpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiggdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZG93bmxvYWQnKSApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5vcGVuKHRhcmdldC5ocmVmLCAncHN3cF9zaGFyZScsICdzY3JvbGxiYXJzPXllcyxyZXNpemFibGU9eWVzLHRvb2xiYXI9bm8sJytcbiAgICAgICAgICAgICAgICAgICAgJ2xvY2F0aW9uPXllcyx3aWR0aD01NTAsaGVpZ2h0PTQyMCx0b3A9MTAwLGxlZnQ9JyArXG4gICAgICAgICAgICAgICAgICAgICh3aW5kb3cuc2NyZWVuID8gTWF0aC5yb3VuZChzY3JlZW4ud2lkdGggLyAyIC0gMjc1KSA6IDEwMCkgICk7XG5cbiAgICAgIGlmKCFfc2hhcmVNb2RhbEhpZGRlbikge1xuICAgICAgICBfdG9nZ2xlU2hhcmVNb2RhbCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBfdXBkYXRlU2hhcmVVUkxzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2hhcmVCdXR0b25PdXQgPSAnJyxcbiAgICAgICAgc2hhcmVCdXR0b25EYXRhLFxuICAgICAgICBzaGFyZVVSTCxcbiAgICAgICAgaW1hZ2VfdXJsLFxuICAgICAgICBwYWdlX3VybCxcbiAgICAgICAgc2hhcmVfdGV4dDtcblxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IF9vcHRpb25zLnNoYXJlQnV0dG9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzaGFyZUJ1dHRvbkRhdGEgPSBfb3B0aW9ucy5zaGFyZUJ1dHRvbnNbaV07XG5cbiAgICAgICAgaW1hZ2VfdXJsID0gX29wdGlvbnMuZ2V0SW1hZ2VVUkxGb3JTaGFyZShzaGFyZUJ1dHRvbkRhdGEpO1xuICAgICAgICBwYWdlX3VybCA9IF9vcHRpb25zLmdldFBhZ2VVUkxGb3JTaGFyZShzaGFyZUJ1dHRvbkRhdGEpO1xuICAgICAgICBzaGFyZV90ZXh0ID0gX29wdGlvbnMuZ2V0VGV4dEZvclNoYXJlKHNoYXJlQnV0dG9uRGF0YSk7XG5cbiAgICAgICAgc2hhcmVVUkwgPSBzaGFyZUJ1dHRvbkRhdGEudXJsLnJlcGxhY2UoJ3t7dXJsfX0nLCBlbmNvZGVVUklDb21wb25lbnQocGFnZV91cmwpIClcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCd7e2ltYWdlX3VybH19JywgZW5jb2RlVVJJQ29tcG9uZW50KGltYWdlX3VybCkgKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJ3t7cmF3X2ltYWdlX3VybH19JywgaW1hZ2VfdXJsIClcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCd7e3RleHR9fScsIGVuY29kZVVSSUNvbXBvbmVudChzaGFyZV90ZXh0KSApO1xuXG4gICAgICAgIHNoYXJlQnV0dG9uT3V0ICs9ICc8YSBocmVmPVwiJyArIHNoYXJlVVJMICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiICcrXG4gICAgICAgICAgICAgICAgICAnY2xhc3M9XCJwc3dwX19zaGFyZS0tJyArIHNoYXJlQnV0dG9uRGF0YS5pZCArICdcIicgK1xuICAgICAgICAgICAgICAgICAgKHNoYXJlQnV0dG9uRGF0YS5kb3dubG9hZCA/ICdkb3dubG9hZCcgOiAnJykgKyAnPicgK1xuICAgICAgICAgICAgICAgICAgc2hhcmVCdXR0b25EYXRhLmxhYmVsICsgJzwvYT4nO1xuXG4gICAgICAgIGlmKF9vcHRpb25zLnBhcnNlU2hhcmVCdXR0b25PdXQpIHtcbiAgICAgICAgICBzaGFyZUJ1dHRvbk91dCA9IF9vcHRpb25zLnBhcnNlU2hhcmVCdXR0b25PdXQoc2hhcmVCdXR0b25EYXRhLCBzaGFyZUJ1dHRvbk91dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF9zaGFyZU1vZGFsLmNoaWxkcmVuWzBdLmlubmVySFRNTCA9IHNoYXJlQnV0dG9uT3V0O1xuICAgICAgX3NoYXJlTW9kYWwuY2hpbGRyZW5bMF0ub25jbGljayA9IF9vcGVuV2luZG93UG9wdXA7XG5cbiAgICB9LFxuICAgIF9oYXNDbG9zZUNsYXNzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBmb3IodmFyICBpID0gMDsgaSA8IF9vcHRpb25zLmNsb3NlRWxDbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmKCBmcmFtZXdvcmsuaGFzQ2xhc3ModGFyZ2V0LCAncHN3cF9fJyArIF9vcHRpb25zLmNsb3NlRWxDbGFzc2VzW2ldKSApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgX2lkbGVJbnRlcnZhbCxcbiAgICBfaWRsZVRpbWVyLFxuICAgIF9pZGxlSW5jcmVtZW50ID0gMCxcbiAgICBfb25JZGxlTW91c2VNb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQoX2lkbGVUaW1lcik7XG4gICAgICBfaWRsZUluY3JlbWVudCA9IDA7XG4gICAgICBpZihfaXNJZGxlKSB7XG4gICAgICAgIHVpLnNldElkbGUoZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG4gICAgX29uTW91c2VMZWF2ZVdpbmRvdyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUgPSBlID8gZSA6IHdpbmRvdy5ldmVudDtcbiAgICAgIHZhciBmcm9tID0gZS5yZWxhdGVkVGFyZ2V0IHx8IGUudG9FbGVtZW50O1xuICAgICAgaWYgKCFmcm9tIHx8IGZyb20ubm9kZU5hbWUgPT09ICdIVE1MJykge1xuICAgICAgICBjbGVhclRpbWVvdXQoX2lkbGVUaW1lcik7XG4gICAgICAgIF9pZGxlVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHVpLnNldElkbGUodHJ1ZSk7XG4gICAgICAgIH0sIF9vcHRpb25zLnRpbWVUb0lkbGVPdXRzaWRlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9zZXR1cEZ1bGxzY3JlZW5BUEkgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmKF9vcHRpb25zLmZ1bGxzY3JlZW5FbCAmJiAhZnJhbWV3b3JrLmZlYXR1cmVzLmlzT2xkQW5kcm9pZCkge1xuICAgICAgICBpZighX2Z1bGxzY3JlbkFQSSkge1xuICAgICAgICAgIF9mdWxsc2NyZW5BUEkgPSB1aS5nZXRGdWxsc2NyZWVuQVBJKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoX2Z1bGxzY3JlbkFQSSkge1xuICAgICAgICAgIGZyYW1ld29yay5iaW5kKGRvY3VtZW50LCBfZnVsbHNjcmVuQVBJLmV2ZW50SywgdWkudXBkYXRlRnVsbHNjcmVlbik7XG4gICAgICAgICAgdWkudXBkYXRlRnVsbHNjcmVlbigpO1xuICAgICAgICAgIGZyYW1ld29yay5hZGRDbGFzcyhwc3dwLnRlbXBsYXRlLCAncHN3cC0tc3VwcG9ydHMtZnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcmFtZXdvcmsucmVtb3ZlQ2xhc3MocHN3cC50ZW1wbGF0ZSwgJ3Bzd3AtLXN1cHBvcnRzLWZzJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIF9zZXR1cExvYWRpbmdJbmRpY2F0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFNldHVwIGxvYWRpbmcgaW5kaWNhdG9yXG4gICAgICBpZihfb3B0aW9ucy5wcmVsb2FkZXJFbCkge1xuXG4gICAgICAgIF90b2dnbGVMb2FkaW5nSW5kaWNhdG9yKHRydWUpO1xuXG4gICAgICAgIF9saXN0ZW4oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgY2xlYXJUaW1lb3V0KF9sb2FkaW5nSW5kaWNhdG9yVGltZW91dCk7XG5cbiAgICAgICAgICAvLyBkaXNwbGF5IGxvYWRpbmcgaW5kaWNhdG9yIHdpdGggZGVsYXlcbiAgICAgICAgICBfbG9hZGluZ0luZGljYXRvclRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZihwc3dwLmN1cnJJdGVtICYmIHBzd3AuY3Vyckl0ZW0ubG9hZGluZykge1xuXG4gICAgICAgICAgICAgIGlmKCAhcHN3cC5hbGxvd1Byb2dyZXNzaXZlSW1nKCkgfHwgKHBzd3AuY3Vyckl0ZW0uaW1nICYmICFwc3dwLmN1cnJJdGVtLmltZy5uYXR1cmFsV2lkdGgpICApIHtcbiAgICAgICAgICAgICAgICAvLyBzaG93IHByZWxvYWRlciBpZiBwcm9ncmVzc2l2ZSBsb2FkaW5nIGlzIG5vdCBlbmFibGVkLFxuICAgICAgICAgICAgICAgIC8vIG9yIGltYWdlIHdpZHRoIGlzIG5vdCBkZWZpbmVkIHlldCAoYmVjYXVzZSBvZiBzbG93IGNvbm5lY3Rpb24pXG4gICAgICAgICAgICAgICAgX3RvZ2dsZUxvYWRpbmdJbmRpY2F0b3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgIC8vIGl0ZW1zLWNvbnRyb2xsZXIuanMgZnVuY3Rpb24gYWxsb3dQcm9ncmVzc2l2ZUltZ1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF90b2dnbGVMb2FkaW5nSW5kaWNhdG9yKHRydWUpOyAvLyBoaWRlIHByZWxvYWRlclxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSwgX29wdGlvbnMubG9hZGluZ0luZGljYXRvckRlbGF5KTtcblxuICAgICAgICB9KTtcbiAgICAgICAgX2xpc3RlbignaW1hZ2VMb2FkQ29tcGxldGUnLCBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIGlmKHBzd3AuY3Vyckl0ZW0gPT09IGl0ZW0pIHtcbiAgICAgICAgICAgIF90b2dnbGVMb2FkaW5nSW5kaWNhdG9yKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH1cbiAgICB9LFxuICAgIF90b2dnbGVMb2FkaW5nSW5kaWNhdG9yID0gZnVuY3Rpb24oaGlkZSkge1xuICAgICAgaWYoIF9sb2FkaW5nSW5kaWNhdG9ySGlkZGVuICE9PSBoaWRlICkge1xuICAgICAgICBfdG9nZ2xlUHN3cENsYXNzKF9sb2FkaW5nSW5kaWNhdG9yLCAncHJlbG9hZGVyLS1hY3RpdmUnLCAhaGlkZSk7XG4gICAgICAgIF9sb2FkaW5nSW5kaWNhdG9ySGlkZGVuID0gaGlkZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9hcHBseU5hdkJhckdhcHMgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICB2YXIgZ2FwID0gaXRlbS52R2FwO1xuXG4gICAgICBpZiggX2ZpdENvbnRyb2xzSW5WaWV3cG9ydCgpICkge1xuXG4gICAgICAgIHZhciBiYXJzID0gX29wdGlvbnMuYmFyc1NpemU7XG4gICAgICAgIGlmKF9vcHRpb25zLmNhcHRpb25FbCAmJiBiYXJzLmJvdHRvbSA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgaWYoIV9mYWtlQ2FwdGlvbkNvbnRhaW5lcikge1xuICAgICAgICAgICAgX2Zha2VDYXB0aW9uQ29udGFpbmVyID0gZnJhbWV3b3JrLmNyZWF0ZUVsKCdwc3dwX19jYXB0aW9uIHBzd3BfX2NhcHRpb24tLWZha2UnKTtcbiAgICAgICAgICAgIF9mYWtlQ2FwdGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZCggZnJhbWV3b3JrLmNyZWF0ZUVsKCdwc3dwX19jYXB0aW9uX19jZW50ZXInKSApO1xuICAgICAgICAgICAgX2NvbnRyb2xzLmluc2VydEJlZm9yZShfZmFrZUNhcHRpb25Db250YWluZXIsIF9jYXB0aW9uQ29udGFpbmVyKTtcbiAgICAgICAgICAgIGZyYW1ld29yay5hZGRDbGFzcyhfY29udHJvbHMsICdwc3dwX191aS0tZml0Jyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKCBfb3B0aW9ucy5hZGRDYXB0aW9uSFRNTEZuKGl0ZW0sIF9mYWtlQ2FwdGlvbkNvbnRhaW5lciwgdHJ1ZSkgKSB7XG5cbiAgICAgICAgICAgIHZhciBjYXB0aW9uU2l6ZSA9IF9mYWtlQ2FwdGlvbkNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBnYXAuYm90dG9tID0gcGFyc2VJbnQoY2FwdGlvblNpemUsMTApIHx8IDQ0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnYXAuYm90dG9tID0gYmFycy50b3A7IC8vIGlmIG5vIGNhcHRpb24sIHNldCBzaXplIG9mIGJvdHRvbSBnYXAgdG8gc2l6ZSBvZiB0b3BcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZ2FwLmJvdHRvbSA9IGJhcnMuYm90dG9tID09PSAnYXV0bycgPyAwIDogYmFycy5ib3R0b207XG4gICAgICAgIH1cblxuICAgICAgICAvLyBoZWlnaHQgb2YgdG9wIGJhciBpcyBzdGF0aWMsIG5vIG5lZWQgdG8gY2FsY3VsYXRlIGl0XG4gICAgICAgIGdhcC50b3AgPSBiYXJzLnRvcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdhcC50b3AgPSBnYXAuYm90dG9tID0gMDtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9zZXR1cElkbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEhpZGUgY29udHJvbHMgd2hlbiBtb3VzZSBpcyB1c2VkXG4gICAgICBpZihfb3B0aW9ucy50aW1lVG9JZGxlKSB7XG4gICAgICAgIF9saXN0ZW4oJ21vdXNlVXNlZCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgZnJhbWV3b3JrLmJpbmQoZG9jdW1lbnQsICdtb3VzZW1vdmUnLCBfb25JZGxlTW91c2VNb3ZlKTtcbiAgICAgICAgICBmcmFtZXdvcmsuYmluZChkb2N1bWVudCwgJ21vdXNlb3V0JywgX29uTW91c2VMZWF2ZVdpbmRvdyk7XG5cbiAgICAgICAgICBfaWRsZUludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfaWRsZUluY3JlbWVudCsrO1xuICAgICAgICAgICAgaWYoX2lkbGVJbmNyZW1lbnQgPT09IDIpIHtcbiAgICAgICAgICAgICAgdWkuc2V0SWRsZSh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBfb3B0aW9ucy50aW1lVG9JZGxlIC8gMik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgX3NldHVwSGlkaW5nQ29udHJvbHNEdXJpbmdHZXN0dXJlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAvLyBIaWRlIGNvbnRyb2xzIG9uIHZlcnRpY2FsIGRyYWdcbiAgICAgIF9saXN0ZW4oJ29uVmVydGljYWxEcmFnJywgZnVuY3Rpb24obm93KSB7XG4gICAgICAgIGlmKF9jb250cm9sc1Zpc2libGUgJiYgbm93IDwgMC45NSkge1xuICAgICAgICAgIHVpLmhpZGVDb250cm9scygpO1xuICAgICAgICB9IGVsc2UgaWYoIV9jb250cm9sc1Zpc2libGUgJiYgbm93ID49IDAuOTUpIHtcbiAgICAgICAgICB1aS5zaG93Q29udHJvbHMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEhpZGUgY29udHJvbHMgd2hlbiBwaW5jaGluZyB0byBjbG9zZVxuICAgICAgdmFyIHBpbmNoQ29udHJvbHNIaWRkZW47XG4gICAgICBfbGlzdGVuKCdvblBpbmNoQ2xvc2UnICwgZnVuY3Rpb24obm93KSB7XG4gICAgICAgIGlmKF9jb250cm9sc1Zpc2libGUgJiYgbm93IDwgMC45KSB7XG4gICAgICAgICAgdWkuaGlkZUNvbnRyb2xzKCk7XG4gICAgICAgICAgcGluY2hDb250cm9sc0hpZGRlbiA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZihwaW5jaENvbnRyb2xzSGlkZGVuICYmICFfY29udHJvbHNWaXNpYmxlICYmIG5vdyA+IDAuOSkge1xuICAgICAgICAgIHVpLnNob3dDb250cm9scygpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgX2xpc3Rlbignem9vbUdlc3R1cmVFbmRlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBwaW5jaENvbnRyb2xzSGlkZGVuID0gZmFsc2U7XG4gICAgICAgIGlmKHBpbmNoQ29udHJvbHNIaWRkZW4gJiYgIV9jb250cm9sc1Zpc2libGUpIHtcbiAgICAgICAgICB1aS5zaG93Q29udHJvbHMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9O1xuXG5cblxuICB2YXIgX3VpRWxlbWVudHMgPSBbXG4gICAge1xuICAgICAgbmFtZTogJ2NhcHRpb24nLFxuICAgICAgb3B0aW9uOiAnY2FwdGlvbkVsJyxcbiAgICAgIG9uSW5pdDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgX2NhcHRpb25Db250YWluZXIgPSBlbDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdzaGFyZS1tb2RhbCcsXG4gICAgICBvcHRpb246ICdzaGFyZUVsJyxcbiAgICAgIG9uSW5pdDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgX3NoYXJlTW9kYWwgPSBlbDtcbiAgICAgIH0sXG4gICAgICBvblRhcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIF90b2dnbGVTaGFyZU1vZGFsKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnYnV0dG9uLS1zaGFyZScsXG4gICAgICBvcHRpb246ICdzaGFyZUVsJyxcbiAgICAgIG9uSW5pdDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgX3NoYXJlQnV0dG9uID0gZWw7XG4gICAgICB9LFxuICAgICAgb25UYXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBfdG9nZ2xlU2hhcmVNb2RhbCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2J1dHRvbi0tem9vbScsXG4gICAgICBvcHRpb246ICd6b29tRWwnLFxuICAgICAgb25UYXA6IHBzd3AudG9nZ2xlRGVza3RvcFpvb21cbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdjb3VudGVyJyxcbiAgICAgIG9wdGlvbjogJ2NvdW50ZXJFbCcsXG4gICAgICBvbkluaXQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIF9pbmRleEluZGljYXRvciA9IGVsO1xuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2J1dHRvbi0tY2xvc2UnLFxuICAgICAgb3B0aW9uOiAnY2xvc2VFbCcsXG4gICAgICBvblRhcDogcHN3cC5jbG9zZVxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2J1dHRvbi0tYXJyb3ctLWxlZnQnLFxuICAgICAgb3B0aW9uOiAnYXJyb3dFbCcsXG4gICAgICBvblRhcDogcHN3cC5wcmV2XG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnYnV0dG9uLS1hcnJvdy0tcmlnaHQnLFxuICAgICAgb3B0aW9uOiAnYXJyb3dFbCcsXG4gICAgICBvblRhcDogcHN3cC5uZXh0XG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAnYnV0dG9uLS1mcycsXG4gICAgICBvcHRpb246ICdmdWxsc2NyZWVuRWwnLFxuICAgICAgb25UYXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihfZnVsbHNjcmVuQVBJLmlzRnVsbHNjcmVlbigpKSB7XG4gICAgICAgICAgX2Z1bGxzY3JlbkFQSS5leGl0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2Z1bGxzY3JlbkFQSS5lbnRlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiAncHJlbG9hZGVyJyxcbiAgICAgIG9wdGlvbjogJ3ByZWxvYWRlckVsJyxcbiAgICAgIG9uSW5pdDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgX2xvYWRpbmdJbmRpY2F0b3IgPSBlbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgXTtcblxuICB2YXIgX3NldHVwVUlFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtLFxuICAgICAgY2xhc3NBdHRyLFxuICAgICAgdWlFbGVtZW50O1xuXG4gICAgdmFyIGxvb3BUaHJvdWdoQ2hpbGRFbGVtZW50cyA9IGZ1bmN0aW9uKHNDaGlsZHJlbikge1xuICAgICAgaWYoIXNDaGlsZHJlbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBsID0gc0NoaWxkcmVuLmxlbmd0aDtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IHNDaGlsZHJlbltpXTtcbiAgICAgICAgY2xhc3NBdHRyID0gaXRlbS5jbGFzc05hbWU7XG5cbiAgICAgICAgZm9yKHZhciBhID0gMDsgYSA8IF91aUVsZW1lbnRzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgICAgdWlFbGVtZW50ID0gX3VpRWxlbWVudHNbYV07XG5cbiAgICAgICAgICBpZihjbGFzc0F0dHIuaW5kZXhPZigncHN3cF9fJyArIHVpRWxlbWVudC5uYW1lKSA+IC0xICApIHtcblxuICAgICAgICAgICAgaWYoIF9vcHRpb25zW3VpRWxlbWVudC5vcHRpb25dICkgeyAvLyBpZiBlbGVtZW50IGlzIG5vdCBkaXNhYmxlZCBmcm9tIG9wdGlvbnNcblxuICAgICAgICAgICAgICBmcmFtZXdvcmsucmVtb3ZlQ2xhc3MoaXRlbSwgJ3Bzd3BfX2VsZW1lbnQtLWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgIGlmKHVpRWxlbWVudC5vbkluaXQpIHtcbiAgICAgICAgICAgICAgICB1aUVsZW1lbnQub25Jbml0KGl0ZW0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy9pdGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZnJhbWV3b3JrLmFkZENsYXNzKGl0ZW0sICdwc3dwX19lbGVtZW50LS1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAvL2l0ZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIGxvb3BUaHJvdWdoQ2hpbGRFbGVtZW50cyhfY29udHJvbHMuY2hpbGRyZW4pO1xuXG4gICAgdmFyIHRvcEJhciA9ICBmcmFtZXdvcmsuZ2V0Q2hpbGRCeUNsYXNzKF9jb250cm9scywgJ3Bzd3BfX3RvcC1iYXInKTtcbiAgICBpZih0b3BCYXIpIHtcbiAgICAgIGxvb3BUaHJvdWdoQ2hpbGRFbGVtZW50cyggdG9wQmFyLmNoaWxkcmVuICk7XG4gICAgfVxuICB9O1xuXG5cblxuXG4gIHVpLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIGV4dGVuZCBvcHRpb25zXG4gICAgZnJhbWV3b3JrLmV4dGVuZChwc3dwLm9wdGlvbnMsIF9kZWZhdWx0VUlPcHRpb25zLCB0cnVlKTtcblxuICAgIC8vIGNyZWF0ZSBsb2NhbCBsaW5rIGZvciBmYXN0IGFjY2Vzc1xuICAgIF9vcHRpb25zID0gcHN3cC5vcHRpb25zO1xuXG4gICAgLy8gZmluZCBwc3dwX191aSBlbGVtZW50XG4gICAgX2NvbnRyb2xzID0gZnJhbWV3b3JrLmdldENoaWxkQnlDbGFzcyhwc3dwLnNjcm9sbFdyYXAsICdwc3dwX191aScpO1xuXG4gICAgLy8gY3JlYXRlIGxvY2FsIGxpbmtcbiAgICBfbGlzdGVuID0gcHN3cC5saXN0ZW47XG5cblxuICAgIF9zZXR1cEhpZGluZ0NvbnRyb2xzRHVyaW5nR2VzdHVyZXMoKTtcblxuICAgIC8vIHVwZGF0ZSBjb250cm9scyB3aGVuIHNsaWRlcyBjaGFuZ2VcbiAgICBfbGlzdGVuKCdiZWZvcmVDaGFuZ2UnLCB1aS51cGRhdGUpO1xuXG4gICAgLy8gdG9nZ2xlIHpvb20gb24gZG91YmxlLXRhcFxuICAgIF9saXN0ZW4oJ2RvdWJsZVRhcCcsIGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgICB2YXIgaW5pdGlhbFpvb21MZXZlbCA9IHBzd3AuY3Vyckl0ZW0uaW5pdGlhbFpvb21MZXZlbDtcbiAgICAgIGlmKHBzd3AuZ2V0Wm9vbUxldmVsKCkgIT09IGluaXRpYWxab29tTGV2ZWwpIHtcbiAgICAgICAgcHN3cC56b29tVG8oaW5pdGlhbFpvb21MZXZlbCwgcG9pbnQsIDMzMyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwc3dwLnpvb21Ubyhfb3B0aW9ucy5nZXREb3VibGVUYXBab29tKGZhbHNlLCBwc3dwLmN1cnJJdGVtKSwgcG9pbnQsIDMzMyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBbGxvdyB0ZXh0IHNlbGVjdGlvbiBpbiBjYXB0aW9uXG4gICAgX2xpc3RlbigncHJldmVudERyYWdFdmVudCcsIGZ1bmN0aW9uKGUsIGlzRG93biwgcHJldmVudE9iaikge1xuICAgICAgdmFyIHQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgICBpZihcbiAgICAgICAgdCAmJlxuICAgICAgICB0LmdldEF0dHJpYnV0ZSgnY2xhc3MnKSAmJiBlLnR5cGUuaW5kZXhPZignbW91c2UnKSA+IC0xICYmXG4gICAgICAgICggdC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykuaW5kZXhPZignX19jYXB0aW9uJykgPiAwIHx8ICgvKFNNQUxMfFNUUk9OR3xFTSkvaSkudGVzdCh0LnRhZ05hbWUpIClcbiAgICAgICkge1xuICAgICAgICBwcmV2ZW50T2JqLnByZXZlbnQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGJpbmQgZXZlbnRzIGZvciBVSVxuICAgIF9saXN0ZW4oJ2JpbmRFdmVudHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGZyYW1ld29yay5iaW5kKF9jb250cm9scywgJ3Bzd3BUYXAgY2xpY2snLCBfb25Db250cm9sc1RhcCk7XG4gICAgICBmcmFtZXdvcmsuYmluZChwc3dwLnNjcm9sbFdyYXAsICdwc3dwVGFwJywgdWkub25HbG9iYWxUYXApO1xuXG4gICAgICBpZighcHN3cC5saWtlbHlUb3VjaERldmljZSkge1xuICAgICAgICBmcmFtZXdvcmsuYmluZChwc3dwLnNjcm9sbFdyYXAsICdtb3VzZW92ZXInLCB1aS5vbk1vdXNlT3Zlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyB1bmJpbmQgZXZlbnRzIGZvciBVSVxuICAgIF9saXN0ZW4oJ3VuYmluZEV2ZW50cycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYoIV9zaGFyZU1vZGFsSGlkZGVuKSB7XG4gICAgICAgIF90b2dnbGVTaGFyZU1vZGFsKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKF9pZGxlSW50ZXJ2YWwpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChfaWRsZUludGVydmFsKTtcbiAgICAgIH1cbiAgICAgIGZyYW1ld29yay51bmJpbmQoZG9jdW1lbnQsICdtb3VzZW91dCcsIF9vbk1vdXNlTGVhdmVXaW5kb3cpO1xuICAgICAgZnJhbWV3b3JrLnVuYmluZChkb2N1bWVudCwgJ21vdXNlbW92ZScsIF9vbklkbGVNb3VzZU1vdmUpO1xuICAgICAgZnJhbWV3b3JrLnVuYmluZChfY29udHJvbHMsICdwc3dwVGFwIGNsaWNrJywgX29uQ29udHJvbHNUYXApO1xuICAgICAgZnJhbWV3b3JrLnVuYmluZChwc3dwLnNjcm9sbFdyYXAsICdwc3dwVGFwJywgdWkub25HbG9iYWxUYXApO1xuICAgICAgZnJhbWV3b3JrLnVuYmluZChwc3dwLnNjcm9sbFdyYXAsICdtb3VzZW92ZXInLCB1aS5vbk1vdXNlT3Zlcik7XG5cbiAgICAgIGlmKF9mdWxsc2NyZW5BUEkpIHtcbiAgICAgICAgZnJhbWV3b3JrLnVuYmluZChkb2N1bWVudCwgX2Z1bGxzY3JlbkFQSS5ldmVudEssIHVpLnVwZGF0ZUZ1bGxzY3JlZW4pO1xuICAgICAgICBpZihfZnVsbHNjcmVuQVBJLmlzRnVsbHNjcmVlbigpKSB7XG4gICAgICAgICAgX29wdGlvbnMuaGlkZUFuaW1hdGlvbkR1cmF0aW9uID0gMDtcbiAgICAgICAgICBfZnVsbHNjcmVuQVBJLmV4aXQoKTtcbiAgICAgICAgfVxuICAgICAgICBfZnVsbHNjcmVuQVBJID0gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLy8gY2xlYW4gdXAgdGhpbmdzIHdoZW4gZ2FsbGVyeSBpcyBkZXN0cm95ZWRcbiAgICBfbGlzdGVuKCdkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICBpZihfb3B0aW9ucy5jYXB0aW9uRWwpIHtcbiAgICAgICAgaWYoX2Zha2VDYXB0aW9uQ29udGFpbmVyKSB7XG4gICAgICAgICAgX2NvbnRyb2xzLnJlbW92ZUNoaWxkKF9mYWtlQ2FwdGlvbkNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgZnJhbWV3b3JrLnJlbW92ZUNsYXNzKF9jYXB0aW9uQ29udGFpbmVyLCAncHN3cF9fY2FwdGlvbi0tZW1wdHknKTtcbiAgICAgIH1cblxuICAgICAgaWYoX3NoYXJlTW9kYWwpIHtcbiAgICAgICAgX3NoYXJlTW9kYWwuY2hpbGRyZW5bMF0ub25jbGljayA9IG51bGw7XG4gICAgICB9XG4gICAgICBmcmFtZXdvcmsucmVtb3ZlQ2xhc3MoX2NvbnRyb2xzLCAncHN3cF9fdWktLW92ZXItY2xvc2UnKTtcbiAgICAgIGZyYW1ld29yay5hZGRDbGFzcyggX2NvbnRyb2xzLCAncHN3cF9fdWktLWhpZGRlbicpO1xuICAgICAgdWkuc2V0SWRsZShmYWxzZSk7XG4gICAgfSk7XG5cblxuICAgIGlmKCFfb3B0aW9ucy5zaG93QW5pbWF0aW9uRHVyYXRpb24pIHtcbiAgICAgIGZyYW1ld29yay5yZW1vdmVDbGFzcyggX2NvbnRyb2xzLCAncHN3cF9fdWktLWhpZGRlbicpO1xuICAgIH1cbiAgICBfbGlzdGVuKCdpbml0aWFsWm9vbUluJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZihfb3B0aW9ucy5zaG93QW5pbWF0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgZnJhbWV3b3JrLnJlbW92ZUNsYXNzKCBfY29udHJvbHMsICdwc3dwX191aS0taGlkZGVuJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgX2xpc3RlbignaW5pdGlhbFpvb21PdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGZyYW1ld29yay5hZGRDbGFzcyggX2NvbnRyb2xzLCAncHN3cF9fdWktLWhpZGRlbicpO1xuICAgIH0pO1xuXG4gICAgX2xpc3RlbigncGFyc2VWZXJ0aWNhbE1hcmdpbicsIF9hcHBseU5hdkJhckdhcHMpO1xuXG4gICAgX3NldHVwVUlFbGVtZW50cygpO1xuXG4gICAgaWYoX29wdGlvbnMuc2hhcmVFbCAmJiBfc2hhcmVCdXR0b24gJiYgX3NoYXJlTW9kYWwpIHtcbiAgICAgIF9zaGFyZU1vZGFsSGlkZGVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBfY291bnROdW1JdGVtcygpO1xuXG4gICAgX3NldHVwSWRsZSgpO1xuXG4gICAgX3NldHVwRnVsbHNjcmVlbkFQSSgpO1xuXG4gICAgX3NldHVwTG9hZGluZ0luZGljYXRvcigpO1xuICB9O1xuXG4gIHVpLnNldElkbGUgPSBmdW5jdGlvbihpc0lkbGUpIHtcbiAgICBfaXNJZGxlID0gaXNJZGxlO1xuICAgIF90b2dnbGVQc3dwQ2xhc3MoX2NvbnRyb2xzLCAndWktLWlkbGUnLCBpc0lkbGUpO1xuICB9O1xuXG4gIHVpLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIERvbid0IHVwZGF0ZSBVSSBpZiBpdCdzIGhpZGRlblxuICAgIGlmKF9jb250cm9sc1Zpc2libGUgJiYgcHN3cC5jdXJySXRlbSkge1xuXG4gICAgICB1aS51cGRhdGVJbmRleEluZGljYXRvcigpO1xuXG4gICAgICBpZihfb3B0aW9ucy5jYXB0aW9uRWwpIHtcbiAgICAgICAgX29wdGlvbnMuYWRkQ2FwdGlvbkhUTUxGbihwc3dwLmN1cnJJdGVtLCBfY2FwdGlvbkNvbnRhaW5lcik7XG5cbiAgICAgICAgX3RvZ2dsZVBzd3BDbGFzcyhfY2FwdGlvbkNvbnRhaW5lciwgJ2NhcHRpb24tLWVtcHR5JywgIXBzd3AuY3Vyckl0ZW0udGl0bGUpO1xuICAgICAgfVxuXG4gICAgICBfb3ZlcmxheVVJVXBkYXRlZCA9IHRydWU7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgX292ZXJsYXlVSVVwZGF0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZighX3NoYXJlTW9kYWxIaWRkZW4pIHtcbiAgICAgIF90b2dnbGVTaGFyZU1vZGFsKCk7XG4gICAgfVxuXG4gICAgX2NvdW50TnVtSXRlbXMoKTtcbiAgfTtcblxuICB1aS51cGRhdGVGdWxsc2NyZWVuID0gZnVuY3Rpb24oZSkge1xuXG4gICAgaWYoZSkge1xuICAgICAgLy8gc29tZSBicm93c2VycyBjaGFuZ2Ugd2luZG93IHNjcm9sbCBwb3NpdGlvbiBkdXJpbmcgdGhlIGZ1bGxzY3JlZW5cbiAgICAgIC8vIHNvIFBob3RvU3dpcGUgdXBkYXRlcyBpdCBqdXN0IGluIGNhc2VcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBzd3Auc2V0U2Nyb2xsT2Zmc2V0KCAwLCBmcmFtZXdvcmsuZ2V0U2Nyb2xsWSgpICk7XG4gICAgICB9LCA1MCk7XG4gICAgfVxuXG4gICAgLy8gdG9vZ2xlIHBzd3AtLWZzIGNsYXNzIG9uIHJvb3QgZWxlbWVudFxuICAgIGZyYW1ld29ya1sgKF9mdWxsc2NyZW5BUEkuaXNGdWxsc2NyZWVuKCkgPyAnYWRkJyA6ICdyZW1vdmUnKSArICdDbGFzcycgXShwc3dwLnRlbXBsYXRlLCAncHN3cC0tZnMnKTtcbiAgfTtcblxuICB1aS51cGRhdGVJbmRleEluZGljYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKF9vcHRpb25zLmNvdW50ZXJFbCkge1xuICAgICAgX2luZGV4SW5kaWNhdG9yLmlubmVySFRNTCA9IChwc3dwLmdldEN1cnJlbnRJbmRleCgpKzEpICtcbiAgICAgICAgICAgICAgICAgICAgX29wdGlvbnMuaW5kZXhJbmRpY2F0b3JTZXAgK1xuICAgICAgICAgICAgICAgICAgICBfb3B0aW9ucy5nZXROdW1JdGVtc0ZuKCk7XG4gICAgfVxuICB9O1xuXG4gIHVpLm9uR2xvYmFsVGFwID0gZnVuY3Rpb24oZSkge1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuXG4gICAgaWYoX2Jsb2NrQ29udHJvbHNUYXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZihlLmRldGFpbCAmJiBlLmRldGFpbC5wb2ludGVyVHlwZSA9PT0gJ21vdXNlJykge1xuXG4gICAgICAvLyBjbG9zZSBnYWxsZXJ5IGlmIGNsaWNrZWQgb3V0c2lkZSBvZiB0aGUgaW1hZ2VcbiAgICAgIGlmKF9oYXNDbG9zZUNsYXNzKHRhcmdldCkpIHtcbiAgICAgICAgcHN3cC5jbG9zZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKGZyYW1ld29yay5oYXNDbGFzcyh0YXJnZXQsICdwc3dwX19pbWcnKSkge1xuICAgICAgICBpZihwc3dwLmdldFpvb21MZXZlbCgpID09PSAxICYmIHBzd3AuZ2V0Wm9vbUxldmVsKCkgPD0gcHN3cC5jdXJySXRlbS5maXRSYXRpbykge1xuICAgICAgICAgIGlmKF9vcHRpb25zLmNsaWNrVG9DbG9zZU5vblpvb21hYmxlKSB7XG4gICAgICAgICAgICBwc3dwLmNsb3NlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBzd3AudG9nZ2xlRGVza3RvcFpvb20oZS5kZXRhaWwucmVsZWFzZVBvaW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gdGFwIGFueXdoZXJlIChleGNlcHQgYnV0dG9ucykgdG8gdG9nZ2xlIHZpc2liaWxpdHkgb2YgY29udHJvbHNcbiAgICAgIGlmKF9vcHRpb25zLnRhcFRvVG9nZ2xlQ29udHJvbHMpIHtcbiAgICAgICAgaWYoX2NvbnRyb2xzVmlzaWJsZSkge1xuICAgICAgICAgIHVpLmhpZGVDb250cm9scygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVpLnNob3dDb250cm9scygpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHRhcCB0byBjbG9zZSBnYWxsZXJ5XG4gICAgICBpZihfb3B0aW9ucy50YXBUb0Nsb3NlICYmIChmcmFtZXdvcmsuaGFzQ2xhc3ModGFyZ2V0LCAncHN3cF9faW1nJykgfHwgX2hhc0Nsb3NlQ2xhc3ModGFyZ2V0KSkgKSB7XG4gICAgICAgIHBzd3AuY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgfVxuICB9O1xuICB1aS5vbk1vdXNlT3ZlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcblxuICAgIC8vIGFkZCBjbGFzcyB3aGVuIG1vdXNlIGlzIG92ZXIgYW4gZWxlbWVudCB0aGF0IHNob3VsZCBjbG9zZSB0aGUgZ2FsbGVyeVxuICAgIF90b2dnbGVQc3dwQ2xhc3MoX2NvbnRyb2xzLCAndWktLW92ZXItY2xvc2UnLCBfaGFzQ2xvc2VDbGFzcyh0YXJnZXQpKTtcbiAgfTtcblxuICB1aS5oaWRlQ29udHJvbHMgPSBmdW5jdGlvbigpIHtcbiAgICBmcmFtZXdvcmsuYWRkQ2xhc3MoX2NvbnRyb2xzLCdwc3dwX191aS0taGlkZGVuJyk7XG4gICAgX2NvbnRyb2xzVmlzaWJsZSA9IGZhbHNlO1xuICB9O1xuXG4gIHVpLnNob3dDb250cm9scyA9IGZ1bmN0aW9uKCkge1xuICAgIF9jb250cm9sc1Zpc2libGUgPSB0cnVlO1xuICAgIGlmKCFfb3ZlcmxheVVJVXBkYXRlZCkge1xuICAgICAgdWkudXBkYXRlKCk7XG4gICAgfVxuICAgIGZyYW1ld29yay5yZW1vdmVDbGFzcyhfY29udHJvbHMsJ3Bzd3BfX3VpLS1oaWRkZW4nKTtcbiAgfTtcblxuICB1aS5zdXBwb3J0c0Z1bGxzY3JlZW4gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZCA9IGRvY3VtZW50O1xuICAgIHJldHVybiAhIShkLmV4aXRGdWxsc2NyZWVuIHx8IGQubW96Q2FuY2VsRnVsbFNjcmVlbiB8fCBkLndlYmtpdEV4aXRGdWxsc2NyZWVuIHx8IGQubXNFeGl0RnVsbHNjcmVlbik7XG4gIH07XG5cbiAgdWkuZ2V0RnVsbHNjcmVlbkFQSSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkRSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICAgIGFwaSxcbiAgICAgIHRGID0gJ2Z1bGxzY3JlZW5jaGFuZ2UnO1xuXG4gICAgaWYgKGRFLnJlcXVlc3RGdWxsc2NyZWVuKSB7XG4gICAgICBhcGkgPSB7XG4gICAgICAgIGVudGVySzogJ3JlcXVlc3RGdWxsc2NyZWVuJyxcbiAgICAgICAgZXhpdEs6ICdleGl0RnVsbHNjcmVlbicsXG4gICAgICAgIGVsZW1lbnRLOiAnZnVsbHNjcmVlbkVsZW1lbnQnLFxuICAgICAgICBldmVudEs6IHRGXG4gICAgICB9O1xuXG4gICAgfSBlbHNlIGlmKGRFLm1velJlcXVlc3RGdWxsU2NyZWVuICkge1xuICAgICAgYXBpID0ge1xuICAgICAgICBlbnRlcks6ICdtb3pSZXF1ZXN0RnVsbFNjcmVlbicsXG4gICAgICAgIGV4aXRLOiAnbW96Q2FuY2VsRnVsbFNjcmVlbicsXG4gICAgICAgIGVsZW1lbnRLOiAnbW96RnVsbFNjcmVlbkVsZW1lbnQnLFxuICAgICAgICBldmVudEs6ICdtb3onICsgdEZcbiAgICAgIH07XG5cblxuXG4gICAgfSBlbHNlIGlmKGRFLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKSB7XG4gICAgICBhcGkgPSB7XG4gICAgICAgIGVudGVySzogJ3dlYmtpdFJlcXVlc3RGdWxsc2NyZWVuJyxcbiAgICAgICAgZXhpdEs6ICd3ZWJraXRFeGl0RnVsbHNjcmVlbicsXG4gICAgICAgIGVsZW1lbnRLOiAnd2Via2l0RnVsbHNjcmVlbkVsZW1lbnQnLFxuICAgICAgICBldmVudEs6ICd3ZWJraXQnICsgdEZcbiAgICAgIH07XG5cbiAgICB9IGVsc2UgaWYoZEUubXNSZXF1ZXN0RnVsbHNjcmVlbikge1xuICAgICAgYXBpID0ge1xuICAgICAgICBlbnRlcks6ICdtc1JlcXVlc3RGdWxsc2NyZWVuJyxcbiAgICAgICAgZXhpdEs6ICdtc0V4aXRGdWxsc2NyZWVuJyxcbiAgICAgICAgZWxlbWVudEs6ICdtc0Z1bGxzY3JlZW5FbGVtZW50JyxcbiAgICAgICAgZXZlbnRLOiAnTVNGdWxsc2NyZWVuQ2hhbmdlJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZihhcGkpIHtcbiAgICAgIGFwaS5lbnRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBkaXNhYmxlIGNsb3NlLW9uLXNjcm9sbCBpbiBmdWxsc2NyZWVuXG4gICAgICAgIF9pbml0YWxDbG9zZU9uU2Nyb2xsVmFsdWUgPSBfb3B0aW9ucy5jbG9zZU9uU2Nyb2xsO1xuICAgICAgICBfb3B0aW9ucy5jbG9zZU9uU2Nyb2xsID0gZmFsc2U7XG5cbiAgICAgICAgaWYodGhpcy5lbnRlcksgPT09ICd3ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbicpIHtcbiAgICAgICAgICBwc3dwLnRlbXBsYXRlW3RoaXMuZW50ZXJLXSggRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBwc3dwLnRlbXBsYXRlW3RoaXMuZW50ZXJLXSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgYXBpLmV4aXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX29wdGlvbnMuY2xvc2VPblNjcm9sbCA9IF9pbml0YWxDbG9zZU9uU2Nyb2xsVmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIGRvY3VtZW50W3RoaXMuZXhpdEtdKCk7XG5cbiAgICAgIH07XG4gICAgICBhcGkuaXNGdWxsc2NyZWVuID0gZnVuY3Rpb24oKSB7IHJldHVybiBkb2N1bWVudFt0aGlzLmVsZW1lbnRLXTsgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXBpO1xuICB9O1xuXG5cblxufTtcbnJldHVybiBQaG90b1N3aXBlVUlfRGVmYXVsdDtcblxuXG59KTtcbiIsIi8qISBQaG90b1N3aXBlIC0gdjQuMS4xIC0gMjAxNS0xMi0yNFxuKiBodHRwOi8vcGhvdG9zd2lwZS5jb21cbiogQ29weXJpZ2h0IChjKSAyMDE1IERtaXRyeSBTZW1lbm92OyAqL1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7IFxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHR9IGVsc2Uge1xuXHRcdHJvb3QuUGhvdG9Td2lwZSA9IGZhY3RvcnkoKTtcblx0fVxufSkodGhpcywgZnVuY3Rpb24gKCkge1xuXG5cdCd1c2Ugc3RyaWN0Jztcblx0dmFyIFBob3RvU3dpcGUgPSBmdW5jdGlvbih0ZW1wbGF0ZSwgVWlDbGFzcywgaXRlbXMsIG9wdGlvbnMpe1xuXG4vKj4+ZnJhbWV3b3JrLWJyaWRnZSovXG4vKipcbiAqXG4gKiBTZXQgb2YgZ2VuZXJpYyBmdW5jdGlvbnMgdXNlZCBieSBnYWxsZXJ5LlxuICogXG4gKiBZb3UncmUgZnJlZSB0byBtb2RpZnkgYW55dGhpbmcgaGVyZSBhcyBsb25nIGFzIGZ1bmN0aW9uYWxpdHkgaXMga2VwdC5cbiAqIFxuICovXG52YXIgZnJhbWV3b3JrID0ge1xuXHRmZWF0dXJlczogbnVsbCxcblx0YmluZDogZnVuY3Rpb24odGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgdW5iaW5kKSB7XG5cdFx0dmFyIG1ldGhvZE5hbWUgPSAodW5iaW5kID8gJ3JlbW92ZScgOiAnYWRkJykgKyAnRXZlbnRMaXN0ZW5lcic7XG5cdFx0dHlwZSA9IHR5cGUuc3BsaXQoJyAnKTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYodHlwZVtpXSkge1xuXHRcdFx0XHR0YXJnZXRbbWV0aG9kTmFtZV0oIHR5cGVbaV0sIGxpc3RlbmVyLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRpc0FycmF5OiBmdW5jdGlvbihvYmopIHtcblx0XHRyZXR1cm4gKG9iaiBpbnN0YW5jZW9mIEFycmF5KTtcblx0fSxcblx0Y3JlYXRlRWw6IGZ1bmN0aW9uKGNsYXNzZXMsIHRhZykge1xuXHRcdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnIHx8ICdkaXYnKTtcblx0XHRpZihjbGFzc2VzKSB7XG5cdFx0XHRlbC5jbGFzc05hbWUgPSBjbGFzc2VzO1xuXHRcdH1cblx0XHRyZXR1cm4gZWw7XG5cdH0sXG5cdGdldFNjcm9sbFk6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB5T2Zmc2V0ID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuXHRcdHJldHVybiB5T2Zmc2V0ICE9PSB1bmRlZmluZWQgPyB5T2Zmc2V0IDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblx0fSxcblx0dW5iaW5kOiBmdW5jdGlvbih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG5cdFx0ZnJhbWV3b3JrLmJpbmQodGFyZ2V0LHR5cGUsbGlzdGVuZXIsdHJ1ZSk7XG5cdH0sXG5cdHJlbW92ZUNsYXNzOiBmdW5jdGlvbihlbCwgY2xhc3NOYW1lKSB7XG5cdFx0dmFyIHJlZyA9IG5ldyBSZWdFeHAoJyhcXFxcc3xeKScgKyBjbGFzc05hbWUgKyAnKFxcXFxzfCQpJyk7XG5cdFx0ZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UocmVnLCAnICcpLnJlcGxhY2UoL15cXHNcXHMqLywgJycpLnJlcGxhY2UoL1xcc1xccyokLywgJycpOyBcblx0fSxcblx0YWRkQ2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUpIHtcblx0XHRpZiggIWZyYW1ld29yay5oYXNDbGFzcyhlbCxjbGFzc05hbWUpICkge1xuXHRcdFx0ZWwuY2xhc3NOYW1lICs9IChlbC5jbGFzc05hbWUgPyAnICcgOiAnJykgKyBjbGFzc05hbWU7XG5cdFx0fVxuXHR9LFxuXHRoYXNDbGFzczogZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSkge1xuXHRcdHJldHVybiBlbC5jbGFzc05hbWUgJiYgbmV3IFJlZ0V4cCgnKF58XFxcXHMpJyArIGNsYXNzTmFtZSArICcoXFxcXHN8JCknKS50ZXN0KGVsLmNsYXNzTmFtZSk7XG5cdH0sXG5cdGdldENoaWxkQnlDbGFzczogZnVuY3Rpb24ocGFyZW50RWwsIGNoaWxkQ2xhc3NOYW1lKSB7XG5cdFx0dmFyIG5vZGUgPSBwYXJlbnRFbC5maXJzdENoaWxkO1xuXHRcdHdoaWxlKG5vZGUpIHtcblx0XHRcdGlmKCBmcmFtZXdvcmsuaGFzQ2xhc3Mobm9kZSwgY2hpbGRDbGFzc05hbWUpICkge1xuXHRcdFx0XHRyZXR1cm4gbm9kZTtcblx0XHRcdH1cblx0XHRcdG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xuXHRcdH1cblx0fSxcblx0YXJyYXlTZWFyY2g6IGZ1bmN0aW9uKGFycmF5LCB2YWx1ZSwga2V5KSB7XG5cdFx0dmFyIGkgPSBhcnJheS5sZW5ndGg7XG5cdFx0d2hpbGUoaS0tKSB7XG5cdFx0XHRpZihhcnJheVtpXVtrZXldID09PSB2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdH0gXG5cdFx0fVxuXHRcdHJldHVybiAtMTtcblx0fSxcblx0ZXh0ZW5kOiBmdW5jdGlvbihvMSwgbzIsIHByZXZlbnRPdmVyd3JpdGUpIHtcblx0XHRmb3IgKHZhciBwcm9wIGluIG8yKSB7XG5cdFx0XHRpZiAobzIuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcblx0XHRcdFx0aWYocHJldmVudE92ZXJ3cml0ZSAmJiBvMS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG8xW3Byb3BdID0gbzJbcHJvcF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRlYXNpbmc6IHtcblx0XHRzaW5lOiB7XG5cdFx0XHRvdXQ6IGZ1bmN0aW9uKGspIHtcblx0XHRcdFx0cmV0dXJuIE1hdGguc2luKGsgKiAoTWF0aC5QSSAvIDIpKTtcblx0XHRcdH0sXG5cdFx0XHRpbk91dDogZnVuY3Rpb24oaykge1xuXHRcdFx0XHRyZXR1cm4gLSAoTWF0aC5jb3MoTWF0aC5QSSAqIGspIC0gMSkgLyAyO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y3ViaWM6IHtcblx0XHRcdG91dDogZnVuY3Rpb24oaykge1xuXHRcdFx0XHRyZXR1cm4gLS1rICogayAqIGsgKyAxO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvKlxuXHRcdFx0ZWxhc3RpYzoge1xuXHRcdFx0XHRvdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0XHRcdHZhciBzLCBhID0gMC4xLCBwID0gMC40O1xuXHRcdFx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0XHRcdGlmICggayA9PT0gMSApIHJldHVybiAxO1xuXHRcdFx0XHRcdGlmICggIWEgfHwgYSA8IDEgKSB7IGEgPSAxOyBzID0gcCAvIDQ7IH1cblx0XHRcdFx0XHRlbHNlIHMgPSBwICogTWF0aC5hc2luKCAxIC8gYSApIC8gKCAyICogTWF0aC5QSSApO1xuXHRcdFx0XHRcdHJldHVybiAoIGEgKiBNYXRoLnBvdyggMiwgLSAxMCAqIGspICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSArIDEgKTtcblxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdGJhY2s6IHtcblx0XHRcdFx0b3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cdFx0XHRcdFx0dmFyIHMgPSAxLjcwMTU4O1xuXHRcdFx0XHRcdHJldHVybiAtLWsgKiBrICogKCAoIHMgKyAxICkgKiBrICsgcyApICsgMTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCovXG5cdH0sXG5cblx0LyoqXG5cdCAqIFxuXHQgKiBAcmV0dXJuIHtvYmplY3R9XG5cdCAqIFxuXHQgKiB7XG5cdCAqICByYWYgOiByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZSBmdW5jdGlvblxuXHQgKiAgY2FmIDogY2FuY2VsIGFuaW1hdGlvbiBmcmFtZSBmdW5jdGlvblxuXHQgKiAgdHJhbnNmcm9tIDogdHJhbnNmb3JtIHByb3BlcnR5IGtleSAod2l0aCB2ZW5kb3IpLCBvciBudWxsIGlmIG5vdCBzdXBwb3J0ZWRcblx0ICogIG9sZElFIDogSUU4IG9yIGJlbG93XG5cdCAqIH1cblx0ICogXG5cdCAqL1xuXHRkZXRlY3RGZWF0dXJlczogZnVuY3Rpb24oKSB7XG5cdFx0aWYoZnJhbWV3b3JrLmZlYXR1cmVzKSB7XG5cdFx0XHRyZXR1cm4gZnJhbWV3b3JrLmZlYXR1cmVzO1xuXHRcdH1cblx0XHR2YXIgaGVscGVyRWwgPSBmcmFtZXdvcmsuY3JlYXRlRWwoKSxcblx0XHRcdGhlbHBlclN0eWxlID0gaGVscGVyRWwuc3R5bGUsXG5cdFx0XHR2ZW5kb3IgPSAnJyxcblx0XHRcdGZlYXR1cmVzID0ge307XG5cblx0XHQvLyBJRTggYW5kIGJlbG93XG5cdFx0ZmVhdHVyZXMub2xkSUUgPSBkb2N1bWVudC5hbGwgJiYgIWRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXI7XG5cblx0XHRmZWF0dXJlcy50b3VjaCA9ICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdztcblxuXHRcdGlmKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcblx0XHRcdGZlYXR1cmVzLnJhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdFx0XHRmZWF0dXJlcy5jYWYgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWU7XG5cdFx0fVxuXG5cdFx0ZmVhdHVyZXMucG9pbnRlckV2ZW50ID0gbmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkIHx8IG5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkO1xuXG5cdFx0Ly8gZml4IGZhbHNlLXBvc2l0aXZlIGRldGVjdGlvbiBvZiBvbGQgQW5kcm9pZCBpbiBuZXcgSUVcblx0XHQvLyAoSUUxMSB1YSBzdHJpbmcgY29udGFpbnMgXCJBbmRyb2lkIDQuMFwiKVxuXHRcdFxuXHRcdGlmKCFmZWF0dXJlcy5wb2ludGVyRXZlbnQpIHsgXG5cblx0XHRcdHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG5cblx0XHRcdC8vIERldGVjdCBpZiBkZXZpY2UgaXMgaVBob25lIG9yIGlQb2QgYW5kIGlmIGl0J3Mgb2xkZXIgdGhhbiBpT1MgOFxuXHRcdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTQyMjM5MjBcblx0XHRcdC8vIFxuXHRcdFx0Ly8gVGhpcyBkZXRlY3Rpb24gaXMgbWFkZSBiZWNhdXNlIG9mIGJ1Z2d5IHRvcC9ib3R0b20gdG9vbGJhcnNcblx0XHRcdC8vIHRoYXQgZG9uJ3QgdHJpZ2dlciB3aW5kb3cucmVzaXplIGV2ZW50LlxuXHRcdFx0Ly8gRm9yIG1vcmUgaW5mbyByZWZlciB0byBfaXNGaXhlZFBvc2l0aW9uIHZhcmlhYmxlIGluIGNvcmUuanNcblxuXHRcdFx0aWYgKC9pUChob25lfG9kKS8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pKSB7XG5cdFx0XHRcdHZhciB2ID0gKG5hdmlnYXRvci5hcHBWZXJzaW9uKS5tYXRjaCgvT1MgKFxcZCspXyhcXGQrKV8/KFxcZCspPy8pO1xuXHRcdFx0XHRpZih2ICYmIHYubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHYgPSBwYXJzZUludCh2WzFdLCAxMCk7XG5cdFx0XHRcdFx0aWYodiA+PSAxICYmIHYgPCA4ICkge1xuXHRcdFx0XHRcdFx0ZmVhdHVyZXMuaXNPbGRJT1NQaG9uZSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIERldGVjdCBvbGQgQW5kcm9pZCAoYmVmb3JlIEtpdEthdClcblx0XHRcdC8vIGR1ZSB0byBidWdzIHJlbGF0ZWQgdG8gcG9zaXRpb246Zml4ZWRcblx0XHRcdC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzE4NDU3My9waWNrLXVwLXRoZS1hbmRyb2lkLXZlcnNpb24taW4tdGhlLWJyb3dzZXItYnktamF2YXNjcmlwdFxuXHRcdFx0XG5cdFx0XHR2YXIgbWF0Y2ggPSB1YS5tYXRjaCgvQW5kcm9pZFxccyhbMC05XFwuXSopLyk7XG5cdFx0XHR2YXIgYW5kcm9pZHZlcnNpb24gPSAgbWF0Y2ggPyBtYXRjaFsxXSA6IDA7XG5cdFx0XHRhbmRyb2lkdmVyc2lvbiA9IHBhcnNlRmxvYXQoYW5kcm9pZHZlcnNpb24pO1xuXHRcdFx0aWYoYW5kcm9pZHZlcnNpb24gPj0gMSApIHtcblx0XHRcdFx0aWYoYW5kcm9pZHZlcnNpb24gPCA0LjQpIHtcblx0XHRcdFx0XHRmZWF0dXJlcy5pc09sZEFuZHJvaWQgPSB0cnVlOyAvLyBmb3IgZml4ZWQgcG9zaXRpb24gYnVnICYgcGVyZm9ybWFuY2Vcblx0XHRcdFx0fVxuXHRcdFx0XHRmZWF0dXJlcy5hbmRyb2lkVmVyc2lvbiA9IGFuZHJvaWR2ZXJzaW9uOyAvLyBmb3IgdG91Y2hlbmQgYnVnXG5cdFx0XHR9XHRcblx0XHRcdGZlYXR1cmVzLmlzTW9iaWxlT3BlcmEgPSAvb3BlcmEgbWluaXxvcGVyYSBtb2JpL2kudGVzdCh1YSk7XG5cblx0XHRcdC8vIHAucy4geWVzLCB5ZXMsIFVBIHNuaWZmaW5nIGlzIGJhZCwgcHJvcG9zZSB5b3VyIHNvbHV0aW9uIGZvciBhYm92ZSBidWdzLlxuXHRcdH1cblx0XHRcblx0XHR2YXIgc3R5bGVDaGVja3MgPSBbJ3RyYW5zZm9ybScsICdwZXJzcGVjdGl2ZScsICdhbmltYXRpb25OYW1lJ10sXG5cdFx0XHR2ZW5kb3JzID0gWycnLCAnd2Via2l0JywnTW96JywnbXMnLCdPJ10sXG5cdFx0XHRzdHlsZUNoZWNrSXRlbSxcblx0XHRcdHN0eWxlTmFtZTtcblxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcblx0XHRcdHZlbmRvciA9IHZlbmRvcnNbaV07XG5cblx0XHRcdGZvcih2YXIgYSA9IDA7IGEgPCAzOyBhKyspIHtcblx0XHRcdFx0c3R5bGVDaGVja0l0ZW0gPSBzdHlsZUNoZWNrc1thXTtcblxuXHRcdFx0XHQvLyB1cHBlcmNhc2UgZmlyc3QgbGV0dGVyIG9mIHByb3BlcnR5IG5hbWUsIGlmIHZlbmRvciBpcyBwcmVzZW50XG5cdFx0XHRcdHN0eWxlTmFtZSA9IHZlbmRvciArICh2ZW5kb3IgPyBcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3R5bGVDaGVja0l0ZW0uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHlsZUNoZWNrSXRlbS5zbGljZSgxKSA6IFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHlsZUNoZWNrSXRlbSk7XG5cdFx0XHRcblx0XHRcdFx0aWYoIWZlYXR1cmVzW3N0eWxlQ2hlY2tJdGVtXSAmJiBzdHlsZU5hbWUgaW4gaGVscGVyU3R5bGUgKSB7XG5cdFx0XHRcdFx0ZmVhdHVyZXNbc3R5bGVDaGVja0l0ZW1dID0gc3R5bGVOYW1lO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKHZlbmRvciAmJiAhZmVhdHVyZXMucmFmKSB7XG5cdFx0XHRcdHZlbmRvciA9IHZlbmRvci50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRmZWF0dXJlcy5yYWYgPSB3aW5kb3dbdmVuZG9yKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcblx0XHRcdFx0aWYoZmVhdHVyZXMucmFmKSB7XG5cdFx0XHRcdFx0ZmVhdHVyZXMuY2FmID0gd2luZG93W3ZlbmRvcisnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSB8fCBcblx0XHRcdFx0XHRcdFx0XHRcdHdpbmRvd1t2ZW5kb3IrJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFx0XG5cdFx0aWYoIWZlYXR1cmVzLnJhZikge1xuXHRcdFx0dmFyIGxhc3RUaW1lID0gMDtcblx0XHRcdGZlYXR1cmVzLnJhZiA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRcdHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdFx0XHR2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcblx0XHRcdFx0dmFyIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGZuKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7IH0sIHRpbWVUb0NhbGwpO1xuXHRcdFx0XHRsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcblx0XHRcdFx0cmV0dXJuIGlkO1xuXHRcdFx0fTtcblx0XHRcdGZlYXR1cmVzLmNhZiA9IGZ1bmN0aW9uKGlkKSB7IGNsZWFyVGltZW91dChpZCk7IH07XG5cdFx0fVxuXG5cdFx0Ly8gRGV0ZWN0IFNWRyBzdXBwb3J0XG5cdFx0ZmVhdHVyZXMuc3ZnID0gISFkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiYgXG5cdFx0XHRcdFx0XHQhIWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnc3ZnJykuY3JlYXRlU1ZHUmVjdDtcblxuXHRcdGZyYW1ld29yay5mZWF0dXJlcyA9IGZlYXR1cmVzO1xuXG5cdFx0cmV0dXJuIGZlYXR1cmVzO1xuXHR9XG59O1xuXG5mcmFtZXdvcmsuZGV0ZWN0RmVhdHVyZXMoKTtcblxuLy8gT3ZlcnJpZGUgYWRkRXZlbnRMaXN0ZW5lciBmb3Igb2xkIHZlcnNpb25zIG9mIElFXG5pZihmcmFtZXdvcmsuZmVhdHVyZXMub2xkSUUpIHtcblxuXHRmcmFtZXdvcmsuYmluZCA9IGZ1bmN0aW9uKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHVuYmluZCkge1xuXHRcdFxuXHRcdHR5cGUgPSB0eXBlLnNwbGl0KCcgJyk7XG5cblx0XHR2YXIgbWV0aG9kTmFtZSA9ICh1bmJpbmQgPyAnZGV0YWNoJyA6ICdhdHRhY2gnKSArICdFdmVudCcsXG5cdFx0XHRldk5hbWUsXG5cdFx0XHRfaGFuZGxlRXYgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0bGlzdGVuZXIuaGFuZGxlRXZlbnQuY2FsbChsaXN0ZW5lcik7XG5cdFx0XHR9O1xuXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdGV2TmFtZSA9IHR5cGVbaV07XG5cdFx0XHRpZihldk5hbWUpIHtcblxuXHRcdFx0XHRpZih0eXBlb2YgbGlzdGVuZXIgPT09ICdvYmplY3QnICYmIGxpc3RlbmVyLmhhbmRsZUV2ZW50KSB7XG5cdFx0XHRcdFx0aWYoIXVuYmluZCkge1xuXHRcdFx0XHRcdFx0bGlzdGVuZXJbJ29sZElFJyArIGV2TmFtZV0gPSBfaGFuZGxlRXY7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmKCFsaXN0ZW5lclsnb2xkSUUnICsgZXZOYW1lXSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGFyZ2V0W21ldGhvZE5hbWVdKCAnb24nICsgZXZOYW1lLCBsaXN0ZW5lclsnb2xkSUUnICsgZXZOYW1lXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGFyZ2V0W21ldGhvZE5hbWVdKCAnb24nICsgZXZOYW1lLCBsaXN0ZW5lcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0XG59XG5cbi8qPj5mcmFtZXdvcmstYnJpZGdlKi9cblxuLyo+PmNvcmUqL1xuLy9mdW5jdGlvbih0ZW1wbGF0ZSwgVWlDbGFzcywgaXRlbXMsIG9wdGlvbnMpXG5cbnZhciBzZWxmID0gdGhpcztcblxuLyoqXG4gKiBTdGF0aWMgdmFycywgZG9uJ3QgY2hhbmdlIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy5cbiAqL1xudmFyIERPVUJMRV9UQVBfUkFESVVTID0gMjUsIFxuXHROVU1fSE9MREVSUyA9IDM7XG5cbi8qKlxuICogT3B0aW9uc1xuICovXG52YXIgX29wdGlvbnMgPSB7XG5cdGFsbG93UGFuVG9OZXh0OnRydWUsXG5cdHNwYWNpbmc6IDAuMTIsXG5cdGJnT3BhY2l0eTogMSxcblx0bW91c2VVc2VkOiBmYWxzZSxcblx0bG9vcDogdHJ1ZSxcblx0cGluY2hUb0Nsb3NlOiB0cnVlLFxuXHRjbG9zZU9uU2Nyb2xsOiB0cnVlLFxuXHRjbG9zZU9uVmVydGljYWxEcmFnOiB0cnVlLFxuXHR2ZXJ0aWNhbERyYWdSYW5nZTogMC43NSxcblx0aGlkZUFuaW1hdGlvbkR1cmF0aW9uOiAzMzMsXG5cdHNob3dBbmltYXRpb25EdXJhdGlvbjogMzMzLFxuXHRzaG93SGlkZU9wYWNpdHk6IGZhbHNlLFxuXHRmb2N1czogdHJ1ZSxcblx0ZXNjS2V5OiB0cnVlLFxuXHRhcnJvd0tleXM6IHRydWUsXG5cdG1haW5TY3JvbGxFbmRGcmljdGlvbjogMC4zNSxcblx0cGFuRW5kRnJpY3Rpb246IDAuMzUsXG5cdGlzQ2xpY2thYmxlRWxlbWVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdBJztcbiAgICB9LFxuICAgIGdldERvdWJsZVRhcFpvb206IGZ1bmN0aW9uKGlzTW91c2VDbGljaywgaXRlbSkge1xuICAgIFx0aWYoaXNNb3VzZUNsaWNrKSB7XG4gICAgXHRcdHJldHVybiAxO1xuICAgIFx0fSBlbHNlIHtcbiAgICBcdFx0cmV0dXJuIGl0ZW0uaW5pdGlhbFpvb21MZXZlbCA8IDAuNyA/IDEgOiAxLjMzO1xuICAgIFx0fVxuICAgIH0sXG4gICAgbWF4U3ByZWFkWm9vbTogMS4zMyxcblx0bW9kYWw6IHRydWUsXG5cblx0Ly8gbm90IGZ1bGx5IGltcGxlbWVudGVkIHlldFxuXHRzY2FsZU1vZGU6ICdmaXQnIC8vIFRPRE9cbn07XG5mcmFtZXdvcmsuZXh0ZW5kKF9vcHRpb25zLCBvcHRpb25zKTtcblxuXG4vKipcbiAqIFByaXZhdGUgaGVscGVyIHZhcmlhYmxlcyAmIGZ1bmN0aW9uc1xuICovXG5cbnZhciBfZ2V0RW1wdHlQb2ludCA9IGZ1bmN0aW9uKCkgeyBcblx0XHRyZXR1cm4ge3g6MCx5OjB9OyBcblx0fTtcblxudmFyIF9pc09wZW4sXG5cdF9pc0Rlc3Ryb3lpbmcsXG5cdF9jbG9zZWRCeVNjcm9sbCxcblx0X2N1cnJlbnRJdGVtSW5kZXgsXG5cdF9jb250YWluZXJTdHlsZSxcblx0X2NvbnRhaW5lclNoaWZ0SW5kZXgsXG5cdF9jdXJyUGFuRGlzdCA9IF9nZXRFbXB0eVBvaW50KCksXG5cdF9zdGFydFBhbk9mZnNldCA9IF9nZXRFbXB0eVBvaW50KCksXG5cdF9wYW5PZmZzZXQgPSBfZ2V0RW1wdHlQb2ludCgpLFxuXHRfdXBNb3ZlRXZlbnRzLCAvLyBkcmFnIG1vdmUsIGRyYWcgZW5kICYgZHJhZyBjYW5jZWwgZXZlbnRzIGFycmF5XG5cdF9kb3duRXZlbnRzLCAvLyBkcmFnIHN0YXJ0IGV2ZW50cyBhcnJheVxuXHRfZ2xvYmFsRXZlbnRIYW5kbGVycyxcblx0X3ZpZXdwb3J0U2l6ZSA9IHt9LFxuXHRfY3Vyclpvb21MZXZlbCxcblx0X3N0YXJ0Wm9vbUxldmVsLFxuXHRfdHJhbnNsYXRlUHJlZml4LFxuXHRfdHJhbnNsYXRlU3VmaXgsXG5cdF91cGRhdGVTaXplSW50ZXJ2YWwsXG5cdF9pdGVtc05lZWRVcGRhdGUsXG5cdF9jdXJyUG9zaXRpb25JbmRleCA9IDAsXG5cdF9vZmZzZXQgPSB7fSxcblx0X3NsaWRlU2l6ZSA9IF9nZXRFbXB0eVBvaW50KCksIC8vIHNpemUgb2Ygc2xpZGUgYXJlYSwgaW5jbHVkaW5nIHNwYWNpbmdcblx0X2l0ZW1Ib2xkZXJzLFxuXHRfcHJldkl0ZW1JbmRleCxcblx0X2luZGV4RGlmZiA9IDAsIC8vIGRpZmZlcmVuY2Ugb2YgaW5kZXhlcyBzaW5jZSBsYXN0IGNvbnRlbnQgdXBkYXRlXG5cdF9kcmFnU3RhcnRFdmVudCxcblx0X2RyYWdNb3ZlRXZlbnQsXG5cdF9kcmFnRW5kRXZlbnQsXG5cdF9kcmFnQ2FuY2VsRXZlbnQsXG5cdF90cmFuc2Zvcm1LZXksXG5cdF9wb2ludGVyRXZlbnRFbmFibGVkLFxuXHRfaXNGaXhlZFBvc2l0aW9uID0gdHJ1ZSxcblx0X2xpa2VseVRvdWNoRGV2aWNlLFxuXHRfbW9kdWxlcyA9IFtdLFxuXHRfcmVxdWVzdEFGLFxuXHRfY2FuY2VsQUYsXG5cdF9pbml0YWxDbGFzc05hbWUsXG5cdF9pbml0YWxXaW5kb3dTY3JvbGxZLFxuXHRfb2xkSUUsXG5cdF9jdXJyZW50V2luZG93U2Nyb2xsWSxcblx0X2ZlYXR1cmVzLFxuXHRfd2luZG93VmlzaWJsZVNpemUgPSB7fSxcblx0X3JlbmRlck1heFJlc29sdXRpb24gPSBmYWxzZSxcblxuXHQvLyBSZWdpc3RlcnMgUGhvdG9TV2lwZSBtb2R1bGUgKEhpc3RvcnksIENvbnRyb2xsZXIgLi4uKVxuXHRfcmVnaXN0ZXJNb2R1bGUgPSBmdW5jdGlvbihuYW1lLCBtb2R1bGUpIHtcblx0XHRmcmFtZXdvcmsuZXh0ZW5kKHNlbGYsIG1vZHVsZS5wdWJsaWNNZXRob2RzKTtcblx0XHRfbW9kdWxlcy5wdXNoKG5hbWUpO1xuXHR9LFxuXG5cdF9nZXRMb29wZWRJZCA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dmFyIG51bVNsaWRlcyA9IF9nZXROdW1JdGVtcygpO1xuXHRcdGlmKGluZGV4ID4gbnVtU2xpZGVzIC0gMSkge1xuXHRcdFx0cmV0dXJuIGluZGV4IC0gbnVtU2xpZGVzO1xuXHRcdH0gZWxzZSAgaWYoaW5kZXggPCAwKSB7XG5cdFx0XHRyZXR1cm4gbnVtU2xpZGVzICsgaW5kZXg7XG5cdFx0fVxuXHRcdHJldHVybiBpbmRleDtcblx0fSxcblx0XG5cdC8vIE1pY3JvIGJpbmQvdHJpZ2dlclxuXHRfbGlzdGVuZXJzID0ge30sXG5cdF9saXN0ZW4gPSBmdW5jdGlvbihuYW1lLCBmbikge1xuXHRcdGlmKCFfbGlzdGVuZXJzW25hbWVdKSB7XG5cdFx0XHRfbGlzdGVuZXJzW25hbWVdID0gW107XG5cdFx0fVxuXHRcdHJldHVybiBfbGlzdGVuZXJzW25hbWVdLnB1c2goZm4pO1xuXHR9LFxuXHRfc2hvdXQgPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0dmFyIGxpc3RlbmVycyA9IF9saXN0ZW5lcnNbbmFtZV07XG5cblx0XHRpZihsaXN0ZW5lcnMpIHtcblx0XHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHRcdGFyZ3Muc2hpZnQoKTtcblxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRsaXN0ZW5lcnNbaV0uYXBwbHkoc2VsZiwgYXJncyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9nZXRDdXJyZW50VGltZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0fSxcblx0X2FwcGx5QmdPcGFjaXR5ID0gZnVuY3Rpb24ob3BhY2l0eSkge1xuXHRcdF9iZ09wYWNpdHkgPSBvcGFjaXR5O1xuXHRcdHNlbGYuYmcuc3R5bGUub3BhY2l0eSA9IG9wYWNpdHkgKiBfb3B0aW9ucy5iZ09wYWNpdHk7XG5cdH0sXG5cblx0X2FwcGx5Wm9vbVRyYW5zZm9ybSA9IGZ1bmN0aW9uKHN0eWxlT2JqLHgseSx6b29tLGl0ZW0pIHtcblx0XHRpZighX3JlbmRlck1heFJlc29sdXRpb24gfHwgKGl0ZW0gJiYgaXRlbSAhPT0gc2VsZi5jdXJySXRlbSkgKSB7XG5cdFx0XHR6b29tID0gem9vbSAvIChpdGVtID8gaXRlbS5maXRSYXRpbyA6IHNlbGYuY3Vyckl0ZW0uZml0UmF0aW8pO1x0XG5cdFx0fVxuXHRcdFx0XG5cdFx0c3R5bGVPYmpbX3RyYW5zZm9ybUtleV0gPSBfdHJhbnNsYXRlUHJlZml4ICsgeCArICdweCwgJyArIHkgKyAncHgnICsgX3RyYW5zbGF0ZVN1Zml4ICsgJyBzY2FsZSgnICsgem9vbSArICcpJztcblx0fSxcblx0X2FwcGx5Q3VycmVudFpvb21QYW4gPSBmdW5jdGlvbiggYWxsb3dSZW5kZXJSZXNvbHV0aW9uICkge1xuXHRcdGlmKF9jdXJyWm9vbUVsZW1lbnRTdHlsZSkge1xuXG5cdFx0XHRpZihhbGxvd1JlbmRlclJlc29sdXRpb24pIHtcblx0XHRcdFx0aWYoX2N1cnJab29tTGV2ZWwgPiBzZWxmLmN1cnJJdGVtLmZpdFJhdGlvKSB7XG5cdFx0XHRcdFx0aWYoIV9yZW5kZXJNYXhSZXNvbHV0aW9uKSB7XG5cdFx0XHRcdFx0XHRfc2V0SW1hZ2VTaXplKHNlbGYuY3Vyckl0ZW0sIGZhbHNlLCB0cnVlKTtcblx0XHRcdFx0XHRcdF9yZW5kZXJNYXhSZXNvbHV0aW9uID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYoX3JlbmRlck1heFJlc29sdXRpb24pIHtcblx0XHRcdFx0XHRcdF9zZXRJbWFnZVNpemUoc2VsZi5jdXJySXRlbSk7XG5cdFx0XHRcdFx0XHRfcmVuZGVyTWF4UmVzb2x1dGlvbiA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cblx0XHRcdF9hcHBseVpvb21UcmFuc2Zvcm0oX2N1cnJab29tRWxlbWVudFN0eWxlLCBfcGFuT2Zmc2V0LngsIF9wYW5PZmZzZXQueSwgX2N1cnJab29tTGV2ZWwpO1xuXHRcdH1cblx0fSxcblx0X2FwcGx5Wm9vbVBhblRvSXRlbSA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRpZihpdGVtLmNvbnRhaW5lcikge1xuXG5cdFx0XHRfYXBwbHlab29tVHJhbnNmb3JtKGl0ZW0uY29udGFpbmVyLnN0eWxlLCBcblx0XHRcdFx0XHRcdFx0XHRpdGVtLmluaXRpYWxQb3NpdGlvbi54LCBcblx0XHRcdFx0XHRcdFx0XHRpdGVtLmluaXRpYWxQb3NpdGlvbi55LCBcblx0XHRcdFx0XHRcdFx0XHRpdGVtLmluaXRpYWxab29tTGV2ZWwsXG5cdFx0XHRcdFx0XHRcdFx0aXRlbSk7XG5cdFx0fVxuXHR9LFxuXHRfc2V0VHJhbnNsYXRlWCA9IGZ1bmN0aW9uKHgsIGVsU3R5bGUpIHtcblx0XHRlbFN0eWxlW190cmFuc2Zvcm1LZXldID0gX3RyYW5zbGF0ZVByZWZpeCArIHggKyAncHgsIDBweCcgKyBfdHJhbnNsYXRlU3VmaXg7XG5cdH0sXG5cdF9tb3ZlTWFpblNjcm9sbCA9IGZ1bmN0aW9uKHgsIGRyYWdnaW5nKSB7XG5cblx0XHRpZighX29wdGlvbnMubG9vcCAmJiBkcmFnZ2luZykge1xuXHRcdFx0dmFyIG5ld1NsaWRlSW5kZXhPZmZzZXQgPSBfY3VycmVudEl0ZW1JbmRleCArIChfc2xpZGVTaXplLnggKiBfY3VyclBvc2l0aW9uSW5kZXggLSB4KSAvIF9zbGlkZVNpemUueCxcblx0XHRcdFx0ZGVsdGEgPSBNYXRoLnJvdW5kKHggLSBfbWFpblNjcm9sbFBvcy54KTtcblxuXHRcdFx0aWYoIChuZXdTbGlkZUluZGV4T2Zmc2V0IDwgMCAmJiBkZWx0YSA+IDApIHx8IFxuXHRcdFx0XHQobmV3U2xpZGVJbmRleE9mZnNldCA+PSBfZ2V0TnVtSXRlbXMoKSAtIDEgJiYgZGVsdGEgPCAwKSApIHtcblx0XHRcdFx0eCA9IF9tYWluU2Nyb2xsUG9zLnggKyBkZWx0YSAqIF9vcHRpb25zLm1haW5TY3JvbGxFbmRGcmljdGlvbjtcblx0XHRcdH0gXG5cdFx0fVxuXHRcdFxuXHRcdF9tYWluU2Nyb2xsUG9zLnggPSB4O1xuXHRcdF9zZXRUcmFuc2xhdGVYKHgsIF9jb250YWluZXJTdHlsZSk7XG5cdH0sXG5cdF9jYWxjdWxhdGVQYW5PZmZzZXQgPSBmdW5jdGlvbihheGlzLCB6b29tTGV2ZWwpIHtcblx0XHR2YXIgbSA9IF9taWRab29tUG9pbnRbYXhpc10gLSBfb2Zmc2V0W2F4aXNdO1xuXHRcdHJldHVybiBfc3RhcnRQYW5PZmZzZXRbYXhpc10gKyBfY3VyclBhbkRpc3RbYXhpc10gKyBtIC0gbSAqICggem9vbUxldmVsIC8gX3N0YXJ0Wm9vbUxldmVsICk7XG5cdH0sXG5cdFxuXHRfZXF1YWxpemVQb2ludHMgPSBmdW5jdGlvbihwMSwgcDIpIHtcblx0XHRwMS54ID0gcDIueDtcblx0XHRwMS55ID0gcDIueTtcblx0XHRpZihwMi5pZCkge1xuXHRcdFx0cDEuaWQgPSBwMi5pZDtcblx0XHR9XG5cdH0sXG5cdF9yb3VuZFBvaW50ID0gZnVuY3Rpb24ocCkge1xuXHRcdHAueCA9IE1hdGgucm91bmQocC54KTtcblx0XHRwLnkgPSBNYXRoLnJvdW5kKHAueSk7XG5cdH0sXG5cblx0X21vdXNlTW92ZVRpbWVvdXQgPSBudWxsLFxuXHRfb25GaXJzdE1vdXNlTW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFdhaXQgdW50aWwgbW91c2UgbW92ZSBldmVudCBpcyBmaXJlZCBhdCBsZWFzdCB0d2ljZSBkdXJpbmcgMTAwbXNcblx0XHQvLyBXZSBkbyB0aGlzLCBiZWNhdXNlIHNvbWUgbW9iaWxlIGJyb3dzZXJzIHRyaWdnZXIgaXQgb24gdG91Y2hzdGFydFxuXHRcdGlmKF9tb3VzZU1vdmVUaW1lb3V0ICkgeyBcblx0XHRcdGZyYW1ld29yay51bmJpbmQoZG9jdW1lbnQsICdtb3VzZW1vdmUnLCBfb25GaXJzdE1vdXNlTW92ZSk7XG5cdFx0XHRmcmFtZXdvcmsuYWRkQ2xhc3ModGVtcGxhdGUsICdwc3dwLS1oYXNfbW91c2UnKTtcblx0XHRcdF9vcHRpb25zLm1vdXNlVXNlZCA9IHRydWU7XG5cdFx0XHRfc2hvdXQoJ21vdXNlVXNlZCcpO1xuXHRcdH1cblx0XHRfbW91c2VNb3ZlVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRfbW91c2VNb3ZlVGltZW91dCA9IG51bGw7XG5cdFx0fSwgMTAwKTtcblx0fSxcblxuXHRfYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGZyYW1ld29yay5iaW5kKGRvY3VtZW50LCAna2V5ZG93bicsIHNlbGYpO1xuXG5cdFx0aWYoX2ZlYXR1cmVzLnRyYW5zZm9ybSkge1xuXHRcdFx0Ly8gZG9uJ3QgYmluZCBjbGljayBldmVudCBpbiBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgdHJhbnNmb3JtIChtb3N0bHkgSUU4KVxuXHRcdFx0ZnJhbWV3b3JrLmJpbmQoc2VsZi5zY3JvbGxXcmFwLCAnY2xpY2snLCBzZWxmKTtcblx0XHR9XG5cdFx0XG5cblx0XHRpZighX29wdGlvbnMubW91c2VVc2VkKSB7XG5cdFx0XHRmcmFtZXdvcmsuYmluZChkb2N1bWVudCwgJ21vdXNlbW92ZScsIF9vbkZpcnN0TW91c2VNb3ZlKTtcblx0XHR9XG5cblx0XHRmcmFtZXdvcmsuYmluZCh3aW5kb3csICdyZXNpemUgc2Nyb2xsJywgc2VsZik7XG5cblx0XHRfc2hvdXQoJ2JpbmRFdmVudHMnKTtcblx0fSxcblxuXHRfdW5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0ZnJhbWV3b3JrLnVuYmluZCh3aW5kb3csICdyZXNpemUnLCBzZWxmKTtcblx0XHRmcmFtZXdvcmsudW5iaW5kKHdpbmRvdywgJ3Njcm9sbCcsIF9nbG9iYWxFdmVudEhhbmRsZXJzLnNjcm9sbCk7XG5cdFx0ZnJhbWV3b3JrLnVuYmluZChkb2N1bWVudCwgJ2tleWRvd24nLCBzZWxmKTtcblx0XHRmcmFtZXdvcmsudW5iaW5kKGRvY3VtZW50LCAnbW91c2Vtb3ZlJywgX29uRmlyc3RNb3VzZU1vdmUpO1xuXG5cdFx0aWYoX2ZlYXR1cmVzLnRyYW5zZm9ybSkge1xuXHRcdFx0ZnJhbWV3b3JrLnVuYmluZChzZWxmLnNjcm9sbFdyYXAsICdjbGljaycsIHNlbGYpO1xuXHRcdH1cblxuXHRcdGlmKF9pc0RyYWdnaW5nKSB7XG5cdFx0XHRmcmFtZXdvcmsudW5iaW5kKHdpbmRvdywgX3VwTW92ZUV2ZW50cywgc2VsZik7XG5cdFx0fVxuXG5cdFx0X3Nob3V0KCd1bmJpbmRFdmVudHMnKTtcblx0fSxcblx0XG5cdF9jYWxjdWxhdGVQYW5Cb3VuZHMgPSBmdW5jdGlvbih6b29tTGV2ZWwsIHVwZGF0ZSkge1xuXHRcdHZhciBib3VuZHMgPSBfY2FsY3VsYXRlSXRlbVNpemUoIHNlbGYuY3Vyckl0ZW0sIF92aWV3cG9ydFNpemUsIHpvb21MZXZlbCApO1xuXHRcdGlmKHVwZGF0ZSkge1xuXHRcdFx0X2N1cnJQYW5Cb3VuZHMgPSBib3VuZHM7XG5cdFx0fVxuXHRcdHJldHVybiBib3VuZHM7XG5cdH0sXG5cdFxuXHRfZ2V0TWluWm9vbUxldmVsID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdGlmKCFpdGVtKSB7XG5cdFx0XHRpdGVtID0gc2VsZi5jdXJySXRlbTtcblx0XHR9XG5cdFx0cmV0dXJuIGl0ZW0uaW5pdGlhbFpvb21MZXZlbDtcblx0fSxcblx0X2dldE1heFpvb21MZXZlbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRpZighaXRlbSkge1xuXHRcdFx0aXRlbSA9IHNlbGYuY3Vyckl0ZW07XG5cdFx0fVxuXHRcdHJldHVybiBpdGVtLncgPiAwID8gX29wdGlvbnMubWF4U3ByZWFkWm9vbSA6IDE7XG5cdH0sXG5cblx0Ly8gUmV0dXJuIHRydWUgaWYgb2Zmc2V0IGlzIG91dCBvZiB0aGUgYm91bmRzXG5cdF9tb2RpZnlEZXN0UGFuT2Zmc2V0ID0gZnVuY3Rpb24oYXhpcywgZGVzdFBhbkJvdW5kcywgZGVzdFBhbk9mZnNldCwgZGVzdFpvb21MZXZlbCkge1xuXHRcdGlmKGRlc3Rab29tTGV2ZWwgPT09IHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFpvb21MZXZlbCkge1xuXHRcdFx0ZGVzdFBhbk9mZnNldFtheGlzXSA9IHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFBvc2l0aW9uW2F4aXNdO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRlc3RQYW5PZmZzZXRbYXhpc10gPSBfY2FsY3VsYXRlUGFuT2Zmc2V0KGF4aXMsIGRlc3Rab29tTGV2ZWwpOyBcblxuXHRcdFx0aWYoZGVzdFBhbk9mZnNldFtheGlzXSA+IGRlc3RQYW5Cb3VuZHMubWluW2F4aXNdKSB7XG5cdFx0XHRcdGRlc3RQYW5PZmZzZXRbYXhpc10gPSBkZXN0UGFuQm91bmRzLm1pbltheGlzXTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2UgaWYoZGVzdFBhbk9mZnNldFtheGlzXSA8IGRlc3RQYW5Cb3VuZHMubWF4W2F4aXNdICkge1xuXHRcdFx0XHRkZXN0UGFuT2Zmc2V0W2F4aXNdID0gZGVzdFBhbkJvdW5kcy5tYXhbYXhpc107XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0X3NldHVwVHJhbnNmb3JtcyA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYoX3RyYW5zZm9ybUtleSkge1xuXHRcdFx0Ly8gc2V0dXAgM2QgdHJhbnNmb3Jtc1xuXHRcdFx0dmFyIGFsbG93M2RUcmFuc2Zvcm0gPSBfZmVhdHVyZXMucGVyc3BlY3RpdmUgJiYgIV9saWtlbHlUb3VjaERldmljZTtcblx0XHRcdF90cmFuc2xhdGVQcmVmaXggPSAndHJhbnNsYXRlJyArIChhbGxvdzNkVHJhbnNmb3JtID8gJzNkKCcgOiAnKCcpO1xuXHRcdFx0X3RyYW5zbGF0ZVN1Zml4ID0gX2ZlYXR1cmVzLnBlcnNwZWN0aXZlID8gJywgMHB4KScgOiAnKSc7XHRcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBPdmVycmlkZSB6b29tL3Bhbi9tb3ZlIGZ1bmN0aW9ucyBpbiBjYXNlIG9sZCBicm93c2VyIGlzIHVzZWQgKG1vc3QgbGlrZWx5IElFKVxuXHRcdC8vIChzbyB0aGV5IHVzZSBsZWZ0L3RvcC93aWR0aC9oZWlnaHQsIGluc3RlYWQgb2YgQ1NTIHRyYW5zZm9ybSlcblx0XG5cdFx0X3RyYW5zZm9ybUtleSA9ICdsZWZ0Jztcblx0XHRmcmFtZXdvcmsuYWRkQ2xhc3ModGVtcGxhdGUsICdwc3dwLS1pZScpO1xuXG5cdFx0X3NldFRyYW5zbGF0ZVggPSBmdW5jdGlvbih4LCBlbFN0eWxlKSB7XG5cdFx0XHRlbFN0eWxlLmxlZnQgPSB4ICsgJ3B4Jztcblx0XHR9O1xuXHRcdF9hcHBseVpvb21QYW5Ub0l0ZW0gPSBmdW5jdGlvbihpdGVtKSB7XG5cblx0XHRcdHZhciB6b29tUmF0aW8gPSBpdGVtLmZpdFJhdGlvID4gMSA/IDEgOiBpdGVtLmZpdFJhdGlvLFxuXHRcdFx0XHRzID0gaXRlbS5jb250YWluZXIuc3R5bGUsXG5cdFx0XHRcdHcgPSB6b29tUmF0aW8gKiBpdGVtLncsXG5cdFx0XHRcdGggPSB6b29tUmF0aW8gKiBpdGVtLmg7XG5cblx0XHRcdHMud2lkdGggPSB3ICsgJ3B4Jztcblx0XHRcdHMuaGVpZ2h0ID0gaCArICdweCc7XG5cdFx0XHRzLmxlZnQgPSBpdGVtLmluaXRpYWxQb3NpdGlvbi54ICsgJ3B4Jztcblx0XHRcdHMudG9wID0gaXRlbS5pbml0aWFsUG9zaXRpb24ueSArICdweCc7XG5cblx0XHR9O1xuXHRcdF9hcHBseUN1cnJlbnRab29tUGFuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZihfY3Vyclpvb21FbGVtZW50U3R5bGUpIHtcblxuXHRcdFx0XHR2YXIgcyA9IF9jdXJyWm9vbUVsZW1lbnRTdHlsZSxcblx0XHRcdFx0XHRpdGVtID0gc2VsZi5jdXJySXRlbSxcblx0XHRcdFx0XHR6b29tUmF0aW8gPSBpdGVtLmZpdFJhdGlvID4gMSA/IDEgOiBpdGVtLmZpdFJhdGlvLFxuXHRcdFx0XHRcdHcgPSB6b29tUmF0aW8gKiBpdGVtLncsXG5cdFx0XHRcdFx0aCA9IHpvb21SYXRpbyAqIGl0ZW0uaDtcblxuXHRcdFx0XHRzLndpZHRoID0gdyArICdweCc7XG5cdFx0XHRcdHMuaGVpZ2h0ID0gaCArICdweCc7XG5cblxuXHRcdFx0XHRzLmxlZnQgPSBfcGFuT2Zmc2V0LnggKyAncHgnO1xuXHRcdFx0XHRzLnRvcCA9IF9wYW5PZmZzZXQueSArICdweCc7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9O1xuXHR9LFxuXG5cdF9vbktleURvd24gPSBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIGtleWRvd25BY3Rpb24gPSAnJztcblx0XHRpZihfb3B0aW9ucy5lc2NLZXkgJiYgZS5rZXlDb2RlID09PSAyNykgeyBcblx0XHRcdGtleWRvd25BY3Rpb24gPSAnY2xvc2UnO1xuXHRcdH0gZWxzZSBpZihfb3B0aW9ucy5hcnJvd0tleXMpIHtcblx0XHRcdGlmKGUua2V5Q29kZSA9PT0gMzcpIHtcblx0XHRcdFx0a2V5ZG93bkFjdGlvbiA9ICdwcmV2Jztcblx0XHRcdH0gZWxzZSBpZihlLmtleUNvZGUgPT09IDM5KSB7IFxuXHRcdFx0XHRrZXlkb3duQWN0aW9uID0gJ25leHQnO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKGtleWRvd25BY3Rpb24pIHtcblx0XHRcdC8vIGRvbid0IGRvIGFueXRoaW5nIGlmIHNwZWNpYWwga2V5IHByZXNzZWQgdG8gcHJldmVudCBmcm9tIG92ZXJyaWRpbmcgZGVmYXVsdCBicm93c2VyIGFjdGlvbnNcblx0XHRcdC8vIGUuZy4gaW4gQ2hyb21lIG9uIE1hYyBjbWQrYXJyb3ctbGVmdCByZXR1cm5zIHRvIHByZXZpb3VzIHBhZ2Vcblx0XHRcdGlmKCAhZS5jdHJsS2V5ICYmICFlLmFsdEtleSAmJiAhZS5zaGlmdEtleSAmJiAhZS5tZXRhS2V5ICkge1xuXHRcdFx0XHRpZihlLnByZXZlbnREZWZhdWx0KSB7XG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcblx0XHRcdFx0fSBcblx0XHRcdFx0c2VsZltrZXlkb3duQWN0aW9uXSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfb25HbG9iYWxDbGljayA9IGZ1bmN0aW9uKGUpIHtcblx0XHRpZighZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIGRvbid0IGFsbG93IGNsaWNrIGV2ZW50IHRvIHBhc3MgdGhyb3VnaCB3aGVuIHRyaWdnZXJpbmcgYWZ0ZXIgZHJhZyBvciBzb21lIG90aGVyIGdlc3R1cmVcblx0XHRpZihfbW92ZWQgfHwgX3pvb21TdGFydGVkIHx8IF9tYWluU2Nyb2xsQW5pbWF0aW5nIHx8IF92ZXJ0aWNhbERyYWdJbml0aWF0ZWQpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0fVxuXHR9LFxuXG5cdF91cGRhdGVQYWdlU2Nyb2xsT2Zmc2V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0c2VsZi5zZXRTY3JvbGxPZmZzZXQoMCwgZnJhbWV3b3JrLmdldFNjcm9sbFkoKSk7XHRcdFxuXHR9O1xuXHRcblxuXG5cdFxuXG5cblxuLy8gTWljcm8gYW5pbWF0aW9uIGVuZ2luZVxudmFyIF9hbmltYXRpb25zID0ge30sXG5cdF9udW1BbmltYXRpb25zID0gMCxcblx0X3N0b3BBbmltYXRpb24gPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0aWYoX2FuaW1hdGlvbnNbbmFtZV0pIHtcblx0XHRcdGlmKF9hbmltYXRpb25zW25hbWVdLnJhZikge1xuXHRcdFx0XHRfY2FuY2VsQUYoIF9hbmltYXRpb25zW25hbWVdLnJhZiApO1xuXHRcdFx0fVxuXHRcdFx0X251bUFuaW1hdGlvbnMtLTtcblx0XHRcdGRlbGV0ZSBfYW5pbWF0aW9uc1tuYW1lXTtcblx0XHR9XG5cdH0sXG5cdF9yZWdpc3RlclN0YXJ0QW5pbWF0aW9uID0gZnVuY3Rpb24obmFtZSkge1xuXHRcdGlmKF9hbmltYXRpb25zW25hbWVdKSB7XG5cdFx0XHRfc3RvcEFuaW1hdGlvbihuYW1lKTtcblx0XHR9XG5cdFx0aWYoIV9hbmltYXRpb25zW25hbWVdKSB7XG5cdFx0XHRfbnVtQW5pbWF0aW9ucysrO1xuXHRcdFx0X2FuaW1hdGlvbnNbbmFtZV0gPSB7fTtcblx0XHR9XG5cdH0sXG5cdF9zdG9wQWxsQW5pbWF0aW9ucyA9IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAodmFyIHByb3AgaW4gX2FuaW1hdGlvbnMpIHtcblxuXHRcdFx0aWYoIF9hbmltYXRpb25zLmhhc093blByb3BlcnR5KCBwcm9wICkgKSB7XG5cdFx0XHRcdF9zdG9wQW5pbWF0aW9uKHByb3ApO1xuXHRcdFx0fSBcblx0XHRcdFxuXHRcdH1cblx0fSxcblx0X2FuaW1hdGVQcm9wID0gZnVuY3Rpb24obmFtZSwgYiwgZW5kUHJvcCwgZCwgZWFzaW5nRm4sIG9uVXBkYXRlLCBvbkNvbXBsZXRlKSB7XG5cdFx0dmFyIHN0YXJ0QW5pbVRpbWUgPSBfZ2V0Q3VycmVudFRpbWUoKSwgdDtcblx0XHRfcmVnaXN0ZXJTdGFydEFuaW1hdGlvbihuYW1lKTtcblxuXHRcdHZhciBhbmltbG9vcCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZiAoIF9hbmltYXRpb25zW25hbWVdICkge1xuXHRcdFx0XHRcblx0XHRcdFx0dCA9IF9nZXRDdXJyZW50VGltZSgpIC0gc3RhcnRBbmltVGltZTsgLy8gdGltZSBkaWZmXG5cdFx0XHRcdC8vYiAtIGJlZ2lubmluZyAoc3RhcnQgcHJvcClcblx0XHRcdFx0Ly9kIC0gYW5pbSBkdXJhdGlvblxuXG5cdFx0XHRcdGlmICggdCA+PSBkICkge1xuXHRcdFx0XHRcdF9zdG9wQW5pbWF0aW9uKG5hbWUpO1xuXHRcdFx0XHRcdG9uVXBkYXRlKGVuZFByb3ApO1xuXHRcdFx0XHRcdGlmKG9uQ29tcGxldGUpIHtcblx0XHRcdFx0XHRcdG9uQ29tcGxldGUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9uVXBkYXRlKCAoZW5kUHJvcCAtIGIpICogZWFzaW5nRm4odC9kKSArIGIgKTtcblxuXHRcdFx0XHRfYW5pbWF0aW9uc1tuYW1lXS5yYWYgPSBfcmVxdWVzdEFGKGFuaW1sb29wKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGFuaW1sb29wKCk7XG5cdH07XG5cdFxuXG5cbnZhciBwdWJsaWNNZXRob2RzID0ge1xuXG5cdC8vIG1ha2UgYSBmZXcgbG9jYWwgdmFyaWFibGVzIGFuZCBmdW5jdGlvbnMgcHVibGljXG5cdHNob3V0OiBfc2hvdXQsXG5cdGxpc3RlbjogX2xpc3Rlbixcblx0dmlld3BvcnRTaXplOiBfdmlld3BvcnRTaXplLFxuXHRvcHRpb25zOiBfb3B0aW9ucyxcblxuXHRpc01haW5TY3JvbGxBbmltYXRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfbWFpblNjcm9sbEFuaW1hdGluZztcblx0fSxcblx0Z2V0Wm9vbUxldmVsOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gX2N1cnJab29tTGV2ZWw7XG5cdH0sXG5cdGdldEN1cnJlbnRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIF9jdXJyZW50SXRlbUluZGV4O1xuXHR9LFxuXHRpc0RyYWdnaW5nOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gX2lzRHJhZ2dpbmc7XG5cdH0sXHRcblx0aXNab29taW5nOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gX2lzWm9vbWluZztcblx0fSxcblx0c2V0U2Nyb2xsT2Zmc2V0OiBmdW5jdGlvbih4LHkpIHtcblx0XHRfb2Zmc2V0LnggPSB4O1xuXHRcdF9jdXJyZW50V2luZG93U2Nyb2xsWSA9IF9vZmZzZXQueSA9IHk7XG5cdFx0X3Nob3V0KCd1cGRhdGVTY3JvbGxPZmZzZXQnLCBfb2Zmc2V0KTtcblx0fSxcblx0YXBwbHlab29tUGFuOiBmdW5jdGlvbih6b29tTGV2ZWwscGFuWCxwYW5ZLGFsbG93UmVuZGVyUmVzb2x1dGlvbikge1xuXHRcdF9wYW5PZmZzZXQueCA9IHBhblg7XG5cdFx0X3Bhbk9mZnNldC55ID0gcGFuWTtcblx0XHRfY3Vyclpvb21MZXZlbCA9IHpvb21MZXZlbDtcblx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbiggYWxsb3dSZW5kZXJSZXNvbHV0aW9uICk7XG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cblx0XHRpZihfaXNPcGVuIHx8IF9pc0Rlc3Ryb3lpbmcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgaTtcblxuXHRcdHNlbGYuZnJhbWV3b3JrID0gZnJhbWV3b3JrOyAvLyBiYXNpYyBmdW5jdGlvbmFsaXR5XG5cdFx0c2VsZi50ZW1wbGF0ZSA9IHRlbXBsYXRlOyAvLyByb290IERPTSBlbGVtZW50IG9mIFBob3RvU3dpcGVcblx0XHRzZWxmLmJnID0gZnJhbWV3b3JrLmdldENoaWxkQnlDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3BfX2JnJyk7XG5cblx0XHRfaW5pdGFsQ2xhc3NOYW1lID0gdGVtcGxhdGUuY2xhc3NOYW1lO1xuXHRcdF9pc09wZW4gPSB0cnVlO1xuXHRcdFx0XHRcblx0XHRfZmVhdHVyZXMgPSBmcmFtZXdvcmsuZGV0ZWN0RmVhdHVyZXMoKTtcblx0XHRfcmVxdWVzdEFGID0gX2ZlYXR1cmVzLnJhZjtcblx0XHRfY2FuY2VsQUYgPSBfZmVhdHVyZXMuY2FmO1xuXHRcdF90cmFuc2Zvcm1LZXkgPSBfZmVhdHVyZXMudHJhbnNmb3JtO1xuXHRcdF9vbGRJRSA9IF9mZWF0dXJlcy5vbGRJRTtcblx0XHRcblx0XHRzZWxmLnNjcm9sbFdyYXAgPSBmcmFtZXdvcmsuZ2V0Q2hpbGRCeUNsYXNzKHRlbXBsYXRlLCAncHN3cF9fc2Nyb2xsLXdyYXAnKTtcblx0XHRzZWxmLmNvbnRhaW5lciA9IGZyYW1ld29yay5nZXRDaGlsZEJ5Q2xhc3Moc2VsZi5zY3JvbGxXcmFwLCAncHN3cF9fY29udGFpbmVyJyk7XG5cblx0XHRfY29udGFpbmVyU3R5bGUgPSBzZWxmLmNvbnRhaW5lci5zdHlsZTsgLy8gZm9yIGZhc3QgYWNjZXNzXG5cblx0XHQvLyBPYmplY3RzIHRoYXQgaG9sZCBzbGlkZXMgKHRoZXJlIGFyZSBvbmx5IDMgaW4gRE9NKVxuXHRcdHNlbGYuaXRlbUhvbGRlcnMgPSBfaXRlbUhvbGRlcnMgPSBbXG5cdFx0XHR7ZWw6c2VsZi5jb250YWluZXIuY2hpbGRyZW5bMF0gLCB3cmFwOjAsIGluZGV4OiAtMX0sXG5cdFx0XHR7ZWw6c2VsZi5jb250YWluZXIuY2hpbGRyZW5bMV0gLCB3cmFwOjAsIGluZGV4OiAtMX0sXG5cdFx0XHR7ZWw6c2VsZi5jb250YWluZXIuY2hpbGRyZW5bMl0gLCB3cmFwOjAsIGluZGV4OiAtMX1cblx0XHRdO1xuXG5cdFx0Ly8gaGlkZSBuZWFyYnkgaXRlbSBob2xkZXJzIHVudGlsIGluaXRpYWwgem9vbSBhbmltYXRpb24gZmluaXNoZXMgKHRvIGF2b2lkIGV4dHJhIFBhaW50cylcblx0XHRfaXRlbUhvbGRlcnNbMF0uZWwuc3R5bGUuZGlzcGxheSA9IF9pdGVtSG9sZGVyc1syXS5lbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG5cdFx0X3NldHVwVHJhbnNmb3JtcygpO1xuXG5cdFx0Ly8gU2V0dXAgZ2xvYmFsIGV2ZW50c1xuXHRcdF9nbG9iYWxFdmVudEhhbmRsZXJzID0ge1xuXHRcdFx0cmVzaXplOiBzZWxmLnVwZGF0ZVNpemUsXG5cdFx0XHRzY3JvbGw6IF91cGRhdGVQYWdlU2Nyb2xsT2Zmc2V0LFxuXHRcdFx0a2V5ZG93bjogX29uS2V5RG93bixcblx0XHRcdGNsaWNrOiBfb25HbG9iYWxDbGlja1xuXHRcdH07XG5cblx0XHQvLyBkaXNhYmxlIHNob3cvaGlkZSBlZmZlY3RzIG9uIG9sZCBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgQ1NTIGFuaW1hdGlvbnMgb3IgdHJhbnNmb3JtcywgXG5cdFx0Ly8gb2xkIElPUywgQW5kcm9pZCBhbmQgT3BlcmEgbW9iaWxlLiBCbGFja2JlcnJ5IHNlZW1zIHRvIHdvcmsgZmluZSwgZXZlbiBvbGRlciBtb2RlbHMuXG5cdFx0dmFyIG9sZFBob25lID0gX2ZlYXR1cmVzLmlzT2xkSU9TUGhvbmUgfHwgX2ZlYXR1cmVzLmlzT2xkQW5kcm9pZCB8fCBfZmVhdHVyZXMuaXNNb2JpbGVPcGVyYTtcblx0XHRpZighX2ZlYXR1cmVzLmFuaW1hdGlvbk5hbWUgfHwgIV9mZWF0dXJlcy50cmFuc2Zvcm0gfHwgb2xkUGhvbmUpIHtcblx0XHRcdF9vcHRpb25zLnNob3dBbmltYXRpb25EdXJhdGlvbiA9IF9vcHRpb25zLmhpZGVBbmltYXRpb25EdXJhdGlvbiA9IDA7XG5cdFx0fVxuXG5cdFx0Ly8gaW5pdCBtb2R1bGVzXG5cdFx0Zm9yKGkgPSAwOyBpIDwgX21vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHNlbGZbJ2luaXQnICsgX21vZHVsZXNbaV1dKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIGluaXRcblx0XHRpZihVaUNsYXNzKSB7XG5cdFx0XHR2YXIgdWkgPSBzZWxmLnVpID0gbmV3IFVpQ2xhc3Moc2VsZiwgZnJhbWV3b3JrKTtcblx0XHRcdHVpLmluaXQoKTtcblx0XHR9XG5cblx0XHRfc2hvdXQoJ2ZpcnN0VXBkYXRlJyk7XG5cdFx0X2N1cnJlbnRJdGVtSW5kZXggPSBfY3VycmVudEl0ZW1JbmRleCB8fCBfb3B0aW9ucy5pbmRleCB8fCAwO1xuXHRcdC8vIHZhbGlkYXRlIGluZGV4XG5cdFx0aWYoIGlzTmFOKF9jdXJyZW50SXRlbUluZGV4KSB8fCBfY3VycmVudEl0ZW1JbmRleCA8IDAgfHwgX2N1cnJlbnRJdGVtSW5kZXggPj0gX2dldE51bUl0ZW1zKCkgKSB7XG5cdFx0XHRfY3VycmVudEl0ZW1JbmRleCA9IDA7XG5cdFx0fVxuXHRcdHNlbGYuY3Vyckl0ZW0gPSBfZ2V0SXRlbUF0KCBfY3VycmVudEl0ZW1JbmRleCApO1xuXG5cdFx0XG5cdFx0aWYoX2ZlYXR1cmVzLmlzT2xkSU9TUGhvbmUgfHwgX2ZlYXR1cmVzLmlzT2xkQW5kcm9pZCkge1xuXHRcdFx0X2lzRml4ZWRQb3NpdGlvbiA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0XHR0ZW1wbGF0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cdFx0aWYoX29wdGlvbnMubW9kYWwpIHtcblx0XHRcdGlmKCFfaXNGaXhlZFBvc2l0aW9uKSB7XG5cdFx0XHRcdHRlbXBsYXRlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHRcdFx0dGVtcGxhdGUuc3R5bGUudG9wID0gZnJhbWV3b3JrLmdldFNjcm9sbFkoKSArICdweCc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0ZW1wbGF0ZS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoX2N1cnJlbnRXaW5kb3dTY3JvbGxZID09PSB1bmRlZmluZWQpIHtcblx0XHRcdF9zaG91dCgnaW5pdGlhbExheW91dCcpO1xuXHRcdFx0X2N1cnJlbnRXaW5kb3dTY3JvbGxZID0gX2luaXRhbFdpbmRvd1Njcm9sbFkgPSBmcmFtZXdvcmsuZ2V0U2Nyb2xsWSgpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBhZGQgY2xhc3NlcyB0byByb290IGVsZW1lbnQgb2YgUGhvdG9Td2lwZVxuXHRcdHZhciByb290Q2xhc3NlcyA9ICdwc3dwLS1vcGVuICc7XG5cdFx0aWYoX29wdGlvbnMubWFpbkNsYXNzKSB7XG5cdFx0XHRyb290Q2xhc3NlcyArPSBfb3B0aW9ucy5tYWluQ2xhc3MgKyAnICc7XG5cdFx0fVxuXHRcdGlmKF9vcHRpb25zLnNob3dIaWRlT3BhY2l0eSkge1xuXHRcdFx0cm9vdENsYXNzZXMgKz0gJ3Bzd3AtLWFuaW1hdGVfb3BhY2l0eSAnO1xuXHRcdH1cblx0XHRyb290Q2xhc3NlcyArPSBfbGlrZWx5VG91Y2hEZXZpY2UgPyAncHN3cC0tdG91Y2gnIDogJ3Bzd3AtLW5vdG91Y2gnO1xuXHRcdHJvb3RDbGFzc2VzICs9IF9mZWF0dXJlcy5hbmltYXRpb25OYW1lID8gJyBwc3dwLS1jc3NfYW5pbWF0aW9uJyA6ICcnO1xuXHRcdHJvb3RDbGFzc2VzICs9IF9mZWF0dXJlcy5zdmcgPyAnIHBzd3AtLXN2ZycgOiAnJztcblx0XHRmcmFtZXdvcmsuYWRkQ2xhc3ModGVtcGxhdGUsIHJvb3RDbGFzc2VzKTtcblxuXHRcdHNlbGYudXBkYXRlU2l6ZSgpO1xuXG5cdFx0Ly8gaW5pdGlhbCB1cGRhdGVcblx0XHRfY29udGFpbmVyU2hpZnRJbmRleCA9IC0xO1xuXHRcdF9pbmRleERpZmYgPSBudWxsO1xuXHRcdGZvcihpID0gMDsgaSA8IE5VTV9IT0xERVJTOyBpKyspIHtcblx0XHRcdF9zZXRUcmFuc2xhdGVYKCAoaStfY29udGFpbmVyU2hpZnRJbmRleCkgKiBfc2xpZGVTaXplLngsIF9pdGVtSG9sZGVyc1tpXS5lbC5zdHlsZSk7XG5cdFx0fVxuXG5cdFx0aWYoIV9vbGRJRSkge1xuXHRcdFx0ZnJhbWV3b3JrLmJpbmQoc2VsZi5zY3JvbGxXcmFwLCBfZG93bkV2ZW50cywgc2VsZik7IC8vIG5vIGRyYWdnaW5nIGZvciBvbGQgSUVcblx0XHR9XHRcblxuXHRcdF9saXN0ZW4oJ2luaXRpYWxab29tSW5FbmQnLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuc2V0Q29udGVudChfaXRlbUhvbGRlcnNbMF0sIF9jdXJyZW50SXRlbUluZGV4LTEpO1xuXHRcdFx0c2VsZi5zZXRDb250ZW50KF9pdGVtSG9sZGVyc1syXSwgX2N1cnJlbnRJdGVtSW5kZXgrMSk7XG5cblx0XHRcdF9pdGVtSG9sZGVyc1swXS5lbC5zdHlsZS5kaXNwbGF5ID0gX2l0ZW1Ib2xkZXJzWzJdLmVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG5cdFx0XHRpZihfb3B0aW9ucy5mb2N1cykge1xuXHRcdFx0XHQvLyBmb2N1cyBjYXVzZXMgbGF5b3V0LCBcblx0XHRcdFx0Ly8gd2hpY2ggY2F1c2VzIGxhZyBkdXJpbmcgdGhlIGFuaW1hdGlvbiwgXG5cdFx0XHRcdC8vIHRoYXQncyB3aHkgd2UgZGVsYXkgaXQgdW50aWxsIHRoZSBpbml0aWFsIHpvb20gdHJhbnNpdGlvbiBlbmRzXG5cdFx0XHRcdHRlbXBsYXRlLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0XHQgXG5cblx0XHRcdF9iaW5kRXZlbnRzKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBzZXQgY29udGVudCBmb3IgY2VudGVyIHNsaWRlIChmaXJzdCB0aW1lKVxuXHRcdHNlbGYuc2V0Q29udGVudChfaXRlbUhvbGRlcnNbMV0sIF9jdXJyZW50SXRlbUluZGV4KTtcblx0XHRcblx0XHRzZWxmLnVwZGF0ZUN1cnJJdGVtKCk7XG5cblx0XHRfc2hvdXQoJ2FmdGVySW5pdCcpO1xuXG5cdFx0aWYoIV9pc0ZpeGVkUG9zaXRpb24pIHtcblxuXHRcdFx0Ly8gT24gYWxsIHZlcnNpb25zIG9mIGlPUyBsb3dlciB0aGFuIDguMCwgd2UgY2hlY2sgc2l6ZSBvZiB2aWV3cG9ydCBldmVyeSBzZWNvbmQuXG5cdFx0XHQvLyBcblx0XHRcdC8vIFRoaXMgaXMgZG9uZSB0byBkZXRlY3Qgd2hlbiBTYWZhcmkgdG9wICYgYm90dG9tIGJhcnMgYXBwZWFyLCBcblx0XHRcdC8vIGFzIHRoaXMgYWN0aW9uIGRvZXNuJ3QgdHJpZ2dlciBhbnkgZXZlbnRzIChsaWtlIHJlc2l6ZSkuIFxuXHRcdFx0Ly8gXG5cdFx0XHQvLyBPbiBpT1M4IHRoZXkgZml4ZWQgdGhpcy5cblx0XHRcdC8vIFxuXHRcdFx0Ly8gMTAgTm92IDIwMTQ6IGlPUyA3IHVzYWdlIH40MCUuIGlPUyA4IHVzYWdlIDU2JS5cblx0XHRcdFxuXHRcdFx0X3VwZGF0ZVNpemVJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZighX251bUFuaW1hdGlvbnMgJiYgIV9pc0RyYWdnaW5nICYmICFfaXNab29taW5nICYmIChfY3Vyclpvb21MZXZlbCA9PT0gc2VsZi5jdXJySXRlbS5pbml0aWFsWm9vbUxldmVsKSAgKSB7XG5cdFx0XHRcdFx0c2VsZi51cGRhdGVTaXplKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIDEwMDApO1xuXHRcdH1cblxuXHRcdGZyYW1ld29yay5hZGRDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3AtLXZpc2libGUnKTtcblx0fSxcblxuXHQvLyBDbG9zZSB0aGUgZ2FsbGVyeSwgdGhlbiBkZXN0cm95IGl0XG5cdGNsb3NlOiBmdW5jdGlvbigpIHtcblx0XHRpZighX2lzT3Blbikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdF9pc09wZW4gPSBmYWxzZTtcblx0XHRfaXNEZXN0cm95aW5nID0gdHJ1ZTtcblx0XHRfc2hvdXQoJ2Nsb3NlJyk7XG5cdFx0X3VuYmluZEV2ZW50cygpO1xuXG5cdFx0X3Nob3dPckhpZGUoc2VsZi5jdXJySXRlbSwgbnVsbCwgdHJ1ZSwgc2VsZi5kZXN0cm95KTtcblx0fSxcblxuXHQvLyBkZXN0cm95cyB0aGUgZ2FsbGVyeSAodW5iaW5kcyBldmVudHMsIGNsZWFucyB1cCBpbnRlcnZhbHMgYW5kIHRpbWVvdXRzIHRvIGF2b2lkIG1lbW9yeSBsZWFrcylcblx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0X3Nob3V0KCdkZXN0cm95Jyk7XG5cblx0XHRpZihfc2hvd09ySGlkZVRpbWVvdXQpIHtcblx0XHRcdGNsZWFyVGltZW91dChfc2hvd09ySGlkZVRpbWVvdXQpO1xuXHRcdH1cblx0XHRcblx0XHR0ZW1wbGF0ZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblx0XHR0ZW1wbGF0ZS5jbGFzc05hbWUgPSBfaW5pdGFsQ2xhc3NOYW1lO1xuXG5cdFx0aWYoX3VwZGF0ZVNpemVJbnRlcnZhbCkge1xuXHRcdFx0Y2xlYXJJbnRlcnZhbChfdXBkYXRlU2l6ZUludGVydmFsKTtcblx0XHR9XG5cblx0XHRmcmFtZXdvcmsudW5iaW5kKHNlbGYuc2Nyb2xsV3JhcCwgX2Rvd25FdmVudHMsIHNlbGYpO1xuXG5cdFx0Ly8gd2UgdW5iaW5kIHNjcm9sbCBldmVudCBhdCB0aGUgZW5kLCBhcyBjbG9zaW5nIGFuaW1hdGlvbiBtYXkgZGVwZW5kIG9uIGl0XG5cdFx0ZnJhbWV3b3JrLnVuYmluZCh3aW5kb3csICdzY3JvbGwnLCBzZWxmKTtcblxuXHRcdF9zdG9wRHJhZ1VwZGF0ZUxvb3AoKTtcblxuXHRcdF9zdG9wQWxsQW5pbWF0aW9ucygpO1xuXG5cdFx0X2xpc3RlbmVycyA9IG51bGw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFBhbiBpbWFnZSB0byBwb3NpdGlvblxuXHQgKiBAcGFyYW0ge051bWJlcn0geCAgICAgXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSB5ICAgICBcblx0ICogQHBhcmFtIHtCb29sZWFufSBmb3JjZSBXaWxsIGlnbm9yZSBib3VuZHMgaWYgc2V0IHRvIHRydWUuXG5cdCAqL1xuXHRwYW5UbzogZnVuY3Rpb24oeCx5LGZvcmNlKSB7XG5cdFx0aWYoIWZvcmNlKSB7XG5cdFx0XHRpZih4ID4gX2N1cnJQYW5Cb3VuZHMubWluLngpIHtcblx0XHRcdFx0eCA9IF9jdXJyUGFuQm91bmRzLm1pbi54O1xuXHRcdFx0fSBlbHNlIGlmKHggPCBfY3VyclBhbkJvdW5kcy5tYXgueCkge1xuXHRcdFx0XHR4ID0gX2N1cnJQYW5Cb3VuZHMubWF4Lng7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHkgPiBfY3VyclBhbkJvdW5kcy5taW4ueSkge1xuXHRcdFx0XHR5ID0gX2N1cnJQYW5Cb3VuZHMubWluLnk7XG5cdFx0XHR9IGVsc2UgaWYoeSA8IF9jdXJyUGFuQm91bmRzLm1heC55KSB7XG5cdFx0XHRcdHkgPSBfY3VyclBhbkJvdW5kcy5tYXgueTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0X3Bhbk9mZnNldC54ID0geDtcblx0XHRfcGFuT2Zmc2V0LnkgPSB5O1xuXHRcdF9hcHBseUN1cnJlbnRab29tUGFuKCk7XG5cdH0sXG5cdFxuXHRoYW5kbGVFdmVudDogZnVuY3Rpb24gKGUpIHtcblx0XHRlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cdFx0aWYoX2dsb2JhbEV2ZW50SGFuZGxlcnNbZS50eXBlXSkge1xuXHRcdFx0X2dsb2JhbEV2ZW50SGFuZGxlcnNbZS50eXBlXShlKTtcblx0XHR9XG5cdH0sXG5cblxuXHRnb1RvOiBmdW5jdGlvbihpbmRleCkge1xuXG5cdFx0aW5kZXggPSBfZ2V0TG9vcGVkSWQoaW5kZXgpO1xuXG5cdFx0dmFyIGRpZmYgPSBpbmRleCAtIF9jdXJyZW50SXRlbUluZGV4O1xuXHRcdF9pbmRleERpZmYgPSBkaWZmO1xuXG5cdFx0X2N1cnJlbnRJdGVtSW5kZXggPSBpbmRleDtcblx0XHRzZWxmLmN1cnJJdGVtID0gX2dldEl0ZW1BdCggX2N1cnJlbnRJdGVtSW5kZXggKTtcblx0XHRfY3VyclBvc2l0aW9uSW5kZXggLT0gZGlmZjtcblx0XHRcblx0XHRfbW92ZU1haW5TY3JvbGwoX3NsaWRlU2l6ZS54ICogX2N1cnJQb3NpdGlvbkluZGV4KTtcblx0XHRcblxuXHRcdF9zdG9wQWxsQW5pbWF0aW9ucygpO1xuXHRcdF9tYWluU2Nyb2xsQW5pbWF0aW5nID0gZmFsc2U7XG5cblx0XHRzZWxmLnVwZGF0ZUN1cnJJdGVtKCk7XG5cdH0sXG5cdG5leHQ6IGZ1bmN0aW9uKCkge1xuXHRcdHNlbGYuZ29UbyggX2N1cnJlbnRJdGVtSW5kZXggKyAxKTtcblx0fSxcblx0cHJldjogZnVuY3Rpb24oKSB7XG5cdFx0c2VsZi5nb1RvKCBfY3VycmVudEl0ZW1JbmRleCAtIDEpO1xuXHR9LFxuXG5cdC8vIHVwZGF0ZSBjdXJyZW50IHpvb20vcGFuIG9iamVjdHNcblx0dXBkYXRlQ3Vyclpvb21JdGVtOiBmdW5jdGlvbihlbXVsYXRlU2V0Q29udGVudCkge1xuXHRcdGlmKGVtdWxhdGVTZXRDb250ZW50KSB7XG5cdFx0XHRfc2hvdXQoJ2JlZm9yZUNoYW5nZScsIDApO1xuXHRcdH1cblxuXHRcdC8vIGl0ZW1Ib2xkZXJbMV0gaXMgbWlkZGxlIChjdXJyZW50KSBpdGVtXG5cdFx0aWYoX2l0ZW1Ib2xkZXJzWzFdLmVsLmNoaWxkcmVuLmxlbmd0aCkge1xuXHRcdFx0dmFyIHpvb21FbGVtZW50ID0gX2l0ZW1Ib2xkZXJzWzFdLmVsLmNoaWxkcmVuWzBdO1xuXHRcdFx0aWYoIGZyYW1ld29yay5oYXNDbGFzcyh6b29tRWxlbWVudCwgJ3Bzd3BfX3pvb20td3JhcCcpICkge1xuXHRcdFx0XHRfY3Vyclpvb21FbGVtZW50U3R5bGUgPSB6b29tRWxlbWVudC5zdHlsZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9jdXJyWm9vbUVsZW1lbnRTdHlsZSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdF9jdXJyWm9vbUVsZW1lbnRTdHlsZSA9IG51bGw7XG5cdFx0fVxuXHRcdFxuXHRcdF9jdXJyUGFuQm91bmRzID0gc2VsZi5jdXJySXRlbS5ib3VuZHM7XHRcblx0XHRfc3RhcnRab29tTGV2ZWwgPSBfY3Vyclpvb21MZXZlbCA9IHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFpvb21MZXZlbDtcblxuXHRcdF9wYW5PZmZzZXQueCA9IF9jdXJyUGFuQm91bmRzLmNlbnRlci54O1xuXHRcdF9wYW5PZmZzZXQueSA9IF9jdXJyUGFuQm91bmRzLmNlbnRlci55O1xuXG5cdFx0aWYoZW11bGF0ZVNldENvbnRlbnQpIHtcblx0XHRcdF9zaG91dCgnYWZ0ZXJDaGFuZ2UnKTtcblx0XHR9XG5cdH0sXG5cblxuXHRpbnZhbGlkYXRlQ3Vyckl0ZW1zOiBmdW5jdGlvbigpIHtcblx0XHRfaXRlbXNOZWVkVXBkYXRlID0gdHJ1ZTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgTlVNX0hPTERFUlM7IGkrKykge1xuXHRcdFx0aWYoIF9pdGVtSG9sZGVyc1tpXS5pdGVtICkge1xuXHRcdFx0XHRfaXRlbUhvbGRlcnNbaV0uaXRlbS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdHVwZGF0ZUN1cnJJdGVtOiBmdW5jdGlvbihiZWZvcmVBbmltYXRpb24pIHtcblxuXHRcdGlmKF9pbmRleERpZmYgPT09IDApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgZGlmZkFicyA9IE1hdGguYWJzKF9pbmRleERpZmYpLFxuXHRcdFx0dGVtcEhvbGRlcjtcblxuXHRcdGlmKGJlZm9yZUFuaW1hdGlvbiAmJiBkaWZmQWJzIDwgMikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXG5cdFx0c2VsZi5jdXJySXRlbSA9IF9nZXRJdGVtQXQoIF9jdXJyZW50SXRlbUluZGV4ICk7XG5cdFx0X3JlbmRlck1heFJlc29sdXRpb24gPSBmYWxzZTtcblx0XHRcblx0XHRfc2hvdXQoJ2JlZm9yZUNoYW5nZScsIF9pbmRleERpZmYpO1xuXG5cdFx0aWYoZGlmZkFicyA+PSBOVU1fSE9MREVSUykge1xuXHRcdFx0X2NvbnRhaW5lclNoaWZ0SW5kZXggKz0gX2luZGV4RGlmZiArIChfaW5kZXhEaWZmID4gMCA/IC1OVU1fSE9MREVSUyA6IE5VTV9IT0xERVJTKTtcblx0XHRcdGRpZmZBYnMgPSBOVU1fSE9MREVSUztcblx0XHR9XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IGRpZmZBYnM7IGkrKykge1xuXHRcdFx0aWYoX2luZGV4RGlmZiA+IDApIHtcblx0XHRcdFx0dGVtcEhvbGRlciA9IF9pdGVtSG9sZGVycy5zaGlmdCgpO1xuXHRcdFx0XHRfaXRlbUhvbGRlcnNbTlVNX0hPTERFUlMtMV0gPSB0ZW1wSG9sZGVyOyAvLyBtb3ZlIGZpcnN0IHRvIGxhc3RcblxuXHRcdFx0XHRfY29udGFpbmVyU2hpZnRJbmRleCsrO1xuXHRcdFx0XHRfc2V0VHJhbnNsYXRlWCggKF9jb250YWluZXJTaGlmdEluZGV4KzIpICogX3NsaWRlU2l6ZS54LCB0ZW1wSG9sZGVyLmVsLnN0eWxlKTtcblx0XHRcdFx0c2VsZi5zZXRDb250ZW50KHRlbXBIb2xkZXIsIF9jdXJyZW50SXRlbUluZGV4IC0gZGlmZkFicyArIGkgKyAxICsgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0ZW1wSG9sZGVyID0gX2l0ZW1Ib2xkZXJzLnBvcCgpO1xuXHRcdFx0XHRfaXRlbUhvbGRlcnMudW5zaGlmdCggdGVtcEhvbGRlciApOyAvLyBtb3ZlIGxhc3QgdG8gZmlyc3RcblxuXHRcdFx0XHRfY29udGFpbmVyU2hpZnRJbmRleC0tO1xuXHRcdFx0XHRfc2V0VHJhbnNsYXRlWCggX2NvbnRhaW5lclNoaWZ0SW5kZXggKiBfc2xpZGVTaXplLngsIHRlbXBIb2xkZXIuZWwuc3R5bGUpO1xuXHRcdFx0XHRzZWxmLnNldENvbnRlbnQodGVtcEhvbGRlciwgX2N1cnJlbnRJdGVtSW5kZXggKyBkaWZmQWJzIC0gaSAtIDEgLSAxKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblxuXHRcdC8vIHJlc2V0IHpvb20vcGFuIG9uIHByZXZpb3VzIGl0ZW1cblx0XHRpZihfY3Vyclpvb21FbGVtZW50U3R5bGUgJiYgTWF0aC5hYnMoX2luZGV4RGlmZikgPT09IDEpIHtcblxuXHRcdFx0dmFyIHByZXZJdGVtID0gX2dldEl0ZW1BdChfcHJldkl0ZW1JbmRleCk7XG5cdFx0XHRpZihwcmV2SXRlbS5pbml0aWFsWm9vbUxldmVsICE9PSBfY3Vyclpvb21MZXZlbCkge1xuXHRcdFx0XHRfY2FsY3VsYXRlSXRlbVNpemUocHJldkl0ZW0gLCBfdmlld3BvcnRTaXplICk7XG5cdFx0XHRcdF9zZXRJbWFnZVNpemUocHJldkl0ZW0pO1xuXHRcdFx0XHRfYXBwbHlab29tUGFuVG9JdGVtKCBwcmV2SXRlbSApOyBcdFx0XHRcdFxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0Ly8gcmVzZXQgZGlmZiBhZnRlciB1cGRhdGVcblx0XHRfaW5kZXhEaWZmID0gMDtcblxuXHRcdHNlbGYudXBkYXRlQ3Vyclpvb21JdGVtKCk7XG5cblx0XHRfcHJldkl0ZW1JbmRleCA9IF9jdXJyZW50SXRlbUluZGV4O1xuXG5cdFx0X3Nob3V0KCdhZnRlckNoYW5nZScpO1xuXHRcdFxuXHR9LFxuXG5cblxuXHR1cGRhdGVTaXplOiBmdW5jdGlvbihmb3JjZSkge1xuXHRcdFxuXHRcdGlmKCFfaXNGaXhlZFBvc2l0aW9uICYmIF9vcHRpb25zLm1vZGFsKSB7XG5cdFx0XHR2YXIgd2luZG93U2Nyb2xsWSA9IGZyYW1ld29yay5nZXRTY3JvbGxZKCk7XG5cdFx0XHRpZihfY3VycmVudFdpbmRvd1Njcm9sbFkgIT09IHdpbmRvd1Njcm9sbFkpIHtcblx0XHRcdFx0dGVtcGxhdGUuc3R5bGUudG9wID0gd2luZG93U2Nyb2xsWSArICdweCc7XG5cdFx0XHRcdF9jdXJyZW50V2luZG93U2Nyb2xsWSA9IHdpbmRvd1Njcm9sbFk7XG5cdFx0XHR9XG5cdFx0XHRpZighZm9yY2UgJiYgX3dpbmRvd1Zpc2libGVTaXplLnggPT09IHdpbmRvdy5pbm5lcldpZHRoICYmIF93aW5kb3dWaXNpYmxlU2l6ZS55ID09PSB3aW5kb3cuaW5uZXJIZWlnaHQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0X3dpbmRvd1Zpc2libGVTaXplLnggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHRcdF93aW5kb3dWaXNpYmxlU2l6ZS55ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5cdFx0XHQvL3RlbXBsYXRlLnN0eWxlLndpZHRoID0gX3dpbmRvd1Zpc2libGVTaXplLnggKyAncHgnO1xuXHRcdFx0dGVtcGxhdGUuc3R5bGUuaGVpZ2h0ID0gX3dpbmRvd1Zpc2libGVTaXplLnkgKyAncHgnO1xuXHRcdH1cblxuXG5cblx0XHRfdmlld3BvcnRTaXplLnggPSBzZWxmLnNjcm9sbFdyYXAuY2xpZW50V2lkdGg7XG5cdFx0X3ZpZXdwb3J0U2l6ZS55ID0gc2VsZi5zY3JvbGxXcmFwLmNsaWVudEhlaWdodDtcblxuXHRcdF91cGRhdGVQYWdlU2Nyb2xsT2Zmc2V0KCk7XG5cblx0XHRfc2xpZGVTaXplLnggPSBfdmlld3BvcnRTaXplLnggKyBNYXRoLnJvdW5kKF92aWV3cG9ydFNpemUueCAqIF9vcHRpb25zLnNwYWNpbmcpO1xuXHRcdF9zbGlkZVNpemUueSA9IF92aWV3cG9ydFNpemUueTtcblxuXHRcdF9tb3ZlTWFpblNjcm9sbChfc2xpZGVTaXplLnggKiBfY3VyclBvc2l0aW9uSW5kZXgpO1xuXG5cdFx0X3Nob3V0KCdiZWZvcmVSZXNpemUnKTsgLy8gZXZlbiBtYXkgYmUgdXNlZCBmb3IgZXhhbXBsZSB0byBzd2l0Y2ggaW1hZ2Ugc291cmNlc1xuXG5cblx0XHQvLyBkb24ndCByZS1jYWxjdWxhdGUgc2l6ZSBvbiBpbml0YWwgc2l6ZSB1cGRhdGVcblx0XHRpZihfY29udGFpbmVyU2hpZnRJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG5cblx0XHRcdHZhciBob2xkZXIsXG5cdFx0XHRcdGl0ZW0sXG5cdFx0XHRcdGhJbmRleDtcblxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IE5VTV9IT0xERVJTOyBpKyspIHtcblx0XHRcdFx0aG9sZGVyID0gX2l0ZW1Ib2xkZXJzW2ldO1xuXHRcdFx0XHRfc2V0VHJhbnNsYXRlWCggKGkrX2NvbnRhaW5lclNoaWZ0SW5kZXgpICogX3NsaWRlU2l6ZS54LCBob2xkZXIuZWwuc3R5bGUpO1xuXG5cdFx0XHRcdGhJbmRleCA9IF9jdXJyZW50SXRlbUluZGV4K2ktMTtcblxuXHRcdFx0XHRpZihfb3B0aW9ucy5sb29wICYmIF9nZXROdW1JdGVtcygpID4gMikge1xuXHRcdFx0XHRcdGhJbmRleCA9IF9nZXRMb29wZWRJZChoSW5kZXgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gdXBkYXRlIHpvb20gbGV2ZWwgb24gaXRlbXMgYW5kIHJlZnJlc2ggc291cmNlIChpZiBuZWVkc1VwZGF0ZSlcblx0XHRcdFx0aXRlbSA9IF9nZXRJdGVtQXQoIGhJbmRleCApO1xuXG5cdFx0XHRcdC8vIHJlLXJlbmRlciBnYWxsZXJ5IGl0ZW0gaWYgYG5lZWRzVXBkYXRlYCxcblx0XHRcdFx0Ly8gb3IgZG9lc24ndCBoYXZlIGBib3VuZHNgIChlbnRpcmVseSBuZXcgc2xpZGUgb2JqZWN0KVxuXHRcdFx0XHRpZiggaXRlbSAmJiAoX2l0ZW1zTmVlZFVwZGF0ZSB8fCBpdGVtLm5lZWRzVXBkYXRlIHx8ICFpdGVtLmJvdW5kcykgKSB7XG5cblx0XHRcdFx0XHRzZWxmLmNsZWFuU2xpZGUoIGl0ZW0gKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRzZWxmLnNldENvbnRlbnQoIGhvbGRlciwgaEluZGV4ICk7XG5cblx0XHRcdFx0XHQvLyBpZiBcImNlbnRlclwiIHNsaWRlXG5cdFx0XHRcdFx0aWYoaSA9PT0gMSkge1xuXHRcdFx0XHRcdFx0c2VsZi5jdXJySXRlbSA9IGl0ZW07XG5cdFx0XHRcdFx0XHRzZWxmLnVwZGF0ZUN1cnJab29tSXRlbSh0cnVlKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpdGVtLm5lZWRzVXBkYXRlID0gZmFsc2U7XG5cblx0XHRcdFx0fSBlbHNlIGlmKGhvbGRlci5pbmRleCA9PT0gLTEgJiYgaEluZGV4ID49IDApIHtcblx0XHRcdFx0XHQvLyBhZGQgY29udGVudCBmaXJzdCB0aW1lXG5cdFx0XHRcdFx0c2VsZi5zZXRDb250ZW50KCBob2xkZXIsIGhJbmRleCApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKGl0ZW0gJiYgaXRlbS5jb250YWluZXIpIHtcblx0XHRcdFx0XHRfY2FsY3VsYXRlSXRlbVNpemUoaXRlbSwgX3ZpZXdwb3J0U2l6ZSk7XG5cdFx0XHRcdFx0X3NldEltYWdlU2l6ZShpdGVtKTtcblx0XHRcdFx0XHRfYXBwbHlab29tUGFuVG9JdGVtKCBpdGVtICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRfaXRlbXNOZWVkVXBkYXRlID0gZmFsc2U7XG5cdFx0fVx0XG5cblx0XHRfc3RhcnRab29tTGV2ZWwgPSBfY3Vyclpvb21MZXZlbCA9IHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFpvb21MZXZlbDtcblx0XHRfY3VyclBhbkJvdW5kcyA9IHNlbGYuY3Vyckl0ZW0uYm91bmRzO1xuXG5cdFx0aWYoX2N1cnJQYW5Cb3VuZHMpIHtcblx0XHRcdF9wYW5PZmZzZXQueCA9IF9jdXJyUGFuQm91bmRzLmNlbnRlci54O1xuXHRcdFx0X3Bhbk9mZnNldC55ID0gX2N1cnJQYW5Cb3VuZHMuY2VudGVyLnk7XG5cdFx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbiggdHJ1ZSApO1xuXHRcdH1cblx0XHRcblx0XHRfc2hvdXQoJ3Jlc2l6ZScpO1xuXHR9LFxuXHRcblx0Ly8gWm9vbSBjdXJyZW50IGl0ZW0gdG9cblx0em9vbVRvOiBmdW5jdGlvbihkZXN0Wm9vbUxldmVsLCBjZW50ZXJQb2ludCwgc3BlZWQsIGVhc2luZ0ZuLCB1cGRhdGVGbikge1xuXHRcdC8qXG5cdFx0XHRpZihkZXN0Wm9vbUxldmVsID09PSAnZml0Jykge1xuXHRcdFx0XHRkZXN0Wm9vbUxldmVsID0gc2VsZi5jdXJySXRlbS5maXRSYXRpbztcblx0XHRcdH0gZWxzZSBpZihkZXN0Wm9vbUxldmVsID09PSAnZmlsbCcpIHtcblx0XHRcdFx0ZGVzdFpvb21MZXZlbCA9IHNlbGYuY3Vyckl0ZW0uZmlsbFJhdGlvO1xuXHRcdFx0fVxuXHRcdCovXG5cblx0XHRpZihjZW50ZXJQb2ludCkge1xuXHRcdFx0X3N0YXJ0Wm9vbUxldmVsID0gX2N1cnJab29tTGV2ZWw7XG5cdFx0XHRfbWlkWm9vbVBvaW50LnggPSBNYXRoLmFicyhjZW50ZXJQb2ludC54KSAtIF9wYW5PZmZzZXQueCA7XG5cdFx0XHRfbWlkWm9vbVBvaW50LnkgPSBNYXRoLmFicyhjZW50ZXJQb2ludC55KSAtIF9wYW5PZmZzZXQueSA7XG5cdFx0XHRfZXF1YWxpemVQb2ludHMoX3N0YXJ0UGFuT2Zmc2V0LCBfcGFuT2Zmc2V0KTtcblx0XHR9XG5cblx0XHR2YXIgZGVzdFBhbkJvdW5kcyA9IF9jYWxjdWxhdGVQYW5Cb3VuZHMoZGVzdFpvb21MZXZlbCwgZmFsc2UpLFxuXHRcdFx0ZGVzdFBhbk9mZnNldCA9IHt9O1xuXG5cdFx0X21vZGlmeURlc3RQYW5PZmZzZXQoJ3gnLCBkZXN0UGFuQm91bmRzLCBkZXN0UGFuT2Zmc2V0LCBkZXN0Wm9vbUxldmVsKTtcblx0XHRfbW9kaWZ5RGVzdFBhbk9mZnNldCgneScsIGRlc3RQYW5Cb3VuZHMsIGRlc3RQYW5PZmZzZXQsIGRlc3Rab29tTGV2ZWwpO1xuXG5cdFx0dmFyIGluaXRpYWxab29tTGV2ZWwgPSBfY3Vyclpvb21MZXZlbDtcblx0XHR2YXIgaW5pdGlhbFBhbk9mZnNldCA9IHtcblx0XHRcdHg6IF9wYW5PZmZzZXQueCxcblx0XHRcdHk6IF9wYW5PZmZzZXQueVxuXHRcdH07XG5cblx0XHRfcm91bmRQb2ludChkZXN0UGFuT2Zmc2V0KTtcblxuXHRcdHZhciBvblVwZGF0ZSA9IGZ1bmN0aW9uKG5vdykge1xuXHRcdFx0aWYobm93ID09PSAxKSB7XG5cdFx0XHRcdF9jdXJyWm9vbUxldmVsID0gZGVzdFpvb21MZXZlbDtcblx0XHRcdFx0X3Bhbk9mZnNldC54ID0gZGVzdFBhbk9mZnNldC54O1xuXHRcdFx0XHRfcGFuT2Zmc2V0LnkgPSBkZXN0UGFuT2Zmc2V0Lnk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfY3Vyclpvb21MZXZlbCA9IChkZXN0Wm9vbUxldmVsIC0gaW5pdGlhbFpvb21MZXZlbCkgKiBub3cgKyBpbml0aWFsWm9vbUxldmVsO1xuXHRcdFx0XHRfcGFuT2Zmc2V0LnggPSAoZGVzdFBhbk9mZnNldC54IC0gaW5pdGlhbFBhbk9mZnNldC54KSAqIG5vdyArIGluaXRpYWxQYW5PZmZzZXQueDtcblx0XHRcdFx0X3Bhbk9mZnNldC55ID0gKGRlc3RQYW5PZmZzZXQueSAtIGluaXRpYWxQYW5PZmZzZXQueSkgKiBub3cgKyBpbml0aWFsUGFuT2Zmc2V0Lnk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHVwZGF0ZUZuKSB7XG5cdFx0XHRcdHVwZGF0ZUZuKG5vdyk7XG5cdFx0XHR9XG5cblx0XHRcdF9hcHBseUN1cnJlbnRab29tUGFuKCBub3cgPT09IDEgKTtcblx0XHR9O1xuXG5cdFx0aWYoc3BlZWQpIHtcblx0XHRcdF9hbmltYXRlUHJvcCgnY3VzdG9tWm9vbVRvJywgMCwgMSwgc3BlZWQsIGVhc2luZ0ZuIHx8IGZyYW1ld29yay5lYXNpbmcuc2luZS5pbk91dCwgb25VcGRhdGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvblVwZGF0ZSgxKTtcblx0XHR9XG5cdH1cblxuXG59O1xuXG5cbi8qPj5jb3JlKi9cblxuLyo+Pmdlc3R1cmVzKi9cbi8qKlxuICogTW91c2UvdG91Y2gvcG9pbnRlciBldmVudCBoYW5kbGVycy5cbiAqIFxuICogc2VwYXJhdGVkIGZyb20gQGNvcmUuanMgZm9yIHJlYWRhYmlsaXR5XG4gKi9cblxudmFyIE1JTl9TV0lQRV9ESVNUQU5DRSA9IDMwLFxuXHRESVJFQ1RJT05fQ0hFQ0tfT0ZGU0VUID0gMTA7IC8vIGFtb3VudCBvZiBwaXhlbHMgdG8gZHJhZyB0byBkZXRlcm1pbmUgZGlyZWN0aW9uIG9mIHN3aXBlXG5cbnZhciBfZ2VzdHVyZVN0YXJ0VGltZSxcblx0X2dlc3R1cmVDaGVja1NwZWVkVGltZSxcblxuXHQvLyBwb29sIG9mIG9iamVjdHMgdGhhdCBhcmUgdXNlZCBkdXJpbmcgZHJhZ2dpbmcgb2Ygem9vbWluZ1xuXHRwID0ge30sIC8vIGZpcnN0IHBvaW50XG5cdHAyID0ge30sIC8vIHNlY29uZCBwb2ludCAoZm9yIHpvb20gZ2VzdHVyZSlcblx0ZGVsdGEgPSB7fSxcblx0X2N1cnJQb2ludCA9IHt9LFxuXHRfc3RhcnRQb2ludCA9IHt9LFxuXHRfY3VyclBvaW50ZXJzID0gW10sXG5cdF9zdGFydE1haW5TY3JvbGxQb3MgPSB7fSxcblx0X3JlbGVhc2VBbmltRGF0YSxcblx0X3Bvc1BvaW50cyA9IFtdLCAvLyBhcnJheSBvZiBwb2ludHMgZHVyaW5nIGRyYWdnaW5nLCB1c2VkIHRvIGRldGVybWluZSB0eXBlIG9mIGdlc3R1cmVcblx0X3RlbXBQb2ludCA9IHt9LFxuXG5cdF9pc1pvb21pbmdJbixcblx0X3ZlcnRpY2FsRHJhZ0luaXRpYXRlZCxcblx0X29sZEFuZHJvaWRUb3VjaEVuZFRpbWVvdXQsXG5cdF9jdXJyWm9vbWVkSXRlbUluZGV4ID0gMCxcblx0X2NlbnRlclBvaW50ID0gX2dldEVtcHR5UG9pbnQoKSxcblx0X2xhc3RSZWxlYXNlVGltZSA9IDAsXG5cdF9pc0RyYWdnaW5nLCAvLyBhdCBsZWFzdCBvbmUgcG9pbnRlciBpcyBkb3duXG5cdF9pc011bHRpdG91Y2gsIC8vIGF0IGxlYXN0IHR3byBfcG9pbnRlcnMgYXJlIGRvd25cblx0X3pvb21TdGFydGVkLCAvLyB6b29tIGxldmVsIGNoYW5nZWQgZHVyaW5nIHpvb20gZ2VzdHVyZVxuXHRfbW92ZWQsXG5cdF9kcmFnQW5pbUZyYW1lLFxuXHRfbWFpblNjcm9sbFNoaWZ0ZWQsXG5cdF9jdXJyZW50UG9pbnRzLCAvLyBhcnJheSBvZiBjdXJyZW50IHRvdWNoIHBvaW50c1xuXHRfaXNab29taW5nLFxuXHRfY3VyclBvaW50c0Rpc3RhbmNlLFxuXHRfc3RhcnRQb2ludHNEaXN0YW5jZSxcblx0X2N1cnJQYW5Cb3VuZHMsXG5cdF9tYWluU2Nyb2xsUG9zID0gX2dldEVtcHR5UG9pbnQoKSxcblx0X2N1cnJab29tRWxlbWVudFN0eWxlLFxuXHRfbWFpblNjcm9sbEFuaW1hdGluZywgLy8gdHJ1ZSwgaWYgYW5pbWF0aW9uIGFmdGVyIHN3aXBlIGdlc3R1cmUgaXMgcnVubmluZ1xuXHRfbWlkWm9vbVBvaW50ID0gX2dldEVtcHR5UG9pbnQoKSxcblx0X2N1cnJDZW50ZXJQb2ludCA9IF9nZXRFbXB0eVBvaW50KCksXG5cdF9kaXJlY3Rpb24sXG5cdF9pc0ZpcnN0TW92ZSxcblx0X29wYWNpdHlDaGFuZ2VkLFxuXHRfYmdPcGFjaXR5LFxuXHRfd2FzT3ZlckluaXRpYWxab29tLFxuXG5cdF9pc0VxdWFsUG9pbnRzID0gZnVuY3Rpb24ocDEsIHAyKSB7XG5cdFx0cmV0dXJuIHAxLnggPT09IHAyLnggJiYgcDEueSA9PT0gcDIueTtcblx0fSxcblx0X2lzTmVhcmJ5UG9pbnRzID0gZnVuY3Rpb24odG91Y2gwLCB0b3VjaDEpIHtcblx0XHRyZXR1cm4gTWF0aC5hYnModG91Y2gwLnggLSB0b3VjaDEueCkgPCBET1VCTEVfVEFQX1JBRElVUyAmJiBNYXRoLmFicyh0b3VjaDAueSAtIHRvdWNoMS55KSA8IERPVUJMRV9UQVBfUkFESVVTO1xuXHR9LFxuXHRfY2FsY3VsYXRlUG9pbnRzRGlzdGFuY2UgPSBmdW5jdGlvbihwMSwgcDIpIHtcblx0XHRfdGVtcFBvaW50LnggPSBNYXRoLmFicyggcDEueCAtIHAyLnggKTtcblx0XHRfdGVtcFBvaW50LnkgPSBNYXRoLmFicyggcDEueSAtIHAyLnkgKTtcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KF90ZW1wUG9pbnQueCAqIF90ZW1wUG9pbnQueCArIF90ZW1wUG9pbnQueSAqIF90ZW1wUG9pbnQueSk7XG5cdH0sXG5cdF9zdG9wRHJhZ1VwZGF0ZUxvb3AgPSBmdW5jdGlvbigpIHtcblx0XHRpZihfZHJhZ0FuaW1GcmFtZSkge1xuXHRcdFx0X2NhbmNlbEFGKF9kcmFnQW5pbUZyYW1lKTtcblx0XHRcdF9kcmFnQW5pbUZyYW1lID0gbnVsbDtcblx0XHR9XG5cdH0sXG5cdF9kcmFnVXBkYXRlTG9vcCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmKF9pc0RyYWdnaW5nKSB7XG5cdFx0XHRfZHJhZ0FuaW1GcmFtZSA9IF9yZXF1ZXN0QUYoX2RyYWdVcGRhdGVMb29wKTtcblx0XHRcdF9yZW5kZXJNb3ZlbWVudCgpO1xuXHRcdH1cblx0fSxcblx0X2NhblBhbiA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAhKF9vcHRpb25zLnNjYWxlTW9kZSA9PT0gJ2ZpdCcgJiYgX2N1cnJab29tTGV2ZWwgPT09ICBzZWxmLmN1cnJJdGVtLmluaXRpYWxab29tTGV2ZWwpO1xuXHR9LFxuXHRcblx0Ly8gZmluZCB0aGUgY2xvc2VzdCBwYXJlbnQgRE9NIGVsZW1lbnRcblx0X2Nsb3Nlc3RFbGVtZW50ID0gZnVuY3Rpb24oZWwsIGZuKSB7XG5cdCAgXHRpZighZWwgfHwgZWwgPT09IGRvY3VtZW50KSB7XG5cdCAgXHRcdHJldHVybiBmYWxzZTtcblx0ICBcdH1cblxuXHQgIFx0Ly8gZG9uJ3Qgc2VhcmNoIGVsZW1lbnRzIGFib3ZlIHBzd3BfX3Njcm9sbC13cmFwXG5cdCAgXHRpZihlbC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgJiYgZWwuZ2V0QXR0cmlidXRlKCdjbGFzcycpLmluZGV4T2YoJ3Bzd3BfX3Njcm9sbC13cmFwJykgPiAtMSApIHtcblx0ICBcdFx0cmV0dXJuIGZhbHNlO1xuXHQgIFx0fVxuXG5cdCAgXHRpZiggZm4oZWwpICkge1xuXHQgIFx0XHRyZXR1cm4gZWw7XG5cdCAgXHR9XG5cblx0ICBcdHJldHVybiBfY2xvc2VzdEVsZW1lbnQoZWwucGFyZW50Tm9kZSwgZm4pO1xuXHR9LFxuXG5cdF9wcmV2ZW50T2JqID0ge30sXG5cdF9wcmV2ZW50RGVmYXVsdEV2ZW50QmVoYXZpb3VyID0gZnVuY3Rpb24oZSwgaXNEb3duKSB7XG5cdCAgICBfcHJldmVudE9iai5wcmV2ZW50ID0gIV9jbG9zZXN0RWxlbWVudChlLnRhcmdldCwgX29wdGlvbnMuaXNDbGlja2FibGVFbGVtZW50KTtcblxuXHRcdF9zaG91dCgncHJldmVudERyYWdFdmVudCcsIGUsIGlzRG93biwgX3ByZXZlbnRPYmopO1xuXHRcdHJldHVybiBfcHJldmVudE9iai5wcmV2ZW50O1xuXG5cdH0sXG5cdF9jb252ZXJ0VG91Y2hUb1BvaW50ID0gZnVuY3Rpb24odG91Y2gsIHApIHtcblx0XHRwLnggPSB0b3VjaC5wYWdlWDtcblx0XHRwLnkgPSB0b3VjaC5wYWdlWTtcblx0XHRwLmlkID0gdG91Y2guaWRlbnRpZmllcjtcblx0XHRyZXR1cm4gcDtcblx0fSxcblx0X2ZpbmRDZW50ZXJPZlBvaW50cyA9IGZ1bmN0aW9uKHAxLCBwMiwgcENlbnRlcikge1xuXHRcdHBDZW50ZXIueCA9IChwMS54ICsgcDIueCkgKiAwLjU7XG5cdFx0cENlbnRlci55ID0gKHAxLnkgKyBwMi55KSAqIDAuNTtcblx0fSxcblx0X3B1c2hQb3NQb2ludCA9IGZ1bmN0aW9uKHRpbWUsIHgsIHkpIHtcblx0XHRpZih0aW1lIC0gX2dlc3R1cmVDaGVja1NwZWVkVGltZSA+IDUwKSB7XG5cdFx0XHR2YXIgbyA9IF9wb3NQb2ludHMubGVuZ3RoID4gMiA/IF9wb3NQb2ludHMuc2hpZnQoKSA6IHt9O1xuXHRcdFx0by54ID0geDtcblx0XHRcdG8ueSA9IHk7IFxuXHRcdFx0X3Bvc1BvaW50cy5wdXNoKG8pO1xuXHRcdFx0X2dlc3R1cmVDaGVja1NwZWVkVGltZSA9IHRpbWU7XG5cdFx0fVxuXHR9LFxuXG5cdF9jYWxjdWxhdGVWZXJ0aWNhbERyYWdPcGFjaXR5UmF0aW8gPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgeU9mZnNldCA9IF9wYW5PZmZzZXQueSAtIHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFBvc2l0aW9uLnk7IC8vIGRpZmZlcmVuY2UgYmV0d2VlbiBpbml0aWFsIGFuZCBjdXJyZW50IHBvc2l0aW9uXG5cdFx0cmV0dXJuIDEgLSAgTWF0aC5hYnMoIHlPZmZzZXQgLyAoX3ZpZXdwb3J0U2l6ZS55IC8gMikgICk7XG5cdH0sXG5cblx0XG5cdC8vIHBvaW50cyBwb29sLCByZXVzZWQgZHVyaW5nIHRvdWNoIGV2ZW50c1xuXHRfZVBvaW50MSA9IHt9LFxuXHRfZVBvaW50MiA9IHt9LFxuXHRfdGVtcFBvaW50c0FyciA9IFtdLFxuXHRfdGVtcENvdW50ZXIsXG5cdF9nZXRUb3VjaFBvaW50cyA9IGZ1bmN0aW9uKGUpIHtcblx0XHQvLyBjbGVhbiB1cCBwcmV2aW91cyBwb2ludHMsIHdpdGhvdXQgcmVjcmVhdGluZyBhcnJheVxuXHRcdHdoaWxlKF90ZW1wUG9pbnRzQXJyLmxlbmd0aCA+IDApIHtcblx0XHRcdF90ZW1wUG9pbnRzQXJyLnBvcCgpO1xuXHRcdH1cblxuXHRcdGlmKCFfcG9pbnRlckV2ZW50RW5hYmxlZCkge1xuXHRcdFx0aWYoZS50eXBlLmluZGV4T2YoJ3RvdWNoJykgPiAtMSkge1xuXG5cdFx0XHRcdGlmKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdF90ZW1wUG9pbnRzQXJyWzBdID0gX2NvbnZlcnRUb3VjaFRvUG9pbnQoZS50b3VjaGVzWzBdLCBfZVBvaW50MSk7XG5cdFx0XHRcdFx0aWYoZS50b3VjaGVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdF90ZW1wUG9pbnRzQXJyWzFdID0gX2NvbnZlcnRUb3VjaFRvUG9pbnQoZS50b3VjaGVzWzFdLCBfZVBvaW50Mik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2VQb2ludDEueCA9IGUucGFnZVg7XG5cdFx0XHRcdF9lUG9pbnQxLnkgPSBlLnBhZ2VZO1xuXHRcdFx0XHRfZVBvaW50MS5pZCA9ICcnO1xuXHRcdFx0XHRfdGVtcFBvaW50c0FyclswXSA9IF9lUG9pbnQxOy8vX2VQb2ludDE7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdF90ZW1wQ291bnRlciA9IDA7XG5cdFx0XHQvLyB3ZSBjYW4gdXNlIGZvckVhY2gsIGFzIHBvaW50ZXIgZXZlbnRzIGFyZSBzdXBwb3J0ZWQgb25seSBpbiBtb2Rlcm4gYnJvd3NlcnNcblx0XHRcdF9jdXJyUG9pbnRlcnMuZm9yRWFjaChmdW5jdGlvbihwKSB7XG5cdFx0XHRcdGlmKF90ZW1wQ291bnRlciA9PT0gMCkge1xuXHRcdFx0XHRcdF90ZW1wUG9pbnRzQXJyWzBdID0gcDtcblx0XHRcdFx0fSBlbHNlIGlmKF90ZW1wQ291bnRlciA9PT0gMSkge1xuXHRcdFx0XHRcdF90ZW1wUG9pbnRzQXJyWzFdID0gcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRfdGVtcENvdW50ZXIrKztcblxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBfdGVtcFBvaW50c0Fycjtcblx0fSxcblxuXHRfcGFuT3JNb3ZlTWFpblNjcm9sbCA9IGZ1bmN0aW9uKGF4aXMsIGRlbHRhKSB7XG5cblx0XHR2YXIgcGFuRnJpY3Rpb24sXG5cdFx0XHRvdmVyRGlmZiA9IDAsXG5cdFx0XHRuZXdPZmZzZXQgPSBfcGFuT2Zmc2V0W2F4aXNdICsgZGVsdGFbYXhpc10sXG5cdFx0XHRzdGFydE92ZXJEaWZmLFxuXHRcdFx0ZGlyID0gZGVsdGFbYXhpc10gPiAwLFxuXHRcdFx0bmV3TWFpblNjcm9sbFBvc2l0aW9uID0gX21haW5TY3JvbGxQb3MueCArIGRlbHRhLngsXG5cdFx0XHRtYWluU2Nyb2xsRGlmZiA9IF9tYWluU2Nyb2xsUG9zLnggLSBfc3RhcnRNYWluU2Nyb2xsUG9zLngsXG5cdFx0XHRuZXdQYW5Qb3MsXG5cdFx0XHRuZXdNYWluU2Nyb2xsUG9zO1xuXG5cdFx0Ly8gY2FsY3VsYXRlIGZkaXN0YW5jZSBvdmVyIHRoZSBib3VuZHMgYW5kIGZyaWN0aW9uXG5cdFx0aWYobmV3T2Zmc2V0ID4gX2N1cnJQYW5Cb3VuZHMubWluW2F4aXNdIHx8IG5ld09mZnNldCA8IF9jdXJyUGFuQm91bmRzLm1heFtheGlzXSkge1xuXHRcdFx0cGFuRnJpY3Rpb24gPSBfb3B0aW9ucy5wYW5FbmRGcmljdGlvbjtcblx0XHRcdC8vIExpbmVhciBpbmNyZWFzaW5nIG9mIGZyaWN0aW9uLCBzbyBhdCAxLzQgb2Ygdmlld3BvcnQgaXQncyBhdCBtYXggdmFsdWUuIFxuXHRcdFx0Ly8gTG9va3Mgbm90IGFzIG5pY2UgYXMgd2FzIGV4cGVjdGVkLiBMZWZ0IGZvciBoaXN0b3J5LlxuXHRcdFx0Ly8gcGFuRnJpY3Rpb24gPSAoMSAtIChfcGFuT2Zmc2V0W2F4aXNdICsgZGVsdGFbYXhpc10gKyBwYW5Cb3VuZHMubWluW2F4aXNdKSAvIChfdmlld3BvcnRTaXplW2F4aXNdIC8gNCkgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGFuRnJpY3Rpb24gPSAxO1xuXHRcdH1cblx0XHRcblx0XHRuZXdPZmZzZXQgPSBfcGFuT2Zmc2V0W2F4aXNdICsgZGVsdGFbYXhpc10gKiBwYW5GcmljdGlvbjtcblxuXHRcdC8vIG1vdmUgbWFpbiBzY3JvbGwgb3Igc3RhcnQgcGFubmluZ1xuXHRcdGlmKF9vcHRpb25zLmFsbG93UGFuVG9OZXh0IHx8IF9jdXJyWm9vbUxldmVsID09PSBzZWxmLmN1cnJJdGVtLmluaXRpYWxab29tTGV2ZWwpIHtcblxuXG5cdFx0XHRpZighX2N1cnJab29tRWxlbWVudFN0eWxlKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRuZXdNYWluU2Nyb2xsUG9zID0gbmV3TWFpblNjcm9sbFBvc2l0aW9uO1xuXG5cdFx0XHR9IGVsc2UgaWYoX2RpcmVjdGlvbiA9PT0gJ2gnICYmIGF4aXMgPT09ICd4JyAmJiAhX3pvb21TdGFydGVkICkge1xuXHRcdFx0XHRcblx0XHRcdFx0aWYoZGlyKSB7XG5cdFx0XHRcdFx0aWYobmV3T2Zmc2V0ID4gX2N1cnJQYW5Cb3VuZHMubWluW2F4aXNdKSB7XG5cdFx0XHRcdFx0XHRwYW5GcmljdGlvbiA9IF9vcHRpb25zLnBhbkVuZEZyaWN0aW9uO1xuXHRcdFx0XHRcdFx0b3ZlckRpZmYgPSBfY3VyclBhbkJvdW5kcy5taW5bYXhpc10gLSBuZXdPZmZzZXQ7XG5cdFx0XHRcdFx0XHRzdGFydE92ZXJEaWZmID0gX2N1cnJQYW5Cb3VuZHMubWluW2F4aXNdIC0gX3N0YXJ0UGFuT2Zmc2V0W2F4aXNdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBkcmFnIHJpZ2h0XG5cdFx0XHRcdFx0aWYoIChzdGFydE92ZXJEaWZmIDw9IDAgfHwgbWFpblNjcm9sbERpZmYgPCAwKSAmJiBfZ2V0TnVtSXRlbXMoKSA+IDEgKSB7XG5cdFx0XHRcdFx0XHRuZXdNYWluU2Nyb2xsUG9zID0gbmV3TWFpblNjcm9sbFBvc2l0aW9uO1xuXHRcdFx0XHRcdFx0aWYobWFpblNjcm9sbERpZmYgPCAwICYmIG5ld01haW5TY3JvbGxQb3NpdGlvbiA+IF9zdGFydE1haW5TY3JvbGxQb3MueCkge1xuXHRcdFx0XHRcdFx0XHRuZXdNYWluU2Nyb2xsUG9zID0gX3N0YXJ0TWFpblNjcm9sbFBvcy54O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZihfY3VyclBhbkJvdW5kcy5taW4ueCAhPT0gX2N1cnJQYW5Cb3VuZHMubWF4LngpIHtcblx0XHRcdFx0XHRcdFx0bmV3UGFuUG9zID0gbmV3T2Zmc2V0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRpZihuZXdPZmZzZXQgPCBfY3VyclBhbkJvdW5kcy5tYXhbYXhpc10gKSB7XG5cdFx0XHRcdFx0XHRwYW5GcmljdGlvbiA9X29wdGlvbnMucGFuRW5kRnJpY3Rpb247XG5cdFx0XHRcdFx0XHRvdmVyRGlmZiA9IG5ld09mZnNldCAtIF9jdXJyUGFuQm91bmRzLm1heFtheGlzXTtcblx0XHRcdFx0XHRcdHN0YXJ0T3ZlckRpZmYgPSBfc3RhcnRQYW5PZmZzZXRbYXhpc10gLSBfY3VyclBhbkJvdW5kcy5tYXhbYXhpc107XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYoIChzdGFydE92ZXJEaWZmIDw9IDAgfHwgbWFpblNjcm9sbERpZmYgPiAwKSAmJiBfZ2V0TnVtSXRlbXMoKSA+IDEgKSB7XG5cdFx0XHRcdFx0XHRuZXdNYWluU2Nyb2xsUG9zID0gbmV3TWFpblNjcm9sbFBvc2l0aW9uO1xuXG5cdFx0XHRcdFx0XHRpZihtYWluU2Nyb2xsRGlmZiA+IDAgJiYgbmV3TWFpblNjcm9sbFBvc2l0aW9uIDwgX3N0YXJ0TWFpblNjcm9sbFBvcy54KSB7XG5cdFx0XHRcdFx0XHRcdG5ld01haW5TY3JvbGxQb3MgPSBfc3RhcnRNYWluU2Nyb2xsUG9zLng7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYoX2N1cnJQYW5Cb3VuZHMubWluLnggIT09IF9jdXJyUGFuQm91bmRzLm1heC54KSB7XG5cdFx0XHRcdFx0XHRcdG5ld1BhblBvcyA9IG5ld09mZnNldDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cblx0XHRcdFx0Ly9cblx0XHRcdH1cblxuXHRcdFx0aWYoYXhpcyA9PT0gJ3gnKSB7XG5cblx0XHRcdFx0aWYobmV3TWFpblNjcm9sbFBvcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0X21vdmVNYWluU2Nyb2xsKG5ld01haW5TY3JvbGxQb3MsIHRydWUpO1xuXHRcdFx0XHRcdGlmKG5ld01haW5TY3JvbGxQb3MgPT09IF9zdGFydE1haW5TY3JvbGxQb3MueCkge1xuXHRcdFx0XHRcdFx0X21haW5TY3JvbGxTaGlmdGVkID0gZmFsc2U7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdF9tYWluU2Nyb2xsU2hpZnRlZCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoX2N1cnJQYW5Cb3VuZHMubWluLnggIT09IF9jdXJyUGFuQm91bmRzLm1heC54KSB7XG5cdFx0XHRcdFx0aWYobmV3UGFuUG9zICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdF9wYW5PZmZzZXQueCA9IG5ld1BhblBvcztcblx0XHRcdFx0XHR9IGVsc2UgaWYoIV9tYWluU2Nyb2xsU2hpZnRlZCkge1xuXHRcdFx0XHRcdFx0X3Bhbk9mZnNldC54ICs9IGRlbHRhLnggKiBwYW5GcmljdGlvbjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbmV3TWFpblNjcm9sbFBvcyAhPT0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYoIV9tYWluU2Nyb2xsQW5pbWF0aW5nKSB7XG5cdFx0XHRcblx0XHRcdGlmKCFfbWFpblNjcm9sbFNoaWZ0ZWQpIHtcblx0XHRcdFx0aWYoX2N1cnJab29tTGV2ZWwgPiBzZWxmLmN1cnJJdGVtLmZpdFJhdGlvKSB7XG5cdFx0XHRcdFx0X3Bhbk9mZnNldFtheGlzXSArPSBkZWx0YVtheGlzXSAqIHBhbkZyaWN0aW9uO1xuXHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdH0sXG5cblx0Ly8gUG9pbnRlcmRvd24vdG91Y2hzdGFydC9tb3VzZWRvd24gaGFuZGxlclxuXHRfb25EcmFnU3RhcnQgPSBmdW5jdGlvbihlKSB7XG5cblx0XHQvLyBBbGxvdyBkcmFnZ2luZyBvbmx5IHZpYSBsZWZ0IG1vdXNlIGJ1dHRvbi5cblx0XHQvLyBBcyB0aGlzIGhhbmRsZXIgaXMgbm90IGFkZGVkIGluIElFOCAtIHdlIGlnbm9yZSBlLndoaWNoXG5cdFx0Ly8gXG5cdFx0Ly8gaHR0cDovL3d3dy5xdWlya3Ntb2RlLm9yZy9qcy9ldmVudHNfcHJvcGVydGllcy5odG1sXG5cdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL2V2ZW50LmJ1dHRvblxuXHRcdGlmKGUudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZS5idXR0b24gPiAwICApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZihfaW5pdGlhbFpvb21SdW5uaW5nKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYoX29sZEFuZHJvaWRUb3VjaEVuZFRpbWVvdXQgJiYgZS50eXBlID09PSAnbW91c2Vkb3duJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmKF9wcmV2ZW50RGVmYXVsdEV2ZW50QmVoYXZpb3VyKGUsIHRydWUpKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXG5cblxuXHRcdF9zaG91dCgncG9pbnRlckRvd24nKTtcblxuXHRcdGlmKF9wb2ludGVyRXZlbnRFbmFibGVkKSB7XG5cdFx0XHR2YXIgcG9pbnRlckluZGV4ID0gZnJhbWV3b3JrLmFycmF5U2VhcmNoKF9jdXJyUG9pbnRlcnMsIGUucG9pbnRlcklkLCAnaWQnKTtcblx0XHRcdGlmKHBvaW50ZXJJbmRleCA8IDApIHtcblx0XHRcdFx0cG9pbnRlckluZGV4ID0gX2N1cnJQb2ludGVycy5sZW5ndGg7XG5cdFx0XHR9XG5cdFx0XHRfY3VyclBvaW50ZXJzW3BvaW50ZXJJbmRleF0gPSB7eDplLnBhZ2VYLCB5OmUucGFnZVksIGlkOiBlLnBvaW50ZXJJZH07XG5cdFx0fVxuXHRcdFxuXG5cblx0XHR2YXIgc3RhcnRQb2ludHNMaXN0ID0gX2dldFRvdWNoUG9pbnRzKGUpLFxuXHRcdFx0bnVtUG9pbnRzID0gc3RhcnRQb2ludHNMaXN0Lmxlbmd0aDtcblxuXHRcdF9jdXJyZW50UG9pbnRzID0gbnVsbDtcblxuXHRcdF9zdG9wQWxsQW5pbWF0aW9ucygpO1xuXG5cdFx0Ly8gaW5pdCBkcmFnXG5cdFx0aWYoIV9pc0RyYWdnaW5nIHx8IG51bVBvaW50cyA9PT0gMSkge1xuXG5cdFx0XHRcblxuXHRcdFx0X2lzRHJhZ2dpbmcgPSBfaXNGaXJzdE1vdmUgPSB0cnVlO1xuXHRcdFx0ZnJhbWV3b3JrLmJpbmQod2luZG93LCBfdXBNb3ZlRXZlbnRzLCBzZWxmKTtcblxuXHRcdFx0X2lzWm9vbWluZ0luID0gXG5cdFx0XHRcdF93YXNPdmVySW5pdGlhbFpvb20gPSBcblx0XHRcdFx0X29wYWNpdHlDaGFuZ2VkID0gXG5cdFx0XHRcdF92ZXJ0aWNhbERyYWdJbml0aWF0ZWQgPSBcblx0XHRcdFx0X21haW5TY3JvbGxTaGlmdGVkID0gXG5cdFx0XHRcdF9tb3ZlZCA9IFxuXHRcdFx0XHRfaXNNdWx0aXRvdWNoID0gXG5cdFx0XHRcdF96b29tU3RhcnRlZCA9IGZhbHNlO1xuXG5cdFx0XHRfZGlyZWN0aW9uID0gbnVsbDtcblxuXHRcdFx0X3Nob3V0KCdmaXJzdFRvdWNoU3RhcnQnLCBzdGFydFBvaW50c0xpc3QpO1xuXG5cdFx0XHRfZXF1YWxpemVQb2ludHMoX3N0YXJ0UGFuT2Zmc2V0LCBfcGFuT2Zmc2V0KTtcblxuXHRcdFx0X2N1cnJQYW5EaXN0LnggPSBfY3VyclBhbkRpc3QueSA9IDA7XG5cdFx0XHRfZXF1YWxpemVQb2ludHMoX2N1cnJQb2ludCwgc3RhcnRQb2ludHNMaXN0WzBdKTtcblx0XHRcdF9lcXVhbGl6ZVBvaW50cyhfc3RhcnRQb2ludCwgX2N1cnJQb2ludCk7XG5cblx0XHRcdC8vX2VxdWFsaXplUG9pbnRzKF9zdGFydE1haW5TY3JvbGxQb3MsIF9tYWluU2Nyb2xsUG9zKTtcblx0XHRcdF9zdGFydE1haW5TY3JvbGxQb3MueCA9IF9zbGlkZVNpemUueCAqIF9jdXJyUG9zaXRpb25JbmRleDtcblxuXHRcdFx0X3Bvc1BvaW50cyA9IFt7XG5cdFx0XHRcdHg6IF9jdXJyUG9pbnQueCxcblx0XHRcdFx0eTogX2N1cnJQb2ludC55XG5cdFx0XHR9XTtcblxuXHRcdFx0X2dlc3R1cmVDaGVja1NwZWVkVGltZSA9IF9nZXN0dXJlU3RhcnRUaW1lID0gX2dldEN1cnJlbnRUaW1lKCk7XG5cblx0XHRcdC8vX21haW5TY3JvbGxBbmltYXRpb25FbmQodHJ1ZSk7XG5cdFx0XHRfY2FsY3VsYXRlUGFuQm91bmRzKCBfY3Vyclpvb21MZXZlbCwgdHJ1ZSApO1xuXHRcdFx0XG5cdFx0XHQvLyBTdGFydCByZW5kZXJpbmdcblx0XHRcdF9zdG9wRHJhZ1VwZGF0ZUxvb3AoKTtcblx0XHRcdF9kcmFnVXBkYXRlTG9vcCgpO1xuXHRcdFx0XG5cdFx0fVxuXG5cdFx0Ly8gaW5pdCB6b29tXG5cdFx0aWYoIV9pc1pvb21pbmcgJiYgbnVtUG9pbnRzID4gMSAmJiAhX21haW5TY3JvbGxBbmltYXRpbmcgJiYgIV9tYWluU2Nyb2xsU2hpZnRlZCkge1xuXHRcdFx0X3N0YXJ0Wm9vbUxldmVsID0gX2N1cnJab29tTGV2ZWw7XG5cdFx0XHRfem9vbVN0YXJ0ZWQgPSBmYWxzZTsgLy8gdHJ1ZSBpZiB6b29tIGNoYW5nZWQgYXQgbGVhc3Qgb25jZVxuXG5cdFx0XHRfaXNab29taW5nID0gX2lzTXVsdGl0b3VjaCA9IHRydWU7XG5cdFx0XHRfY3VyclBhbkRpc3QueSA9IF9jdXJyUGFuRGlzdC54ID0gMDtcblxuXHRcdFx0X2VxdWFsaXplUG9pbnRzKF9zdGFydFBhbk9mZnNldCwgX3Bhbk9mZnNldCk7XG5cblx0XHRcdF9lcXVhbGl6ZVBvaW50cyhwLCBzdGFydFBvaW50c0xpc3RbMF0pO1xuXHRcdFx0X2VxdWFsaXplUG9pbnRzKHAyLCBzdGFydFBvaW50c0xpc3RbMV0pO1xuXG5cdFx0XHRfZmluZENlbnRlck9mUG9pbnRzKHAsIHAyLCBfY3VyckNlbnRlclBvaW50KTtcblxuXHRcdFx0X21pZFpvb21Qb2ludC54ID0gTWF0aC5hYnMoX2N1cnJDZW50ZXJQb2ludC54KSAtIF9wYW5PZmZzZXQueDtcblx0XHRcdF9taWRab29tUG9pbnQueSA9IE1hdGguYWJzKF9jdXJyQ2VudGVyUG9pbnQueSkgLSBfcGFuT2Zmc2V0Lnk7XG5cdFx0XHRfY3VyclBvaW50c0Rpc3RhbmNlID0gX3N0YXJ0UG9pbnRzRGlzdGFuY2UgPSBfY2FsY3VsYXRlUG9pbnRzRGlzdGFuY2UocCwgcDIpO1xuXHRcdH1cblxuXG5cdH0sXG5cblx0Ly8gUG9pbnRlcm1vdmUvdG91Y2htb3ZlL21vdXNlbW92ZSBoYW5kbGVyXG5cdF9vbkRyYWdNb3ZlID0gZnVuY3Rpb24oZSkge1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYoX3BvaW50ZXJFdmVudEVuYWJsZWQpIHtcblx0XHRcdHZhciBwb2ludGVySW5kZXggPSBmcmFtZXdvcmsuYXJyYXlTZWFyY2goX2N1cnJQb2ludGVycywgZS5wb2ludGVySWQsICdpZCcpO1xuXHRcdFx0aWYocG9pbnRlckluZGV4ID4gLTEpIHtcblx0XHRcdFx0dmFyIHAgPSBfY3VyclBvaW50ZXJzW3BvaW50ZXJJbmRleF07XG5cdFx0XHRcdHAueCA9IGUucGFnZVg7XG5cdFx0XHRcdHAueSA9IGUucGFnZVk7IFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKF9pc0RyYWdnaW5nKSB7XG5cdFx0XHR2YXIgdG91Y2hlc0xpc3QgPSBfZ2V0VG91Y2hQb2ludHMoZSk7XG5cdFx0XHRpZighX2RpcmVjdGlvbiAmJiAhX21vdmVkICYmICFfaXNab29taW5nKSB7XG5cblx0XHRcdFx0aWYoX21haW5TY3JvbGxQb3MueCAhPT0gX3NsaWRlU2l6ZS54ICogX2N1cnJQb3NpdGlvbkluZGV4KSB7XG5cdFx0XHRcdFx0Ly8gaWYgbWFpbiBzY3JvbGwgcG9zaXRpb24gaXMgc2hpZnRlZCDigJMgZGlyZWN0aW9uIGlzIGFsd2F5cyBob3Jpem9udGFsXG5cdFx0XHRcdFx0X2RpcmVjdGlvbiA9ICdoJztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YXIgZGlmZiA9IE1hdGguYWJzKHRvdWNoZXNMaXN0WzBdLnggLSBfY3VyclBvaW50LngpIC0gTWF0aC5hYnModG91Y2hlc0xpc3RbMF0ueSAtIF9jdXJyUG9pbnQueSk7XG5cdFx0XHRcdFx0Ly8gY2hlY2sgdGhlIGRpcmVjdGlvbiBvZiBtb3ZlbWVudFxuXHRcdFx0XHRcdGlmKE1hdGguYWJzKGRpZmYpID49IERJUkVDVElPTl9DSEVDS19PRkZTRVQpIHtcblx0XHRcdFx0XHRcdF9kaXJlY3Rpb24gPSBkaWZmID4gMCA/ICdoJyA6ICd2Jztcblx0XHRcdFx0XHRcdF9jdXJyZW50UG9pbnRzID0gdG91Y2hlc0xpc3Q7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2N1cnJlbnRQb2ludHMgPSB0b3VjaGVzTGlzdDtcblx0XHRcdH1cblx0XHR9XHRcblx0fSxcblx0Ly8gXG5cdF9yZW5kZXJNb3ZlbWVudCA9ICBmdW5jdGlvbigpIHtcblxuXHRcdGlmKCFfY3VycmVudFBvaW50cykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBudW1Qb2ludHMgPSBfY3VycmVudFBvaW50cy5sZW5ndGg7XG5cblx0XHRpZihudW1Qb2ludHMgPT09IDApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRfZXF1YWxpemVQb2ludHMocCwgX2N1cnJlbnRQb2ludHNbMF0pO1xuXG5cdFx0ZGVsdGEueCA9IHAueCAtIF9jdXJyUG9pbnQueDtcblx0XHRkZWx0YS55ID0gcC55IC0gX2N1cnJQb2ludC55O1xuXG5cdFx0aWYoX2lzWm9vbWluZyAmJiBudW1Qb2ludHMgPiAxKSB7XG5cdFx0XHQvLyBIYW5kbGUgYmVoYXZpb3VyIGZvciBtb3JlIHRoYW4gMSBwb2ludFxuXG5cdFx0XHRfY3VyclBvaW50LnggPSBwLng7XG5cdFx0XHRfY3VyclBvaW50LnkgPSBwLnk7XG5cdFx0XG5cdFx0XHQvLyBjaGVjayBpZiBvbmUgb2YgdHdvIHBvaW50cyBjaGFuZ2VkXG5cdFx0XHRpZiggIWRlbHRhLnggJiYgIWRlbHRhLnkgJiYgX2lzRXF1YWxQb2ludHMoX2N1cnJlbnRQb2ludHNbMV0sIHAyKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRfZXF1YWxpemVQb2ludHMocDIsIF9jdXJyZW50UG9pbnRzWzFdKTtcblxuXG5cdFx0XHRpZighX3pvb21TdGFydGVkKSB7XG5cdFx0XHRcdF96b29tU3RhcnRlZCA9IHRydWU7XG5cdFx0XHRcdF9zaG91dCgnem9vbUdlc3R1cmVTdGFydGVkJyk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIERpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuXHRcdFx0dmFyIHBvaW50c0Rpc3RhbmNlID0gX2NhbGN1bGF0ZVBvaW50c0Rpc3RhbmNlKHAscDIpO1xuXG5cdFx0XHR2YXIgem9vbUxldmVsID0gX2NhbGN1bGF0ZVpvb21MZXZlbChwb2ludHNEaXN0YW5jZSk7XG5cblx0XHRcdC8vIHNsaWdodGx5IG92ZXIgdGhlIG9mIGluaXRpYWwgem9vbSBsZXZlbFxuXHRcdFx0aWYoem9vbUxldmVsID4gc2VsZi5jdXJySXRlbS5pbml0aWFsWm9vbUxldmVsICsgc2VsZi5jdXJySXRlbS5pbml0aWFsWm9vbUxldmVsIC8gMTUpIHtcblx0XHRcdFx0X3dhc092ZXJJbml0aWFsWm9vbSA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFwcGx5IHRoZSBmcmljdGlvbiBpZiB6b29tIGxldmVsIGlzIG91dCBvZiB0aGUgYm91bmRzXG5cdFx0XHR2YXIgem9vbUZyaWN0aW9uID0gMSxcblx0XHRcdFx0bWluWm9vbUxldmVsID0gX2dldE1pblpvb21MZXZlbCgpLFxuXHRcdFx0XHRtYXhab29tTGV2ZWwgPSBfZ2V0TWF4Wm9vbUxldmVsKCk7XG5cblx0XHRcdGlmICggem9vbUxldmVsIDwgbWluWm9vbUxldmVsICkge1xuXHRcdFx0XHRcblx0XHRcdFx0aWYoX29wdGlvbnMucGluY2hUb0Nsb3NlICYmICFfd2FzT3ZlckluaXRpYWxab29tICYmIF9zdGFydFpvb21MZXZlbCA8PSBzZWxmLmN1cnJJdGVtLmluaXRpYWxab29tTGV2ZWwpIHtcblx0XHRcdFx0XHQvLyBmYWRlIG91dCBiYWNrZ3JvdW5kIGlmIHpvb21pbmcgb3V0XG5cdFx0XHRcdFx0dmFyIG1pbnVzRGlmZiA9IG1pblpvb21MZXZlbCAtIHpvb21MZXZlbDtcblx0XHRcdFx0XHR2YXIgcGVyY2VudCA9IDEgLSBtaW51c0RpZmYgLyAobWluWm9vbUxldmVsIC8gMS4yKTtcblxuXHRcdFx0XHRcdF9hcHBseUJnT3BhY2l0eShwZXJjZW50KTtcblx0XHRcdFx0XHRfc2hvdXQoJ29uUGluY2hDbG9zZScsIHBlcmNlbnQpO1xuXHRcdFx0XHRcdF9vcGFjaXR5Q2hhbmdlZCA9IHRydWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0em9vbUZyaWN0aW9uID0gKG1pblpvb21MZXZlbCAtIHpvb21MZXZlbCkgLyBtaW5ab29tTGV2ZWw7XG5cdFx0XHRcdFx0aWYoem9vbUZyaWN0aW9uID4gMSkge1xuXHRcdFx0XHRcdFx0em9vbUZyaWN0aW9uID0gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0em9vbUxldmVsID0gbWluWm9vbUxldmVsIC0gem9vbUZyaWN0aW9uICogKG1pblpvb21MZXZlbCAvIDMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIGlmICggem9vbUxldmVsID4gbWF4Wm9vbUxldmVsICkge1xuXHRcdFx0XHQvLyAxLjUgLSBleHRyYSB6b29tIGxldmVsIGFib3ZlIHRoZSBtYXguIEUuZy4gaWYgbWF4IGlzIHg2LCByZWFsIG1heCA2ICsgMS41ID0gNy41XG5cdFx0XHRcdHpvb21GcmljdGlvbiA9ICh6b29tTGV2ZWwgLSBtYXhab29tTGV2ZWwpIC8gKCBtaW5ab29tTGV2ZWwgKiA2ICk7XG5cdFx0XHRcdGlmKHpvb21GcmljdGlvbiA+IDEpIHtcblx0XHRcdFx0XHR6b29tRnJpY3Rpb24gPSAxO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHpvb21MZXZlbCA9IG1heFpvb21MZXZlbCArIHpvb21GcmljdGlvbiAqIG1pblpvb21MZXZlbDtcblx0XHRcdH1cblxuXHRcdFx0aWYoem9vbUZyaWN0aW9uIDwgMCkge1xuXHRcdFx0XHR6b29tRnJpY3Rpb24gPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBkaXN0YW5jZSBiZXR3ZWVuIHRvdWNoIHBvaW50cyBhZnRlciBmcmljdGlvbiBpcyBhcHBsaWVkXG5cdFx0XHRfY3VyclBvaW50c0Rpc3RhbmNlID0gcG9pbnRzRGlzdGFuY2U7XG5cblx0XHRcdC8vIF9jZW50ZXJQb2ludCAtIFRoZSBwb2ludCBpbiB0aGUgbWlkZGxlIG9mIHR3byBwb2ludGVyc1xuXHRcdFx0X2ZpbmRDZW50ZXJPZlBvaW50cyhwLCBwMiwgX2NlbnRlclBvaW50KTtcblx0XHRcblx0XHRcdC8vIHBhbmluZyB3aXRoIHR3byBwb2ludGVycyBwcmVzc2VkXG5cdFx0XHRfY3VyclBhbkRpc3QueCArPSBfY2VudGVyUG9pbnQueCAtIF9jdXJyQ2VudGVyUG9pbnQueDtcblx0XHRcdF9jdXJyUGFuRGlzdC55ICs9IF9jZW50ZXJQb2ludC55IC0gX2N1cnJDZW50ZXJQb2ludC55O1xuXHRcdFx0X2VxdWFsaXplUG9pbnRzKF9jdXJyQ2VudGVyUG9pbnQsIF9jZW50ZXJQb2ludCk7XG5cblx0XHRcdF9wYW5PZmZzZXQueCA9IF9jYWxjdWxhdGVQYW5PZmZzZXQoJ3gnLCB6b29tTGV2ZWwpO1xuXHRcdFx0X3Bhbk9mZnNldC55ID0gX2NhbGN1bGF0ZVBhbk9mZnNldCgneScsIHpvb21MZXZlbCk7XG5cblx0XHRcdF9pc1pvb21pbmdJbiA9IHpvb21MZXZlbCA+IF9jdXJyWm9vbUxldmVsO1xuXHRcdFx0X2N1cnJab29tTGV2ZWwgPSB6b29tTGV2ZWw7XG5cdFx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbigpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gaGFuZGxlIGJlaGF2aW91ciBmb3Igb25lIHBvaW50IChkcmFnZ2luZyBvciBwYW5uaW5nKVxuXG5cdFx0XHRpZighX2RpcmVjdGlvbikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmKF9pc0ZpcnN0TW92ZSkge1xuXHRcdFx0XHRfaXNGaXJzdE1vdmUgPSBmYWxzZTtcblxuXHRcdFx0XHQvLyBzdWJ0cmFjdCBkcmFnIGRpc3RhbmNlIHRoYXQgd2FzIHVzZWQgZHVyaW5nIHRoZSBkZXRlY3Rpb24gZGlyZWN0aW9uICBcblxuXHRcdFx0XHRpZiggTWF0aC5hYnMoZGVsdGEueCkgPj0gRElSRUNUSU9OX0NIRUNLX09GRlNFVCkge1xuXHRcdFx0XHRcdGRlbHRhLnggLT0gX2N1cnJlbnRQb2ludHNbMF0ueCAtIF9zdGFydFBvaW50Lng7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGlmKCBNYXRoLmFicyhkZWx0YS55KSA+PSBESVJFQ1RJT05fQ0hFQ0tfT0ZGU0VUKSB7XG5cdFx0XHRcdFx0ZGVsdGEueSAtPSBfY3VycmVudFBvaW50c1swXS55IC0gX3N0YXJ0UG9pbnQueTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRfY3VyclBvaW50LnggPSBwLng7XG5cdFx0XHRfY3VyclBvaW50LnkgPSBwLnk7XG5cblx0XHRcdC8vIGRvIG5vdGhpbmcgaWYgcG9pbnRlcnMgcG9zaXRpb24gaGFzbid0IGNoYW5nZWRcblx0XHRcdGlmKGRlbHRhLnggPT09IDAgJiYgZGVsdGEueSA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmKF9kaXJlY3Rpb24gPT09ICd2JyAmJiBfb3B0aW9ucy5jbG9zZU9uVmVydGljYWxEcmFnKSB7XG5cdFx0XHRcdGlmKCFfY2FuUGFuKCkpIHtcblx0XHRcdFx0XHRfY3VyclBhbkRpc3QueSArPSBkZWx0YS55O1xuXHRcdFx0XHRcdF9wYW5PZmZzZXQueSArPSBkZWx0YS55O1xuXG5cdFx0XHRcdFx0dmFyIG9wYWNpdHlSYXRpbyA9IF9jYWxjdWxhdGVWZXJ0aWNhbERyYWdPcGFjaXR5UmF0aW8oKTtcblxuXHRcdFx0XHRcdF92ZXJ0aWNhbERyYWdJbml0aWF0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdF9zaG91dCgnb25WZXJ0aWNhbERyYWcnLCBvcGFjaXR5UmF0aW8pO1xuXG5cdFx0XHRcdFx0X2FwcGx5QmdPcGFjaXR5KG9wYWNpdHlSYXRpbyk7XG5cdFx0XHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oKTtcblx0XHRcdFx0XHRyZXR1cm4gO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdF9wdXNoUG9zUG9pbnQoX2dldEN1cnJlbnRUaW1lKCksIHAueCwgcC55KTtcblxuXHRcdFx0X21vdmVkID0gdHJ1ZTtcblx0XHRcdF9jdXJyUGFuQm91bmRzID0gc2VsZi5jdXJySXRlbS5ib3VuZHM7XG5cdFx0XHRcblx0XHRcdHZhciBtYWluU2Nyb2xsQ2hhbmdlZCA9IF9wYW5Pck1vdmVNYWluU2Nyb2xsKCd4JywgZGVsdGEpO1xuXHRcdFx0aWYoIW1haW5TY3JvbGxDaGFuZ2VkKSB7XG5cdFx0XHRcdF9wYW5Pck1vdmVNYWluU2Nyb2xsKCd5JywgZGVsdGEpO1xuXG5cdFx0XHRcdF9yb3VuZFBvaW50KF9wYW5PZmZzZXQpO1xuXHRcdFx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbigpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cdFxuXHQvLyBQb2ludGVydXAvcG9pbnRlcmNhbmNlbC90b3VjaGVuZC90b3VjaGNhbmNlbC9tb3VzZXVwIGV2ZW50IGhhbmRsZXJcblx0X29uRHJhZ1JlbGVhc2UgPSBmdW5jdGlvbihlKSB7XG5cblx0XHRpZihfZmVhdHVyZXMuaXNPbGRBbmRyb2lkICkge1xuXG5cdFx0XHRpZihfb2xkQW5kcm9pZFRvdWNoRW5kVGltZW91dCAmJiBlLnR5cGUgPT09ICdtb3VzZXVwJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIG9uIEFuZHJvaWQgKHY0LjEsIDQuMiwgNC4zICYgcG9zc2libHkgb2xkZXIpIFxuXHRcdFx0Ly8gZ2hvc3QgbW91c2Vkb3duL3VwIGV2ZW50IGlzbid0IHByZXZlbnRhYmxlIHZpYSBlLnByZXZlbnREZWZhdWx0LFxuXHRcdFx0Ly8gd2hpY2ggY2F1c2VzIGZha2UgbW91c2Vkb3duIGV2ZW50XG5cdFx0XHQvLyBzbyB3ZSBibG9jayBtb3VzZWRvd24vdXAgZm9yIDYwMG1zXG5cdFx0XHRpZiggZS50eXBlLmluZGV4T2YoJ3RvdWNoJykgPiAtMSApIHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KF9vbGRBbmRyb2lkVG91Y2hFbmRUaW1lb3V0KTtcblx0XHRcdFx0X29sZEFuZHJvaWRUb3VjaEVuZFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdF9vbGRBbmRyb2lkVG91Y2hFbmRUaW1lb3V0ID0gMDtcblx0XHRcdFx0fSwgNjAwKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH1cblxuXHRcdF9zaG91dCgncG9pbnRlclVwJyk7XG5cblx0XHRpZihfcHJldmVudERlZmF1bHRFdmVudEJlaGF2aW91cihlLCBmYWxzZSkpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHR2YXIgcmVsZWFzZVBvaW50O1xuXG5cdFx0aWYoX3BvaW50ZXJFdmVudEVuYWJsZWQpIHtcblx0XHRcdHZhciBwb2ludGVySW5kZXggPSBmcmFtZXdvcmsuYXJyYXlTZWFyY2goX2N1cnJQb2ludGVycywgZS5wb2ludGVySWQsICdpZCcpO1xuXHRcdFx0XG5cdFx0XHRpZihwb2ludGVySW5kZXggPiAtMSkge1xuXHRcdFx0XHRyZWxlYXNlUG9pbnQgPSBfY3VyclBvaW50ZXJzLnNwbGljZShwb2ludGVySW5kZXgsIDEpWzBdO1xuXG5cdFx0XHRcdGlmKG5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCkge1xuXHRcdFx0XHRcdHJlbGVhc2VQb2ludC50eXBlID0gZS5wb2ludGVyVHlwZSB8fCAnbW91c2UnO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciBNU1BPSU5URVJfVFlQRVMgPSB7XG5cdFx0XHRcdFx0XHQ0OiAnbW91c2UnLCAvLyBldmVudC5NU1BPSU5URVJfVFlQRV9NT1VTRVxuXHRcdFx0XHRcdFx0MjogJ3RvdWNoJywgLy8gZXZlbnQuTVNQT0lOVEVSX1RZUEVfVE9VQ0ggXG5cdFx0XHRcdFx0XHQzOiAncGVuJyAvLyBldmVudC5NU1BPSU5URVJfVFlQRV9QRU5cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHJlbGVhc2VQb2ludC50eXBlID0gTVNQT0lOVEVSX1RZUEVTW2UucG9pbnRlclR5cGVdO1xuXG5cdFx0XHRcdFx0aWYoIXJlbGVhc2VQb2ludC50eXBlKSB7XG5cdFx0XHRcdFx0XHRyZWxlYXNlUG9pbnQudHlwZSA9IGUucG9pbnRlclR5cGUgfHwgJ21vdXNlJztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciB0b3VjaExpc3QgPSBfZ2V0VG91Y2hQb2ludHMoZSksXG5cdFx0XHRnZXN0dXJlVHlwZSxcblx0XHRcdG51bVBvaW50cyA9IHRvdWNoTGlzdC5sZW5ndGg7XG5cblx0XHRpZihlLnR5cGUgPT09ICdtb3VzZXVwJykge1xuXHRcdFx0bnVtUG9pbnRzID0gMDtcblx0XHR9XG5cblx0XHQvLyBEbyBub3RoaW5nIGlmIHRoZXJlIHdlcmUgMyB0b3VjaCBwb2ludHMgb3IgbW9yZVxuXHRcdGlmKG51bVBvaW50cyA9PT0gMikge1xuXHRcdFx0X2N1cnJlbnRQb2ludHMgPSBudWxsO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gaWYgc2Vjb25kIHBvaW50ZXIgcmVsZWFzZWRcblx0XHRpZihudW1Qb2ludHMgPT09IDEpIHtcblx0XHRcdF9lcXVhbGl6ZVBvaW50cyhfc3RhcnRQb2ludCwgdG91Y2hMaXN0WzBdKTtcblx0XHR9XHRcdFx0XHRcblxuXG5cdFx0Ly8gcG9pbnRlciBoYXNuJ3QgbW92ZWQsIHNlbmQgXCJ0YXAgcmVsZWFzZVwiIHBvaW50XG5cdFx0aWYobnVtUG9pbnRzID09PSAwICYmICFfZGlyZWN0aW9uICYmICFfbWFpblNjcm9sbEFuaW1hdGluZykge1xuXHRcdFx0aWYoIXJlbGVhc2VQb2ludCkge1xuXHRcdFx0XHRpZihlLnR5cGUgPT09ICdtb3VzZXVwJykge1xuXHRcdFx0XHRcdHJlbGVhc2VQb2ludCA9IHt4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZLCB0eXBlOidtb3VzZSd9O1xuXHRcdFx0XHR9IGVsc2UgaWYoZS5jaGFuZ2VkVG91Y2hlcyAmJiBlLmNoYW5nZWRUb3VjaGVzWzBdKSB7XG5cdFx0XHRcdFx0cmVsZWFzZVBvaW50ID0ge3g6IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVgsIHk6IGUuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVksIHR5cGU6J3RvdWNoJ307XG5cdFx0XHRcdH1cdFx0XG5cdFx0XHR9XG5cblx0XHRcdF9zaG91dCgndG91Y2hSZWxlYXNlJywgZSwgcmVsZWFzZVBvaW50KTtcblx0XHR9XG5cblx0XHQvLyBEaWZmZXJlbmNlIGluIHRpbWUgYmV0d2VlbiByZWxlYXNpbmcgb2YgdHdvIGxhc3QgdG91Y2ggcG9pbnRzICh6b29tIGdlc3R1cmUpXG5cdFx0dmFyIHJlbGVhc2VUaW1lRGlmZiA9IC0xO1xuXG5cdFx0Ly8gR2VzdHVyZSBjb21wbGV0ZWQsIG5vIHBvaW50ZXJzIGxlZnRcblx0XHRpZihudW1Qb2ludHMgPT09IDApIHtcblx0XHRcdF9pc0RyYWdnaW5nID0gZmFsc2U7XG5cdFx0XHRmcmFtZXdvcmsudW5iaW5kKHdpbmRvdywgX3VwTW92ZUV2ZW50cywgc2VsZik7XG5cblx0XHRcdF9zdG9wRHJhZ1VwZGF0ZUxvb3AoKTtcblxuXHRcdFx0aWYoX2lzWm9vbWluZykge1xuXHRcdFx0XHQvLyBUd28gcG9pbnRzIHJlbGVhc2VkIGF0IHRoZSBzYW1lIHRpbWVcblx0XHRcdFx0cmVsZWFzZVRpbWVEaWZmID0gMDtcblx0XHRcdH0gZWxzZSBpZihfbGFzdFJlbGVhc2VUaW1lICE9PSAtMSkge1xuXHRcdFx0XHRyZWxlYXNlVGltZURpZmYgPSBfZ2V0Q3VycmVudFRpbWUoKSAtIF9sYXN0UmVsZWFzZVRpbWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdF9sYXN0UmVsZWFzZVRpbWUgPSBudW1Qb2ludHMgPT09IDEgPyBfZ2V0Q3VycmVudFRpbWUoKSA6IC0xO1xuXHRcdFxuXHRcdGlmKHJlbGVhc2VUaW1lRGlmZiAhPT0gLTEgJiYgcmVsZWFzZVRpbWVEaWZmIDwgMTUwKSB7XG5cdFx0XHRnZXN0dXJlVHlwZSA9ICd6b29tJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Z2VzdHVyZVR5cGUgPSAnc3dpcGUnO1xuXHRcdH1cblxuXHRcdGlmKF9pc1pvb21pbmcgJiYgbnVtUG9pbnRzIDwgMikge1xuXHRcdFx0X2lzWm9vbWluZyA9IGZhbHNlO1xuXG5cdFx0XHQvLyBPbmx5IHNlY29uZCBwb2ludCByZWxlYXNlZFxuXHRcdFx0aWYobnVtUG9pbnRzID09PSAxKSB7XG5cdFx0XHRcdGdlc3R1cmVUeXBlID0gJ3pvb21Qb2ludGVyVXAnO1xuXHRcdFx0fVxuXHRcdFx0X3Nob3V0KCd6b29tR2VzdHVyZUVuZGVkJyk7XG5cdFx0fVxuXG5cdFx0X2N1cnJlbnRQb2ludHMgPSBudWxsO1xuXHRcdGlmKCFfbW92ZWQgJiYgIV96b29tU3RhcnRlZCAmJiAhX21haW5TY3JvbGxBbmltYXRpbmcgJiYgIV92ZXJ0aWNhbERyYWdJbml0aWF0ZWQpIHtcblx0XHRcdC8vIG5vdGhpbmcgdG8gYW5pbWF0ZVxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XG5cdFx0X3N0b3BBbGxBbmltYXRpb25zKCk7XG5cblx0XHRcblx0XHRpZighX3JlbGVhc2VBbmltRGF0YSkge1xuXHRcdFx0X3JlbGVhc2VBbmltRGF0YSA9IF9pbml0RHJhZ1JlbGVhc2VBbmltYXRpb25EYXRhKCk7XG5cdFx0fVxuXHRcdFxuXHRcdF9yZWxlYXNlQW5pbURhdGEuY2FsY3VsYXRlU3dpcGVTcGVlZCgneCcpO1xuXG5cblx0XHRpZihfdmVydGljYWxEcmFnSW5pdGlhdGVkKSB7XG5cblx0XHRcdHZhciBvcGFjaXR5UmF0aW8gPSBfY2FsY3VsYXRlVmVydGljYWxEcmFnT3BhY2l0eVJhdGlvKCk7XG5cblx0XHRcdGlmKG9wYWNpdHlSYXRpbyA8IF9vcHRpb25zLnZlcnRpY2FsRHJhZ1JhbmdlKSB7XG5cdFx0XHRcdHNlbGYuY2xvc2UoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBpbml0YWxQYW5ZID0gX3Bhbk9mZnNldC55LFxuXHRcdFx0XHRcdGluaXRpYWxCZ09wYWNpdHkgPSBfYmdPcGFjaXR5O1xuXG5cdFx0XHRcdF9hbmltYXRlUHJvcCgndmVydGljYWxEcmFnJywgMCwgMSwgMzAwLCBmcmFtZXdvcmsuZWFzaW5nLmN1YmljLm91dCwgZnVuY3Rpb24obm93KSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0X3Bhbk9mZnNldC55ID0gKHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFBvc2l0aW9uLnkgLSBpbml0YWxQYW5ZKSAqIG5vdyArIGluaXRhbFBhblk7XG5cblx0XHRcdFx0XHRfYXBwbHlCZ09wYWNpdHkoICAoMSAtIGluaXRpYWxCZ09wYWNpdHkpICogbm93ICsgaW5pdGlhbEJnT3BhY2l0eSApO1xuXHRcdFx0XHRcdF9hcHBseUN1cnJlbnRab29tUGFuKCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdF9zaG91dCgnb25WZXJ0aWNhbERyYWcnLCAxKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXG5cdFx0Ly8gbWFpbiBzY3JvbGwgXG5cdFx0aWYoICAoX21haW5TY3JvbGxTaGlmdGVkIHx8IF9tYWluU2Nyb2xsQW5pbWF0aW5nKSAmJiBudW1Qb2ludHMgPT09IDApIHtcblx0XHRcdHZhciBpdGVtQ2hhbmdlZCA9IF9maW5pc2hTd2lwZU1haW5TY3JvbGxHZXN0dXJlKGdlc3R1cmVUeXBlLCBfcmVsZWFzZUFuaW1EYXRhKTtcblx0XHRcdGlmKGl0ZW1DaGFuZ2VkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGdlc3R1cmVUeXBlID0gJ3pvb21Qb2ludGVyVXAnO1xuXHRcdH1cblxuXHRcdC8vIHByZXZlbnQgem9vbS9wYW4gYW5pbWF0aW9uIHdoZW4gbWFpbiBzY3JvbGwgYW5pbWF0aW9uIHJ1bnNcblx0XHRpZihfbWFpblNjcm9sbEFuaW1hdGluZykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRcblx0XHQvLyBDb21wbGV0ZSBzaW1wbGUgem9vbSBnZXN0dXJlIChyZXNldCB6b29tIGxldmVsIGlmIGl0J3Mgb3V0IG9mIHRoZSBib3VuZHMpICBcblx0XHRpZihnZXN0dXJlVHlwZSAhPT0gJ3N3aXBlJykge1xuXHRcdFx0X2NvbXBsZXRlWm9vbUdlc3R1cmUoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFxuXHRcdC8vIENvbXBsZXRlIHBhbiBnZXN0dXJlIGlmIG1haW4gc2Nyb2xsIGlzIG5vdCBzaGlmdGVkLCBhbmQgaXQncyBwb3NzaWJsZSB0byBwYW4gY3VycmVudCBpbWFnZVxuXHRcdGlmKCFfbWFpblNjcm9sbFNoaWZ0ZWQgJiYgX2N1cnJab29tTGV2ZWwgPiBzZWxmLmN1cnJJdGVtLmZpdFJhdGlvKSB7XG5cdFx0XHRfY29tcGxldGVQYW5HZXN0dXJlKF9yZWxlYXNlQW5pbURhdGEpO1xuXHRcdH1cblx0fSxcblxuXG5cdC8vIFJldHVybnMgb2JqZWN0IHdpdGggZGF0YSBhYm91dCBnZXN0dXJlXG5cdC8vIEl0J3MgY3JlYXRlZCBvbmx5IG9uY2UgYW5kIHRoZW4gcmV1c2VkXG5cdF9pbml0RHJhZ1JlbGVhc2VBbmltYXRpb25EYXRhICA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIHRlbXAgbG9jYWwgdmFyc1xuXHRcdHZhciBsYXN0RmxpY2tEdXJhdGlvbixcblx0XHRcdHRlbXBSZWxlYXNlUG9zO1xuXG5cdFx0Ly8gcyA9IHRoaXNcblx0XHR2YXIgcyA9IHtcblx0XHRcdGxhc3RGbGlja09mZnNldDoge30sXG5cdFx0XHRsYXN0RmxpY2tEaXN0OiB7fSxcblx0XHRcdGxhc3RGbGlja1NwZWVkOiB7fSxcblx0XHRcdHNsb3dEb3duUmF0aW86ICB7fSxcblx0XHRcdHNsb3dEb3duUmF0aW9SZXZlcnNlOiAge30sXG5cdFx0XHRzcGVlZERlY2VsZXJhdGlvblJhdGlvOiAge30sXG5cdFx0XHRzcGVlZERlY2VsZXJhdGlvblJhdGlvQWJzOiAge30sXG5cdFx0XHRkaXN0YW5jZU9mZnNldDogIHt9LFxuXHRcdFx0YmFja0FuaW1EZXN0aW5hdGlvbjoge30sXG5cdFx0XHRiYWNrQW5pbVN0YXJ0ZWQ6IHt9LFxuXHRcdFx0Y2FsY3VsYXRlU3dpcGVTcGVlZDogZnVuY3Rpb24oYXhpcykge1xuXHRcdFx0XHRcblxuXHRcdFx0XHRpZiggX3Bvc1BvaW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0bGFzdEZsaWNrRHVyYXRpb24gPSBfZ2V0Q3VycmVudFRpbWUoKSAtIF9nZXN0dXJlQ2hlY2tTcGVlZFRpbWUgKyA1MDtcblx0XHRcdFx0XHR0ZW1wUmVsZWFzZVBvcyA9IF9wb3NQb2ludHNbX3Bvc1BvaW50cy5sZW5ndGgtMl1bYXhpc107XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bGFzdEZsaWNrRHVyYXRpb24gPSBfZ2V0Q3VycmVudFRpbWUoKSAtIF9nZXN0dXJlU3RhcnRUaW1lOyAvLyB0b3RhbCBnZXN0dXJlIGR1cmF0aW9uXG5cdFx0XHRcdFx0dGVtcFJlbGVhc2VQb3MgPSBfc3RhcnRQb2ludFtheGlzXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzLmxhc3RGbGlja09mZnNldFtheGlzXSA9IF9jdXJyUG9pbnRbYXhpc10gLSB0ZW1wUmVsZWFzZVBvcztcblx0XHRcdFx0cy5sYXN0RmxpY2tEaXN0W2F4aXNdID0gTWF0aC5hYnMocy5sYXN0RmxpY2tPZmZzZXRbYXhpc10pO1xuXHRcdFx0XHRpZihzLmxhc3RGbGlja0Rpc3RbYXhpc10gPiAyMCkge1xuXHRcdFx0XHRcdHMubGFzdEZsaWNrU3BlZWRbYXhpc10gPSBzLmxhc3RGbGlja09mZnNldFtheGlzXSAvIGxhc3RGbGlja0R1cmF0aW9uO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHMubGFzdEZsaWNrU3BlZWRbYXhpc10gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCBNYXRoLmFicyhzLmxhc3RGbGlja1NwZWVkW2F4aXNdKSA8IDAuMSApIHtcblx0XHRcdFx0XHRzLmxhc3RGbGlja1NwZWVkW2F4aXNdID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0cy5zbG93RG93blJhdGlvW2F4aXNdID0gMC45NTtcblx0XHRcdFx0cy5zbG93RG93blJhdGlvUmV2ZXJzZVtheGlzXSA9IDEgLSBzLnNsb3dEb3duUmF0aW9bYXhpc107XG5cdFx0XHRcdHMuc3BlZWREZWNlbGVyYXRpb25SYXRpb1theGlzXSA9IDE7XG5cdFx0XHR9LFxuXG5cdFx0XHRjYWxjdWxhdGVPdmVyQm91bmRzQW5pbU9mZnNldDogZnVuY3Rpb24oYXhpcywgc3BlZWQpIHtcblx0XHRcdFx0aWYoIXMuYmFja0FuaW1TdGFydGVkW2F4aXNdKSB7XG5cblx0XHRcdFx0XHRpZihfcGFuT2Zmc2V0W2F4aXNdID4gX2N1cnJQYW5Cb3VuZHMubWluW2F4aXNdKSB7XG5cdFx0XHRcdFx0XHRzLmJhY2tBbmltRGVzdGluYXRpb25bYXhpc10gPSBfY3VyclBhbkJvdW5kcy5taW5bYXhpc107XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHR9IGVsc2UgaWYoX3Bhbk9mZnNldFtheGlzXSA8IF9jdXJyUGFuQm91bmRzLm1heFtheGlzXSkge1xuXHRcdFx0XHRcdFx0cy5iYWNrQW5pbURlc3RpbmF0aW9uW2F4aXNdID0gX2N1cnJQYW5Cb3VuZHMubWF4W2F4aXNdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKHMuYmFja0FuaW1EZXN0aW5hdGlvbltheGlzXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRzLnNsb3dEb3duUmF0aW9bYXhpc10gPSAwLjc7XG5cdFx0XHRcdFx0XHRzLnNsb3dEb3duUmF0aW9SZXZlcnNlW2F4aXNdID0gMSAtIHMuc2xvd0Rvd25SYXRpb1theGlzXTtcblx0XHRcdFx0XHRcdGlmKHMuc3BlZWREZWNlbGVyYXRpb25SYXRpb0Fic1theGlzXSA8IDAuMDUpIHtcblxuXHRcdFx0XHRcdFx0XHRzLmxhc3RGbGlja1NwZWVkW2F4aXNdID0gMDtcblx0XHRcdFx0XHRcdFx0cy5iYWNrQW5pbVN0YXJ0ZWRbYXhpc10gPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRcdF9hbmltYXRlUHJvcCgnYm91bmNlWm9vbVBhbicrYXhpcyxfcGFuT2Zmc2V0W2F4aXNdLCBcblx0XHRcdFx0XHRcdFx0XHRzLmJhY2tBbmltRGVzdGluYXRpb25bYXhpc10sIFxuXHRcdFx0XHRcdFx0XHRcdHNwZWVkIHx8IDMwMCwgXG5cdFx0XHRcdFx0XHRcdFx0ZnJhbWV3b3JrLmVhc2luZy5zaW5lLm91dCwgXG5cdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24ocG9zKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRfcGFuT2Zmc2V0W2F4aXNdID0gcG9zO1xuXHRcdFx0XHRcdFx0XHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdC8vIFJlZHVjZXMgdGhlIHNwZWVkIGJ5IHNsb3dEb3duUmF0aW8gKHBlciAxMG1zKVxuXHRcdFx0Y2FsY3VsYXRlQW5pbU9mZnNldDogZnVuY3Rpb24oYXhpcykge1xuXHRcdFx0XHRpZighcy5iYWNrQW5pbVN0YXJ0ZWRbYXhpc10pIHtcblx0XHRcdFx0XHRzLnNwZWVkRGVjZWxlcmF0aW9uUmF0aW9bYXhpc10gPSBzLnNwZWVkRGVjZWxlcmF0aW9uUmF0aW9bYXhpc10gKiAocy5zbG93RG93blJhdGlvW2F4aXNdICsgXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzLnNsb3dEb3duUmF0aW9SZXZlcnNlW2F4aXNdIC0gXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzLnNsb3dEb3duUmF0aW9SZXZlcnNlW2F4aXNdICogcy50aW1lRGlmZiAvIDEwKTtcblxuXHRcdFx0XHRcdHMuc3BlZWREZWNlbGVyYXRpb25SYXRpb0Fic1theGlzXSA9IE1hdGguYWJzKHMubGFzdEZsaWNrU3BlZWRbYXhpc10gKiBzLnNwZWVkRGVjZWxlcmF0aW9uUmF0aW9bYXhpc10pO1xuXHRcdFx0XHRcdHMuZGlzdGFuY2VPZmZzZXRbYXhpc10gPSBzLmxhc3RGbGlja1NwZWVkW2F4aXNdICogcy5zcGVlZERlY2VsZXJhdGlvblJhdGlvW2F4aXNdICogcy50aW1lRGlmZjtcblx0XHRcdFx0XHRfcGFuT2Zmc2V0W2F4aXNdICs9IHMuZGlzdGFuY2VPZmZzZXRbYXhpc107XG5cblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0cGFuQW5pbUxvb3A6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIF9hbmltYXRpb25zLnpvb21QYW4gKSB7XG5cdFx0XHRcdFx0X2FuaW1hdGlvbnMuem9vbVBhbi5yYWYgPSBfcmVxdWVzdEFGKHMucGFuQW5pbUxvb3ApO1xuXG5cdFx0XHRcdFx0cy5ub3cgPSBfZ2V0Q3VycmVudFRpbWUoKTtcblx0XHRcdFx0XHRzLnRpbWVEaWZmID0gcy5ub3cgLSBzLmxhc3ROb3c7XG5cdFx0XHRcdFx0cy5sYXN0Tm93ID0gcy5ub3c7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0cy5jYWxjdWxhdGVBbmltT2Zmc2V0KCd4Jyk7XG5cdFx0XHRcdFx0cy5jYWxjdWxhdGVBbmltT2Zmc2V0KCd5Jyk7XG5cblx0XHRcdFx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbigpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHMuY2FsY3VsYXRlT3ZlckJvdW5kc0FuaW1PZmZzZXQoJ3gnKTtcblx0XHRcdFx0XHRzLmNhbGN1bGF0ZU92ZXJCb3VuZHNBbmltT2Zmc2V0KCd5Jyk7XG5cblxuXHRcdFx0XHRcdGlmIChzLnNwZWVkRGVjZWxlcmF0aW9uUmF0aW9BYnMueCA8IDAuMDUgJiYgcy5zcGVlZERlY2VsZXJhdGlvblJhdGlvQWJzLnkgPCAwLjA1KSB7XG5cblx0XHRcdFx0XHRcdC8vIHJvdW5kIHBhbiBwb3NpdGlvblxuXHRcdFx0XHRcdFx0X3Bhbk9mZnNldC54ID0gTWF0aC5yb3VuZChfcGFuT2Zmc2V0LngpO1xuXHRcdFx0XHRcdFx0X3Bhbk9mZnNldC55ID0gTWF0aC5yb3VuZChfcGFuT2Zmc2V0LnkpO1xuXHRcdFx0XHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0X3N0b3BBbmltYXRpb24oJ3pvb21QYW4nKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH07XG5cdFx0cmV0dXJuIHM7XG5cdH0sXG5cblx0X2NvbXBsZXRlUGFuR2VzdHVyZSA9IGZ1bmN0aW9uKGFuaW1EYXRhKSB7XG5cdFx0Ly8gY2FsY3VsYXRlIHN3aXBlIHNwZWVkIGZvciBZIGF4aXMgKHBhYW5uaW5nKVxuXHRcdGFuaW1EYXRhLmNhbGN1bGF0ZVN3aXBlU3BlZWQoJ3knKTtcblxuXHRcdF9jdXJyUGFuQm91bmRzID0gc2VsZi5jdXJySXRlbS5ib3VuZHM7XG5cdFx0XG5cdFx0YW5pbURhdGEuYmFja0FuaW1EZXN0aW5hdGlvbiA9IHt9O1xuXHRcdGFuaW1EYXRhLmJhY2tBbmltU3RhcnRlZCA9IHt9O1xuXG5cdFx0Ly8gQXZvaWQgYWNjZWxlcmF0aW9uIGFuaW1hdGlvbiBpZiBzcGVlZCBpcyB0b28gbG93XG5cdFx0aWYoTWF0aC5hYnMoYW5pbURhdGEubGFzdEZsaWNrU3BlZWQueCkgPD0gMC4wNSAmJiBNYXRoLmFicyhhbmltRGF0YS5sYXN0RmxpY2tTcGVlZC55KSA8PSAwLjA1ICkge1xuXHRcdFx0YW5pbURhdGEuc3BlZWREZWNlbGVyYXRpb25SYXRpb0Ficy54ID0gYW5pbURhdGEuc3BlZWREZWNlbGVyYXRpb25SYXRpb0Ficy55ID0gMDtcblxuXHRcdFx0Ly8gUnVuIHBhbiBkcmFnIHJlbGVhc2UgYW5pbWF0aW9uLiBFLmcuIGlmIHlvdSBkcmFnIGltYWdlIGFuZCByZWxlYXNlIGZpbmdlciB3aXRob3V0IG1vbWVudHVtLlxuXHRcdFx0YW5pbURhdGEuY2FsY3VsYXRlT3ZlckJvdW5kc0FuaW1PZmZzZXQoJ3gnKTtcblx0XHRcdGFuaW1EYXRhLmNhbGN1bGF0ZU92ZXJCb3VuZHNBbmltT2Zmc2V0KCd5Jyk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBBbmltYXRpb24gbG9vcCB0aGF0IGNvbnRyb2xzIHRoZSBhY2NlbGVyYXRpb24gYWZ0ZXIgcGFuIGdlc3R1cmUgZW5kc1xuXHRcdF9yZWdpc3RlclN0YXJ0QW5pbWF0aW9uKCd6b29tUGFuJyk7XG5cdFx0YW5pbURhdGEubGFzdE5vdyA9IF9nZXRDdXJyZW50VGltZSgpO1xuXHRcdGFuaW1EYXRhLnBhbkFuaW1Mb29wKCk7XG5cdH0sXG5cblxuXHRfZmluaXNoU3dpcGVNYWluU2Nyb2xsR2VzdHVyZSA9IGZ1bmN0aW9uKGdlc3R1cmVUeXBlLCBfcmVsZWFzZUFuaW1EYXRhKSB7XG5cdFx0dmFyIGl0ZW1DaGFuZ2VkO1xuXHRcdGlmKCFfbWFpblNjcm9sbEFuaW1hdGluZykge1xuXHRcdFx0X2N1cnJab29tZWRJdGVtSW5kZXggPSBfY3VycmVudEl0ZW1JbmRleDtcblx0XHR9XG5cblxuXHRcdFxuXHRcdHZhciBpdGVtc0RpZmY7XG5cblx0XHRpZihnZXN0dXJlVHlwZSA9PT0gJ3N3aXBlJykge1xuXHRcdFx0dmFyIHRvdGFsU2hpZnREaXN0ID0gX2N1cnJQb2ludC54IC0gX3N0YXJ0UG9pbnQueCxcblx0XHRcdFx0aXNGYXN0TGFzdEZsaWNrID0gX3JlbGVhc2VBbmltRGF0YS5sYXN0RmxpY2tEaXN0LnggPCAxMDtcblxuXHRcdFx0Ly8gaWYgY29udGFpbmVyIGlzIHNoaWZ0ZWQgZm9yIG1vcmUgdGhhbiBNSU5fU1dJUEVfRElTVEFOQ0UsIFxuXHRcdFx0Ly8gYW5kIGxhc3QgZmxpY2sgZ2VzdHVyZSB3YXMgaW4gcmlnaHQgZGlyZWN0aW9uXG5cdFx0XHRpZih0b3RhbFNoaWZ0RGlzdCA+IE1JTl9TV0lQRV9ESVNUQU5DRSAmJiBcblx0XHRcdFx0KGlzRmFzdExhc3RGbGljayB8fCBfcmVsZWFzZUFuaW1EYXRhLmxhc3RGbGlja09mZnNldC54ID4gMjApICkge1xuXHRcdFx0XHQvLyBnbyB0byBwcmV2IGl0ZW1cblx0XHRcdFx0aXRlbXNEaWZmID0gLTE7XG5cdFx0XHR9IGVsc2UgaWYodG90YWxTaGlmdERpc3QgPCAtTUlOX1NXSVBFX0RJU1RBTkNFICYmIFxuXHRcdFx0XHQoaXNGYXN0TGFzdEZsaWNrIHx8IF9yZWxlYXNlQW5pbURhdGEubGFzdEZsaWNrT2Zmc2V0LnggPCAtMjApICkge1xuXHRcdFx0XHQvLyBnbyB0byBuZXh0IGl0ZW1cblx0XHRcdFx0aXRlbXNEaWZmID0gMTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgbmV4dENpcmNsZTtcblxuXHRcdGlmKGl0ZW1zRGlmZikge1xuXHRcdFx0XG5cdFx0XHRfY3VycmVudEl0ZW1JbmRleCArPSBpdGVtc0RpZmY7XG5cblx0XHRcdGlmKF9jdXJyZW50SXRlbUluZGV4IDwgMCkge1xuXHRcdFx0XHRfY3VycmVudEl0ZW1JbmRleCA9IF9vcHRpb25zLmxvb3AgPyBfZ2V0TnVtSXRlbXMoKS0xIDogMDtcblx0XHRcdFx0bmV4dENpcmNsZSA9IHRydWU7XG5cdFx0XHR9IGVsc2UgaWYoX2N1cnJlbnRJdGVtSW5kZXggPj0gX2dldE51bUl0ZW1zKCkpIHtcblx0XHRcdFx0X2N1cnJlbnRJdGVtSW5kZXggPSBfb3B0aW9ucy5sb29wID8gMCA6IF9nZXROdW1JdGVtcygpLTE7XG5cdFx0XHRcdG5leHRDaXJjbGUgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZighbmV4dENpcmNsZSB8fCBfb3B0aW9ucy5sb29wKSB7XG5cdFx0XHRcdF9pbmRleERpZmYgKz0gaXRlbXNEaWZmO1xuXHRcdFx0XHRfY3VyclBvc2l0aW9uSW5kZXggLT0gaXRlbXNEaWZmO1xuXHRcdFx0XHRpdGVtQ2hhbmdlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRcblxuXHRcdFx0XG5cdFx0fVxuXG5cdFx0dmFyIGFuaW1hdGVUb1ggPSBfc2xpZGVTaXplLnggKiBfY3VyclBvc2l0aW9uSW5kZXg7XG5cdFx0dmFyIGFuaW1hdGVUb0Rpc3QgPSBNYXRoLmFicyggYW5pbWF0ZVRvWCAtIF9tYWluU2Nyb2xsUG9zLnggKTtcblx0XHR2YXIgZmluaXNoQW5pbUR1cmF0aW9uO1xuXG5cblx0XHRpZighaXRlbUNoYW5nZWQgJiYgYW5pbWF0ZVRvWCA+IF9tYWluU2Nyb2xsUG9zLnggIT09IF9yZWxlYXNlQW5pbURhdGEubGFzdEZsaWNrU3BlZWQueCA+IDApIHtcblx0XHRcdC8vIFwicmV0dXJuIHRvIGN1cnJlbnRcIiBkdXJhdGlvbiwgZS5nLiB3aGVuIGRyYWdnaW5nIGZyb20gc2xpZGUgMCB0byAtMVxuXHRcdFx0ZmluaXNoQW5pbUR1cmF0aW9uID0gMzMzOyBcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmluaXNoQW5pbUR1cmF0aW9uID0gTWF0aC5hYnMoX3JlbGVhc2VBbmltRGF0YS5sYXN0RmxpY2tTcGVlZC54KSA+IDAgPyBcblx0XHRcdFx0XHRcdFx0XHRcdGFuaW1hdGVUb0Rpc3QgLyBNYXRoLmFicyhfcmVsZWFzZUFuaW1EYXRhLmxhc3RGbGlja1NwZWVkLngpIDogXG5cdFx0XHRcdFx0XHRcdFx0XHQzMzM7XG5cblx0XHRcdGZpbmlzaEFuaW1EdXJhdGlvbiA9IE1hdGgubWluKGZpbmlzaEFuaW1EdXJhdGlvbiwgNDAwKTtcblx0XHRcdGZpbmlzaEFuaW1EdXJhdGlvbiA9IE1hdGgubWF4KGZpbmlzaEFuaW1EdXJhdGlvbiwgMjUwKTtcblx0XHR9XG5cblx0XHRpZihfY3Vyclpvb21lZEl0ZW1JbmRleCA9PT0gX2N1cnJlbnRJdGVtSW5kZXgpIHtcblx0XHRcdGl0ZW1DaGFuZ2VkID0gZmFsc2U7XG5cdFx0fVxuXHRcdFxuXHRcdF9tYWluU2Nyb2xsQW5pbWF0aW5nID0gdHJ1ZTtcblx0XHRcblx0XHRfc2hvdXQoJ21haW5TY3JvbGxBbmltU3RhcnQnKTtcblxuXHRcdF9hbmltYXRlUHJvcCgnbWFpblNjcm9sbCcsIF9tYWluU2Nyb2xsUG9zLngsIGFuaW1hdGVUb1gsIGZpbmlzaEFuaW1EdXJhdGlvbiwgZnJhbWV3b3JrLmVhc2luZy5jdWJpYy5vdXQsIFxuXHRcdFx0X21vdmVNYWluU2Nyb2xsLFxuXHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF9zdG9wQWxsQW5pbWF0aW9ucygpO1xuXHRcdFx0XHRfbWFpblNjcm9sbEFuaW1hdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRfY3Vyclpvb21lZEl0ZW1JbmRleCA9IC0xO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYoaXRlbUNoYW5nZWQgfHwgX2N1cnJab29tZWRJdGVtSW5kZXggIT09IF9jdXJyZW50SXRlbUluZGV4KSB7XG5cdFx0XHRcdFx0c2VsZi51cGRhdGVDdXJySXRlbSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRfc2hvdXQoJ21haW5TY3JvbGxBbmltQ29tcGxldGUnKTtcblx0XHRcdH1cblx0XHQpO1xuXG5cdFx0aWYoaXRlbUNoYW5nZWQpIHtcblx0XHRcdHNlbGYudXBkYXRlQ3Vyckl0ZW0odHJ1ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW1DaGFuZ2VkO1xuXHR9LFxuXG5cdF9jYWxjdWxhdGVab29tTGV2ZWwgPSBmdW5jdGlvbih0b3VjaGVzRGlzdGFuY2UpIHtcblx0XHRyZXR1cm4gIDEgLyBfc3RhcnRQb2ludHNEaXN0YW5jZSAqIHRvdWNoZXNEaXN0YW5jZSAqIF9zdGFydFpvb21MZXZlbDtcblx0fSxcblxuXHQvLyBSZXNldHMgem9vbSBpZiBpdCdzIG91dCBvZiBib3VuZHNcblx0X2NvbXBsZXRlWm9vbUdlc3R1cmUgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGVzdFpvb21MZXZlbCA9IF9jdXJyWm9vbUxldmVsLFxuXHRcdFx0bWluWm9vbUxldmVsID0gX2dldE1pblpvb21MZXZlbCgpLFxuXHRcdFx0bWF4Wm9vbUxldmVsID0gX2dldE1heFpvb21MZXZlbCgpO1xuXG5cdFx0aWYgKCBfY3Vyclpvb21MZXZlbCA8IG1pblpvb21MZXZlbCApIHtcblx0XHRcdGRlc3Rab29tTGV2ZWwgPSBtaW5ab29tTGV2ZWw7XG5cdFx0fSBlbHNlIGlmICggX2N1cnJab29tTGV2ZWwgPiBtYXhab29tTGV2ZWwgKSB7XG5cdFx0XHRkZXN0Wm9vbUxldmVsID0gbWF4Wm9vbUxldmVsO1xuXHRcdH1cblxuXHRcdHZhciBkZXN0T3BhY2l0eSA9IDEsXG5cdFx0XHRvblVwZGF0ZSxcblx0XHRcdGluaXRpYWxPcGFjaXR5ID0gX2JnT3BhY2l0eTtcblxuXHRcdGlmKF9vcGFjaXR5Q2hhbmdlZCAmJiAhX2lzWm9vbWluZ0luICYmICFfd2FzT3ZlckluaXRpYWxab29tICYmIF9jdXJyWm9vbUxldmVsIDwgbWluWm9vbUxldmVsKSB7XG5cdFx0XHQvL19jbG9zZWRCeVNjcm9sbCA9IHRydWU7XG5cdFx0XHRzZWxmLmNsb3NlKCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZihfb3BhY2l0eUNoYW5nZWQpIHtcblx0XHRcdG9uVXBkYXRlID0gZnVuY3Rpb24obm93KSB7XG5cdFx0XHRcdF9hcHBseUJnT3BhY2l0eSggIChkZXN0T3BhY2l0eSAtIGluaXRpYWxPcGFjaXR5KSAqIG5vdyArIGluaXRpYWxPcGFjaXR5ICk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHNlbGYuem9vbVRvKGRlc3Rab29tTGV2ZWwsIDAsIDIwMCwgIGZyYW1ld29yay5lYXNpbmcuY3ViaWMub3V0LCBvblVwZGF0ZSk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblxuX3JlZ2lzdGVyTW9kdWxlKCdHZXN0dXJlcycsIHtcblx0cHVibGljTWV0aG9kczoge1xuXG5cdFx0aW5pdEdlc3R1cmVzOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gaGVscGVyIGZ1bmN0aW9uIHRoYXQgYnVpbGRzIHRvdWNoL3BvaW50ZXIvbW91c2UgZXZlbnRzXG5cdFx0XHR2YXIgYWRkRXZlbnROYW1lcyA9IGZ1bmN0aW9uKHByZWYsIGRvd24sIG1vdmUsIHVwLCBjYW5jZWwpIHtcblx0XHRcdFx0X2RyYWdTdGFydEV2ZW50ID0gcHJlZiArIGRvd247XG5cdFx0XHRcdF9kcmFnTW92ZUV2ZW50ID0gcHJlZiArIG1vdmU7XG5cdFx0XHRcdF9kcmFnRW5kRXZlbnQgPSBwcmVmICsgdXA7XG5cdFx0XHRcdGlmKGNhbmNlbCkge1xuXHRcdFx0XHRcdF9kcmFnQ2FuY2VsRXZlbnQgPSBwcmVmICsgY2FuY2VsO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF9kcmFnQ2FuY2VsRXZlbnQgPSAnJztcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0X3BvaW50ZXJFdmVudEVuYWJsZWQgPSBfZmVhdHVyZXMucG9pbnRlckV2ZW50O1xuXHRcdFx0aWYoX3BvaW50ZXJFdmVudEVuYWJsZWQgJiYgX2ZlYXR1cmVzLnRvdWNoKSB7XG5cdFx0XHRcdC8vIHdlIGRvbid0IG5lZWQgdG91Y2ggZXZlbnRzLCBpZiBicm93c2VyIHN1cHBvcnRzIHBvaW50ZXIgZXZlbnRzXG5cdFx0XHRcdF9mZWF0dXJlcy50b3VjaCA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihfcG9pbnRlckV2ZW50RW5hYmxlZCkge1xuXHRcdFx0XHRpZihuYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQpIHtcblx0XHRcdFx0XHRhZGRFdmVudE5hbWVzKCdwb2ludGVyJywgJ2Rvd24nLCAnbW92ZScsICd1cCcsICdjYW5jZWwnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBJRTEwIHBvaW50ZXIgZXZlbnRzIGFyZSBjYXNlLXNlbnNpdGl2ZVxuXHRcdFx0XHRcdGFkZEV2ZW50TmFtZXMoJ01TUG9pbnRlcicsICdEb3duJywgJ01vdmUnLCAnVXAnLCAnQ2FuY2VsJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZihfZmVhdHVyZXMudG91Y2gpIHtcblx0XHRcdFx0YWRkRXZlbnROYW1lcygndG91Y2gnLCAnc3RhcnQnLCAnbW92ZScsICdlbmQnLCAnY2FuY2VsJyk7XG5cdFx0XHRcdF9saWtlbHlUb3VjaERldmljZSA9IHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhZGRFdmVudE5hbWVzKCdtb3VzZScsICdkb3duJywgJ21vdmUnLCAndXAnKTtcdFxuXHRcdFx0fVxuXG5cdFx0XHRfdXBNb3ZlRXZlbnRzID0gX2RyYWdNb3ZlRXZlbnQgKyAnICcgKyBfZHJhZ0VuZEV2ZW50ICArICcgJyArICBfZHJhZ0NhbmNlbEV2ZW50O1xuXHRcdFx0X2Rvd25FdmVudHMgPSBfZHJhZ1N0YXJ0RXZlbnQ7XG5cblx0XHRcdGlmKF9wb2ludGVyRXZlbnRFbmFibGVkICYmICFfbGlrZWx5VG91Y2hEZXZpY2UpIHtcblx0XHRcdFx0X2xpa2VseVRvdWNoRGV2aWNlID0gKG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDEpIHx8IChuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyA+IDEpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gbWFrZSB2YXJpYWJsZSBwdWJsaWNcblx0XHRcdHNlbGYubGlrZWx5VG91Y2hEZXZpY2UgPSBfbGlrZWx5VG91Y2hEZXZpY2U7IFxuXHRcdFx0XG5cdFx0XHRfZ2xvYmFsRXZlbnRIYW5kbGVyc1tfZHJhZ1N0YXJ0RXZlbnRdID0gX29uRHJhZ1N0YXJ0O1xuXHRcdFx0X2dsb2JhbEV2ZW50SGFuZGxlcnNbX2RyYWdNb3ZlRXZlbnRdID0gX29uRHJhZ01vdmU7XG5cdFx0XHRfZ2xvYmFsRXZlbnRIYW5kbGVyc1tfZHJhZ0VuZEV2ZW50XSA9IF9vbkRyYWdSZWxlYXNlOyAvLyB0aGUgS3Jha2VuXG5cblx0XHRcdGlmKF9kcmFnQ2FuY2VsRXZlbnQpIHtcblx0XHRcdFx0X2dsb2JhbEV2ZW50SGFuZGxlcnNbX2RyYWdDYW5jZWxFdmVudF0gPSBfZ2xvYmFsRXZlbnRIYW5kbGVyc1tfZHJhZ0VuZEV2ZW50XTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQmluZCBtb3VzZSBldmVudHMgb24gZGV2aWNlIHdpdGggZGV0ZWN0ZWQgaGFyZHdhcmUgdG91Y2ggc3VwcG9ydCwgaW4gY2FzZSBpdCBzdXBwb3J0cyBtdWx0aXBsZSB0eXBlcyBvZiBpbnB1dC5cblx0XHRcdGlmKF9mZWF0dXJlcy50b3VjaCkge1xuXHRcdFx0XHRfZG93bkV2ZW50cyArPSAnIG1vdXNlZG93bic7XG5cdFx0XHRcdF91cE1vdmVFdmVudHMgKz0gJyBtb3VzZW1vdmUgbW91c2V1cCc7XG5cdFx0XHRcdF9nbG9iYWxFdmVudEhhbmRsZXJzLm1vdXNlZG93biA9IF9nbG9iYWxFdmVudEhhbmRsZXJzW19kcmFnU3RhcnRFdmVudF07XG5cdFx0XHRcdF9nbG9iYWxFdmVudEhhbmRsZXJzLm1vdXNlbW92ZSA9IF9nbG9iYWxFdmVudEhhbmRsZXJzW19kcmFnTW92ZUV2ZW50XTtcblx0XHRcdFx0X2dsb2JhbEV2ZW50SGFuZGxlcnMubW91c2V1cCA9IF9nbG9iYWxFdmVudEhhbmRsZXJzW19kcmFnRW5kRXZlbnRdO1xuXHRcdFx0fVxuXG5cdFx0XHRpZighX2xpa2VseVRvdWNoRGV2aWNlKSB7XG5cdFx0XHRcdC8vIGRvbid0IGFsbG93IHBhbiB0byBuZXh0IHNsaWRlIGZyb20gem9vbWVkIHN0YXRlIG9uIERlc2t0b3Bcblx0XHRcdFx0X29wdGlvbnMuYWxsb3dQYW5Ub05leHQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxufSk7XG5cblxuLyo+Pmdlc3R1cmVzKi9cblxuLyo+PnNob3ctaGlkZS10cmFuc2l0aW9uKi9cbi8qKlxuICogc2hvdy1oaWRlLXRyYW5zaXRpb24uanM6XG4gKlxuICogTWFuYWdlcyBpbml0aWFsIG9wZW5pbmcgb3IgY2xvc2luZyB0cmFuc2l0aW9uLlxuICpcbiAqIElmIHlvdSdyZSBub3QgcGxhbm5pbmcgdG8gdXNlIHRyYW5zaXRpb24gZm9yIGdhbGxlcnkgYXQgYWxsLFxuICogeW91IG1heSBzZXQgb3B0aW9ucyBoaWRlQW5pbWF0aW9uRHVyYXRpb24gYW5kIHNob3dBbmltYXRpb25EdXJhdGlvbiB0byAwLFxuICogYW5kIGp1c3QgZGVsZXRlIHN0YXJ0QW5pbWF0aW9uIGZ1bmN0aW9uLlxuICogXG4gKi9cblxuXG52YXIgX3Nob3dPckhpZGVUaW1lb3V0LFxuXHRfc2hvd09ySGlkZSA9IGZ1bmN0aW9uKGl0ZW0sIGltZywgb3V0LCBjb21wbGV0ZUZuKSB7XG5cblx0XHRpZihfc2hvd09ySGlkZVRpbWVvdXQpIHtcblx0XHRcdGNsZWFyVGltZW91dChfc2hvd09ySGlkZVRpbWVvdXQpO1xuXHRcdH1cblxuXHRcdF9pbml0aWFsWm9vbVJ1bm5pbmcgPSB0cnVlO1xuXHRcdF9pbml0aWFsQ29udGVudFNldCA9IHRydWU7XG5cdFx0XG5cdFx0Ly8gZGltZW5zaW9ucyBvZiBzbWFsbCB0aHVtYm5haWwge3g6LHk6LHc6fS5cblx0XHQvLyBIZWlnaHQgaXMgb3B0aW9uYWwsIGFzIGNhbGN1bGF0ZWQgYmFzZWQgb24gbGFyZ2UgaW1hZ2UuXG5cdFx0dmFyIHRodW1iQm91bmRzOyBcblx0XHRpZihpdGVtLmluaXRpYWxMYXlvdXQpIHtcblx0XHRcdHRodW1iQm91bmRzID0gaXRlbS5pbml0aWFsTGF5b3V0O1xuXHRcdFx0aXRlbS5pbml0aWFsTGF5b3V0ID0gbnVsbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGh1bWJCb3VuZHMgPSBfb3B0aW9ucy5nZXRUaHVtYkJvdW5kc0ZuICYmIF9vcHRpb25zLmdldFRodW1iQm91bmRzRm4oX2N1cnJlbnRJdGVtSW5kZXgpO1xuXHRcdH1cblxuXHRcdHZhciBkdXJhdGlvbiA9IG91dCA/IF9vcHRpb25zLmhpZGVBbmltYXRpb25EdXJhdGlvbiA6IF9vcHRpb25zLnNob3dBbmltYXRpb25EdXJhdGlvbjtcblxuXHRcdHZhciBvbkNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRfc3RvcEFuaW1hdGlvbignaW5pdGlhbFpvb20nKTtcblx0XHRcdGlmKCFvdXQpIHtcblx0XHRcdFx0X2FwcGx5QmdPcGFjaXR5KDEpO1xuXHRcdFx0XHRpZihpbWcpIHtcblx0XHRcdFx0XHRpbWcuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZnJhbWV3b3JrLmFkZENsYXNzKHRlbXBsYXRlLCAncHN3cC0tYW5pbWF0ZWQtaW4nKTtcblx0XHRcdFx0X3Nob3V0KCdpbml0aWFsWm9vbScgKyAob3V0ID8gJ091dEVuZCcgOiAnSW5FbmQnKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZWxmLnRlbXBsYXRlLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcblx0XHRcdFx0c2VsZi5iZy5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKGNvbXBsZXRlRm4pIHtcblx0XHRcdFx0Y29tcGxldGVGbigpO1xuXHRcdFx0fVxuXHRcdFx0X2luaXRpYWxab29tUnVubmluZyA9IGZhbHNlO1xuXHRcdH07XG5cblx0XHQvLyBpZiBib3VuZHMgYXJlbid0IHByb3ZpZGVkLCBqdXN0IG9wZW4gZ2FsbGVyeSB3aXRob3V0IGFuaW1hdGlvblxuXHRcdGlmKCFkdXJhdGlvbiB8fCAhdGh1bWJCb3VuZHMgfHwgdGh1bWJCb3VuZHMueCA9PT0gdW5kZWZpbmVkKSB7XG5cblx0XHRcdF9zaG91dCgnaW5pdGlhbFpvb20nICsgKG91dCA/ICdPdXQnIDogJ0luJykgKTtcblxuXHRcdFx0X2N1cnJab29tTGV2ZWwgPSBpdGVtLmluaXRpYWxab29tTGV2ZWw7XG5cdFx0XHRfZXF1YWxpemVQb2ludHMoX3Bhbk9mZnNldCwgIGl0ZW0uaW5pdGlhbFBvc2l0aW9uICk7XG5cdFx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbigpO1xuXG5cdFx0XHR0ZW1wbGF0ZS5zdHlsZS5vcGFjaXR5ID0gb3V0ID8gMCA6IDE7XG5cdFx0XHRfYXBwbHlCZ09wYWNpdHkoMSk7XG5cblx0XHRcdGlmKGR1cmF0aW9uKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0b25Db21wbGV0ZSgpO1xuXHRcdFx0XHR9LCBkdXJhdGlvbik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvbkNvbXBsZXRlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgc3RhcnRBbmltYXRpb24gPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBjbG9zZVdpdGhSYWYgPSBfY2xvc2VkQnlTY3JvbGwsXG5cdFx0XHRcdGZhZGVFdmVyeXRoaW5nID0gIXNlbGYuY3Vyckl0ZW0uc3JjIHx8IHNlbGYuY3Vyckl0ZW0ubG9hZEVycm9yIHx8IF9vcHRpb25zLnNob3dIaWRlT3BhY2l0eTtcblx0XHRcdFxuXHRcdFx0Ly8gYXBwbHkgaHctYWNjZWxlcmF0aW9uIHRvIGltYWdlXG5cdFx0XHRpZihpdGVtLm1pbmlJbWcpIHtcblx0XHRcdFx0aXRlbS5taW5pSW1nLnN0eWxlLndlYmtpdEJhY2tmYWNlVmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuXHRcdFx0fVxuXG5cdFx0XHRpZighb3V0KSB7XG5cdFx0XHRcdF9jdXJyWm9vbUxldmVsID0gdGh1bWJCb3VuZHMudyAvIGl0ZW0udztcblx0XHRcdFx0X3Bhbk9mZnNldC54ID0gdGh1bWJCb3VuZHMueDtcblx0XHRcdFx0X3Bhbk9mZnNldC55ID0gdGh1bWJCb3VuZHMueSAtIF9pbml0YWxXaW5kb3dTY3JvbGxZO1xuXG5cdFx0XHRcdHNlbGZbZmFkZUV2ZXJ5dGhpbmcgPyAndGVtcGxhdGUnIDogJ2JnJ10uc3R5bGUub3BhY2l0eSA9IDAuMDAxO1xuXHRcdFx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbigpO1xuXHRcdFx0fVxuXG5cdFx0XHRfcmVnaXN0ZXJTdGFydEFuaW1hdGlvbignaW5pdGlhbFpvb20nKTtcblx0XHRcdFxuXHRcdFx0aWYob3V0ICYmICFjbG9zZVdpdGhSYWYpIHtcblx0XHRcdFx0ZnJhbWV3b3JrLnJlbW92ZUNsYXNzKHRlbXBsYXRlLCAncHN3cC0tYW5pbWF0ZWQtaW4nKTtcblx0XHRcdH1cblxuXHRcdFx0aWYoZmFkZUV2ZXJ5dGhpbmcpIHtcblx0XHRcdFx0aWYob3V0KSB7XG5cdFx0XHRcdFx0ZnJhbWV3b3JrWyAoY2xvc2VXaXRoUmFmID8gJ3JlbW92ZScgOiAnYWRkJykgKyAnQ2xhc3MnIF0odGVtcGxhdGUsICdwc3dwLS1hbmltYXRlX29wYWNpdHknKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZnJhbWV3b3JrLmFkZENsYXNzKHRlbXBsYXRlLCAncHN3cC0tYW5pbWF0ZV9vcGFjaXR5Jyk7XG5cdFx0XHRcdFx0fSwgMzApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdF9zaG93T3JIaWRlVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0X3Nob3V0KCdpbml0aWFsWm9vbScgKyAob3V0ID8gJ091dCcgOiAnSW4nKSApO1xuXHRcdFx0XHRcblxuXHRcdFx0XHRpZighb3V0KSB7XG5cblx0XHRcdFx0XHQvLyBcImluXCIgYW5pbWF0aW9uIGFsd2F5cyB1c2VzIENTUyB0cmFuc2l0aW9ucyAoaW5zdGVhZCBvZiByQUYpLlxuXHRcdFx0XHRcdC8vIENTUyB0cmFuc2l0aW9uIHdvcmsgZmFzdGVyIGhlcmUsIFxuXHRcdFx0XHRcdC8vIGFzIGRldmVsb3BlciBtYXkgYWxzbyB3YW50IHRvIGFuaW1hdGUgb3RoZXIgdGhpbmdzLCBcblx0XHRcdFx0XHQvLyBsaWtlIHVpIG9uIHRvcCBvZiBzbGlkaW5nIGFyZWEsIHdoaWNoIGNhbiBiZSBhbmltYXRlZCBqdXN0IHZpYSBDU1Ncblx0XHRcdFx0XHRcblx0XHRcdFx0XHRfY3Vyclpvb21MZXZlbCA9IGl0ZW0uaW5pdGlhbFpvb21MZXZlbDtcblx0XHRcdFx0XHRfZXF1YWxpemVQb2ludHMoX3Bhbk9mZnNldCwgIGl0ZW0uaW5pdGlhbFBvc2l0aW9uICk7XG5cdFx0XHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oKTtcblx0XHRcdFx0XHRfYXBwbHlCZ09wYWNpdHkoMSk7XG5cblx0XHRcdFx0XHRpZihmYWRlRXZlcnl0aGluZykge1xuXHRcdFx0XHRcdFx0dGVtcGxhdGUuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdF9hcHBseUJnT3BhY2l0eSgxKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRfc2hvd09ySGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0KG9uQ29tcGxldGUsIGR1cmF0aW9uICsgMjApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0Ly8gXCJvdXRcIiBhbmltYXRpb24gdXNlcyByQUYgb25seSB3aGVuIFBob3RvU3dpcGUgaXMgY2xvc2VkIGJ5IGJyb3dzZXIgc2Nyb2xsLCB0byByZWNhbGN1bGF0ZSBwb3NpdGlvblxuXHRcdFx0XHRcdHZhciBkZXN0Wm9vbUxldmVsID0gdGh1bWJCb3VuZHMudyAvIGl0ZW0udyxcblx0XHRcdFx0XHRcdGluaXRpYWxQYW5PZmZzZXQgPSB7XG5cdFx0XHRcdFx0XHRcdHg6IF9wYW5PZmZzZXQueCxcblx0XHRcdFx0XHRcdFx0eTogX3Bhbk9mZnNldC55XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0aW5pdGlhbFpvb21MZXZlbCA9IF9jdXJyWm9vbUxldmVsLFxuXHRcdFx0XHRcdFx0aW5pdGFsQmdPcGFjaXR5ID0gX2JnT3BhY2l0eSxcblx0XHRcdFx0XHRcdG9uVXBkYXRlID0gZnVuY3Rpb24obm93KSB7XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRpZihub3cgPT09IDEpIHtcblx0XHRcdFx0XHRcdFx0XHRfY3Vyclpvb21MZXZlbCA9IGRlc3Rab29tTGV2ZWw7XG5cdFx0XHRcdFx0XHRcdFx0X3Bhbk9mZnNldC54ID0gdGh1bWJCb3VuZHMueDtcblx0XHRcdFx0XHRcdFx0XHRfcGFuT2Zmc2V0LnkgPSB0aHVtYkJvdW5kcy55ICAtIF9jdXJyZW50V2luZG93U2Nyb2xsWTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRfY3Vyclpvb21MZXZlbCA9IChkZXN0Wm9vbUxldmVsIC0gaW5pdGlhbFpvb21MZXZlbCkgKiBub3cgKyBpbml0aWFsWm9vbUxldmVsO1xuXHRcdFx0XHRcdFx0XHRcdF9wYW5PZmZzZXQueCA9ICh0aHVtYkJvdW5kcy54IC0gaW5pdGlhbFBhbk9mZnNldC54KSAqIG5vdyArIGluaXRpYWxQYW5PZmZzZXQueDtcblx0XHRcdFx0XHRcdFx0XHRfcGFuT2Zmc2V0LnkgPSAodGh1bWJCb3VuZHMueSAtIF9jdXJyZW50V2luZG93U2Nyb2xsWSAtIGluaXRpYWxQYW5PZmZzZXQueSkgKiBub3cgKyBpbml0aWFsUGFuT2Zmc2V0Lnk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdF9hcHBseUN1cnJlbnRab29tUGFuKCk7XG5cdFx0XHRcdFx0XHRcdGlmKGZhZGVFdmVyeXRoaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGVtcGxhdGUuc3R5bGUub3BhY2l0eSA9IDEgLSBub3c7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0X2FwcGx5QmdPcGFjaXR5KCBpbml0YWxCZ09wYWNpdHkgLSBub3cgKiBpbml0YWxCZ09wYWNpdHkgKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGlmKGNsb3NlV2l0aFJhZikge1xuXHRcdFx0XHRcdFx0X2FuaW1hdGVQcm9wKCdpbml0aWFsWm9vbScsIDAsIDEsIGR1cmF0aW9uLCBmcmFtZXdvcmsuZWFzaW5nLmN1YmljLm91dCwgb25VcGRhdGUsIG9uQ29tcGxldGUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvblVwZGF0ZSgxKTtcblx0XHRcdFx0XHRcdF9zaG93T3JIaWRlVGltZW91dCA9IHNldFRpbWVvdXQob25Db21wbGV0ZSwgZHVyYXRpb24gKyAyMCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdH0sIG91dCA/IDI1IDogOTApOyAvLyBNYWluIHB1cnBvc2Ugb2YgdGhpcyBkZWxheSBpcyB0byBnaXZlIGJyb3dzZXIgdGltZSB0byBwYWludCBhbmRcblx0XHRcdFx0XHQvLyBjcmVhdGUgY29tcG9zaXRlIGxheWVycyBvZiBQaG90b1N3aXBlIFVJIHBhcnRzIChiYWNrZ3JvdW5kLCBjb250cm9scywgY2FwdGlvbiwgYXJyb3dzKS5cblx0XHRcdFx0XHQvLyBXaGljaCBhdm9pZHMgbGFnIGF0IHRoZSBiZWdpbm5pbmcgb2Ygc2NhbGUgdHJhbnNpdGlvbi5cblx0XHR9O1xuXHRcdHN0YXJ0QW5pbWF0aW9uKCk7XG5cblx0XHRcblx0fTtcblxuLyo+PnNob3ctaGlkZS10cmFuc2l0aW9uKi9cblxuLyo+Pml0ZW1zLWNvbnRyb2xsZXIqL1xuLyoqXG4qXG4qIENvbnRyb2xsZXIgbWFuYWdlcyBnYWxsZXJ5IGl0ZW1zLCB0aGVpciBkaW1lbnNpb25zLCBhbmQgdGhlaXIgY29udGVudC5cbiogXG4qL1xuXG52YXIgX2l0ZW1zLFxuXHRfdGVtcFBhbkFyZWFTaXplID0ge30sXG5cdF9pbWFnZXNUb0FwcGVuZFBvb2wgPSBbXSxcblx0X2luaXRpYWxDb250ZW50U2V0LFxuXHRfaW5pdGlhbFpvb21SdW5uaW5nLFxuXHRfY29udHJvbGxlckRlZmF1bHRPcHRpb25zID0ge1xuXHRcdGluZGV4OiAwLFxuXHRcdGVycm9yTXNnOiAnPGRpdiBjbGFzcz1cInBzd3BfX2Vycm9yLW1zZ1wiPjxhIGhyZWY9XCIldXJsJVwiIHRhcmdldD1cIl9ibGFua1wiPlRoZSBpbWFnZTwvYT4gY291bGQgbm90IGJlIGxvYWRlZC48L2Rpdj4nLFxuXHRcdGZvcmNlUHJvZ3Jlc3NpdmVMb2FkaW5nOiBmYWxzZSwgLy8gVE9ET1xuXHRcdHByZWxvYWQ6IFsxLDFdLFxuXHRcdGdldE51bUl0ZW1zRm46IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIF9pdGVtcy5sZW5ndGg7XG5cdFx0fVxuXHR9O1xuXG5cbnZhciBfZ2V0SXRlbUF0LFxuXHRfZ2V0TnVtSXRlbXMsXG5cdF9pbml0aWFsSXNMb29wLFxuXHRfZ2V0WmVyb0JvdW5kcyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjZW50ZXI6e3g6MCx5OjB9LCBcblx0XHRcdG1heDp7eDowLHk6MH0sIFxuXHRcdFx0bWluOnt4OjAseTowfVxuXHRcdH07XG5cdH0sXG5cdF9jYWxjdWxhdGVTaW5nbGVJdGVtUGFuQm91bmRzID0gZnVuY3Rpb24oaXRlbSwgcmVhbFBhbkVsZW1lbnRXLCByZWFsUGFuRWxlbWVudEggKSB7XG5cdFx0dmFyIGJvdW5kcyA9IGl0ZW0uYm91bmRzO1xuXG5cdFx0Ly8gcG9zaXRpb24gb2YgZWxlbWVudCB3aGVuIGl0J3MgY2VudGVyZWRcblx0XHRib3VuZHMuY2VudGVyLnggPSBNYXRoLnJvdW5kKChfdGVtcFBhbkFyZWFTaXplLnggLSByZWFsUGFuRWxlbWVudFcpIC8gMik7XG5cdFx0Ym91bmRzLmNlbnRlci55ID0gTWF0aC5yb3VuZCgoX3RlbXBQYW5BcmVhU2l6ZS55IC0gcmVhbFBhbkVsZW1lbnRIKSAvIDIpICsgaXRlbS52R2FwLnRvcDtcblxuXHRcdC8vIG1heGltdW0gcGFuIHBvc2l0aW9uXG5cdFx0Ym91bmRzLm1heC54ID0gKHJlYWxQYW5FbGVtZW50VyA+IF90ZW1wUGFuQXJlYVNpemUueCkgPyBcblx0XHRcdFx0XHRcdFx0TWF0aC5yb3VuZChfdGVtcFBhbkFyZWFTaXplLnggLSByZWFsUGFuRWxlbWVudFcpIDogXG5cdFx0XHRcdFx0XHRcdGJvdW5kcy5jZW50ZXIueDtcblx0XHRcblx0XHRib3VuZHMubWF4LnkgPSAocmVhbFBhbkVsZW1lbnRIID4gX3RlbXBQYW5BcmVhU2l6ZS55KSA/IFxuXHRcdFx0XHRcdFx0XHRNYXRoLnJvdW5kKF90ZW1wUGFuQXJlYVNpemUueSAtIHJlYWxQYW5FbGVtZW50SCkgKyBpdGVtLnZHYXAudG9wIDogXG5cdFx0XHRcdFx0XHRcdGJvdW5kcy5jZW50ZXIueTtcblx0XHRcblx0XHQvLyBtaW5pbXVtIHBhbiBwb3NpdGlvblxuXHRcdGJvdW5kcy5taW4ueCA9IChyZWFsUGFuRWxlbWVudFcgPiBfdGVtcFBhbkFyZWFTaXplLngpID8gMCA6IGJvdW5kcy5jZW50ZXIueDtcblx0XHRib3VuZHMubWluLnkgPSAocmVhbFBhbkVsZW1lbnRIID4gX3RlbXBQYW5BcmVhU2l6ZS55KSA/IGl0ZW0udkdhcC50b3AgOiBib3VuZHMuY2VudGVyLnk7XG5cdH0sXG5cdF9jYWxjdWxhdGVJdGVtU2l6ZSA9IGZ1bmN0aW9uKGl0ZW0sIHZpZXdwb3J0U2l6ZSwgem9vbUxldmVsKSB7XG5cblx0XHRpZiAoaXRlbS5zcmMgJiYgIWl0ZW0ubG9hZEVycm9yKSB7XG5cdFx0XHR2YXIgaXNJbml0aWFsID0gIXpvb21MZXZlbDtcblx0XHRcdFxuXHRcdFx0aWYoaXNJbml0aWFsKSB7XG5cdFx0XHRcdGlmKCFpdGVtLnZHYXApIHtcblx0XHRcdFx0XHRpdGVtLnZHYXAgPSB7dG9wOjAsYm90dG9tOjB9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGFsbG93cyBvdmVycmlkaW5nIHZlcnRpY2FsIG1hcmdpbiBmb3IgaW5kaXZpZHVhbCBpdGVtc1xuXHRcdFx0XHRfc2hvdXQoJ3BhcnNlVmVydGljYWxNYXJnaW4nLCBpdGVtKTtcblx0XHRcdH1cblxuXG5cdFx0XHRfdGVtcFBhbkFyZWFTaXplLnggPSB2aWV3cG9ydFNpemUueDtcblx0XHRcdF90ZW1wUGFuQXJlYVNpemUueSA9IHZpZXdwb3J0U2l6ZS55IC0gaXRlbS52R2FwLnRvcCAtIGl0ZW0udkdhcC5ib3R0b207XG5cblx0XHRcdGlmIChpc0luaXRpYWwpIHtcblx0XHRcdFx0dmFyIGhSYXRpbyA9IF90ZW1wUGFuQXJlYVNpemUueCAvIGl0ZW0udztcblx0XHRcdFx0dmFyIHZSYXRpbyA9IF90ZW1wUGFuQXJlYVNpemUueSAvIGl0ZW0uaDtcblxuXHRcdFx0XHRpdGVtLmZpdFJhdGlvID0gaFJhdGlvIDwgdlJhdGlvID8gaFJhdGlvIDogdlJhdGlvO1xuXHRcdFx0XHQvL2l0ZW0uZmlsbFJhdGlvID0gaFJhdGlvID4gdlJhdGlvID8gaFJhdGlvIDogdlJhdGlvO1xuXG5cdFx0XHRcdHZhciBzY2FsZU1vZGUgPSBfb3B0aW9ucy5zY2FsZU1vZGU7XG5cblx0XHRcdFx0aWYgKHNjYWxlTW9kZSA9PT0gJ29yaWcnKSB7XG5cdFx0XHRcdFx0em9vbUxldmVsID0gMTtcblx0XHRcdFx0fSBlbHNlIGlmIChzY2FsZU1vZGUgPT09ICdmaXQnKSB7XG5cdFx0XHRcdFx0em9vbUxldmVsID0gaXRlbS5maXRSYXRpbztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh6b29tTGV2ZWwgPiAxKSB7XG5cdFx0XHRcdFx0em9vbUxldmVsID0gMTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGl0ZW0uaW5pdGlhbFpvb21MZXZlbCA9IHpvb21MZXZlbDtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKCFpdGVtLmJvdW5kcykge1xuXHRcdFx0XHRcdC8vIHJldXNlIGJvdW5kcyBvYmplY3Rcblx0XHRcdFx0XHRpdGVtLmJvdW5kcyA9IF9nZXRaZXJvQm91bmRzKCk7IFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKCF6b29tTGV2ZWwpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRfY2FsY3VsYXRlU2luZ2xlSXRlbVBhbkJvdW5kcyhpdGVtLCBpdGVtLncgKiB6b29tTGV2ZWwsIGl0ZW0uaCAqIHpvb21MZXZlbCk7XG5cblx0XHRcdGlmIChpc0luaXRpYWwgJiYgem9vbUxldmVsID09PSBpdGVtLmluaXRpYWxab29tTGV2ZWwpIHtcblx0XHRcdFx0aXRlbS5pbml0aWFsUG9zaXRpb24gPSBpdGVtLmJvdW5kcy5jZW50ZXI7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBpdGVtLmJvdW5kcztcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlbS53ID0gaXRlbS5oID0gMDtcblx0XHRcdGl0ZW0uaW5pdGlhbFpvb21MZXZlbCA9IGl0ZW0uZml0UmF0aW8gPSAxO1xuXHRcdFx0aXRlbS5ib3VuZHMgPSBfZ2V0WmVyb0JvdW5kcygpO1xuXHRcdFx0aXRlbS5pbml0aWFsUG9zaXRpb24gPSBpdGVtLmJvdW5kcy5jZW50ZXI7XG5cblx0XHRcdC8vIGlmIGl0J3Mgbm90IGltYWdlLCB3ZSByZXR1cm4gemVybyBib3VuZHMgKGNvbnRlbnQgaXMgbm90IHpvb21hYmxlKVxuXHRcdFx0cmV0dXJuIGl0ZW0uYm91bmRzO1xuXHRcdH1cblx0XHRcblx0fSxcblxuXHRcblxuXG5cdF9hcHBlbmRJbWFnZSA9IGZ1bmN0aW9uKGluZGV4LCBpdGVtLCBiYXNlRGl2LCBpbWcsIHByZXZlbnRBbmltYXRpb24sIGtlZXBQbGFjZWhvbGRlcikge1xuXHRcdFxuXG5cdFx0aWYoaXRlbS5sb2FkRXJyb3IpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZihpbWcpIHtcblxuXHRcdFx0aXRlbS5pbWFnZUFwcGVuZGVkID0gdHJ1ZTtcblx0XHRcdF9zZXRJbWFnZVNpemUoaXRlbSwgaW1nLCAoaXRlbSA9PT0gc2VsZi5jdXJySXRlbSAmJiBfcmVuZGVyTWF4UmVzb2x1dGlvbikgKTtcblx0XHRcdFxuXHRcdFx0YmFzZURpdi5hcHBlbmRDaGlsZChpbWcpO1xuXG5cdFx0XHRpZihrZWVwUGxhY2Vob2xkZXIpIHtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZihpdGVtICYmIGl0ZW0ubG9hZGVkICYmIGl0ZW0ucGxhY2Vob2xkZXIpIHtcblx0XHRcdFx0XHRcdGl0ZW0ucGxhY2Vob2xkZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdFx0XHRcdGl0ZW0ucGxhY2Vob2xkZXIgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgNTAwKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFxuXG5cblx0X3ByZWxvYWRJbWFnZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRpdGVtLmxvYWRpbmcgPSB0cnVlO1xuXHRcdGl0ZW0ubG9hZGVkID0gZmFsc2U7XG5cdFx0dmFyIGltZyA9IGl0ZW0uaW1nID0gZnJhbWV3b3JrLmNyZWF0ZUVsKCdwc3dwX19pbWcnLCAnaW1nJyk7XG5cdFx0dmFyIG9uQ29tcGxldGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGl0ZW0ubG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0aXRlbS5sb2FkZWQgPSB0cnVlO1xuXG5cdFx0XHRpZihpdGVtLmxvYWRDb21wbGV0ZSkge1xuXHRcdFx0XHRpdGVtLmxvYWRDb21wbGV0ZShpdGVtKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGl0ZW0uaW1nID0gbnVsbDsgLy8gbm8gbmVlZCB0byBzdG9yZSBpbWFnZSBvYmplY3Rcblx0XHRcdH1cblx0XHRcdGltZy5vbmxvYWQgPSBpbWcub25lcnJvciA9IG51bGw7XG5cdFx0XHRpbWcgPSBudWxsO1xuXHRcdH07XG5cdFx0aW1nLm9ubG9hZCA9IG9uQ29tcGxldGU7XG5cdFx0aW1nLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdGl0ZW0ubG9hZEVycm9yID0gdHJ1ZTtcblx0XHRcdG9uQ29tcGxldGUoKTtcblx0XHR9O1x0XHRcblxuXHRcdGltZy5zcmMgPSBpdGVtLnNyYzsvLyArICc/YT0nICsgTWF0aC5yYW5kb20oKTtcblxuXHRcdHJldHVybiBpbWc7XG5cdH0sXG5cdF9jaGVja0ZvckVycm9yID0gZnVuY3Rpb24oaXRlbSwgY2xlYW5VcCkge1xuXHRcdGlmKGl0ZW0uc3JjICYmIGl0ZW0ubG9hZEVycm9yICYmIGl0ZW0uY29udGFpbmVyKSB7XG5cblx0XHRcdGlmKGNsZWFuVXApIHtcblx0XHRcdFx0aXRlbS5jb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cdFx0XHR9XG5cblx0XHRcdGl0ZW0uY29udGFpbmVyLmlubmVySFRNTCA9IF9vcHRpb25zLmVycm9yTXNnLnJlcGxhY2UoJyV1cmwlJywgIGl0ZW0uc3JjICk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFxuXHRcdH1cblx0fSxcblx0X3NldEltYWdlU2l6ZSA9IGZ1bmN0aW9uKGl0ZW0sIGltZywgbWF4UmVzKSB7XG5cdFx0aWYoIWl0ZW0uc3JjKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYoIWltZykge1xuXHRcdFx0aW1nID0gaXRlbS5jb250YWluZXIubGFzdENoaWxkO1xuXHRcdH1cblxuXHRcdHZhciB3ID0gbWF4UmVzID8gaXRlbS53IDogTWF0aC5yb3VuZChpdGVtLncgKiBpdGVtLmZpdFJhdGlvKSxcblx0XHRcdGggPSBtYXhSZXMgPyBpdGVtLmggOiBNYXRoLnJvdW5kKGl0ZW0uaCAqIGl0ZW0uZml0UmF0aW8pO1xuXHRcdFxuXHRcdGlmKGl0ZW0ucGxhY2Vob2xkZXIgJiYgIWl0ZW0ubG9hZGVkKSB7XG5cdFx0XHRpdGVtLnBsYWNlaG9sZGVyLnN0eWxlLndpZHRoID0gdyArICdweCc7XG5cdFx0XHRpdGVtLnBsYWNlaG9sZGVyLnN0eWxlLmhlaWdodCA9IGggKyAncHgnO1xuXHRcdH1cblxuXHRcdGltZy5zdHlsZS53aWR0aCA9IHcgKyAncHgnO1xuXHRcdGltZy5zdHlsZS5oZWlnaHQgPSBoICsgJ3B4Jztcblx0fSxcblx0X2FwcGVuZEltYWdlc1Bvb2wgPSBmdW5jdGlvbigpIHtcblxuXHRcdGlmKF9pbWFnZXNUb0FwcGVuZFBvb2wubGVuZ3RoKSB7XG5cdFx0XHR2YXIgcG9vbEl0ZW07XG5cblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBfaW1hZ2VzVG9BcHBlbmRQb29sLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHBvb2xJdGVtID0gX2ltYWdlc1RvQXBwZW5kUG9vbFtpXTtcblx0XHRcdFx0aWYoIHBvb2xJdGVtLmhvbGRlci5pbmRleCA9PT0gcG9vbEl0ZW0uaW5kZXggKSB7XG5cdFx0XHRcdFx0X2FwcGVuZEltYWdlKHBvb2xJdGVtLmluZGV4LCBwb29sSXRlbS5pdGVtLCBwb29sSXRlbS5iYXNlRGl2LCBwb29sSXRlbS5pbWcsIGZhbHNlLCBwb29sSXRlbS5jbGVhclBsYWNlaG9sZGVyKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0X2ltYWdlc1RvQXBwZW5kUG9vbCA9IFtdO1xuXHRcdH1cblx0fTtcblx0XG5cblxuX3JlZ2lzdGVyTW9kdWxlKCdDb250cm9sbGVyJywge1xuXG5cdHB1YmxpY01ldGhvZHM6IHtcblxuXHRcdGxhenlMb2FkSXRlbTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdGluZGV4ID0gX2dldExvb3BlZElkKGluZGV4KTtcblx0XHRcdHZhciBpdGVtID0gX2dldEl0ZW1BdChpbmRleCk7XG5cblx0XHRcdGlmKCFpdGVtIHx8ICgoaXRlbS5sb2FkZWQgfHwgaXRlbS5sb2FkaW5nKSAmJiAhX2l0ZW1zTmVlZFVwZGF0ZSkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRfc2hvdXQoJ2dldHRpbmdEYXRhJywgaW5kZXgsIGl0ZW0pO1xuXG5cdFx0XHRpZiAoIWl0ZW0uc3JjKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X3ByZWxvYWRJbWFnZShpdGVtKTtcblx0XHR9LFxuXHRcdGluaXRDb250cm9sbGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdGZyYW1ld29yay5leHRlbmQoX29wdGlvbnMsIF9jb250cm9sbGVyRGVmYXVsdE9wdGlvbnMsIHRydWUpO1xuXHRcdFx0c2VsZi5pdGVtcyA9IF9pdGVtcyA9IGl0ZW1zO1xuXHRcdFx0X2dldEl0ZW1BdCA9IHNlbGYuZ2V0SXRlbUF0O1xuXHRcdFx0X2dldE51bUl0ZW1zID0gX29wdGlvbnMuZ2V0TnVtSXRlbXNGbjsgLy9zZWxmLmdldE51bUl0ZW1zO1xuXG5cblxuXHRcdFx0X2luaXRpYWxJc0xvb3AgPSBfb3B0aW9ucy5sb29wO1xuXHRcdFx0aWYoX2dldE51bUl0ZW1zKCkgPCAzKSB7XG5cdFx0XHRcdF9vcHRpb25zLmxvb3AgPSBmYWxzZTsgLy8gZGlzYWJsZSBsb29wIGlmIGxlc3MgdGhlbiAzIGl0ZW1zXG5cdFx0XHR9XG5cblx0XHRcdF9saXN0ZW4oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uKGRpZmYpIHtcblxuXHRcdFx0XHR2YXIgcCA9IF9vcHRpb25zLnByZWxvYWQsXG5cdFx0XHRcdFx0aXNOZXh0ID0gZGlmZiA9PT0gbnVsbCA/IHRydWUgOiAoZGlmZiA+PSAwKSxcblx0XHRcdFx0XHRwcmVsb2FkQmVmb3JlID0gTWF0aC5taW4ocFswXSwgX2dldE51bUl0ZW1zKCkgKSxcblx0XHRcdFx0XHRwcmVsb2FkQWZ0ZXIgPSBNYXRoLm1pbihwWzFdLCBfZ2V0TnVtSXRlbXMoKSApLFxuXHRcdFx0XHRcdGk7XG5cblxuXHRcdFx0XHRmb3IoaSA9IDE7IGkgPD0gKGlzTmV4dCA/IHByZWxvYWRBZnRlciA6IHByZWxvYWRCZWZvcmUpOyBpKyspIHtcblx0XHRcdFx0XHRzZWxmLmxhenlMb2FkSXRlbShfY3VycmVudEl0ZW1JbmRleCtpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IoaSA9IDE7IGkgPD0gKGlzTmV4dCA/IHByZWxvYWRCZWZvcmUgOiBwcmVsb2FkQWZ0ZXIpOyBpKyspIHtcblx0XHRcdFx0XHRzZWxmLmxhenlMb2FkSXRlbShfY3VycmVudEl0ZW1JbmRleC1pKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdF9saXN0ZW4oJ2luaXRpYWxMYXlvdXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5jdXJySXRlbS5pbml0aWFsTGF5b3V0ID0gX29wdGlvbnMuZ2V0VGh1bWJCb3VuZHNGbiAmJiBfb3B0aW9ucy5nZXRUaHVtYkJvdW5kc0ZuKF9jdXJyZW50SXRlbUluZGV4KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRfbGlzdGVuKCdtYWluU2Nyb2xsQW5pbUNvbXBsZXRlJywgX2FwcGVuZEltYWdlc1Bvb2wpO1xuXHRcdFx0X2xpc3RlbignaW5pdGlhbFpvb21JbkVuZCcsIF9hcHBlbmRJbWFnZXNQb29sKTtcblxuXG5cblx0XHRcdF9saXN0ZW4oJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGl0ZW07XG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBfaXRlbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpdGVtID0gX2l0ZW1zW2ldO1xuXHRcdFx0XHRcdC8vIHJlbW92ZSByZWZlcmVuY2UgdG8gRE9NIGVsZW1lbnRzLCBmb3IgR0Ncblx0XHRcdFx0XHRpZihpdGVtLmNvbnRhaW5lcikge1xuXHRcdFx0XHRcdFx0aXRlbS5jb250YWluZXIgPSBudWxsOyBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoaXRlbS5wbGFjZWhvbGRlcikge1xuXHRcdFx0XHRcdFx0aXRlbS5wbGFjZWhvbGRlciA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKGl0ZW0uaW1nKSB7XG5cdFx0XHRcdFx0XHRpdGVtLmltZyA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKGl0ZW0ucHJlbG9hZGVyKSB7XG5cdFx0XHRcdFx0XHRpdGVtLnByZWxvYWRlciA9IG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKGl0ZW0ubG9hZEVycm9yKSB7XG5cdFx0XHRcdFx0XHRpdGVtLmxvYWRlZCA9IGl0ZW0ubG9hZEVycm9yID0gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdF9pbWFnZXNUb0FwcGVuZFBvb2wgPSBudWxsO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXG5cdFx0Z2V0SXRlbUF0OiBmdW5jdGlvbihpbmRleCkge1xuXHRcdFx0aWYgKGluZGV4ID49IDApIHtcblx0XHRcdFx0cmV0dXJuIF9pdGVtc1tpbmRleF0gIT09IHVuZGVmaW5lZCA/IF9pdGVtc1tpbmRleF0gOiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXG5cdFx0YWxsb3dQcm9ncmVzc2l2ZUltZzogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyAxLiBQcm9ncmVzc2l2ZSBpbWFnZSBsb2FkaW5nIGlzbid0IHdvcmtpbmcgb24gd2Via2l0L2JsaW5rIFxuXHRcdFx0Ly8gICAgd2hlbiBody1hY2NlbGVyYXRpb24gKGUuZy4gdHJhbnNsYXRlWikgaXMgYXBwbGllZCB0byBJTUcgZWxlbWVudC5cblx0XHRcdC8vICAgIFRoYXQncyB3aHkgaW4gUGhvdG9Td2lwZSBwYXJlbnQgZWxlbWVudCBnZXRzIHpvb20gdHJhbnNmb3JtLCBub3QgaW1hZ2UgaXRzZWxmLlxuXHRcdFx0Ly8gICAgXG5cdFx0XHQvLyAyLiBQcm9ncmVzc2l2ZSBpbWFnZSBsb2FkaW5nIHNvbWV0aW1lcyBibGlua3MgaW4gd2Via2l0L2JsaW5rIHdoZW4gYXBwbHlpbmcgYW5pbWF0aW9uIHRvIHBhcmVudCBlbGVtZW50LlxuXHRcdFx0Ly8gICAgVGhhdCdzIHdoeSBpdCdzIGRpc2FibGVkIG9uIHRvdWNoIGRldmljZXMgKG1haW5seSBiZWNhdXNlIG9mIHN3aXBlIHRyYW5zaXRpb24pXG5cdFx0XHQvLyAgICBcblx0XHRcdC8vIDMuIFByb2dyZXNzaXZlIGltYWdlIGxvYWRpbmcgc29tZXRpbWVzIGRvZXNuJ3Qgd29yayBpbiBJRSAodXAgdG8gMTEpLlxuXG5cdFx0XHQvLyBEb24ndCBhbGxvdyBwcm9ncmVzc2l2ZSBsb2FkaW5nIG9uIG5vbi1sYXJnZSB0b3VjaCBkZXZpY2VzXG5cdFx0XHRyZXR1cm4gX29wdGlvbnMuZm9yY2VQcm9ncmVzc2l2ZUxvYWRpbmcgfHwgIV9saWtlbHlUb3VjaERldmljZSB8fCBfb3B0aW9ucy5tb3VzZVVzZWQgfHwgc2NyZWVuLndpZHRoID4gMTIwMDsgXG5cdFx0XHQvLyAxMjAwIC0gdG8gZWxpbWluYXRlIHRvdWNoIGRldmljZXMgd2l0aCBsYXJnZSBzY3JlZW4gKGxpa2UgQ2hyb21lYm9vayBQaXhlbClcblx0XHR9LFxuXG5cdFx0c2V0Q29udGVudDogZnVuY3Rpb24oaG9sZGVyLCBpbmRleCkge1xuXG5cdFx0XHRpZihfb3B0aW9ucy5sb29wKSB7XG5cdFx0XHRcdGluZGV4ID0gX2dldExvb3BlZElkKGluZGV4KTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHByZXZJdGVtID0gc2VsZi5nZXRJdGVtQXQoaG9sZGVyLmluZGV4KTtcblx0XHRcdGlmKHByZXZJdGVtKSB7XG5cdFx0XHRcdHByZXZJdGVtLmNvbnRhaW5lciA9IG51bGw7XG5cdFx0XHR9XG5cdFxuXHRcdFx0dmFyIGl0ZW0gPSBzZWxmLmdldEl0ZW1BdChpbmRleCksXG5cdFx0XHRcdGltZztcblx0XHRcdFxuXHRcdFx0aWYoIWl0ZW0pIHtcblx0XHRcdFx0aG9sZGVyLmVsLmlubmVySFRNTCA9ICcnO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIGFsbG93IHRvIG92ZXJyaWRlIGRhdGFcblx0XHRcdF9zaG91dCgnZ2V0dGluZ0RhdGEnLCBpbmRleCwgaXRlbSk7XG5cblx0XHRcdGhvbGRlci5pbmRleCA9IGluZGV4O1xuXHRcdFx0aG9sZGVyLml0ZW0gPSBpdGVtO1xuXG5cdFx0XHQvLyBiYXNlIGNvbnRhaW5lciBESVYgaXMgY3JlYXRlZCBvbmx5IG9uY2UgZm9yIGVhY2ggb2YgMyBob2xkZXJzXG5cdFx0XHR2YXIgYmFzZURpdiA9IGl0ZW0uY29udGFpbmVyID0gZnJhbWV3b3JrLmNyZWF0ZUVsKCdwc3dwX196b29tLXdyYXAnKTsgXG5cblx0XHRcdFxuXG5cdFx0XHRpZighaXRlbS5zcmMgJiYgaXRlbS5odG1sKSB7XG5cdFx0XHRcdGlmKGl0ZW0uaHRtbC50YWdOYW1lKSB7XG5cdFx0XHRcdFx0YmFzZURpdi5hcHBlbmRDaGlsZChpdGVtLmh0bWwpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGJhc2VEaXYuaW5uZXJIVE1MID0gaXRlbS5odG1sO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdF9jaGVja0ZvckVycm9yKGl0ZW0pO1xuXG5cdFx0XHRfY2FsY3VsYXRlSXRlbVNpemUoaXRlbSwgX3ZpZXdwb3J0U2l6ZSk7XG5cdFx0XHRcblx0XHRcdGlmKGl0ZW0uc3JjICYmICFpdGVtLmxvYWRFcnJvciAmJiAhaXRlbS5sb2FkZWQpIHtcblxuXHRcdFx0XHRpdGVtLmxvYWRDb21wbGV0ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcblxuXHRcdFx0XHRcdC8vIGdhbGxlcnkgY2xvc2VkIGJlZm9yZSBpbWFnZSBmaW5pc2hlZCBsb2FkaW5nXG5cdFx0XHRcdFx0aWYoIV9pc09wZW4pIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBjaGVjayBpZiBob2xkZXIgaGFzbid0IGNoYW5nZWQgd2hpbGUgaW1hZ2Ugd2FzIGxvYWRpbmdcblx0XHRcdFx0XHRpZihob2xkZXIgJiYgaG9sZGVyLmluZGV4ID09PSBpbmRleCApIHtcblx0XHRcdFx0XHRcdGlmKCBfY2hlY2tGb3JFcnJvcihpdGVtLCB0cnVlKSApIHtcblx0XHRcdFx0XHRcdFx0aXRlbS5sb2FkQ29tcGxldGUgPSBpdGVtLmltZyA9IG51bGw7XG5cdFx0XHRcdFx0XHRcdF9jYWxjdWxhdGVJdGVtU2l6ZShpdGVtLCBfdmlld3BvcnRTaXplKTtcblx0XHRcdFx0XHRcdFx0X2FwcGx5Wm9vbVBhblRvSXRlbShpdGVtKTtcblxuXHRcdFx0XHRcdFx0XHRpZihob2xkZXIuaW5kZXggPT09IF9jdXJyZW50SXRlbUluZGV4KSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gcmVjYWxjdWxhdGUgZGltZW5zaW9uc1xuXHRcdFx0XHRcdFx0XHRcdHNlbGYudXBkYXRlQ3Vyclpvb21JdGVtKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYoICFpdGVtLmltYWdlQXBwZW5kZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGlmKF9mZWF0dXJlcy50cmFuc2Zvcm0gJiYgKF9tYWluU2Nyb2xsQW5pbWF0aW5nIHx8IF9pbml0aWFsWm9vbVJ1bm5pbmcpICkge1xuXHRcdFx0XHRcdFx0XHRcdF9pbWFnZXNUb0FwcGVuZFBvb2wucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRpdGVtOml0ZW0sXG5cdFx0XHRcdFx0XHRcdFx0XHRiYXNlRGl2OmJhc2VEaXYsXG5cdFx0XHRcdFx0XHRcdFx0XHRpbWc6aXRlbS5pbWcsXG5cdFx0XHRcdFx0XHRcdFx0XHRpbmRleDppbmRleCxcblx0XHRcdFx0XHRcdFx0XHRcdGhvbGRlcjpob2xkZXIsXG5cdFx0XHRcdFx0XHRcdFx0XHRjbGVhclBsYWNlaG9sZGVyOnRydWVcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRfYXBwZW5kSW1hZ2UoaW5kZXgsIGl0ZW0sIGJhc2VEaXYsIGl0ZW0uaW1nLCBfbWFpblNjcm9sbEFuaW1hdGluZyB8fCBfaW5pdGlhbFpvb21SdW5uaW5nLCB0cnVlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcmVtb3ZlIHByZWxvYWRlciAmIG1pbmktaW1nXG5cdFx0XHRcdFx0XHRcdGlmKCFfaW5pdGlhbFpvb21SdW5uaW5nICYmIGl0ZW0ucGxhY2Vob2xkZXIpIHtcblx0XHRcdFx0XHRcdFx0XHRpdGVtLnBsYWNlaG9sZGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdFx0XHRcdFx0aXRlbS5wbGFjZWhvbGRlciA9IG51bGw7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpdGVtLmxvYWRDb21wbGV0ZSA9IG51bGw7XG5cdFx0XHRcdFx0aXRlbS5pbWcgPSBudWxsOyAvLyBubyBuZWVkIHRvIHN0b3JlIGltYWdlIGVsZW1lbnQgYWZ0ZXIgaXQncyBhZGRlZFxuXG5cdFx0XHRcdFx0X3Nob3V0KCdpbWFnZUxvYWRDb21wbGV0ZScsIGluZGV4LCBpdGVtKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZihmcmFtZXdvcmsuZmVhdHVyZXMudHJhbnNmb3JtKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFyIHBsYWNlaG9sZGVyQ2xhc3NOYW1lID0gJ3Bzd3BfX2ltZyBwc3dwX19pbWctLXBsYWNlaG9sZGVyJzsgXG5cdFx0XHRcdFx0cGxhY2Vob2xkZXJDbGFzc05hbWUgKz0gKGl0ZW0ubXNyYyA/ICcnIDogJyBwc3dwX19pbWctLXBsYWNlaG9sZGVyLS1ibGFuaycpO1xuXG5cdFx0XHRcdFx0dmFyIHBsYWNlaG9sZGVyID0gZnJhbWV3b3JrLmNyZWF0ZUVsKHBsYWNlaG9sZGVyQ2xhc3NOYW1lLCBpdGVtLm1zcmMgPyAnaW1nJyA6ICcnKTtcblx0XHRcdFx0XHRpZihpdGVtLm1zcmMpIHtcblx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyLnNyYyA9IGl0ZW0ubXNyYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0X3NldEltYWdlU2l6ZShpdGVtLCBwbGFjZWhvbGRlcik7XG5cblx0XHRcdFx0XHRiYXNlRGl2LmFwcGVuZENoaWxkKHBsYWNlaG9sZGVyKTtcblx0XHRcdFx0XHRpdGVtLnBsYWNlaG9sZGVyID0gcGxhY2Vob2xkZXI7XG5cblx0XHRcdFx0fVxuXHRcdFx0XHRcblxuXHRcdFx0XHRcblxuXHRcdFx0XHRpZighaXRlbS5sb2FkaW5nKSB7XG5cdFx0XHRcdFx0X3ByZWxvYWRJbWFnZShpdGVtKTtcblx0XHRcdFx0fVxuXG5cblx0XHRcdFx0aWYoIHNlbGYuYWxsb3dQcm9ncmVzc2l2ZUltZygpICkge1xuXHRcdFx0XHRcdC8vIGp1c3QgYXBwZW5kIGltYWdlXG5cdFx0XHRcdFx0aWYoIV9pbml0aWFsQ29udGVudFNldCAmJiBfZmVhdHVyZXMudHJhbnNmb3JtKSB7XG5cdFx0XHRcdFx0XHRfaW1hZ2VzVG9BcHBlbmRQb29sLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRpdGVtOml0ZW0sIFxuXHRcdFx0XHRcdFx0XHRiYXNlRGl2OmJhc2VEaXYsIFxuXHRcdFx0XHRcdFx0XHRpbWc6aXRlbS5pbWcsIFxuXHRcdFx0XHRcdFx0XHRpbmRleDppbmRleCwgXG5cdFx0XHRcdFx0XHRcdGhvbGRlcjpob2xkZXJcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRfYXBwZW5kSW1hZ2UoaW5kZXgsIGl0ZW0sIGJhc2VEaXYsIGl0ZW0uaW1nLCB0cnVlLCB0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9IGVsc2UgaWYoaXRlbS5zcmMgJiYgIWl0ZW0ubG9hZEVycm9yKSB7XG5cdFx0XHRcdC8vIGltYWdlIG9iamVjdCBpcyBjcmVhdGVkIGV2ZXJ5IHRpbWUsIGR1ZSB0byBidWdzIG9mIGltYWdlIGxvYWRpbmcgJiBkZWxheSB3aGVuIHN3aXRjaGluZyBpbWFnZXNcblx0XHRcdFx0aW1nID0gZnJhbWV3b3JrLmNyZWF0ZUVsKCdwc3dwX19pbWcnLCAnaW1nJyk7XG5cdFx0XHRcdGltZy5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdFx0aW1nLnNyYyA9IGl0ZW0uc3JjO1xuXHRcdFx0XHRfc2V0SW1hZ2VTaXplKGl0ZW0sIGltZyk7XG5cdFx0XHRcdF9hcHBlbmRJbWFnZShpbmRleCwgaXRlbSwgYmFzZURpdiwgaW1nLCB0cnVlKTtcblx0XHRcdH1cblx0XHRcdFxuXG5cdFx0XHRpZighX2luaXRpYWxDb250ZW50U2V0ICYmIGluZGV4ID09PSBfY3VycmVudEl0ZW1JbmRleCkge1xuXHRcdFx0XHRfY3Vyclpvb21FbGVtZW50U3R5bGUgPSBiYXNlRGl2LnN0eWxlO1xuXHRcdFx0XHRfc2hvd09ySGlkZShpdGVtLCAoaW1nIHx8aXRlbS5pbWcpICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfYXBwbHlab29tUGFuVG9JdGVtKGl0ZW0pO1xuXHRcdFx0fVxuXG5cdFx0XHRob2xkZXIuZWwuaW5uZXJIVE1MID0gJyc7XG5cdFx0XHRob2xkZXIuZWwuYXBwZW5kQ2hpbGQoYmFzZURpdik7XG5cdFx0fSxcblxuXHRcdGNsZWFuU2xpZGU6IGZ1bmN0aW9uKCBpdGVtICkge1xuXHRcdFx0aWYoaXRlbS5pbWcgKSB7XG5cdFx0XHRcdGl0ZW0uaW1nLm9ubG9hZCA9IGl0ZW0uaW1nLm9uZXJyb3IgPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0aXRlbS5sb2FkZWQgPSBpdGVtLmxvYWRpbmcgPSBpdGVtLmltZyA9IGl0ZW0uaW1hZ2VBcHBlbmRlZCA9IGZhbHNlO1xuXHRcdH1cblxuXHR9XG59KTtcblxuLyo+Pml0ZW1zLWNvbnRyb2xsZXIqL1xuXG4vKj4+dGFwKi9cbi8qKlxuICogdGFwLmpzOlxuICpcbiAqIERpc3BsYXRjaGVzIHRhcCBhbmQgZG91YmxlLXRhcCBldmVudHMuXG4gKiBcbiAqL1xuXG52YXIgdGFwVGltZXIsXG5cdHRhcFJlbGVhc2VQb2ludCA9IHt9LFxuXHRfZGlzcGF0Y2hUYXBFdmVudCA9IGZ1bmN0aW9uKG9yaWdFdmVudCwgcmVsZWFzZVBvaW50LCBwb2ludGVyVHlwZSkge1x0XHRcblx0XHR2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCAnQ3VzdG9tRXZlbnQnICksXG5cdFx0XHRlRGV0YWlsID0ge1xuXHRcdFx0XHRvcmlnRXZlbnQ6b3JpZ0V2ZW50LCBcblx0XHRcdFx0dGFyZ2V0Om9yaWdFdmVudC50YXJnZXQsIFxuXHRcdFx0XHRyZWxlYXNlUG9pbnQ6IHJlbGVhc2VQb2ludCwgXG5cdFx0XHRcdHBvaW50ZXJUeXBlOnBvaW50ZXJUeXBlIHx8ICd0b3VjaCdcblx0XHRcdH07XG5cblx0XHRlLmluaXRDdXN0b21FdmVudCggJ3Bzd3BUYXAnLCB0cnVlLCB0cnVlLCBlRGV0YWlsICk7XG5cdFx0b3JpZ0V2ZW50LnRhcmdldC5kaXNwYXRjaEV2ZW50KGUpO1xuXHR9O1xuXG5fcmVnaXN0ZXJNb2R1bGUoJ1RhcCcsIHtcblx0cHVibGljTWV0aG9kczoge1xuXHRcdGluaXRUYXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0X2xpc3RlbignZmlyc3RUb3VjaFN0YXJ0Jywgc2VsZi5vblRhcFN0YXJ0KTtcblx0XHRcdF9saXN0ZW4oJ3RvdWNoUmVsZWFzZScsIHNlbGYub25UYXBSZWxlYXNlKTtcblx0XHRcdF9saXN0ZW4oJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGFwUmVsZWFzZVBvaW50ID0ge307XG5cdFx0XHRcdHRhcFRpbWVyID0gbnVsbDtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0b25UYXBTdGFydDogZnVuY3Rpb24odG91Y2hMaXN0KSB7XG5cdFx0XHRpZih0b3VjaExpc3QubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGFwVGltZXIpO1xuXHRcdFx0XHR0YXBUaW1lciA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvblRhcFJlbGVhc2U6IGZ1bmN0aW9uKGUsIHJlbGVhc2VQb2ludCkge1xuXHRcdFx0aWYoIXJlbGVhc2VQb2ludCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmKCFfbW92ZWQgJiYgIV9pc011bHRpdG91Y2ggJiYgIV9udW1BbmltYXRpb25zKSB7XG5cdFx0XHRcdHZhciBwMCA9IHJlbGVhc2VQb2ludDtcblx0XHRcdFx0aWYodGFwVGltZXIpIHtcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQodGFwVGltZXIpO1xuXHRcdFx0XHRcdHRhcFRpbWVyID0gbnVsbDtcblxuXHRcdFx0XHRcdC8vIENoZWNrIGlmIHRhcGVkIG9uIHRoZSBzYW1lIHBsYWNlXG5cdFx0XHRcdFx0aWYgKCBfaXNOZWFyYnlQb2ludHMocDAsIHRhcFJlbGVhc2VQb2ludCkgKSB7XG5cdFx0XHRcdFx0XHRfc2hvdXQoJ2RvdWJsZVRhcCcsIHAwKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihyZWxlYXNlUG9pbnQudHlwZSA9PT0gJ21vdXNlJykge1xuXHRcdFx0XHRcdF9kaXNwYXRjaFRhcEV2ZW50KGUsIHJlbGVhc2VQb2ludCwgJ21vdXNlJyk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIGNsaWNrZWRUYWdOYW1lID0gZS50YXJnZXQudGFnTmFtZS50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0XHQvLyBhdm9pZCBkb3VibGUgdGFwIGRlbGF5IG9uIGJ1dHRvbnMgYW5kIGVsZW1lbnRzIHRoYXQgaGF2ZSBjbGFzcyBwc3dwX19zaW5nbGUtdGFwXG5cdFx0XHRcdGlmKGNsaWNrZWRUYWdOYW1lID09PSAnQlVUVE9OJyB8fCBmcmFtZXdvcmsuaGFzQ2xhc3MoZS50YXJnZXQsICdwc3dwX19zaW5nbGUtdGFwJykgKSB7XG5cdFx0XHRcdFx0X2Rpc3BhdGNoVGFwRXZlbnQoZSwgcmVsZWFzZVBvaW50KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfZXF1YWxpemVQb2ludHModGFwUmVsZWFzZVBvaW50LCBwMCk7XG5cblx0XHRcdFx0dGFwVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdF9kaXNwYXRjaFRhcEV2ZW50KGUsIHJlbGVhc2VQb2ludCk7XG5cdFx0XHRcdFx0dGFwVGltZXIgPSBudWxsO1xuXHRcdFx0XHR9LCAzMDApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufSk7XG5cbi8qPj50YXAqL1xuXG4vKj4+ZGVza3RvcC16b29tKi9cbi8qKlxuICpcbiAqIGRlc2t0b3Atem9vbS5qczpcbiAqXG4gKiAtIEJpbmRzIG1vdXNld2hlZWwgZXZlbnQgZm9yIHBhbmluZyB6b29tZWQgaW1hZ2UuXG4gKiAtIE1hbmFnZXMgXCJkcmFnZ2luZ1wiLCBcInpvb21lZC1pblwiLCBcInpvb20tb3V0XCIgY2xhc3Nlcy5cbiAqICAgKHdoaWNoIGFyZSB1c2VkIGZvciBjdXJzb3JzIGFuZCB6b29tIGljb24pXG4gKiAtIEFkZHMgdG9nZ2xlRGVza3RvcFpvb20gZnVuY3Rpb24uXG4gKiBcbiAqL1xuXG52YXIgX3doZWVsRGVsdGE7XG5cdFxuX3JlZ2lzdGVyTW9kdWxlKCdEZXNrdG9wWm9vbScsIHtcblxuXHRwdWJsaWNNZXRob2RzOiB7XG5cblx0XHRpbml0RGVza3RvcFpvb206IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRpZihfb2xkSUUpIHtcblx0XHRcdFx0Ly8gbm8gem9vbSBmb3Igb2xkIElFICg8PTgpXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYoX2xpa2VseVRvdWNoRGV2aWNlKSB7XG5cdFx0XHRcdC8vIGlmIGRldGVjdGVkIGhhcmR3YXJlIHRvdWNoIHN1cHBvcnQsIHdlIHdhaXQgdW50aWwgbW91c2UgaXMgdXNlZCxcblx0XHRcdFx0Ly8gYW5kIG9ubHkgdGhlbiBhcHBseSBkZXNrdG9wLXpvb20gZmVhdHVyZXNcblx0XHRcdFx0X2xpc3RlbignbW91c2VVc2VkJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2VsZi5zZXR1cERlc2t0b3Bab29tKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2VsZi5zZXR1cERlc2t0b3Bab29tKHRydWUpO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHNldHVwRGVza3RvcFpvb206IGZ1bmN0aW9uKG9uSW5pdCkge1xuXG5cdFx0XHRfd2hlZWxEZWx0YSA9IHt9O1xuXG5cdFx0XHR2YXIgZXZlbnRzID0gJ3doZWVsIG1vdXNld2hlZWwgRE9NTW91c2VTY3JvbGwnO1xuXHRcdFx0XG5cdFx0XHRfbGlzdGVuKCdiaW5kRXZlbnRzJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZyYW1ld29yay5iaW5kKHRlbXBsYXRlLCBldmVudHMsICBzZWxmLmhhbmRsZU1vdXNlV2hlZWwpO1xuXHRcdFx0fSk7XG5cblx0XHRcdF9saXN0ZW4oJ3VuYmluZEV2ZW50cycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZihfd2hlZWxEZWx0YSkge1xuXHRcdFx0XHRcdGZyYW1ld29yay51bmJpbmQodGVtcGxhdGUsIGV2ZW50cywgc2VsZi5oYW5kbGVNb3VzZVdoZWVsKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHNlbGYubW91c2Vab29tZWRJbiA9IGZhbHNlO1xuXG5cdFx0XHR2YXIgaGFzRHJhZ2dpbmdDbGFzcyxcblx0XHRcdFx0dXBkYXRlWm9vbWFibGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZihzZWxmLm1vdXNlWm9vbWVkSW4pIHtcblx0XHRcdFx0XHRcdGZyYW1ld29yay5yZW1vdmVDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3AtLXpvb21lZC1pbicpO1xuXHRcdFx0XHRcdFx0c2VsZi5tb3VzZVpvb21lZEluID0gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKF9jdXJyWm9vbUxldmVsIDwgMSkge1xuXHRcdFx0XHRcdFx0ZnJhbWV3b3JrLmFkZENsYXNzKHRlbXBsYXRlLCAncHN3cC0tem9vbS1hbGxvd2VkJyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGZyYW1ld29yay5yZW1vdmVDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3AtLXpvb20tYWxsb3dlZCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZW1vdmVEcmFnZ2luZ0NsYXNzKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJlbW92ZURyYWdnaW5nQ2xhc3MgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZihoYXNEcmFnZ2luZ0NsYXNzKSB7XG5cdFx0XHRcdFx0XHRmcmFtZXdvcmsucmVtb3ZlQ2xhc3ModGVtcGxhdGUsICdwc3dwLS1kcmFnZ2luZycpO1xuXHRcdFx0XHRcdFx0aGFzRHJhZ2dpbmdDbGFzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0X2xpc3RlbigncmVzaXplJyAsIHVwZGF0ZVpvb21hYmxlKTtcblx0XHRcdF9saXN0ZW4oJ2FmdGVyQ2hhbmdlJyAsIHVwZGF0ZVpvb21hYmxlKTtcblx0XHRcdF9saXN0ZW4oJ3BvaW50ZXJEb3duJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmKHNlbGYubW91c2Vab29tZWRJbikge1xuXHRcdFx0XHRcdGhhc0RyYWdnaW5nQ2xhc3MgPSB0cnVlO1xuXHRcdFx0XHRcdGZyYW1ld29yay5hZGRDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3AtLWRyYWdnaW5nJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0X2xpc3RlbigncG9pbnRlclVwJywgcmVtb3ZlRHJhZ2dpbmdDbGFzcyk7XG5cblx0XHRcdGlmKCFvbkluaXQpIHtcblx0XHRcdFx0dXBkYXRlWm9vbWFibGUoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdH0sXG5cblx0XHRoYW5kbGVNb3VzZVdoZWVsOiBmdW5jdGlvbihlKSB7XG5cblx0XHRcdGlmKF9jdXJyWm9vbUxldmVsIDw9IHNlbGYuY3Vyckl0ZW0uZml0UmF0aW8pIHtcblx0XHRcdFx0aWYoIF9vcHRpb25zLm1vZGFsICkge1xuXG5cdFx0XHRcdFx0aWYgKCFfb3B0aW9ucy5jbG9zZU9uU2Nyb2xsIHx8IF9udW1BbmltYXRpb25zIHx8IF9pc0RyYWdnaW5nKSB7XG5cdFx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmKF90cmFuc2Zvcm1LZXkgJiYgTWF0aC5hYnMoZS5kZWx0YVkpID4gMikge1xuXHRcdFx0XHRcdFx0Ly8gY2xvc2UgUGhvdG9Td2lwZVxuXHRcdFx0XHRcdFx0Ly8gaWYgYnJvd3NlciBzdXBwb3J0cyB0cmFuc2Zvcm1zICYgc2Nyb2xsIGNoYW5nZWQgZW5vdWdoXG5cdFx0XHRcdFx0XHRfY2xvc2VkQnlTY3JvbGwgPSB0cnVlO1xuXHRcdFx0XHRcdFx0c2VsZi5jbG9zZSgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBhbGxvdyBqdXN0IG9uZSBldmVudCB0byBmaXJlXG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvd2hlZWxcblx0XHRcdF93aGVlbERlbHRhLnggPSAwO1xuXG5cdFx0XHRpZignZGVsdGFYJyBpbiBlKSB7XG5cdFx0XHRcdGlmKGUuZGVsdGFNb2RlID09PSAxIC8qIERPTV9ERUxUQV9MSU5FICovKSB7XG5cdFx0XHRcdFx0Ly8gMTggLSBhdmVyYWdlIGxpbmUgaGVpZ2h0XG5cdFx0XHRcdFx0X3doZWVsRGVsdGEueCA9IGUuZGVsdGFYICogMTg7XG5cdFx0XHRcdFx0X3doZWVsRGVsdGEueSA9IGUuZGVsdGFZICogMTg7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X3doZWVsRGVsdGEueCA9IGUuZGVsdGFYO1xuXHRcdFx0XHRcdF93aGVlbERlbHRhLnkgPSBlLmRlbHRhWTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmKCd3aGVlbERlbHRhJyBpbiBlKSB7XG5cdFx0XHRcdGlmKGUud2hlZWxEZWx0YVgpIHtcblx0XHRcdFx0XHRfd2hlZWxEZWx0YS54ID0gLTAuMTYgKiBlLndoZWVsRGVsdGFYO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKGUud2hlZWxEZWx0YVkpIHtcblx0XHRcdFx0XHRfd2hlZWxEZWx0YS55ID0gLTAuMTYgKiBlLndoZWVsRGVsdGFZO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF93aGVlbERlbHRhLnkgPSAtMC4xNiAqIGUud2hlZWxEZWx0YTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmKCdkZXRhaWwnIGluIGUpIHtcblx0XHRcdFx0X3doZWVsRGVsdGEueSA9IGUuZGV0YWlsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRfY2FsY3VsYXRlUGFuQm91bmRzKF9jdXJyWm9vbUxldmVsLCB0cnVlKTtcblxuXHRcdFx0dmFyIG5ld1BhblggPSBfcGFuT2Zmc2V0LnggLSBfd2hlZWxEZWx0YS54LFxuXHRcdFx0XHRuZXdQYW5ZID0gX3Bhbk9mZnNldC55IC0gX3doZWVsRGVsdGEueTtcblxuXHRcdFx0Ly8gb25seSBwcmV2ZW50IHNjcm9sbGluZyBpbiBub25tb2RhbCBtb2RlIHdoZW4gbm90IGF0IGVkZ2VzXG5cdFx0XHRpZiAoX29wdGlvbnMubW9kYWwgfHxcblx0XHRcdFx0KFxuXHRcdFx0XHRuZXdQYW5YIDw9IF9jdXJyUGFuQm91bmRzLm1pbi54ICYmIG5ld1BhblggPj0gX2N1cnJQYW5Cb3VuZHMubWF4LnggJiZcblx0XHRcdFx0bmV3UGFuWSA8PSBfY3VyclBhbkJvdW5kcy5taW4ueSAmJiBuZXdQYW5ZID49IF9jdXJyUGFuQm91bmRzLm1heC55XG5cdFx0XHRcdCkgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVE9ETzogdXNlIHJBRiBpbnN0ZWFkIG9mIG1vdXNld2hlZWw/XG5cdFx0XHRzZWxmLnBhblRvKG5ld1BhblgsIG5ld1BhblkpO1xuXHRcdH0sXG5cblx0XHR0b2dnbGVEZXNrdG9wWm9vbTogZnVuY3Rpb24oY2VudGVyUG9pbnQpIHtcblx0XHRcdGNlbnRlclBvaW50ID0gY2VudGVyUG9pbnQgfHwge3g6X3ZpZXdwb3J0U2l6ZS54LzIgKyBfb2Zmc2V0LngsIHk6X3ZpZXdwb3J0U2l6ZS55LzIgKyBfb2Zmc2V0LnkgfTtcblxuXHRcdFx0dmFyIGRvdWJsZVRhcFpvb21MZXZlbCA9IF9vcHRpb25zLmdldERvdWJsZVRhcFpvb20odHJ1ZSwgc2VsZi5jdXJySXRlbSk7XG5cdFx0XHR2YXIgem9vbU91dCA9IF9jdXJyWm9vbUxldmVsID09PSBkb3VibGVUYXBab29tTGV2ZWw7XG5cdFx0XHRcblx0XHRcdHNlbGYubW91c2Vab29tZWRJbiA9ICF6b29tT3V0O1xuXG5cdFx0XHRzZWxmLnpvb21Ubyh6b29tT3V0ID8gc2VsZi5jdXJySXRlbS5pbml0aWFsWm9vbUxldmVsIDogZG91YmxlVGFwWm9vbUxldmVsLCBjZW50ZXJQb2ludCwgMzMzKTtcblx0XHRcdGZyYW1ld29ya1sgKCF6b29tT3V0ID8gJ2FkZCcgOiAncmVtb3ZlJykgKyAnQ2xhc3MnXSh0ZW1wbGF0ZSwgJ3Bzd3AtLXpvb21lZC1pbicpO1xuXHRcdH1cblxuXHR9XG59KTtcblxuXG4vKj4+ZGVza3RvcC16b29tKi9cblxuLyo+Pmhpc3RvcnkqL1xuLyoqXG4gKlxuICogaGlzdG9yeS5qczpcbiAqXG4gKiAtIEJhY2sgYnV0dG9uIHRvIGNsb3NlIGdhbGxlcnkuXG4gKiBcbiAqIC0gVW5pcXVlIFVSTCBmb3IgZWFjaCBzbGlkZTogZXhhbXBsZS5jb20vJnBpZD0xJmdpZD0zXG4gKiAgICh3aGVyZSBQSUQgaXMgcGljdHVyZSBpbmRleCwgYW5kIEdJRCBhbmQgZ2FsbGVyeSBpbmRleClcbiAqICAgXG4gKiAtIFN3aXRjaCBVUkwgd2hlbiBzbGlkZXMgY2hhbmdlLlxuICogXG4gKi9cblxuXG52YXIgX2hpc3RvcnlEZWZhdWx0T3B0aW9ucyA9IHtcblx0aGlzdG9yeTogdHJ1ZSxcblx0Z2FsbGVyeVVJRDogMVxufTtcblxudmFyIF9oaXN0b3J5VXBkYXRlVGltZW91dCxcblx0X2hhc2hDaGFuZ2VUaW1lb3V0LFxuXHRfaGFzaEFuaW1DaGVja1RpbWVvdXQsXG5cdF9oYXNoQ2hhbmdlZEJ5U2NyaXB0LFxuXHRfaGFzaENoYW5nZWRCeUhpc3RvcnksXG5cdF9oYXNoUmVzZXRlZCxcblx0X2luaXRpYWxIYXNoLFxuXHRfaGlzdG9yeUNoYW5nZWQsXG5cdF9jbG9zZWRGcm9tVVJMLFxuXHRfdXJsQ2hhbmdlZE9uY2UsXG5cdF93aW5kb3dMb2MsXG5cblx0X3N1cHBvcnRzUHVzaFN0YXRlLFxuXG5cdF9nZXRIYXNoID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIF93aW5kb3dMb2MuaGFzaC5zdWJzdHJpbmcoMSk7XG5cdH0sXG5cdF9jbGVhbkhpc3RvcnlUaW1lb3V0cyA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYoX2hpc3RvcnlVcGRhdGVUaW1lb3V0KSB7XG5cdFx0XHRjbGVhclRpbWVvdXQoX2hpc3RvcnlVcGRhdGVUaW1lb3V0KTtcblx0XHR9XG5cblx0XHRpZihfaGFzaEFuaW1DaGVja1RpbWVvdXQpIHtcblx0XHRcdGNsZWFyVGltZW91dChfaGFzaEFuaW1DaGVja1RpbWVvdXQpO1xuXHRcdH1cblx0fSxcblxuXHQvLyBwaWQgLSBQaWN0dXJlIGluZGV4XG5cdC8vIGdpZCAtIEdhbGxlcnkgaW5kZXhcblx0X3BhcnNlSXRlbUluZGV4RnJvbVVSTCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBoYXNoID0gX2dldEhhc2goKSxcblx0XHRcdHBhcmFtcyA9IHt9O1xuXG5cdFx0aWYoaGFzaC5sZW5ndGggPCA1KSB7IC8vIHBpZD0xXG5cdFx0XHRyZXR1cm4gcGFyYW1zO1xuXHRcdH1cblxuXHRcdHZhciBpLCB2YXJzID0gaGFzaC5zcGxpdCgnJicpO1xuXHRcdGZvciAoaSA9IDA7IGkgPCB2YXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZighdmFyc1tpXSkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdHZhciBwYWlyID0gdmFyc1tpXS5zcGxpdCgnPScpO1x0XG5cdFx0XHRpZihwYWlyLmxlbmd0aCA8IDIpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRwYXJhbXNbcGFpclswXV0gPSBwYWlyWzFdO1xuXHRcdH1cblx0XHRpZihfb3B0aW9ucy5nYWxsZXJ5UElEcykge1xuXHRcdFx0Ly8gZGV0ZWN0IGN1c3RvbSBwaWQgaW4gaGFzaCBhbmQgc2VhcmNoIGZvciBpdCBhbW9uZyB0aGUgaXRlbXMgY29sbGVjdGlvblxuXHRcdFx0dmFyIHNlYXJjaGZvciA9IHBhcmFtcy5waWQ7XG5cdFx0XHRwYXJhbXMucGlkID0gMDsgLy8gaWYgY3VzdG9tIHBpZCBjYW5ub3QgYmUgZm91bmQsIGZhbGxiYWNrIHRvIHRoZSBmaXJzdCBpdGVtXG5cdFx0XHRmb3IoaSA9IDA7IGkgPCBfaXRlbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYoX2l0ZW1zW2ldLnBpZCA9PT0gc2VhcmNoZm9yKSB7XG5cdFx0XHRcdFx0cGFyYW1zLnBpZCA9IGk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cGFyYW1zLnBpZCA9IHBhcnNlSW50KHBhcmFtcy5waWQsMTApLTE7XG5cdFx0fVxuXHRcdGlmKCBwYXJhbXMucGlkIDwgMCApIHtcblx0XHRcdHBhcmFtcy5waWQgPSAwO1xuXHRcdH1cblx0XHRyZXR1cm4gcGFyYW1zO1xuXHR9LFxuXHRfdXBkYXRlSGFzaCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYoX2hhc2hBbmltQ2hlY2tUaW1lb3V0KSB7XG5cdFx0XHRjbGVhclRpbWVvdXQoX2hhc2hBbmltQ2hlY2tUaW1lb3V0KTtcblx0XHR9XG5cblxuXHRcdGlmKF9udW1BbmltYXRpb25zIHx8IF9pc0RyYWdnaW5nKSB7XG5cdFx0XHQvLyBjaGFuZ2luZyBicm93c2VyIFVSTCBmb3JjZXMgbGF5b3V0L3BhaW50IGluIHNvbWUgYnJvd3NlcnMsIHdoaWNoIGNhdXNlcyBub3RpY2FibGUgbGFnIGR1cmluZyBhbmltYXRpb25cblx0XHRcdC8vIHRoYXQncyB3aHkgd2UgdXBkYXRlIGhhc2ggb25seSB3aGVuIG5vIGFuaW1hdGlvbnMgcnVubmluZ1xuXHRcdFx0X2hhc2hBbmltQ2hlY2tUaW1lb3V0ID0gc2V0VGltZW91dChfdXBkYXRlSGFzaCwgNTAwKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0XG5cdFx0aWYoX2hhc2hDaGFuZ2VkQnlTY3JpcHQpIHtcblx0XHRcdGNsZWFyVGltZW91dChfaGFzaENoYW5nZVRpbWVvdXQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRfaGFzaENoYW5nZWRCeVNjcmlwdCA9IHRydWU7XG5cdFx0fVxuXG5cblx0XHR2YXIgcGlkID0gKF9jdXJyZW50SXRlbUluZGV4ICsgMSk7XG5cdFx0dmFyIGl0ZW0gPSBfZ2V0SXRlbUF0KCBfY3VycmVudEl0ZW1JbmRleCApO1xuXHRcdGlmKGl0ZW0uaGFzT3duUHJvcGVydHkoJ3BpZCcpKSB7XG5cdFx0XHQvLyBjYXJyeSBmb3J3YXJkIGFueSBjdXN0b20gcGlkIGFzc2lnbmVkIHRvIHRoZSBpdGVtXG5cdFx0XHRwaWQgPSBpdGVtLnBpZDtcblx0XHR9XG5cdFx0dmFyIG5ld0hhc2ggPSBfaW5pdGlhbEhhc2ggKyAnJicgICsgICdnaWQ9JyArIF9vcHRpb25zLmdhbGxlcnlVSUQgKyAnJicgKyAncGlkPScgKyBwaWQ7XG5cblx0XHRpZighX2hpc3RvcnlDaGFuZ2VkKSB7XG5cdFx0XHRpZihfd2luZG93TG9jLmhhc2guaW5kZXhPZihuZXdIYXNoKSA9PT0gLTEpIHtcblx0XHRcdFx0X3VybENoYW5nZWRPbmNlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdC8vIGZpcnN0IHRpbWUgLSBhZGQgbmV3IGhpc29yeSByZWNvcmQsIHRoZW4ganVzdCByZXBsYWNlXG5cdFx0fVxuXG5cdFx0dmFyIG5ld1VSTCA9IF93aW5kb3dMb2MuaHJlZi5zcGxpdCgnIycpWzBdICsgJyMnICsgIG5ld0hhc2g7XG5cblx0XHRpZiggX3N1cHBvcnRzUHVzaFN0YXRlICkge1xuXG5cdFx0XHRpZignIycgKyBuZXdIYXNoICE9PSB3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuXHRcdFx0XHRoaXN0b3J5W19oaXN0b3J5Q2hhbmdlZCA/ICdyZXBsYWNlU3RhdGUnIDogJ3B1c2hTdGF0ZSddKCcnLCBkb2N1bWVudC50aXRsZSwgbmV3VVJMKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZihfaGlzdG9yeUNoYW5nZWQpIHtcblx0XHRcdFx0X3dpbmRvd0xvYy5yZXBsYWNlKCBuZXdVUkwgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF93aW5kb3dMb2MuaGFzaCA9IG5ld0hhc2g7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdFxuXG5cdFx0X2hpc3RvcnlDaGFuZ2VkID0gdHJ1ZTtcblx0XHRfaGFzaENoYW5nZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0X2hhc2hDaGFuZ2VkQnlTY3JpcHQgPSBmYWxzZTtcblx0XHR9LCA2MCk7XG5cdH07XG5cblxuXG5cdFxuXG5fcmVnaXN0ZXJNb2R1bGUoJ0hpc3RvcnknLCB7XG5cblx0XG5cblx0cHVibGljTWV0aG9kczoge1xuXHRcdGluaXRIaXN0b3J5OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0ZnJhbWV3b3JrLmV4dGVuZChfb3B0aW9ucywgX2hpc3RvcnlEZWZhdWx0T3B0aW9ucywgdHJ1ZSk7XG5cblx0XHRcdGlmKCAhX29wdGlvbnMuaGlzdG9yeSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cblx0XHRcdF93aW5kb3dMb2MgPSB3aW5kb3cubG9jYXRpb247XG5cdFx0XHRfdXJsQ2hhbmdlZE9uY2UgPSBmYWxzZTtcblx0XHRcdF9jbG9zZWRGcm9tVVJMID0gZmFsc2U7XG5cdFx0XHRfaGlzdG9yeUNoYW5nZWQgPSBmYWxzZTtcblx0XHRcdF9pbml0aWFsSGFzaCA9IF9nZXRIYXNoKCk7XG5cdFx0XHRfc3VwcG9ydHNQdXNoU3RhdGUgPSAoJ3B1c2hTdGF0ZScgaW4gaGlzdG9yeSk7XG5cblxuXHRcdFx0aWYoX2luaXRpYWxIYXNoLmluZGV4T2YoJ2dpZD0nKSA+IC0xKSB7XG5cdFx0XHRcdF9pbml0aWFsSGFzaCA9IF9pbml0aWFsSGFzaC5zcGxpdCgnJmdpZD0nKVswXTtcblx0XHRcdFx0X2luaXRpYWxIYXNoID0gX2luaXRpYWxIYXNoLnNwbGl0KCc/Z2lkPScpWzBdO1xuXHRcdFx0fVxuXHRcdFx0XG5cblx0XHRcdF9saXN0ZW4oJ2FmdGVyQ2hhbmdlJywgc2VsZi51cGRhdGVVUkwpO1xuXHRcdFx0X2xpc3RlbigndW5iaW5kRXZlbnRzJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZyYW1ld29yay51bmJpbmQod2luZG93LCAnaGFzaGNoYW5nZScsIHNlbGYub25IYXNoQ2hhbmdlKTtcblx0XHRcdH0pO1xuXG5cblx0XHRcdHZhciByZXR1cm5Ub09yaWdpbmFsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF9oYXNoUmVzZXRlZCA9IHRydWU7XG5cdFx0XHRcdGlmKCFfY2xvc2VkRnJvbVVSTCkge1xuXG5cdFx0XHRcdFx0aWYoX3VybENoYW5nZWRPbmNlKSB7XG5cdFx0XHRcdFx0XHRoaXN0b3J5LmJhY2soKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0XHRpZihfaW5pdGlhbEhhc2gpIHtcblx0XHRcdFx0XHRcdFx0X3dpbmRvd0xvYy5oYXNoID0gX2luaXRpYWxIYXNoO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYgKF9zdXBwb3J0c1B1c2hTdGF0ZSkge1xuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gcmVtb3ZlIGhhc2ggZnJvbSB1cmwgd2l0aG91dCByZWZyZXNoaW5nIGl0IG9yIHNjcm9sbGluZyB0byB0b3Bcblx0XHRcdFx0XHRcdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZSgnJywgZG9jdW1lbnQudGl0bGUsICBfd2luZG93TG9jLnBhdGhuYW1lICsgX3dpbmRvd0xvYy5zZWFyY2ggKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRfd2luZG93TG9jLmhhc2ggPSAnJztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0fVxuXG5cdFx0XHRcdF9jbGVhbkhpc3RvcnlUaW1lb3V0cygpO1xuXHRcdFx0fTtcblxuXG5cdFx0XHRfbGlzdGVuKCd1bmJpbmRFdmVudHMnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYoX2Nsb3NlZEJ5U2Nyb2xsKSB7XG5cdFx0XHRcdFx0Ly8gaWYgUGhvdG9Td2lwZSBpcyBjbG9zZWQgYnkgc2Nyb2xsLCB3ZSBnbyBcImJhY2tcIiBiZWZvcmUgdGhlIGNsb3NpbmcgYW5pbWF0aW9uIHN0YXJ0c1xuXHRcdFx0XHRcdC8vIHRoaXMgaXMgZG9uZSB0byBrZWVwIHRoZSBzY3JvbGwgcG9zaXRpb25cblx0XHRcdFx0XHRyZXR1cm5Ub09yaWdpbmFsKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0X2xpc3RlbignZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZighX2hhc2hSZXNldGVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuVG9PcmlnaW5hbCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdF9saXN0ZW4oJ2ZpcnN0VXBkYXRlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF9jdXJyZW50SXRlbUluZGV4ID0gX3BhcnNlSXRlbUluZGV4RnJvbVVSTCgpLnBpZDtcblx0XHRcdH0pO1xuXG5cdFx0XHRcblxuXHRcdFx0XG5cdFx0XHR2YXIgaW5kZXggPSBfaW5pdGlhbEhhc2guaW5kZXhPZigncGlkPScpO1xuXHRcdFx0aWYoaW5kZXggPiAtMSkge1xuXHRcdFx0XHRfaW5pdGlhbEhhc2ggPSBfaW5pdGlhbEhhc2guc3Vic3RyaW5nKDAsIGluZGV4KTtcblx0XHRcdFx0aWYoX2luaXRpYWxIYXNoLnNsaWNlKC0xKSA9PT0gJyYnKSB7XG5cdFx0XHRcdFx0X2luaXRpYWxIYXNoID0gX2luaXRpYWxIYXNoLnNsaWNlKDAsIC0xKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmKF9pc09wZW4pIHsgLy8gaGFzbid0IGRlc3Ryb3llZCB5ZXRcblx0XHRcdFx0XHRmcmFtZXdvcmsuYmluZCh3aW5kb3csICdoYXNoY2hhbmdlJywgc2VsZi5vbkhhc2hDaGFuZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCA0MCk7XG5cdFx0XHRcblx0XHR9LFxuXHRcdG9uSGFzaENoYW5nZTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdGlmKF9nZXRIYXNoKCkgPT09IF9pbml0aWFsSGFzaCkge1xuXG5cdFx0XHRcdF9jbG9zZWRGcm9tVVJMID0gdHJ1ZTtcblx0XHRcdFx0c2VsZi5jbG9zZSgpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZighX2hhc2hDaGFuZ2VkQnlTY3JpcHQpIHtcblxuXHRcdFx0XHRfaGFzaENoYW5nZWRCeUhpc3RvcnkgPSB0cnVlO1xuXHRcdFx0XHRzZWxmLmdvVG8oIF9wYXJzZUl0ZW1JbmRleEZyb21VUkwoKS5waWQgKTtcblx0XHRcdFx0X2hhc2hDaGFuZ2VkQnlIaXN0b3J5ID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9LFxuXHRcdHVwZGF0ZVVSTDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vIERlbGF5IHRoZSB1cGRhdGUgb2YgVVJMLCB0byBhdm9pZCBsYWcgZHVyaW5nIHRyYW5zaXRpb24sIFxuXHRcdFx0Ly8gYW5kIHRvIG5vdCB0byB0cmlnZ2VyIGFjdGlvbnMgbGlrZSBcInJlZnJlc2ggcGFnZSBzb3VuZFwiIG9yIFwiYmxpbmtpbmcgZmF2aWNvblwiIHRvIG9mdGVuXG5cdFx0XHRcblx0XHRcdF9jbGVhbkhpc3RvcnlUaW1lb3V0cygpO1xuXHRcdFx0XG5cblx0XHRcdGlmKF9oYXNoQ2hhbmdlZEJ5SGlzdG9yeSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmKCFfaGlzdG9yeUNoYW5nZWQpIHtcblx0XHRcdFx0X3VwZGF0ZUhhc2goKTsgLy8gZmlyc3QgdGltZVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2hpc3RvcnlVcGRhdGVUaW1lb3V0ID0gc2V0VGltZW91dChfdXBkYXRlSGFzaCwgODAwKTtcblx0XHRcdH1cblx0XHR9XG5cdFxuXHR9XG59KTtcblxuXG4vKj4+aGlzdG9yeSovXG5cdGZyYW1ld29yay5leHRlbmQoc2VsZiwgcHVibGljTWV0aG9kcyk7IH07XG5cdHJldHVybiBQaG90b1N3aXBlO1xufSk7IiwiLyohXG5XYXlwb2ludHMgLSA0LjAuMFxuQ29weXJpZ2h0IMKpIDIwMTEtMjAxNSBDYWxlYiBUcm91Z2h0b25cbkxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbmh0dHBzOi8vZ2l0aHViLmNvbS9pbWFrZXdlYnRoaW5ncy93YXlwb2ludHMvYmxvZy9tYXN0ZXIvbGljZW5zZXMudHh0XG4qL1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICB2YXIga2V5Q291bnRlciA9IDBcbiAgdmFyIGFsbFdheXBvaW50cyA9IHt9XG5cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3dheXBvaW50ICovXG4gIGZ1bmN0aW9uIFdheXBvaW50KG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gb3B0aW9ucyBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3InKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuZWxlbWVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBlbGVtZW50IG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3InKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuaGFuZGxlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBoYW5kbGVyIG9wdGlvbiBwYXNzZWQgdG8gV2F5cG9pbnQgY29uc3RydWN0b3InKVxuICAgIH1cblxuICAgIHRoaXMua2V5ID0gJ3dheXBvaW50LScgKyBrZXlDb3VudGVyXG4gICAgdGhpcy5vcHRpb25zID0gV2F5cG9pbnQuQWRhcHRlci5leHRlbmQoe30sIFdheXBvaW50LmRlZmF1bHRzLCBvcHRpb25zKVxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMub3B0aW9ucy5lbGVtZW50XG4gICAgdGhpcy5hZGFwdGVyID0gbmV3IFdheXBvaW50LkFkYXB0ZXIodGhpcy5lbGVtZW50KVxuICAgIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmhhbmRsZXJcbiAgICB0aGlzLmF4aXMgPSB0aGlzLm9wdGlvbnMuaG9yaXpvbnRhbCA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCdcbiAgICB0aGlzLmVuYWJsZWQgPSB0aGlzLm9wdGlvbnMuZW5hYmxlZFxuICAgIHRoaXMudHJpZ2dlclBvaW50ID0gbnVsbFxuICAgIHRoaXMuZ3JvdXAgPSBXYXlwb2ludC5Hcm91cC5maW5kT3JDcmVhdGUoe1xuICAgICAgbmFtZTogdGhpcy5vcHRpb25zLmdyb3VwLFxuICAgICAgYXhpczogdGhpcy5heGlzXG4gICAgfSlcbiAgICB0aGlzLmNvbnRleHQgPSBXYXlwb2ludC5Db250ZXh0LmZpbmRPckNyZWF0ZUJ5RWxlbWVudCh0aGlzLm9wdGlvbnMuY29udGV4dClcblxuICAgIGlmIChXYXlwb2ludC5vZmZzZXRBbGlhc2VzW3RoaXMub3B0aW9ucy5vZmZzZXRdKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub2Zmc2V0ID0gV2F5cG9pbnQub2Zmc2V0QWxpYXNlc1t0aGlzLm9wdGlvbnMub2Zmc2V0XVxuICAgIH1cbiAgICB0aGlzLmdyb3VwLmFkZCh0aGlzKVxuICAgIHRoaXMuY29udGV4dC5hZGQodGhpcylcbiAgICBhbGxXYXlwb2ludHNbdGhpcy5rZXldID0gdGhpc1xuICAgIGtleUNvdW50ZXIgKz0gMVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUucXVldWVUcmlnZ2VyID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5ncm91cC5xdWV1ZVRyaWdnZXIodGhpcywgZGlyZWN0aW9uKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh0aGlzLmNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kZXN0cm95ICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250ZXh0LnJlbW92ZSh0aGlzKVxuICAgIHRoaXMuZ3JvdXAucmVtb3ZlKHRoaXMpXG4gICAgZGVsZXRlIGFsbFdheXBvaW50c1t0aGlzLmtleV1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGlzYWJsZSAqL1xuICBXYXlwb2ludC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZW5hYmxlICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRleHQucmVmcmVzaCgpXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL25leHQgKi9cbiAgV2F5cG9pbnQucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5ncm91cC5uZXh0KHRoaXMpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ByZXZpb3VzICovXG4gIFdheXBvaW50LnByb3RvdHlwZS5wcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdyb3VwLnByZXZpb3VzKHRoaXMpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIFdheXBvaW50Lmludm9rZUFsbCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIHZhciBhbGxXYXlwb2ludHNBcnJheSA9IFtdXG4gICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gYWxsV2F5cG9pbnRzKSB7XG4gICAgICBhbGxXYXlwb2ludHNBcnJheS5wdXNoKGFsbFdheXBvaW50c1t3YXlwb2ludEtleV0pXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSBhbGxXYXlwb2ludHNBcnJheS5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgYWxsV2F5cG9pbnRzQXJyYXlbaV1bbWV0aG9kXSgpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9kZXN0cm95LWFsbCAqL1xuICBXYXlwb2ludC5kZXN0cm95QWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuaW52b2tlQWxsKCdkZXN0cm95JylcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZGlzYWJsZS1hbGwgKi9cbiAgV2F5cG9pbnQuZGlzYWJsZUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIFdheXBvaW50Lmludm9rZUFsbCgnZGlzYWJsZScpXG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2VuYWJsZS1hbGwgKi9cbiAgV2F5cG9pbnQuZW5hYmxlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuaW52b2tlQWxsKCdlbmFibGUnKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9yZWZyZXNoLWFsbCAqL1xuICBXYXlwb2ludC5yZWZyZXNoQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvdmlld3BvcnQtaGVpZ2h0ICovXG4gIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL3ZpZXdwb3J0LXdpZHRoICovXG4gIFdheXBvaW50LnZpZXdwb3J0V2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG4gIH1cblxuICBXYXlwb2ludC5hZGFwdGVycyA9IFtdXG5cbiAgV2F5cG9pbnQuZGVmYXVsdHMgPSB7XG4gICAgY29udGV4dDogd2luZG93LFxuICAgIGNvbnRpbnVvdXM6IHRydWUsXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBncm91cDogJ2RlZmF1bHQnLFxuICAgIGhvcml6b250YWw6IGZhbHNlLFxuICAgIG9mZnNldDogMFxuICB9XG5cbiAgV2F5cG9pbnQub2Zmc2V0QWxpYXNlcyA9IHtcbiAgICAnYm90dG9tLWluLXZpZXcnOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuaW5uZXJIZWlnaHQoKSAtIHRoaXMuYWRhcHRlci5vdXRlckhlaWdodCgpXG4gICAgfSxcbiAgICAncmlnaHQtaW4tdmlldyc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5pbm5lcldpZHRoKCkgLSB0aGlzLmFkYXB0ZXIub3V0ZXJXaWR0aCgpXG4gICAgfVxuICB9XG5cbiAgd2luZG93LldheXBvaW50ID0gV2F5cG9pbnRcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGZ1bmN0aW9uIHJlcXVlc3RBbmltYXRpb25GcmFtZVNoaW0oY2FsbGJhY2spIHtcbiAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKVxuICB9XG5cbiAgdmFyIGtleUNvdW50ZXIgPSAwXG4gIHZhciBjb250ZXh0cyA9IHt9XG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuICB2YXIgb2xkV2luZG93TG9hZCA9IHdpbmRvdy5vbmxvYWRcblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dCAqL1xuICBmdW5jdGlvbiBDb250ZXh0KGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG4gICAgdGhpcy5BZGFwdGVyID0gV2F5cG9pbnQuQWRhcHRlclxuICAgIHRoaXMuYWRhcHRlciA9IG5ldyB0aGlzLkFkYXB0ZXIoZWxlbWVudClcbiAgICB0aGlzLmtleSA9ICd3YXlwb2ludC1jb250ZXh0LScgKyBrZXlDb3VudGVyXG4gICAgdGhpcy5kaWRTY3JvbGwgPSBmYWxzZVxuICAgIHRoaXMuZGlkUmVzaXplID0gZmFsc2VcbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IHRoaXMuYWRhcHRlci5zY3JvbGxMZWZ0KCksXG4gICAgICB5OiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKClcbiAgICB9XG4gICAgdGhpcy53YXlwb2ludHMgPSB7XG4gICAgICB2ZXJ0aWNhbDoge30sXG4gICAgICBob3Jpem9udGFsOiB7fVxuICAgIH1cblxuICAgIGVsZW1lbnQud2F5cG9pbnRDb250ZXh0S2V5ID0gdGhpcy5rZXlcbiAgICBjb250ZXh0c1tlbGVtZW50LndheXBvaW50Q29udGV4dEtleV0gPSB0aGlzXG4gICAga2V5Q291bnRlciArPSAxXG5cbiAgICB0aGlzLmNyZWF0ZVRocm90dGxlZFNjcm9sbEhhbmRsZXIoKVxuICAgIHRoaXMuY3JlYXRlVGhyb3R0bGVkUmVzaXplSGFuZGxlcigpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHdheXBvaW50KSB7XG4gICAgdmFyIGF4aXMgPSB3YXlwb2ludC5vcHRpb25zLmhvcml6b250YWwgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnXG4gICAgdGhpcy53YXlwb2ludHNbYXhpc11bd2F5cG9pbnQua2V5XSA9IHdheXBvaW50XG4gICAgdGhpcy5yZWZyZXNoKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuY2hlY2tFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBob3Jpem9udGFsRW1wdHkgPSB0aGlzLkFkYXB0ZXIuaXNFbXB0eU9iamVjdCh0aGlzLndheXBvaW50cy5ob3Jpem9udGFsKVxuICAgIHZhciB2ZXJ0aWNhbEVtcHR5ID0gdGhpcy5BZGFwdGVyLmlzRW1wdHlPYmplY3QodGhpcy53YXlwb2ludHMudmVydGljYWwpXG4gICAgaWYgKGhvcml6b250YWxFbXB0eSAmJiB2ZXJ0aWNhbEVtcHR5KSB7XG4gICAgICB0aGlzLmFkYXB0ZXIub2ZmKCcud2F5cG9pbnRzJylcbiAgICAgIGRlbGV0ZSBjb250ZXh0c1t0aGlzLmtleV1cbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucHJvdG90eXBlLmNyZWF0ZVRocm90dGxlZFJlc2l6ZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZUhhbmRsZXIoKSB7XG4gICAgICBzZWxmLmhhbmRsZVJlc2l6ZSgpXG4gICAgICBzZWxmLmRpZFJlc2l6ZSA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5hZGFwdGVyLm9uKCdyZXNpemUud2F5cG9pbnRzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXNlbGYuZGlkUmVzaXplKSB7XG4gICAgICAgIHNlbGYuZGlkUmVzaXplID0gdHJ1ZVxuICAgICAgICBXYXlwb2ludC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVzaXplSGFuZGxlcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5jcmVhdGVUaHJvdHRsZWRTY3JvbGxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgZnVuY3Rpb24gc2Nyb2xsSGFuZGxlcigpIHtcbiAgICAgIHNlbGYuaGFuZGxlU2Nyb2xsKClcbiAgICAgIHNlbGYuZGlkU2Nyb2xsID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmFkYXB0ZXIub24oJ3Njcm9sbC53YXlwb2ludHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5kaWRTY3JvbGwgfHwgV2F5cG9pbnQuaXNUb3VjaCkge1xuICAgICAgICBzZWxmLmRpZFNjcm9sbCA9IHRydWVcbiAgICAgICAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbEhhbmRsZXIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgV2F5cG9pbnQuQ29udGV4dC5yZWZyZXNoQWxsKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyaWdnZXJlZEdyb3VwcyA9IHt9XG4gICAgdmFyIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIG5ld1Njcm9sbDogdGhpcy5hZGFwdGVyLnNjcm9sbExlZnQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC54LFxuICAgICAgICBmb3J3YXJkOiAncmlnaHQnLFxuICAgICAgICBiYWNrd2FyZDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgbmV3U2Nyb2xsOiB0aGlzLmFkYXB0ZXIuc2Nyb2xsVG9wKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueSxcbiAgICAgICAgZm9yd2FyZDogJ2Rvd24nLFxuICAgICAgICBiYWNrd2FyZDogJ3VwJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICB2YXIgaXNGb3J3YXJkID0gYXhpcy5uZXdTY3JvbGwgPiBheGlzLm9sZFNjcm9sbFxuICAgICAgdmFyIGRpcmVjdGlvbiA9IGlzRm9yd2FyZCA/IGF4aXMuZm9yd2FyZCA6IGF4aXMuYmFja3dhcmRcblxuICAgICAgZm9yICh2YXIgd2F5cG9pbnRLZXkgaW4gdGhpcy53YXlwb2ludHNbYXhpc0tleV0pIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gdGhpcy53YXlwb2ludHNbYXhpc0tleV1bd2F5cG9pbnRLZXldXG4gICAgICAgIHZhciB3YXNCZWZvcmVUcmlnZ2VyUG9pbnQgPSBheGlzLm9sZFNjcm9sbCA8IHdheXBvaW50LnRyaWdnZXJQb2ludFxuICAgICAgICB2YXIgbm93QWZ0ZXJUcmlnZ2VyUG9pbnQgPSBheGlzLm5ld1Njcm9sbCA+PSB3YXlwb2ludC50cmlnZ2VyUG9pbnRcbiAgICAgICAgdmFyIGNyb3NzZWRGb3J3YXJkID0gd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmIG5vd0FmdGVyVHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBjcm9zc2VkQmFja3dhcmQgPSAhd2FzQmVmb3JlVHJpZ2dlclBvaW50ICYmICFub3dBZnRlclRyaWdnZXJQb2ludFxuICAgICAgICBpZiAoY3Jvc3NlZEZvcndhcmQgfHwgY3Jvc3NlZEJhY2t3YXJkKSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGRpcmVjdGlvbilcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgdHJpZ2dlcmVkR3JvdXBzW2dyb3VwS2V5XS5mbHVzaFRyaWdnZXJzKClcbiAgICB9XG5cbiAgICB0aGlzLm9sZFNjcm9sbCA9IHtcbiAgICAgIHg6IGF4ZXMuaG9yaXpvbnRhbC5uZXdTY3JvbGwsXG4gICAgICB5OiBheGVzLnZlcnRpY2FsLm5ld1Njcm9sbFxuICAgIH1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIGlmICh0aGlzLmVsZW1lbnQgPT0gdGhpcy5lbGVtZW50LndpbmRvdykge1xuICAgICAgcmV0dXJuIFdheXBvaW50LnZpZXdwb3J0SGVpZ2h0KClcbiAgICB9XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHJldHVybiB0aGlzLmFkYXB0ZXIuaW5uZXJIZWlnaHQoKVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIGRlbGV0ZSB0aGlzLndheXBvaW50c1t3YXlwb2ludC5heGlzXVt3YXlwb2ludC5rZXldXG4gICAgdGhpcy5jaGVja0VtcHR5KClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuaW5uZXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gICAgaWYgKHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93KSB7XG4gICAgICByZXR1cm4gV2F5cG9pbnQudmlld3BvcnRXaWR0aCgpXG4gICAgfVxuICAgIC8qZXNsaW50LWVuYWJsZSBlcWVxZXEgKi9cbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmlubmVyV2lkdGgoKVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9jb250ZXh0LWRlc3Ryb3kgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbGxXYXlwb2ludHMgPSBbXVxuICAgIGZvciAodmFyIGF4aXMgaW4gdGhpcy53YXlwb2ludHMpIHtcbiAgICAgIGZvciAodmFyIHdheXBvaW50S2V5IGluIHRoaXMud2F5cG9pbnRzW2F4aXNdKSB7XG4gICAgICAgIGFsbFdheXBvaW50cy5wdXNoKHRoaXMud2F5cG9pbnRzW2F4aXNdW3dheXBvaW50S2V5XSlcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IGFsbFdheXBvaW50cy5sZW5ndGg7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgYWxsV2F5cG9pbnRzW2ldLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvY29udGV4dC1yZWZyZXNoICovXG4gIENvbnRleHQucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICAvKmVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgIHZhciBpc1dpbmRvdyA9IHRoaXMuZWxlbWVudCA9PSB0aGlzLmVsZW1lbnQud2luZG93XG4gICAgLyplc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xuICAgIHZhciBjb250ZXh0T2Zmc2V0ID0gaXNXaW5kb3cgPyB1bmRlZmluZWQgOiB0aGlzLmFkYXB0ZXIub2Zmc2V0KClcbiAgICB2YXIgdHJpZ2dlcmVkR3JvdXBzID0ge31cbiAgICB2YXIgYXhlc1xuXG4gICAgdGhpcy5oYW5kbGVTY3JvbGwoKVxuICAgIGF4ZXMgPSB7XG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIGNvbnRleHRPZmZzZXQ6IGlzV2luZG93ID8gMCA6IGNvbnRleHRPZmZzZXQubGVmdCxcbiAgICAgICAgY29udGV4dFNjcm9sbDogaXNXaW5kb3cgPyAwIDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgY29udGV4dERpbWVuc2lvbjogdGhpcy5pbm5lcldpZHRoKCksXG4gICAgICAgIG9sZFNjcm9sbDogdGhpcy5vbGRTY3JvbGwueCxcbiAgICAgICAgZm9yd2FyZDogJ3JpZ2h0JyxcbiAgICAgICAgYmFja3dhcmQ6ICdsZWZ0JyxcbiAgICAgICAgb2Zmc2V0UHJvcDogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgdmVydGljYWw6IHtcbiAgICAgICAgY29udGV4dE9mZnNldDogaXNXaW5kb3cgPyAwIDogY29udGV4dE9mZnNldC50b3AsXG4gICAgICAgIGNvbnRleHRTY3JvbGw6IGlzV2luZG93ID8gMCA6IHRoaXMub2xkU2Nyb2xsLnksXG4gICAgICAgIGNvbnRleHREaW1lbnNpb246IHRoaXMuaW5uZXJIZWlnaHQoKSxcbiAgICAgICAgb2xkU2Nyb2xsOiB0aGlzLm9sZFNjcm9sbC55LFxuICAgICAgICBmb3J3YXJkOiAnZG93bicsXG4gICAgICAgIGJhY2t3YXJkOiAndXAnLFxuICAgICAgICBvZmZzZXRQcm9wOiAndG9wJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGF4aXNLZXkgaW4gYXhlcykge1xuICAgICAgdmFyIGF4aXMgPSBheGVzW2F4aXNLZXldXG4gICAgICBmb3IgKHZhciB3YXlwb2ludEtleSBpbiB0aGlzLndheXBvaW50c1theGlzS2V5XSkge1xuICAgICAgICB2YXIgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1theGlzS2V5XVt3YXlwb2ludEtleV1cbiAgICAgICAgdmFyIGFkanVzdG1lbnQgPSB3YXlwb2ludC5vcHRpb25zLm9mZnNldFxuICAgICAgICB2YXIgb2xkVHJpZ2dlclBvaW50ID0gd2F5cG9pbnQudHJpZ2dlclBvaW50XG4gICAgICAgIHZhciBlbGVtZW50T2Zmc2V0ID0gMFxuICAgICAgICB2YXIgZnJlc2hXYXlwb2ludCA9IG9sZFRyaWdnZXJQb2ludCA9PSBudWxsXG4gICAgICAgIHZhciBjb250ZXh0TW9kaWZpZXIsIHdhc0JlZm9yZVNjcm9sbCwgbm93QWZ0ZXJTY3JvbGxcbiAgICAgICAgdmFyIHRyaWdnZXJlZEJhY2t3YXJkLCB0cmlnZ2VyZWRGb3J3YXJkXG5cbiAgICAgICAgaWYgKHdheXBvaW50LmVsZW1lbnQgIT09IHdheXBvaW50LmVsZW1lbnQud2luZG93KSB7XG4gICAgICAgICAgZWxlbWVudE9mZnNldCA9IHdheXBvaW50LmFkYXB0ZXIub2Zmc2V0KClbYXhpcy5vZmZzZXRQcm9wXVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhZGp1c3RtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IGFkanVzdG1lbnQuYXBwbHkod2F5cG9pbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGFkanVzdG1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgYWRqdXN0bWVudCA9IHBhcnNlRmxvYXQoYWRqdXN0bWVudClcbiAgICAgICAgICBpZiAod2F5cG9pbnQub3B0aW9ucy5vZmZzZXQuaW5kZXhPZignJScpID4gLSAxKSB7XG4gICAgICAgICAgICBhZGp1c3RtZW50ID0gTWF0aC5jZWlsKGF4aXMuY29udGV4dERpbWVuc2lvbiAqIGFkanVzdG1lbnQgLyAxMDApXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dE1vZGlmaWVyID0gYXhpcy5jb250ZXh0U2Nyb2xsIC0gYXhpcy5jb250ZXh0T2Zmc2V0XG4gICAgICAgIHdheXBvaW50LnRyaWdnZXJQb2ludCA9IGVsZW1lbnRPZmZzZXQgKyBjb250ZXh0TW9kaWZpZXIgLSBhZGp1c3RtZW50XG4gICAgICAgIHdhc0JlZm9yZVNjcm9sbCA9IG9sZFRyaWdnZXJQb2ludCA8IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIG5vd0FmdGVyU2Nyb2xsID0gd2F5cG9pbnQudHJpZ2dlclBvaW50ID49IGF4aXMub2xkU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEJhY2t3YXJkID0gd2FzQmVmb3JlU2Nyb2xsICYmIG5vd0FmdGVyU2Nyb2xsXG4gICAgICAgIHRyaWdnZXJlZEZvcndhcmQgPSAhd2FzQmVmb3JlU2Nyb2xsICYmICFub3dBZnRlclNjcm9sbFxuXG4gICAgICAgIGlmICghZnJlc2hXYXlwb2ludCAmJiB0cmlnZ2VyZWRCYWNrd2FyZCkge1xuICAgICAgICAgIHdheXBvaW50LnF1ZXVlVHJpZ2dlcihheGlzLmJhY2t3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFmcmVzaFdheXBvaW50ICYmIHRyaWdnZXJlZEZvcndhcmQpIHtcbiAgICAgICAgICB3YXlwb2ludC5xdWV1ZVRyaWdnZXIoYXhpcy5mb3J3YXJkKVxuICAgICAgICAgIHRyaWdnZXJlZEdyb3Vwc1t3YXlwb2ludC5ncm91cC5pZF0gPSB3YXlwb2ludC5ncm91cFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZyZXNoV2F5cG9pbnQgJiYgYXhpcy5vbGRTY3JvbGwgPj0gd2F5cG9pbnQudHJpZ2dlclBvaW50KSB7XG4gICAgICAgICAgd2F5cG9pbnQucXVldWVUcmlnZ2VyKGF4aXMuZm9yd2FyZClcbiAgICAgICAgICB0cmlnZ2VyZWRHcm91cHNbd2F5cG9pbnQuZ3JvdXAuaWRdID0gd2F5cG9pbnQuZ3JvdXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIFdheXBvaW50LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGdyb3VwS2V5IGluIHRyaWdnZXJlZEdyb3Vwcykge1xuICAgICAgICB0cmlnZ2VyZWRHcm91cHNbZ3JvdXBLZXldLmZsdXNoVHJpZ2dlcnMoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBDb250ZXh0LmZpbmRPckNyZWF0ZUJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gQ29udGV4dC5maW5kQnlFbGVtZW50KGVsZW1lbnQpIHx8IG5ldyBDb250ZXh0KGVsZW1lbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIENvbnRleHQucmVmcmVzaEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGNvbnRleHRJZCBpbiBjb250ZXh0cykge1xuICAgICAgY29udGV4dHNbY29udGV4dElkXS5yZWZyZXNoKClcbiAgICB9XG4gIH1cblxuICAvKiBQdWJsaWMgKi9cbiAgLyogaHR0cDovL2ltYWtld2VidGhpbmdzLmNvbS93YXlwb2ludHMvYXBpL2NvbnRleHQtZmluZC1ieS1lbGVtZW50ICovXG4gIENvbnRleHQuZmluZEJ5RWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gY29udGV4dHNbZWxlbWVudC53YXlwb2ludENvbnRleHRLZXldXG4gIH1cblxuICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKG9sZFdpbmRvd0xvYWQpIHtcbiAgICAgIG9sZFdpbmRvd0xvYWQoKVxuICAgIH1cbiAgICBDb250ZXh0LnJlZnJlc2hBbGwoKVxuICB9XG5cbiAgV2F5cG9pbnQucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxdWVzdEZuID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lU2hpbVxuICAgIHJlcXVlc3RGbi5jYWxsKHdpbmRvdywgY2FsbGJhY2spXG4gIH1cbiAgV2F5cG9pbnQuQ29udGV4dCA9IENvbnRleHRcbn0oKSlcbjsoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGZ1bmN0aW9uIGJ5VHJpZ2dlclBvaW50KGEsIGIpIHtcbiAgICByZXR1cm4gYS50cmlnZ2VyUG9pbnQgLSBiLnRyaWdnZXJQb2ludFxuICB9XG5cbiAgZnVuY3Rpb24gYnlSZXZlcnNlVHJpZ2dlclBvaW50KGEsIGIpIHtcbiAgICByZXR1cm4gYi50cmlnZ2VyUG9pbnQgLSBhLnRyaWdnZXJQb2ludFxuICB9XG5cbiAgdmFyIGdyb3VwcyA9IHtcbiAgICB2ZXJ0aWNhbDoge30sXG4gICAgaG9yaXpvbnRhbDoge31cbiAgfVxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvZ3JvdXAgKi9cbiAgZnVuY3Rpb24gR3JvdXAob3B0aW9ucykge1xuICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZVxuICAgIHRoaXMuYXhpcyA9IG9wdGlvbnMuYXhpc1xuICAgIHRoaXMuaWQgPSB0aGlzLm5hbWUgKyAnLScgKyB0aGlzLmF4aXNcbiAgICB0aGlzLndheXBvaW50cyA9IFtdXG4gICAgdGhpcy5jbGVhclRyaWdnZXJRdWV1ZXMoKVxuICAgIGdyb3Vwc1t0aGlzLmF4aXNdW3RoaXMubmFtZV0gPSB0aGlzXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnB1c2god2F5cG9pbnQpXG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEdyb3VwLnByb3RvdHlwZS5jbGVhclRyaWdnZXJRdWV1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRyaWdnZXJRdWV1ZXMgPSB7XG4gICAgICB1cDogW10sXG4gICAgICBkb3duOiBbXSxcbiAgICAgIGxlZnQ6IFtdLFxuICAgICAgcmlnaHQ6IFtdXG4gICAgfVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUuZmx1c2hUcmlnZ2VycyA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGRpcmVjdGlvbiBpbiB0aGlzLnRyaWdnZXJRdWV1ZXMpIHtcbiAgICAgIHZhciB3YXlwb2ludHMgPSB0aGlzLnRyaWdnZXJRdWV1ZXNbZGlyZWN0aW9uXVxuICAgICAgdmFyIHJldmVyc2UgPSBkaXJlY3Rpb24gPT09ICd1cCcgfHwgZGlyZWN0aW9uID09PSAnbGVmdCdcbiAgICAgIHdheXBvaW50cy5zb3J0KHJldmVyc2UgPyBieVJldmVyc2VUcmlnZ2VyUG9pbnQgOiBieVRyaWdnZXJQb2ludClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlbmQgPSB3YXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIHdheXBvaW50ID0gd2F5cG9pbnRzW2ldXG4gICAgICAgIGlmICh3YXlwb2ludC5vcHRpb25zLmNvbnRpbnVvdXMgfHwgaSA9PT0gd2F5cG9pbnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB3YXlwb2ludC50cmlnZ2VyKFtkaXJlY3Rpb25dKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY2xlYXJUcmlnZ2VyUXVldWVzKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbih3YXlwb2ludCkge1xuICAgIHRoaXMud2F5cG9pbnRzLnNvcnQoYnlUcmlnZ2VyUG9pbnQpXG4gICAgdmFyIGluZGV4ID0gV2F5cG9pbnQuQWRhcHRlci5pbkFycmF5KHdheXBvaW50LCB0aGlzLndheXBvaW50cylcbiAgICB2YXIgaXNMYXN0ID0gaW5kZXggPT09IHRoaXMud2F5cG9pbnRzLmxlbmd0aCAtIDFcbiAgICByZXR1cm4gaXNMYXN0ID8gbnVsbCA6IHRoaXMud2F5cG9pbnRzW2luZGV4ICsgMV1cbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB0aGlzLndheXBvaW50cy5zb3J0KGJ5VHJpZ2dlclBvaW50KVxuICAgIHZhciBpbmRleCA9IFdheXBvaW50LkFkYXB0ZXIuaW5BcnJheSh3YXlwb2ludCwgdGhpcy53YXlwb2ludHMpXG4gICAgcmV0dXJuIGluZGV4ID8gdGhpcy53YXlwb2ludHNbaW5kZXggLSAxXSA6IG51bGxcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgR3JvdXAucHJvdG90eXBlLnF1ZXVlVHJpZ2dlciA9IGZ1bmN0aW9uKHdheXBvaW50LCBkaXJlY3Rpb24pIHtcbiAgICB0aGlzLnRyaWdnZXJRdWV1ZXNbZGlyZWN0aW9uXS5wdXNoKHdheXBvaW50KVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24od2F5cG9pbnQpIHtcbiAgICB2YXIgaW5kZXggPSBXYXlwb2ludC5BZGFwdGVyLmluQXJyYXkod2F5cG9pbnQsIHRoaXMud2F5cG9pbnRzKVxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLndheXBvaW50cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgfVxuICB9XG5cbiAgLyogUHVibGljICovXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL2FwaS9maXJzdCAqL1xuICBHcm91cC5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy53YXlwb2ludHNbMF1cbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICAvKiBodHRwOi8vaW1ha2V3ZWJ0aGluZ3MuY29tL3dheXBvaW50cy9hcGkvbGFzdCAqL1xuICBHcm91cC5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLndheXBvaW50c1t0aGlzLndheXBvaW50cy5sZW5ndGggLSAxXVxuICB9XG5cbiAgLyogUHJpdmF0ZSAqL1xuICBHcm91cC5maW5kT3JDcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgcmV0dXJuIGdyb3Vwc1tvcHRpb25zLmF4aXNdW29wdGlvbnMubmFtZV0gfHwgbmV3IEdyb3VwKG9wdGlvbnMpXG4gIH1cblxuICBXYXlwb2ludC5Hcm91cCA9IEdyb3VwXG59KCkpXG47KGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCdcblxuICB2YXIgV2F5cG9pbnQgPSB3aW5kb3cuV2F5cG9pbnRcblxuICBmdW5jdGlvbiBpc1dpbmRvdyhlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQgPT09IGVsZW1lbnQud2luZG93XG4gIH1cblxuICBmdW5jdGlvbiBnZXRXaW5kb3coZWxlbWVudCkge1xuICAgIGlmIChpc1dpbmRvdyhlbGVtZW50KSkge1xuICAgICAgcmV0dXJuIGVsZW1lbnRcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQuZGVmYXVsdFZpZXdcbiAgfVxuXG4gIGZ1bmN0aW9uIE5vRnJhbWV3b3JrQWRhcHRlcihlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxuICAgIHRoaXMuaGFuZGxlcnMgPSB7fVxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLnByb3RvdHlwZS5pbm5lckhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpc1dpbiA9IGlzV2luZG93KHRoaXMuZWxlbWVudClcbiAgICByZXR1cm4gaXNXaW4gPyB0aGlzLmVsZW1lbnQuaW5uZXJIZWlnaHQgOiB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gIH1cblxuICBOb0ZyYW1ld29ya0FkYXB0ZXIucHJvdG90eXBlLmlubmVyV2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXNXaW4gPSBpc1dpbmRvdyh0aGlzLmVsZW1lbnQpXG4gICAgcmV0dXJuIGlzV2luID8gdGhpcy5lbGVtZW50LmlubmVyV2lkdGggOiB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGhcbiAgfVxuXG4gIE5vRnJhbWV3b3JrQWRhcHRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMoZWxlbWVudCwgbGlzdGVuZXJzLCBoYW5kbGVyKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV1cbiAgICAgICAgaWYgKCFoYW5kbGVyIHx8IGhhbmRsZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGxpc3RlbmVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50UGFydHMgPSBldmVudC5zcGxpdCgnLicpXG4gICAgdmFyIGV2ZW50VHlwZSA9IGV2ZW50UGFydHNbMF1cbiAgICB2YXIgbmFtZXNwYWNlID0gZXZlbnRQYXJ0c1sxXVxuICAgIHZhciBlbGVtZW50ID0gdGhpcy5lbGVtZW50XG5cbiAgICBpZiAobmFtZXNwYWNlICYmIHRoaXMuaGFuZGxlcnNbbmFtZXNwYWNlXSAmJiBldmVudFR5cGUpIHtcbiAgICAgIHJlbW92ZUxpc3RlbmVycyhlbGVtZW50LCB0aGlzLmhhbmRsZXJzW25hbWVzcGFjZV1bZXZlbnRUeXBlXSwgaGFuZGxlcilcbiAgICAgIHRoaXMuaGFuZGxlcnNbbmFtZXNwYWNlXVtldmVudFR5cGVdID0gW11cbiAgICB9XG4gICAgZWxzZSBpZiAoZXZlbnRUeXBlKSB7XG4gICAgICBmb3IgKHZhciBucyBpbiB0aGlzLmhhbmRsZXJzKSB7XG4gICAgICAgIHJlbW92ZUxpc3RlbmVycyhlbGVtZW50LCB0aGlzLmhhbmRsZXJzW25zXVtldmVudFR5cGVdIHx8IFtdLCBoYW5kbGVyKVxuICAgICAgICB0aGlzLmhhbmRsZXJzW25zXVtldmVudFR5cGVdID0gW11cbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAobmFtZXNwYWNlICYmIHRoaXMuaGFuZGxlcnNbbmFtZXNwYWNlXSkge1xuICAgICAgZm9yICh2YXIgdHlwZSBpbiB0aGlzLmhhbmRsZXJzW25hbWVzcGFjZV0pIHtcbiAgICAgICAgcmVtb3ZlTGlzdGVuZXJzKGVsZW1lbnQsIHRoaXMuaGFuZGxlcnNbbmFtZXNwYWNlXVt0eXBlXSwgaGFuZGxlcilcbiAgICAgIH1cbiAgICAgIHRoaXMuaGFuZGxlcnNbbmFtZXNwYWNlXSA9IHt9XG4gICAgfVxuICB9XG5cbiAgLyogQWRhcHRlZCBmcm9tIGpRdWVyeSAxLnggb2Zmc2V0KCkgKi9cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLnByb3RvdHlwZS5vZmZzZXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudC5vd25lckRvY3VtZW50KSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBkb2N1bWVudEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICB2YXIgd2luID0gZ2V0V2luZG93KHRoaXMuZWxlbWVudC5vd25lckRvY3VtZW50KVxuICAgIHZhciByZWN0ID0ge1xuICAgICAgdG9wOiAwLFxuICAgICAgbGVmdDogMFxuICAgIH1cblxuICAgIGlmICh0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KSB7XG4gICAgICByZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcDogcmVjdC50b3AgKyB3aW4ucGFnZVlPZmZzZXQgLSBkb2N1bWVudEVsZW1lbnQuY2xpZW50VG9wLFxuICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luLnBhZ2VYT2Zmc2V0IC0gZG9jdW1lbnRFbGVtZW50LmNsaWVudExlZnRcbiAgICB9XG4gIH1cblxuICBOb0ZyYW1ld29ya0FkYXB0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgICB2YXIgZXZlbnRQYXJ0cyA9IGV2ZW50LnNwbGl0KCcuJylcbiAgICB2YXIgZXZlbnRUeXBlID0gZXZlbnRQYXJ0c1swXVxuICAgIHZhciBuYW1lc3BhY2UgPSBldmVudFBhcnRzWzFdIHx8ICdfX2RlZmF1bHQnXG4gICAgdmFyIG5zSGFuZGxlcnMgPSB0aGlzLmhhbmRsZXJzW25hbWVzcGFjZV0gPSB0aGlzLmhhbmRsZXJzW25hbWVzcGFjZV0gfHwge31cbiAgICB2YXIgbnNUeXBlTGlzdCA9IG5zSGFuZGxlcnNbZXZlbnRUeXBlXSA9IG5zSGFuZGxlcnNbZXZlbnRUeXBlXSB8fCBbXVxuXG4gICAgbnNUeXBlTGlzdC5wdXNoKGhhbmRsZXIpXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyKVxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLnByb3RvdHlwZS5vdXRlckhlaWdodCA9IGZ1bmN0aW9uKGluY2x1ZGVNYXJnaW4pIHtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5pbm5lckhlaWdodCgpXG4gICAgdmFyIGNvbXB1dGVkU3R5bGVcblxuICAgIGlmIChpbmNsdWRlTWFyZ2luICYmICFpc1dpbmRvdyh0aGlzLmVsZW1lbnQpKSB7XG4gICAgICBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KVxuICAgICAgaGVpZ2h0ICs9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luVG9wLCAxMClcbiAgICAgIGhlaWdodCArPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSwgMTApXG4gICAgfVxuXG4gICAgcmV0dXJuIGhlaWdodFxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLnByb3RvdHlwZS5vdXRlcldpZHRoID0gZnVuY3Rpb24oaW5jbHVkZU1hcmdpbikge1xuICAgIHZhciB3aWR0aCA9IHRoaXMuaW5uZXJXaWR0aCgpXG4gICAgdmFyIGNvbXB1dGVkU3R5bGVcblxuICAgIGlmIChpbmNsdWRlTWFyZ2luICYmICFpc1dpbmRvdyh0aGlzLmVsZW1lbnQpKSB7XG4gICAgICBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KVxuICAgICAgd2lkdGggKz0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5MZWZ0LCAxMClcbiAgICAgIHdpZHRoICs9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luUmlnaHQsIDEwKVxuICAgIH1cblxuICAgIHJldHVybiB3aWR0aFxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLnByb3RvdHlwZS5zY3JvbGxMZWZ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHdpbiA9IGdldFdpbmRvdyh0aGlzLmVsZW1lbnQpXG4gICAgcmV0dXJuIHdpbiA/IHdpbi5wYWdlWE9mZnNldCA6IHRoaXMuZWxlbWVudC5zY3JvbGxMZWZ0XG4gIH1cblxuICBOb0ZyYW1ld29ya0FkYXB0ZXIucHJvdG90eXBlLnNjcm9sbFRvcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB3aW4gPSBnZXRXaW5kb3codGhpcy5lbGVtZW50KVxuICAgIHJldHVybiB3aW4gPyB3aW4ucGFnZVlPZmZzZXQgOiB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wXG4gIH1cblxuICBOb0ZyYW1ld29ya0FkYXB0ZXIuZXh0ZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG5cbiAgICBmdW5jdGlvbiBtZXJnZSh0YXJnZXQsIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gb2JqW2tleV1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRhcmdldFxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAxLCBlbmQgPSBhcmdzLmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBtZXJnZShhcmdzWzBdLCBhcmdzW2ldKVxuICAgIH1cbiAgICByZXR1cm4gYXJnc1swXVxuICB9XG5cbiAgTm9GcmFtZXdvcmtBZGFwdGVyLmluQXJyYXkgPSBmdW5jdGlvbihlbGVtZW50LCBhcnJheSwgaSkge1xuICAgIHJldHVybiBhcnJheSA9PSBudWxsID8gLTEgOiBhcnJheS5pbmRleE9mKGVsZW1lbnQsIGkpXG4gIH1cblxuICBOb0ZyYW1ld29ya0FkYXB0ZXIuaXNFbXB0eU9iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIC8qIGVzbGludCBuby11bnVzZWQtdmFyczogMCAqL1xuICAgIGZvciAodmFyIG5hbWUgaW4gb2JqKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIFdheXBvaW50LmFkYXB0ZXJzLnB1c2goe1xuICAgIG5hbWU6ICdub2ZyYW1ld29yaycsXG4gICAgQWRhcHRlcjogTm9GcmFtZXdvcmtBZGFwdGVyXG4gIH0pXG4gIFdheXBvaW50LkFkYXB0ZXIgPSBOb0ZyYW1ld29ya0FkYXB0ZXJcbn0oKSlcbjtcbi8qIVxuV2F5cG9pbnRzIEludmlldyBTaG9ydGN1dCAtIDQuMC4wXG5Db3B5cmlnaHQgwqkgMjAxMS0yMDE1IENhbGViIFRyb3VnaHRvblxuTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuaHR0cHM6Ly9naXRodWIuY29tL2ltYWtld2VidGhpbmdzL3dheXBvaW50cy9ibG9iL21hc3Rlci9saWNlbnNlcy50eHRcbiovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4gIHZhciBXYXlwb2ludCA9IHdpbmRvdy5XYXlwb2ludFxuXG4gIC8qIGh0dHA6Ly9pbWFrZXdlYnRoaW5ncy5jb20vd2F5cG9pbnRzL3Nob3J0Y3V0cy9pbnZpZXcgKi9cbiAgZnVuY3Rpb24gSW52aWV3KG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBXYXlwb2ludC5BZGFwdGVyLmV4dGVuZCh7fSwgSW52aWV3LmRlZmF1bHRzLCBvcHRpb25zKVxuICAgIHRoaXMuYXhpcyA9IHRoaXMub3B0aW9ucy5ob3Jpem9udGFsID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ1xuICAgIHRoaXMud2F5cG9pbnRzID0gW11cbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuZWxlbWVudFxuICAgIHRoaXMuY3JlYXRlV2F5cG9pbnRzKClcbiAgfVxuXG4gIC8qIFByaXZhdGUgKi9cbiAgSW52aWV3LnByb3RvdHlwZS5jcmVhdGVXYXlwb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29uZmlncyA9IHtcbiAgICAgIHZlcnRpY2FsOiBbe1xuICAgICAgICBkb3duOiAnZW50ZXInLFxuICAgICAgICB1cDogJ2V4aXRlZCcsXG4gICAgICAgIG9mZnNldDogJzEwMCUnXG4gICAgICB9LCB7XG4gICAgICAgIGRvd246ICdlbnRlcmVkJyxcbiAgICAgICAgdXA6ICdleGl0JyxcbiAgICAgICAgb2Zmc2V0OiAnYm90dG9tLWluLXZpZXcnXG4gICAgICB9LCB7XG4gICAgICAgIGRvd246ICdleGl0JyxcbiAgICAgICAgdXA6ICdlbnRlcmVkJyxcbiAgICAgICAgb2Zmc2V0OiAwXG4gICAgICB9LCB7XG4gICAgICAgIGRvd246ICdleGl0ZWQnLFxuICAgICAgICB1cDogJ2VudGVyJyxcbiAgICAgICAgb2Zmc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gLXRoaXMuYWRhcHRlci5vdXRlckhlaWdodCgpXG4gICAgICAgIH1cbiAgICAgIH1dLFxuICAgICAgaG9yaXpvbnRhbDogW3tcbiAgICAgICAgcmlnaHQ6ICdlbnRlcicsXG4gICAgICAgIGxlZnQ6ICdleGl0ZWQnLFxuICAgICAgICBvZmZzZXQ6ICcxMDAlJ1xuICAgICAgfSwge1xuICAgICAgICByaWdodDogJ2VudGVyZWQnLFxuICAgICAgICBsZWZ0OiAnZXhpdCcsXG4gICAgICAgIG9mZnNldDogJ3JpZ2h0LWluLXZpZXcnXG4gICAgICB9LCB7XG4gICAgICAgIHJpZ2h0OiAnZXhpdCcsXG4gICAgICAgIGxlZnQ6ICdlbnRlcmVkJyxcbiAgICAgICAgb2Zmc2V0OiAwXG4gICAgICB9LCB7XG4gICAgICAgIHJpZ2h0OiAnZXhpdGVkJyxcbiAgICAgICAgbGVmdDogJ2VudGVyJyxcbiAgICAgICAgb2Zmc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gLXRoaXMuYWRhcHRlci5vdXRlcldpZHRoKClcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gY29uZmlnc1t0aGlzLmF4aXNdLmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB2YXIgY29uZmlnID0gY29uZmlnc1t0aGlzLmF4aXNdW2ldXG4gICAgICB0aGlzLmNyZWF0ZVdheXBvaW50KGNvbmZpZylcbiAgICB9XG4gIH1cblxuICAvKiBQcml2YXRlICovXG4gIEludmlldy5wcm90b3R5cGUuY3JlYXRlV2F5cG9pbnQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICB0aGlzLndheXBvaW50cy5wdXNoKG5ldyBXYXlwb2ludCh7XG4gICAgICBjb250ZXh0OiB0aGlzLm9wdGlvbnMuY29udGV4dCxcbiAgICAgIGVsZW1lbnQ6IHRoaXMub3B0aW9ucy5lbGVtZW50LFxuICAgICAgZW5hYmxlZDogdGhpcy5vcHRpb25zLmVuYWJsZWQsXG4gICAgICBoYW5kbGVyOiAoZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICAgICAgICBzZWxmLm9wdGlvbnNbY29uZmlnW2RpcmVjdGlvbl1dLmNhbGwoc2VsZiwgZGlyZWN0aW9uKVxuICAgICAgICB9XG4gICAgICB9KGNvbmZpZykpLFxuICAgICAgb2Zmc2V0OiBjb25maWcub2Zmc2V0LFxuICAgICAgaG9yaXpvbnRhbDogdGhpcy5vcHRpb25zLmhvcml6b250YWxcbiAgICB9KSlcbiAgfVxuXG4gIC8qIFB1YmxpYyAqL1xuICBJbnZpZXcucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy53YXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzW2ldLmRlc3Ryb3koKVxuICAgIH1cbiAgICB0aGlzLndheXBvaW50cyA9IFtdXG4gIH1cblxuICBJbnZpZXcucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZW5kID0gdGhpcy53YXlwb2ludHMubGVuZ3RoOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXMud2F5cG9pbnRzW2ldLmRpc2FibGUoKVxuICAgIH1cbiAgfVxuXG4gIEludmlldy5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGVuZCA9IHRoaXMud2F5cG9pbnRzLmxlbmd0aDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzLndheXBvaW50c1tpXS5lbmFibGUoKVxuICAgIH1cbiAgfVxuXG4gIEludmlldy5kZWZhdWx0cyA9IHtcbiAgICBjb250ZXh0OiB3aW5kb3csXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBlbnRlcjogbm9vcCxcbiAgICBlbnRlcmVkOiBub29wLFxuICAgIGV4aXQ6IG5vb3AsXG4gICAgZXhpdGVkOiBub29wXG4gIH1cblxuICBXYXlwb2ludC5JbnZpZXcgPSBJbnZpZXdcbn0oKSlcbjtcbiIsIi8qKlxuICogWmVuc2Nyb2xsIDMuMC4xXG4gKiBodHRwczovL2dpdGh1Yi5jb20vemVuZ2Fib3IvemVuc2Nyb2xsL1xuICpcbiAqIENvcHlyaWdodCAyMDE14oCTMjAxNiBHYWJvciBMZW5hcmRcbiAqXG4gKiBUaGlzIGlzIGZyZWUgYW5kIHVuZW5jdW1iZXJlZCBzb2Z0d2FyZSByZWxlYXNlZCBpbnRvIHRoZSBwdWJsaWMgZG9tYWluLlxuICpcbiAqIEFueW9uZSBpcyBmcmVlIHRvIGNvcHksIG1vZGlmeSwgcHVibGlzaCwgdXNlLCBjb21waWxlLCBzZWxsLCBvclxuICogZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlLCBlaXRoZXIgaW4gc291cmNlIGNvZGUgZm9ybSBvciBhcyBhIGNvbXBpbGVkXG4gKiBiaW5hcnksIGZvciBhbnkgcHVycG9zZSwgY29tbWVyY2lhbCBvciBub24tY29tbWVyY2lhbCwgYW5kIGJ5IGFueVxuICogbWVhbnMuXG4gKlxuICogSW4ganVyaXNkaWN0aW9ucyB0aGF0IHJlY29nbml6ZSBjb3B5cmlnaHQgbGF3cywgdGhlIGF1dGhvciBvciBhdXRob3JzXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGRlZGljYXRlIGFueSBhbmQgYWxsIGNvcHlyaWdodCBpbnRlcmVzdCBpbiB0aGVcbiAqIHNvZnR3YXJlIHRvIHRoZSBwdWJsaWMgZG9tYWluLiBXZSBtYWtlIHRoaXMgZGVkaWNhdGlvbiBmb3IgdGhlIGJlbmVmaXRcbiAqIG9mIHRoZSBwdWJsaWMgYXQgbGFyZ2UgYW5kIHRvIHRoZSBkZXRyaW1lbnQgb2Ygb3VyIGhlaXJzIGFuZFxuICogc3VjY2Vzc29ycy4gV2UgaW50ZW5kIHRoaXMgZGVkaWNhdGlvbiB0byBiZSBhbiBvdmVydCBhY3Qgb2ZcbiAqIHJlbGlucXVpc2htZW50IGluIHBlcnBldHVpdHkgb2YgYWxsIHByZXNlbnQgYW5kIGZ1dHVyZSByaWdodHMgdG8gdGhpc1xuICogc29mdHdhcmUgdW5kZXIgY29weXJpZ2h0IGxhdy5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4gKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG4gKiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUlxuICogT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsXG4gKiBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1JcbiAqIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgcGxlYXNlIHJlZmVyIHRvIDxodHRwOi8vdW5saWNlbnNlLm9yZz5cbiAqXG4gKi9cblxuLypqc2hpbnQgZGV2ZWw6dHJ1ZSwgYXNpOnRydWUgKi9cblxuLypnbG9iYWwgZGVmaW5lLCBtb2R1bGUgKi9cblxuXG4oZnVuY3Rpb24gKHJvb3QsIHplbnNjcm9sbCkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIHplbnNjcm9sbCgpKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IHplbnNjcm9sbCgpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC56ZW5zY3JvbGwgPSB6ZW5zY3JvbGwoKVxuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuICAgIFwidXNlIHN0cmljdFwiXG5cbiAgICB2YXIgY3JlYXRlU2Nyb2xsZXIgPSBmdW5jdGlvbiAoc2Nyb2xsQ29udGFpbmVyLCBkZWZhdWx0RHVyYXRpb24sIGVkZ2VPZmZzZXQpIHtcblxuICAgICAgICBkZWZhdWx0RHVyYXRpb24gPSBkZWZhdWx0RHVyYXRpb24gfHwgOTk5IC8vbXNcbiAgICAgICAgaWYgKCFlZGdlT2Zmc2V0IHx8IGVkZ2VPZmZzZXQgIT09IDApIHtcbiAgICAgICAgICAgIC8vIFdoZW4gc2Nyb2xsaW5nLCB0aGlzIGFtb3VudCBvZiBkaXN0YW5jZSBpcyBrZXB0IGZyb20gdGhlIGVkZ2VzIG9mIHRoZSBzY3JvbGxDb250YWluZXI6XG4gICAgICAgICAgICBlZGdlT2Zmc2V0ID0gOSAvL3B4XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2Nyb2xsVGltZW91dElkXG4gICAgICAgIHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cbiAgICAgICAgLy8gRGV0ZWN0IGlmIHRoZSBicm93c2VyIGFscmVhZHkgc3VwcG9ydHMgbmF0aXZlIHNtb290aCBzY3JvbGxpbmcgKGUuZy4sIEZpcmVmb3ggMzYrIGFuZCBDaHJvbWUgNDkrKSBhbmQgaXQgaXMgZW5hYmxlZDpcbiAgICAgICAgdmFyIG5hdGl2ZVNtb290aFNjcm9sbEVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKFwiZ2V0Q29tcHV0ZWRTdHlsZVwiIGluIHdpbmRvdykgJiZcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzY3JvbGxDb250YWluZXIgPyBzY3JvbGxDb250YWluZXIgOiBkb2N1bWVudC5ib2R5KVtcInNjcm9sbC1iZWhhdmlvclwiXSA9PT0gXCJzbW9vdGhcIlxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdldFNjcm9sbFRvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBzY3JvbGxDb250YWluZXIgPyBzY3JvbGxDb250YWluZXIuc2Nyb2xsVG9wIDogKHdpbmRvdy5zY3JvbGxZIHx8IGRvY0VsZW0uc2Nyb2xsVG9wKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdldFZpZXdIZWlnaHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gc2Nyb2xsQ29udGFpbmVyID9cbiAgICAgICAgICAgICAgICBNYXRoLm1pbihzY3JvbGxDb250YWluZXIub2Zmc2V0SGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQpIDpcbiAgICAgICAgICAgICAgICB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jRWxlbS5jbGllbnRIZWlnaHRcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBnZXRSZWxhdGl2ZVRvcE9mID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgICAgIGlmIChzY3JvbGxDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5vZmZzZXRUb3AgLSBzY3JvbGxDb250YWluZXIub2Zmc2V0VG9wXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArIGdldFNjcm9sbFRvcCgpIC0gZG9jRWxlbS5vZmZzZXRUb3BcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbW1lZGlhdGVseSBzdG9wcyB0aGUgY3VycmVudCBzbW9vdGggc2Nyb2xsIG9wZXJhdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHN0b3BTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZW91dElkKVxuICAgICAgICAgICAgc2Nyb2xsVGltZW91dElkID0gMFxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNjcm9sbHMgdG8gYSBzcGVjaWZpYyB2ZXJ0aWNhbCBwb3NpdGlvbiBpbiB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7ZW5kWX0gVGhlIHZlcnRpY2FsIHBvc2l0aW9uIHdpdGhpbiB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7ZHVyYXRpb259IE9wdGlvbmFsbHkgdGhlIGR1cmF0aW9uIG9mIHRoZSBzY3JvbGwgb3BlcmF0aW9uLlxuICAgICAgICAgKiAgICAgICAgSWYgMCBvciBub3QgcHJvdmlkZWQgaXQgaXMgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIGJhc2VkIG9uIHRoZVxuICAgICAgICAgKiAgICAgICAgZGlzdGFuY2UgYW5kIHRoZSBkZWZhdWx0IGR1cmF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHNjcm9sbFRvWSA9IGZ1bmN0aW9uIChlbmRZLCBkdXJhdGlvbikge1xuICAgICAgICAgICAgc3RvcFNjcm9sbCgpXG4gICAgICAgICAgICBpZiAobmF0aXZlU21vb3RoU2Nyb2xsRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgKHNjcm9sbENvbnRhaW5lciB8fCB3aW5kb3cpLnNjcm9sbFRvKDAsIGVuZFkpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydFkgPSBnZXRTY3JvbGxUb3AoKVxuICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGgubWF4KGVuZFksMCkgLSBzdGFydFlcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IGR1cmF0aW9uIHx8IE1hdGgubWluKE1hdGguYWJzKGRpc3RhbmNlKSwgZGVmYXVsdER1cmF0aW9uKVxuICAgICAgICAgICAgICAgIHZhciBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gbG9vcFNjcm9sbCgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcCA9IE1hdGgubWluKChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZSkgLyBkdXJhdGlvbiwgMSkgLy8gcGVyY2VudGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHkgPSBNYXRoLm1heChNYXRoLmZsb29yKHN0YXJ0WSArIGRpc3RhbmNlKihwIDwgMC41ID8gMipwKnAgOiBwKig0IC0gcCoyKS0xKSksIDApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQ29udGFpbmVyLnNjcm9sbFRvcCA9IHlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIHkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocCA8IDEgJiYgKGdldFZpZXdIZWlnaHQoKSArIHkpIDwgKHNjcm9sbENvbnRhaW5lciB8fCBkb2NFbGVtKS5zY3JvbGxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wU2Nyb2xsKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChzdG9wU2Nyb2xsLCA5OSkgLy8gd2l0aCBjb29sZG93biB0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIDkpXG4gICAgICAgICAgICAgICAgfSkoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNjcm9sbHMgdG8gdGhlIHRvcCBvZiBhIHNwZWNpZmljIGVsZW1lbnQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7ZWxlbX0gVGhlIGVsZW1lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7ZHVyYXRpb259IE9wdGlvbmFsbHkgdGhlIGR1cmF0aW9uIG9mIHRoZSBzY3JvbGwgb3BlcmF0aW9uLlxuICAgICAgICAgKiAgICAgICAgQSB2YWx1ZSBvZiAwIGlzIGlnbm9yZWQuXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc2Nyb2xsVG9FbGVtID0gZnVuY3Rpb24gKGVsZW0sIGR1cmF0aW9uKSB7XG4gICAgICAgICAgICBzY3JvbGxUb1koZ2V0UmVsYXRpdmVUb3BPZihlbGVtKSAtIGVkZ2VPZmZzZXQsIGR1cmF0aW9uKVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNjcm9sbHMgYW4gZWxlbWVudCBpbnRvIHZpZXcgaWYgbmVjZXNzYXJ5LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge2VsZW19IFRoZSBlbGVtZW50LlxuICAgICAgICAgKiBAcGFyYW0ge2R1cmF0aW9ufSBPcHRpb25hbGx5IHRoZSBkdXJhdGlvbiBvZiB0aGUgc2Nyb2xsIG9wZXJhdGlvbi5cbiAgICAgICAgICogICAgICAgIEEgdmFsdWUgb2YgMCBpcyBpZ25vcmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHNjcm9sbEludG9WaWV3ID0gZnVuY3Rpb24gKGVsZW0sIGR1cmF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgZWxlbVNjcm9sbEhlaWdodCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0ICsgMiplZGdlT2Zmc2V0XG4gICAgICAgICAgICB2YXIgdkhlaWdodCA9IGdldFZpZXdIZWlnaHQoKVxuICAgICAgICAgICAgdmFyIGVsZW1Ub3AgPSBnZXRSZWxhdGl2ZVRvcE9mKGVsZW0pXG4gICAgICAgICAgICB2YXIgZWxlbUJvdHRvbSA9IGVsZW1Ub3AgKyBlbGVtU2Nyb2xsSGVpZ2h0XG4gICAgICAgICAgICB2YXIgc2Nyb2xsVG9wID0gZ2V0U2Nyb2xsVG9wKClcbiAgICAgICAgICAgIGlmICgoZWxlbVRvcCAtIHNjcm9sbFRvcCkgPCBlZGdlT2Zmc2V0IHx8IGVsZW1TY3JvbGxIZWlnaHQgPiB2SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgLy8gRWxlbWVudCBpcyBjbGlwcGVkIGF0IHRvcCBvciBpcyBoaWdoZXIgdGhhbiBzY3JlZW4uXG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9FbGVtKGVsZW0sIGR1cmF0aW9uKVxuICAgICAgICAgICAgfSBlbHNlIGlmICgoc2Nyb2xsVG9wICsgdkhlaWdodCAtIGVsZW1Cb3R0b20pIDwgZWRnZU9mZnNldCkge1xuICAgICAgICAgICAgICAgIC8vIEVsZW1lbnQgaXMgY2xpcHBlZCBhdCB0aGUgYm90dG9tLlxuICAgICAgICAgICAgICAgIHNjcm9sbFRvWShlbGVtQm90dG9tIC0gdkhlaWdodCwgZHVyYXRpb24pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogU2Nyb2xscyB0byB0aGUgY2VudGVyIG9mIGFuIGVsZW1lbnQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7ZWxlbX0gVGhlIGVsZW1lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7ZHVyYXRpb259IE9wdGlvbmFsbHkgdGhlIGR1cmF0aW9uIG9mIHRoZSBzY3JvbGwgb3BlcmF0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge29mZnNldH0gT3B0aW9uYWxseSB0aGUgb2Zmc2V0IG9mIHRoZSB0b3Agb2YgdGhlIGVsZW1lbnQgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW4uXG4gICAgICAgICAqICAgICAgICBBIHZhbHVlIG9mIDAgaXMgaWdub3JlZC5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBzY3JvbGxUb0NlbnRlck9mID0gZnVuY3Rpb24gKGVsZW0sIGR1cmF0aW9uLCBvZmZzZXQpIHtcbiAgICAgICAgICAgIHNjcm9sbFRvWShcbiAgICAgICAgICAgICAgICBNYXRoLm1heChcbiAgICAgICAgICAgICAgICAgICAgZ2V0UmVsYXRpdmVUb3BPZihlbGVtKSAtIGdldFZpZXdIZWlnaHQoKS8yICsgKG9mZnNldCB8fCBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodC8yKSxcbiAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgZHVyYXRpb25cbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGFuZ2VzIGRlZmF1bHQgc2V0dGluZ3MgZm9yIHRoaXMgc2Nyb2xsZXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7bmV3RGVmYXVsdER1cmF0aW9ufSBOZXcgdmFsdWUgZm9yIGRlZmF1bHQgZHVyYXRpb24sIHVzZWQgZm9yIGVhY2ggc2Nyb2xsIG1ldGhvZCBieSBkZWZhdWx0LlxuICAgICAgICAgKiAgICAgICAgSWdub3JlZCBpZiAwIG9yIGZhbHN5LlxuICAgICAgICAgKiBAcGFyYW0ge25ld0VkZ2VPZmZzZXR9IE5ldyB2YWx1ZSBmb3IgdGhlIGVkZ2Ugb2Zmc2V0LCB1c2VkIGJ5IGVhY2ggc2Nyb2xsIG1ldGhvZCBieSBkZWZhdWx0LlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHNldHVwID0gZnVuY3Rpb24gKG5ld0RlZmF1bHREdXJhdGlvbiwgbmV3RWRnZU9mZnNldCkge1xuICAgICAgICAgICAgaWYgKG5ld0RlZmF1bHREdXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbiA9IG5ld0RlZmF1bHREdXJhdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5ld0VkZ2VPZmZzZXQgPT09IDAgfHwgbmV3RWRnZU9mZnNldCkge1xuICAgICAgICAgICAgICAgIGVkZ2VPZmZzZXQgPSBuZXdFZGdlT2Zmc2V0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2V0dXA6IHNldHVwLFxuICAgICAgICAgICAgdG86IHNjcm9sbFRvRWxlbSxcbiAgICAgICAgICAgIHRvWTogc2Nyb2xsVG9ZLFxuICAgICAgICAgICAgaW50b1ZpZXc6IHNjcm9sbEludG9WaWV3LFxuICAgICAgICAgICAgY2VudGVyOiBzY3JvbGxUb0NlbnRlck9mLFxuICAgICAgICAgICAgc3RvcDogc3RvcFNjcm9sbCxcbiAgICAgICAgICAgIG1vdmluZzogZnVuY3Rpb24gKCkgeyByZXR1cm4gISFzY3JvbGxUaW1lb3V0SWQgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBzY3JvbGxlciBmb3IgdGhlIGJyb3dzZXIgd2luZG93LCBvbWl0dGluZyBwYXJhbWV0ZXJzOlxuICAgIHZhciBkZWZhdWx0U2Nyb2xsZXIgPSBjcmVhdGVTY3JvbGxlcigpXG5cbiAgICAvLyBDcmVhdGUgbGlzdGVuZXJzIGZvciB0aGUgZG9jdW1lbnRFbGVtZW50IG9ubHkgJiBleGNsdWRlIElFOC1cbiAgICBpZiAoXCJhZGRFdmVudExpc3RlbmVyXCIgaW4gd2luZG93ICYmIGRvY3VtZW50LmJvZHkuc3R5bGUuc2Nyb2xsQmVoYXZpb3IgIT09IFwic21vb3RoXCIgJiYgIXdpbmRvdy5ub1plbnNtb290aCkge1xuICAgICAgICB2YXIgcmVwbGFjZVVybCA9IGZ1bmN0aW9uIChoYXNoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHt9LCBcIlwiLCB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdChcIiNcIilbMF0gKyBoYXNoKVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHRoZSBTZWN1cml0eSBleGNlcHRpb24gaW4gQ2hyb21lIHdoZW4gdGhlIHBhZ2Ugd2FzIG9wZW5lZCB2aWEgdGhlIGZpbGUgcHJvdG9jb2wsIGUuZy4sIGZpbGU6Ly9pbmRleC5odG1sXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBhbmNob3IgPSBldmVudC50YXJnZXRcbiAgICAgICAgICAgIHdoaWxlIChhbmNob3IgJiYgYW5jaG9yLnRhZ05hbWUgIT09IFwiQVwiKSB7XG4gICAgICAgICAgICAgICAgYW5jaG9yID0gYW5jaG9yLnBhcmVudE5vZGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghYW5jaG9yIHx8IGV2ZW50LndoaWNoICE9PSAxIHx8IGV2ZW50LnNoaWZ0S2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSB8fCBldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBocmVmID0gYW5jaG9yLmdldEF0dHJpYnV0ZShcImhyZWZcIikgfHwgXCJcIlxuICAgICAgICAgICAgaWYgKGhyZWYuaW5kZXhPZihcIiNcIikgPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoaHJlZiA9PT0gXCIjXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKSAvLyBQcmV2ZW50IHRoZSBicm93c2VyIGZyb20gaGFuZGxpbmcgdGhlIGFjdGl2YXRpb24gb2YgdGhlIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNjcm9sbGVyLnRvWSgwKVxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlVXJsKFwiXCIpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldElkID0gYW5jaG9yLmhhc2guc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXRFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0SWQpXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRFbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpIC8vIFByZXZlbnQgdGhlIGJyb3dzZXIgZnJvbSBoYW5kbGluZyB0aGUgYWN0aXZhdGlvbiBvZiB0aGUgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNjcm9sbGVyLnRvKHRhcmdldEVsZW0pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlVXJsKFwiI1wiICsgdGFyZ2V0SWQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZhbHNlKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIC8vIEV4cG9zZSB0aGUgXCJjb25zdHJ1Y3RvclwiIHRoYXQgY2FuIGNyZWF0ZSBhIG5ldyBzY3JvbGxlcjpcbiAgICAgICAgY3JlYXRlU2Nyb2xsZXI6IGNyZWF0ZVNjcm9sbGVyLFxuICAgICAgICAvLyBTdXJmYWNlIHRoZSBtZXRob2RzIG9mIHRoZSBkZWZhdWx0IHNjcm9sbGVyOlxuICAgICAgICBzZXR1cDogZGVmYXVsdFNjcm9sbGVyLnNldHVwLFxuICAgICAgICB0bzogZGVmYXVsdFNjcm9sbGVyLnRvLFxuICAgICAgICB0b1k6IGRlZmF1bHRTY3JvbGxlci50b1ksXG4gICAgICAgIGludG9WaWV3OiBkZWZhdWx0U2Nyb2xsZXIuaW50b1ZpZXcsXG4gICAgICAgIGNlbnRlcjogZGVmYXVsdFNjcm9sbGVyLmNlbnRlcixcbiAgICAgICAgc3RvcDogZGVmYXVsdFNjcm9sbGVyLnN0b3AsXG4gICAgICAgIG1vdmluZzogZGVmYXVsdFNjcm9sbGVyLm1vdmluZ1xuICAgIH1cblxufSkpO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJpbWFyeU5hdigpIHtcblxuICAgIC8vIGNhY2hlIGRvbSBlbGVtZW50c1xuICAgIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keSxcbiAgICAgICAgbmF2VHJpZ2dlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuanMtbmF2LXRyaWdnZXJcIiksXG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGFpbmVyXCIpLFxuICAgICAgICBwcmltYXJ5TmF2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1wcmltYXJ5LW5hdlwiKSxcbiAgICAgICAgcHJpbWFyeU5hdkxpbmtzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1wcmltYXJ5LW5hdiBhXCIpO1xuXG4gICAgLy8gRmxhZyB0aGF0IEpTIGhhcyBsb2FkZWRcbiAgICBib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJuby1qc1wiKTtcbiAgICBib2R5LmNsYXNzTGlzdC5hZGQoXCJqc1wiKTtcblxuICAgIC8vIEhhbWJ1cmdlciBtZW51XG4gICAgbmF2VHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gdG9nZ2xlIGFjdGl2ZSBjbGFzcyBvbiB0aGUgbmF2IHRyaWdnZXJcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKFwib3BlblwiKTtcbiAgICAgICAgLy8gdG9nZ2xlIHRoZSBhY3RpdmUgY2xhc3Mgb24gc2l0ZSBjb250YWluZXJcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoXCJqcy1uYXYtYWN0aXZlXCIpO1xuICAgIH0pO1xuXG4gICAgLy8gSW4tbWVudSBsaW5rIGNsaWNrXG4gICAgZm9yKHZhciBpPTA7IGkgPCBwcmltYXJ5TmF2TGlua3MubGVuZ3RoOyBpKyspe1xuICAgICAgICB2YXIgcHJpbWFyeU5hdkxpbmsgPSBwcmltYXJ5TmF2TGlua3NbaV07XG4gICAgICAgIHByaW1hcnlOYXZMaW5rLm9uY2xpY2sgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy8gdG9nZ2xlIGFjdGl2ZSBjbGFzcyBvbiB0aGUgbmF2IHRyaWdnZXJcbiAgICAgICAgICAgIG5hdlRyaWdnZXIuY2xhc3NMaXN0LnRvZ2dsZShcIm9wZW5cIik7XG4gICAgICAgICAgICAvLyBpbW1lZGlhdGVseSBoaWRlIHRoZSBuYXZcbiAgICAgICAgICAgIHByaW1hcnlOYXYuc3R5bGUub3BhY2l0eT0gXCIwXCI7XG4gICAgICAgICAgICAvLyBvbmNlIGRyYXdlciBoYXMgaGFkIHRpbWUgdG8gcHVsbCB1cCwgcmVzdG9yZSBvcGFjaXR5XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBwcmltYXJ5TmF2LnN0eWxlLm9wYWNpdHk9IFwiMVwiOyB9LCAxMDAwKTtcbiAgICAgICAgICAgIC8vIHRvZ2dsZSB0aGUgYWN0aXZlIGNsYXNzIG9uIHNpdGUgY29udGFpbmVyXG4gICAgICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnRvZ2dsZShcImpzLW5hdi1hY3RpdmVcIik7XG4gICAgICAgIH07XG4gICAgfVxuXG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVGltZWxpbmVMb2FkaW5nKCkge1xuXG4gIHZhciB0aW1lbGluZUJsb2NrcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2QtdGltZWxpbmUtYmxvY2ssIC5jZ2QtdGltZWxpbmUtYmxvY2tcIik7XG5cbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCh0aW1lbGluZUJsb2NrcywgZnVuY3Rpb24oZWwsIGkpe1xuXG4gICAgdmFyIHdheXBvaW50ID0gbmV3IFdheXBvaW50KHtcbiAgICAgIGVsZW1lbnQ6IGVsLFxuICAgICAgaGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2ZhZGVJblVwJyk7XG4gICAgICB9LFxuICAgICAgb2Zmc2V0OiAnNzUlJ1xuICAgIH0pXG5cbiAgfSk7XG59O1xuIl19
