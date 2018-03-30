class Summary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataReady: false,
            data: '',
            errorMessage: '',
        };
        this.retrieveData = this.retrieveData.bind(this);
        this.getDataUrl = this.getDataUrl.bind(this);
        this.showSummary = this.showSummary.bind(this);
        this.showOperationPage = this.showOperationPage.bind(this);
    }

    componentDidMount() {
        this.retrieveData();
    }

    getDataUrl() {
        return "./output/2018_04/__summary.json";
    }

    retrieveData() {
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
                dataReady: false,
                errorMessage: error
            });
            })
        .catch((error) => {
            this.setState({
                dataReady: false,
                errorMessage: error
            });
        });
    }

    showSummary() {
        return (
            <div>
                <div className='subject-title'>
                    Rank
                </div>
                <div className='main-panel'>
                    <table className="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Steem Power</th>
                                <th>Inverse Simpson</th>
                                <th>Self Vote</th>
                                <th>Daily Full Vote</th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.data.map((user) => (
                            <tr>
                                <td><a href={"./?user=" + user.userid}>{user.userid}</a></td>
                                <td title={user.sp + " + " + user.received_sp + " - " +user.delegated_sp}>{user.sp - user.delegated_sp + user.received_sp}</td>
                                <td>{user.acc_is[4]}</td>
                                <td>{user.acc_selfvote_rate[4]}</td>
                                <td>{user.acc_avg_fullvote_day[4]}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )

    }

    showOperationPage() {
        return this.state.errorMessage ? (
                <div></div>
            ) : (
                <div></div>
            );
    }

    render() {
        return this.state.dataReady ? this.showSummary() : this.showOperationPage();
    }
}

ReactDOM.render(
    <Summary/>,
    document.getElementById('content_area')
);