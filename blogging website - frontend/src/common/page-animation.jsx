import { AnimatePresence, motion } from "framer-motion";

const AnimationWrapper = ({children, initial, keyValue = { opacity : 1 }, animate = { opacity : 1}, transition = { duration : 10}, className}) => {
    return (
        <AnimatePresence>
            <motion.div
                key={keyValue}
                initial={initial}
                animate={animate}
                transition={transition}
                className={className}
            >
                { children }
            </motion.div>
        </AnimatePresence>
    )
};

export default AnimationWrapper;