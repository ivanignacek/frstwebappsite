import { Link, Outlet, useNavigate } from "react-router-dom";

import logo from "../imgs/logo.png";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import MenuSite from "./menu.component";

const Navbar = () => {
    
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false)

    const [ userNavPanel, setUserNavPanel ] = useState(false);

    let navigate = useNavigate();

    const handleUserNavPanel = () => {
        setUserNavPanel(currentVal => !currentVal);
    }


    //Fonction de recherche à relancer plutard

    const handleSearch = (e) => {
        let query = e.target.value;
        console.log(e);

        if(e.keycode == 13 && query.length){
            navigate(`/search/${query}`);
        }
    }

    const handleBlur = () => {
        setTimeout(() =>{
            setUserNavPanel(false);
        }, 200);
    }

    const {userAuth, userAuth: {access_token, profile_img}} = useContext(UserContext);

    return (
        <>
            <nav className="navbar">

                <Link to="/" className="flex-non w-10">
                    <img src={logo}  className="w-full" alt="logo" />
                </Link>

                <div className={"absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " + (searchBoxVisibility ? "show" : "hide")}>
                    <input 
                        type="text"
                        placeholder="Recherche"
                        className="w-full md:w-auto bg-grey  p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
                        onKeyDown={handleSearch} 
                    />
                    <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey" />
                </div>

                <div className="flex items-center gap-3 md:gap-6 ml-auto">
                    <button className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
                        onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}>
                        <i className="fi fi-rr-search txt-xl" />
                    </button>
                </div>

                <Link to="/editor" className="hidden md:flex gap-2 link">
                    <i className="fi fi-rr-file-edit" />
                    <p>Rediger</p>
                </Link>

                {
                    access_token ?
                    <> 
                        <Link to="/dashboard/notification">
                            <button className="w-12 h-12 rounded-full bg-grey hover:bg-black/10">
                                <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                            </button> 
                        </Link>

                        <div className="relative"
                            onClick={handleUserNavPanel}
                            onBlur={handleBlur}
                        >
                            <button className="w-12 h-12 mt-1">
                                <img src={profile_img} className="w-full h-full object-cover rounded-full" alt="" />
                            </button>

                            {
                                userNavPanel ? <UserNavigationPanel />
                                :""
                            }

                        </div>
                    </>
                    :
                    <>
                        <Link className="btn-dark py-2" to="/signin">
                            Se connecter
                        </Link>

                        <Link className="btn-light py-2 hidden md:block" to="/signup">
                            S'enregistrer
                        </Link>
                    </>
                }

                
            </nav>

            <MenuSite />

            <Outlet />

        </>
        
    )
}

export default Navbar;