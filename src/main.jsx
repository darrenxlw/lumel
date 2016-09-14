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
			highscore: localStorage.getItem("highscore") || 0,
			timer: 30,
			counter: 0,
			len: 0,
			showHelp: false
		});
	},
	addScore: function(n, l){
		this.setState({score: this.state.score+n, counter: this.state.counter+1, len: Math.max(this.state.len, l)});
	},
	endGame: function(){
		this.setState({status: 'standby', highscore: Math.max(this.state.score, this.state.highscore)});
		localStorage.setItem("highscore", Math.max(this.state.score, this.state.highscore));
	},
	startAgain: function(){
		this.setState({countdown: 3, score: 0, timer: 30, counter: 0})
		this.startCountdown();
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
				return(<Landing startCountdown={this.startCountdown} highscore={this.state.highscore} toggleDialog={this.toggleDialog} />);
			case 'countdown':
				return(<Countdown countdown={this.state.countdown} />);
			case 'running':
				return(<Play timer={this.state.timer} balls={this.state.balls} addScore={this.addScore} score={this.state.score} highscore={this.state.highscore} />);
			case 'standby':
				return(<Result startAgain={this.startAgain} score={this.state.score} highscore={this.state.highscore} counter={this.state.counter} len={this.state.len} toggleDialog={this.toggleDialog} />);
		}
	},
	help: function(){
		if(this.state.showHelp){
			return(
				<div id="dialog-wrapper">
					<div id="dialog-window" onClick={()=>this.toggleDialog()} ></div>
					<div id="help-dialog">
						<h2>How to play</h2>
						<ul>
							<li>Circles with numbers will appear on the window.</li>
							<li>Click the circles with the numbers in ascending order!</li>
							<li>The numbers will disappear after a short period.</li>
							<li>If you misclicked, you can undo your current clicks in the bottom right corner.</li>
							<li>If you are unsure and want to skip, just click the remaining uncolored circles.</li>
							<li>You have 30 seconds to click through as many as you can!</li>
							<li>The score is awarded proportionally to the length of the number series and the amount you of correct plays in a row.</li>
						</ul>
						<div id="close-dialog" onClick={()=>this.toggleDialog()}><i className="material-icons">clear</i></div>
					</div>
				</div>
			);
		}
	},
	toggleDialog: function(){
		this.setState({showHelp: !this.state.showHelp});
	},
	render: function(){
		return(
			<div id="content">
				{this.help()}
				{this.content()}
			</div>
		);
	}
});

var Landing = React.createClass({
	render: function(){
		return(
			<div id="landing">
				<button id="help-button" onClick={()=>this.props.toggleDialog()} >?</button>
				<div className="landing-content">
					<h1>
						<span className="letters-1">Lu</span>
						<span className="letters-2">me</span>
						<span className="letters-3">l D</span>
						<span className="letters-4">ec</span>
						<span className="letters-5">im</span>
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
			combo: 0,
			anim: null
		});
	},
	clickBall: function(i){
		this.setState({anim: null});
		if(!this.state.clicked.includes(i)){
			var tmp = this.state.clicked
			tmp.push(i)
			this.setState({clicked: tmp});

			if(tmp.length==this.state.ball.length){
				if(_.isEqual(tmp, this.state.ball)){
					var combono = this.state.combo+1;
					this.props.addScore(100*((this.state.ball.length)+parseInt(this.state.combo/3)), this.state.ball.length);
					tmp = this.state.ball;
					tmp.push(_.max(tmp)+1);
					var tmp2 = _.map(this.state.key, function(n){
						return n+_.max(tmp);
					});
					tmp2.push(_.max(tmp2)+1);
					this.setState({ball: tmp, key: tmp2, combo: combono, clicked: [], anim: {animation: 'correct 1s'}});					
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
					this.setState({ball: tmp, key: tmp2, combo: combono, clicked: [], anim: {animation: 'false 1s'}});					
				}			
			}
		}
	},
	resetRound: function(){
		this.setState({clicked: []});
	},
	render: function(){
		return(
			<div id="play-area">
				<span className="pull-right" style={this.state.anim} >0:{this.props.timer}</span>
				<span className="pull-right" style={this.state.anim} >Score: {this.props.score}</span>
				<span className="pull-right" style={this.state.anim} >Highscore: {this.props.highscore}</span>
				<div id="play-field">
					{
						this.state.ball.map(function(ball, i){
							return(
								<Ball key={this.state.key[i]} ball={ball} clickBall={this.clickBall} count={this.state.count} clicked={this.state.clicked} />
							);
						}, this)
					}

				</div>
				<button id="redo" onClick={()=>this.resetRound()}><i className="material-icons">rotate_left</i><br />undo</button>
			</div>
		);
	}
});

var Ball = React.createClass({
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
				<button id="help-button" onClick={()=>this.props.toggleDialog()} >?</button>
				<div className="vertical-align">
					<div className="flex-wrapper">
						<div className="stat-container">
							<ul>
								<li>Score: {this.props.score}</li>
								<li>Highscore: {this.props.highscore}</li>
								<li>Correct plays: {this.props.counter}</li>
								<li>Biggest play: {this.props.len}</li>
							</ul>
							<button id="start-again" onClick={() => this.props.startAgain()} >Play again</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});


ReactDOM.render(
  <Layout />,
  document.getElementById("app")
);