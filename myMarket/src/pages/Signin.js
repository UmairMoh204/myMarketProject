import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const button = document.querySelector('button');
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;
            console.log('Email:', email);
            console.log('Password:', password);
            navigate('/'); 
        });
    }, [navigate]);

    return (
        <div className="signin">
            <h1>Sign In</h1>
            <form>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default Signin;