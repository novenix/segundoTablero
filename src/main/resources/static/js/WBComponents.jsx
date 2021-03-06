class Editor extends React.Component {
    render() {
        return (
            <div>
                <h1>Hello, {this.props.name}</h1>
                <hr/>
                <div id="toolstatus"/>
                <hr/>
                <div id="container"/>
                <WBCanvas/>
                <hr/>
                <div id="info"/>
            </div>
        );
    }
}

class WBCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.comunicationWS = new WSBBChannel(WBServiceURL(), (msg) => {
            const obj = JSON.parse(msg);
            console.log("On func call back ", msg);
            this.drawPoint(obj.x, obj.y);
        });
        this.myp5 = null;
        this.state = {loadingState: 'Loading Canvas ...'}
        let wsreference = this.comunicationWS;
        this.sketch = function (p) {
            let x = 100;
            let y = 100;
            p.setup = function () {
                p.createCanvas(700, 410);
            };
            p.draw = function () {
                if (p.mouseIsPressed === true) {
                    p.fill(0, 0, 0);
                    p.ellipse(p.mouseX, p.mouseY, 20, 20);
                    wsreference.send(p.mouseX, p.mouseY);
                }
                if (p.mouseIsPressed === false) {
                    p.fill(255, 255, 255);
                }
            };
        }
    }
    drawPoint(x, y){
        this.myp5.ellipse(x, y, 20, 20);
    }
    componentDidMount() {
        this.myp5 = new p5(this.sketch, 'container');
        this.setState({loadingState: 'Canvas Loaded'});
    }
    render()
    {
        return(
            <div>
                <h4>Drawing status: {this.state.loadingState}</h4>
            </div>);
    }
}

function WBServiceURL() {
    return 'ws://localhost:8080/wbService';
}
class WSBBChannel {
    constructor(URL, callback) {
        this.URL = URL;
        this.wsocket = new WebSocket(this.URL);
        this.wsocket.onopen = (evt) => this.onOpen(evt);
        this.wsocket.onmessage = (evt) => this.onMessage(evt);
        this.wsocket.onerror = (evt) => this.onError(evt);
        this.receivef = callback;
    }
    onOpen(evt) {
        console.log("In onOpen", evt);
    }
    onMessage(evt) {
        console.log("In onMessage", evt);
        // Este if permite que el primer mensaje del servidor no se tenga en cuenta.
        // El primer mensaje solo confirma que se estableci?? la conexi??n.
        // De ah?? en adelante intercambiaremos solo puntos(x,y) con el servidor
        if (evt.data !== "Connection established.") {
            this.receivef(evt.data);
        }
    }
    onError(evt) {
        console.error("In onError", evt);
    }
    send(x, y) {
        let msg = '{ "x": ' + (x) + ', "y": ' + (y) + "}";
        console.log("sending: ", msg);
        this.wsocket.send(msg);
    }
}

ReactDOM.render(
    <Editor name="Daniel"/>,
    document.getElementById('root')
);