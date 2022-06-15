let session;
export default class ForgotForm extends React.Component {
    
    constructor(props){
        super(props);
        session = props.session;
        this.changeForm = props.changeForm;
        this.state = {
            username: '',
            message: null
        }
    }
    handleChange(e){
        const newState = {...this.state};
        newState[e.target.name] = e.target.value;
        newState.valid = !!newState.username.length;
        this.setState(newState);
    }
    requestPassword(e){
        e.preventDefault();
        session.requestPasswordReset(this.state.username).then(message => {
            if(message.invalid) message = message.invalid.message;
            this.setState({ message, username: '' });
        })
    }
    render(){
        /*
        return (
            <div>
                <p>Request a password reset link</p>
                <form id="viocore-auth-reset" onSubmit={e => this.requestPassword(e)}>
                    <input type="text" placeholder="Username or email" name="username"
                        autoComplete="off"
                        value={this.state.username} 
                        onChange={(e) => {this.handleChange(e)}}
                        required
                    />
                    <input type="submit" value="Submit" disabled={!this.state.valid}/>
                </form>
                {this.state.message ? <p>{this.state.message}</p> : null}
                <button onClick={() => { this.changeForm('login') }}>Back to login</button>
            </div>
        )
        */
    }
}