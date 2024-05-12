import { Link, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper  from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { uploadImage } from "../common/aws";
import { useContext, useEffect, useRef } from "react";
import { Toaster, toast} from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs"
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";

const BlogEditor = () => {

    // let blogBannerRef = useRef();
    let {blog, blog: {title, banner, content, tags, des}, setBlog,textEditor, setTextEditor, setEditorState} = useContext(EditorContext)

    let { userAuth: {access_token}} = useContext(UserContext)

    let navigate = useNavigate

    useEffect(() => {
        if (!textEditor.isReady){

            setTextEditor(new EditorJS({
                holderId: "textEditor",
                data: content,
                tools: tools,
                placeholder: "Redaction du contenu textuel de la publication"
            }))
        }
    }, [])

    const handleBannerUpload = (e) => {
        // console.log(e)
        let img = e.target.files[0];

        // console.log(img)
        if(img){

            let loadingToast = toast.loading("Chargement...");

            uploadImage(img).then((url) => {
                if(url){

                    toast.dismiss(loadingToast);
                    toast.success("Mise à jour effectuée");
                    // blogBannerRef.current.src = url;

                    setBlog({...blog, banner:url})

                }
            })
            .catch(err => {
                toast.dismiss(loadingToast);
                return toast.error(err);
            })
        }
    };

    // function uuidv4() {
    //     return ([1e7] + -1e3 + -4e3 + -8e3 + - 1e11).replace(/[018]/g, (c) =>
    //         (
    //             c ^
    //             (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    //         ).toString(16)
    //     );
    // }

    // document.getElementById("uploadBanner").addEventListener("click", () => {
    //     let postid = uuidv4();
    //     let inputElem = document.getElementById("imgfile");
    //     let file=inputElem.files[0];

    //     let blob = file.slice(0, file.size, "image/jpeg", { type: "image/jpeg"});

    //     let formData = new FormData();
    //     formData.append("imgfile", newFile);

    //     fetch('/get-upload-url', {
    //         method: "POST",
    //         body: formData,
    //     }).then(res => res.text())
    //         .then((x) =>console.log(x))
    // })

    const handleTitleKeyDown = (e) => {
        // console.log(e);

        if(e.keyCode == 13){
            e.preventDefault();
        }
    }


    const handlTitlechange = (e) => {
        // console.log(e )

        let input = e.target

        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";

        setBlog({...blog, title: input.value})
    }

    const handleError = (e) =>{
        let img = e.target;

        img.src = defaultBanner;
    }

    const handlePublishEvent = () => {

        if(!banner.length){
            return toast.error("Charger le contenu avant la publication");
        }

        if(!title.length){
            return toast.error("Définir un titre à votre publication")
        }

        if(textEditor.isReady){
            textEditor.save().then(data=> {
                if(data.blocks.length){
                    setBlog({...blog, content: data});
                    setEditorState("publish")
                } else{
                    return toast.error("Rédiger le descriptif de la publication");
                }
            })
            .catch((err) =>{
                console.log(err);
            })
        }

    }

    const handleSaveDraft = (e) =>{

        if(e.target.className.includes("disable")){
            return;
        }

        if(!title.length){
            return toast.error("Vous devez définir le titre avant de sauvegarder le brouillon")
        }

        let loadingToast = toast.loading("Sauvergade du brouillon...");

        e.target.classList.add('disable');

        if(textEditor.isReady){
            textEditor.save().then(content=>{

                let blogObj = {
                    title, banner, des, content, tags, draft:true
                }
        
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, 
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                .then(() => {
                        e.target.classList.remove('disable');
        
                        toast.dismiss(loadingToast);
                        toast.success("Sauvegardé")
        
                        setTimeout(() =>{
                            navigate("/")
                        }, 500)
                }) 
                .catch(({ response }) => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
        
                    return toast.error(response.data.error)
                })

            })
        }        

        
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} alt="logo" />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {title.length ? title: "Nouvelle publication"}
                </p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2" 
                        onClick={handlePublishEvent}
                    >
                        Publier
                    </button>
                    <button className="btn-light py-2"
                        onClick={handleSaveDraft}
                    >
                        Brouillon
                    </button>
                </div>
            </nav>

            <Toaster />
            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">

                        <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-80">
                            <label htmlFor="uploadBanner">
                                <img
                                    // ref={blogBannerRef} 
                                    src={banner}
                                    onError={handleError}
                                    className="z-20"
                                    alt="" 
                                    id="imgfile"
                                />
                                <input 
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>

                        <textarea
                            defaultValue={title}
                            placeholder="Titre de la publication"
                            className="text-4xl font-medium w-full outline-none h-20 resize-none mt-10 leading-tight placeholder:opacity-40"
                            onKeyDown={handleTitleKeyDown} 
                            onChange={handlTitlechange}
                        >

                        </textarea>

                        <hr className="w-full opacity-10 my-5" />

                        <div id="textEditor" className="font-gelasio">

                        </div>

                    </div>
                </section>
            </AnimationWrapper>
        </>
    );
};

export default BlogEditor;