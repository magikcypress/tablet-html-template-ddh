/**
 * Open/Close annexe and more...
*/
var isFull = 0
$("nav#overview").hide();

$('.close_menu').click(function() {
    if (!isFull) {
        isFull = 1;
        $("nav#overview").show();
    } else if (isFull) {
        isFull = 0;
        $("nav#overview").hide();
    }
    console.log(isFull);
});

/**
* Gesture and scroll with hammer.js
*/
function debug(str) {
    $("#debug").prepend(str+"\n");
}

$(".insideScrollablePanel").bind("dragstart", function() { 
     return false; 
});


/**
  * Horizontal  slideshow
*/
function HorizScroll(container, overview) {
     container = $(container);
     overview = $(overview);

     var slides = $(">section", container);
     var width = container.parent().width();

     var self = this;
     var current = 0;
     var total_slides = slides.length;

     // overview menu
     overview.click(function(ev) {    
         self.slideTo( $(this).index() );
         ev.preventDefault();
     });

     // next button
     $('button.next_page').click(function(ev) {
         self.slideTo( $(this).index() );
         ev.preventDefault();
         container.css({ top: 0 });
     });

     this.updateOverview = function() {
         overview.removeClass("active");
         $(overview.get( current )).addClass('active');
     };
     self.updateOverview();

     // slide to given index
     this.slideTo = function( index ) {
         if(index > total_slides-1) {
             index = total_slides-1;
         } 
         else if(index < 0) {
             index = 0;
         } 

         if(index == current) {
             return false;
         }

         container.css({ left: 0 - (width * index) });
         current = index;

         self.updateOverview();

         return true;
     };

     this.next = function() {
         return this.slideTo(current+1); 
     };

     this.prev = function() {
         return this.slideTo(current-1); 
     };

     this.getContainer = function() {
         return container;
     };

     this.getCurrent = function() {
         return $(slides.get(current));
     };
}

var hammer = new Hammer($(".insideScrollablePanel").get(0));
var slideshow = new HorizScroll(".insideScrollablePanel article", "#overview li");

hammer.ondrag = function(ev) {
     var left = 0;

     if(ev.direction == 'left') {
         left = 0 - ev.distance;
     } else if(ev.direction == 'right') {
         left = ev.distance;
     }

     slideshow.getContainer().css({ marginLeft: left });
};


hammer.ondragend = function(ev) {
     slideshow.getContainer().css({ marginLeft: 0 });

     if(Math.abs(ev.distance) > 100) {
         if(ev.direction == 'right') {
             slideshow.prev();
         } else if(ev.direction == 'left') {
             slideshow.next();
         }
     }
};

/**
* vertical slideshow
*/
function VertiScroll(container, options)
{
    container = $(container);
    var content = $(">article", container);
    var scrollbar = $(">.scrollbar div", container);

    var self = this;
    var hammer = new Hammer(container.get(0), {
        drag: true,
        drag_vertical: true,
        drag_horizontal: false,
        drag_min_distance: 0,
        transform: false,
        tap: false,
        tap_double: false,
        hold: false
    });

    $('.ontop').click(function() {
        var top = 0;
        content.css({ top: top });
    });

    function getScrollPosition() {
        return {
            top: parseInt(content.css('top'), 10),
            left: parseInt(content.css('left'), 10)
        };
    }

    /**
     * get the dimensions of a element
     * @param   jQuery  el
     * @return  object  { width: int, height: int }
     */
    function getDimensions( el ) {
       return {
           width: el.outerWidth(),
           height: el.outerHeight()
       };
    }

    /**
     * scroll to given x and y
     * @param   int x
     * @param   int y
    */
    this.scrollTo = function(x, y) {

    };

    var scroll_start = {};
    var scroll_dim = {};
    var content_dim = {};
    var isFixed = 0;

    hammer.ondragstart = function() {
        scroll_start = getScrollPosition();
        scroll_start.time = new Date().getTime();
        scroll_dim = getDimensions( container );
        content_dim = getDimensions( content );

        scrollbar.css({
            height: (100 / content_dim.height * scroll_dim.height) * (scroll_dim.height/100)
        }).stop().fadeTo(80, 1);

    };

    hammer.ondrag = function( ev ) {
        if(ev.direction == 'up' || ev.direction == 'left') {
           ev.distance = 0-ev.distance;
        }

        var delta = 1;

        var top = scroll_start.top + ev.distance * delta;
        content.css({ top: top });

        scrollbar.css({
            top: (100 / content_dim.height) * (0 - top) +"%"
        });

    };

    hammer.ondragend = function( ev ) {
        var scroll = getScrollPosition();
        var corrections = {};
        if(scroll.top > 0) {
           corrections.top = 0;
        }

        else if(scroll.top < -(content_dim.height - scroll_dim.height) ) {
           corrections.top = -(content_dim.height - scroll_dim.height);
        }

        content.animate(corrections, 400);
        scrollbar.stop().animate({
           top: (100 / content_dim.height) * (0 - corrections.top) +"%"
        }, 400);

        scrollbar.stop().fadeTo(80, 0);

        // return top page
        console.log(scroll_start.top);
        console.log(isFixed);
        if(scroll_start.top >= -220 && !isFixed) {
            isFixed = 1;
            $('.ontop').addClass('ontop-fixed');
            $('.ontop-fixed').removeClass('ontop');
        } else if(scroll_start.top == 0 && isFixed) {
            isFixed = 0;
            $('.ontop-fixed').addClass('ontop');
            $('.ontop').removeClass('ontop-fixed');
        }


    };

}

var scroll = new VertiScroll(".insideScrollablePanel");
scroll.scrollTo(0, 200);
