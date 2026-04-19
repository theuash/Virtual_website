import { motion } from 'framer-motion';

const variants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.99
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      className="w-full h-full min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
