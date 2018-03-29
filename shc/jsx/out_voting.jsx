function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

class OutVoting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataReady: false,
            data: '',
            errorMessage: '',
            userName: getQueryVariable('user')
        };
        this.retrieveData = this.retrieveData.bind(this);
        this.getDataUrl = this.getDataUrl.bind(this);
        this.accumulatedVotingTrend = this.accumulatedVotingTrend.bind(this);
    }

    componentDidMount() {
        this.retrieveData();
    }

    getDataUrl() {
        //return "https://1ymd9zbxlj.execute-api.us-west-2.amazonaws.com/prod/voting-trend/@" + this.state.userName;
        //return "http://steemdata.s3-website-us-west-2.amazonaws.com/march2018/" + this.state.userName + ".json"
        return "./output/2018_04/" + this.state.userName + ".json";
    }

    retrieveData() {
        if (this.state.userName) {
            fetch(this.getDataUrl())
            .then(res => res.json())
            .then(
              (result) => {
                this.setState({
                    dataReady: true,
                    data: result
                });
              },
              (error) => {
                this.setState({
                    dataReady: true,
                    errorMessage: error
                });
              }
            )
        }
    }

    showInputForm() {
        return (<div>Input</div>);
    }

    accumulatedVotingTrend() {
        return (
            <div>
                <div className='row'>
                    <div className='col-xs-12 col-md-12'>
                        <h2>Accoumiated Voting Trend</h2>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-xs-6 col-md-4 chart_frame'>
                        <div className='chart_cell'>
                            <SimpleLineChart 
                            title='Inverse Simpson Index'
                            chart_id='inverse_simpson' 
                            label={this.state.data.map((period) => period.days)}
                            yAxisString='IS index'
                            xAxisString='Days Accumulated'
                            data={this.state.data.map((period) => period.invers_simpson)}
                            />
                        </div>
                    </div>
                    <div className='col-xs-6 col-md-4 chart_frame'>
                        <div className='chart_cell'>
                            <SimpleLineChart 
                            title='Self voting'
                            chart_id='self_voting' 
                            label={this.state.data.map((period) => period.days).reverse()}
                            yAxisString='Self voting %'
                            xAxisString='Days Accumulated'
                            data={this.state.data.map((period) => period.self_vote).reverse()}
                            />
                        </div>
                    </div>
                    <div className='col-xs-6 col-md-4 chart_frame'>
                        <div className='chart_cell'>
                            <SimpleLineChart 
                            title='Average full-voting per day'
                            chart_id='avg_self_voting_per_day' 
                            label={this.state.data.map((period) => period.days).reverse()}
                            yAxisString='Avg. full-voting per day'
                            xAxisString='Days Accumulated'
                            data={this.state.data.map((period) => period.avg_full_voting_per_day).reverse()}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    showResult() {
        return (
        <div className='container'>
            {this.state.data ? (
                <div class="container-fluid">
                    {this.accumulatedVotingTrend()}
                    <div className='row'>
                        <div className='col-xs-6 col-md-4'>
                            <h2>Top Votees</h2>
                        </div>
                    </div>
                    <div className='row'>
                        {this.state.data.map((period, idx) =>
                            <div className='col-xs-6 col-md-4' style={{width: 300, height: 300}}>
                                <PieChart 
                                chart_id={'top_votee' + idx}
                                title={'Top votees for ' + period.days + ' days'}
                                data={period.top_votee}
                                />
                            </div>
                        )}
                    </div>
                    <div className='row'>
                        <div className='col-xs-6 col-md-4' style={{width: 600, height: 600}}>
                            <CombinedPieChart 
                            chart_id={'top_votee_combined'}
                            title={'Top votees for various days (Outside is the longest term)'}
                            data={this.state.data.reverse()}
                            />
                        </div>
                    </div>
                </div>
            ):(
                <div><img src="./img/spinner.gif"/></div>
            )}
        </div>);
    }

    render() {
        return this.state.userName ? this.showResult() : this.showInputForm();
    }
}

class SimpleLineChart extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        var ctx = document.getElementById(this.props.chart_id).getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            // The data for our dataset
            data: {
                labels: this.props.label,
                datasets: [{
                    label: this.props.title,
                    fill: false,
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgb(255, 99, 132)",
                    data: this.props.data,
                    borderWidth: 1
                }]
            },

            // Configuration options go here
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title:{
                    display: true,
                    text: this.props.title
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: this.props.yAxisString
                        }
                    }],
                    xAxes: [{
                        display: true,
                        scaleLabel: {
							display: true,
							labelString: this.props.xAxisString
						}
                    }]
                }
            }
        });
    }

    render() {
        return (
            <canvas id={this.props.chart_id}></canvas>
        )
    }
};

class PieChart extends React.Component {
    constructor(props){
        super(props);
    }

    componentDidMount() {
        var labels = this.props.data.map((votee) => votee.account);
        labels.push('others');
        var data = this.props.data.map((votee) => votee.percentage.toFixed(2));
        data.push(100 - data.reduce((a, b) => parseInt(a) + parseInt(b), 0));
        var colorList = palette('tol', data.length).map((hex) => '#' + hex);
        colorList = this.props.data.map((votee) => '#' + intToRGB(hashCode(votee.account)));

        var ctx = document.getElementById(this.props.chart_id).getContext('2d');
        var chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				datasets: [{
					data: data,
					backgroundColor: colorList
				}],
				labels: labels
			},
			options: {
				responsive: true,
				legend: {
                    display: false				},
				title: {
					display: true,
					text: this.props.title
				},
				animation: {
					animateScale: true,
					animateRotate: true
                },
                tooltips: {
                    callbacks: {
                          label: function(tooltipItem, data) {
                          var label = data.labels[tooltipItem.index];
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          return label + ': ' + value + "%";
                        }
                    }
                }
			}
		});
    }
    
    render() {
        return (
            <canvas id={this.props.chart_id} style={{width: 300, height: 300, maxHeight: 600}}></canvas>
        )
    }
}


class CombinedPieChart extends React.Component {
    constructor(props){
        super(props);
        this.prepareForPeriod = this.prepareForPeriod.bind(this);
    }

    prepareForPeriod(data) {
        var labels = data.map((votee) => votee.account);
        labels.push('others');
        var chartData = data.map((votee) => votee.percentage.toFixed(2));
        chartData.push(100 - chartData.reduce((a, b) => parseInt(a) + parseInt(b), 0));
        var colorList = data.map((votee) => '#' + intToRGB(hashCode(votee.account)));
        return {labels: labels, data: chartData, backgroundColor: colorList};
    }

    componentDidMount() {
        var ctx = document.getElementById(this.props.chart_id).getContext('2d');
        var chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
                datasets: this.props.data.map((period) => this.prepareForPeriod(period.top_votee)),
            },
			options: {
				responsive: true,
				legend: {
                    display: false				},
				title: {
					display: true,
					text: this.props.title
				},
				animation: {
					animateScale: true,
					animateRotate: true
                },
                tooltips: {
                    callbacks: {
                          label: function(tooltipItem, data) {
                          var label = data.datasets[tooltipItem.datasetIndex].labels[tooltipItem.index];
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          return label + ': ' + value + "%";
                        }
                    }
                }
			}
		});
    }
    
    render() {
        return (
            <canvas id={this.props.chart_id} style={{width: 300, height: 300, maxHeight: 600}}></canvas>
        )
    }
}
ReactDOM.render(
    <OutVoting/>,
    document.getElementById('content_area')
);
