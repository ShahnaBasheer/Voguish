'use strict';

/* Chart.js docs: https://www.chartjs.org/ */

window.chartColors = {
	green: '#75c181',
	gray: '#a9b5c9',
	text: '#252930',
	border: '#e7e9ed'
};

/* Random number generator for demo purpose */
var randomDataPoint = function(){ return Math.round(Math.random()*10000)};


//Chart.js Line Chart Example 

var lineChartConfig = {
	type: 'line',

	data: {
		  labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
		
		  datasets: [{
		  	  label: 'Current week',
		  	  fill: false,
		  	  lineTension: 0.4,
		  	  backgroundColor: window.chartColors.green,
		  	  borderColor: window.chartColors.green,
		  	  data: [
		  	  	  randomDataPoint(),
		  	  	  randomDataPoint(),
		  	  	  randomDataPoint(),
		  	  	  randomDataPoint(),
		  	  	  randomDataPoint(),
		  	  	  randomDataPoint(),
		  	  	  randomDataPoint()
		  	  ],
		      }, {
			    label: 'Previous week',
		      borderDash: [3, 5],
			    lineTension: 0.4,
			    backgroundColor: window.chartColors.gray,
			    borderColor: window.chartColors.gray,
			    
			    data: [
			    	  randomDataPoint(),
			    	  randomDataPoint(),
			    	  randomDataPoint(),
			    	  randomDataPoint(),
			    	  randomDataPoint(),
			    	  randomDataPoint(),
			    	  randomDataPoint()
			    ],
			    fill: false,
		  }]
	},
	options: {
		  responsive: true,	
		  aspectRatio: 1.5,
		  
		  legend: {
		  	display: true,
		  	position: 'bottom',
		  	align: 'end',
		  },
		  
		  title: {
		  	display: true,
		  	text: 'Chart.js Line Chart Example',
		  	
		  }, 
		  tooltips: {
		  	mode: 'index',
		  	intersect: false,
		  	titleMarginBottom: 10,
		  	bodySpacing: 10,
		  	xPadding: 16,
		  	yPadding: 16,
		  	borderColor: window.chartColors.border,
		  	borderWidth: 1,
		  	backgroundColor: '#fff',
		  	bodyFontColor: window.chartColors.text,
		  	titleFontColor: window.chartColors.text,
  
              callbacks: {
	              //Ref: https://stackoverflow.com/questions/38800226/chart-js-add-commas-to-tooltip-and-y-axis
                  label: function(tooltipItem, data) {
	                  if (parseInt(tooltipItem.value) >= 1000) {
                          return "$" + tooltipItem.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      } else {
	                      return '$' + tooltipItem.value;
                      }
                  }
              },
  
		  },
		  hover: {
		  	mode: 'nearest',
		  	intersect: true
		  },
		  scales: {
		  	xAxes: [{
		  		display: true,
		  		gridLines: {
		  			drawBorder: false,
		  			color: window.chartColors.border,
		  		},
		  		scaleLabel: {
		  			display: false,
		  		
		  		}
		  	}],
		  	yAxes: [{
		  		display: true,
		  		gridLines: {
		  			drawBorder: false,
		  			color: window.chartColors.border,
		  		},
		  		scaleLabel: {
		  			display: false,
		  		},
		  		ticks: {
		              beginAtZero: true,
		              userCallback: function(value, index, values) {
		                  return '$' + value.toLocaleString();   //Ref: https://stackoverflow.com/questions/38800226/chart-js-add-commas-to-tooltip-and-y-axis
		              }
		          },
		  	}]
		  }
	}
};



// Chart.js Bar Chart Example 

var barChartConfig = {
	type: 'bar',
	data: {
			labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			datasets: [{
					label: 'Orders',
					backgroundColor: window.chartColors.green,
					borderColor: window.chartColors.green,
					borderWidth: 1,
					maxBarThickness: 16,
					data: [23, 45, 76, 75, 62, 37, 83]
			}]
	},
	options: {
			responsive: true,
			aspectRatio: 1.5,
			legend: {
					position: 'bottom',
					align: 'end',
			},
			title: {
					display: true,
					text: 'Chart.js Bar Chart Example'
			},
			tooltips: {
					mode: 'index',
					intersect: false,
					titleMarginBottom: 10,
					bodySpacing: 10,
					xPadding: 16,
					yPadding: 16,
					borderColor: window.chartColors.border,
					borderWidth: 1,
					backgroundColor: '#fff',
					bodyFontColor: window.chartColors.text,
					titleFontColor: window.chartColors.text,
			},
			scales: {
					xAxes: [{
							display: true,
							gridLines: {
									drawBorder: false,
									color: window.chartColors.border,
							},
					}],
					yAxes: [{
							display: true,
							gridLines: {
									drawBorder: false,
									color: window.chartColors.border,
							},
					}]
			}
	}
};




// Generate charts on load
window.addEventListener('load', function(){
	
	var lineChart = document.getElementById('canvas-linechart').getContext('2d');
	window.myLine = new Chart(lineChart, lineChartConfig);
	
	var barChart = document.getElementById('canvas-barchart').getContext('2d');
	window.myBar = new Chart(barChart, barChartConfig);
	

});	
	

/* 

window.chartColors = {
	green: '#75c181', // rgba(117,193,129, 1)
	blue: '#5b99ea', // rgba(91,153,234, 1)
	gray: '#a9b5c9',
	text: '#252930',
	border: '#e7e9ed'
};



var lineChartConfig = {
	type: 'line',
	data: {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
		datasets: [{
			label: 'Dataset',
			backgroundColor: "rgba(117,193,129,0.2)", 
			borderColor: "rgba(117,193,129, 0.8)", 
			data: [],
		}]
	},
	options: {
		responsive: true,		
		
		legend: {
			display: true,
			position: 'bottom',
			align: 'end',
		},

		tooltips: {
			mode: 'index',
			intersect: false,
			titleMarginBottom: 10,
			bodySpacing: 10,
			xPadding: 16,
			yPadding: 16,
			borderColor: window.chartColors.border,
			borderWidth: 1,
			backgroundColor: '#fff',
			bodyFontColor: window.chartColors.text,
			titleFontColor: window.chartColors.text,
            callbacks: {
                label: function(tooltipItem, data) {	                 
	                return tooltipItem.value + '%';   
                }
            },
            

		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		scales: {
			xAxes: [{
				display: true,
				gridLines: {
					drawBorder: false,
					color: window.chartColors.border,
				},
				scaleLabel: {
					display: false,
				
				}
			}],
			yAxes: [{
				display: true,
				gridLines: {
					drawBorder: false,
					color: window.chartColors.border,
				},
				scaleLabel: {
					display: false,
				},
				ticks: {
		            beginAtZero: true,
		            userCallback: function(value, index, values) {
		                return value.toLocaleString() + '%';  
		            }
		        },
			}]
		}
	}
};


*/