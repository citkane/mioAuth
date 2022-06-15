const token = new URL(location.href).searchParams.get('token');

let session;
export default class SetForm extends React.Component {
    constructor(props) {
        super(props);
        session = props.session;
        this.changeForm = this.props.changeForm
        this.state = {
            username: '',
            password: '',
            confirm: '',
            match: null
        }
    }
    handleChange(e){
        const newState = {...this.state};
        newState[e.target.name] = e.target.value;
        newState.match = newState.password === newState.confirm;
        this.setState(newState);
    }
    savePassword(e){
        e.preventDefault();
        session.setPassword(this.state.password, token).then(user => {
            if(user.invalid) return this.setState({message: user.invalid.message});
            const creds = user.credentials;
            const logInDetails = {
                username: creds.username,
                password: this.state.password
            }
            this.setState({username: creds.username}, () => {
                session.logIn(logInDetails, true);
            })            
        })
    }
    render(){
        /*
        return (
            <div>
                <p>Please set your password</p>
                <form id="viocore-auth-password" onSubmit={e => this.savePassword(e)}>
                    <input type="text" name="username" hidden
                        defaultValue={this.state.username}
                    />
                    <input type="password" placeholder="password" name="password" 
                        value={this.state.password} 
                        onChange={(e) => {this.handleChange(e)}}
                        required
                    />
                    <input type="password" placeholder="confirm password" name="confirm" 
                        value={this.state.confirm} 
                        onChange={(e) => {this.handleChange(e)}}
                        required
                    />
                    <input type="submit" value="Save" disabled={!this.state.match}/>
                </form>
                {this.state.message ? <p>Error: {this.state.message}</p> : null}
                <button onClick={() => {location.replace('/')}}>Back to login</button>
            </div>
        )
        */
    }
}