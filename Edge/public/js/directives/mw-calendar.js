var mwCal = angular.module("mw-calendar", []);

mwCal.directive("mwCalendar", function (){
	function wrapMonth(date){
		var originalMonth = date.month;
		var newMonth = originalMonth % 12;
		newMonth += (newMonth <= 0 ? 12 : 0);
		var addYears = (originalMonth > 0 ? parseInt((originalMonth - 1) / 12) : parseInt(originalMonth / 12) - 1);
		//
		date.month = newMonth;
		date.year += addYears;
	}
	function monthToString(month){
		if (month === 1){
			return "January";
		} else if (month === 2){
			return "February";
		} else if (month === 3){
			return "March";
		} else if (month === 4){
			return "April";
		} else if (month === 5){
			return "May";
		} else if (month === 6){
			return "June";
		} else if (month === 7){
			return "July";
		} else if (month === 8){
			return "August";
		} else if (month === 9){
			return "September";
		} else if (month === 10){
			return "October";
		} else if (month === 11){
			return "November";
		} else if (month === 12){
			return "December";
		} else{
			return "January";
		}
	}
	function weekDayToString(weekDay){
		if (weekDay === 0){
			return "Sunday";
		} else if (weekDay === 1){
			return "Monday";
		} else if (weekDay === 2){
			return "Tuesday";
		} else if (weekDay === 3){
			return "Wednesday";
		} else if (weekDay === 4){
			return "Thursday";
		} else if (weekDay === 5){
			return "Friday";
		} else if (weekDay === 6){
			return "Saturday";
		} else {
			return "Sunday";
		}
	}
	function buildCalendarInElement(element, month, year){
		element.empty();
		//
		var originalMonth = month;
		var newMonth = originalMonth % 12;
		newMonth += (newMonth <= 0 ? 12 : 0);
		var addYears = (originalMonth > 0 ? parseInt((originalMonth - 1) / 12) : parseInt(originalMonth / 12) - 1);
		//
		month = newMonth;
		year += addYears;
		//
		var firstOfTheMonth = new Date(year, month - 1, 1);
		var lastOfTheMonth = new Date(year, month, 0);
		//
		var blankStartCells = firstOfTheMonth.getDay();
		var blankEndCells = 6 - lastOfTheMonth.getDay();
		var daysInMonth = lastOfTheMonth.getDate();
		var totalCellCount = blankStartCells + daysInMonth + blankEndCells;
		var totalRows = totalCellCount / 7 + (totalCellCount % 7 > 0 ? 1 : 0);
		var cellCounter = 0;
		//
		var table = angular.element(document.createElement("table")).addClass("mwCalendar");
		element.append(table);
		//
		var monthRow = angular.element(document.createElement("tr")).attr({
			id: "month"
		});
		table.append(monthRow);
		var monthHead = angular.element(document.createElement("th")).attr({
			colspan: 7
		});
		monthRow.append(monthHead);
		var previousMonth = angular.element(document.createElement("button")).attr({
			id: "previousMonth"
		}).css("float", "left").css("display", "block").text("<");
		monthHead.append(previousMonth);
		var nextMonth = angular.element(document.createElement("button")).attr({
			id: "nextMonth"
		}).css("float", "right").css("display", "block").text(">");
		monthHead.append(nextMonth);
		var displayMonth = angular.element(document.createElement("div")).attr({
			id: "monthName"
		}).text(monthToString(month)).css("display", "block").css("margin-left", "auto").css("margin-right", "auto");
		monthHead.append(displayMonth);
		//
		var weekRow = angular.element(document.createElement("tr")).attr({
			id: "week"
		});
		table.append(weekRow);
		for (var dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++){
			var weekDayName = weekDayToString(dayOfWeek - 1);
			var weekDay = angular.element(document.createElement("th")).attr({
				id: weekDayName
			}).text(weekDayName);
			weekRow.append(weekDay);
		}
		//
		var today = new Date();
		for (var row = 0; row < totalRows; row++)
		{
			var isOddWeek = ((row + 1) % 2 > 0 ? "odd" : "even");
			var calRow = angular.element(document.createElement("tr")).addClass(isOddWeek);
			table.append(calRow);
			for (var col = 0; col < 7; col++)
			{
				var dayOfMonth = (1 + cellCounter - blankStartCells);
				var weekDayName = weekDayToString(col);
				var isOddDay = (dayOfMonth % 2 > 0 ? "odd" : "even");
				var isToday = (dayOfMonth == today.getDate() && month == today.getMonth() + 1);
				var isBlank = ! (cellCounter >= blankStartCells && cellCounter < totalCellCount - blankEndCells);
				//
				var cell = angular.element(document.createElement("td")).attr({
					id: dayOfMonth
				}).addClass(weekDayName).addClass(isOddDay);
				calRow.append(cell);
				var day = angular.element(document.createElement("div")).attr({
					style: 'position: relative; width: 100%; height: 100%;'
				});
				cell.append(day);
				if (isToday){
					cell.addClass("today");
				}
				if (isBlank){
					cell.addClass("blank");
				} else {
					var digitDiv = angular.element(document.createElement("div")).addClass("digit").text(dayOfMonth);
					day.append(digitDiv);
				}
				var elemDiv = angular.element(document.createElement("div")).addClass("elem");
				day.append(elemDiv);
				//
				cellCounter += 1;
			}
		}
	}
	function addMonthClickHandlers(scope, dateAttribute, id){
		angular.element("#" + id + " #previousMonth").bind("click", function(){
			var newDate = {month: scope[dateAttribute].month - 1, year: scope[dateAttribute].year};
			wrapMonth(newDate);
			scope[dateAttribute].month = newDate.month;
			scope[dateAttribute].year = newDate.year;
			scope.$apply();
		});
		angular.element("#" + id + " #nextMonth").bind("click", function(){
			var newDate = {month: scope[dateAttribute].month + 1, year: scope[dateAttribute].year};
			wrapMonth(newDate);
			scope[dateAttribute].month = newDate.month;
			scope[dateAttribute].year = newDate.year;
			scope.$apply();
		});
	}
	return {
		link: function(scope, element, attrs){
			if (attrs.id){
				var key = "_mwDate";
				var today = new Date();
				scope[key] = {month: today.getMonth() + 1, year: today.getFullYear()};
				var date, events;
				scope.$watch(key, function(value){
					date = value;
					buildCalendarInElement(element, date.month, date.year);
					addMonthClickHandlers(scope, key, attrs.id);
					if (scope[attrs.mwGetEvents]){
						scope[attrs.mwGetEvents](date.month, date.year, function(events){
							display = scope[attrs.mwDisplayEvent];
							if (events){
								for (var i = 0; i < events.length; i++){
									var evt  = events[i];
									if (evt && evt.date && evt.date.getDate){
										var d = evt.date.getDate();
										var elm = angular.element("#" + attrs.id + " #" + d + " .elem");
										if (elm){
											var disp = display(evt);
											if (disp){
												elm.append(disp);
											}
										}
									}
								}
							}
						});
					}
				}, true);
			}
		}
	};
});