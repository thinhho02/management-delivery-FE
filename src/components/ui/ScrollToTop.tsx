'use client'
import { Button, IconButton } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { FaArrowUp } from 'react-icons/fa6'

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return (
        <IconButton
            onClick={scrollToTop}
            opacity={isVisible ? 100 : 0}
            transition={'all 0.3s ease-in-out'}
            rounded={'full'}
            position={'fixed'}
            bottom={'1.5rem'}
            right={'2rem'}
            size={'sm'}
        >

            <FaArrowUp width={'5'} height={'5'} />
        </IconButton>
    )
}

export default ScrollToTop
