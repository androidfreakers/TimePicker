(function($){
	var timePicker = function(options,parent){
		this.options = $.extend(this.options,options);
		this.parent = parent;
		this.init();
	};
	
	timePicker.prototype = {
		$parent : null,
		$amPm : null,
		$done : null,
		
		$hourPicker:null,
		$hours : null,
		$hourSelector : null,
		$hourNeedle : null,
		
		$minutePicker : null,
		$minutes : null,
		$minuteSelector : null,
		$minuteNeedle : null,
		
		hour:12,
		minute:0,
		amPm:"AM",
		options :{
			id : '',
			name : "gagan",
			callBack:"",
			hour:12,
			minute:0,
			amPm:"AM",
		},
		init : function(){
			this.options.id = this.parent.selector;
			this.$parent = $(this.options.id);
			this.$parent.addClass("TimePicker");
			this.$parent.html(this.getTemplate());
			this.$amPm = this.$parent.find(".amPm");
			this.$done = this.$parent.find(".done");
			
			
			this.$hourPicker = this.$parent.find(".hourPicker");
			this.createHourPickerView();
			this.$hours = this.$parent.find(".hour").not(".hour.selector");
			this.$hourSelector = this.$parent.find(".hour.selector");
			this.$hourNeedle = this.$parent.find(".hourNeedle");
			
			
			
			
			this.$minutePicker = this.$parent.find(".minutePicker");
			this.createMinutePickerView();
			this.$minutes = this.$parent.find(".minute").not(".minute.selector");
			this.$minuteSelector = this.$parent.find(".minute.selector");
			this.$minuteNeedle = this.$parent.find(".minuteNeedle");
			
			
			this.attacheEvents();
			
			this.updateHourUI(this.options.hour);
			this.updateAMPMUI(this.options.amPm);
			this.updateMinuteUI(this.options.minute);
			this.showHourPicker();
		},
		attacheEvents:function(){
			var self = this;
			this.$hourSelector.draggable({
				drag:function(event, ui){
				},
				start:function(event, ui){
					self.$hours.addClass("hilight");
					self.$parent.css("cursor","move");
					self.$hourSelector.addClass("drag");
				},
				stop:function(event, ui){
					self.$hours.removeClass("hilight");
					self.$parent.css("cursor","default");
					self.updateHourUI(self.hour);
					self.showMinutePicker();
					self.$hourSelector.removeClass("drag");
				}
			});
			this.$hours.droppable({
				over:function(event, ui){
					var hour = $(event.target).text();
					self.$hours.removeClass("active");
					$(event.target).addClass("active");
					self.updateHourUI(hour);
				}
			});
			this.$hours.click(function(){
				var hour = $(event.target).text();
				self.$hours.removeClass("active");
				self.updateHourUI(hour);
				self.showMinutePicker();
			});
			
			this.$minuteSelector.draggable({
				drag:function(event, ui){
				},
				start:function(event, ui){
					self.$parent.find(".minute.visibleMinute").addClass("hilight");
					self.$parent.css("cursor","move");
					self.$minuteSelector.addClass("drag");
				},
				stop:function(event, ui){
					self.$minutes.removeClass("hilight");
					self.$parent.css("cursor","default");
					self.updateMinuteUI(self.minute);
					self.$minuteSelector.removeClass("drag");
				}
			});
			this.$minutes.droppable({
				over:function(event, ui){
					var traget = $(event.target).attr("class");
					var index = traget.indexOf("Min_");
					minute = parseInt(traget.substring(index + 4, traget.indexOf(" ",index)));
					self.$hours.removeClass("active");
					$(event.target).addClass("active");
					self.updateMinuteUI(minute);
				}
			});
			this.$amPm.click(function(){
				self.updateAMPMUI($(this).text());
			});
			this.$done.click(function(){
				self.options.callBack({
					hour:self.hour,
					minute:self.minute,
					amPm:self.amPm
				});
			});
			this.$parent.find(".hourText").click(function(){
				self.showHourPicker();
			});
			
			this.$parent.find(".minuteText").click(function(){
				self.showMinutePicker();
			});
			this.$parent.disableSelection();
		},
		updateHourUI : function(hour){
			var self = this;
			this.hour = hour;
			
			this.$hours.removeClass("active");
			var $selected = this.$parent.find(".Hour_"+hour);
			$selected.addClass("active");
			
			this.$hourSelector.css({
				left : $selected.css("left"),
				top : $selected.css("top"),
			}).html(hour);
			
			this.$hourNeedle.css("-webkit-transform", "rotate("+((hour * 30) - 90)+"deg)");
			this.updateTime();
		},
		updateAMPMUI : function(amPm){
			this.amPm = amPm;
			this.$amPm.removeClass("active");
			this.$parent.find("."+amPm.toLowerCase()+"Selector").addClass("active");
			this.updateTime();
		},
		updateMinuteUI : function(minute){
			var self = this;
			this.minute = minute % 60;
			
			this.$minutes.removeClass("active");
			var $selected = this.$parent.find(".Min_"+minute);
			$selected.addClass("active");
			
			this.$minuteSelector.css({
				left : $selected.css("left"),
				top : $selected.css("top"),
			}).html(((minute % 5) > 0 && (minute % 5) < 5) ? minute :"" );
			
			this.$minuteNeedle.css("-webkit-transform", "rotate("+((minute * 6) - 90)+"deg)");
			this.updateTime();
			
		},
		updateTime:function(){
			if(this.amPm == "AM" && this.hour == 12){
				this.hour = 0;
			}
			if(this.amPm == "PM" && this.hour == 0){
				this.hour = 12;
			}
			this.$parent.find(".hourText").html(this.hour < 10? "0" + this.hour : this.hour);
			this.$parent.find(".minuteText").html(this.minute < 10? "0" + this.minute : this.minute);
			this.$parent.find(".ampmText").html(this.amPm);
		},
		createHourPickerView : function(){
			var d = this.$hourPicker.width();
			var pad = this.$hourPicker.css("padding-left");
			pad = pad.substring(0,pad.indexOf("px"));
			pad = parseInt(pad);
			for(var i=0; i<12; i++){
				var hourText = (12 - i);
				var hour = $('<div class="hour Hour_'+hourText+'"></div>');
				this.$hourPicker.append(hour);
				var wid = hour.width();
				var dWid = wid/2;
				var radius = d /2;
				
				var deg = (i * 30) + (90);
				var rad = deg * Math.PI / 180;
				
				var cenX = (d / 2 ) + pad - dWid;
				var cenY = (d / 2 ) + pad - dWid;
				
				var xPos = radius  * Math.cos(rad);
				var yPos = radius * Math.sin(rad);
				
				xPos = cenX + xPos;
				yPos = cenY - yPos;
				hour.css({
					left : xPos +"px",
					top : yPos +"px"
				}).html(hourText);
			}
			this.$hourPicker.append('<div class="hour selector"></div><div class="hourNeedle"></div>');
		},
		createMinutePickerView : function(){
			var self = this;
			var d = this.$minutePicker.width();
			var pad = this.$minutePicker.css("padding-left");
			pad = pad.substring(0,pad.indexOf("px"));
			pad = parseInt(pad);
			for(var i=0; i<60; i++){
				var minText = (60 - i) % 60;
				var min = $('<div class="minute Min_'+minText+'"></div>');
				this.$minutePicker.append(min);
				var wid = min.width();
				var dWid = wid/2;
				var radius = d /2;
				
				var deg = (i * 6) + (90);
				var rad = deg * Math.PI / 180;
				
				var cenX = (d / 2 ) + pad - dWid;
				var cenY = (d / 2 ) + pad - dWid;
				
				var xPos = radius  * Math.cos(rad);
				var yPos = radius * Math.sin(rad);
				
				xPos = cenX + xPos;
				yPos = cenY - yPos;
				min.css({
					left : xPos +"px",
					top : yPos +"px"
				});
				if(i%5 == 0){
					min.html(minText)
					.addClass("visibleMinute")
					.hover(function(){
						$(this).css("cursor","pointer");
					})
					.click(function(){
						var traget = $(this).attr("class");
						var index = traget.indexOf("Min_");
						minute = parseInt(traget.substring(index + 4, traget.indexOf(" ",index)));
						self.updateMinuteUI(minute);
					});
				}
			}
			this.$minutePicker.append('<div class="minute selector"></div><div class="minuteNeedle"></div>');
		},
		showHourPicker:function(){
			this.$parent.find(".minutePicker").fadeOut();
			this.$parent.find(".hourPicker").fadeIn();
			this.$parent.find(".minuteText").removeClass("active");
			this.$parent.find(".hourText").removeClass("active").addClass("active");
		},
		showMinutePicker:function(){
			this.$parent.find(".hourPicker").fadeOut();
			this.$parent.find(".minutePicker").fadeIn();
			this.$parent.find(".hourText").removeClass("active");
			this.$parent.find(".minuteText").removeClass("active").addClass("active");
		},
		getTemplate: function(){
			var HTML = '<div class="timeTitle" align="center">'+
				'<span class="hourText"></span>'+
				'<span>:</span>'+
				'<span class="minuteText"></span>'+
				'<span class="ampmText"></span>'+
			'</div>'+
			'<div class="separate"></div>'+
			'<div class="pickerPanel">'+
				'<div class="amPicker">'+
					'<div class="amSelector amPm">AM</div>'+
				'</div>'+
				'<div class="hourMinutePicker">'+
					'<div class="hourPicker">'+
					'</div>'+
					'<div class="minutePicker">'+
					'</div>'+
				'</div>'+
				'<div class="pmPicker">'+
					'<div class="pmSelector amPm">PM</div>'+
				'</div>'+
			'</div>'+
			'<div class="separate"></div>'+
			'<div class="done" align="center">'+
				'<span>Done</span>'+
			'</div>';
			return HTML;
		}
	};
	$.fn.TimePicker = function(options){
		return new timePicker(options, this);
	};
	
}(jQuery));