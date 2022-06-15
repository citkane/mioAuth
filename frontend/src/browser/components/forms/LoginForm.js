let session;
export default class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        session = props.session;
        this.changeForm = this.props.changeForm
        this.state = {
            username: '',
            password: ''
        }
    }
    handleChange(e){
        const newState = {...this.state};
        newState[e.target.name] = e.target.value;
        this.setState(newState);
    }
    logIn(e){
        e.preventDefault();
        const logInDetails = {
            username: this.state.username,
            password: this.state.password
        }
        session.logIn(logInDetails).then(invalid => {
            if(invalid) this.setState({ invalid: invalid.invalid });
        });
    }
    render(){
        /*
        return (
            <div>
                <form id="viocore-auth-login" onSubmit={e => this.logIn(e)}>
                    <input type="text" placeholder="Username or Email" name="username" 
                        value={this.state.username} 
                        onChange={(e) => {this.handleChange(e)}}
                        required
                    />
                    <input type="password" placeholder="Password" name="password" 
                        value={this.state.password} 
                        onChange={(e) => {this.handleChange(e)}}
                        required
                    />
                    {this.state.invalid ? <p>{this.state.invalid.message}</p> : null}
                    <input type="submit" value="Log In" />
                </form>
                <button onClick={() => { this.changeForm('register') }}>Register</button>
                <button onClick={() => { this.changeForm('forgot') }}>I forgot my password...</button>
            </div>
        )
        */
    }
}