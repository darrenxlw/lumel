require('./input.scss');
var update = require('react-addons-update');
var _ = require('lodash/core');


import SetIntervalMixin from './components/mixin';


var Layout = React.createClass({
	mixins: [SetIntervalMixin],
	getInitialState: function(){
		return({
			countdown: 3,
			status: 'idle',
			score: 0,
			timer: 30
		});
	},
	addScore: function(n){
		this.setState({score: this.state.score+n});
	},
	endGame: function(){
		//this.setState({status: 'standby'});
	},
	startCountdown: function(){
		this.setState({status: 'countdown'});
		this.clearInterval();
		this.setInterval(this.tickdown, 1000);
	},
	tickdown: function(){
		if(this.state.countdown>1){
			this.setState({countdown: this.state.countdown-1, run: true})
		}else{
			this.clearInterval();
			this.setState({status: 'running'});
			this.setInterval(this.tickgame, 1000);
		}
	},
	tickgame: function(){
		if(this.state.timer>0){
			this.setState({timer: this.state.timer-1});
		}else{
			this.clearInterval();
			this.endGame();
		}
	},
	content: function(){
		switch(this.state.status){
			case 'idle':
				return(<Landing startCountdown={this.startCountdown} />);
			case 'countdown':
				return(<Countdown countdown={this.state.countdown} />);
			case 'running':
				return(<Play timer={this.state.timer} addScore={this.addScore} score={this.state.score} />);
			case 'standby':
				return(<Result />);
			default:
				return(<Landing startCountdown={this.startCountdown} />);
		}
	},
	render: function(){
		return(
			<div id="content">
				{this.content()}
			</div>
		);
	}
});

var Landing = React.createClass({
	render: function(){
		return(
			<div id="landing">
				<div className="landing-content">
					<h1>
						<span className="letters-1">Lo</span>
						<span className="letters-2">re</span>
						<span className="letters-3">m I</span>
						<span className="letters-4">ps</span>
						<span className="letters-5">um</span>
					</h1>
					<button id="start-button" onClick={() => this.props.startCountdown()} >Start Game</button>
				</div>
			</div>
		);
	}
});

var Countdown = React.createClass({
	countdownStyle: function(){
		switch(this.props.countdown){
			case 3:
				return({animation: 'pop 1s linear forwards'});
			case 2:
				return({animation: 'pop 1s linear 1s forwards'});
			case 1:
				return({animation: 'pop 1s linear 2s forwards'});
		}
	},
	render: function(){
		return(
			<div id="countdown-window">
				<h1 style={this.countdownStyle()}>{this.props.countdown}</h1>
			</div>
		);
	}
});

var Play = React.createClass({
	mixins: [SetIntervalMixin],
	getInitialState: function(){
		return({
			ball: [1,2,3,4],
			key: [1,2,3,4],
			clicked: [],
			combo: 0
		});
	},
	clickBall: function(i){
		if(!this.state.clicked.includes(i)){
			var tmp = this.state.clicked
			tmp.push(i)
			this.setState({clicked: tmp});

			if(tmp.length==this.state.ball.length){
				if(_.isEqual(tmp, this.state.ball)){
					var combono = this.state.combo+1;
					this.props.addScore(100*(this.state.ball.length)+parseInt(this.state.combo/3));
					tmp = this.state.ball;
					tmp.push(_.max(tmp)+1);
					var tmp2 = _.map(this.state.key, function(n){
						return n+_.max(tmp);
					});
					tmp2.push(_max(tmp2)+1);
				}else{
					tmp = this.state.ball;
					var tmp2 = _.map(this.state.key, function(n){
						return n+_.max(tmp);
					});
					if(this.state.combo==0){
						tmp.pop();
						tmp2.pop();
					}
					var combono=0;
				}
				
				this.setState({ball: tmp, key: tmp2, combo: combono, clicked: []})
			}
		}
	},
	resetRound: function(){
		this.setState({clicked: []});
	},
	render: function(){
		return(
			<div id="play-area">
				{String(this.state.ball)} --- {String(this.state.clicked)} --- {String(this.state.key)}
				<span className="pull-right">0:{this.props.timer}</span>
				<span className="pull-right">Score: {this.props.score}</span>
				<div id="play-field">
					{
						this.state.ball.map(function(ball, i){
							return(
								<Ball key={this.state.key[i]} ball={ball} clickBall={this.clickBall} count={this.state.count} clicked={this.state.clicked} />
							);
						}, this)
					}

				</div>
				<button id="redo" onClick={this.resetRound()}><i className="material-icons">rotate_left</i><br />reset</button>
			</div>
		);
	}
});

var Ball = React.createClass({
	componentDidMount: function(){
		console.log("mounted");
	},
	getInitialState: function(){
		return({
			left: Math.random()*100 + '%',
			top: Math.random()*100 + '%',
			border: 'black'
		});
	},
	ballPos: function(){
		if(this.props.clicked.includes(this.props.ball)){
			return ({left: this.state.left, top: this.state.top, borderColor: '#8480C2'})
		}else{
			return ({left: this.state.left, top: this.state.top})
		}
	},
	render: function(){
		return(
			<div className="ball" style={this.ballPos()} onClick={()=>this.props.clickBall(this.props.ball)} >
				<span className="number">{this.props.ball}</span>
			</div>
		);
	}
})

var Result = React.createClass({
	render: function(){
		return(
			<div id="result-sheet">
				<div className="stat-container">
					Goodbye!
				</div>
			</div>
		);
	}
});


ReactDOM.render(
  <Layout />,
  document.getElementById("app")
);