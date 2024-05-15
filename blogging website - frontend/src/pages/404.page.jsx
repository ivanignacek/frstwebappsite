import { Link } from "react-router-dom";

import pageNotFoundImage from "../imgs/404.png";
import fullLogo from "../imgs/logo.png";

const PageNotFound = () => {
    return (
        <section className="h-over relative p-10 flex flex-col items-center gap-20 text-center">

            <img src={pageNotFoundImage} alt="" className="select-none border-2 border-grey w-72 aspect-square" />

            <h1 className="text=4xl font-gelasio leading-7">Page introuvable</h1>

            <p className="text-dark-grey text-xl leading-7 -mt-8">Cette page recherhée est introuvable. Retourner à la <Link to="/" className="text-black underline">page d'accueil</Link></p>

            <div className="mt-auto">
                <img src={fullLogo} className="h-8 object-contain block mx-auto select-none" alt="" />
                <p className="text-dark mt-auto">Parcourez la Fondation Révélation Sainte Thérèse en un clic</p>
            </div>

        </section>
    );
}

export default PageNotFound;