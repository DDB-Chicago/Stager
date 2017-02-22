/*
"Stager-JS"
This plugin was created in order to streamline the process of building standard compliant digital ads, while giving developers involved the ability to customize the units.
Github link for more Info: https://github.com/DDB-Chicago/Platform-JS/releases
	
Copyright (c) 2017 Ron W. LaGon - DDB Chicago

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


$.stage = {
    id: 'Stager JS',
    version: 'v1.0.0',
    defaults: {
		//	What type of creative will be displayed {static jpegs - "Static", or HTML5 animated banners - "Motion"}		
		$unitType:"Motion", 
		
		//	Array that holds the sizes that are to be displayed (Can be any name, but format has to be an oject, holding associative arrays of the "name":[width, height] format)
		$sizes: {
			"s1":[728, 90], "s2":[300, 250]
		},
		
		//	The file name of each frame to be displayed (without size and frame number) - Only needed for comp flow
		$fileName: "E63904_BRCCO_BB_Couch_",
		
		//	The amount of frames - Only needed for comp flow
		$numOfFiles: 5,
		
		//	The base url where the sizes are kept (Directory before sizes split)
		$baseUrl: "http://dev.ddbchi.com/Clients/Barilla/2017/CompTest/"
		//$baseUrl: "http://dev.ddbchi.com/Clients/CapOne/2017/February/"
	}
};


(function($) 
{	
	"use strict";
	var _unitType;
	var _sizes;
	var _baseUrl;
	var _name;
	var _fileName;
	var _numOfFrames;
	
	var $size;
	
	var _current_creative = "";
	
	var $url;
	var listing_open = false;
	var _containers = [];
	
	var _modalsrc;
	
	var $unit;
	var $mag_glass = "<div class='mag-glass'><a data-toggle='modal' data-target='#size-modal' class='view-size'><span class='glyphicon glyphicon-zoom-in'></span></a></div>";	
	
	
	$.fn.extend({
        stage: function (params) 
		{
            return this.each(function () 
			{
                var opts = $.extend({}, this.defaults, params);
				
				_unitType = opts.$unitType;
				_sizes = opts.$sizes;
				_baseUrl = opts.$baseUrl;
				_fileName = opts.$fileName;
				_numOfFrames = opts.$numOfFrames;
				
				$(document).ready(function()
				{	
					init_links();
					$(".creative-link").eq(0).trigger("click");
					$("#show-listing").trigger("click");
				});
			});
		}
	});
	
	function insert_units()
	{
		var $unit;
		switch (_unitType)
		{
			case "Static" :
				console.log("Name: " + _name + ", Index: " + _sizes);
				
				var _size = [_sizes[_name][0], _sizes[_name][1]];
				$size = _size[0] + "x" + _size[1];
				
				for (var c = 0; c < _numOfFrames; c++)
				{
					$url = _baseUrl + _name + "/" + $size + "/" + _fileName + c + ".jpg";						
					create_area(_size, c);
				}
				break;

			case "Motion" :
				$.each(_sizes, function($idx, $s)
				{
					var _size = [$s[0], $s[1]];
					
					$size = _size[0] + "x" + _size[1];
					
					$url = _baseUrl + _name + "/" + $size + "/index.html";
					create_area(_size, $idx);
				});
				break;
		}
	}
	
	function create_area(_size, idx)
	{		
		switch (_unitType)
		{
			case "Static" :
				$("#creative-inner").append("<div id='size" + $size + "_" + idx + "' class='ddb-size bordered'><img class='sizeFrame' width='" + _size[0] + "' height='" + _size[1] + "' src='" + $url + "' /></div>");
				$unit = $("#size" + $size + "_" + idx);
				break;
				
			case "Motion" :
				$("#creative-inner").append("<div id='size" + $size + "_" + idx + "' class='ddb-size'><iframe class='sizeFrame' width='" + _size[0] + "' height='" + _size[1] + "' src='" + $url + "' frameborder='0' scrolling='no'></iframe></div>");
				$unit = $("#size" + $size + "_" + idx);
				
				init_magGlass(_size);
				
				break;
		}
		$unit.css({
			"width" : _size[0] + "px",
			"height" : _size[1] + "px"
		});
		
		_containers.push($unit);

		init_events($unit);
	}
	
	function init_magGlass(_size)
	{
		$unit.prepend($("<div id='overlay" + $size + "' class='size-overlay'><p id='copy" + $size + "' class='overlay-copy'></p></div>"));

		var $overlay = $("#overlay" + $size);
		$overlay.css({
			"width" : _size[0] + "px",
			"height" : _size[1] + "px"
		});
		var $overlayCopy = $("#copy" + $size);
		$overlayCopy.text(_size[0] + " x " + _size[1]);

		$unit.prepend($($mag_glass));
	}
	
	function init_links()
	{
		$(".creative-link").on("click", function(evt)
		{
			if (_current_creative !== $(this).text())
			{
				$(".mag-glass").remove();
				
				if (_containers.length > 0)
				{
					_containers = [];
					$("#creative-inner").empty();
				}
				$(".size-check").hide();
				
				_name = $(this).text();
				_current_creative = _name;
				
				insert_units();
				
				$(this).siblings(".size-check").show();
			}
		});
		if ($("#creative-list li").length > 1)
		{
			init_menu();
		} else {
			$("#creative-list").css({
				"display" : "none"
			});
		}
	}
	function init_events($target)
	{
		$unit = "";
		
		var $btn;
		var $overlay;
		var _width;
		var _height;
		var $current;
		
		$target.on("mouseenter", function(evt)
		{
			$btn = $(this).find(".mag-glass");
			$overlay = $(this).find(".size-overlay");
			
			_width = $target.width();
			_height = $target.height();
			_modalsrc = $target.find(".sizeFrame").prop("src");
			
			$(".modal-size").css({
				"width" : _width + 40 + "px",
				"height" : _height + 20 + "px"
			});
			$("#modalFrame").css({
				"width" : _width + "px",
				"height" : _height + "px"
			});
			$(".modal-dialog").css({
				"width" : _width + 70 + "px"
			});	
			$("#modal-heading").text(_name + " " + _width + "x" + _height);
			
			TweenMax.to($btn, 0.75, {css:{"top":"0"}, ease:Expo.easeOut});
			TweenMax.to($overlay, 0.75, {alpha:0.75});
		});
		
		$("#size-modal").on("show.bs.modal", function(evt) 
		{
			TweenMax.to($target, 1, {alpha:0});
			$("#modalFrame").prop("src", "about:blank");
			TweenMax.delayedCall(0.5, function(evt)
			{
				$("#modalFrame").prop("src", _modalsrc);
			});
		});
		
		$("#size-modal").on("hide.bs.modal", function(evt) 
		{
			TweenMax.to($target, 1, {alpha:1});
		});
		
		$("#size-modal").on("hidden.bs.modal", function(evt) 
		{
			$("#modalFrame").prop("src", "about:blank");
		});
		
		$target.on("mouseleave", function(evt)
		{
			TweenMax.to($btn, 0.75, {css:{"top":"-40px"}, ease:Expo.easeOut});
			TweenMax.to($overlay, 0.75, {alpha:0});
		});
	}
	
	function init_menu()
	{
		$("#show-listing").on("click", function(evt)
		{
			if (!listing_open)
			{
				$("#list-close-icon").show();
				$("#list-open-icon").hide();
				TweenMax.to($("#creative-list"), 1, {css:{"left":"0"}, ease:Expo.easeOut, onComplete:function()
				{
					listing_open = true;
				}});
			} else {
				$("#list-close-icon").hide();
				$("#list-open-icon").show();
				TweenMax.to($("#creative-list"), 1, {css:{"left":"-380px"}, ease:Expo.easeOut, onComplete:function()
				{
					listing_open = false;
				}});
			}
		});
	}
})(jQuery);