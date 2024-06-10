import { Link } from "react-router-dom";

const MenuSite = () => {
    return(
        <ul className='flex-1 flex justify-center items-center list-none hidden md:flex'>
            {['Accueil', 'Presentation', 'evenements', 'annonces', 'mediatheque'].map((item)=>(
                <li className='mx-4 cursor-pointer flex flex-col items-center' key={`link-${item}`}> 
                    <div className="w-1.5 h-1.5 bg-transparent rounded-full mb-1.5" />
                    <Link 
                        className="text-dark-grey no-underline uppercase font-medium transition-all duration-300 ease-in-out hover:purple" 
                        to={`${item}`}
                    >
                        {item}
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export default MenuSite;