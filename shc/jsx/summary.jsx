var sorter = {
    byName : function(a,b) {
        return a.userid.localeCompare(b.userid);
    },
    bySP : function(a,b) {
        return (b.sp - b.delegated_sp + b.received_sp) - (a.sp - a.delegated_sp + a.received_sp);
    },
    byRshare : function(a,b) {
        return b.acc_rshare[4] - a.acc_rshare[4];
    },
    byIS : function(a,b) {
        return b.acc_is[4]- a.acc_is[4];
    },
    bySelfVote : function(a,b) {
        return b.acc_selfvote_rate[4] - a.acc_selfvote_rate[4];
    },
    byDailyFullVote: function(a,b) {
        return b.acc_avg_fullvote_day[4] - a.acc_avg_fullvote_day[4];
    }
};

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
        this.sortData = this.sortData.bind(this);
    }

    componentDidMount() {
        this.retrieveData();
    }

    getDataUrl() {
        return "./output/2018_04/0_summary.json";
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

    sortData(sorter) {
        this.state.data.sort(sorter);
        this.setState({data: this.state.data});
    }

    showSummary() {
        return (
            <div>
                <div className='subject-title'>
                    Dive Deep - 90 days accumulated
                </div>
                <div className='main-panel'>
                    <table className="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th><span className="item_name" onClick={() => this.sortData(sorter.byName)}>Name</span></th>
                                <th className="right"><span className="item_name" onClick={() => this.sortData(sorter.bySP)}>SP</span></th>
                                <th className="right"><span className="item_name" onClick={() => this.sortData(sorter.byRshare)}>Used Rshare</span></th>
                                <th className="right"><span className="item_name" onClick={() => this.sortData(sorter.byIS)}>Inverse Simpson</span></th>
                                <th className="right"><span className="item_name" onClick={() => this.sortData(sorter.bySelfVote)}>Self Vote</span></th>
                                <th className="right"><span className="item_name" onClick={() => this.sortData(sorter.byDailyFullVote)}>Daily Full Vote</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.data.map((user) => {
                            return (
                                <tr>
                                    <td><a href={"./?user=" + user.userid}>{user.userid}</a></td>
                                    <td className="right">{user.sp - user.delegated_sp + user.received_sp}</td>
                                    <td className="right">{tools.shortenNumber(user.acc_rshare[4], 2)}</td>
                                    <td className="right">{user.acc_is[4]}</td>
                                    <td className="right">{user.acc_selfvote_rate[4]}</td>
                                    <td className="right">{user.acc_avg_fullvote_day[4]}</td>
                                </tr>
                            );
                        })}
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