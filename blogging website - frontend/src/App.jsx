import { Routes, Route} from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";

import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import Home from "./pages/home";

export const UserContext = createContext({})

const App = () => {
    
    const [userAuth, setUserAuth] = useState({});

    useEffect(() =>{

        let userInSession = lookInSession("user");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({access_token: null})

    }, [])

    return (
        <UserContext.Provider value={{userAuth, setUserAuth}}>
            <Routes>
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/editor/:blog_id" element={<Editor />} />
                    <Route path="/" element={<Navbar />}>
                        <Route index element={<Home />}/>
                        <Route path="/evenements" element={<HomePage />} />
                        <Route path="/signin" element={<UserAuthForm type="Se connecter" />} />
                        <Route path="/signup" element={<UserAuthForm type="S'enregistrer" />} />
                        <Route path="blog/:blog_id" element={ <BlogPage />} />
                        <Route path="*" element={<PageNotFound />}/>
                        <Route path="/user/:id" element={<ProfilePage />} />
                    </Route>
            </Routes>
        </UserContext.Provider>
    )
}

export default App;