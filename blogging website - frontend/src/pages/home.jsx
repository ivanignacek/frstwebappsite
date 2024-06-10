import MenuSite from "../components/menu.component";
import { Swiper, SwiperSlide } from "swiper/react";
import { StaticImage } from "gatsby-plugin-image";
import { Navigation } from "swiper";
import "swiper/css/navigation";
import "swiper/css";

import banner from "../imgs/banner.png";
import carousel1 from "../imgs/carousel1.png";
import carousel2 from "../imgs/carousel2.png";
import carousel3 from "../imgs/carousel3.png";
import carousel4 from "../imgs/carousel4.png";
import carousel5 from "../imgs/carousel5.png";
import carousel6 from "../imgs/carousel6.png";

const Home = () => {
    return (
        <div>
            <img src={banner} alt="" />

            <div>
                <Swiper 
                    spaceBetween={50} 
                    slidesPerView={1} 
                    Navigation
                    modules={[Navigation]}
                    >
                    <SwiperSlide>
                        <div className="image relative">
                            <StaticImage src={carousel1} alt="" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="">
                            <StaticImage src={carousel2} alt="" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="">
                            <StaticImage src={carousel3} alt="" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="">
                            <StaticImage src={carousel4} alt="" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="">
                            <StaticImage src={carousel5} alt="" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="">
                            <StaticImage src={carousel6} alt="" />
                        </div>
                    </SwiperSlide>
                    
                </Swiper>
            </div>

        </div>

    )
}

export default Home;