import React from 'react';

export default class Success extends React.Component {
    /*
    constructor(props) {
        super(props);
        this.changeForm = this.props.changeForm;
    }
    */
    render(){
        return (<div>HELLO</div>)
        /*
        const {firstname, lastname, email} = this.props.user.credentials;
        return (
            <div className="message">
                <p>Welcome to vioApp {firstname} {lastname}.</p>
                <p>
                    An email has been sent to:
                    <br/><strong>{email}</strong><br/>
                    This contains a login link to set your password.
                </p>
                <p>The link will be valid for one hour.</p>
                <button onClick={() => {this.changeForm('login')}}>Back to Login</button>
            </div>
        )#
        */
    }
}