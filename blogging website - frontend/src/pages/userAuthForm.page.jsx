import { Link, Navigate } from "react-router-dom";

import InputBox from "../components/input.component";
import googleicon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
import { useContext, useRef } from "react";
import {Toaster, toast} from "react-hot-toast";
import axios  from "axios";
import { storeInSession } from "../common/session";
import {UserContext} from "../App";



const UserAuthForm = ({type}) => {

    const authForm = useRef();

    let {userAuth : { access_token}, setUserAuth } = useContext(UserContext);

    console.log(access_token);

    const userAuthThroughServer = (serverRoute, formData) => {

        console.log(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({ data }) => {
                storeInSession("user", JSON.stringify(data))
                
                setUserAuth(data)
        })
        .catch(({response}) =>{
            toast.error(response.data.error)
        })
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let serverRoute = type == "Se connecter" ? "/signin" : "/signup";

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        // formData
        // let form= new FormData(authForm.current);
        let form= new FormData(formElement);
        let formData = {}; 

        for(let [key, value] of form.entries()){
            formData[key] = value;
        }

        let {fullname, email, password} = formData;
        
        // form validation


        if(fullname){
            if(fullname.length < 3) {
                return toast.error( "Le nom doit contenir au moins de 03 caractères")
            }
        }
        if(!email.length){
            return toast.error( "Entrez votre adresse Email SVP")
        }
        if(!emailRegex.test(email)){
            return toast.error( "Votre adresse Email est invalide")
        }
        if(!passwordRegex.test(password)){
            return toast.error( "Le mot de passe doit être compris entre 6 et 20 caractères de long, avec des caractères alphanumériques, 01 minuscule et une majuscule")
        }

        userAuthThroughServer(serverRoute, formData)
    };

    return (
        access_token ?
        <Navigate to="/" />
        :
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex item-center justify-center">
                <Toaster />
                <form id="formElement" action="" className="w-[80%] max-w-[400px]">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                        {type == "Se connecter" ? "Bienvenue" : " Rejoignez-nous maintenant"}
                    </h1>

                    {
                        type != "Se connecter" ?
                        <InputBox 
                            name="fullname"
                            type="text"
                            placeholder="Nom"
                            icon="fi-rr-user"
                        />
                        : ""
                    }

                    <InputBox 
                        name="email"
                        type="email"
                        placeholder="Email"
                        icon="fi-rr-envelope"
                    />

                    <InputBox 
                        name="password"
                        type="password"
                        placeholder="Mot de passe"
                        icon="fi-rr-key"
                    />

                    <button
                        className="btn-dark center mt-14"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        { type }
                    </button>

                    <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                        <hr className="w-1/2 border-black"/>
                        <p>OU</p>
                        <hr className="w-1/2 border-black"/>
                    </div>

                    <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
                        <img src={googleicon} alt="google login" className="w-5" />
                        Continuer avec Google
                    </button>

                    {

                        type == "Se connecter" ?
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Vous n'avez pas encore de compte ?
                            <Link to="/signup" className="underline text-black text-xl ml-1">
                                Rejoignez-nous
                            </Link>
                        </p>
                        :
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Vous avez déjà un compte ?
                            <Link to="/signin" className="underline text-black text-xl ml-1">
                                Connectez-vous ici
                            </Link>
                        </p>
                    }
                </form>

            </section>
        </AnimationWrapper>
    )
}

export default UserAuthForm;