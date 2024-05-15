import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import InPageNavigation from "../components/inpage-navigation.component";
import PageNotFound from "./404.page";

import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";


export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        bio: "",
    },
    account_info: {
        total_posts: 0,
        total_reads: 0
    },
    joinedAt: ""
}

const ProfilePage = () => {
    
    let { id:profileId } = useParams(); // destructuration des parametres et recuperation de l'ID
    
    let [ profile, setProfile ] = useState(profileDataStructure);
    let [ loading, setLoading ] = useState(true);
    let [ blogs, setBlogs] = useState(null);

    let { personal_info: { fullname, username: profile_username, profile_img, bio}, account_info: {total_posts, total_reads}, joinedAt } = profile;

    let { userAuth: {username} } = useContext(UserContext)

    const fetchUserProfile = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", { username: profileId })
        .then(({ data: user }) => {
            if ( user != null ){
                setProfile(user);
            }
            getBlogs({ user_id: user._id })
            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        })
    }

    const getBlogs = ({ page = 1, user_id }) => {

        user_id = user_id == undefined ? blogs.user_id : user_id;

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { author: user_id, page })
        .then( async ({ data }) => {

            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs, page,
                countRoute: "/search-blogs-count",
                data_to_send: { author: user_id }
            })

            formatedData.user_id = user_id;
            // console.log
            setBlogs(formatedData);
        })

    }

    // Amelioration en lisibilite avec async/await-CGPT

    // const fetchUserProfile = async () => {
    //     try {
    //         const { data: user } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", { username: profileId });
    //         console.log(user);
    //         setProfile(user);
    //     } catch (err) {
    //         console.log(err);
    //         // Gérer l'erreur ici
    //     }
    // }

    useEffect(() => {

        fetchUserProfile();

    }, [])

    return (
        <>
            {
                loading ? <Loader /> :
                profile_username.length ?
                    <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                        <div className="flex flex-col max-md:items-center gap-5 min-w-[250px]">

                            <img src={profile_img} className="w-48 h-48 bg-grey rounded-full md:h-32" />

                            <h1 className="text-2xl font-medium">@{profile_username}</h1>
                            <p className="text-xl capitalize h-6">{fullname}</p>
                            <p>{total_posts.toLocaleString()} Publication(s) - {total_reads.toLocaleString()} Vue(s)</p>

                            <div className="flex gap-4 mt-2">
                                {
                                    profileId == username ? 
                                    <Link to="/settings/edit-profile" className="btn-light rounded-md">Modifier les informations</Link>
                                    : " "
                                }
                            </div>

                            {/* <AboutUser />  No really need the about component, in case just refer to the Step by step video*/}
                        </div>

                        <div className="max-md:mt-12 w-full">
                        
                            <InPageNavigation routes={[ "Publications", "A propos"]} defaultHidden={["A propos"]}>
                                
                                <>
                                    {
                                        blogs == null ? <Loader /> :
                                            blogs.results.length ? 
                                                blogs.results.map((blog, i) =>{
                                                    return <AnimationWrapper transition={{duration: 1, delay: i*.1}} key={i}>
                                                        <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                    </AnimationWrapper>
                                                })
                                            : <NoDataMessage message="Aucune publication publiée"/>                    
                                    }
                                    <LoadMoreDataBtn state={blogs} fetchDatafun={getBlogs} />
                                </>
                                
                            </InPageNavigation>

                        </div>
                    </section>
                : <PageNotFound />
            }
        </>
    )
}

export default ProfilePage;