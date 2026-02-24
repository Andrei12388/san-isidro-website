'use client'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import React, { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FacebookLogin, {SuccessResponse} from '@greatsumini/react-facebook-login';

export default function LoginPage() {

     const [isSumitted, setSubmitted] = useState(false)
        const [errMsg, setErrMsg] = useState('error null')
        const [errorEnable, setErrorEnable] = useState(false)
        const [password, setPassword] = useState('')
        const [email, setEmail] = useState('')
        const [message, setMessage] = useState('')
        const [isSubmitting, setSubmitting] = useState(false)
        const [accessToken, setAccessToken] = useState('');


        const router = useRouter();

        //Check if there's a logged in acc
        

    const [messageFB, setMessageFB] = useState<{text:string, severity: "error" | "success"}>();
    

 const onFacebookSuccess = async (response: SuccessResponse) => {
  try {
    // Pass FB token directly to backend
    const res = await fetch("/api/facebook-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: response.userID,
        accessToken: response.accessToken // only used for this call
      }),
    });
    

    const fbData = await res.json();

    if (!fbData.success) {
      setMessageFB({ text: fbData.message || "Facebook login failed", severity: "error" });
      return;
    }

    const { id, name, email } = fbData.user;

    // Call your signup backend (random password if needed)
    const signupRes = await fetch("/api/postgre/auth/signUp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullname: name,
        email: email,
        password: id,
      }),
    });

    const signupData = await signupRes.json();

    if (!signupRes.ok && !signupData.message.includes("already exists")) {
      setMessageFB({ text: signupData.message || "Signup failed", severity: "error" });
      return;
    }

    // Redirect to Homepage
    setMessageFB({ text: `Welcome ${name}!`, severity: "success" });
    router.push("/");

  } catch (err) {
    console.error(err);
    setMessageFB({ text: "Facebook login failed", severity: "error" });
  }
};





const onSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // reset UI
  setErrorEnable(false);
  setMessage("");
  setErrMsg("");

  // validate first (no loading yet)
  if (!email || !password) {
    setErrorEnable(true);
    setMessage("Email and password are required");
    return;
  }

  try {
    setSubmitting(true);
    setMessage("Logging in...");

    // api/fetchdata.ts
  const result = await fetch("/api/postgre/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

    if(result.ok){
           router.push("/");
       //  setMessage("Login Failed!");
         setErrorEnable(false);
    } else {
          setMessage("Login Failed!");
       setErrorEnable(true);
    }

    // your route returns { success: true }
    if (!result) {
      throw new Error("Invalid email or password");
   
    } 
     

  } catch (err: any) {
    console.error(err);
  
    setErrMsg(err.message || "Login failed");
    setMessage("Login Failed!");

  } finally {
    setSubmitting(false);
  }
};



  
    return (
        <section className="flex min-h-screen bg-zinc-50 dark:bg-transparent mt-2 mb-2">
            <form onSubmit={onSubmit}
                className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                    <div className="text-center">
                        <div
                          
                            aria-label="go home"
                            className="mx-auto block w-fit">
                            <Logo />
                        </div>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Log In to JSCGO: San Isidro</h1>
                        <p className="text-sm">Fill up the form below to access your account.</p>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                name="email"
                                id="email"
                            />
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="pwd"
                                    className="text-sm">
                                    Password
                                </Label>
                                <Button
                                    asChild
                                    variant="link"
                                    size="sm">
                                    <Link
                                        href="#"
                                        className="link intent-info variant-ghost text-sm">
                                        Forgot your Password ?
                                    </Link>
                                </Button>
                            </div>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                name="pwd"
                                minLength={8}
                                id="pwd"
                                className="input sz-md variant-mixed"
                            />
                        </div>

                        <Button className="w-full" disabled={isSubmitting} type='submit'>{isSubmitting ? "Logging In..." : "Log In"}</Button>
                       {errorEnable ?<div className='text-center justify-center'> <span className='text-red-500 text-right'> {message} </span> </div>: ""} 
                       {messageFB && (
  <div className={`text-center mt-2 ${messageFB.severity === "error" ? "text-red-500" : "text-green-500"}`}>
    {messageFB.text}
  </div>
)}
                    </div>

                    <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <hr className="border-dashed" />
                        <span className="text-muted-foreground text-xs">Or continue With</span>
                        <hr className="border-dashed" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="0.98em"
                                height="1em"
                                viewBox="0 0 256 262">
                                <path
                                    fill="#4285f4"
                                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                                <path
                                    fill="#34a853"
                                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                                <path
                                    fill="#fbbc05"
                                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                                <path
                                    fill="#eb4335"
                                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                            </svg>
                            <span>Google</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline">
                           <svg height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" 
	 viewBox="0 0 474.294 474.294" >

<path d="M474.077 236.966A236.966 236.966 0 1 1 0.145 236.966A236.966 236.966 0 1 1 474.077 236.966Z" fill="#3A5A98"/>
<path d="M404.742,69.754c92.541,92.541,92.545,242.586-0.004,335.134c-92.545,92.541-242.593,92.541-335.134,0L404.742,69.754z" fill="#345387"/>
<path d="M472.543,263.656L301.129,92.238l-88.998,88.998l5.302,5.302l-50.671,50.667l41.474,41.474l-5.455,5.452l44.901,44.901l-51.764,51.764l88.429,88.429C384.065,449.045,461.037,366.255,472.543,263.656z" fill="#2E4D72"/>
<path d="M195.682,148.937c0,7.27,0,39.741,0,39.741h-29.115v48.598h29.115v144.402h59.808V237.276h40.134c0,0,3.76-23.307,5.579-48.781c-5.224,0-45.485,0-45.485,0s0-28.276,0-33.231c0-4.962,6.518-11.641,12.965-11.641c6.436,0,20.015,0,32.587,0c0-6.623,0-29.481,0-50.592c-16.786,0-35.883,0-44.306,0C194.201,93.028,195.682,141.671,195.682,148.937z" fill="#FFFFFF"/>

</svg>
                          
                            <FacebookLogin
                                appId="1241106377971017"
                                onSuccess={onFacebookSuccess}
                                onFail={(error) => {
                                    setMessageFB({text: "Error Occurred", severity: "error"});
                                }}
                                render={({ onClick }) => (
                                    <button type="button" onClick={onClick} >
                                    Facebook
                                    </button>
                                )}
                                />

                        </Button>
                        
                    </div>
                </div>

              
            </form>
            
        </section>
    )
}
