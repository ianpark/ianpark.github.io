
class Pay extends React.Component {
    constructor(props) {
        super(props);
        this.getQR = this.getQR.bind(this);
    }

    getQR() {
        return "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=Hello%20world&choe=UTF-8";
    }

    render() {
        return (
            <div>
                <img src={this.getQR()}/>
            </div>
        )
    }
}

ReactDOM.render(
    <Pay/>,
    document.getElementById('content_area')
);