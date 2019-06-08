import React, {Component} from 'react';
import img from './buildersFest.jpg'
import {Stitch, RemoteMongoClient, UserPasswordCredential} from 'mongodb-stitch-browser-sdk';
import ReactTable from 'react-table';
import "react-table/react-table.css"
import './App.css';

// Initialize Stitch.  Be sure to add your unique App Id!
let appId = 'stitch-rules-application-ttmgw';
Stitch.initializeDefaultAppClient(appId);
const stitchClient = Stitch.defaultAppClient;

export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            username: ''
        }

        this.onClick = this.onClick.bind(this);
        this.isUnmounted = false;
    }

    listMoviesByUser(username) {
        this.setState({username: username});

        // Start of Stitch use
        // Just an example.  Each user would have a different password and we would not post it
        // within static content ;)
        console.log("List Movies by User.  User selected: " + username);
        let password = 'myPassword';
        let credential = new UserPasswordCredential(username,password);

        return stitchClient.auth.loginWithCredential(credential).then(user => {
            console.log("User logged in: " + user.id);

            // Initialize Mongo Service Client
            let mongodb = stitchClient.getServiceClient(
                RemoteMongoClient.factory,
                "mongodb-atlas"
            );

            // get a reference to the movies collection
            let moviesCollection = mongodb.db('sample_mflix').collection('movies');

            // query the collection
            return moviesCollection.find({}, {
                limit: 50,
                projection: { _id: 0, title: 1, rated: 1, "imdb.rating": 1, year: 1, poster: 1 }
            }).asArray();

            // end of stitch use

        }).then(results => {
            if(this.isUnmounted) {
                return;
            }
            this.setState({data: results});
        }).catch(e => {
            console.log("Error with listUsersByUser: " + e);
        })
    }

    componentDidMount() {
        if(this.state.data.length === 0) {
            this.setState({
                data: this.listMoviesByUser('Child')
            })
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    onClick(username) {
        this.setState({
            data: this.listMoviesByUser(username)
        })
    }

    render() {
        const {data} = this.state;

        let tableData = [];
        if(data.length > 0) {
            tableData = data.slice();
        }

        return (
            <div className="App">
                <div>
                    <header>
                        <img src={img} alt="logo" height={50}/>
                    </header>
                </div>
                <div className="divpadding">
                    <button className="button" onClick={() => this.onClick('Child')}>Child</button>
                    <button className="button" onClick={() => this.onClick('Teen')}>Teen</button>
                    <button className="button" onClick={() => this.onClick('Adult')}>Adult</button>
                    <text className="text">Displaying movies for user: {this.state.username}</text>
                </div>
                <div>
                <ReactTable
                    data={tableData}
                    columns={[
                        {
                            Header: "Title",
                            accessor: "title",
                            Cell: row => <div style={{ textAlign: "center" }}>{row.value}</div>
                        },
                        {
                            Header: "Rated",
                            accessor: "rated",
                            Cell: row => <div style={{ textAlign: "center" }}>{row.value}</div>
                        },
                        {
                            Header: "IMDB Rating",
                            accessor: "imdb.rating",
                            Cell: row => <div style={{ textAlign: "center" }}>{row.value}</div>
                        },
                        {
                            Header: "Poster",
                            accessor: "poster",
                            Cell: row => {
                                return <div style={{ textAlign: "center" }}><img alt="" height={100} src={row.value}/></div>
                            }
                        }
                    ]}
                    className="-striped -highlight"
                    defaultPageSize={5}
                >

                </ReactTable>
                </div>
            </div>

        );
  }
}
