'use client'

import { useState } from 'react'
import DNIInput from './DNIInput';
import PasswordInput from './PasswordInput';
import { CheckBox } from './CheckBox';
import { Button } from './Button';

export const Login = () =>{

  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('DNI:', dni);
    console.log('Password:', password);
  };


    return(
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-center text-gray-100">Login</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">

              <div>
                <DNIInput value={dni} onChange={(e) => setDni(e.target.value)} />
              </div>

              <div className="mt-4">
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)}/>
              </div>

            <div>
               <CheckBox text='Remember Me'/>
            </div>

            <div>
                <Button text='Iniciar Sesion'/>
            </div>
          </div>
        </form>
      </div>
    )
}

export default Login;