import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import AnimationWrapper from "../common/page-animation";
import BlogContent from "../components/blog-content.component";

export const blogStructure = {
    title: '',
    des: '',
    content: [],
    // tags: [],
    author: { personal_info: { } },
    banner: '',
    publishedAt: '',
}

export const BlogContext = createContext({ });

const BlogPage = () => {

    let { blog_id } = useParams();

    const [ blog, setBlog ] = useState(blogStructure);
    const [ similarBlogs, setSimilarBlogs ] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ islikedByUser, setLikedByUser] = useState(false);

    let { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img}}, publishedAt } = blog;

    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {blog_id})
        .then(({ data: { blog }}) => {
            
            setBlog(blog);
            console.log(blog.content);

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id })// eliminate_blog not work so i comment inside de server destructuring function
            .then(({ data }) => {
                setSimilarBlogs(data.blogs);
            })
            
            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        })
    }

    useEffect(() =>{

        resetStates();

        fetchBlog();

    }, [blog_id])

    const resetStates = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
    }

    return (
        <>
            {
                loading ? <Loader />
                :
                <BlogContext.Provider value={{ blog, setBlog, islikedByUser, setLikedByUser }}>
                    <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">

                        <div className="mt-12">
                            <h2>{title}</h2>

                            <div className="flex max-sm:flex-col justify-between my-8">
                                <div className="flex gap-5 items-start">
                                    <img src={profile_img}  className="w-12 h-12 rounded-full" alt="" />
                                
                                    <p className="capitalize">
                                        {fullname}
                                        <br />@
                                        <Link className="underline" to={`/user/${author_username}`}>{author_username}</Link>
                                    </p>

                                    <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Publiéé le {getDay(publishedAt)}</p>
                                
                                </div>
                            </div>
                        </div>
                        
                        <BlogInteraction />

                        <img src={banner} className="aspect-video" alt="" />

                        <div className="my-12 font-gelasio blog-page-content">
                            {
                                content[0].blocks.map((block, i) => {
                                    return <div className="my-4 md:my-4">
                                        <BlogContent block={block} />
                                    </div>
                                })
                            }
                        </div>



                        <BlogInteraction />

                        {
                            similarBlogs != null && similarBlogs.length ?
                                <>
                                    <h1 className="text-2xl mt-14 mb-10 font-medium">
                                        Autre(s) Publication(s)
                                    </h1>

                                    {
                                        similarBlogs.map((blog, i) => {

                                            let { author: { personal_info }} = blog;

                                            return <AnimationWrapper key={i} transition={{ duration: 1, delay: i*0.08}} >
                                                <BlogPostCard content={blog} author={personal_info} />
                                            
                                            </AnimationWrapper>

                                        }) 
                                    }
                                </>
                            : ""
                        }

                    </div>
                </BlogContext.Provider>
                
            }
        </>
        
    )
}

export default BlogPage;