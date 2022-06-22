let session, logger;
export default class RegisterForm extends React.Component{
    constructor(props) {
        super(props);
        session = props.session;
        logger = session.logger;
        this.changeForm = this.props.changeForm;
        this.state = {
            username: '',
            email: '',
            firstname: '',
            lastname: '',
            emailconfirm: '',
            message: null,
            valid: false
        }
    }
    handleChange(e){
        const newState = {...this.state};
        newState[e.target.name] = e.target.value;
        newState.valid = (
            newState.username &&
            newState.email &&
            newState.firstname &&
            newState.lastname &&
            newState.emailconfirm === newState.email
        )       
        this.setState(newState);
    }
    register(e) {
        e.preventDefault();
        const userDetails = {
            username: this.state.username,
            email: this.state.email,
            firstname: this.state.firstname,
            lastname: this.state.lastname
        }
        session.register(userDetails).then(user => {
            if(user.invalid) return this.setState({
                message: user.invalid.message
            })
            return this.changeForm('success', user);           
        });
    }
    render(){
        /*
        return (
            <div>
                <p>Register for an account.</p>
                <form id="viocore-auth-register" onSubmit={e => this.register(e)}>
                    <input type="text" placeholder="Username" name="username"
                        autoComplete="off"
                        value={this.state.username} 
                        onChange={(e) => {this.handleChange(e)}}
                        required
                    />
                    <input type="email" placeholder="Your Email" name="email"
                        value={this.state.email} 
                        onChange={(e) => {this.handleChange(e)}}
                        required
                    />
                    <input type="text" placeholder="Confirm your Email" name="emailconfirm"
                        autoComplete="off"
                        value={this.state.emailconfirm} 
                        onChange={(e) => {this.handleChange(e)}}
                        required
                    />
                    <input type="text" placeholder="First Name" name="firstname"
                        autoComplete="off"
                        value={this.state.firstname} 
                        onChange={(e) => {this.handleChange(e)}}                        
                        required
                    />
                    <input type="text" placeholder="Last Name" name="lastname"
                        autoComplete="off"
                        value={this.state.lastname} 
                        onChange={(e) => {this.handleChange(e)}}                        
                        required
                    />
                    {this.state.message ? <p>{this.state.message}</p> : null}
                    <input type="submit" value="Register" disabled={!this.state.valid}/>
                </form>
                <button onClick={() => {this.changeForm('login')}}>Back to Login</button>
            </div>
        )
        */
    }
}