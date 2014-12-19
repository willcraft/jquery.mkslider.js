(function($) {

  $.fn.mkslider = function(options) {

    options = $.extend({
      autoPlay: true,
      autoPlayInterval: 5000,
      maxHeight: 600,
      loading: false
    }, options);


    var Slider = function(target) {
      this.$target = $(target);
      this.$target.css({ position: "relative" });
      this.imageCount = $("li", this.$target).length;
      this.moveIndex = 0;

      // li要素をクローン
      var clone = $("li", this.$target).clone();

      if (clone.length) {
        $("ul", this.$target).append(clone.get(0));
        $("ul", this.$target).prepend(clone.get(clone.length - 1));
      }

      this.$images = $("img", this.$target);
      this.$slideWrap = null;
      this.timer = null;
    }


    /**
     *  ローディング処理
     *
     *  @param ローディング完了時のコールバック
     *
     **/
    Slider.prototype.loading = function(callback) {
      var _self = this;
      var triggerCount = 0;
      var $loading = $("<div></div>");

      _self.$target.children().hide();

      if (options.loading) {
        _self.$target.append("<div class='loading'><img src='images/ajax-loader.gif'></div>");
        $loading = $(".loading", _self.$target);
        $loading.css({
          width: "100%",
          height: $(window).height() / 2
        });
        $("img", $loading).css({
          position: "absolute",
          top: "50%",
          left: "50%"
        });
      }

      var complite = function() {
        $loading.fadeOut(function(){
          $loading.remove();
          if(callback) {
            _self.$target.children().fadeIn();
            callback();
          }
        });
      };

      _self.$images.each(function(){
        $("<img />")
        .on("load", function() {
          triggerCount++;
          if (triggerCount == _self.$images.length) {
            complite();
          }
        })
        .attr("src", $(this).attr("src"));
      });
    }

    /**
     *  初期処理
     *
     *
     **/
    Slider.prototype.init = function() {

      var _self = this;

      var resize = function() {

        var windowWidth = $(window).width();
        var widthSum = 0;

        _self.$target.css({
          width: windowWidth,
          overflow: "hidden"
        });

        // 画像サイズをwindow幅に合わせる
        var minHeight = 0;
        _self.$images.each(function(index) {
          $parent = $(this).parent();
          $(this).width(windowWidth);
          $parent.width(windowWidth);
          widthSum += $(this).width();
          minHeight = index === 0 ? $(this).height() : Math.min(minHeight, $(this).height());
          if($(this).height() > options.maxHeight) {
            $parent.css({
              height: options.maxHeight,
              overflow: "hidden"
            });
            $(this).css({
              marginTop: -(($(this).height() - options.maxHeight) / 2)
            });
          } else {
            $parent.css({ height: $(this).height() });
          }
        });

        // 画像の枚数 x window幅をdivにセット
        _self.$slideWrap.css({
          width: widthSum,
          marginLeft: -((_self.moveIndex + 1) * windowWidth)
        });
      }

      // 要素をラップする
      $("ul", _self.$target).wrap("<div class='slide_wrap clearFix'></div>");
      _self.$images.wrap("<div class='slide_item'></div>");
      _self.$slideWrap = $(".slide_wrap", _self.$target);

      // スタイルの適用
      $("li", _self.$target).css({
        float: "left",
        listStyle: "none"
      });

      // スライダーマウスオーバー時
      _self.$target.hover(
        function() {
          _self.animationStop();
        },
        function() {
          if (options.autoPlay) {
            _self.animationStart();
          }
        });

      $(window).on('resize', resize);
      resize();
    }


    /**
     *  アニメーション処理
     *
     *  @param moveType prev or next
     *
     **/
    Slider.prototype.move = function(moveType) {

      var _self = this;
      var maxIndex = _self.imageCount - 1;
      var windowWidth = $(window).width();

      if (moveType === "prev") {
        // 前へ
        _self.moveIndex--;
      } else {
        // 次へ
        _self.moveIndex++;
      }

      _self.$slideWrap.stop().animate({
          marginLeft: -((_self.moveIndex + 1) * windowWidth)
        },
        function() {
          if (_self.moveIndex < 0) {
            _self.moveIndex = maxIndex;
          } else if (_self.moveIndex > maxIndex) {
            _self.moveIndex = 0;
          }
          _self.$slideWrap.css({
            marginLeft: -((_self.moveIndex + 1) * windowWidth)
          })
        });
    }


    /**
    *  Autoアニメーションスタート
    *
    *
    **/
    Slider.prototype.animationStart = function() {
      var _self = this;
      _self.timer = setInterval(function() {
        _self.move("next");
      }, options.autoPlayInterval);
    }


    /**
    *  Autoアニメーションストップ
    *
    *
    **/
    Slider.prototype.animationStop = function() {
      var _self = this;
      if (_self.timer) {
        clearInterval(_self.timer);
        _self.timer = null;
      }
    }


    this.each(function(index) {
      var slider = new Slider(this);
      slider.loading(function() {

        // 初期処理
        slider.init();

        // auto play
        if (options.autoPlay) {
          slider.animationStart();
        }

        // navi
        var $navi = $(".navi", slider.$target);

        if ($navi.length) {
          $(".navi_next", $navi).on('click', function(e) {
            e.preventDefault();
            slider.move("next");
          });
          $(".navi_prev", $navi).on('click', function(e) {
            e.preventDefault();
            slider.move("prev");
          });
        }
      });
    });
  }

})(jQuery);
