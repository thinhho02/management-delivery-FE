import React from 'react'
import { Link as ChakraLink, type LinkProps as ChakraLinkProps } from '@chakra-ui/react'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'

type Href = NextLinkProps["href"];

type LinkCustomProps =
    Omit<ChakraLinkProps, "href"> &
    Omit<NextLinkProps, "href" | "children"> & {
        href: Href;
        children: React.ReactNode;
    };

const LinkCustom = React.forwardRef<HTMLAnchorElement, LinkCustomProps>(({ href, children, prefetch, replace, scroll, shallow, locale, target, onNavigate, ...chakraProps }, ref) => {
    return (
        <ChakraLink {...chakraProps} outline={'none'} textDecoration={'none'} ref={ref} asChild>
            <NextLink
                href={href}
                prefetch={prefetch}
                replace={replace}
                scroll={scroll}
                shallow={shallow}
                locale={locale}
                onNavigate={onNavigate}
                target={target}
            >
                {children}
            </NextLink>
        </ChakraLink>
    )
})

export default LinkCustom