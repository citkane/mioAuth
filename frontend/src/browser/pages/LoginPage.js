import React from 'react';

import '../css/login.scss';
//import LoginForm from '../components/forms/LoginForm';
//import Success from '../components/forms/Success';
//import SetForm from '../components/forms/SetForm';
//import RegisterForm from '../components/forms/RegisterForm';
//import ForgotForm from '../components/forms/ForgotForm';

const token = new URL(location.href).searchParams.get('token');
const forms = {
    //login: LoginForm,
    //register: RegisterForm,
    //setpass: SetForm,
    //success: Success,
    //forgot: ForgotForm
};

//let session;
export default class LoginPage extends React.Component {
    
    constructor(props) {
        super(props);
        session = props.session;        
        const Form = !!token ? forms.setpass : forms.login;
        this.state={
            form: <Form changeForm={this.changeForm.bind(this)} session={session}/>
        }       
    }

    changeForm(form, user, message){
        const Form = forms[form];
        if(form === 'success') return this.setState({
            form: <Form changeForm = {this.changeForm.bind(this)} user={user} session={session} message={message}/> 
        })
        this.setState({form: <Form changeForm = {this.changeForm.bind(this)} session={session} /> })
    }

    render(){        
        return (
            <div id="mio-loginPage">
                <div className ="inner">
                    <h1>vioApp</h1>
                    {this.state.form}
                </div>

            </div>
        )
    }
    
}
